"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Button, Card, DatePicker, Form, InputNumber, Select, Space, Statistic, message as antdMessage } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { useApiUrl } from "@/hooks/use-api-url";

export default function VoyagesManager() {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [buses, setBuses] = useState<{ id: number; name: string }[]>([]);
  const [trajets, setTrajets] = useState<{ id: number; depart: string; arrivee: string; heure: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [voyageId, setVoyageId] = useState<number | null>(null);
  const [occupancy, setOccupancy] = useState<{ totalSeats: number; taken: number; free: number; percent: number } | null>(null);
  const { getApiUrl } = useApiUrl();

  const loadBuses = async () => {
    try {
      // TODO: Filter buses by agenceId once authentication is implemented
      const res = await fetch(getApiUrl("/api/fleet/buses"), { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur de chargement des bus");
      setBuses((data.items || []).map((b: any) => ({ id: b.id, name: b.name })));
    } catch (e: any) {
      messageApi.error(e.message);
    }
  };

  const loadTrajets = async () => {
    try {
      // TODO: Filter trajets by agenceId once authentication is implemented
      const res = await fetch(getApiUrl("/api/agence/trajets"), { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur de chargement des trajets");
      setTrajets((data || []).map((t: any) => ({ id: t.id, depart: t.depart, arrivee: t.arrivee, heure: t.heure })));
    } catch (e: any) {
      messageApi.error(e.message);
    }
  };

  useEffect(() => {
    loadBuses();
    loadTrajets();
  }, [getApiUrl]);

  const createVoyage = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const res = await fetch(getApiUrl("/api/fleet/voyages"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trajetId: values.trajetId,
          busId: values.busId,
          date: (values.date as Dayjs).toDate().toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Création impossible");
      setVoyageId(data.voyage.id);
      messageApi.success("Voyage créé");
      form.resetFields();
      setOccupancy(null);
    } catch (e: any) {
      if (!e?.errorFields) messageApi.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshOccupancy = async () => {
    if (!voyageId) return;
    try {
      const res = await fetch(getApiUrl(`/api/fleet/voyages/${voyageId}/occupancy`), { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur occupancy");
      setOccupancy(data);
    } catch (e: any) {
      messageApi.error(e.message);
    }
  };

  const autoAssign = async () => {
    if (!voyageId) return;
    try {
      setLoading(true);
      const res = await fetch(getApiUrl(`/api/fleet/voyages/${voyageId}/auto-assign`), { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Auto-assign échoué");
      messageApi.success(`Assignés: ${data.assigned}/${data.total}`);
      await refreshOccupancy();
    } catch (e: any) {
      messageApi.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {contextHolder}
      <h2 className="text-lg font-semibold">Voyages</h2>

      <Form form={form} layout="inline" initialValues={{ date: dayjs() }}>
        <Form.Item label="Trajet" name="trajetId" rules={[{ required: true, message: "Requis" }]}>
          <Select
            style={{ width: 220 }}
            options={trajets.map(t => ({ value: t.id, label: `${t.depart} - ${t.arrivee} (${t.heure})` }))}
            placeholder="Choisir un trajet"
            showSearch
            filterOption={(input, option) =>
              (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
            }
          />
        </Form.Item>
        <Form.Item label="Bus" name="busId" rules={[{ required: true, message: "Requis" }]}>
          <Select style={{ width: 220 }} options={buses.map(b => ({ value: b.id, label: b.name }))} placeholder="Choisir un bus" />
        </Form.Item>
        <Form.Item label="Date" name="date" rules={[{ required: true, message: "Requis" }]}>
          <DatePicker format="YYYY-MM-DD" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={createVoyage} loading={loading}>
            Créer le voyage
          </Button>
        </Form.Item>
      </Form>

      <div className="flex items-center gap-3">
        <InputNumber
          placeholder="Voyage ID"
          value={voyageId ?? undefined}
          onChange={(v) => setVoyageId((v as number) || null)}
          min={1}
        />
        <Button onClick={refreshOccupancy}>Rafraîchir remplissage</Button>
        <Button type="primary" onClick={autoAssign} disabled={!voyageId} loading={loading}>
          Auto-assigner
        </Button>
      </div>

      {occupancy && (
        <Card size="small" title={`Remplissage du voyage ${voyageId}`}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Statistic title="Sièges" value={occupancy.totalSeats} />
            <Statistic title="Occupés" value={occupancy.taken} />
            <Statistic title="Libres" value={occupancy.free} />
            <Statistic title="%" value={Math.round(occupancy.percent * 100)} suffix="%" />
          </div>
        </Card>
      )}
    </div>
  );
}
