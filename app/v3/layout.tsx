'use client';
import { useEffect } from 'react';

export default function V3Layout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.body.style.background = '#FAF8F5';
    document.body.style.color = '#1A1A2E';
    return () => { document.body.style.background = ''; document.body.style.color = ''; };
  }, []);
  return <>{children}</>;
}
