import { supabase } from './rag';

export interface VoiceProfile {
  personality?: string;
  writingStyle?: string;
  tone?: string;
  sampleTexts?: string[];
}

export async function getVoiceProfile(userId: string | null): Promise<string> {
  if (!userId) return '';

  try {
    const { data } = await supabase
      .from('user_profiles')
      .select('voice_profile')
      .eq('firebase_uid', userId)
      .single();

    if (!data?.voice_profile) return '';

    const vp = data.voice_profile as VoiceProfile;
    if (!vp.personality && !vp.writingStyle && !vp.tone && !vp.sampleTexts?.length) return '';

    let prompt = '\n\nUSER VOICE PROFILE — Match this person\'s communication style:\n';
    if (vp.personality) prompt += `Personality: ${vp.personality}\n`;
    if (vp.writingStyle) prompt += `Writing Style: ${vp.writingStyle}\n`;
    if (vp.tone) prompt += `Preferred Tone: ${vp.tone}\n`;
    if (vp.sampleTexts?.length) {
      prompt += `Sample Messages (match this voice):\n`;
      vp.sampleTexts.slice(0, 3).forEach((s, i) => {
        prompt += `  Example ${i + 1}: "${s.slice(0, 500)}"\n`;
      });
    }
    prompt += '\nCRITICAL: All scripts, responses, and suggested messages you generate MUST sound like this person wrote them. Match their vocabulary, sentence length, tone, and personality. Do NOT use generic corporate language unless that matches their style.\n';

    return prompt;
  } catch {
    return '';
  }
}
