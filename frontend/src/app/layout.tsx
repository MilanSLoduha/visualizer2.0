import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Mino App',
  description: 'Aplikácia s JWT autentifikáciou',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sk" className="h-full">
      <body className={`${inter.className} h-full`}>
        <div className="min-h-full bg-gray-50">{children}</div>
      </body>
    </html>
  );
}