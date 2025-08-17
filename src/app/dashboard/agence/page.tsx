"use client";

import React, { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import FleetManager from "@/components/dashboard/fleet/FleetManager";
import VoyagesManager from "@/components/dashboard/fleet/VoyagesManager";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Select as AntdSelect, TimePicker } from "antd";
import dayjs from "dayjs";
import { GABON_CITIES } from "@/data/gabonCities";

type Trajet = {
  id: string;
  depart: string;
  arrivee: string;
  heure: string;
  prixAdulte: number;
  prixEnfant: number;
  statut: "actif" | "inactif";
};

type Reservation = {
  id: string;
  trajetId: string;
  client: string;
  telephone: string;
  nbVoyageurs: number;
  statut: "en_attente" | "confirmée" | "annulée";
  note?: string;
};

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

export default function AgenceDashboardPage() {
  // SSR-safe: avoid random IDs during initial render to prevent hydration mismatch.
  const [trajets, setTrajets] = useState<Trajet[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);

  React.useEffect(() => {
    // Populate demo data on client after mount
    setTrajets([
      {
        id: generateId(),
        depart: "Libreville",
        arrivee: "Franceville",
        heure: "06:30",
        prixAdulte: 12000,
        prixEnfant: 8000,
        statut: "actif",
      },
      {
        id: generateId(),
        depart: "Libreville",
        arrivee: "Oyem",
        heure: "08:00",
        prixAdulte: 10000,
        prixEnfant: 6000,
        statut: "actif",
      },
    ]);

    setReservations([
      {
        id: generateId(),
        trajetId: "",
        client: "Jean M.",
        telephone: "+241 07 00 00 00",
        nbVoyageurs: 2,
        statut: "confirmée",
        note: "Paiement confirmé Airtel",
      },
      {
        id: generateId(),
        trajetId: "",
        client: "Anne T.",
        telephone: "+241 06 11 22 33",
        nbVoyageurs: 1,
        statut: "en_attente",
      },
    ]);
  }, []);

  const stats = useMemo(() => {
    const totalTrajets = trajets.length;
    const actifs = trajets.filter(t => t.statut === "actif").length;
    const totalReservations = reservations.length;
    const conf = reservations.filter(r => r.statut === "confirmée").length;
    return { totalTrajets, actifs, totalReservations, conf };
  }, [trajets, reservations]);

  const search = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const currentTab = (search.get("tab") as string) || "overview";
  const TAB_LABELS: Record<string, string> = {
    overview: "Aperçu",
    routes: "Trajets",
    bookings: "Réservations",
    fleet: "Flotte",
    voyages: "Voyages",
    settings: "Paramètres",
  };
  const pageTitle = TAB_LABELS[currentTab] ?? "Dashboard Agence";

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center">
        <h1 className="text-2xl font-bold">{pageTitle}</h1>
      </div>

      <Tabs
        value={currentTab}
        onValueChange={(v) => {
          const params = new URLSearchParams(search.toString());
          params.set("tab", v);
          router.replace(`${pathname}?${params.toString()}`);
        }}
        className="w-full"
      >
        {/* TabsList removed to avoid buttons under the title; navigation lives in the sidebar */}

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Trajets publiés</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.totalTrajets}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Trajets actifs</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.actifs}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Réservations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.totalReservations}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Confirmées</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.conf}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="routes">
          <RoutesManager trajets={trajets} setTrajets={setTrajets} />
        </TabsContent>

        <TabsContent value="bookings">
          <ReservationsManager reservations={reservations} setReservations={setReservations} />
        </TabsContent>

        <TabsContent value="fleet">
          <FleetManager />
        </TabsContent>

        <TabsContent value="voyages">
          <VoyagesManager />
        </TabsContent>

        <TabsContent value="settings">
          <SettingsAgence />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function RoutesManager({
  trajets,
  setTrajets,
}: {
  trajets: Trajet[];
  setTrajets: React.Dispatch<React.SetStateAction<Trajet[]>>;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Trajet | null>(null);

  const removeTrajet = (id: string) => {
    setTrajets(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Trajets</h2>
        <Dialog open={open} onOpenChange={(v) => { if (!v) setEditing(null); setOpen(v); }}>
          <DialogTrigger asChild>
            <Button className="bg-green-500">
              <Plus className="mr-2 h-4 w-4" /> Nouveau trajet
            </Button>
          </DialogTrigger>
          <RouteDialogForm
            initialValue={editing ?? undefined}
            onSubmit={(data) => {
              if (editing) {
                setTrajets(prev => prev.map(t => (t.id === editing.id ? { ...editing, ...data } : t)));
              } else {
                setTrajets(prev => [
                  ...prev,
                  { id: generateId(), statut: "actif", ...data },
                ]);
              }
              setEditing(null);
              setOpen(false);
            }}
            onCancel={() => { setEditing(null); setOpen(false); }}
          />
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Départ</TableHead>
                <TableHead>Arrivée</TableHead>
                <TableHead>Heure</TableHead>
                <TableHead>Prix (Adulte)</TableHead>
                <TableHead>Prix (Enfant)</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trajets.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>{t.depart}</TableCell>
                  <TableCell>{t.arrivee}</TableCell>
                  <TableCell>{t.heure}</TableCell>
                  <TableCell>{t.prixAdulte.toLocaleString()} FCFA</TableCell>
                  <TableCell>{t.prixEnfant.toLocaleString()} FCFA</TableCell>
                  <TableCell>
                    <span className={t.statut === "actif" ? "text-green-600" : "text-gray-500"}>
                      {t.statut}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => { setEditing(t); setOpen(true); }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" onClick={() => removeTrajet(t.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function RouteDialogForm({
  initialValue,
  onSubmit,
  onCancel,
}: {
  initialValue?: Omit<Trajet, "id" | "statut"> & { statut?: Trajet["statut"]; id?: string };
  onSubmit: (data: Omit<Trajet, "id" | "statut"> & { statut?: Trajet["statut"] }) => void;
  onCancel: () => void;
}) {
  const [depart, setDepart] = useState(initialValue?.depart ?? "");
  const [arrivee, setArrivee] = useState(initialValue?.arrivee ?? "");
  const [heure, setHeure] = useState(initialValue?.heure ?? "");
  const [prixAdulte, setPrixAdulte] = useState(String(initialValue?.prixAdulte ?? ""));
  const [prixEnfant, setPrixEnfant] = useState(String(initialValue?.prixEnfant ?? ""));
  const [statut, setStatut] = useState<Trajet["statut"]>(initialValue?.statut ?? "actif");

  const isValid = depart && arrivee && heure && Number(prixAdulte) > 0 && Number(prixEnfant) >= 0;

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{initialValue ? "Modifier le trajet" : "Nouveau trajet"}</DialogTitle>
      </DialogHeader>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Départ</Label>
          <AntdSelect
            showSearch
            placeholder="Ville de départ"
            value={depart || undefined}
            onChange={(v) => setDepart(v)}
            options={GABON_CITIES.map((c) => ({ label: c, value: c }))}
            filterOption={(input, option) =>
              (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
            }
            className="w-full"
          />
        </div>
        <div>
          <Label>Arrivée</Label>
          <AntdSelect
            showSearch
            placeholder="Ville d'arrivée"
            value={arrivee || undefined}
            onChange={(v) => setArrivee(v)}
            options={GABON_CITIES.map((c) => ({ label: c, value: c }))}
            filterOption={(input, option) =>
              (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
            }
            className="w-full"
          />
        </div>
        <div>
          <Label>Heure</Label>
          <TimePicker
            format="HH:mm"
            minuteStep={5}
            value={heure ? dayjs(heure, "HH:mm") : null}
            onChange={(t) => setHeure(t ? t.format("HH:mm") : "")}
            className="w-full"
          />
        </div>
        <div>
          <Label>Prix adulte (FCFA)</Label>
          <Input type="number" value={prixAdulte} onChange={(e) => setPrixAdulte(e.target.value)} />
        </div>
        <div>
          <Label>Prix enfant (FCFA)</Label>
          <Input type="number" value={prixEnfant} onChange={(e) => setPrixEnfant(e.target.value)} />
        </div>
        <div>
          <Label>Statut</Label>
          <Select value={statut} onValueChange={(v: Trajet["statut"]) => setStatut(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Choisir un statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="actif">actif</SelectItem>
              <SelectItem value="inactif">inactif</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter className="mt-4">
        <Button variant="outline" onClick={onCancel}>Annuler</Button>
        <Button
          className="bg-green-500"
          disabled={!isValid}
          onClick={() =>
            onSubmit({ depart, arrivee, heure, prixAdulte: Number(prixAdulte), prixEnfant: Number(prixEnfant), statut })
          }
        >
          Enregistrer
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

function ReservationsManager({
  reservations,
  setReservations,
}: {
  reservations: Reservation[];
  setReservations: React.Dispatch<React.SetStateAction<Reservation[]>>;
}) {
  const [note, setNote] = useState("");

  const updateStatut = (id: string, statut: Reservation["statut"]) => {
    setReservations(prev => prev.map(r => (r.id === id ? { ...r, statut } : r)));
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Réservations</h2>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Voyageurs</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Note</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservations.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.client}</TableCell>
                  <TableCell>{r.telephone}</TableCell>
                  <TableCell>{r.nbVoyageurs}</TableCell>
                  <TableCell>
                    <Select value={r.statut} onValueChange={(v: Reservation["statut"]) => updateStatut(r.id, v)}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en_attente">en_attente</SelectItem>
                        <SelectItem value="confirmée">confirmée</SelectItem>
                        <SelectItem value="annulée">annulée</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="max-w-[240px]">
                    <Textarea
                      placeholder="Note interne"
                      defaultValue={r.note ?? ""}
                      onBlur={(e) => setReservations(prev => prev.map(x => x.id === r.id ? { ...x, note: e.target.value } : x))}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="destructive" onClick={() => setReservations(prev => prev.filter(x => x.id !== r.id))}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function SettingsAgence() {
  const [nom, setNom] = useState("Mon Agence");
  const [telephone, setTelephone] = useState("+241 00 00 00 00");
  const [adresse, setAdresse] = useState("Libreville, Gabon");

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profil de l'agence</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Nom</Label>
              <Input value={nom} onChange={(e) => setNom(e.target.value)} />
            </div>
            <div>
              <Label>Téléphone</Label>
              <Input value={telephone} onChange={(e) => setTelephone(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Adresse</Label>
            <Input value={adresse} onChange={(e) => setAdresse(e.target.value)} />
          </div>
          <div className="text-right">
            <Button className="bg-green-500">Sauvegarder</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}