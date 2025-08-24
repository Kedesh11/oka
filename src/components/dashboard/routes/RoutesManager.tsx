"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button, Form, Input, InputNumber, Select, Space, Tag, Typography, message, Modal, Spin, Empty, Table } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useApiUrl } from "@/hooks/use-api-url";
import dayjs from "dayjs";
import { TimePicker } from "antd";
import { GABON_CITIES } from "@/data/gabonCities";
import SectionHeader from "@/components/dashboard/common/SectionHeader";
import ScrollablePanel from "@/components/dashboard/common/ScrollablePanel";
import type { Trajet as TrajetModel } from "@/components/dashboard/common/domain";
import { apiGet, apiPost, apiRequest } from "@/lib/apiClient";
import { z } from "zod";
import { TrajetSchema as BaseTrajetSchema } from "@/components/dashboard/common/schemas";

const { Title, Text } = Typography;

interface Trajet extends TrajetModel {
  prixAdulte: number;
  prixEnfant: number;
  statut: 'actif' | 'inactif';
  agenceId: number;
}

// Zod schema aligned with this component's Trajet shape
const TrajetWithPricingSchema = BaseTrajetSchema.extend({
  prixAdulte: z.number(),
  prixEnfant: z.number(),
  statut: z.enum(["actif", "inactif"]),
  agenceId: z.number(),
});

interface RouteFormValues extends Omit<Trajet, 'id' | 'agenceId'> {}

export default function RoutesManager() {
  const [trajets, setTrajets] = useState<Trajet[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTrajet, setEditingTrajet] = useState<Trajet | null>(null);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const { getApiUrl } = useApiUrl();
  const [agencyId, setAgencyId] = useState<number | null>(null);

  const fetchTrajets = useCallback(async () => {
    setLoading(true);
    try {
      // TODO: Filter by agenceId once auth is implemented
      const raw = await apiGet<any>(getApiUrl("/api/agence/trajets"));
      const items = Array.isArray(raw) ? raw : [];
      const valid: Trajet[] = items.filter((t: any) => TrajetWithPricingSchema.safeParse(t).success);
      setTrajets(valid);
    } catch (error) {
      console.error("Error fetching trajets:", error);
      messageApi.error("Erreur lors du chargement des trajets");
    } finally {
      setLoading(false);
    }
  }, [getApiUrl, messageApi]);

  useEffect(() => {
    // Load agency profile to get agenceId for POST/PUT payloads (optional for non-admins)
    (async () => {
      try {
        const res = await fetch(getApiUrl("/api/agence/profile"));
        if (res.ok) {
          const data = await res.json();
          if (data?.id) setAgencyId(data.id);
        }
      } catch (_) {
        // ignore, agencyId remains null
      }
    })();
    fetchTrajets();
  }, [fetchTrajets]);

  const handleAddEdit = (trajet?: Trajet) => {
    setEditingTrajet(trajet || null);
    setIsModalVisible(true);
    form.setFieldsValue({
      ...trajet,
      heure: trajet ? dayjs(trajet.heure, "HH:mm") : null, // Convert string to dayjs object for TimePicker
    });
  };

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: "Supprimer ce trajet ?",
      content: "Cette action est irréversible.",
      okText: "Supprimer",
      okButtonProps: { danger: true },
      cancelText: "Annuler",
      onOk: async () => {
        try {
          setLoading(true);
          await apiRequest(getApiUrl(`/api/agence/trajets/${id}`), { method: "DELETE" });
          messageApi.success("Trajet supprimé avec succès");
          fetchTrajets();
        } catch (error) {
          console.error("Error deleting trajet:", error);
          messageApi.error("Erreur lors de la suppression du trajet");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleOk = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      // Zod validation for form values before building payload
      const FormSchema = z.object({
        depart: z.string().min(1),
        arrivee: z.string().min(1),
        heure: z.any(), // Dayjs, checked below
        prixAdulte: z.number().nonnegative(),
        prixEnfant: z.number().nonnegative(),
        statut: z.enum(["actif", "inactif"]),
      });
      const parsed = FormSchema.safeParse(values);
      if (!parsed.success) {
        // Map Zod issues to AntD field errors
        const fieldErrors = parsed.error.issues.map((iss) => ({
          name: iss.path as (string | number)[],
          errors: [iss.message],
        }));
        form.setFields(fieldErrors as any);
        return; // Abort submit
      }

      const payload: any = {
        ...values,
        heure: values.heure ? dayjs(values.heure).format("HH:mm") : undefined,
      };
      if (agencyId) payload.agenceId = agencyId; // Include only if known (Admin may need to pass it explicitly)

      if (editingTrajet) {
        await apiRequest(getApiUrl(`/api/agence/trajets/${editingTrajet.id}`), { method: "PUT", body: payload });
        messageApi.success("Trajet modifié avec succès");
      } else {
        const created = await apiPost<any>(getApiUrl("/api/agence/trajets"), payload);
        const parsed = TrajetWithPricingSchema.safeParse(created);
        if (!parsed.success) throw new Error("Réponse de création invalide");
        const newTrajet: Trajet = parsed.data as Trajet;
        setTrajets(prev => [...prev, newTrajet]);
        messageApi.success("Trajet ajouté avec succès");
      }
      setIsModalVisible(false);
      form.resetFields();
      fetchTrajets(); // Refresh list after add/edit
    } catch (error) {
      console.error("Error saving trajet:", error);
      messageApi.error(`Erreur: ${error instanceof Error ? error.message : "Une erreur est survenue"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingTrajet(null);
    form.resetFields();
  };

  const columns = [
    { title: "Départ", dataIndex: "depart", key: "depart" },
    { title: "Arrivée", dataIndex: "arrivee", key: "arrivee" },
    { title: "Heure", dataIndex: "heure", key: "heure" },
    { title: "Prix Adulte", dataIndex: "prixAdulte", key: "prixAdulte" },
    { title: "Prix Enfant", dataIndex: "prixEnfant", key: "prixEnfant" },
    {
      title: "Statut",
      dataIndex: "statut",
      key: "statut",
      render: (statut: string) => (
        <Tag color={statut === "actif" ? "#00B140" : "red"}>
          {statut}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Trajet) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => handleAddEdit(record)}>Modifier</Button>
          <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(record.id)}>Supprimer</Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {contextHolder}
      <SectionHeader
        title={<Title level={2} style={{ margin: 0 }}>Gestion des Trajets</Title>}
        actions={(
          <Button type="primary" className="btn-kani" icon={<PlusOutlined />} onClick={() => handleAddEdit()}>
            Ajouter un Trajet
          </Button>
        )}
      />
      <ScrollablePanel maxHeight="calc(100vh - 240px)">
        {loading && trajets.length === 0 ? (
          <div className="text-center py-8">
            <Spin size="large" />
            <div className="mt-4"><Text type="secondary">Chargement des trajets...</Text></div>
          </div>
        ) : trajets.length === 0 ? (
          <Empty description="Aucun trajet disponible" />
        ) : (
          <Table
            dataSource={trajets}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        )}
      </ScrollablePanel>

      <Modal
        title={editingTrajet ? "Modifier le Trajet" : "Ajouter un Nouveau Trajet"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={loading}
        styles={{ body: { maxHeight: '70vh', overflowY: 'auto' } }}
        style={{ top: 24 }}
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Départ" name="depart" rules={[{ required: true, message: "Veuillez entrer la ville de départ" }]}>
            <Select
              showSearch
              placeholder="Ville de départ"
              options={GABON_CITIES.map((c) => ({ label: c, value: c }))}
              filterOption={(input, option) =>
                (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>
          <Form.Item label="Arrivée" name="arrivee" rules={[{ required: true, message: "Veuillez entrer la ville d\'arrivée" }]}>
            <Select
              showSearch
              placeholder="Ville d\'arrivée"
              options={GABON_CITIES.map((c) => ({ label: c, value: c }))}
              filterOption={(input, option) =>
                (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>
          <Form.Item label="Heure" name="heure" rules={[{ required: true, message: "Veuillez sélectionner l\'heure" }]}>
            <TimePicker format="HH:mm" minuteStep={5} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Prix Adulte (FCFA)" name="prixAdulte" rules={[{ required: true, message: "Veuillez entrer le prix adulte" }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Prix Enfant (FCFA)" name="prixEnfant" rules={[{ required: true, message: "Veuillez entrer le prix enfant" }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Statut" name="statut" rules={[{ required: true, message: "Veuillez sélectionner le statut" }]}>
            <Select placeholder="Sélectionner un statut">
              <Select.Option value="actif">Actif</Select.Option>
              <Select.Option value="inactif">Inactif</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
