"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { Layout, Menu, theme, Button, Space, Typography, Card, Row, Col, Statistic, List, Tag, Spin, Empty, message, Form, Input } from "antd";
import {
  PieChartOutlined,
  CarOutlined,
  UsergroupAddOutlined,
  UserOutlined,
  SettingOutlined,
  CalendarOutlined,
  DollarOutlined,
  FileTextOutlined
} from "@ant-design/icons";
import FleetManager from "@/components/dashboard/fleet/FleetManager";
import VoyagesManager from "@/components/dashboard/fleet/VoyagesManager";
import RoutesManager from "@/components/dashboard/routes/RoutesManager"; // New import
import ReservationsManager from "@/components/dashboard/reservations/ReservationsManager"; // New import
import AgentsManager from "@/components/dashboard/agencies/AgentsManager";
import { useApiUrl } from "@/hooks/use-api-url";

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;

interface AgenceStats {
  totalTrajets: number;
  activeTrajets: number;
  totalReservations: number;
  confirmedReservations: number;
  totalBuses: number;
  activeVoyages: number;
  totalRevenue: number;
}

const AgencyOverview = () => {
  const [stats, setStats] = React.useState<AgenceStats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [messageApi, contextHolder] = message.useMessage();
  const { getApiUrl } = useApiUrl();

  React.useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const response = await fetch(getApiUrl("/api/agence/stats"));
        const data = await response.json();
        if (response.ok) {
          setStats(data);
        } else {
          messageApi.error("Erreur lors du chargement des statistiques de l'agence");
        }
      } catch (error) {
        console.error("Error fetching agency stats:", error);
        messageApi.error("Erreur lors du chargement des statistiques de l'agence");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [getApiUrl, messageApi]);

  const statsData = [
    { title: "Trajets publiés", value: stats?.totalTrajets, icon: <CarOutlined />, color: "#1890ff" },
    { title: "Trajets actifs", value: stats?.activeTrajets, icon: <CarOutlined />, color: "#52c41a" },
    { title: "Réservations", value: stats?.totalReservations, icon: <UsergroupAddOutlined />, color: "#faad14" },
    { title: "Confirmées", value: stats?.confirmedReservations, icon: <UserOutlined />, color: "#722ed1" },
    { title: "Bus en flotte", value: stats?.totalBuses, icon: <CarOutlined />, color: "#eb2f96" },
    { title: "Voyages actifs", value: stats?.activeVoyages, icon: <CalendarOutlined />, color: "#13c2c2" },
    { title: "Revenus (FCFA)", value: stats?.totalRevenue?.toLocaleString() || "0", icon: <DollarOutlined />, color: "#f5222d" },
  ];

  return (
    <div className="space-y-6">
      {contextHolder}
      <Title level={2}>Aperçu Général</Title>
      <Row gutter={[16, 16]}>
        {statsData.map((stat, index) => (
          <Col xs={24} sm={12} lg={8} xl={6} key={index}>
            <Card loading={loading}>
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
      {/* Vous pouvez ajouter d'autres sections comme les activités récentes ici */}
    </div>
  );
};

const AgencySettings = () => {
  const [agencyData, setAgencyData] = React.useState<any>(null); // Replace any with actual Agency type
  const [loading, setLoading] = React.useState(true);
  const [messageApi, contextHolder] = message.useMessage();
  const { getApiUrl } = useApiUrl();

  React.useEffect(() => {
    const fetchAgencyData = async () => {
      setLoading(true);
      try {
        // Assuming there's an API to get the current agency's data
        const response = await fetch(getApiUrl("/api/agence/profile"));
        const data = await response.json();
        if (response.ok) {
          setAgencyData(data);
        } else {
          messageApi.error("Erreur lors du chargement des informations de l'agence");
        }
      } catch (error) {
        console.error("Error fetching agency data:", error);
        messageApi.error("Erreur lors du chargement des informations de l'agence");
      } finally {
        setLoading(false);
      }
    };
    fetchAgencyData();
  }, [getApiUrl, messageApi]);

  const handleUpdateSettings = async (values: any) => { // Replace any with actual Agency type
    try {
      setLoading(true);
      const response = await fetch(getApiUrl("/api/agence/profile"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await response.json();
      if (response.ok) {
        setAgencyData(data);
        messageApi.success("Informations de l'agence mises à jour avec succès");
      } else {
        messageApi.error(data.error || "Erreur lors de la mise à jour des informations");
      }
    } catch (error) {
      console.error("Error updating agency settings:", error);
      messageApi.error("Erreur lors de la mise à jour des informations de l'agence");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {contextHolder}
      <Title level={2}>Paramètres de l'Agence</Title>
      <Card title="Profil de l'agence" loading={loading}>
        {agencyData && (
          <Form
            layout="vertical"
            initialValues={agencyData}
            onFinish={handleUpdateSettings}
          >
            <Form.Item label="Nom de l'agence" name="name" rules={[{ required: true, message: "Le nom est requis" }]}>
              <Input />
            </Form.Item>
            <Form.Item label="Téléphone" name="phone">
              <Input />
            </Form.Item>
            <Form.Item label="Adresse" name="address">
              <Input.TextArea />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                Sauvegarder les modifications
              </Button>
            </Form.Item>
          </Form>
        )}
      </Card>
    </div>
  );
};

export default function AgenceDashboardPage() {
  const searchParams = useSearchParams();

  const currentTab = searchParams.get("tab") || "overview";

  // Common data for Agents tab
  const [me, setMe] = React.useState<{ email: string | null; role: string; agenceId: number | null } | null>(null);
  const [agency, setAgency] = React.useState<any>(null);
  React.useEffect(() => {
    if (currentTab !== 'agents') return;
    (async () => {
      try {
        const [meRes, agRes] = await Promise.all([
          fetch('/api/auth/me'),
          fetch('/api/agence/profile'),
        ]);
        const meJson = await meRes.json();
        const agJson = await agRes.json();
        if (meRes.ok) setMe(meJson);
        if (agRes.ok) setAgency(agJson);
      } catch (e) {
        // no-op
      }
    })();
  }, [currentTab]);

  const renderContent = () => {
    switch (currentTab) {
      case "overview":
        return <AgencyOverview />;
      case "routes":
        return <RoutesManager />;
      case "bookings":
        return <ReservationsManager />;
      case "agents":
        return me && agency ? (
          <AgentsManager
            agencyId={agency.id}
            agencyEmail={agency.email}
            currentUserEmail={me.email || ''}
          />
        ) : (
          <div>Chargement…</div>
        );
      case "fleet":
        return <FleetManager />;
      case "voyages":
        return <VoyagesManager />;
      case "settings":
        return <AgencySettings />;
      default:
        return <AgencyOverview />;
    }
  };

  return (
    <>
      {renderContent()}
    </>
  );
}