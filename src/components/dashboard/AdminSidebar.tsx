"use client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Layout, Menu, Typography } from "antd";
import { 
  DashboardOutlined, 
  UserOutlined, 
  BuildOutlined, 
  BarChartOutlined, 
  SettingOutlined, 
  SafetyOutlined, 
  LogoutOutlined 
} from "@ant-design/icons";

const nav = [
  { href: "/dashboard/admin?tab=overview", label: "Overview", icon: DashboardOutlined },
  { href: "/dashboard/admin?tab=users", label: "Utilisateurs", icon: UserOutlined },
  { href: "/dashboard/admin?tab=agencies", label: "Agences", icon: BuildOutlined },
  { href: "/dashboard/admin?tab=reports", label: "Rapports", icon: BarChartOutlined },
  { href: "/dashboard/admin?tab=security", label: "Sécurité", icon: SafetyOutlined },
  { href: "/dashboard/admin?tab=settings", label: "Paramètres", icon: SettingOutlined },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const menuItems = nav.map(({ href, label, icon: Icon }) => {
    const url = new URL(href, "http://localhost");
    const hrefPath = url.pathname;
    const hrefTab = url.searchParams.get("tab");
    const currentTab = searchParams.get("tab");
    const active = pathname === hrefPath && (hrefTab ? currentTab === hrefTab : true);
    
    return {
      key: href,
      icon: <Icon />,
      label: <Link href={href}>{label}</Link>,
      style: active ? { 
        backgroundColor: '#E9FBF3', 
        color: '#01be65',
        border: '1px solid #C7F3DE'
      } : {}
    };
  });

  // Ajouter l'élément de déconnexion au menu
  const allMenuItems = [
    ...menuItems,
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: <Link href="/logout">Se déconnecter</Link>,
      className: 'text-gray-600',
    }
  ];

  return (
    <Layout.Sider 
      width={240}
      className="bg-white border-r border-gray-200"
    >
      <div className="p-4 h-full flex flex-col">
        <div className="flex items-center gap-3 px-3 py-2 bg-gradient-to-r from-[#01be65]/5 to-[#01be65]/10 rounded-lg">
          <Image src="/images/okalogo.png" alt="Oka Logo" width={36} height={36} />
          <div className="flex flex-col leading-tight">
            <Typography.Text strong className="text-sm text-[#01be65]">OKA</Typography.Text>
            <Typography.Text type="secondary" className="text-xs">Admin</Typography.Text>
          </div>
        </div>
        
        <Menu
          mode="inline"
          items={allMenuItems}
          className="border-none mt-2 flex-1"
        />
        
        <div className="mt-auto pt-4">
          <Typography.Text type="secondary" className="text-xs px-3">
            © {new Date().getFullYear()} Oka
          </Typography.Text>
        </div>
      </div>
    </Layout.Sider>
  );
}
