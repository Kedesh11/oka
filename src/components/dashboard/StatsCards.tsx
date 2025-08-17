"use client";

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Progress, Typography, Space, Badge } from 'antd';
import { 
  UserOutlined, 
  BuildOutlined, 
  CarOutlined, 
  DollarOutlined,
  RiseOutlined,
  FallOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { TrendingUp, TrendingDown, Users, Building2, Route, Ticket } from 'lucide-react';

const { Title, Text } = Typography;

interface StatCardProps {
  title: string;
  value: string | number;
  prefix?: React.ReactNode;
  suffix?: string;
  color?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  description?: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  prefix, 
  suffix, 
  color = '#01be65',
  trend,
  icon,
  description 
}) => {
  return (
    <Card className="h-full">
          <div className="flex items-center justify-between">
        <div className="flex-1">
          <Text type="secondary" className="text-sm">{title}</Text>
          <div className="flex items-baseline gap-2 mt-1">
            <Statistic
              value={value}
              prefix={prefix}
              suffix={suffix}
              valueStyle={{ 
                color: color,
                fontSize: '24px',
                fontWeight: 'bold'
              }}
            />
            {trend && (
              <div className={`flex items-center gap-1 text-xs ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {trend.isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                <span>{Math.abs(trend.value)}%</span>
              </div>
            )}
          </div>
          {description && (
            <Text type="secondary" className="text-xs mt-1 block">{description}</Text>
          )}
          </div>
        {icon && (
          <div className="text-2xl opacity-20" style={{ color }}>
            {icon}
        </div>
        )}
    </div>
    </Card>
  );
};

interface PerformanceMetricProps {
  title: string;
  value: number;
  target: number;
  color: string;
  icon: React.ReactNode;
}

const PerformanceMetric: React.FC<PerformanceMetricProps> = ({ 
  title, 
  value, 
  target, 
  color, 
  icon 
}) => {
  const percentage = Math.round((value / target) * 100);
  
  return (
    <Card className="h-full">
      <div className="flex items-center gap-3">
        <div className="text-2xl" style={{ color }}>
          {icon}
        </div>
        <div className="flex-1">
          <Text className="text-sm font-medium">{title}</Text>
          <div className="flex items-center gap-2 mt-1">
            <Progress 
              percent={percentage} 
              strokeColor={color}
              showInfo={false}
              size="small"
            />
            <Text className="text-xs text-gray-500">
              {value}/{target}
            </Text>
          </div>
        </div>
      </div>
    </Card>
  );
};

export const StatsCards: React.FC = () => {
  const [stats, setStats] = useState({
    agencies: { current: 12, trend: 8.5 },
    users: { current: 156, trend: 12.3 },
    activeVoyages: { current: 89, trend: -2.1 },
    revenue: { current: 2400000, trend: 15.7 }
  });

  const performanceMetrics = [
    {
      title: 'Taux de réservation',
      value: 85,
      target: 100,
      color: '#01be65',
      icon: <Ticket className="h-6 w-6" />
    },
    {
      title: 'Satisfaction client',
      value: 92,
      target: 100,
      color: '#1890ff',
      icon: <Users className="h-6 w-6" />
    },
    {
      title: 'Ponctualité',
      value: 78,
      target: 100,
      color: '#faad14',
      icon: <ClockCircleOutlined className="text-xl" />
    },
    {
      title: 'Voyages complétés',
      value: 156,
      target: 180,
      color: '#52c41a',
      icon: <CheckCircleOutlined className="text-xl" />
    }
  ];

  const recentStats = [
    {
      title: 'Réservations aujourd\'hui',
      value: 23,
      prefix: <Ticket className="h-4 w-4" />,
      color: '#01be65',
      trend: { value: 12.5, isPositive: true }
    },
    {
      title: 'Nouveaux utilisateurs',
      value: 8,
      prefix: <UserOutlined />,
      color: '#1890ff',
      trend: { value: 5.2, isPositive: true }
    },
    {
      title: 'Revenus du jour',
      value: '125K',
      prefix: <DollarOutlined />,
      suffix: ' FCFA',
      color: '#faad14',
      trend: { value: 8.7, isPositive: true }
    },
    {
      title: 'Voyages en cours',
      value: 15,
      prefix: <CarOutlined />,
      color: '#52c41a',
      trend: { value: 3.1, isPositive: false }
    }
  ];

  return (
    <div className="space-y-6">
      {/* Statistiques principales */}
      <div>
        <Title level={4} className="mb-4">Vue d'ensemble</Title>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Agences"
              value={stats.agencies.current}
              prefix={<BuildOutlined />}
              color="#01be65"
              trend={{ value: stats.agencies.trend, isPositive: stats.agencies.trend > 0 }}
              icon={<Building2 className="h-8 w-8" />}
              description="Agences actives"
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Utilisateurs"
              value={stats.users.current}
              prefix={<UserOutlined />}
              color="#1890ff"
              trend={{ value: stats.users.trend, isPositive: stats.users.trend > 0 }}
              icon={<Users className="h-8 w-8" />}
              description="Utilisateurs enregistrés"
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Voyages Actifs"
              value={stats.activeVoyages.current}
              prefix={<CarOutlined />}
              color="#52c41a"
              trend={{ value: stats.activeVoyages.trend, isPositive: stats.activeVoyages.trend > 0 }}
              icon={<Route className="h-8 w-8" />}
              description="Voyages en cours"
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Revenus"
              value={stats.revenue.current.toLocaleString()}
              prefix={<DollarOutlined />}
              suffix=" FCFA"
              color="#faad14"
              trend={{ value: stats.revenue.trend, isPositive: stats.revenue.trend > 0 }}
              icon={<RiseOutlined className="text-2xl" />}
              description="Revenus totaux"
            />
          </Col>
        </Row>
      </div>

      {/* Métriques de performance */}
      <div>
        <Title level={4} className="mb-4">Performance</Title>
        <Row gutter={[16, 16]}>
          {performanceMetrics.map((metric, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <PerformanceMetric {...metric} />
            </Col>
          ))}
        </Row>
      </div>

      {/* Statistiques récentes */}
      <div>
        <Title level={4} className="mb-4">Aujourd'hui</Title>
        <Row gutter={[16, 16]}>
          {recentStats.map((stat, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <StatCard {...stat} />
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default StatsCards;
