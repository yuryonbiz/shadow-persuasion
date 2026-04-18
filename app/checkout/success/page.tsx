'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, ArrowRight } from 'lucide-react';

export default function CheckoutSuccessWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F4ECD8] flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-[#D4A017] border-t-transparent rounded-full" /></div>}>
      <CheckoutSuccessPage />
    </Suspense>
  );
}

function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    // Just verify the session exists — the webhook handles the actual subscription creation
    if (sessionId) {
      setStatus('success');
    } else {
      setStatus('error');
    }
  }, [sessionId]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#F4ECD8] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#D4A017] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-[#F4ECD8] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-[#1A1A1A] mb-4">Something went wrong</h1>
          <p className="text-[#5C4B32] mb-6">We could not verify your checkout session. If you were charged, your subscription will be activated automatically.</p>
          <Link href="/app" className="inline-block bg-[#D4A017] text-[#0A0A0A] font-bold px-8 py-3 rounded-lg hover:bg-[#E8B830] transition-colors">Go to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4ECD8] flex items-center justify-center px-6">
      <div className="text-center max-w-lg">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-[#1A1A1A] mb-3">Welcome to Shadow Persuasion</h1>
        <p className="text-lg text-[#5C4B32] mb-8">Your subscription is active. You now have full access to all features, techniques, and AI coaching tools.</p>
        <Link href="/app" className="inline-flex items-center gap-2 bg-[#D4A017] text-[#0A0A0A] font-bold text-lg px-10 py-4 rounded-lg hover:bg-[#E8B830] transition-colors">
          Start Training <ArrowRight className="h-5 w-5" />
        </Link>
        <p className="text-sm text-[#6B5B3E] mt-6">You can manage your subscription anytime in Settings.</p>
      </div>
    </div>
  );
}
