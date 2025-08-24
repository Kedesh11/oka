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
import { useSystemStats, useSystemSettings, useSecurityManagement } from '@/utils/dashboardActions';
import { SecuritySettingsModal } from '@/utils/dashboardModals';
import UsersManager from '@/components/dashboard/users/UsersManager';
import ReportsManager from '@/components/dashboard/reports/ReportsManager';

const { Title, Text } = Typography;

// Composant Overview
const OverviewTab = () => {
  const { stats, loading: statsLoading, fetchStats } = useSystemStats();
  
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const statsData = [
    { title: 'Agences', value: stats.agencies, icon: <BuildOutlined />, color: '#01be65' },
    { title: 'Utilisateurs', value: stats.users, icon: <UserOutlined />, color: '#00B140' },
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
                <Progress percent={stats.satisfactionRate} strokeColor="#00B140" />
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



// Composant Rapports
const ReportsTab = () => {
  return <ReportsManager />;
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
        return <UsersManager />;
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