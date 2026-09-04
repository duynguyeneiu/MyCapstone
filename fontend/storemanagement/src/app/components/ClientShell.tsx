'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Navbar from './Navbar';
import CategoryBar from './CategoryBar';
import Footer from './Footer';
import ToastDisplay from './ui/ToastDisplay';
import { useAuth } from '../context/AuthContext';

const PUBLIC_PREFIXES = ['/login', '/register', '/shop', '/search', '/product'];

function isPublicPath(pathname: string) {
  return pathname === '/' || PUBLIC_PREFIXES.some(p => pathname === p || pathname.startsWith(p + '/') || pathname.startsWith(p + '?'));
}

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  const isAdmin    = pathname.startsWith('/admin');
  const isPublic   = isPublicPath(pathname);
  const isAuthPage = pathname === '/login' || pathname === '/register';

  useEffect(() => {
    if (isAdmin || isPublic) return;
    if (!user) {
      router.push('/login');
    }
  }, [user, isAdmin, isPublic, router, pathname]);

  if (isAdmin) return <>{children}</>;

  if (isAuthPage) return <>{children}</>;

  if (!isPublic && !user) return null;

  const showCategoryBar = pathname === '/' || pathname.startsWith('/shop');

  return (
    <>
      <div style={{ position: 'sticky', top: 0, zIndex: 50 }}>
        <Navbar />
        {showCategoryBar && <CategoryBar />}
      </div>
      {children}
      <ToastDisplay />
      <a href="#" className="btn btn-primary border-3 border-primary rounded-circle back-to-top">
        <i className="fa fa-arrow-up"></i>
      </a>
      <Footer />
    </>
  );
}
