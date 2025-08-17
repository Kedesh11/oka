"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import { Button, Card, DatePicker, Drawer, Form, Select, Space, Statistic, Table, message as antdMessage, Modal } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { useApiUrl } from "@/hooks/use-api-url";
import SectionHeader from "@/components/dashboard/common/SectionHeader";
import ScrollablePanel from "@/components/dashboard/common/ScrollablePanel";
import type { Bus, Trajet, Voyage, Occupancy } from "@/components/dashboard/common/domain";
import { apiGet, apiPost } from "@/lib/apiClient";
import { BusSchema, TrajetSchema, VoyageSchema, OccupancySchema, ListResponse } from "@/components/dashboard/common/schemas";
import { z } from "zod";

export default function VoyagesManager() {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const [buses, setBuses] = useState<Pick<Bus, "id" | "name">[]>([]);
  const [trajets, setTrajets] = useState<Pick<Trajet, "id" | "depart" | "arrivee" | "heure">[]>([]);
  const [voyages, setVoyages] = useState<Voyage[]>([]);
  const [voyagesLoading, setVoyagesLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [selectedVoyage, setSelectedVoyage] = useState<Voyage | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [occupancy, setOccupancy] = useState<Occupancy | null>(null);
  const [filterDate, setFilterDate] = useState<Dayjs | null>(dayjs());
  const [filterTrajetId, setFilterTrajetId] = useState<number | undefined>(undefined);
  const [filterBusId, setFilterBusId] = useState<number | undefined>(undefined);
  const [createOpen, setCreateOpen] = useState(false);
  const { getApiUrl } = useApiUrl();

  const loadBuses = useCallback(async () => {
    try {
      // TODO: Filter buses by agenceId once authentication is implemented
      const raw = await apiGet<any>(getApiUrl("/api/fleet/buses"), { cache: "no-store" });
      const parsed = ListResponse(BusSchema).safeParse(raw);
      if (!parsed.success) throw new Error("Format de données bus invalide");
      setBuses((parsed.data.items || []).map((b) => ({ id: b.id, name: b.name })));
    } catch (e: any) {
      messageApi.error(e.message);
    }
  }, [getApiUrl, messageApi]);

  const loadVoyages = useCallback(async () => {
    try {
      setVoyagesLoading(true);
      const raw = await apiGet<any>(getApiUrl("/api/fleet/voyages"), { cache: "no-store" });
      const parsed = ListResponse(VoyageSchema).safeParse(raw);
      if (!parsed.success) throw new Error("Format de données voyages invalide");
      setVoyages(parsed.data.items || []);
    } catch (e: any) {
      messageApi.error(e.message);
    } finally {
      setVoyagesLoading(false);
    }
  }, [getApiUrl, messageApi]);

  const loadTrajets = useCallback(async () => {
    try {
      // TODO: Filter trajets by agenceId once authentication is implemented
      const raw = await apiGet<any>(getApiUrl("/api/agence/trajets"), { cache: "no-store" });
      const parsed = (Array.isArray(raw) ? { success: true, data: raw } : { success: false }) as any;
      const valid = parsed.success ? raw.filter((t: any) => TrajetSchema.safeParse(t).success) : [];
      setTrajets(valid.map((t: any) => ({ id: t.id, depart: t.depart, arrivee: t.arrivee, heure: t.heure })));
    } catch (e: any) {
      messageApi.error(e.message);
    }
  }, [getApiUrl, messageApi]);

  useEffect(() => {
    loadBuses();
    loadTrajets();
    loadVoyages();
  }, [loadBuses, loadTrajets, loadVoyages]);

  // Auto-refresh voyages periodically
  useEffect(() => {
    const id = setInterval(() => {
      loadVoyages();
    }, 30000); // 30s
    return () => clearInterval(id);
  }, [loadVoyages]);

  // Refresh on tab focus/visibility change
  useEffect(() => {
    const onFocus = () => loadVoyages();
    const onVisibility = () => { if (document.visibilityState === 'visible') loadVoyages(); };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [loadVoyages]);

  // When opening the create modal, preset the date
  useEffect(() => {
    if (createOpen) {
      form.resetFields();
      form.setFieldsValue({ date: dayjs() });
    }
  }, [createOpen, form]);

  const createVoyage = async () => {
    try {
      const values = await form.validateFields();
      const FormSchema = z.object({
        trajetId: z.number().int().positive(),
        busId: z.number().int().positive(),
        date: z.any().refine((v) => dayjs.isDayjs(v), { message: "Date invalide" }),
      });
      const parsed = FormSchema.safeParse(values);
      if (!parsed.success) {
        const fieldErrors = parsed.error.issues.map((iss) => ({
          name: iss.path as (string | number)[],
          errors: [iss.message],
        }));
        form.setFields(fieldErrors as any);
        return;
      }
      // Détection de conflit bus/date
      const hasConflict = (voyages || []).some(v => v.busId === values.busId && dayjs(v.date).isSame(values.date, "day"));
      if (hasConflict) {
        const proceed = await new Promise<boolean>((resolve) => {
          Modal.confirm({
            title: "Conflit de bus détecté",
            content: "Un autre voyage utilise déjà ce bus à cette date. Voulez-vous continuer?",
            okText: "Continuer",
            cancelText: "Annuler",
            onOk: () => resolve(true),
            onCancel: () => resolve(false),
          });
        });
        if (!proceed) return;
      }
      setLoading(true);
      const data = await apiPost<{ voyage: Voyage }>(getApiUrl("/api/fleet/voyages"), {
        trajetId: values.trajetId,
        busId: values.busId,
        date: (values.date as Dayjs).toDate().toISOString(),
      });
      messageApi.success("Voyage créé");
      setCreateOpen(false);
      form.resetFields();
      setOccupancy(null);
      // Recharger la liste et ouvrir le Drawer sur le voyage créé
      await loadVoyages();
      const createdId = data.voyage?.id;
      if (createdId) {
        const v = (voyages || []).find((x) => x.id === createdId);
        const selected: Voyage = v || { ...data.voyage } as Voyage;
        setSelectedVoyage(selected);
        setDrawerOpen(true);
        await refreshOccupancy(createdId);
      }
    } catch (e: any) {
      if (!e?.errorFields) messageApi.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshOccupancy = useCallback(async (voyageId?: number) => {
    const id = voyageId ?? selectedVoyage?.id;
    if (!id) return;
    try {
      const raw = await apiGet<any>(getApiUrl(`/api/fleet/voyages/${id}/occupancy`), { cache: "no-store" });
      const parsed = OccupancySchema.safeParse(raw);
      if (!parsed.success) throw new Error("Format de données KPIs invalide");
      setOccupancy(parsed.data);
    } catch (e: any) {
      messageApi.error(e.message);
    }
  }, [getApiUrl, messageApi, selectedVoyage?.id]);

  const autoAssign = useCallback(async (voyageId?: number) => {
    const id = voyageId ?? selectedVoyage?.id;
    if (!id) return;
    try {
      setLoading(true);
      const data = await apiPost<{ assigned: number; total: number }>(getApiUrl(`/api/fleet/voyages/${id}/auto-assign`));
      messageApi.success(`Assignés: ${data.assigned}/${data.total}`);
      await refreshOccupancy();
    } catch (e: any) {
      messageApi.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [getApiUrl, messageApi, selectedVoyage?.id, refreshOccupancy]);

  const filteredVoyages = useMemo(() => {
    const d = filterDate?.format("YYYY-MM-DD");
    return voyages.filter(v => {
      const matchesDate = d ? dayjs(v.date).format("YYYY-MM-DD") === d : true;
      const matchesTrajet = filterTrajetId ? v.trajetId === filterTrajetId : true;
      const matchesBus = filterBusId ? v.busId === filterBusId : true;
      return matchesDate && matchesTrajet && matchesBus;
    });
  }, [voyages, filterDate, filterTrajetId, filterBusId]);

  const openDrawerFor = (v: Voyage) => {
    setSelectedVoyage(v);
    setDrawerOpen(true);
    setOccupancy(null);
    refreshOccupancy(v.id);
  };

  return (
    <div className="space-y-4">
      {contextHolder}
      <SectionHeader
        title="Voyages"
        actions={(
          <Space>
            <Button type="primary" onClick={() => { loadBuses(); loadTrajets(); setCreateOpen(true); }}>
              Créer un voyage
            </Button>
          </Space>
        )}
      />

      <Modal
        title="Créer un voyage"
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        onOk={createVoyage}
        confirmLoading={loading}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Trajet" name="trajetId" rules={[{ required: true, message: "Requis" }]}>
            <Select
              style={{ width: "100%" }}
              options={trajets.map(t => ({ value: t.id, label: `${t.depart} - ${t.arrivee} (${t.heure})` }))}
              placeholder="Choisir un trajet"
              showSearch
              filterOption={(input, option) =>
                (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>
          <Form.Item label="Bus" name="busId" rules={[{ required: true, message: "Requis" }]}>
            <Select style={{ width: "100%" }} options={buses.map(b => ({ value: b.id, label: b.name }))} placeholder="Choisir un bus" />
          </Form.Item>
          <Form.Item label="Date" name="date" rules={[{ required: true, message: "Requis" }]}>
            <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>

      <Card size="small" title="Liste des voyages">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <DatePicker value={filterDate as any} onChange={(d) => setFilterDate(d)} />
          <Select
            allowClear
            placeholder="Filtrer par trajet"
            style={{ width: 240 }}
            value={filterTrajetId}
            onChange={(v) => setFilterTrajetId(v)}
            options={trajets.map(t => ({ value: t.id, label: `${t.depart} - ${t.arrivee} (${t.heure})` }))}
          />
          <Select
            allowClear
            placeholder="Filtrer par bus"
            style={{ width: 200 }}
            value={filterBusId}
            onChange={(v) => setFilterBusId(v)}
            options={buses.map(b => ({ value: b.id, label: b.name }))}
          />
        </div>
        <ScrollablePanel maxHeight="calc(100vh - 360px)">
          <Table
            size="middle"
            rowKey="id"
            loading={voyagesLoading}
            dataSource={filteredVoyages}
            pagination={{ pageSize: 10 }}
            columns={[
              {
                title: "Date",
                dataIndex: "date",
                render: (val: string) => dayjs(val).format("YYYY-MM-DD"),
              },
              {
                title: "Trajet",
                render: (_: any, r: any) => `${r.trajet?.depart} - ${r.trajet?.arrivee} (${r.trajet?.heure})`,
              },
              { title: "Bus", dataIndex: ["bus", "name"] },
              {
                title: "Actions",
                render: (_: any, r: any) => (
                  <Space>
                    <Button size="small" onClick={() => openDrawerFor(r)}>Voir remplissage</Button>
                    <Button size="small" type="primary" onClick={() => autoAssign(r.id)} loading={loading}>Auto-assigner</Button>
                  </Space>
                ),
              },
            ]}
          />
        </ScrollablePanel>
      </Card>

      <Drawer
        title={selectedVoyage ? `Remplissage du voyage #${selectedVoyage.id}` : "Remplissage"}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={480}
        destroyOnClose
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {selectedVoyage && `${selectedVoyage?.trajet?.depart} → ${selectedVoyage?.trajet?.arrivee} (${selectedVoyage?.trajet?.heure}) • Bus: ${selectedVoyage?.bus?.name}`}
            </div>
            {selectedVoyage && (
              <Button size="small" onClick={() => refreshOccupancy(selectedVoyage.id)}>Rafraîchir</Button>
            )}
          </div>
          {occupancy ? (
            <Card size="small">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Statistic title="Sièges" value={occupancy.totalSeats} />
                <Statistic title="Occupés" value={occupancy.taken} />
                <Statistic title="Libres" value={occupancy.free} />
                <Statistic title="%" value={Math.round(occupancy.percent * 100)} suffix="%" />
              </div>
            </Card>
          ) : (
            <div className="text-sm text-gray-500">Chargement des KPIs...</div>
          )}
        </div>
      </Drawer>
    </div>
  );
}
