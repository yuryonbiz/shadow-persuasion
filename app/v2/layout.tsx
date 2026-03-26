'use client';
import { useEffect } from 'react';

export default function V2Layout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.body.style.background = '#0C0C0C';
    document.body.style.color = '#E8E8E0';
    return () => { document.body.style.background = ''; document.body.style.color = ''; };
  }, []);
  return <>{children}</>;
}
