"use client";
import React from "react";
import { Card, Form, Input, Button, Typography, message } from "antd";
import { useRouter, useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const onFinish = async (values: any) => {
    if (values.password !== values.confirm) {
      message.error("Les mots de passe ne correspondent pas");
      return;
    }
    if (!token) {
      message.error("Lien invalide");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: values.password }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        message.success("Mot de passe réinitialisé. Vous pouvez vous connecter.");
        router.push("/login");
      } else {
        message.error(data.error || "Échec de la réinitialisation");
      }
    } catch (e) {
      message.error("Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <Card title="Réinitialiser le mot de passe" style={{ width: 420 }}>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item name="password" label="Nouveau mot de passe" rules={[{ required: true, message: "Requis" }]}>
            <Input.Password placeholder="••••••••" />
          </Form.Item>
          <Form.Item name="confirm" label="Confirmer le mot de passe" rules={[{ required: true, message: "Requis" }]}>
            <Input.Password placeholder="••••••••" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Changer le mot de passe
            </Button>
          </Form.Item>
          <Typography.Link href="/login">Retour à la connexion</Typography.Link>
        </Form>
      </Card>
    </div>
  );
}
