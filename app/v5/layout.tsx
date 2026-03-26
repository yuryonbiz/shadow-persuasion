'use client';
import { useEffect } from 'react';

export default function V5Layout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.body.style.background = '#FFFFFF';
    document.body.style.color = '#111111';
    return () => { document.body.style.background = ''; document.body.style.color = ''; };
  }, []);
  return <>{children}</>;
}
