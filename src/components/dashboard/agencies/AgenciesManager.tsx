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
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useApiUrl } from '@/hooks/use-api-url';
import DetailsModal from '@/components/dashboard/DetailsModal';

const { Title } = Typography;

interface Agency {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  zone?: string;
  createdAt: string;
  _count?: {
    trajets: number;
    buses: number;
  };
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
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [editingAgency, setEditingAgency] = useState<Agency | null>(null);
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);
  const [form] = Form.useForm<AgencyFormData>();
  const [messageApi, contextHolder] = message.useMessage();
  const { getApiUrl } = useApiUrl();

  // Fetch agencies
  const fetchAgencies = async () => {
    try {
      setLoading(true);
      const response = await fetch(getApiUrl('/api/admin/agencies'));
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
        ? getApiUrl(`/api/admin/agencies/${editingAgency.id}`)
        : getApiUrl('/api/admin/agencies');
      
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
  const handleDelete = async (id: number, withCascade: boolean = true) => {
    try {
      const response = await fetch(getApiUrl(`/api/admin/agencies/${id}${withCascade ? '?cascade=true' : ''}`), {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete agency');
      }

      const message = withCascade 
        ? 'Agence et toutes ses données associées supprimées avec succès'
        : 'Agence supprimée avec succès';
      messageApi.success(message);
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

  // Open modal for details
  const handleViewDetails = (agency: Agency) => {
    setSelectedAgency(agency);
    setDetailsModalOpen(true);
  };

  // Close details modal
  const handleCloseDetails = () => {
    setDetailsModalOpen(false);
    setSelectedAgency(null);
  };

  const columns = [
    {
      title: 'Nom',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: Agency, b: Agency) => a.name.localeCompare(b.name),
      ellipsis: true,
      width: 180,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email: string) => email || '-',
      ellipsis: true,
      width: 220,
    },
    {
      title: 'Téléphone',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone: string) => phone || '-',
      width: 140,
    },
    {
      title: 'Zone géographique',
      dataIndex: 'zone',
      key: 'zone',
      render: (zone: string) => zone || '-',
      ellipsis: true,
      width: 200,
    },
    {
      title: 'Adresse',
      dataIndex: 'address',
      key: 'address',
      render: (address: string) => address || '-',
      ellipsis: true,
      width: 260,
    },
    {
      title: 'Trajets',
      dataIndex: '_count',
      key: 'trajets',
      render: (_count: any) => _count?.trajets || 0,
      sorter: (a: Agency, b: Agency) => (a._count?.trajets || 0) - (b._count?.trajets || 0),
      width: 100,
    },
    {
      title: 'Bus',
      dataIndex: '_count',
      key: 'buses',
      render: (_count: any) => _count?.buses || 0,
      sorter: (a: Agency, b: Agency) => (a._count?.buses || 0) - (b._count?.buses || 0),
      width: 90,
    },
    {
      title: 'Date de création',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('fr-FR'),
      sorter: (a: Agency, b: Agency) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      width: 140,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Agency) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
            size="small"
          >
            Voir détails
          </Button>
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
            description="Cette action supprimera également tous les trajets, bus, voyages et réservations associés à cette agence. Cette action est irréversible."
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
      width: 220,
      fixed: 'right' as const,
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

        <div className="overflow-x-auto">
          <Table
            columns={columns}
            dataSource={agencies}
            rowKey="id"
            loading={loading}
            tableLayout="fixed"
            scroll={{ x: true }}
            pagination={{
              pageSize: 4,
              showSizeChanger: false,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} sur ${total} agences`,
            }}
          />
        </div>
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

       {/* Modal pour afficher les détails de l'agence */}
       <DetailsModal
         open={detailsModalOpen}
         onClose={handleCloseDetails}
         data={selectedAgency}
         type="agency"
       />
     </div>
   );
 }
