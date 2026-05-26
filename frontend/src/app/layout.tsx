import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/shared/components/Providers';

export const metadata: Metadata = {
  title: 'SupportFlow AI',
  description: 'AI-powered customer support platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
