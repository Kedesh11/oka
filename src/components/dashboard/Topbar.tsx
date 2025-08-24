"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Dropdown, Badge, Avatar, Button, Input, Space, Typography, Layout } from "antd";
import { UserOutlined, SettingOutlined, LogoutOutlined, SearchOutlined, BellOutlined, DownOutlined } from "@ant-design/icons";

const { Text } = Typography;

export function Topbar() {
  const [searchValue, setSearchValue] = useState("");

  // Données simulées pour les notifications
  const notifications = [
    { id: 1, title: "Nouvelle réservation", message: "Réservation confirmée pour Libreville-Port-Gentil", time: "2 min", read: false },
    { id: 2, title: "Paiement reçu", message: "45,000 FCFA reçus de Transport Express", time: "5 min", read: false },
    { id: 3, title: "Nouvelle agence", message: "Agence 'Voyages Gabon' ajoutée", time: "1h", read: true },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  // Menu utilisateur
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Mon Profil',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Paramètres',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Se déconnecter',
      danger: true,
    },
  ];

  // Menu notifications
  const notificationItems = [
    {
      key: 'notifications',
      label: (
        <div className="w-80 max-h-96 overflow-y-auto">
          <div className="p-3 border-b">
            <p className="font-bold text-xl">Notifications</p>
          </div>
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div key={notification.id} className={`p-3 border-b hover:bg-gray-50 ${!notification.read ? 'bg-[#F0F9F4]' : ''}`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-md">{notification.title}</p>
                    <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                  </div>
                  <p className="text-xs text-gray-400">{notification.time}</p>
                </div>
                {!notification.read && (
                  <div className="w-2 h-2 bg-[#00B140] rounded-full mt-2"></div>
                )}
              </div>
            ))
          ) : (
            <p className="p-4 text-center text-gray-500">
              Aucune notification
            </p>
          )}
          {notifications.length > 0 && (
            <div className="p-2 border-t">
              <Button type="link" size="small" className="w-full">
                Voir toutes les notifications
              </Button>
            </div>
          )}
        </div>
      ),
    },
  ];

  const handleUserMenuClick = ({ key }: { key: string }) => {
    switch (key) {
      case 'profile':
        console.log('Ouvrir profil');
        break;
      case 'settings':
        console.log('Ouvrir paramètres');
        break;
      case 'logout':
        console.log('Déconnexion');
        break;
    }
  };

  return (
    <Layout.Header className="bg-[#00B140] text-white px-6 h-14 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Image src="/images/okalogo.png" alt="Oka Logo" width={28} height={28} />
        <p className="hidden sm:block font-semibold text-white">
          Oka Dashboard
        </p>
      </div>
      
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <Dropdown
          menu={{ items: notificationItems }}
          placement="bottomRight"
          trigger={['click']}
        >
          <Button 
            type="text" 
            icon={<BellOutlined />}
            className="h-9 w-9 flex items-center justify-center text-white hover:bg-white/10"
          >
            {unreadCount > 0 && (
              <Badge 
                count={unreadCount} 
                size="small" 
                className="absolute -top-1 -right-1 bg-red-500 text-white text-xs leading-3 h-4 min-w-4 px-1"
              />
            )}
          </Button>
        </Dropdown>

        {/* Menu utilisateur */}
        <Dropdown
          menu={{ 
            items: userMenuItems,
            onClick: handleUserMenuClick
          }}
          placement="bottomRight"
          trigger={['click']}
        >
          <Button 
            type="text"
            className="h-9 flex items-center gap-2 px-2 text-white hover:bg-white/10"
          >
            <Avatar 
              size="small" 
              icon={<UserOutlined />}
              className="bg-white/20"
            />
            <div className="hidden sm:block text-left">
              {/* <div className="text-sm font-medium">Admin</div> */}
              <p className="text-xs opacity-80">Administrateur</p>
            </div>
            <DownOutlined className="opacity-70" />
          </Button>
        </Dropdown>
      </div>
    </Layout.Header>
  );
}
