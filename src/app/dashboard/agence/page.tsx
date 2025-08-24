"use client";

import React from "react";
import dynamic from "next/dynamic";
import type { PlotParams } from "react-plotly.js";
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
} from "@ant-design/icons";
import FleetManager from "@/components/dashboard/fleet/FleetManager";
import VoyagesManager from "@/components/dashboard/fleet/VoyagesManager";
import RoutesManager from "@/components/dashboard/routes/RoutesManager"; // New import
import ReservationsManager from "@/components/dashboard/reservations/ReservationsManager"; // New import
import AgentsManager from "@/components/dashboard/agencies/AgentsManager";
import { useApiUrl } from "@/hooks/use-api-url";

// Plotly client-only with explicit prop typing to satisfy TS
const Plot = dynamic<PlotParams>(() => import("react-plotly.js"), { ssr: false });

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
  const [trends, setTrends] = React.useState<{
    dates: string[];
    reservations: number[];
    activeVoyages: number[];
    revenue: number[];
  } | null>(null);
  const [trendsLoading, setTrendsLoading] = React.useState(true);

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
    const fetchTrends = async () => {
      setTrendsLoading(true);
      try {
        const res = await fetch(getApiUrl("/api/agence/stats/trends"));
        const json = await res.json();
        if (res.ok) {
          setTrends(json);
        } else {
          setTrends(null);
        }
      } catch (e) {
        console.error("Error fetching trends:", e);
        setTrends(null);
      } finally {
        setTrendsLoading(false);
      }
    };
    fetchStats();
    fetchTrends();
  }, [getApiUrl, messageApi]);

  const metricMeta: Record<string, { title: string; icon: React.ReactNode; color: string; format?: (v: number) => string | number }> = {
    totalTrajets: { title: "Trajets publiés", icon: <CarOutlined />, color: "#00B140" },
    activeTrajets: { title: "Trajets actifs", icon: <CarOutlined />, color: "#52c41a" },
    totalReservations: { title: "Réservations", icon: <UsergroupAddOutlined />, color: "#faad14" },
    confirmedReservations: { title: "Confirmées", icon: <UserOutlined />, color: "#722ed1" },
    totalBuses: { title: "Bus en flotte", icon: <CarOutlined />, color: "#eb2f96" },
    activeVoyages: { title: "Voyages actifs", icon: <CalendarOutlined />, color: "#13c2c2" },
    totalRevenue: { title: "Revenus (FCFA)", icon: <DollarOutlined />, color: "#f5222d", format: (v) => v.toLocaleString() }
  };

  const statsData = React.useMemo(() => {
    if (!stats) return [] as { title: string; value: string | number | undefined; icon: React.ReactNode; color: string }[];
    const entries = Object.entries(stats) as Array<[string, any]>;
    return entries
      .filter(([, value]) => typeof value === 'number')
      .map(([key, value]) => {
        const meta = metricMeta[key] ?? {
          title: key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()),
          icon: <PieChartOutlined />,
          color: "#00B140"
        };
        const displayValue = meta.format ? meta.format(value as number) : (value as number);
        return { title: meta.title, value: displayValue, icon: meta.icon, color: meta.color };
      });
  }, [stats]);

  return (
    <div className="min-h-screen overflow-y-auto space-y-6 pb-8">
      {contextHolder}
      <Title level={2}>Aperçu Général</Title>
      <Title level={4}>Indicateurs clés</Title>
      <Row gutter={[16, 16]}>
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Col xs={24} sm={12} lg={8} xl={6} key={`sk-${i}`}>
                <Card loading />
              </Col>
            ))
          : statsData.length > 0
          ? statsData.map((stat, index) => (
              <Col xs={24} sm={12} lg={8} xl={6} key={index}>
                <Card>
                  <Statistic
                    title={stat.title}
                    value={stat.value}
                    prefix={<span style={{ color: stat.color }}>{stat.icon}</span>}
                    valueStyle={{ color: stat.color }}
                  />
                </Card>
              </Col>
            ))
          : (
              <Col span={24}>
                <Empty description="Aucune statistique disponible" />
              </Col>
            )}
      </Row>
      {/* Graphes de tendances */}
      <Title level={4}>Tendances</Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card title="Tendance Réservations & Voyages">
            {trendsLoading ? (
              <div className="flex items-center justify-center py-10"><Spin /></div>
            ) : trends && trends.dates?.length ? (
              <Plot
                data={[
                  {
                    x: trends.dates,
                    y: trends.reservations,
                    type: "scatter",
                    mode: "lines+markers",
                    name: "Réservations",
                    line: { color: "#00B140", width: 3 },
                    marker: { color: "#00B140" }
                  },
                  {
                    x: trends.dates,
                    y: trends.activeVoyages,
                    type: "scatter",
                    mode: "lines+markers",
                    name: "Voyages actifs",
                    line: { color: "#52c41a", width: 3, dash: "dot" },
                    marker: { color: "#52c41a" }
                  }
                ]}
                layout={{
                  autosize: true,
                  margin: { l: 40, r: 20, t: 10, b: 40 },
                  legend: { orientation: "h" },
                  xaxis: { title: "Date" },
                  yaxis: { title: "Volume" }
                }}
                useResizeHandler
                style={{ width: "100%", height: 260 }}
                config={{ displayModeBar: false }}
              />
            ) : (
              <Empty description="Aucune donnée de tendance" />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="Tendance Revenus (FCFA)">
            {trendsLoading ? (
              <div className="flex items-center justify-center py-10"><Spin /></div>
            ) : trends && trends.dates?.length ? (
              <Plot
                data={[
                  {
                    x: trends.dates,
                    y: trends.revenue,
                    type: "bar",
                    name: "Revenus",
                    marker: { color: "#00B140" }
                  }
                ]}
                layout={{
                  autosize: true,
                  margin: { l: 40, r: 20, t: 10, b: 40 },
                  xaxis: { title: "Date" },
                  yaxis: { title: "FCFA", tickformat: ",d" }
                }}
                useResizeHandler
                style={{ width: "100%", height: 260 }}
                config={{ displayModeBar: false }}
              />
            ) : (
              <Empty description="Aucune donnée de tendance" />
            )}
          </Card>
        </Col>
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
  const { getApiUrl } = useApiUrl();
  const [me, setMe] = React.useState<{ email: string | null; role: string; agenceId: number | null; isAgencyOwner: boolean } | null>(null);
  const [agency, setAgency] = React.useState<any>(null);
  const [agentsTabLoading, setAgentsTabLoading] = React.useState(false);
  const [agentsTabError, setAgentsTabError] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (currentTab !== 'agents') return;
    (async () => {
      setAgentsTabLoading(true);
      setAgentsTabError(null);
      try {
        const [meRes, agRes] = await Promise.all([
          fetch(getApiUrl('/api/auth/me')),
          fetch(getApiUrl('/api/agence/profile')),
        ]);
        const meJson = await meRes.json();
        const agJson = await agRes.json();
        if (meRes.ok) setMe(meJson); else setAgentsTabError(meJson?.error || 'Erreur chargement profil utilisateur');
        if (agRes.ok) setAgency(agJson); else setAgentsTabError(agJson?.error || 'Erreur chargement agence');
      } catch (e: any) {
        setAgentsTabError(e?.message || 'Erreur réseau');
      } finally {
        setAgentsTabLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTab, getApiUrl]);

  const renderContent = () => {
    switch (currentTab) {
      case "overview":
        return <AgencyOverview />;
      case "routes":
        return <RoutesManager />;
      case "bookings":
        return <ReservationsManager />;
      case "agents":
        if (agentsTabLoading) return <div style={{ padding: 24 }}><Spin /> Chargement…</div>;
        if (agentsTabError) return <Empty description={agentsTabError} />;
        if (!agency || !me) return <Empty description="Aucune agence liée à ce compte" />;
        return (
          <AgentsManager
            agencyId={agency.id}
            agencyEmail={agency.email}
            currentUserEmail={me.email || ''}
            isAgencyOwner={!!me.isAgencyOwner}
          />
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