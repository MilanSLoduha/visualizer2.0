'use client';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Kontrola JWT tokenu pri načítaní stránky
    const checkAuth = () => {
      const token = localStorage.getItem('access_token');
      setIsAuthenticated(!!token);
      setIsLoading(false);
    };

    checkAuth();

    // Sledovanie zmien v localStorage (pre ostatné taby)
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Aktualizácia stavu pri zmene cesty (napr. po prihlásení)
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setIsAuthenticated(!!token);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setIsAuthenticated(false);
    router.push('/login');
  };

  return (
    <html lang="sk" className="h-full">
      <body className={`${inter.className} h-full`}>
        <div className="min-h-full bg-gray-50">
          {/* Dynamická hlavička */}
          <header className="bg-white shadow-sm">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                  </div>
                  <Link href="/" className="focus:outline-none">
                    <h1 className="text-lg font-semibold text-gray-900 hover:underline">
                      Audio Vizualizér
                    </h1>
                  </Link>
                </div>
                
                {/* Dynamické tlačidlá */}
                <div className="flex items-center space-x-3">
                  {!isLoading && (
                    <>
                      {isAuthenticated ? (
                        // Keď je prihlásený - zobraz Profil + Odhlásiť sa
                        <>
                          <Link 
                            href="/profile"
                            className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                          >
                            Profil
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                          >
                            Odhlásiť sa
                          </button>
                        </>
                      ) : (
                        // Keď nie je prihlásený - zobraz len Prihlásiť sa
                        <Link 
                          href="/login"
                          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                        >
                          Prihlásiť sa
                        </Link>
                      )}
                    </>
                  )}
                  
                  {/* Loading indikátor */}
                  {isLoading && (
                    <div className="h-8 w-16 animate-pulse rounded bg-gray-200"></div>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* Obsah jednotlivých stránok */}
          {children}
        </div>
      </body>
    </html>
  );
}