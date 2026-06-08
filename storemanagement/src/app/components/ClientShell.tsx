'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import ToastDisplay from './ui/ToastDisplay';
import { useAuth } from '../context/AuthContext';

// Pages accessible without login
const PUBLIC_PATHS = ['/', '/login', '/register'];

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  const isAdmin    = pathname.startsWith('/admin');
  const isPublic   = PUBLIC_PATHS.includes(pathname);
  const isAuthPage = pathname === '/login' || pathname === '/register';

  // Protected shopping pages: redirect to /login if not logged in
  useEffect(() => {
    if (isAdmin || isPublic) return;
    if (!user) {
      router.push('/login');
    }
  }, [user, isAdmin, isPublic, router, pathname]);

  // Admin pages — handled by their own layout
  if (isAdmin) return <>{children}</>;

  // Auth pages (login / register) — no Navbar/Footer, just the form
  if (isAuthPage) return <>{children}</>;

  // Protected pages: unauthenticated → render nothing while redirecting
  if (!isPublic && !user) return null;

  // Homepage (public) + logged-in client pages → full shell
  return (
    <>
      <Navbar />
      {children}
      <ToastDisplay />
      <a href="#" className="btn btn-primary border-3 border-primary rounded-circle back-to-top">
        <i className="fa fa-arrow-up"></i>
      </a>
      <Footer />
    </>
  );
}
