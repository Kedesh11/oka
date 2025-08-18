"use client";
import React from "react";
import { Card, Form, Input, Button, Typography, message } from "antd";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function ChangePasswordPage() {
  const { status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login?callbackUrl=" + encodeURIComponent("/account/change-password"));
    }
  }, [status, router]);

  const onFinish = async (values: any) => {
    if (values.newPassword !== values.confirm) {
      message.error("Les mots de passe ne correspondent pas");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword: values.oldPassword, newPassword: values.newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        message.success("Mot de passe modifié avec succès");
        router.push("/dashboard");
      } else {
        message.error(data.error || "Échec du changement de mot de passe");
      }
    } catch (e) {
      message.error("Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return null;
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <Card title="Changer le mot de passe" style={{ width: 420 }}>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item name="oldPassword" label="Mot de passe actuel" rules={[{ required: true, message: "Requis" }]}>
            <Input.Password placeholder="••••••••" />
          </Form.Item>
          <Form.Item name="newPassword" label="Nouveau mot de passe" rules={[{ required: true, message: "Requis" }]}>
            <Input.Password placeholder="••••••••" />
          </Form.Item>
          <Form.Item name="confirm" label="Confirmer le mot de passe" rules={[{ required: true, message: "Requis" }]}>
            <Input.Password placeholder="••••••••" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Mettre à jour
            </Button>
          </Form.Item>
          <Typography.Link href="/dashboard">Retour au dashboard</Typography.Link>
        </Form>
      </Card>
    </div>
  );
}
