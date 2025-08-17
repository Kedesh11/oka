"use client";
import React, { Suspense, useEffect, useMemo, useState } from "react";
import NavBar from "@/components/navBar";
import { useRouter, useSearchParams } from "next/navigation";
import CardAgence from "@/components/card-agences/cardAgence";
import { Modal, Form, Input, InputNumber, Switch, Upload, Button, Typography, message } from "antd";
import { useUploadPreview } from "@/utils/uploadPreview";

const { Text } = Typography;

function AgenceList() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [reserveOpen, setReserveOpen] = useState(false);
  const [reserveSubmitting, setReserveSubmitting] = useState(false);
  const [reserveForm] = Form.useForm();
  const { fileList, setFileList, handlePreview, customRequest, previewModal, getUrls } = useUploadPreview([]);
  const [apiMsg, contextHolder] = message.useMessage();
  const [preFill, setPreFill] = useState<{ depart: string; arrivee: string; trajetId: number; agenceName: string } | null>(null);
  const [results, setResults] = useState<{
    depart: string;
    arrivee: string;
    count: number;
    agencies: Array<{
      id: number;
      name: string;
      phone: string | null;
      address: string | null;
      trajets: Array<{ id: number; depart: string; arrivee: string; heure: string; prixAdulte: number; prixEnfant: number }>;
    }>;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const depart = searchParams.get("depart") || "";
  const arrivee = searchParams.get("arrivee") || "";
  const date = searchParams.get("date") || "";
  const voyageurs = searchParams.get("voyageurs");

  useEffect(() => {
    const fetchAgencies = async () => {
      if (!depart || !arrivee) {
        console.log("Missing depart or arrivee:", { depart, arrivee });
        return;
      }
      try {
        setLoading(true);
        console.log("Fetching agencies for:", { depart, arrivee });
        const params = new URLSearchParams({ depart, arrivee });
        const res = await fetch(`/api/agencies/by-route?${params.toString()}`, { cache: "no-store" });
        if (!res.ok) {
          throw new Error(`API error: ${res.status} ${res.statusText}`);
        }
        const json = await res.json();
        console.log("API response:", json);
        setResults(json);
      } catch (error) {
        console.error("fetchAgencies error:", error);
        apiMsg.error("Erreur lors du chargement des agences");
      } finally {
        setLoading(false);
      }
    };
    fetchAgencies();
  }, [depart, arrivee]);

  const openReserve = (agenceName: string, trajet: { id: number; depart: string; arrivee: string }) => {
    setPreFill({ depart: trajet.depart, arrivee: trajet.arrivee, trajetId: trajet.id, agenceName });
    setFileList([]);
    setReserveOpen(true);
    Promise.resolve().then(() => {
      reserveForm.resetFields();
      reserveForm.setFieldsValue({
        depart: trajet.depart,
        arrivee: trajet.arrivee,
        nbVoyageurs: voyageurs ? Number(voyageurs) || 1 : 1,
        childrenCount: 0,
        hasBaggage: false,
        baggageCount: 0,
      });
    });
  };

  // Upload handled by useUploadPreview

  const submitReservation = async () => {
    try {
      const values = await reserveForm.validateFields();
      if (!preFill) return;
      setReserveSubmitting(true);
      const payload = {
        trajetId: preFill.trajetId,
        client: values.client,
        telephone: values.telephone,
        nbVoyageurs: values.nbVoyageurs,
        childrenCount: values.childrenCount || 0,
        hasBaggage: !!values.hasBaggage,
        baggageCount: values.baggageCount || 0,
        identityFiles: getUrls(),
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
      setReserveOpen(false);
      reserveForm.resetFields();
      setFileList([]);
      setPreFill(null);
      if (created?.id) {
        router.push(`/recherche/confirmation?id=${created.id}`);
      }
    } catch (e: any) {
      apiMsg.error(e?.message || "Erreur inconnue");
    } finally {
      setReserveSubmitting(false);
    }
  };

  const agences = useMemo(() => {
    if (!results) return [] as Array<any>;
    return results.agencies.map((a) => ({
      img: "/images/carfor.jpeg",
      nomAgence: a.name,
      typeAgence: a.address || "Agence",
      tarifAdulte: a.trajets?.[0]?.prixAdulte ? `${a.trajets[0].prixAdulte} FCFA` : "",
      tarifEnfant: a.trajets?.[0]?.prixEnfant ? `${a.trajets[0].prixEnfant} FCFA` : "",
      fraisService: "",
      convocation: "",
      depart,
      arrivee,
      _raw: a,
    }));
  }, [results, depart, arrivee]);

  const firstRow = agences.slice(0, 2);
  const secondRow = agences.slice(2);

  return (
    <div className="flex flex-col gap-8 pt-16">
      {contextHolder}
      
      {loading && (
        <div className="text-center py-8">
          <p>Chargement des agences...</p>
        </div>
      )}
      
      {!loading && results && results.count === 0 && (
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold mb-4">Aucune agence trouvée</h2>
          <p className="text-gray-600">
            Aucune agence ne dessert actuellement le trajet <strong>{depart}</strong> → <strong>{arrivee}</strong>.
          </p>
          <p className="text-gray-500 mt-2">
            Essayez avec d'autres destinations ou contactez-nous pour plus d'informations.
          </p>
        </div>
      )}
      
      {!loading && agences.length > 0 && (
        <>
          <div className="flex flex-wrap justify-center gap-5">
            {firstRow.map((agence: any, index: number) => (
              <CardAgence
                key={index}
                {...agence}
                onValidate={() => {
                  const first = agence._raw?.trajets?.[0];
                  if (first) openReserve(agence.nomAgence, first);
                  else apiMsg.warning("Aucun trajet disponible pour cette agence");
                }}
              />
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-5">
            {secondRow.map((agence: any, index: number) => (
              <CardAgence
                key={index + 2}
                {...agence}
                onValidate={() => {
                  const first = agence._raw?.trajets?.[0];
                  if (first) openReserve(agence.nomAgence, first);
                  else apiMsg.warning("Aucun trajet disponible pour cette agence");
                }}
              />
            ))}
          </div>
        </>
      )}

      <Modal
        title="Réserver ce trajet"
        open={reserveOpen}
        onCancel={() => setReserveOpen(false)}
        okText="Confirmer la réservation"
        onOk={submitReservation}
        confirmLoading={reserveSubmitting}
        destroyOnHidden
        maskClosable={false}
        zIndex={2000}
      >
        <Form form={reserveForm} layout="vertical">
          <Form.Item label="Agence">
            <Input value={preFill?.agenceName} readOnly />
          </Form.Item>
          <Form.Item label="Départ">
            <Input value={preFill?.depart} readOnly />
          </Form.Item>
          <Form.Item label="Arrivée">
            <Input value={preFill?.arrivee} readOnly />
          </Form.Item>
          <Form.Item name="client" label="Nom du client" rules={[{ required: true, message: "Nom requis" }]}>
            <Input placeholder="Votre nom complet" />
          </Form.Item>
          <Form.Item name="telephone" label="Téléphone" rules={[{ required: true, message: "Téléphone requis" }]}>
            <Input placeholder="Numéro de téléphone" />
          </Form.Item>
          <Form.Item name="nbVoyageurs" label="Nombre d'adultes" rules={[{ required: true }]} initialValue={voyageurs ? Number(voyageurs) || 1 : 1}>
            <InputNumber min={1} max={100} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="childrenCount" label="Nombre d'enfants" initialValue={0}>
            <InputNumber min={0} max={100} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="hasBaggage" label="Bagages ?" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item shouldUpdate noStyle>
            {() =>
              reserveForm.getFieldValue("hasBaggage") ? (
                <Form.Item name="baggageCount" label="Nombre de bagages" initialValue={0}>
                  <InputNumber min={0} max={50} style={{ width: "100%" }} />
                </Form.Item>
              ) : null
            }
          </Form.Item>
          <Form.Item label="Pièces d'identité (adultes)">
            <Upload
              listType="picture-card"
              multiple
              accept="image/*,application/pdf"
              customRequest={customRequest as any}
              fileList={fileList}
              onPreview={handlePreview}
              onChange={({ fileList }) => setFileList(fileList)}
              showUploadList={{ showPreviewIcon: true, showRemoveIcon: true }}
            >
              <div>Uploader</div>
            </Upload>
            {previewModal}
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default function PageAgence() {
  return (
    <>
      <NavBar />
      <Suspense fallback={<div className="pt-16 text-center">Chargement des agences…</div>}>
        <AgenceList />
      </Suspense>
    </>
  );
}
