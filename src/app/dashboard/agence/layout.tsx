"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Layout, Menu, theme } from "antd";
import {
  PieChartOutlined,
  CarOutlined,
  UsergroupAddOutlined,
  UserOutlined,
  SettingOutlined,
  CalendarOutlined,
  DollarOutlined,
  FileTextOutlined
} from "@ant-design/icons";

const { Header, Content, Sider } = Layout;

export default function AgenceDashboardLayout({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const currentTab = searchParams.get("tab") || "overview";

  const menuItems = [
    { key: "overview", icon: <PieChartOutlined />, label: "Aperçu" },
    { key: "routes", icon: <CarOutlined />, label: "Trajets" },
    { key: "bookings", icon: <UsergroupAddOutlined />, label: "Réservations" },
    { key: "agents", icon: <UserOutlined />, label: "Agents" },
    { key: "fleet", icon: <CarOutlined />, label: "Flotte" },
    { key: "voyages", icon: <CalendarOutlined />, label: "Voyages" },
    { key: "settings", icon: <SettingOutlined />, label: "Paramètres" },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <div className="demo-logo-vertical" />
        <Menu
          theme="dark"
          defaultSelectedKeys={["overview"]}
          mode="inline"
          selectedKeys={[currentTab]}
          onSelect={({ key }) => {
            const newSearchParams = new URLSearchParams(searchParams.toString());
            newSearchParams.set("tab", key);
            window.history.pushState(null, "", `?${newSearchParams.toString()}`);
          }}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }} />
        <Content style={{ margin: "0 16px" }}>
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
              marginTop: 16
            }}
          >
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
