"use client";

import React, { useMemo } from "react";
import { Card, Typography, Button, Space } from "antd";
import { useSearchParams, useRouter } from "next/navigation";

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
          <Space>
            <Button type="primary" onClick={() => router.push("/recherche")}>Nouvelle recherche</Button>
            <Button onClick={() => router.push("/")}>Retour à l'accueil</Button>
          </Space>
        </Space>
      </Card>
    </div>
  );
}
