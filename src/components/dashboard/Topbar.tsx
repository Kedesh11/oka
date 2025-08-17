"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Bell, Search, User, Settings, LogOut, ChevronDown } from "lucide-react";
import { Dropdown, Badge, Avatar, Button, Input, Space, Typography } from "antd";
import { UserOutlined, SettingOutlined, LogoutOutlined } from "@ant-design/icons";

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
      type: 'divider',
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
            <Text strong>Notifications</Text>
          </div>
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div key={notification.id} className={`p-3 border-b hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <Text strong className="text-sm">{notification.title}</Text>
                    <div className="text-xs text-gray-600 mt-1">{notification.message}</div>
                  </div>
                  <Text className="text-xs text-gray-400">{notification.time}</Text>
                </div>
                {!notification.read && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                )}
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">
              Aucune notification
            </div>
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
    <header className="flex-shrink-0 z-10 bg-[#01be65] text-white shadow">
      <div className="mx-auto flex h-14 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <Image src="/images/okalogo.png" alt="Oka Logo" width={28} height={28} />
          <div className="hidden sm:block font-semibold">Oka Dashboard</div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Barre de recherche */}
          <div className="hidden md:flex items-center gap-2 rounded-md bg-white/10 px-2">
            <Search className="h-4 w-4 opacity-90" />
            <Input
              placeholder="Rechercher..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="h-8 w-44 bg-transparent border-none text-sm placeholder:text-white/80 text-white"
              style={{ color: 'white' }}
            />
          </div>

          {/* Notifications */}
          <Dropdown
            menu={{ items: notificationItems }}
            placement="bottomRight"
            trigger={['click']}
          >
            <button className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-white/10 relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge 
                  count={unreadCount} 
                  size="small" 
                  className="absolute -top-1 -right-1"
                  style={{ 
                    backgroundColor: '#ff4d4f',
                    color: 'white',
                    fontSize: '10px',
                    lineHeight: '12px',
                    height: '16px',
                    minWidth: '16px',
                    padding: '0 4px'
                  }}
                />
              )}
            </button>
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
            <button className="inline-flex h-9 items-center justify-center rounded-md hover:bg-white/10 px-2 gap-2">
              <Avatar 
                size="small" 
                icon={<User className="h-4 w-4" />}
                className="bg-white/20"
              />
              <div className="hidden sm:block text-left">
                <div className="text-sm font-medium">Admin</div>
                <div className="text-xs opacity-80">Administrateur</div>
              </div>
              <ChevronDown className="h-4 w-4 opacity-70" />
            </button>
          </Dropdown>
        </div>
      </div>
    </header>
  );
}
