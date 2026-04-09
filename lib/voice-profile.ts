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
    prompt += `\nCRITICAL — VOICE MATCHING REQUIREMENTS:
- ONLY apply voice matching to the actual QUOTED MESSAGES the user should say/send/type (counter-scripts, response options, "say this" text, suggested replies)
- Do NOT change technique names, strategy labels, psychological principle names, or your explanatory analysis to match the user's voice. Those stay professional and precise.
- Example: The strategy should still be called "Authority Building" NOT "Authority Building with Humor". But the suggested MESSAGE under that strategy should match the user's casual/funny voice.
- Match their vocabulary, sentence length, tone, and personality ONLY in the quoted response text
- If they are funny/casual, the suggested messages should be funny/casual — but your strategic analysis stays professional
- Do NOT generate generic corporate language in the response scripts unless that matches their actual style
`;

    return prompt;
  } catch {
    return '';
  }
}
