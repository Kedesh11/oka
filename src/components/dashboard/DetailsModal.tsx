"use client";

import React from 'react';
import { Modal, Button, Descriptions, Card, Row, Col, Tag, Statistic } from 'antd';
import { UserOutlined, BankOutlined, CalendarOutlined, EnvironmentOutlined, PhoneOutlined, MailOutlined } from '@ant-design/icons';

interface DetailsModalProps {
  open: boolean;
  onClose: () => void;
  data: any;
  type: 'agency' | 'user';
}

export default function DetailsModal({ open, onClose, data, type }: DetailsModalProps) {
  if (!data) return null;

  const renderAgencyDetails = () => (
    <div className="space-y-6">
      {/* En-tête avec le nom de l'agence */}
      <div className="bg-gradient-to-r from-[#01be65]/5 to-[#01be65]/10 p-4 rounded-lg border-l-4 border-[#01be65]">
        <h3 className="text-xl font-semibold text-[#01be65] mb-2">
          {data.name}
        </h3>
        <p className="text-gray-600 text-sm">
          ID: {data.id} • Créée le {new Date(data.createdAt).toLocaleDateString('fr-FR')}
        </p>
      </div>

      {/* Informations de contact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-800 border-b pb-2">
            Informations de contact
          </h4>
          
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-600">Email</label>
              <p className="text-gray-800">
                {data.email || (
                  <span className="text-gray-400 italic">Non renseigné</span>
                )}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Téléphone</label>
              <p className="text-gray-800">
                {data.phone || (
                  <span className="text-gray-400 italic">Non renseigné</span>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-800 border-b pb-2">
            Localisation
          </h4>
          
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-600">Zone géographique</label>
              <p className="text-gray-800">
                {data.zone || (
                  <span className="text-gray-400 italic">Non renseigné</span>
                )}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Adresse</label>
              <p className="text-gray-800">
                {data.address || (
                  <span className="text-gray-400 italic">Non renseigné</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-gray-800 border-b pb-2">
          Statistiques
        </h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border">
            <div className="text-2xl font-bold text-blue-600">
              {data._count?.trajets || 0}
            </div>
            <div className="text-sm text-blue-600 font-medium">Trajets</div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg border">
            <div className="text-2xl font-bold text-green-600">
              {data._count?.buses || 0}
            </div>
            <div className="text-sm text-green-600 font-medium">Bus</div>
          </div>
        </div>
      </div>

      {/* Informations système */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-gray-800 border-b pb-2">
          Informations système
        </h4>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <label className="font-medium text-gray-600">Date de création</label>
              <p className="text-gray-800">
                {new Date(data.createdAt).toLocaleString('fr-FR')}
              </p>
            </div>
            <div>
              <label className="font-medium text-gray-600">Statut</label>
              <p className="text-green-600 font-medium">Active</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUserDetails = () => (
    <div className="space-y-6">
      {/* En-tête avec le nom de l'utilisateur */}
      <div className="bg-gradient-to-r from-[#01be65]/5 to-[#01be65]/10 p-4 rounded-lg border-l-4 border-[#01be65]">
        <h3 className="text-xl font-semibold text-[#01be65] mb-2">
          {data.name}
        </h3>
        <p className="text-gray-600 text-sm">
          ID: {data.id} • Créé le {new Date(data.createdAt).toLocaleDateString('fr-FR')}
        </p>
      </div>

      {/* Informations personnelles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-800 border-b pb-2">
            Informations personnelles
          </h4>
          
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-600">Nom complet</label>
              <p className="text-gray-800">{data.name}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Email</label>
              <p className="text-gray-800">{data.email}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Téléphone</label>
              <p className="text-gray-800">
                {data.phone || (
                  <span className="text-gray-400 italic">Non renseigné</span>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-800 border-b pb-2">
            Rôle et statut
          </h4>
          
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-600">Rôle</label>
              <div className="mt-1">
                <Tag 
                  color={
                    data.role === 'Admin' ? 'red' : 
                    data.role === 'Agence' ? 'blue' : 
                    'green'
                  }
                  className="text-sm"
                >
                  {data.role}
                </Tag>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Statut</label>
              <div className="mt-1">
                <Tag 
                  color={data.status === 'ACTIVE' ? 'green' : 'red'}
                  className="text-sm"
                >
                  {data.status === 'ACTIVE' ? 'Actif' : 'Inactif'}
                </Tag>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Agence associée</label>
              <p className="text-gray-800">
                {data.agence?.name || (
                  <span className="text-gray-400 italic">Aucune agence</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Adresse */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-gray-800 border-b pb-2">
          Adresse
        </h4>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-800">
            {data.address || (
              <span className="text-gray-400 italic">Adresse non renseignée</span>
            )}
          </p>
        </div>
      </div>

      {/* Informations système */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-gray-800 border-b pb-2">
          Informations système
        </h4>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <label className="font-medium text-gray-600">Date de création</label>
              <p className="text-gray-800">
                {new Date(data.createdAt).toLocaleString('fr-FR')}
              </p>
            </div>
            <div>
              <label className="font-medium text-gray-600">Dernière connexion</label>
              <p className="text-gray-800">
                {data.lastLogin ? 
                  new Date(data.lastLogin).toLocaleString('fr-FR') : 
                  <span className="text-gray-400 italic">Jamais connecté</span>
                }
              </p>
            </div>
            <div>
              <label className="font-medium text-gray-600">Dernière modification</label>
              <p className="text-gray-800">
                {new Date(data.updatedAt).toLocaleString('fr-FR')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const getModalTitle = () => {
    return type === 'agency' ? 'Détails de l\'agence' : 'Détails de l\'utilisateur';
  };

  return (
    <Modal
      title={getModalTitle()}
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Fermer
        </Button>
      ]}
      width={700}
    >
      {type === 'agency' ? renderAgencyDetails() : renderUserDetails()}
    </Modal>
  );
}
