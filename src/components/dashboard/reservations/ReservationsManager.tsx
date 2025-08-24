"use client";

import React, { useState, useEffect } from "react";
import { Button, Card, Form, Input, Select, Space, Tag, Typography, message, Modal, Spin, Empty, Table, InputNumber } from "antd";
import { EditOutlined, DeleteOutlined, CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { useApiUrl } from "@/hooks/use-api-url";

const { Title, Text } = Typography;

interface Reservation {
  id: number;
  trajetId: number;
  client: string;
  telephone: string;
  nbVoyageurs: number;
  statut: 'en_attente' | 'confirmée' | 'annulée';
  note?: string;
  createdAt: string;
  trajet?: { // Optional, as it might be populated by include
    id: number;
    depart: string;
    arrivee: string;
    heure: string;
  };
}

export default function ReservationsManager() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const { getApiUrl } = useApiUrl();

  const fetchReservations = async () => {
    setLoading(true);
    try {
      // TODO: Filter by agenceId once auth is implemented
      const response = await fetch(getApiUrl("/api/agence/reservations"));
      const data = await response.json();
      if (response.ok) {
        setReservations(data);
      } else {
        messageApi.error("Erreur lors du chargement des réservations");
      }
    } catch (error) {
      console.error("Error fetching reservations:", error);
      messageApi.error("Erreur lors du chargement des réservations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations, getApiUrl, messageApi]);

  const handleEdit = (reservation: Reservation) => {
    setEditingReservation(reservation);
    setIsModalVisible(true);
    form.setFieldsValue(reservation);
  };

  const handleDelete = async (id: number) => {
    try {
      setLoading(true);
      const response = await fetch(getApiUrl(`/api/agence/reservations/${id}`), { method: 'DELETE' });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.error || 'Échec de la suppression');
      }
      setReservations(prev => prev.filter(r => r.id !== id));
      messageApi.success("Réservation supprimée avec succès");
    } catch (error) {
      console.error("Error deleting reservation:", error);
      messageApi.error("Erreur lors de la suppression de la réservation");
    } finally {
      setLoading(false);
    }
  };

  const handleOk = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      const payload = { ...values, id: editingReservation?.id };

      const response = await fetch(getApiUrl("/api/agence/reservations"), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Échec de la mise à jour");
      }
      
      const updatedReservation = await response.json();
      setReservations(prev => prev.map(r => (r.id === updatedReservation.id ? updatedReservation : r)));
      messageApi.success("Réservation modifiée avec succès");
      setIsModalVisible(false);
      form.resetFields();
      // No need to fetch again, as we updated the state directly
    } catch (error) {
      console.error("Error saving reservation:", error);
      messageApi.error(`Erreur: ${error instanceof Error ? error.message : "Une erreur est survenue"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingReservation(null);
    form.resetFields();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmée': return 'green';
      case 'en_attente': return 'orange';
      case 'annulée': return 'red';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmée': return <CheckCircleOutlined />;
      case 'en_attente': return <ClockCircleOutlined />;
      case 'annulée': return <CloseCircleOutlined />;
      default: return null;
    }
  };

  const columns = [
    { title: "Client", dataIndex: "client", key: "client" },
    { title: "Téléphone", dataIndex: "telephone", key: "telephone" },
    { title: "Voyageurs", dataIndex: "nbVoyageurs", key: "nbVoyageurs" },
    {
      title: "Trajet",
      key: "trajet",
      render: (_: any, record: Reservation) => (
        record.trajet ? `${record.trajet.depart} - ${record.trajet.arrivee} (${record.trajet.heure})` : 'N/A'
      ),
    },
    {
      title: "Statut",
      dataIndex: "statut",
      key: "statut",
      render: (statut: string) => (
        <Tag icon={getStatusIcon(statut)} color={getStatusColor(statut)}>
          {statut}
        </Tag>
      ),
    },
    { title: "Note", dataIndex: "note", key: "note" },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Reservation) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>Modifier</Button>
          <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(record.id)}>Supprimer</Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {contextHolder}
      <Title level={2}>Gestion des Réservations</Title>
      {loading && reservations.length === 0 ? (
        <div className="text-center py-8">
          <Spin size="large" />
          <div className="mt-4"><Text type="secondary">Chargement des réservations...</Text></div>
        </div>
      ) : reservations.length === 0 ? (
        <Empty description="Aucune réservation disponible" />
      ) : (
        <Table
          dataSource={reservations}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      )}

      <Modal
        title="Modifier la Réservation"
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={loading}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Client" name="client" rules={[{ required: true, message: "Veuillez entrer le nom du client" }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Téléphone" name="telephone" rules={[{ required: true, message: "Veuillez entrer le numéro de téléphone" }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Nombre de Voyageurs" name="nbVoyageurs" rules={[{ required: true, message: "Veuillez entrer le nombre de voyageurs" }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Statut" name="statut" rules={[{ required: true, message: "Veuillez sélectionner le statut" }]}>
            <Select placeholder="Sélectionner un statut">
              <Select.Option value="en_attente">En attente</Select.Option>
              <Select.Option value="confirmée">Confirmée</Select.Option>
              <Select.Option value="annulée">Annulée</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="Note" name="note">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
