"use client";

import React, { useMemo, useState } from "react";
import { Select, Form, Button, Card, List, Typography, Tag, Space, Empty, Modal, Input, InputNumber, Switch, Upload, message } from "antd";
import { GABON_CITIES } from "@/data/gabonCities";
import { useRouter } from "next/navigation";
import { useUploadPreview } from "@/utils/uploadPreview";

const { Title, Text } = Typography;

export default function RechercheAgencesPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
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
  const [reserveSubmitting, setReserveSubmitting] = useState(false);
  const [reserveForm] = Form.useForm();
  const { fileList, setFileList, handlePreview, customRequest, previewModal, getUrls } = useUploadPreview([]);
  const [apiMsg, contextHolder] = message.useMessage();
  const [preFill, setPreFill] = useState<{ depart: string; arrivee: string; trajetId: number; agenceName: string } | null>(null);

  const cityOptions = useMemo(
    () =>
      GABON_CITIES.map((c: string) => ({
        label: c,
        value: c,
      })),
    []
  );

  const onSearch = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const params = new URLSearchParams({ depart: values.depart, arrivee: values.arrivee });
      const res = await fetch(`/api/agencies/by-route?${params.toString()}`, { cache: "no-store" });
      const json = await res.json();
      setResults(json);
    } catch (e) {
      // noop - errors handled by form
    } finally {
      setLoading(false);
    }
  };

  const openReserve = (agenceName: string, trajet: { id: number; depart: string; arrivee: string }) => {
    console.log("openReserve", { agenceName, trajet });
    setPreFill({ depart: trajet.depart, arrivee: trajet.arrivee, trajetId: trajet.id, agenceName });
    setFileList([]);
    setReserveOpen(true);
    Promise.resolve().then(() => {
      reserveForm.resetFields();
      reserveForm.setFieldsValue({
        depart: trajet.depart,
        arrivee: trajet.arrivee,
        nbVoyageurs: 1,
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

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 lg:p-8">
      {contextHolder}
      <Title level={3}>Trouver une agence par trajet</Title>
      <Text type="secondary">Sélectionnez un lieu de départ et d'arrivée pour voir les agences qui desservent cette ligne.</Text>

      <Card className="mt-4">
        <Form form={form} layout="vertical" onFinish={onSearch}>
          <Form.Item name="depart" label="Départ" rules={[{ required: true, message: "Sélectionnez une ville de départ" }]}>
            <Select
              showSearch
              placeholder="Ville de départ"
              options={cityOptions}
              filterOption={(input, option) => (option?.label as string)?.toLowerCase().includes(input.toLowerCase())}
            />
          </Form.Item>
          <Form.Item name="arrivee" label="Arrivée" rules={[{ required: true, message: "Sélectionnez une ville d'arrivée" }]}>
            <Select
              showSearch
              placeholder="Ville d'arrivée"
              options={cityOptions}
              filterOption={(input, option) => (option?.label as string)?.toLowerCase().includes(input.toLowerCase())}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Rechercher
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <div className="mt-6">
        {results && results.count > 0 ? (
          <List
            grid={{ gutter: 16, xs: 1, sm: 1, md: 2 }}
            dataSource={results.agencies}
            renderItem={(agence) => (
              <List.Item key={agence.id}>
                <Card
                  title={agence.name}
                  extra={
                    <Space>
                      {agence.phone && <Tag>{agence.phone}</Tag>}
                      {agence.address && <Tag color="blue">{agence.address}</Tag>}
                      <Button
                        type="primary"
                        onClick={() => {
                          const first = agence.trajets?.[0];
                          if (first) openReserve(agence.name, first);
                          else apiMsg.warning("Aucun trajet disponible pour cette agence");
                        }}
                      >
                        Valider
                      </Button>
                    </Space>
                  }
                >
                  <Space direction="vertical" size="small">
                    <Text strong>Trajets disponibles ({agence.trajets.length}):</Text>
                    {agence.trajets.length > 0 ? (
                      <ul className="list-disc pl-5">
                        {agence.trajets.map((t) => (
                          <li key={t.id} className="flex items-center justify-between gap-2 py-1">
                            <Space size="small">
                              <Tag color="green">
                                {t.depart} → {t.arrivee}
                              </Tag>
                              <Tag>{t.heure}</Tag>
                              <Text type="secondary">
                                Adulte: {t.prixAdulte.toLocaleString()} FCFA · Enfant: {t.prixEnfant.toLocaleString()} FCFA
                              </Text>
                            </Space>
                            <Button type="primary" onClick={() => openReserve(agence.name, t)}>Valider</Button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <Text type="secondary">Aucun trajet listé pour cette ligne.</Text>
                    )}
                  </Space>
                </Card>
              </List.Item>
            )}
          />
        ) : results && results.count === 0 ? (
          <Empty description="Aucune agence ne dessert cette ligne" />
        ) : null}
      </div>

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
          <Form.Item name="nbVoyageurs" label="Nombre d'adultes" rules={[{ required: true }]} initialValue={1}>
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
