import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth-api';
import { supabase } from '@/lib/rag';

// GET: Fetch the user's voice profile
export async function GET(req: NextRequest) {
  try {
    const userId = await getUserFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .select('voice_profile')
      .eq('firebase_uid', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('[VOICE_PROFILE]', 'Error fetching voice profile:', error);
      return NextResponse.json({ error: 'Failed to fetch voice profile' }, { status: 500 });
    }

    return NextResponse.json({ voiceProfile: data?.voice_profile || {} });
  } catch (err) {
    console.error('[VOICE_PROFILE]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Save/update the voice profile
export async function POST(req: NextRequest) {
  try {
    const userId = await getUserFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { personality, writingStyle, tone, sampleTexts } = await req.json();

    const voiceProfile = {
      personality: personality || '',
      writingStyle: writingStyle || '',
      tone: tone || '',
      sampleTexts: sampleTexts || [],
      updatedAt: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('user_profiles')
      .upsert(
        {
          firebase_uid: userId,
          voice_profile: voiceProfile,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'firebase_uid' }
      )
      .select('voice_profile')
      .single();

    if (error) {
      console.error('[VOICE_PROFILE]', 'Error saving voice profile:', error);
      return NextResponse.json({ error: 'Failed to save voice profile' }, { status: 500 });
    }

    return NextResponse.json({ voiceProfile: data?.voice_profile || voiceProfile });
  } catch (err) {
    console.error('[VOICE_PROFILE]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
