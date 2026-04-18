'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';

interface SubscriptionData {
  active: boolean;
  plan?: string;
  status?: string;
  currentPeriodEnd?: string;
  customerId?: string;
}

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const check = async () => {
      try {
        const token = await user.getIdToken();
        const res = await fetch('/api/stripe/status', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setSubscription(data);
        }
      } catch {
        // Silently fail — subscription check is non-critical
      } finally {
        setLoading(false);
      }
    };

    check();
  }, [user]);

  return {
    subscription,
    loading,
    isActive: subscription?.active || false,
  };
}
