import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getUserFromRequest } from '@/lib/auth-api';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST: Register or update user on login
export async function POST(req: NextRequest) {
  try {
    const userId = await getUserFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { email, displayName } = await req.json();

    const { error } = await supabase
      .from('users')
      .upsert({
        firebase_uid: userId,
        email: email || null,
        display_name: displayName || null,
        last_login_at: new Date().toISOString(),
      }, { onConflict: 'firebase_uid' });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[USER_REGISTER]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
