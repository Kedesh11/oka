"use client";

import { ConfigProvider } from "antd";
import { StyleProvider } from "@ant-design/cssinjs";
import { ReactNode } from "react";

interface AntdProviderProps {
  children: ReactNode;
}

export default function AntdProvider({ children }: AntdProviderProps) {
  return (
    <StyleProvider hashPriority="high">
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#00B140',
            colorLink: '#00B140',
            colorLinkHover: '#00A038',
            controlOutline: '#00B140',
            // Élimine les bleus "processing/info" par défaut d'AntD
            colorInfo: '#00B140',
            borderRadius: 8,       // boutons
            borderRadiusLG: 12,    // cartes
            borderRadiusSM: 8,     // champs
          },
          components: {
            Button: {
              colorPrimary: '#00B140',
              colorPrimaryHover: '#00A038',
              colorPrimaryActive: '#009432',
              borderRadius: 8,
            },
            Tabs: {
              itemActiveColor: '#00B140',
              itemSelectedColor: '#00B140',
              inkBarColor: '#00B140',
            },
            Tag: {
              // Les tags de statut "processing" utilisent colorInfo
              defaultBg: '#F0F9F4',
              defaultColor: '#00B140',
            },
            Pagination: {
              colorPrimary: '#00B140',
              colorPrimaryHover: '#00A038',
            },
            Checkbox: {
              colorPrimary: '#00B140',
              colorPrimaryHover: '#00A038',
            },
            Switch: {
              colorPrimary: '#00B140',
              colorPrimaryHover: '#00A038',
            },
          },
        }}
      >
        {children}
      </ConfigProvider>
    </StyleProvider>
  );
}
