"use client";

import React, { useMemo } from "react";
import { Card, Typography, Button, Space } from "antd";
import { useSearchParams, useRouter } from "next/navigation";
import { SERVICE_FEE_FCFA, CONVOCATION_MINUTES_BEFORE } from "@/config/business";

const { Title, Text } = Typography;

export default function ConfirmationPage() {
  const params = useSearchParams();
  const router = useRouter();
  const id = useMemo(() => params.get("id"), [params]);

  return (
    <div className="max-w-xl mx-auto p-6">
      <Card>
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <Title level={3}>Réservation confirmée</Title>
          {id ? (
            <Text>Votre numéro de réservation est: <b>{id}</b></Text>
          ) : (
            <Text>Votre réservation a été enregistrée.</Text>
          )}
          <Text type="secondary">
            Frais de service appliqués: {SERVICE_FEE_FCFA.toLocaleString()} FCFA. Convocation: {CONVOCATION_MINUTES_BEFORE} minutes avant l'heure de départ.
          </Text>
          <Space>
            <Button type="primary" onClick={() => router.push("/recherche/billet")}>Voir / Imprimer le billet</Button>
            <Button onClick={() => router.push("/recherche")}>Nouvelle recherche</Button>
            <Button onClick={() => router.push("/")}>Retour à l'accueil</Button>
          </Space>
        </Space>
      </Card>
    </div>
  );
}
