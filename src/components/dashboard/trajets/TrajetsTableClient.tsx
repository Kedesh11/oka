"use client";

import * as React from "react";
import type { Trajet } from "@prisma/client";
import { Table, Modal, Button, Input, Space, Tag, Popconfirm, Select, TimePicker, InputNumber } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import { GABON_CITIES } from "@/data/gabonCities";

export type CreateAction = (formData: FormData) => void | Promise<void>;
export type UpdateAction = (formData: FormData) => void | Promise<void>;
export type DeleteAction = (formData: FormData) => void | Promise<void>;

type Props = {
  trajets: Trajet[];
  onCreate: CreateAction;
  onUpdate: UpdateAction;
  onDelete: DeleteAction;
};

export default function TrajetsTableClient({ trajets, onCreate, onUpdate, onDelete }: Props) {
  const [openCreate, setOpenCreate] = React.useState(false);
  const [editTrajet, setEditTrajet] = React.useState<Trajet | null>(null);
  const handleDelete = async (id: number) => {
    const fd = new FormData();
    fd.append("id", String(id));
    await onDelete(fd);
  };

  // Create form state (for AntD controls -> hidden inputs)
  const [createDepart, setCreateDepart] = React.useState<string | undefined>(undefined);
  const [createArrivee, setCreateArrivee] = React.useState<string | undefined>(undefined);
  const [createHeure, setCreateHeure] = React.useState<Dayjs | null>(null);
  const [createStatut, setCreateStatut] = React.useState<string>("actif");
  const [createPrixAdulte, setCreatePrixAdulte] = React.useState<number | null>(null);
  const [createPrixEnfant, setCreatePrixEnfant] = React.useState<number | null>(null);

  // Edit form state
  const [editDepart, setEditDepart] = React.useState<string | undefined>(undefined);
  const [editArrivee, setEditArrivee] = React.useState<string | undefined>(undefined);
  const [editHeure, setEditHeure] = React.useState<Dayjs | null>(null);
  const [editStatut, setEditStatut] = React.useState<string | undefined>(undefined);
  const [editPrixAdulte, setEditPrixAdulte] = React.useState<number | null>(null);
  const [editPrixEnfant, setEditPrixEnfant] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (openCreate) {
      setCreateDepart(undefined);
      setCreateArrivee(undefined);
      setCreateHeure(null);
      setCreateStatut("actif");
      setCreatePrixAdulte(null);
      setCreatePrixEnfant(null);
    }
  }, [openCreate]);

  React.useEffect(() => {
    if (editTrajet) {
      setEditDepart(editTrajet.depart ?? undefined);
      setEditArrivee(editTrajet.arrivee ?? undefined);
      setEditHeure(editTrajet.heure ? dayjs(editTrajet.heure, "HH:mm") : null);
      setEditStatut(editTrajet.statut ?? "actif");
      setEditPrixAdulte(editTrajet.prixAdulte ?? null);
      setEditPrixEnfant(editTrajet.prixEnfant ?? null);
    } else {
      setEditDepart(undefined);
      setEditArrivee(undefined);
      setEditHeure(null);
      setEditStatut(undefined);
      setEditPrixAdulte(null);
      setEditPrixEnfant(null);
    }
  }, [editTrajet]);

  const columns = [
    { title: "Numéro", dataIndex: "id", key: "id", width: 80 },
    { title: "Départ", dataIndex: "depart", key: "depart" },
    { title: "Arrivée", dataIndex: "arrivee", key: "arrivee" },
    { title: "Date/Heure", dataIndex: "heure", key: "heure" },
    {
      title: "Adulte",
      dataIndex: "prixAdulte",
      key: "prixAdulte",
      render: (v: number) => new Intl.NumberFormat("fr-FR").format(v),
    },
    {
      title: "Enfant",
      dataIndex: "prixEnfant",
      key: "prixEnfant",
      render: (v: number) => new Intl.NumberFormat("fr-FR").format(v),
    },
    {
      title: "Statut",
      dataIndex: "statut",
      key: "statut",
      render: (value: string) => (
        <Tag color={value === "actif" ? "green" : "default"}>{value}</Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      align: "right" as const,
      render: (_: any, record: Trajet) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => setEditTrajet(record)}
          />
          <Popconfirm
            title="Supprimer ce trajet ?"
            okText="Oui"
            cancelText="Non"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-base font-medium">Trajets</div>
          <div className="text-xs text-muted-foreground">Liste des trajets enregistrés</div>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpenCreate(true)}>
          Ajouter un trajet
        </Button>
      </div>

      {/* Create Modal */}
      <Modal
        title="Ajouter un trajet"
        open={openCreate}
        onCancel={() => setOpenCreate(false)}
        footer={null}
        destroyOnHidden
      >
        <form
          action={async (fd) => {
            await onCreate(fd);
            setOpenCreate(false);
          }}
          className="space-y-3"
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {/* AntD Select with autocomplete for cities */}
            <div className="col-span-1">
              <label className="mb-1 block text-xs font-bold text-black">Départ</label>
              <Select
                showSearch
                placeholder="Choisir la ville de départ"
                options={GABON_CITIES.map((c) => ({ value: c, label: c }))}
                value={createDepart}
                onChange={(v) => setCreateDepart(v)}
                filterOption={(input, option) =>
                  (option?.label as string).toLowerCase().includes(input.toLowerCase())
                }
                size="middle"
                style={{ width: "100%" }}
              />
              <input type="hidden" name="depart" value={createDepart ?? ""} />
            </div>
            <div className="col-span-1">
              <label className="mb-1 block text-xs font-bold text-black">Arrivée</label>
              <Select
                showSearch
                placeholder="Choisir la ville d'arrivée"
                options={GABON_CITIES.map((c) => ({ value: c, label: c }))}
                value={createArrivee}
                onChange={(v) => setCreateArrivee(v)}
                filterOption={(input, option) =>
                  (option?.label as string).toLowerCase().includes(input.toLowerCase())
                }
                size="middle"
                style={{ width: "100%" }}
              />
              <input type="hidden" name="arrivee" value={createArrivee ?? ""} />
            </div>
            <div className="col-span-1">
              <label className="mb-1 block text-xs font-bold text-black">Heure</label>
              <TimePicker
                value={createHeure}
                onChange={(v) => setCreateHeure(v)}
                format="HH:mm"
                minuteStep={15}
                placeholder="Sélectionner l'heure"
                size="middle"
                style={{ width: "100%" }}
              />
              <input type="hidden" name="heure" value={createHeure ? createHeure.format("HH:mm") : ""} />
            </div>
            <div className="col-span-1">
              <label className="mb-1 block text-xs font-bold text-black">Statut</label>
              <Select
                options={[
                  { value: "actif", label: "Actif" },
                  { value: "inactif", label: "Inactif" },
                ]}
                value={createStatut}
                onChange={(v) => setCreateStatut(v)}
                size="middle"
                style={{ width: "100%" }}
              />
              <input type="hidden" name="statut" value={createStatut} />
            </div>
            <div className="col-span-1">
              <label className="mb-1 block text-xs font-bold text-black">Prix adulte</label>
              <InputNumber
                value={createPrixAdulte as number | null}
                onChange={(v) => setCreatePrixAdulte(v as number | null)}
                formatter={(value) =>
                  value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, " ") : ""
                }
                parser={(value) => {
                  const n = Number((value ?? "").replace(/\s+/g, ""));
                  return Number.isNaN(n) ? 0 : n;
                }}
                min={0}
                size="middle"
                style={{ width: "100%" }}
                placeholder="Prix adulte"
              />
              <input type="hidden" name="prixAdulte" value={createPrixAdulte ?? ""} />
            </div>
            <div className="col-span-1">
              <label className="mb-1 block text-xs font-bold text-black">Prix enfant</label>
              <InputNumber
                value={createPrixEnfant as number | null}
                onChange={(v) => setCreatePrixEnfant(v as number | null)}
                formatter={(value) =>
                  value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, " ") : ""
                }
                parser={(value) => {
                  const n = Number((value ?? "").replace(/\s+/g, ""));
                  return Number.isNaN(n) ? 0 : n;
                }}
                min={0}
                size="middle"
                style={{ width: "100%" }}
                placeholder="Prix enfant"
              />
              <input type="hidden" name="prixEnfant" value={createPrixEnfant ?? ""} />
            </div>
          </div>
          <input type="hidden" name="agenceId" value="1" />
          <div className="flex justify-end gap-2">
            <Button onClick={() => setOpenCreate(false)}>Annuler</Button>
            <Button type="primary" htmlType="submit">Enregistrer</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title={editTrajet ? `Modifier le trajet #${editTrajet.id}` : ""}
        open={!!editTrajet}
        onCancel={() => setEditTrajet(null)}
        footer={null}
        destroyOnHidden
      >
        {editTrajet && (
          <form action={onUpdate} className="space-y-3">
            <input type="hidden" name="id" defaultValue={editTrajet.id} />
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="col-span-1">
                <label className="mb-1 block text-xs text-muted-foreground">Départ</label>
                <Select
                  showSearch
                  placeholder="Choisir la ville de départ"
                  options={GABON_CITIES.map((c) => ({ value: c, label: c }))}
                  value={editDepart}
                  onChange={(v) => setEditDepart(v)}
                  filterOption={(input, option) =>
                    (option?.label as string).toLowerCase().includes(input.toLowerCase())
                  }
                  size="middle"
                  style={{ width: "100%" }}
                />
                <input type="hidden" name="depart" value={editDepart ?? ""} />
              </div>
              <div className="col-span-1">
                <label className="mb-1 block text-xs text-muted-foreground">Arrivée</label>
                <Select
                  showSearch
                  placeholder="Choisir la ville d'arrivée"
                  options={GABON_CITIES.map((c) => ({ value: c, label: c }))}
                  value={editArrivee}
                  onChange={(v) => setEditArrivee(v)}
                  filterOption={(input, option) =>
                    (option?.label as string).toLowerCase().includes(input.toLowerCase())
                  }
                  size="middle"
                  style={{ width: "100%" }}
                />
                <input type="hidden" name="arrivee" value={editArrivee ?? ""} />
              </div>
              <div className="col-span-1">
                <label className="mb-1 block text-xs text-muted-foreground">Heure</label>
                <TimePicker
                  value={editHeure}
                  onChange={(v) => setEditHeure(v)}
                  format="HH:mm"
                  minuteStep={15}
                  placeholder="Sélectionner l'heure"
                  size="middle"
                  style={{ width: "100%" }}
                />
                <input type="hidden" name="heure" value={editHeure ? editHeure.format("HH:mm") : ""} />
              </div>
              <div className="col-span-1">
                <label className="mb-1 block text-xs text-muted-foreground">Statut</label>
                <Select
                  options={[
                    { value: "actif", label: "Actif" },
                    { value: "inactif", label: "Inactif" },
                  ]}
                  value={editStatut}
                  onChange={(v) => setEditStatut(v)}
                  size="middle"
                  style={{ width: "100%" }}
                />
                <input type="hidden" name="statut" value={editStatut ?? ""} />
              </div>
              <div className="col-span-1">
                <label className="mb-1 block text-xs font-bold text-black">Prix adulte</label>
                <InputNumber
                  value={editPrixAdulte as number | null}
                  onChange={(v) => setEditPrixAdulte(v as number | null)}
                  formatter={(value) =>
                    value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, " ") : ""
                  }
                  parser={(value) => {
                    const n = Number((value ?? "").replace(/\s+/g, ""));
                    return Number.isNaN(n) ? 0 : n;
                  }}
                  min={0}
                  size="middle"
                  style={{ width: "100%" }}
                  placeholder="Prix adulte"
                />
                <input type="hidden" name="prixAdulte" value={editPrixAdulte ?? ""} />
              </div>
              <div className="col-span-1">
                <label className="mb-1 block text-xs font-bold text-black">Prix enfant</label>
                <InputNumber
                  value={editPrixEnfant as number | null}
                  onChange={(v) => setEditPrixEnfant(v as number | null)}
                  formatter={(value) =>
                    value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, " ") : ""
                  }
                  parser={(value) => {
                    const n = Number((value ?? "").replace(/\s+/g, ""));
                    return Number.isNaN(n) ? 0 : n;
                  }}
                  min={0}
                  size="middle"
                  style={{ width: "100%" }}
                  placeholder="Prix enfant"
                />
                <input type="hidden" name="prixEnfant" value={editPrixEnfant ?? ""} />
              </div>
            </div>
            <input type="hidden" name="agenceId" defaultValue={editTrajet.agenceId ?? 1} />
            <div className="flex justify-end gap-2">
              <Button onClick={() => setEditTrajet(null)}>Annuler</Button>
              <Button type="primary" htmlType="submit">Mettre à jour</Button>
            </div>
          </form>
        )}
      </Modal>

      <Table
        size="middle"
        rowKey="id"
        dataSource={trajets}
        columns={columns as any}
        pagination={{ pageSize: 10, showSizeChanger: false }}
        locale={{ emptyText: "No data" }}
      />
    </div>
  );
}
