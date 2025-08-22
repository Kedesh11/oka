"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card, Typography, Space, Button, Divider, List, Tag, message, Select, Input, Radio } from "antd";
import { useRouter } from "next/navigation";
import { SERVICE_FEE_FCFA, CONVOCATION_MINUTES_BEFORE } from "@/config/business";
import { normalizeGabonMsisdn } from "@/lib/phone";

const { Title, Text } = Typography;

type CheckoutData = {
  trajet: {
    depart: string;
    arrivee: string;
    heure?: string;
    prixAdulte?: number;
    prixEnfant?: number;
    trajetId: number;
    agenceName: string;
  };
  client: string;
  telephone: string;
  reservationType: "Individuel" | "Famille" | "Couple";
  adultCount: number;
  childrenCount: number;
  adultNames: string[];
  hasBaggage: boolean;
  baggageCount: number;
  documents: { adultIdUrl?: string; otherDocumentUrl?: string };
};

export default function CheckoutPage() {
  const router = useRouter();
  const [data, setData] = useState<CheckoutData | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiMsg, contextHolder] = message.useMessage();
  const pollTimer = useRef<NodeJS.Timeout | null>(null);
  const pollDelayRef = useRef<number>(2000);
  const pollStartAtRef = useRef<number>(0);

  const [paymentMethod, setPaymentMethod] = useState<"ussd" | "external">("ussd");
  const [operator, setOperator] = useState<"airtel" | "moov" | "maviance">("airtel");
  const [msisdn, setMsisdn] = useState("");
  const [mavianceServiceNumber, setMavianceServiceNumber] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = sessionStorage.getItem("checkoutData");
    if (!raw) {
      router.replace("/recherche");
      return;
    }
    try {
      const parsed = JSON.parse(raw) as CheckoutData;
      setData(parsed);
    } catch {
      router.replace("/recherche");
    }
  }, [router]);

  const totals = useMemo(() => {
    if (!data) return { subtotal: 0, total: 0 };
    const pa = data.trajet.prixAdulte ?? 0;
    const pe = data.trajet.prixEnfant ?? 0;
    const subtotal = (data.adultCount * pa) + (data.childrenCount * pe);
    const total = subtotal + SERVICE_FEE_FCFA; // frais unique
    return { subtotal, total };
  }, [data]);

  const primaryName = useMemo(() => {
    if (!data) return "";
    const base = (data.adultNames?.[0] || "").trim().split(/\s+/)[0] || "";
    if (data.reservationType === "Famille") return `Famille ${base}`.trim();
    if (data.reservationType === "Couple") return `Couple ${base}`.trim();
    // Individuel -> Mr/Mme [Nom]; ne connaissant pas le genre, on laisse Mr par défaut
    return base ? `Mr ${base}` : data.client;
  }, [data]);

  const stopPolling = () => {
    if (pollTimer.current) {
      clearInterval(pollTimer.current);
      pollTimer.current = null;
    }
    pollDelayRef.current = 2000;
    pollStartAtRef.current = 0;
  };

  useEffect(() => () => stopPolling(), []);

  // Normalisation partagée via '@/lib/phone'

  const startPolling = (reservationId: number) => {
    stopPolling();
    const MAX_TIMEOUT_MS = 3 * 60 * 1000; // 3 minutes
    const MAX_DELAY_MS = 15000; // 15s
    const MULTIPLIER = 1.6;
    pollStartAtRef.current = Date.now();

    const tick = async () => {
      try {
        const elapsed = Date.now() - pollStartAtRef.current;
        if (elapsed > MAX_TIMEOUT_MS) {
          stopPolling();
          apiMsg.warning("Temps dépassé. Le paiement peut encore aboutir, vérifiez plus tard.");
          return;
        }
        const qs = new URLSearchParams({ reservationId: String(reservationId) });
        const r = await fetch(`/api/payments/status?${qs.toString()}`, { method: "GET" });
        if (r.ok) {
          const res = await r.json();
          if (res?.paymentStatus === "success") {
            stopPolling();
            apiMsg.success("Paiement réussi. Redirection...");
            router.push(`/recherche/confirmation?id=${reservationId}`);
            return;
          }
          if (res?.paymentStatus === "failed") {
            stopPolling();
            apiMsg.error("Échec du paiement. Veuillez réessayer.");
            return;
          }
        }
      } catch {}

      // schedule next with backoff
      pollDelayRef.current = Math.min(Math.round(pollDelayRef.current * MULTIPLIER), MAX_DELAY_MS);
      pollTimer.current = setTimeout(tick, pollDelayRef.current) as unknown as NodeJS.Timeout;
    };

    // first poll quickly
    pollDelayRef.current = 2000;
    pollTimer.current = setTimeout(tick, pollDelayRef.current) as unknown as NodeJS.Timeout;
  };

  const handlePay = async () => {
    if (!data) return;
    try {
      setLoading(true);
      // 1) Création de la réservation
      const payload = {
        trajetId: data.trajet.trajetId,
        client: data.client,
        telephone: data.telephone,
        nbVoyageurs: data.adultCount + data.childrenCount,
        childrenCount: data.childrenCount,
        baggage: data.hasBaggage ? data.baggageCount : 0,
        adultIdUrl: data.documents.adultIdUrl,
        otherDocumentUrl: data.documents.otherDocumentUrl,
      };
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Erreur lors de la réservation");
      }
      const created = await res.json();

      // Enregistre les infos utiles pour la confirmation
      if (typeof window !== "undefined") {
        const ticketData = {
          reservationId: created.id,
          trajet: data.trajet,
          client: data.client,
          telephone: data.telephone,
          reservationType: data.reservationType,
          adultCount: data.adultCount,
          childrenCount: data.childrenCount,
          adultNames: data.adultNames,
          hasBaggage: data.hasBaggage,
          baggageCount: data.baggageCount,
          totals,
        };
        sessionStorage.setItem("ticketData", JSON.stringify(ticketData));
        sessionStorage.removeItem("checkoutData");
      }

      // 2) Paiement selon la méthode choisie
      if (paymentMethod === "external") {
        const r = await fetch("/api/payments/ext-link", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ reservationId: created.id }),
        });
        if (!r.ok) {
          const err = await r.json().catch(() => ({}));
          throw new Error(err?.error || "Erreur génération lien de paiement");
        }
        const { link } = await r.json();
        if (!link) throw new Error("Lien de paiement indisponible");
        window.location.href = link; // redirection vers la page de paiement SingPay
        return; // on sort, plus de suite locale
      } else {
        // USSD push: nécessite opérateur + msisdn
        const msisdnNorm = normalizeGabonMsisdn(msisdn);
        if (!msisdnNorm) {
          throw new Error("Numéro gabonais invalide. Formats acceptés: 05/06/07xxxxxxx, +241xxxxxxxx ou 00241xxxxxxxx");
        }
        const r = await fetch("/api/payments/initiate", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ reservationId: created.id, msisdn: msisdnNorm, operator, mavianceServiceNumber: operator === 'maviance' ? mavianceServiceNumber || undefined : undefined }),
        });
        if (!r.ok) {
          const err = await r.json().catch(() => ({}));
          throw new Error(err?.error || "Erreur d'initiation du paiement");
        }
        apiMsg.info("Demande de paiement envoyée. Veuillez valider sur votre téléphone.");
        startPolling(created.id);
      }
    } catch (e: any) {
      apiMsg.error(e?.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  if (!data) return null;

  return (
    <div className="max-w-3xl mx-auto p-6">
      {contextHolder}
      <Card>
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <Title level={3}>Checkout</Title>
          <Text type="secondary">Vérifiez vos informations avant paiement.</Text>
          <Divider />

          {paymentMethod === "ussd" && (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <Text strong>Opérateur</Text>
                <Select
                  className="w-full mt-1"
                  value={operator}
                  onChange={(v) => setOperator(v)}
                  options={[
                    { label: "Airtel Money", value: "airtel" },
                    { label: "Moov Money", value: "moov" },
                    { label: "Maviance", value: "maviance" },
                  ]}
                />
              </div>
              <div>
                <Text strong>Téléphone (MSISDN)</Text>
                <Input
                  className="mt-1"
                  addonBefore="+241"
                  placeholder="Ex: 06 23 45 67 ou 6 23 45 67"
                  value={msisdn}
                  onChange={(e) => setMsisdn(e.target.value)}
                  maxLength={20}
                  inputMode="tel"
                />
              </div>
              {operator === 'maviance' && (
                <div className="md:col-span-2">
                  <Text strong>Numéro de service Maviance (optionnel)</Text>
                  <Input
                    className="mt-1"
                    placeholder="Ex: service-id fourni par Maviance"
                    value={mavianceServiceNumber}
                    onChange={(e) => setMavianceServiceNumber(e.target.value)}
                    maxLength={64}
                  />
                </div>
              )}
            </div>
          )}
          <div>
            <Text strong>Agence</Text>
            <div>{data.trajet.agenceName}</div>
          </div>
          <div>
            <Text strong>Trajet</Text>
            <div>
              {data.trajet.depart} → {data.trajet.arrivee} {data.trajet.heure ? `· ${data.trajet.heure}` : ""}
            </div>
            <div>
              <Tag>Convocation: {CONVOCATION_MINUTES_BEFORE} min avant l'heure de départ</Tag>
            </div>
          </div>

          <div>
            <Text strong>Type de réservation</Text>
            <div>{data.reservationType} — Nom sur billet: <b>{primaryName}</b></div>
          </div>

          <div>
            <Text strong>Contact</Text>
            <div>{data.client} — {data.telephone}</div>
          </div>

          <div>
            <Text strong>Voyageurs</Text>
            <List
              size="small"
              dataSource={data.adultNames.slice(0, data.adultCount)}
              renderItem={(name, idx) => (
                <List.Item>Adulte {idx + 1}: {name || "—"}</List.Item>
              )}
            />
            {data.childrenCount > 0 && <div>Enfants: {data.childrenCount}</div>}
          </div>

          <Divider />

          <div>
            <div className="flex justify-between"><Text>Sous-total</Text><Text>{totals.subtotal.toLocaleString()} FCFA</Text></div>
            <div className="flex justify-between"><Text>Frais de service</Text><Text>{SERVICE_FEE_FCFA.toLocaleString()} FCFA</Text></div>
            <div className="flex justify-between font-semibold mt-1"><Text strong>Total</Text><Text strong>{totals.total.toLocaleString()} FCFA</Text></div>
            {data.hasBaggage ? (
              <div className="mt-2 p-2 rounded border border-amber-300 bg-amber-50">
                <div className="flex justify-between"><Text>Bagages</Text><Text>{data.baggageCount}</Text></div>
                <Text type="warning">Des frais supplémentaires pour les bagages pourront être réglés en espèces au comptoir.</Text>
              </div>
            ) : null}
          </div>

          <Space>
            <Button onClick={() => router.back()}>Modifier</Button>
            <Button type="primary" onClick={handlePay} loading={loading}>Payer</Button>
          </Space>
        </Space>
      </Card>
    </div>
  );
}
