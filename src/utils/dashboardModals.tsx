"use client";

import React from 'react';
import { Modal, Form, Input, Select, Button, Switch, DatePicker } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, LockOutlined } from '@ant-design/icons';
import { User } from './dashboardActions';

const { Option } = Select;
const { TextArea } = Input;

// Modal pour créer/modifier un utilisateur
interface UserModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => Promise<void>;
  initialValues?: Partial<User>;
  title: string;
  loading?: boolean;
}

export const UserModal: React.FC<UserModalProps> = ({
  visible,
  onCancel,
  onSubmit,
  initialValues,
  title,
  loading = false,
}) => {
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit(values);
      form.resetFields();
      onCancel();
    } catch (error) {
      console.error('Erreur de validation:', error);
    }
  };

  return (
    <Modal
      title={title}
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Annuler
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
          {initialValues ? 'Mettre à jour' : 'Créer'}
        </Button>,
      ]}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        onFinish={handleSubmit}
      >
        <Form.Item
          name="name"
          label="Nom complet"
          rules={[{ required: true, message: 'Le nom est requis' }]}
        >
          <Input prefix={<UserOutlined />} placeholder="Nom complet" />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'L\'email est requis' },
            { type: 'email', message: 'Email invalide' },
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder="email@example.com" />
        </Form.Item>

        <Form.Item
          name="phone"
          label="Téléphone"
          rules={[{ required: false }]}
        >
          <Input prefix={<PhoneOutlined />} placeholder="+241 01234567" />
        </Form.Item>

        <Form.Item
          name="role"
          label="Rôle"
          rules={[{ required: true, message: 'Le rôle est requis' }]}
        >
          <Select placeholder="Sélectionner un rôle">
            <Option value="Admin">Administrateur</Option>
            <Option value="Agence">Agence</Option>
            <Option value="Client">Client</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="status"
          label="Statut"
          rules={[{ required: true, message: 'Le statut est requis' }]}
        >
          <Select placeholder="Sélectionner un statut">
            <Option value="active">Actif</Option>
            <Option value="inactive">Inactif</Option>
          </Select>
        </Form.Item>

        {!initialValues && (
          <Form.Item
            name="password"
            label="Mot de passe"
            rules={[
              { required: true, message: 'Le mot de passe est requis' },
              { min: 6, message: 'Le mot de passe doit contenir au moins 6 caractères' },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Mot de passe" />
          </Form.Item>
        )}

        <Form.Item
          name="address"
          label="Adresse"
          rules={[{ required: false }]}
        >
          <TextArea rows={3} placeholder="Adresse complète" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

// Modal pour les paramètres de sécurité
interface SecuritySettingsModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => Promise<void>;
  loading?: boolean;
}

export const SecuritySettingsModal: React.FC<SecuritySettingsModalProps> = ({
  visible,
  onCancel,
  onSubmit,
  loading = false,
}) => {
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit(values);
      form.resetFields();
      onCancel();
    } catch (error) {
      console.error('Erreur de validation:', error);
    }
  };

  return (
    <Modal
      title="Paramètres de Sécurité"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Annuler
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
          Enregistrer
        </Button>,
      ]}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="twoFactorEnabled"
          label="Authentification à deux facteurs"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          name="minPasswordLength"
          label="Longueur minimale du mot de passe"
          rules={[{ required: true, message: 'Ce champ est requis' }]}
        >
          <Input type="number" min={6} max={20} />
        </Form.Item>

        <Form.Item
          name="requireSpecialChars"
          label="Exiger des caractères spéciaux"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          name="sessionTimeout"
          label="Délai d'expiration de session (minutes)"
          rules={[{ required: true, message: 'Ce champ est requis' }]}
        >
          <Input type="number" min={15} max={480} />
        </Form.Item>

        <Form.Item
          name="maxLoginAttempts"
          label="Nombre maximum de tentatives de connexion"
          rules={[{ required: true, message: 'Ce champ est requis' }]}
        >
          <Input type="number" min={3} max={10} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

// Modal pour les paramètres généraux
interface GeneralSettingsModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => Promise<void>;
  loading?: boolean;
}

export const GeneralSettingsModal: React.FC<GeneralSettingsModalProps> = ({
  visible,
  onCancel,
  onSubmit,
  loading = false,
}) => {
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit(values);
      form.resetFields();
      onCancel();
    } catch (error) {
      console.error('Erreur de validation:', error);
    }
  };

  return (
    <Modal
      title="Paramètres Généraux"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Annuler
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
          Enregistrer
        </Button>,
      ]}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="siteName"
          label="Nom du site"
          rules={[{ required: true, message: 'Ce champ est requis' }]}
        >
          <Input placeholder="Oka Voyage" />
        </Form.Item>

        <Form.Item
          name="siteDescription"
          label="Description du site"
        >
          <TextArea rows={3} placeholder="Description du site" />
        </Form.Item>

        <Form.Item
          name="contactEmail"
          label="Email de contact"
          rules={[
            { required: true, message: 'Ce champ est requis' },
            { type: 'email', message: 'Email invalide' },
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder="contact@oka.com" />
        </Form.Item>

        <Form.Item
          name="contactPhone"
          label="Téléphone de contact"
        >
          <Input prefix={<PhoneOutlined />} placeholder="+241 01234567" />
        </Form.Item>

        <Form.Item
          name="timezone"
          label="Fuseau horaire"
          rules={[{ required: true, message: 'Ce champ est requis' }]}
        >
          <Select placeholder="Sélectionner un fuseau horaire">
            <Option value="Africa/Libreville">Africa/Libreville</Option>
            <Option value="UTC">UTC</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="currency"
          label="Devise"
          rules={[{ required: true, message: 'Ce champ est requis' }]}
        >
          <Select placeholder="Sélectionner une devise">
            <Option value="XAF">FCFA (XAF)</Option>
            <Option value="EUR">Euro (EUR)</Option>
            <Option value="USD">Dollar US (USD)</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

// Modal pour les paramètres de paiement
interface PaymentSettingsModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => Promise<void>;
  loading?: boolean;
}

export const PaymentSettingsModal: React.FC<PaymentSettingsModalProps> = ({
  visible,
  onCancel,
  onSubmit,
  loading = false,
}) => {
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit(values);
      form.resetFields();
      onCancel();
    } catch (error) {
      console.error('Erreur de validation:', error);
    }
  };

  return (
    <Modal
      title="Paramètres de Paiement"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Annuler
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
          Enregistrer
        </Button>,
      ]}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="paymentMethods"
          label="Méthodes de paiement"
          rules={[{ required: true, message: 'Ce champ est requis' }]}
        >
          <Select mode="multiple" placeholder="Sélectionner les méthodes de paiement">
            <Option value="mobile_money">Mobile Money</Option>
            <Option value="bank_transfer">Virement bancaire</Option>
            <Option value="cash">Espèces</Option>
            <Option value="card">Carte bancaire</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="defaultPaymentMethod"
          label="Méthode de paiement par défaut"
          rules={[{ required: true, message: 'Ce champ est requis' }]}
        >
          <Select placeholder="Sélectionner la méthode par défaut">
            <Option value="mobile_money">Mobile Money</Option>
            <Option value="bank_transfer">Virement bancaire</Option>
            <Option value="cash">Espèces</Option>
            <Option value="card">Carte bancaire</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="paymentTimeout"
          label="Délai d'expiration du paiement (minutes)"
          rules={[{ required: true, message: 'Ce champ est requis' }]}
        >
          <Input type="number" min={5} max={1440} />
        </Form.Item>

        <Form.Item
          name="autoConfirmPayment"
          label="Confirmation automatique des paiements"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          name="refundPolicy"
          label="Politique de remboursement"
        >
          <TextArea rows={4} placeholder="Décrivez votre politique de remboursement" />
        </Form.Item>
      </Form>
    </Modal>
  );
};
