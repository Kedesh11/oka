"use client";
import React from "react";
import { Card, Form, Input, Button, Typography, message } from "antd";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email }),
      });
      if (res.ok) {
        setSent(true);
        message.success("Si un compte existe, un email a été envoyé");
      } else {
        const data = await res.json().catch(() => ({}));
        message.error(data.error || "Erreur serveur");
      }
    } catch (e) {
      message.error("Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <Card title="Mot de passe oublié" style={{ width: 420 }}>
        {!sent ? (
          <Form layout="vertical" onFinish={onFinish}>
            <Form.Item name="email" label="Email" rules={[{ required: true, message: "Email requis" }, { type: "email" }]}>
              <Input placeholder="vous@exemple.com" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block>
                Envoyer le lien de réinitialisation
              </Button>
            </Form.Item>
            <Typography.Link href="/login">Retour à la connexion</Typography.Link>
          </Form>
        ) : (
          <Typography.Paragraph>
            Si un compte existe pour cet email, un message contenant un lien de réinitialisation a été envoyé.
          </Typography.Paragraph>
        )}
      </Card>
    </div>
  );
}
