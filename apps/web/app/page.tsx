// apps/web/app/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();
  const { accessToken } = useAuthStore();

  useEffect(() => {
    if (accessToken) {
      router.push('/admin/dashboard');
    } else {
      router.push('/login');
    }
  }, [accessToken, router]);

  return null;
}
