"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, Row, Col, Statistic, Table, Button, Space, Tag, Progress, Typography, Avatar, List, Badge, message } from 'antd';
import { 
  UserOutlined, 
  BuildOutlined, 
  CarOutlined, 
  DollarOutlined, 
  RiseOutlined,
  SafetyOutlined,
  SettingOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { 
  Users, 
  Building2, 
  Route, 
  Ticket, 
  TrendingUp, 
  Shield, 
  Settings,
  Calendar,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';
import AgenciesManager from '@/components/dashboard/agencies/AgenciesManager';
import { useUsersManagement, useReportsManagement, useSystemStats, useSystemSettings, useSecurityManagement } from '@/utils/dashboardActions';
import { UserModal, SecuritySettingsModal } from '@/utils/dashboardModals';

const { Title, Text } = Typography;

// Composant Overview
const OverviewTab = () => {
  const { stats, loading: statsLoading, fetchStats } = useSystemStats();
  
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const statsData = [
    { title: 'Agences', value: stats.agencies, icon: <BuildOutlined />, color: '#01be65' },
    { title: 'Utilisateurs', value: stats.users, icon: <UserOutlined />, color: '#1890ff' },
    { title: 'Voyages Actifs', value: stats.activeVoyages, icon: <CarOutlined />, color: '#52c41a' },
    { title: 'Revenus (FCFA)', value: stats.revenue, icon: <DollarOutlined />, color: '#faad14' },
  ];

  const recentActivities = [
    { id: 1, action: 'Nouvelle agence créée', entity: 'Transport Express Libreville', time: 'Il y a 2h', type: 'success' },
    { id: 2, action: 'Réservation confirmée', entity: 'Voyage Libreville-Port-Gentil', time: 'Il y a 3h', type: 'info' },
    { id: 3, action: 'Paiement reçu', entity: '45,000 FCFA', time: 'Il y a 4h', type: 'success' },
    { id: 4, action: 'Nouveau trajet ajouté', entity: 'Libreville-Franceville', time: 'Il y a 6h', type: 'warning' },
  ];

  return (
    <div className="space-y-6">
      <Title level={2}>Tableau de Bord</Title>
      
      {/* Statistiques */}
      <Row gutter={[16, 16]}>
        {statsData.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card loading={statsLoading}>
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={React.cloneElement(stat.icon, { style: { color: stat.color } })}
                valueStyle={{ color: stat.color }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Graphiques et Activités */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Activités Récentes" extra={<Button type="link">Voir tout</Button>}>
            <List
              dataSource={recentActivities}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Badge 
                        status={item.type === 'success' ? 'success' : item.type === 'warning' ? 'warning' : 'processing'} 
                        dot 
                      />
                    }
                    title={item.action}
                    description={`${item.entity} • ${item.time}`}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Performance">
            <div className="space-y-4">
              <div>
                <Text>Taux de réservation</Text>
                <Progress percent={stats.bookingRate} strokeColor="#01be65" />
              </div>
              <div>
                <Text>Satisfaction client</Text>
                <Progress percent={stats.satisfactionRate} strokeColor="#1890ff" />
              </div>
              <div>
                <Text>Ponctualité</Text>
                <Progress percent={stats.punctualityRate} strokeColor="#faad14" />
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

// Composant Utilisateurs
const UsersTab = () => {
  const { users, loading, fetchUsers, createUser, updateUser, deleteUser } = useUsersManagement();
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreateUser = async (values: any) => {
    try {
      await createUser(values);
      setUserModalVisible(false);
    } catch (error) {
      console.error('Erreur lors de la création:', error);
    }
  };

  const handleUpdateUser = async (values: any) => {
    try {
      await updateUser(editingUser.id, values);
      setUserModalVisible(false);
      setEditingUser(null);
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setUserModalVisible(true);
  };

  const handleDeleteUser = (id: number) => {
    deleteUser(id);
  };

  const columns = [
    {
      title: 'Utilisateur',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <div>{text}</div>
            <Text type="secondary">{record.email}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Rôle',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={role === 'Admin' ? 'red' : role === 'Agence' ? 'blue' : 'green'}>
          {role}
        </Tag>
      ),
    },
    {
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? 'Actif' : 'Inactif'}
        </Tag>
      ),
    },
    {
      title: 'Dernière connexion',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      render: (date: string) => new Date(date).toLocaleDateString('fr-FR'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} size="small">
            Voir
          </Button>
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => handleEditUser(record)}
          >
            Modifier
          </Button>
          <Button 
            type="link" 
            danger 
            icon={<DeleteOutlined />} 
            size="small"
            onClick={() => handleDeleteUser(record.id)}
          >
            Supprimer
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Title level={2}>Gestion des Utilisateurs</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => setUserModalVisible(true)}
        >
          Ajouter un utilisateur
        </Button>
      </div>
      
      <Card>
        <Table 
          columns={columns} 
          dataSource={users} 
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 4,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} sur ${total} utilisateurs`,
          }}
        />
      </Card>

      <UserModal
        visible={userModalVisible}
        onCancel={() => {
          setUserModalVisible(false);
          setEditingUser(null);
        }}
        onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
        initialValues={editingUser}
        title={editingUser ? 'Modifier l\'utilisateur' : 'Ajouter un utilisateur'}
        loading={loading}
      />
    </div>
  );
};

// Composant Rapports
const ReportsTab = () => {
  const { reports, loading, fetchReports, generateReport, downloadReport } = useReportsManagement();

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleGenerateReport = async (type: string) => {
    try {
      await generateReport(type as any);
    } catch (error) {
      console.error('Erreur lors de la génération:', error);
    }
  };

  const handleDownloadReport = (id: number) => {
    downloadReport(id);
  };

  return (
    <div className="space-y-6">
      <Title level={2}>Rapports et Analyses</Title>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Rapports Disponibles">
            <List
              dataSource={reports}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button type="link" key="view">Voir</Button>,
                    <Button 
                      type="link" 
                      key="download"
                      onClick={() => handleDownloadReport(item.id)}
                      disabled={item.status !== 'Généré'}
                    >
                      Télécharger
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    title={item.title}
                    description={`${item.type} • ${item.date}`}
                  />
                  <Tag color={item.status === 'Généré' ? 'green' : 'orange'}>
                    {item.status}
                  </Tag>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Générer un nouveau rapport">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button 
                type="primary" 
                block 
                icon={<RiseOutlined />}
                onClick={() => handleGenerateReport('Ventes')}
                loading={loading}
              >
                Rapport de ventes
              </Button>
              <Button 
                block 
                icon={<Route />}
                onClick={() => handleGenerateReport('Trajets')}
                loading={loading}
              >
                Rapport des trajets
              </Button>
              <Button 
                block 
                icon={<Users />}
                onClick={() => handleGenerateReport('Utilisateurs')}
                loading={loading}
              >
                Rapport utilisateurs
              </Button>
              <Button 
                block 
                icon={<Ticket />}
                onClick={() => handleGenerateReport('Réservations')}
                loading={loading}
              >
                Rapport réservations
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

// Composant Sécurité
const SecurityTab = () => {
  const { securityLogs, loading, fetchSecurityLogs } = useSecurityManagement();
  const { updateGeneralSettings } = useSystemSettings();
  const [securityModalVisible, setSecurityModalVisible] = useState(false);

  useEffect(() => {
    fetchSecurityLogs();
  }, [fetchSecurityLogs]);

  const handleSecuritySettings = async (values: any) => {
    try {
      await updateGeneralSettings(values);
      setSecurityModalVisible(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Title level={2}>Sécurité et Audit</Title>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Logs de Sécurité">
            <List
              dataSource={securityLogs}
              renderItem={(item: any) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Badge 
                        status={item.status === 'success' ? 'success' : item.status === 'error' ? 'error' : 'warning'} 
                        dot 
                      />
                    }
                    title={item.action}
                    description={`${item.user} • ${item.ip} • ${item.time}`}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Paramètres de Sécurité">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button 
                block 
                icon={<Shield />}
                onClick={() => setSecurityModalVisible(true)}
              >
                Configuration 2FA
              </Button>
              <Button 
                block 
                icon={<SafetyOutlined />}
                onClick={() => setSecurityModalVisible(true)}
              >
                Politique de mots de passe
              </Button>
              <Button 
                block 
                icon={<EyeOutlined />}
                onClick={() => setSecurityModalVisible(true)}
              >
                Logs d'audit
              </Button>
              <Button 
                block 
                icon={<SettingOutlined />}
                onClick={() => setSecurityModalVisible(true)}
              >
                Paramètres de session
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>

      <SecuritySettingsModal
        visible={securityModalVisible}
        onCancel={() => setSecurityModalVisible(false)}
        onSubmit={handleSecuritySettings}
        loading={loading}
      />
    </div>
  );
};

// Composant Paramètres
const SettingsTab = () => {
  return (
    <div className="space-y-6">
      <Title level={2}>Paramètres Système</Title>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Paramètres Généraux">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button block icon={<SettingOutlined />}>
                Configuration générale
              </Button>
              <Button block icon={<Mail />}>
                Paramètres email
              </Button>
              <Button block icon={<Phone />}>
                Configuration SMS
              </Button>
              <Button block icon={<MapPin />}>
                Paramètres géographiques
              </Button>
            </Space>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Intégrations">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button block icon={<DollarOutlined />}>
                Configuration paiements
              </Button>
              <Button block icon={<BuildOutlined />}>
                API externes
              </Button>
              <Button block icon={<RiseOutlined />}>
                Analytics
              </Button>
              <Button block icon={<Calendar />}>
                Synchronisation calendrier
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

const AdminDashboard = () => {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';

  const renderTabContent = () => {
    switch (currentTab) {
      case 'overview':
        return <OverviewTab />;
      case 'users':
        return <UsersTab />;
      case 'agencies':
        return <AgenciesManager />;
      case 'reports':
        return <ReportsTab />;
      case 'security':
        return <SecurityTab />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <OverviewTab />;
    }
  };

  return (
    <div className="h-full bg-gray-50 p-6 overflow-y-auto">
      {renderTabContent()}
    </div>
  );
};

export default AdminDashboard;