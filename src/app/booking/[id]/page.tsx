"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Form, Input, InputNumber, Button, Upload, message, Card, Typography, Spin, Row, Col, Statistic, Modal, Descriptions } from 'antd';
import { UploadOutlined, UserOutlined, IdcardOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const fetchReservationData = async (id: string) => {
  const response = await fetch(`/api/reservations/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch reservation data');
  }
  return response.json();
};

const BookingDetailsPage = () => {
  const [form] = Form.useForm();
  const router = useRouter();
  const params = useParams();
  const reservationId = params.id as string;

  const [reservation, setReservation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [updatedReservation, setUpdatedReservation] = useState<any>(null);
  const [paying, setPaying] = useState(false);

  const [adults, setAdults] = useState(0);
  const [children, setChildren] = useState(0);

  useEffect(() => {
    if (reservationId) {
      fetchReservationData(reservationId)
        .then((data) => {
          setReservation(data);
          // Initialize with all travelers as adults by default
          const initialAdults = data.nbVoyageurs;
          setAdults(initialAdults);
          setChildren(0);
          form.setFieldsValue({ adults: initialAdults, children: 0 });
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          message.error("Impossible de charger les détails de la réservation.");
          setLoading(false);
        });
    }
  }, [reservationId, form]);

  const handleValuesChange = (changedValues: any, allValues: any) => {
    const { adults, children } = allValues;
    if (adults !== undefined) setAdults(adults);
    if (children !== undefined) setChildren(children);
  };

  const onFinish = async (values: any) => {
    // Ensure the upload is finished and the URL is available
    if (!values.identityDocument || values.identityDocument.length === 0 || !values.identityDocument[0].response?.url) {
      message.error("Veuillez attendre la fin du téléversement ou vérifier le fichier.");
      return;
    }
    const identityDocumentUrl = values.identityDocument[0].response.url;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/reservations/${reservationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client: values.client,
          telephone: values.telephone,
          adultCount: values.adults,
          childrenCount: values.children,
          identityDocumentUrl: identityDocumentUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update reservation');
      }

      const result = await response.json();
      setUpdatedReservation(result);
      message.success('Détails enregistrés.');
      setIsModalVisible(true); // Show the summary modal

    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue.';
      message.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Spin size="large" /></div>;
  }

  const totalTravelers = reservation?.nbVoyageurs || 0;
  const isDistributionCorrect = adults + children === totalTravelers;

  const handlePayment = async () => {
    if (!updatedReservation) return;

    setPaying(true);
    try {
      const response = await fetch(`/api/reservations/${updatedReservation.id}/pay`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Payment failed');
      }

      message.success('Paiement réussi ! Vous allez être redirigé.');
      router.push(`/booking/confirmation/${updatedReservation.id}`);

    } catch (error) {
      console.error('Payment error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue lors du paiement.';
      message.error(errorMessage);
    } finally {
      setPaying(false);
      setIsModalVisible(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card>
        <Title level={2}>Finaliser votre réservation</Title>
        <Paragraph type="secondary">Trajet : {reservation.trajet.depart} → {reservation.trajet.arrivee}</Paragraph>

        <Row gutter={32} className="mt-8">
          <Col xs={24} md={14}>
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              onValuesChange={handleValuesChange}
              initialValues={{ adults: totalTravelers, children: 0 }}
            >
              <Title level={4}>1. Répartition des voyageurs</Title>
              <Paragraph>Veuillez indiquer le nombre d'adultes et d'enfants. Le total doit correspondre à <Text strong>{totalTravelers} voyageurs</Text>.</Paragraph>
              
              <Form.Item label="Adultes">
                <Form.Item
                  name="adults"
                  noStyle
                  rules={[{ required: true, message: 'Requis' }]}
                >
                  <InputNumber min={0} max={totalTravelers} className="w-full" />
                </Form.Item>
              </Form.Item>

              <Form.Item label="Enfants (moins de 12 ans)">
                <Form.Item
                  name="children"
                  noStyle
                  rules={[{ required: true, message: 'Requis' }]}
                >
                  <InputNumber min={0} max={totalTravelers} className="w-full" />
                </Form.Item>
              </Form.Item>

              {!isDistributionCorrect && (
                <Text type="danger">Le nombre total de voyageurs ({adults + children}) ne correspond pas aux {totalTravelers} prévus.</Text>
              )}

              <Title level={4} className="mt-8">2. Informations du voyageur principal</Title>
              <Form.Item
                label="Nom complet"
                name="client"
                rules={[{ required: true, message: 'Le nom du client est requis' }]}
              >
                <Input placeholder="ex: John Doe" />
              </Form.Item>

              <Form.Item
                label="Numéro de téléphone"
                name="telephone"
                rules={[{ required: true, message: 'Le numéro de téléphone est requis' }]}
              >
                <Input placeholder="ex: +241 00 00 00 00" />
              </Form.Item>

              <Title level={4} className="mt-8">3. Pièce d'identité du voyageur principal</Title>
              <Paragraph>Veuillez téléverser une pièce d'identité (CNI, passeport) pour le passager principal.</Paragraph>
              <Form.Item
                name="identityDocument"
                valuePropName="fileList"
                getValueFromEvent={(e) => (Array.isArray(e) ? e : e && e.fileList)}
                rules={[{ required: true, message: 'La pièce d\'identité est requise' }]}
              >
                <Upload name="file" action="/api/upload" listType="picture" maxCount={1}>
                  <Button icon={<UploadOutlined />}>Téléverser</Button>
                </Upload>
              </Form.Item>

              <Form.Item className="mt-8">
                <Button type="primary" htmlType="submit" loading={submitting} disabled={!isDistributionCorrect}>
                  Valider et voir le récapitulatif
                </Button>
              </Form.Item>
            </Form>
          </Col>

          <Col xs={24} md={10}>
            <Card title="Résumé du coût" bordered={false} className="bg-gray-50">
              <Statistic title="Prix Adulte" value={reservation.trajet.prixAdulte} suffix="FCFA" prefix={<UserOutlined />} />
              <Statistic title="Prix Enfant" value={reservation.trajet.prixEnfant} suffix="FCFA" prefix={<UserOutlined />} className="mt-4" />
              <hr className="my-4" />
              <Statistic
                title="Total estimé"
                value={adults * reservation.trajet.prixAdulte + children * reservation.trajet.prixEnfant}
                suffix="FCFA"
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
        </Row>
      </Card>

      {updatedReservation && (
        <Modal
          title="Récapitulatif de votre réservation"
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={[
            <Button key="back" onClick={() => setIsModalVisible(false)}>
              Modifier
            </Button>,
            <Button key="submit" type="primary" onClick={handlePayment} loading={paying}>
              Confirmer et Payer
            </Button>,
          ]}
        >
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Client">{updatedReservation.client}</Descriptions.Item>
            <Descriptions.Item label="Téléphone">{updatedReservation.telephone}</Descriptions.Item>
            <Descriptions.Item label="Trajet">{reservation.trajet.depart} → {reservation.trajet.arrivee}</Descriptions.Item>
            <Descriptions.Item label="Adultes">{updatedReservation.adultCount}</Descriptions.Item>
            <Descriptions.Item label="Enfants">{updatedReservation.childrenCount}</Descriptions.Item>
            <Descriptions.Item label="Montant Total">
              <Text strong style={{ color: '#1890ff' }}>{updatedReservation.totalAmount} FCFA</Text>
            </Descriptions.Item>
          </Descriptions>
        </Modal>
      )}
    </div>
  );
};

export default BookingDetailsPage;
