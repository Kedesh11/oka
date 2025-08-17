"use client";

import React, { useState, useEffect } from "react";
import { Button, Card, Form, Input, InputNumber, Select, Space, Tag, Typography, message, Modal, Spin, Empty, Table } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, CarOutlined } from "@ant-design/icons";
import { useApiUrl } from "@/hooks/use-api-url";
import dayjs from "dayjs";
import { TimePicker } from "antd";
import { GABON_CITIES } from "@/data/gabonCities";

const { Title, Text } = Typography;

interface Trajet {
  id: number;
  depart: string;
  arrivee: string;
  heure: string;
  prixAdulte: number;
  prixEnfant: number;
  statut: 'actif' | 'inactif';
  agenceId: number; // Assuming agenceId will be part of the Trajet model
}

interface RouteFormValues extends Omit<Trajet, 'id' | 'agenceId'> {}

export default function RoutesManager() {
  const [trajets, setTrajets] = useState<Trajet[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTrajet, setEditingTrajet] = useState<Trajet | null>(null);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const { getApiUrl } = useApiUrl();

  const fetchTrajets = async () => {
    setLoading(true);
    try {
      // TODO: Filter by agenceId once auth is implemented
      const response = await fetch(getApiUrl("/api/agence/trajets"));
      const data = await response.json();
      if (response.ok) {
        setTrajets(data);
      } else {
        messageApi.error("Erreur lors du chargement des trajets");
      }
    } catch (error) {
      console.error("Error fetching trajets:", error);
      messageApi.error("Erreur lors du chargement des trajets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrajets();
  }, [fetchTrajets, getApiUrl, messageApi]);

  const handleAddEdit = (trajet?: Trajet) => {
    setEditingTrajet(trajet || null);
    setIsModalVisible(true);
    form.setFieldsValue({
      ...trajet,
      heure: trajet ? dayjs(trajet.heure, "HH:mm") : null, // Convert string to dayjs object for TimePicker
    });
  };

  const handleDelete = async (id: number) => {
    try {
      setLoading(true);
      // TODO: Implement delete API for trajets
      // const response = await fetch(getApiUrl(`/api/agence/trajets/${id}`), { method: 'DELETE' });
      // if (!response.ok) throw new Error('Échec de la suppression');
      setTrajets(prev => prev.filter(t => t.id !== id));
      messageApi.success("Trajet supprimé avec succès");
    } catch (error) {
      console.error("Error deleting trajet:", error);
      messageApi.error("Erreur lors de la suppression du trajet");
    } finally {
      setLoading(false);
    }
  };

  const handleOk = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      const payload = {
        ...values,
        heure: values.heure ? dayjs(values.heure).format("HH:mm") : undefined,
        agenceId: 1, // TODO: Get actual agenceId from authenticated user session
      };

      let response;
      if (editingTrajet) {
        // TODO: Implement PUT API for trajets
        // response = await fetch(getApiUrl(`/api/agence/trajets/${editingTrajet.id}`), {
        //   method: 'PUT',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(payload),
        // });
        messageApi.success("Trajet modifié avec succès");
      } else {
        response = await fetch(getApiUrl("/api/agence/trajets"), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Échec de la création");
        }
        const newTrajet = await response.json();
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
        <Tag color={statut === "actif" ? "green" : "red"}>
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
      <Title level={2}>Gestion des Trajets</Title>
      <Button type="primary" icon={<PlusOutlined />} onClick={() => handleAddEdit()}>Ajouter un Trajet</Button>
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

      <Modal
        title={editingTrajet ? "Modifier le Trajet" : "Ajouter un Nouveau Trajet"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={loading}
        destroyOnClose
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
