"use client";
import React from "react";
import { Card, Form, Input, Button, Typography, message, Checkbox } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
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
    <div className="min-h-screen bg-auth-kani flex flex-col items-center justify-center px-4 py-10">
      <div className="text-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold text-black">Bienvenue sur Kani Voyage</h1>
        <p className="text-slate-500 mt-1">Connectez-vous à votre compte</p>
      </div>

      <Card
        style={{ width: 420, borderRadius: 12 }}
        bodyStyle={{ padding: 24 }}
        className="shadow-md card-kani"
      >
        <div className="text-center text-base font-medium mb-2">Connexion</div>
        <p className="text-center text-slate-500 text-sm mb-4">
          Entrez vos informations pour accéder à votre espace
        </p>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item name="email" label="Email" rules={[{ required: true, message: "Email requis" }, { type: "email" }]}>
            <Input className="focus-kani" placeholder="votre@email.com" prefix={<MailOutlined className="text-slate-400" />} />
          </Form.Item>
          <Form.Item name="password" label="Mot de passe" rules={[{ required: true, message: "Mot de passe requis" }]}>
            <Input.Password className="focus-kani" placeholder="••••••••" prefix={<LockOutlined className="text-slate-400" />} />
          </Form.Item>

          <div className="flex items-center justify-between mb-3">
            <Checkbox>Se souvenir de moi</Checkbox>
            <Typography.Link href="/forgot-password" style={{ color: '#00B140' }}>Mot de passe oublié ?</Typography.Link>
          </div>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              className="btn-kani"
            >
              Se connecter
            </Button>
          </Form.Item>

          <div className="text-center text-sm text-slate-600">
            Pas encore de compte ? {" "}
            <Typography.Link href="#" style={{ color: '#00B140' }}>Créer un compte</Typography.Link>
          </div>
        </Form>
      </Card>
    </div>
  );
}
