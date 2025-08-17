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
            colorPrimary: '#01be65',
            borderRadius: 6,
          },
        }}
      >
        {children}
      </ConfigProvider>
    </StyleProvider>
  );
}
