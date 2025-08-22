"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, Typography, Spin, Alert, Button, Descriptions, Row, Col } from 'antd';
import { CheckCircleOutlined, DownloadOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const fetchReservationData = async (id: string) => {
  const response = await fetch(`/api/reservations/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch reservation data');
  }
  return response.json();
};

const ConfirmationPage = () => {
  const params = useParams();
  const reservationId = params.id as string;

  const [reservation, setReservation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (reservationId) {
      fetchReservationData(reservationId)
        .then(data => {
          setReservation(data);
          setLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [reservationId]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Spin size="large" /></div>;
  }

  if (error) {
    return <div className="container mx-auto p-8"><Alert message="Erreur" description={error} type="error" showIcon /></div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8 bg-gray-50 min-h-screen">
      <Card className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <CheckCircleOutlined style={{ fontSize: '64px', color: '#52c41a' }} />
          <Title level={2} className="mt-4">Réservation confirmée !</Title>
          <Paragraph>Votre paiement a été accepté et votre réservation est confirmée. Vous pouvez télécharger votre billet électronique ci-dessous.</Paragraph>
        </div>

        <Title level={4} className="mb-4">Détails de la réservation</Title>
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Numéro de réservation">{reservation.id}</Descriptions.Item>
          <Descriptions.Item label="Client">{reservation.client}</Descriptions.Item>
          <Descriptions.Item label="Trajet">{reservation.trajet.depart} → {reservation.trajet.arrivee}</Descriptions.Item>
          <Descriptions.Item label="Date">{new Date(reservation.trajet.dateDepart).toLocaleDateString('fr-FR')}</Descriptions.Item>
          <Descriptions.Item label="Voyageurs">{reservation.nbVoyageurs} ({reservation.adultCount} adultes, {reservation.childrenCount} enfants)</Descriptions.Item>
          <Descriptions.Item label="Montant payé">
            <Text strong style={{ color: '#1890ff' }}>{reservation.totalAmount} FCFA</Text>
          </Descriptions.Item>
        </Descriptions>

        <div className="text-center mt-8">
          <Button 
            type="primary" 
            icon={<DownloadOutlined />} 
            size="large"
            href={`/api/reservations/${reservation.id}/ticket`}
          >
            Télécharger mon billet
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ConfirmationPage;
