"use client";
import React from "react";
import { useSearchParams } from "next/navigation";
import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  BuildOutlined,
  BarChartOutlined,
  SettingOutlined,
  SafetyOutlined,
} from "@ant-design/icons";

const menuItems = [
  { key: "overview", icon: <DashboardOutlined />, label: "Overview" },
  { key: "users", icon: <UserOutlined />, label: "Utilisateurs" },
  { key: "agencies", icon: <BuildOutlined />, label: "Agences" },
  { key: "reports", icon: <BarChartOutlined />, label: "Rapports" },
  { key: "security", icon: <SafetyOutlined />, label: "Sécurité" },
  { key: "settings", icon: <SettingOutlined />, label: "Paramètres" },
];

export function AdminSidebar() {
  const searchParams = useSearchParams();
  const [collapsed, setCollapsed] = React.useState(false);
  const currentTab = searchParams.get("tab") || "overview";

  return (
    <Layout.Sider
      width={240}
      collapsedWidth={64}
      collapsible
      collapsed={collapsed}
      onCollapse={(value) => setCollapsed(value)}
      theme="dark"
      style={{ background: "#071e34", height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}
    >
      <div className="flex flex-col">
        <div className="demo-logo-vertical" />

        <div className="flex-1 overflow-y-auto">
          <Menu
            theme="dark"
            defaultSelectedKeys={["overview"]}
            mode="inline"
            selectedKeys={[currentTab]}
            onSelect={({ key }) => {
              const newSearchParams = new URLSearchParams(searchParams.toString());
              newSearchParams.set("tab", String(key));
              window.history.pushState(null, "", `?${newSearchParams.toString()}`);
            }}
            items={menuItems}
            style={{ background: "transparent", color: "#cbd5e1" }}
          />
        </div>
      </div>
    </Layout.Sider>
  );
}
