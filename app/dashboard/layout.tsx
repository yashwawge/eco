'use client';

import { SessionProvider } from 'next-auth/react';
import Navbar from '@/components/Navbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <div className="min-h-screen">
        <Navbar />
        {children}
      </div>
    </SessionProvider>
  );
}
