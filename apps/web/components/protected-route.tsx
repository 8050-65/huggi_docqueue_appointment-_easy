// apps/web/components/protected-route.tsx
'use client';

import { useAuthStore } from '@/lib/auth-store';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { accessToken } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !accessToken) {
      router.push('/login');
    }
  }, [mounted, accessToken, router]);

  if (!mounted || !accessToken) {
    return null;
  }

  return <>{children}</>;
}
