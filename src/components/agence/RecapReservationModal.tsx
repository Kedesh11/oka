"use client";

import React from "react";
import { Modal, Space, Typography, Divider } from "antd";
import { CONVOCATION_MINUTES_BEFORE, SERVICE_FEE_FCFA } from "@/config/business";

const { Text } = Typography;

export type RecapReservationModalProps = {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
  agenceName: string;
  depart: string;
  arrivee: string;
  heure?: string;
  reservationType: "Individuel" | "Famille" | "Couple";
  adultCount: number;
  adultNames: string[];
  childrenCount: number;
  hasBaggage?: boolean;
  convocationMinutes?: number;
  client?: string;
  telephone?: string;
  prixAdulte?: number;
  prixEnfant?: number;
  serviceFee?: number;
};

export default function RecapReservationModal({
  open,
  onCancel,
  onConfirm,
  agenceName,
  depart,
  arrivee,
  heure,
  reservationType,
  adultCount,
  adultNames,
  childrenCount,
  hasBaggage,
  convocationMinutes = CONVOCATION_MINUTES_BEFORE,
  client,
  telephone,
  prixAdulte = 0,
  prixEnfant = 0,
  serviceFee = SERVICE_FEE_FCFA,
}: RecapReservationModalProps) {
  const subtotal = adultCount * (prixAdulte || 0) + (childrenCount || 0) * (prixEnfant || 0);
  const total = subtotal + (serviceFee || 0);
  return (
    <Modal
      title="Récapitulatif de la réservation"
      open={open}
      onCancel={onCancel}
      okText="Procéder au paiement"
      onOk={onConfirm}
      getContainer={false}
      maskClosable={false}
      zIndex={2100}
    >
      <Space direction="vertical" style={{ width: "100%" }}>
        <Text><b>Agence:</b> {agenceName}</Text>
        <Text><b>Trajet:</b> {depart} → {arrivee} {heure ? `· ${heure}` : ""}</Text>
        {client || telephone ? (
          <Text>
            <b>Client:</b> {client || "—"} {telephone ? `— ${telephone}` : ""}
          </Text>
        ) : null}
        <Text><b>Type:</b> {reservationType}</Text>
        <div>
          <Text strong>Adultes ({adultCount})</Text>
          <ul className="list-disc pl-5">
            {adultNames.slice(0, adultCount).map((n, i) => (
              <li key={i}>{n || `Adulte ${i + 1}`}</li>
            ))}
          </ul>
        </div>
        {childrenCount > 0 ? <Text>Enfants: {childrenCount}</Text> : null}
        <Divider className="my-2" />
        <div className="p-2 rounded border bg-gray-50">
          <div className="flex justify-between"><Text>Sous-total</Text><Text>{subtotal.toLocaleString()} FCFA</Text></div>
          <div className="flex justify-between"><Text>Frais de service</Text><Text>{(serviceFee || 0).toLocaleString()} FCFA</Text></div>
          <div className="flex justify-between font-semibold mt-1"><Text strong>Total</Text><Text strong>{total.toLocaleString()} FCFA</Text></div>
        </div>
        {hasBaggage ? (
          <div className="p-2 rounded border border-amber-300 bg-amber-50">
            <Text type="warning">Des frais supplémentaires pour les bagages pourront être réglés en espèces au comptoir.</Text>
          </div>
        ) : null}
        <div className="mt-2">
          <Text type="secondary">Convocation: {convocationMinutes} min avant l'heure de départ.</Text>
        </div>
      </Space>
    </Modal>
  );
}
