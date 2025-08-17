"use client";

import { useState, useCallback } from 'react';
import { Modal } from 'antd';
import { useApiUrl } from '@/hooks/use-api-url';

// Fonction pour afficher les messages de manière sûre
const showMessage = (type: 'success' | 'error', content: string) => {
  try {
    import('antd').then(({ message }) => {
      message[type](content);
    }).catch(() => {
      // Fallback si Ant Design n'est pas disponible
      console.log(`${type.toUpperCase()}: ${content}`);
    });
  } catch (error) {
    console.log(`${type.toUpperCase()}: ${content}`);
  }
};

// Types pour les données
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'Admin' | 'Agence' | 'Client';
  status: 'active' | 'inactive';
  lastLogin: string;
  phone?: string;
  address?: string;
  agenceId?: number;
  agence?: {
    id: number;
    name: string;
  };
}

export interface Report {
  id: number;
  title: string;
  type: 'Ventes' | 'Trajets' | 'Satisfaction' | 'Utilisateurs' | 'Réservations';
  date: string;
  status: 'Généré' | 'En cours' | 'Échec';
  url?: string;
}

export interface SecurityLog {
  id: number;
  action: string;
  user: string;
  ip: string;
  time: string;
  status: 'success' | 'error' | 'warning';
  details?: string;
}

export interface SystemStats {
  agencies: number;
  users: number;
  activeVoyages: number;
  revenue: string;
  bookingRate: number;
  satisfactionRate: number;
  punctualityRate: number;
}

// Hook pour la gestion des utilisateurs
export function useUsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const { getApiUrl } = useApiUrl();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(getApiUrl('/api/admin/users'));
      if (!response.ok) throw new Error('Erreur lors du chargement des utilisateurs');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      showMessage('error', 'Erreur lors du chargement des utilisateurs');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [getApiUrl]);

  const createUser = useCallback(async (userData: Omit<User, 'id' | 'lastLogin'>) => {
    try {
      const response = await fetch(getApiUrl('/api/admin/users'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (!response.ok) throw new Error('Erreur lors de la création');
      const newUser = await response.json();
      setUsers(prev => [...prev, newUser]);
      showMessage('success', 'Utilisateur créé avec succès');
      return newUser;
    } catch (error) {
      showMessage('error', 'Erreur lors de la création de l\'utilisateur');
      throw error;
    }
  }, [getApiUrl]);

  const updateUser = useCallback(async (id: number, userData: Partial<User>) => {
    try {
      const response = await fetch(getApiUrl(`/api/admin/users/${id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (!response.ok) throw new Error('Erreur lors de la mise à jour');
      const updatedUser = await response.json();
      setUsers(prev => prev.map(user => user.id === id ? updatedUser : user));
      showMessage('success', 'Utilisateur mis à jour avec succès');
      return updatedUser;
    } catch (error) {
      showMessage('error', 'Erreur lors de la mise à jour de l\'utilisateur');
      throw error;
    }
  }, [getApiUrl]);

  const deleteUser = useCallback(async (id: number) => {
    Modal.confirm({
      title: 'Confirmer la suppression',
      content: 'Êtes-vous sûr de vouloir supprimer cet utilisateur ?',
      okText: 'Supprimer',
      okType: 'danger',
      cancelText: 'Annuler',
      onOk: async () => {
        try {
          const response = await fetch(getApiUrl(`/api/admin/users/${id}`), {
            method: 'DELETE',
          });
          if (!response.ok) throw new Error('Erreur lors de la suppression');
          setUsers(prev => prev.filter(user => user.id !== id));
          showMessage('success', 'Utilisateur supprimé avec succès');
        } catch (error) {
          showMessage('error', 'Erreur lors de la suppression de l\'utilisateur');
        }
      },
    });
  }, [getApiUrl]);

  return {
    users,
    loading,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
  };
}

// Hook pour la gestion des rapports
export function useReportsManagement() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const { getApiUrl } = useApiUrl();

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(getApiUrl('/api/admin/reports'));
      if (!response.ok) throw new Error('Erreur lors du chargement des rapports');
      const data = await response.json();
      setReports(data);
    } catch (error) {
      showMessage('error', 'Erreur lors du chargement des rapports');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [getApiUrl]);

  const generateReport = useCallback(async (type: Report['type']) => {
    setLoading(true);
    try {
      const response = await fetch(getApiUrl('/api/admin/reports/generate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
      if (!response.ok) throw new Error('Erreur lors de la génération');
      const newReport = await response.json();
      setReports(prev => [newReport, ...prev]);
      showMessage('success', `Rapport ${type} généré avec succès`);
      return newReport;
    } catch (error) {
      showMessage('error', 'Erreur lors de la génération du rapport');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [getApiUrl]);

  const downloadReport = useCallback(async (id: number) => {
    try {
      const response = await fetch(getApiUrl(`/api/admin/reports/${id}/download`));
      if (!response.ok) throw new Error('Erreur lors du téléchargement');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rapport-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showMessage('success', 'Rapport téléchargé avec succès');
    } catch (error) {
      showMessage('error', 'Erreur lors du téléchargement du rapport');
    }
  }, [getApiUrl]);

  return {
    reports,
    loading,
    fetchReports,
    generateReport,
    downloadReport,
  };
}

// Hook pour la gestion de la sécurité
export function useSecurityManagement() {
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const { getApiUrl } = useApiUrl();

  const fetchSecurityLogs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(getApiUrl('/api/admin/security/logs'));
      if (!response.ok) throw new Error('Erreur lors du chargement des logs');
      const data = await response.json();
      setSecurityLogs(data);
    } catch (error) {
      showMessage('error', 'Erreur lors du chargement des logs de sécurité');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [getApiUrl]);

  return {
    securityLogs,
    loading,
    fetchSecurityLogs,
  };
}

// Hook pour les statistiques système
export function useSystemStats() {
  const [stats, setStats] = useState<SystemStats>({
    agencies: 0,
    users: 0,
    activeVoyages: 0,
    revenue: '0',
    bookingRate: 0,
    satisfactionRate: 0,
    punctualityRate: 0,
  });
  const [loading, setLoading] = useState(false);
  const { getApiUrl } = useApiUrl();

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(getApiUrl('/api/admin/stats'));
      if (!response.ok) throw new Error('Erreur lors du chargement des statistiques');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      showMessage('error', 'Erreur lors du chargement des statistiques');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [getApiUrl]);

  return {
    stats,
    loading,
    fetchStats,
  };
}

// Hook pour les paramètres système
export function useSystemSettings() {
  const [loading, setLoading] = useState(false);
  const { getApiUrl } = useApiUrl();

  const updateGeneralSettings = useCallback(async (settings: any) => {
    setLoading(true);
    try {
      const response = await fetch(getApiUrl('/api/admin/settings/general'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!response.ok) throw new Error('Erreur lors de la mise à jour');
      showMessage('success', 'Paramètres généraux mis à jour');
    } catch (error) {
      showMessage('error', 'Erreur lors de la mise à jour des paramètres');
    } finally {
      setLoading(false);
    }
  }, [getApiUrl]);

  const updateEmailSettings = useCallback(async (settings: any) => {
    setLoading(true);
    try {
      const response = await fetch(getApiUrl('/api/admin/settings/email'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!response.ok) throw new Error('Erreur lors de la mise à jour');
      showMessage('success', 'Paramètres email mis à jour');
    } catch (error) {
      showMessage('error', 'Erreur lors de la mise à jour des paramètres email');
    } finally {
      setLoading(false);
    }
  }, [getApiUrl]);

  const updatePaymentSettings = useCallback(async (settings: any) => {
    setLoading(true);
    try {
      const response = await fetch(getApiUrl('/api/admin/settings/payments'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!response.ok) throw new Error('Erreur lors de la mise à jour');
      showMessage('success', 'Paramètres de paiement mis à jour');
    } catch (error) {
      showMessage('error', 'Erreur lors de la mise à jour des paramètres de paiement');
    } finally {
      setLoading(false);
    }
  }, [getApiUrl]);

  return {
    loading,
    updateGeneralSettings,
    updateEmailSettings,
    updatePaymentSettings,
  };
}
