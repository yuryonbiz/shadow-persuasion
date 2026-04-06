'use client';

import '../../globals.css';

import { useEffect } from 'react';

export default function V4Layout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.body.style.backgroundColor = '#F4ECD8';
    document.body.style.color = '#1A1A1A';
    return () => {
      document.body.style.backgroundColor = '';
      document.body.style.color = '';
    };
  }, []);

  return <>{children}</>;
}
