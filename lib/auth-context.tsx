'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoading(false);

      // Register/update user in database on login.
      // This is also the server-side entitlement gate: if the user has
      // no paid subscription (someone who snuck past the client gate or
      // was added manually in Firebase), the server returns 403 and we
      // sign them out so they can't reach the app.
      if (user) {
        try {
          const token = await user.getIdToken();
          const res = await fetch('/api/user/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ email: user.email, displayName: user.displayName }),
          });
          if (res.status === 403) {
            // No entitlement — boot them and park a message on /login.
            const data = await res.json().catch(() => ({}));
            if (data?.error === 'not_entitled') {
              try {
                sessionStorage.setItem('sp_login_notice', 'not_entitled');
              } catch {}
              await firebaseSignOut(auth);
              if (typeof window !== 'undefined') {
                window.location.href = '/login';
              }
            }
          }
        } catch {}
      }
    });

    return unsubscribe;
  }, []);

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
