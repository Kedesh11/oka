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
  Card,
  Select,
  Tag
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useApiUrl } from '@/hooks/use-api-url';
import DetailsModal from '@/components/dashboard/DetailsModal';

const { Title } = Typography;
const { Option } = Select;

interface User {
  id: number;
  name: string;
  email: string;
  role: 'Admin' | 'Agence' | 'Client';
  status: 'active' | 'inactive';
  phone?: string;
  address?: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  agenceId?: number;
  agence?: {
    id: number;
    name: string;
  };
}

interface UserFormData {
  name: string;
  email: string;
  password?: string;
  role: 'Admin' | 'Agence' | 'Client';
  status: 'active' | 'inactive';
  phone?: string;
  address?: string;
  agenceId?: number;
}

interface Agency {
  id: number;
  name: string;
}

export default function UsersManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [form] = Form.useForm<UserFormData>();
  const [messageApi, contextHolder] = message.useMessage();
  const { getApiUrl } = useApiUrl();

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(getApiUrl('/api/admin/users'));
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch users');
      }
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      messageApi.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  // Fetch agencies
  const fetchAgencies = async () => {
    try {
      const response = await fetch(getApiUrl('/api/admin/agencies'));
      const data = await response.json();
      if (response.ok) {
        setAgencies(data);
      } else {
        messageApi.error('Erreur lors du chargement des agences');
      }
    } catch (error) {
      console.error('Error fetching agencies:', error);
      messageApi.error('Erreur lors du chargement des agences');
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchAgencies();
  }, []);

  // Handle create/update
  const handleSubmit = async (values: UserFormData) => {
    try {
      const url = editingUser 
        ? getApiUrl(`/api/admin/users/${editingUser.id}`)
        : getApiUrl('/api/admin/users');
      
      const method = editingUser ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save user');
      }

      messageApi.success(
        editingUser 
          ? 'Utilisateur modifié avec succès' 
          : 'Utilisateur créé avec succès'
      );
      
      setModalOpen(false);
      setEditingUser(null);
      form.resetFields();
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      messageApi.error(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(getApiUrl(`/api/admin/users/${id}`), {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete user');
      }

      messageApi.success('Utilisateur supprimé avec succès');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      messageApi.error('Erreur lors de la suppression');
    }
  };

  // Open modal for create
  const handleCreate = () => {
    setEditingUser(null);
    setSelectedRole('');
    form.resetFields();
    setModalOpen(true);
  };

  // Open modal for edit
  const handleEdit = (user: User) => {
    setEditingUser(user);
    setSelectedRole(user.role);
    form.setFieldsValue({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      phone: user.phone,
      address: user.address,
      agenceId: user.agenceId,
    });
    setModalOpen(true);
  };

  // Open modal for details
  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setDetailsModalOpen(true);
  };

  // Close details modal
  const handleCloseDetails = () => {
    setDetailsModalOpen(false);
    setSelectedUser(null);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin': return 'red';
      case 'Agence': return 'blue';
      case 'Client': return 'green';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'green' : 'red';
  };

  const columns = [
    {
      title: 'Nom',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: User, b: User) => a.name.localeCompare(b.name),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Rôle',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={getRoleColor(role)}>{role}</Tag>
      ),
      filters: [
        { text: 'Admin', value: 'Admin' },
        { text: 'Agence', value: 'Agence' },
        { text: 'Client', value: 'Client' },
      ],
      onFilter: (value: string, record: User) => record.role === value,
    },
    {
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status === 'active' ? 'Actif' : 'Inactif'}
        </Tag>
      ),
    },
    {
      title: 'Agence',
      dataIndex: 'agence',
      key: 'agence',
      render: (agence: any) => agence ? agence.name : '-',
    },
    {
      title: 'Dernière connexion',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      render: (lastLogin: string) => 
        lastLogin ? new Date(lastLogin).toLocaleDateString('fr-FR') : 'Jamais',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: User) => (
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
            title="Supprimer cet utilisateur ?"
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
          <Title level={2}>Gestion des Utilisateurs</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            Ajouter un utilisateur
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 4,
            showSizeChanger: false,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} sur ${total} utilisateurs`,
          }}
          locale={{
            emptyText: 'Aucun utilisateur trouvé'
          }}
        />
      </Card>

      {/* Modal pour créer/modifier un utilisateur */}
      <Modal
        title={editingUser ? 'Modifier l\'utilisateur' : 'Ajouter un utilisateur'}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditingUser(null);
          setSelectedRole('');
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText={editingUser ? 'Modifier' : 'Créer'}
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
            label="Nom complet"
            rules={[
              { required: true, message: 'Le nom est requis' },
              { min: 2, message: 'Le nom doit contenir au moins 2 caractères' },
            ]}
          >
            <Input placeholder="Nom complet de l'utilisateur" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'L\'email est requis' },
              { type: 'email', message: 'Format d\'email invalide' },
            ]}
          >
            <Input placeholder="email@exemple.com" />
          </Form.Item>

          {!editingUser && (
            <Form.Item
              name="password"
              label="Mot de passe"
              rules={[
                { required: true, message: 'Le mot de passe est requis' },
                { min: 6, message: 'Le mot de passe doit contenir au moins 6 caractères' },
              ]}
            >
              <Input.Password placeholder="Mot de passe" />
            </Form.Item>
          )}

                     <Form.Item
             name="role"
             label="Rôle"
             rules={[{ required: true, message: 'Le rôle est requis' }]}
           >
             <Select 
               placeholder="Sélectionner un rôle"
               onChange={(value) => {
                 setSelectedRole(value);
                 // Réinitialiser l'agence si le rôle n'est pas 'Agence'
                 if (value !== 'Agence') {
                   form.setFieldValue('agenceId', undefined);
                 }
               }}
             >
               <Option value="Admin">Admin</Option>
               <Option value="Agence">Agence</Option>
               <Option value="Client">Client</Option>
             </Select>
           </Form.Item>

                       <Form.Item
              name="status"
              label="Statut"
              rules={[{ required: true, message: 'Le statut est requis' }]}
            >
              <Select placeholder="Sélectionner un statut">
                <Option value="active">Actif</Option>
                <Option value="inactive">Inactif</Option>
              </Select>
            </Form.Item>

          <Form.Item
            name="phone"
            label="Téléphone"
          >
            <Input placeholder="+241 XX XX XX XX" />
          </Form.Item>

          <Form.Item
            name="address"
            label="Adresse"
          >
            <Input.TextArea 
              rows={3}
              placeholder="Adresse complète"
            />
          </Form.Item>

          {selectedRole === 'Agence' && (
            <Form.Item
              name="agenceId"
              label="Agence associée"
              rules={[
                {
                  required: true,
                  message: 'Une agence doit être sélectionnée pour les utilisateurs de type Agence'
                }
              ]}
            >
              <Select 
                placeholder="Sélectionner une agence"
                showSearch
                filterOption={(input, option) =>
                  (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                }
                notFoundContent="Aucune agence trouvée"
              >
                {agencies.map((agency) => (
                  <Option key={agency.id} value={agency.id}>
                    {agency.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}
        </Form>
      </Modal>

      {/* Modal pour afficher les détails de l'utilisateur */}
      <DetailsModal
        open={detailsModalOpen}
        onClose={handleCloseDetails}
        data={selectedUser}
        type="user"
      />
    </div>
  );
}
