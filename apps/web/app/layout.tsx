// apps/web/app/layout.tsx
import type { Metadata } from 'next';
import { Provider } from '@/components/provider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Huggi Hospital Queue',
  description: 'Hospital queue and appointment management system',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
