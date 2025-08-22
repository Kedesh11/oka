"use client";

import React, { useMemo, useState, useEffect } from "react";
import Tesseract from 'tesseract.js';
import { Select, Form, Button, Typography, Tag, Space, Empty, Modal, Input, InputNumber, Switch, Upload, message } from "antd";
import { GABON_CITIES } from "@/data/gabonCities";
import { useRouter, useSearchParams } from "next/navigation";
import { useUploadPreview } from "@/utils/uploadPreview";
import { SERVICE_FEE_FCFA, CONVOCATION_MINUTES_BEFORE } from "@/config/business";
import RecapReservationModal from "@/components/agence/RecapReservationModal";
import AgenceCard from "@/components/agence/AgenceCard";
import CardSkeleton from "@/components/agence/CardSkeleton";

const { Title, Text } = Typography;

export default function RechercheAgencesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true); // Start with loading true
  const [isClient, setIsClient] = useState(false);
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

  const [reserveOpen, setReserveOpen] = useState(false);
  const [recapOpen, setRecapOpen] = useState(false);
  const [reserveSubmitting, setReserveSubmitting] = useState(false);
  const [reserveForm] = Form.useForm();
  const { fileList, setFileList, handlePreview, customRequest, previewModal, getUrls } = useUploadPreview([]);
  const [adultCount, setAdultCount] = useState<number>(1);
  const [childCount, setChildCount] = useState<number>(0);
  const [adultNames, setAdultNames] = useState<string[]>([""]);
  const [reservationType, setReservationType] = useState<"Individuel" | "Famille" | "Couple">("Individuel");
  const [apiMsg, contextHolder] = message.useMessage();
  const [totalVoyageursRequis, setTotalVoyageursRequis] = useState<number | null>(null);
  const [preFill, setPreFill] = useState<{
    depart: string;
    arrivee: string;
    heure?: string;
    prixAdulte?: number;
    prixEnfant?: number;
    trajetId: number;
    agenceName: string;
  } | null>(null);

  const cityOptions = useMemo(
    () =>
      GABON_CITIES.map((c: string) => ({
        label: c,
        value: c,
      })),
    []
  );


  useEffect(() => {
    setIsClient(true);

    const depart = searchParams.get('depart');
    const arrivee = searchParams.get('arrivee');
    const nbVoyageurs = searchParams.get('nbVoyageurs');

    const fetchResults = async (d: string, a: string) => {
      try {
        const params = new URLSearchParams({ depart: d, arrivee: a });
        const res = await fetch(`/api/agencies/by-route?${params.toString()}`, { cache: 'no-store' });
        const json = await res.json();
        setResults(json);
      } catch (e) {
        console.error(e);
        apiMsg.error("Erreur lors de la recherche des agences.");
      } finally {
        setLoading(false);
      }
    };

    if (depart && arrivee) {
      fetchResults(depart, arrivee);
    } else {
      setLoading(false);
    }

    if (nbVoyageurs) {
      setTotalVoyageursRequis(Number(nbVoyageurs));
    }
  }, [searchParams, apiMsg]);

  const openReserve = (
    agenceName: string,
    trajet: { id: number; depart: string; arrivee: string; heure?: string; prixAdulte?: number; prixEnfant?: number }
  ) => {
    console.log("openReserve", { agenceName, trajet });
    setPreFill({
      depart: trajet.depart,
      arrivee: trajet.arrivee,
      heure: trajet.heure,
      prixAdulte: trajet.prixAdulte,
      prixEnfant: trajet.prixEnfant,
      trajetId: trajet.id,
      agenceName,
    });
    setFileList([]);
    setReserveOpen(true);
    setReservationType("Individuel");
    setAdultCount(1);
    setChildCount(0);
    setAdultNames([""]);
    Promise.resolve().then(() => {
      reserveForm.resetFields();
      reserveForm.setFieldsValue({
        depart: trajet.depart,
        arrivee: trajet.arrivee,
        adultCount: 1,
        childrenCount: 0,
        hasBaggage: false,
        baggageCount: 0,
        reservationType: "Individuel",
      });
    });
  };

  // Upload handled by useUploadPreview

  const handleOcr = async (file: any, fileIndex: number) => {
    if (!file || !file.originFileObj) return;

    apiMsg.info(`Analyse OCR de "${file.name}" en cours...`);

    try {
      const { data: { text } } = await Tesseract.recognize(
        file.originFileObj,
        'fra',
        { logger: m => console.log(m) } // Pour le débogage
      );

      // Heuristique simple pour extraire un nom : cherche une ligne en majuscules
      const lines = text.split('\n');
      const nameLine = lines.find(line => line.trim().length > 4 && line.trim() === line.trim().toUpperCase());
      const extractedName = nameLine ? nameLine.trim().replace(/[^a-zA-Z\s-]/g, '') : '';

      if (extractedName) {
        setAdultNames(prev => {
          const newNames = [...prev];
          if (fileIndex < newNames.length) {
            newNames[fileIndex] = extractedName;
          }
          return newNames;
        });
        apiMsg.success(`Nom extrait pour "${file.name}" : ${extractedName}`);
      } else {
        apiMsg.warning(`Aucun nom n'a pu être extrait pour "${file.name}". Saisie manuelle requise.`);
      }
    } catch (error) {
      console.error("Erreur OCR:", error);
      apiMsg.error(`L'analyse OCR pour "${file.name}" a échoué.`);
    }
  };

  const openRecap = async () => {
    try {
      const values = await reserveForm.validateFields();
      if (!preFill) return;

      // Validation du nombre total de voyageurs
      const adultCountValue = values.adultCount || 0;
      const childrenCountValue = values.childrenCount || 0;
      if (totalVoyageursRequis !== null && adultCountValue + childrenCountValue !== totalVoyageursRequis) {
        apiMsg.error(`Le nombre total de voyageurs (${adultCountValue + childrenCountValue}) doit être égal à ${totalVoyageursRequis}, comme spécifié dans la recherche.`);
        return; // Bloque l'ouverture du récapitulatif
      }

      // sync local states
      setAdultCount(values.adultCount || 1);
      setChildCount(values.childrenCount || 0);
      // ensure adultNames length matches adultCount
      setAdultNames((prev) => {
        const next = [...prev];
        if (next.length < (values.adultCount || 1)) {
          while (next.length < (values.adultCount || 1)) next.push("");
        } else if (next.length > (values.adultCount || 1)) {
          next.length = values.adultCount || 1;
        }
        return next;
      });
      // Fermer la modale de réservation pour éviter les conflits d'empilement
      setReserveOpen(false);
      setRecapOpen(true);
    } catch (e: any) {
      apiMsg.error(e?.message || "Erreur inconnue");
    }
  };

  const submitReservation = async () => {
    try {
      const values = await reserveForm.validateFields();
      if (!preFill) return;
      setReserveSubmitting(true);
      const urls = getUrls();
      const payload = {
        trajetId: preFill.trajetId,
        client: values.client,
        telephone: values.telephone,
        nbVoyageurs: (values.adultCount || 0) + (values.childrenCount || 0),
        childrenCount: values.childrenCount || 0,
        baggage: values.hasBaggage ? (values.baggageCount || 0) : 0,
        adultIdUrl: urls[0],
        otherDocumentUrl: urls[1],
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
      setRecapOpen(false);
      setReserveOpen(false);
      reserveForm.resetFields();
      setFileList([]);
      setPreFill(null);
      if (created?.id) {
        router.push(`/agences/confirmation?id=${created.id}`);
      } else {
        Modal.success({
          title: "Réservation confirmée",
          content: (
            <div>
              <p>Votre réservation a été créée avec succès.</p>
            </div>
          ),
        });
      }
    } catch (e: any) {
      apiMsg.error(e?.message || "Erreur inconnue");
    } finally {
      setReserveSubmitting(false);
    }
  };

  const renderSkeletons = () => (
    Array.from({ length: 3 }).map((_, index) => <CardSkeleton key={index} />)
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        {contextHolder}
        <div className="mb-8 text-center">
          <Title level={2} className="text-3xl font-bold text-gray-800">Agences Disponibles</Title>
          <Text type="secondary" className="text-lg">
            Trajet de <Tag color="cyan">{searchParams.get('depart')}</Tag> à <Tag color="cyan">{searchParams.get('arrivee')}</Tag>
          </Text>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(!isClient || loading) ? (
            renderSkeletons()
          ) : results && results.count > 0 ? (
            results.agencies.map((agence) => (
              <AgenceCard
                key={agence.id}
                agence={agence}
                onSelect={openReserve}
              />
            ))
          ) : (
            <div className="col-span-full mt-10">
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span className="text-lg text-gray-600">
                    Aucune agence trouvée pour ce trajet.
                    <br />
                    Essayez de modifier votre recherche.
                  </span>
                }
              />
            </div>
          )}
        </div>

      </div>

      <Modal
        title="Réserver ce trajet"
        open={reserveOpen}
        onCancel={() => setReserveOpen(false)}
        okText="Voir le récapitulatif"
        onOk={openRecap}
        confirmLoading={reserveSubmitting}
        styles={{ body: { maxHeight: '70vh', overflow: 'auto' } }}
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
          {preFill?.heure ? (
            <Form.Item label="Heure">
              <Input value={preFill?.heure} readOnly />
            </Form.Item>
          ) : null}
          <Form.Item name="client" label="Nom du client" rules={[{ required: true, message: "Nom requis" }]}>
            <Input placeholder="Votre nom complet" />
          </Form.Item>
          <Form.Item name="telephone" label="Téléphone" rules={[{ required: true, message: "Téléphone requis" }]}>
            <Input placeholder="Numéro de téléphone" />
          </Form.Item>
          {/* Type de réservation en tête pour visibilité */}
          <Form.Item name="reservationType" label="Type de réservation" initialValue="Individuel">
            <Select
              options={[{ value: "Individuel", label: "Individuel" }, { value: "Famille", label: "Famille" }, { value: "Couple", label: "Couple" }]}
              onChange={(v) => setReservationType(v)}
            />
          </Form.Item>
          <Form.Item name="adultCount" label="Nombre d'adultes" rules={[{ required: true }]} initialValue={1}>
            <InputNumber min={1} max={100} style={{ width: "100%" }} onChange={(v) => {
              const val = Number(v || 1);
              setAdultCount(val);
              setAdultNames((prev) => {
                const next = [...prev];
                if (next.length < val) { while (next.length < val) next.push(""); }
                else if (next.length > val) { next.length = val; }
                return next;
              });
            }} />
          </Form.Item>
          <Form.Item name="childrenCount" label="Nombre d'enfants" initialValue={0}>
            <InputNumber min={0} max={100} style={{ width: "100%" }} onChange={(v) => setChildCount(Number(v || 0))} />
          </Form.Item>
          <div className="mt-2 mb-1"><Text strong>Voyageurs</Text></div>
          <Form.Item label="Noms des adultes (depuis OCR, modifiables)">
            <Space direction="vertical" style={{ width: "100%" }}>
              {Array.from({ length: adultCount }).map((_, idx) => (
                <Input
                  key={idx}
                  placeholder={`Nom de l'adulte ${idx + 1}`}
                  value={adultNames[idx] || ""}
                  onChange={(e) => {
                    const copy = [...adultNames];
                    copy[idx] = e.target.value;
                    setAdultNames(copy);
                  }}
                />
              ))}
            </Space>
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
              onChange={({ file, fileList: newFileList }) => {
                setFileList(newFileList);
                // Déclenche l'OCR uniquement pour le fichier qui vient d'être ajouté
                if (file.status === 'done') {
                  const fileIndex = newFileList.findIndex(f => f.uid === file.uid);
                  if (fileIndex !== -1) {
                    handleOcr(file, fileIndex);
                  }
                }
              }}
              showUploadList={{ showPreviewIcon: true, showRemoveIcon: true }}
            >
              <div>Uploader</div>
            </Upload>
            {previewModal}
          </Form.Item>
          <Text type="secondary">Les noms des adultes seront extraits automatiquement par OCR. Vous pourrez les corriger si besoin.</Text>
          <Form.Item shouldUpdate>
            {() => {
              const adults: number = reserveForm.getFieldValue("adultCount") || adultCount || 1;
              const kids: number = reserveForm.getFieldValue("childrenCount") || childCount || 0;
              const pa = preFill?.prixAdulte ?? 0;
              const pe = preFill?.prixEnfant ?? 0;
              const subtotal = adults * pa + kids * pe;
              const total = subtotal + SERVICE_FEE_FCFA;
              return (
                <div className="p-3 rounded border bg-gray-50">
                  <div className="flex justify-between"><Text>Sous-total</Text><Text>{subtotal.toLocaleString()} FCFA</Text></div>
                  <div className="flex justify-between"><Text>Frais de service</Text><Text>{SERVICE_FEE_FCFA.toLocaleString()} FCFA</Text></div>
                  <div className="flex justify-between font-semibold mt-1"><Text strong>Total</Text><Text strong>{total.toLocaleString()} FCFA</Text></div>
                  {preFill?.heure ? (
                    <div className="mt-2"><Text type="secondary">Convocation: {CONVOCATION_MINUTES_BEFORE} min avant {preFill.heure}.</Text></div>
                  ) : (
                    <div className="mt-2"><Text type="secondary">Convocation: {CONVOCATION_MINUTES_BEFORE} min avant l'heure de départ.</Text></div>
                  )}
                </div>
              );
            }}
          </Form.Item>
        </Form>
      </Modal>

      <RecapReservationModal
        open={recapOpen}
        onCancel={() => { setRecapOpen(false); setReserveOpen(true); }}
        onConfirm={async () => {
          try {
            const values = await reserveForm.validateFields();
            if (!preFill) return;
            const urls = getUrls();
            const checkoutData = {
              trajet: preFill,
              client: values.client,
              telephone: values.telephone,
              reservationType,
              adultCount,
              childrenCount: childCount,
              adultNames: adultNames.slice(0, adultCount),
              hasBaggage: !!values.hasBaggage,
              baggageCount: values.hasBaggage ? (values.baggageCount || 0) : 0,
              documents: { adultIdUrl: urls[0], otherDocumentUrl: urls[1] },
            };
            if (typeof window !== 'undefined') {
              sessionStorage.setItem('checkoutData', JSON.stringify(checkoutData));
            }
            setRecapOpen(false);
            setReserveOpen(false);
            router.push('/agences/checkout');
          } catch (e: any) {
            apiMsg.error(e?.message || 'Erreur inconnue');
          }
        }}
        agenceName={preFill?.agenceName || ''}
        depart={preFill?.depart || ''}
        arrivee={preFill?.arrivee || ''}
        heure={preFill?.heure}
        reservationType={reservationType}
        adultCount={adultCount}
        adultNames={adultNames}
        childrenCount={childCount}
        hasBaggage={!!reserveForm.getFieldValue('hasBaggage')}
        client={reserveForm.getFieldValue('client')}
        telephone={reserveForm.getFieldValue('telephone')}
        prixAdulte={preFill?.prixAdulte}
        prixEnfant={preFill?.prixEnfant}
        serviceFee={SERVICE_FEE_FCFA}
      />
    </div>
  );
}
