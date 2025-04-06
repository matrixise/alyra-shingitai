import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main>
        <SidebarTrigger />
        <ConnectButton showBalance={false} chainStatus="icon" />
        {children}
      </main>
    </SidebarProvider>
  );
};

export default Layout;
