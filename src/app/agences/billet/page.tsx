"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card, Typography, Divider, Space, List, Button, Tag, message } from "antd";
import { useRouter } from "next/navigation";
import { CONVOCATION_MINUTES_BEFORE } from "@/config/business";

const { Title, Text } = Typography;

type TicketData = {
  reservationId: number | string;
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
  totals?: { subtotal: number; total: number };
};

export default function BilletPage() {
  const router = useRouter();
  const [data, setData] = useState<TicketData | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [apiMsg, contextHolder] = message.useMessage();
  const ticketRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = sessionStorage.getItem("ticketData");
    if (!raw) {
      router.replace("/recherche");
      return;
    }
    try {
      setData(JSON.parse(raw));
    } catch {
      router.replace("/recherche");
    }
  }, [router]);

  const primaryName = useMemo(() => {
    if (!data) return "";
    const base = (data.adultNames?.[0] || "").trim().split(/\s+/)[0] || "";
    if (data.reservationType === "Famille") return `Famille ${base}`.trim();
    if (data.reservationType === "Couple") return `Couple ${base}`.trim();
    return base ? `Mr ${base}` : data.client;
  }, [data]);

  if (!data) return null;

  const handleDownloadPdf = async () => {
    if (!ticketRef.current) return;
    try {
      setDownloading(true);
      const [{ default: html2canvas }, jspdfModule] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      const { jsPDF } = jspdfModule as any;
      const canvas = await html2canvas(ticketRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        windowWidth: ticketRef.current.scrollWidth,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "pt", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
      const imgWidth = canvas.width * ratio;
      const imgHeight = canvas.height * ratio;
      const x = (pageWidth - imgWidth) / 2;
      const y = 20;
      pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);
      const fileName = `billet_${data?.reservationId || "reservation"}.pdf`;
      pdf.save(fileName);
    } catch (e: any) {
      apiMsg.error("Génération PDF indisponible. Utilisez le bouton Imprimer.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      {contextHolder}
      <Card className="print:shadow-none" ref={ticketRef}>
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <div className="flex items-center justify-between">
            <Title level={3} className="m-0">Billet de Réservation</Title>
            <Tag color="blue">N° {data.reservationId}</Tag>
          </div>
          <Text type="secondary">Présentez ce billet à l'agence. Convocation: {CONVOCATION_MINUTES_BEFORE} min avant départ.</Text>

          <Divider className="my-2" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Text strong>Agence</Text>
              <div>{data.trajet.agenceName}</div>
            </div>
            <div>
              <Text strong>Type de réservation</Text>
              <div>{data.reservationType} — Nom principal: <b>{primaryName}</b></div>
            </div>
            <div>
              <Text strong>Trajet</Text>
              <div>{data.trajet.depart} → {data.trajet.arrivee}</div>
              {data.trajet.heure ? <div>Heure: {data.trajet.heure}</div> : null}
            </div>
            <div>
              <Text strong>Contact</Text>
              <div>{data.client} — {data.telephone}</div>
            </div>
          </div>

          <Divider className="my-2" />

          <div>
            <Text strong>Voyageurs adultes ({data.adultCount})</Text>
            <List
              size="small"
              dataSource={data.adultNames.slice(0, data.adultCount)}
              renderItem={(name, idx) => <List.Item>Adulte {idx + 1}: {name || "—"}</List.Item>}
            />
            {data.childrenCount > 0 && <div>Enfants: {data.childrenCount}</div>}
          </div>

          <Divider className="my-2" />

          <div className="flex items-center justify-between gap-2">
            <Button onClick={() => router.push(`/recherche/confirmation?id=${data.reservationId}`)}>Retour</Button>
            <Space>
              <Button onClick={() => window.print()}>Imprimer</Button>
              <Button type="primary" onClick={handleDownloadPdf} loading={downloading}>Télécharger le billet (PDF)</Button>
            </Space>
          </div>
        </Space>
      </Card>
    </div>
  );
}
