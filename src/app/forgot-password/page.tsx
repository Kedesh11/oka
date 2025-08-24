"use client";
import React from "react";
import { Card, Form, Input, Button, Typography, message } from "antd";
import { MailOutlined } from "@ant-design/icons";

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
    <div className="min-h-screen bg-auth-kani flex flex-col items-center justify-center px-4 py-10">
      <div className="text-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold text-black">Mot de passe oublié</h1>
        <p className="text-slate-500 mt-1">Nous vous aiderons à récupérer votre compte</p>
      </div>

      <Card style={{ width: 460, borderRadius: 12 }} bodyStyle={{ padding: 24 }} className="shadow-md card-kani">
        <div className="text-center text-base font-medium mb-2">Réinitialiser le mot de passe</div>
        <p className="text-center text-slate-500 text-sm mb-4">
          Entrez votre adresse email pour recevoir un lien de réinitialisation
        </p>
        {!sent ? (
          <Form layout="vertical" onFinish={onFinish}>
            <Form.Item name="email" label="Adresse email" rules={[{ required: true, message: "Email requis" }, { type: "email" }]}>
              <Input className="focus-kani" placeholder="votre@email.com" prefix={<MailOutlined className="text-slate-400" />} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block className="btn-kani">
                Envoyer le lien de réinitialisation
              </Button>
            </Form.Item>
            <Button href="/login" block className="btn-kani-outline">
              Retour à la connexion
            </Button>
          </Form>
        ) : (
          <Typography.Paragraph className="text-center text-slate-700">
            Si un compte existe pour cet email, un message contenant un lien de réinitialisation a été envoyé.
          </Typography.Paragraph>
        )}
      </Card>
    </div>
  );
}
