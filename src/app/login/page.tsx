"use client";
import React from "react";
import { Card, Form, Input, Button, Typography, message } from "antd";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: values.email,
        password: values.password,
        callbackUrl,
      });
      if (res?.ok) {
        message.success("Connexion réussie");
        router.push(callbackUrl);
      } else {
        message.error("Identifiants invalides");
      }
    } catch (e) {
      message.error("Erreur lors de la connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <Card title="Connexion" style={{ width: 380 }}>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item name="email" label="Email" rules={[{ required: true, message: "Email requis" }, { type: "email" }]}>
            <Input placeholder="vous@exemple.com" />
          </Form.Item>
          <Form.Item name="password" label="Mot de passe" rules={[{ required: true, message: "Mot de passe requis" }]}>
            <Input.Password placeholder="••••••••" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Se connecter
            </Button>
          </Form.Item>
          <Typography.Link href="/forgot-password">Mot de passe oublié ?</Typography.Link>
        </Form>
      </Card>
    </div>
  );
}
