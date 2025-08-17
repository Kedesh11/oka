"use client";

import React, { useEffect, useState } from "react";
import { Button, Modal, Form, Input, InputNumber, Table, message as antdMessage, Space, Tag } from "antd";

type Bus = {
  id: number;
  agenceId: number;
  name: string;
  type: string;
  seatCount: number;
  seatsPerRow: number;
  createdAt: string;
};

export default function FleetManager() {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Bus[]>([]);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const fetchBuses = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/fleet/buses", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur de chargement");
      setItems(data.items || []);
    } catch (e: any) {
      messageApi.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuses();
  }, []);

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      const res = await fetch("/api/fleet/buses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Création impossible");
      messageApi.success("Bus créé");
      setOpen(false);
      form.resetFields();
      fetchBuses();
    } catch (e: any) {
      if (e?.errorFields) return; // validation error
      messageApi.error(e.message);
    }
  };

  return (
    <div className="space-y-4">
      {contextHolder}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Flotte</h2>
        <Button type="primary" onClick={() => setOpen(true)}>+ Ajouter un bus</Button>
      </div>

      <Table
        size="middle"
        loading={loading}
        rowKey="id"
        dataSource={items}
        columns={[
          { title: "Nom", dataIndex: "name" },
          { title: "Type", dataIndex: "type" },
          { title: "Sièges", dataIndex: "seatCount" },
          { title: "Par rangée", dataIndex: "seatsPerRow" },
          {
            title: "Statut",
            render: () => <Tag color="blue">actif</Tag>,
          },
        ]}
      />

      <Modal
        title="Nouveau bus"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={handleCreate}
        okText="Créer"
      >
        <Form form={form} layout="vertical" initialValues={{ seatsPerRow: 4 }}>
          <Form.Item label="Nom" name="name" rules={[{ required: true, message: "Nom requis" }]}>
            <Input placeholder="Nom ou immatriculation" />
          </Form.Item>
          <Form.Item label="Type" name="type" rules={[{ required: true, message: "Type requis" }]}>
            <Input placeholder="Coaster, Hiace, ..." />
          </Form.Item>
          <Space size="middle" style={{ width: "100%" }}>
            <Form.Item label="Nombre de sièges" name="seatCount" rules={[{ required: true, message: "Nombre requis" }]}>
              <InputNumber min={1} style={{ width: 160 }} />
            </Form.Item>
            <Form.Item label="Sièges par rangée" name="seatsPerRow" rules={[{ required: true, message: "Requis" }]}>
              <InputNumber min={1} max={6} style={{ width: 160 }} />
            </Form.Item>
          </Space>
          <Form.Item label="Layout (optionnel)">
            <Input.TextArea name="layout" placeholder="JSON du layout" rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
