'use client';
import { useEffect } from 'react';

export default function V4Layout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.body.style.background = '#F4ECD8';
    document.body.style.color = '#1A1A1A';
    return () => { document.body.style.background = ''; document.body.style.color = ''; };
  }, []);
  return <>{children}</>;
}
