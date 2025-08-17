"use client";

import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Space, 
  Popconfirm, 
  message,
  Typography,
  Card
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title } = Typography;

interface Agency {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  zone?: string;
  createdAt: string;
}

interface AgencyFormData {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  zone?: string;
}

export default function AgenciesManager() {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAgency, setEditingAgency] = useState<Agency | null>(null);
  const [form] = Form.useForm<AgencyFormData>();
  const [messageApi, contextHolder] = message.useMessage();

  // Fetch agencies
  const fetchAgencies = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/agencies');
      const data = await response.json();
      if (!response.ok) {
        const errorDetails = data.details || 'Aucun détail disponible.';
        throw new Error(`Failed to fetch agencies: ${errorDetails}`);
      }
      setAgencies(data);
    } catch (error) {
      console.error('Error fetching agencies:', error);
      const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue.';
      messageApi.error(`Erreur lors du chargement: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgencies();
  }, []);

  // Handle create/update
  const handleSubmit = async (values: AgencyFormData) => {
    try {
      const url = editingAgency 
        ? `/api/admin/agencies/${editingAgency.id}`
        : '/api/admin/agencies';
      
      const method = editingAgency ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorDetails = errorData.details || errorData.error || 'Aucun détail disponible.';
        throw new Error(`${errorDetails}`);
      }

      messageApi.success(
        editingAgency 
          ? 'Agence modifiée avec succès' 
          : 'Agence créée avec succès'
      );
      
      setModalOpen(false);
      setEditingAgency(null);
      form.resetFields();
      fetchAgencies();
    } catch (error) {
      console.error('Error saving agency:', error);
      const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue.';
      messageApi.error(`Erreur: ${errorMessage}`);
    }
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/agencies/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete agency');
      }

      messageApi.success('Agence supprimée avec succès');
      fetchAgencies();
    } catch (error) {
      console.error('Error deleting agency:', error);
      messageApi.error('Erreur lors de la suppression');
    }
  };

  // Open modal for create
  const handleCreate = () => {
    setEditingAgency(null);
    form.resetFields();
    setModalOpen(true);
  };

  // Open modal for edit
  const handleEdit = (agency: Agency) => {
    setEditingAgency(agency);
    form.setFieldsValue({
      name: agency.name,
      email: agency.email,
      phone: agency.phone,
      address: agency.address,
      zone: agency.zone,
    });
    setModalOpen(true);
  };

  const columns = [
    {
      title: 'Nom',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: Agency, b: Agency) => a.name.localeCompare(b.name),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email: string) => email || '-',
    },
    {
      title: 'Téléphone',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone: string) => phone || '-',
    },
    {
      title: 'Zone géographique',
      dataIndex: 'zone',
      key: 'zone',
      render: (zone: string) => zone || '-',
    },
    {
      title: 'Adresse',
      dataIndex: 'address',
      key: 'address',
      render: (address: string) => address || '-',
    },
    {
      title: 'Date de création',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('fr-FR'),
      sorter: (a: Agency, b: Agency) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Agency) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          >
            Modifier
          </Button>
          <Popconfirm
            title="Supprimer cette agence ?"
            description="Cette action est irréversible."
            onConfirm={() => handleDelete(record.id)}
            okText="Supprimer"
            cancelText="Annuler"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              size="small"
            >
              Supprimer
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      {contextHolder}
      
      <Card>
        <div className="flex justify-between items-center mb-6">
          <Title level={2}>Gestion des Agences</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            Ajouter une agence
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={agencies}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} sur ${total} agences`,
          }}
        />
      </Card>

      <Modal
        title={editingAgency ? 'Modifier l\'agence' : 'Ajouter une agence'}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditingAgency(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText={editingAgency ? 'Modifier' : 'Créer'}
        cancelText="Annuler"
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-4"
        >
          <Form.Item
            name="name"
            label="Nom de l'agence"
            rules={[
              { required: true, message: 'Le nom de l\'agence est requis' },
              { min: 2, message: 'Le nom doit contenir au moins 2 caractères' },
            ]}
          >
            <Input placeholder="Ex: Transport Express Libreville" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email de l'agence"
            rules={[
              { type: 'email', message: 'Format d\'email invalide' },
            ]}
          >
            <Input placeholder="contact@agence.com" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Numéro de téléphone"
            rules={[
              { pattern: /^[\d\s\-\+\(\)]+$/, message: 'Format de téléphone invalide' },
            ]}
          >
            <Input placeholder="+241 XX XX XX XX" />
          </Form.Item>

          <Form.Item
            name="zone"
            label="Zone géographique"
          >
            <Input placeholder="Ex: Libreville, Estuaire" />
          </Form.Item>

          <Form.Item
            name="address"
            label="Adresse"
          >
            <Input.TextArea 
              rows={3}
              placeholder="Adresse complète de l'agence"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
