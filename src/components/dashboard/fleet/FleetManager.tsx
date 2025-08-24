"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Button, Modal, Form, Input, InputNumber, Table, message as antdMessage, Space, Tag } from "antd";
import { useApiUrl } from "@/hooks/use-api-url";
import SectionHeader from "@/components/dashboard/common/SectionHeader";
import ScrollablePanel from "@/components/dashboard/common/ScrollablePanel";
import type { Bus } from "@/components/dashboard/common/domain";
import { apiGet, apiPost } from "@/lib/apiClient";
import { BusSchema, ListResponse } from "@/components/dashboard/common/schemas";
import { z } from "zod";

// Bus type imported from domain

export default function FleetManager() {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Bus[]>([]);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const { getApiUrl } = useApiUrl();
  const [agenceId, setAgenceId] = useState<number | null>(null);

  const fetchBuses = useCallback(async () => {
    setLoading(true);
    try {
      // TODO: Filter buses by agenceId once authentication is implemented
      const raw = await apiGet<any>(getApiUrl("/api/fleet/buses"), { cache: "no-store" });
      const parsed = ListResponse(BusSchema).safeParse(raw);
      if (!parsed.success) throw new Error("Format de données bus invalide");
      setItems(parsed.data.items || []);
    } catch (e: any) {
      messageApi.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [getApiUrl, messageApi]);

  useEffect(() => {
    // Prefetch agence profile to get agenceId
    (async () => {
      try {
        const agency = await apiGet<any>(getApiUrl("/api/agence/profile"), { cache: "no-store" });
        if (agency?.id) setAgenceId(agency.id);
      } catch (e: any) {
        // Non bloquant pour la liste, mais requis pour la création
        setAgenceId(null);
      }
      fetchBuses();
    })();
  }, [fetchBuses]);

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      const FormSchema = z.object({
        name: z.string().min(1, "Nom requis"),
        type: z.string().optional(),
        seatCount: z.number().int().positive({ message: "Nombre de sièges > 0" }),
        seatsPerRow: z.number().int().min(1).max(6).optional(),
      });
      const formParsed = FormSchema.safeParse(values);
      if (!formParsed.success) {
        const fieldErrors = formParsed.error.issues.map((iss) => ({
          name: iss.path as (string | number)[],
          errors: [iss.message],
        }));
        form.setFields(fieldErrors as any);
        return;
      }
      if (!agenceId) {
        messageApi.error("Agence introuvable: impossible de créer un bus");
        return;
      }

      const created = await apiPost<any>(getApiUrl("/api/fleet/buses"), { ...values, agenceId });
      const createdParsed = BusSchema.safeParse(created);
      if (!createdParsed.success) throw new Error("Réponse de création de bus invalide");
      messageApi.success("Bus créé avec succès");
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
      <SectionHeader
        title={<span className="text-lg font-semibold">Flotte</span>}
        actions={<Button type="primary" onClick={() => setOpen(true)}>+ Ajouter un bus</Button>}
      />

      <ScrollablePanel maxHeight="calc(100vh - 240px)">
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
              render: () => <Tag color="blue">actif</Tag>, // Assuming all buses are active for now
            },
          ]}
        />
      </ScrollablePanel>

      <Modal
        title="Nouveau bus"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={handleCreate}
        okText="Créer"
        styles={{ body: { maxHeight: '70vh', overflowY: 'auto' } }}
        style={{ top: 24 }}
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
          <Form.Item label="Layout (optionnel)" name="layout">
            <Input.TextArea placeholder="JSON du layout" rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
