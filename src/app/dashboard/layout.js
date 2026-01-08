'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';

export default function DashboardLayoutWrapper({ children }) {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
    if (!token) {
      router.push('/');
    }
  }, [router]);

  return <DashboardLayout>{children}</DashboardLayout>;
}


