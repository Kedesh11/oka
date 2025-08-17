"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, Row, Col, Statistic, Table, Button, Space, Tag, Progress, Typography, Avatar, List, Badge } from 'antd';
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
  DeleteOutlined
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

const { Title, Text } = Typography;

// Composant Overview
const OverviewTab = () => {
  const stats = [
    { title: 'Agences', value: 12, icon: <BuildOutlined />, color: '#01be65' },
    { title: 'Utilisateurs', value: 156, icon: <UserOutlined />, color: '#1890ff' },
    { title: 'Voyages Actifs', value: 89, icon: <CarOutlined />, color: '#52c41a' },
    { title: 'Revenus (FCFA)', value: '2.4M', icon: <DollarOutlined />, color: '#faad14' },
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
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card>
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
                <Progress percent={85} strokeColor="#01be65" />
              </div>
              <div>
                <Text>Satisfaction client</Text>
                <Progress percent={92} strokeColor="#1890ff" />
              </div>
              <div>
                <Text>Ponctualité</Text>
                <Progress percent={78} strokeColor="#faad14" />
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
  const users = [
    { id: 1, name: 'Jean Dupont', email: 'jean@example.com', role: 'Admin', status: 'active', lastLogin: '2024-01-15' },
    { id: 2, name: 'Marie Martin', email: 'marie@example.com', role: 'Agence', status: 'active', lastLogin: '2024-01-14' },
    { id: 3, name: 'Pierre Durand', email: 'pierre@example.com', role: 'Client', status: 'inactive', lastLogin: '2024-01-10' },
  ];

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
      render: () => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} size="small">
            Voir
          </Button>
          <Button type="link" icon={<EditOutlined />} size="small">
            Modifier
          </Button>
          <Button type="link" danger icon={<DeleteOutlined />} size="small">
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
        <Button type="primary" icon={<UserOutlined />}>
          Ajouter un utilisateur
        </Button>
      </div>
      
      <Card>
        <Table 
          columns={columns} 
          dataSource={users} 
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} sur ${total} utilisateurs`,
          }}
        />
      </Card>
    </div>
  );
};

// Composant Rapports
const ReportsTab = () => {
  const reports = [
    { id: 1, title: 'Rapport mensuel des ventes', type: 'Ventes', date: '2024-01-15', status: 'Généré' },
    { id: 2, title: 'Analyse des trajets populaires', type: 'Trajets', date: '2024-01-14', status: 'En cours' },
    { id: 3, title: 'Rapport de satisfaction client', type: 'Satisfaction', date: '2024-01-13', status: 'Généré' },
  ];

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
                    <Button type="link" key="download">Télécharger</Button>
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
              <Button type="primary" block icon={<RiseOutlined />}>
                Rapport de ventes
              </Button>
              <Button block icon={<Route />}>
                Rapport des trajets
              </Button>
              <Button block icon={<Users />}>
                Rapport utilisateurs
              </Button>
              <Button block icon={<Ticket />}>
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
  const securityLogs = [
    { id: 1, action: 'Connexion réussie', user: 'admin@oka.com', ip: '192.168.1.1', time: '2024-01-15 10:30', status: 'success' },
    { id: 2, action: 'Tentative de connexion échouée', user: 'unknown@example.com', ip: '192.168.1.2', time: '2024-01-15 09:15', status: 'error' },
    { id: 3, action: 'Modification de mot de passe', user: 'user@oka.com', ip: '192.168.1.3', time: '2024-01-15 08:45', status: 'warning' },
  ];

  return (
    <div className="space-y-6">
      <Title level={2}>Sécurité et Audit</Title>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Logs de Sécurité">
            <List
              dataSource={securityLogs}
              renderItem={(item) => (
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
              <Button block icon={<Shield />}>
                Configuration 2FA
              </Button>
              <Button block icon={<SafetyOutlined />}>
                Politique de mots de passe
              </Button>
              <Button block icon={<EyeOutlined />}>
                Logs d'audit
              </Button>
              <Button block icon={<SettingOutlined />}>
                Paramètres de session
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
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