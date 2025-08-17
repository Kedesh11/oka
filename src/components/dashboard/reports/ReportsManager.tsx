"use client";

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  List, 
  Button, 
  Space, 
  Tag, 
  Modal, 
  Typography, 
  message,
  Spin,
  Empty,
  Tooltip,
  Statistic
} from 'antd';
import { 
  RiseOutlined, 
  CarOutlined, 
  UserOutlined, 
  FileTextOutlined,
  DownloadOutlined,
  EyeOutlined,
  BarChartOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  DollarOutlined
} from '@ant-design/icons';
import { useApiUrl } from '@/hooks/use-api-url';

const { Title, Text } = Typography;

interface Report {
  id: number;
  title: string;
  type: 'Ventes' | 'Trajets' | 'Utilisateurs' | 'Réservations' | 'Satisfaction';
  date: string;
  status: 'Généré' | 'En cours' | 'Échec';
  url?: string;
  content?: any;
  summary?: {
    totalRevenue?: number;
    totalBookings?: number;
    totalUsers?: number;
    totalRoutes?: number;
    averageRating?: number;
    period?: string;
  };
}

export default function ReportsManager() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);
  const [previewModal, setPreviewModal] = useState<{ visible: boolean; report: Report | null }>({
    visible: false,
    report: null
  });
  const [messageApi, contextHolder] = message.useMessage();
  const { getApiUrl } = useApiUrl();

  // Fetch reports
  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await fetch(getApiUrl('/api/admin/reports'));
      const data = await response.json();
      if (response.ok) {
        setReports(data);
      } else {
        messageApi.error('Erreur lors du chargement des rapports');
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      messageApi.error('Erreur lors du chargement des rapports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Generate report
  const handleGenerateReport = async (type: Report['type']) => {
    try {
      setGenerating(type);
      const response = await fetch(getApiUrl('/api/admin/reports'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la génération');
      }

      const newReport = await response.json();
      setReports(prev => [newReport, ...prev]);
      messageApi.success(`Rapport ${type} généré avec succès`);
    } catch (error) {
      console.error('Error generating report:', error);
      messageApi.error(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setGenerating(null);
    }
  };

  // Download report
  const handleDownloadReport = async (report: Report) => {
    try {
      if (!report.url) {
        messageApi.warning('Ce rapport n\'est pas encore disponible pour le téléchargement');
        return;
      }

      const response = await fetch(getApiUrl(`/api/admin/reports/${report.id}/download`));
      if (!response.ok) throw new Error('Erreur lors du téléchargement');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rapport-${report.type.toLowerCase()}-${new Date(report.date).toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      messageApi.success('Rapport téléchargé avec succès');
    } catch (error) {
      console.error('Error downloading report:', error);
      messageApi.error('Erreur lors du téléchargement du rapport');
    }
  };

  // Preview report
  const handlePreviewReport = async (report: Report) => {
    try {
      if (!report.url) {
        messageApi.warning('Ce rapport n\'est pas encore disponible pour la prévisualisation');
        return;
      }

      const response = await fetch(getApiUrl(`/api/admin/reports/${report.id}/preview`));
      if (!response.ok) throw new Error('Erreur lors du chargement de la prévisualisation');

      const reportContent = await response.json();
      setPreviewModal({
        visible: true,
        report: { ...report, content: reportContent }
      });
    } catch (error) {
      console.error('Error previewing report:', error);
      messageApi.error('Erreur lors de la prévisualisation du rapport');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Généré': return 'green';
      case 'En_cours':
      case 'En cours': return 'orange';
      case 'Échec': return 'red';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Généré': return <CheckCircleOutlined />;
      case 'En_cours':
      case 'En cours': return <ClockCircleOutlined />;
      case 'Échec': return <ExclamationCircleOutlined />;
      default: return <ClockCircleOutlined />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const reportTypes = [
    { type: 'Ventes', title: 'Rapport de Ventes', icon: <DollarOutlined />, color: '#52c41a' },
    { type: 'Trajets', title: 'Rapport des Trajets', icon: <CarOutlined />, color: '#1890ff' },
    { type: 'Utilisateurs', title: 'Rapport Utilisateurs', icon: <UserOutlined />, color: '#722ed1' },
    { type: 'Réservations', title: 'Rapport Réservations', icon: <FileTextOutlined />, color: '#fa8c16' },
    { type: 'Satisfaction', title: 'Rapport Satisfaction', icon: <CheckCircleOutlined />, color: '#13c2c2' }
  ];

  return (
    <div className="p-6">
      {contextHolder}
      <Title level={2}>Rapports et Analyses</Title>
      
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card title={<Space><BarChartOutlined /><span>Générer un nouveau rapport</span></Space>}>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              {reportTypes.map((reportType) => (
                <Card key={reportType.type} size="small" hoverable>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-full" style={{ backgroundColor: `${reportType.color}20`, color: reportType.color }}>
                        {reportType.icon}
                      </div>
                      <div>
                        <Text strong>{reportType.title}</Text>
                      </div>
                    </div>
                    <Button
                      type="primary"
                      icon={<RiseOutlined />}
                      loading={generating === reportType.type}
                      onClick={() => handleGenerateReport(reportType.type as Report['type'])}
                      style={{ backgroundColor: reportType.color, borderColor: reportType.color }}
                    >
                      Générer
                    </Button>
                  </div>
                </Card>
              ))}
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title={<Space><FileTextOutlined /><span>Rapports Disponibles</span></Space>}>
            {loading ? (
              <div className="text-center py-8">
                <Spin size="large" />
                <div className="mt-4"><Text type="secondary">Chargement des rapports...</Text></div>
              </div>
            ) : reports.length === 0 ? (
              <Empty description="Aucun rapport disponible" />
            ) : (
              <List
                dataSource={reports}
                renderItem={(report) => (
                  <List.Item
                    actions={[
                      <Tooltip title="Prévisualiser" key="preview">
                        <Button
                          type="text"
                          icon={<EyeOutlined />}
                          onClick={() => handlePreviewReport(report)}
                          disabled={report.status !== 'Généré'}
                        />
                      </Tooltip>,
                      <Tooltip title="Télécharger" key="download">
                        <Button
                          type="text"
                          icon={<DownloadOutlined />}
                          onClick={() => handleDownloadReport(report)}
                          disabled={report.status !== 'Généré'}
                        />
                      </Tooltip>
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <Space>
                          <Text strong>{report.title}</Text>
                          <Tag color={getStatusColor(report.status)} icon={getStatusIcon(report.status)}>
                            {report.status}
                          </Tag>
                        </Space>
                      }
                      description={`${report.type} • ${formatDate(report.date)}`}
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
      </Row>

      <Modal
        title={<Space><EyeOutlined /><span>Prévisualisation du Rapport</span></Space>}
        open={previewModal.visible}
        onCancel={() => setPreviewModal({ visible: false, report: null })}
        footer={[
          <Button key="close" onClick={() => setPreviewModal({ visible: false, report: null })}>
            Fermer
          </Button>,
          previewModal.report && (
            <Button
              key="download"
              type="primary"
              icon={<DownloadOutlined />}
              onClick={() => handleDownloadReport(previewModal.report!)}
            >
              Télécharger
            </Button>
          )
        ]}
        width={800}
        destroyOnClose
      >
        {previewModal.report && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <Title level={4}>{previewModal.report.title}</Title>
              <Space>
                <Text type="secondary">Type: {previewModal.report.type}</Text>
                <Text type="secondary">Date: {formatDate(previewModal.report.date)}</Text>
              </Space>
            </div>

            {previewModal.report.content ? (
              <div className="space-y-4">
                {previewModal.report.summary && (
                  <Card title="Résumé" size="small">
                    <Row gutter={[16, 16]}>
                      {previewModal.report.summary.totalRevenue && (
                        <Col span={8}>
                          <Statistic
                            title="Revenus Totaux"
                            value={previewModal.report.summary.totalRevenue}
                            suffix="FCFA"
                            valueStyle={{ color: '#52c41a' }}
                          />
                        </Col>
                      )}
                      {previewModal.report.summary.totalBookings && (
                        <Col span={8}>
                          <Statistic
                            title="Réservations"
                            value={previewModal.report.summary.totalBookings}
                            valueStyle={{ color: '#1890ff' }}
                          />
                        </Col>
                      )}
                      {previewModal.report.summary.totalUsers && (
                        <Col span={8}>
                          <Statistic
                            title="Utilisateurs"
                            value={previewModal.report.summary.totalUsers}
                            valueStyle={{ color: '#722ed1' }}
                          />
                        </Col>
                      )}
                    </Row>
                  </Card>
                )}

                <Card title="Détails du Rapport" size="small">
                  <div className="max-h-96 overflow-y-auto">
                    <pre className="text-sm bg-gray-50 p-4 rounded">
                      {JSON.stringify(previewModal.report.content, null, 2)}
                    </pre>
                  </div>
                </Card>
              </div>
            ) : (
              <Empty description="Aperçu non disponible" />
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
