"use client";

import React, { useState } from 'react';
import { Card, Row, Col, Typography, Select, DatePicker, Space, Button, Progress, List, Avatar, Tag } from 'antd';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// Données simulées pour les graphiques
const salesData = [
  { month: 'Jan', ventes: 1200000, reservations: 45, agences: 8 },
  { month: 'Fév', ventes: 1350000, reservations: 52, agences: 9 },
  { month: 'Mar', ventes: 1100000, reservations: 38, agences: 7 },
  { month: 'Avr', ventes: 1500000, reservations: 61, agences: 10 },
  { month: 'Mai', ventes: 1400000, reservations: 55, agences: 9 },
  { month: 'Jun', ventes: 1600000, reservations: 68, agences: 11 },
  { month: 'Jul', ventes: 1450000, reservations: 58, agences: 10 },
  { month: 'Aoû', ventes: 1700000, reservations: 72, agences: 12 },
];

const topRoutes = [
  { route: 'Libreville - Port-Gentil', reservations: 156, revenue: 2340000, growth: 12.5 },
  { route: 'Libreville - Franceville', reservations: 134, revenue: 2010000, growth: 8.3 },
  { route: 'Port-Gentil - Libreville', reservations: 98, revenue: 1470000, growth: -2.1 },
  { route: 'Libreville - Oyem', reservations: 87, revenue: 1305000, growth: 15.7 },
  { route: 'Franceville - Libreville', reservations: 76, revenue: 1140000, growth: 5.2 },
];

const revenueByAgency = [
  { name: 'Transport Express', value: 35, color: '#01be65' },
  { name: 'Voyages Gabon', value: 25, color: '#00B140' },
  { name: 'Express Libreville', value: 20, color: '#faad14' },
  { name: 'Autres', value: 20, color: '#52c41a' },
];

const COLORS = ['#01be65', '#00B140', '#faad14', '#52c41a', '#f5222d'];

export const SalesChart: React.FC = () => {
  const [timeRange, setTimeRange] = useState('6m');
  const [chartType, setChartType] = useState('bar');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.name === 'ventes' ? formatCurrency(entry.value) : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec contrôles */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Title level={3}>Analytics des Ventes</Title>
          <Text type="secondary">Suivi des performances et des tendances</Text>
        </div>
        <Space>
          <Select
            value={timeRange}
            onChange={setTimeRange}
            className="w-30"
            options={[
              { value: '1m', label: '1 mois' },
              { value: '3m', label: '3 mois' },
              { value: '6m', label: '6 mois' },
              { value: '1y', label: '1 an' },
            ]}
          />
          <Select
            value={chartType}
            onChange={setChartType}
            className="w-30"
            options={[
              { value: 'bar', label: 'Barres' },
              { value: 'line', label: 'Ligne' },
            ]}
          />
          <RangePicker />
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        {/* Graphique principal */}
        <Col xs={24} lg={16}>
          <Card title="Évolution des Ventes" extra={<Button type="link">Voir détails</Button>}>
            <ResponsiveContainer width="100%" height={300}>
              {chartType === 'bar' ? (
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="ventes" fill="#01be65" name="Ventes (FCFA)" />
                  <Bar yAxisId="right" dataKey="reservations" fill="#52c41a" name="Réservations" />
                </BarChart>
              ) : (
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="ventes" stroke="#01be65" name="Ventes (FCFA)" />
                  <Line yAxisId="right" type="monotone" dataKey="reservations" stroke="#52c41a" name="Réservations" />
                </LineChart>
              )}
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Répartition par agence */}
        <Col xs={24} lg={8}>
          <Card title="Répartition par Agence">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={revenueByAgency}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(((percent ?? 0) * 100)).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {revenueByAgency.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Top routes */}
      <Card title="Top Routes" extra={<Button type="link">Voir toutes les routes</Button>}>
        <List
          dataSource={topRoutes}
          renderItem={(item, index) => (
            <List.Item>
              <List.Item.Meta
                avatar={
                                  <Avatar 
                  className="bg-opacity-100"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  icon={<Calendar className="h-4 w-4" />}
                />
                }
                title={
                  <div className="flex items-center justify-between">
                    <span>{item.route}</span>
                    <Tag color={item.growth > 0 ? 'green' : 'red'}>
                      {item.growth > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                      {Math.abs(item.growth)}%
                    </Tag>
                  </div>
                }
                description={
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{item.reservations} réservations</span>
                    <span>{formatCurrency(item.revenue)}</span>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Card>

      {/* Métriques rapides */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <Text type="secondary">Revenus du mois</Text>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(1600000)}
                </div>
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <TrendingUp size={12} />
                  +12.5%
                </div>
              </div>
              <DollarSign className="text-2xl text-green-600 opacity-20" />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <Text type="secondary">Réservations</Text>
                <div className="text-2xl font-bold text-green-600">
                  72
                </div>
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <TrendingUp size={12} />
                  +8.3%
                </div>
              </div>
              <Users className="text-2xl text-green-600 opacity-20" />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <Text type="secondary">Taux de remplissage</Text>
                <div className="text-2xl font-bold text-orange-600">
                  85%
                </div>
                <div className="flex items-center gap-1 text-sm text-orange-600">
                  <TrendingUp size={12} />
                  +5.2%
                </div>
              </div>
              <div className="text-2xl text-orange-600 opacity-20">
                <Progress type="circle" percent={85} size={40} showInfo={false} />
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <Text type="secondary">Agences actives</Text>
                <div className="text-2xl font-bold text-purple-600">
                  12
                </div>
                <div className="flex items-center gap-1 text-sm text-purple-600">
                  <TrendingUp size={12} />
                  +2
                </div>
              </div>
              <div className="text-2xl text-purple-600 opacity-20">
                <Users className="h-8 w-8" />
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SalesChart;
