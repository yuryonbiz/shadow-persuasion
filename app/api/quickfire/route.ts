import { NextRequest, NextResponse } from 'next/server';
import { searchKnowledge } from '@/lib/rag';
import { RAG_ENFORCEMENT, HANDLER_VOICE } from '@/lib/prompts';
import { getUserFromRequest } from '@/lib/auth-api';
import { getVoiceProfile } from '@/lib/voice-profile';

const SYSTEM_PROMPT = `${HANDLER_VOICE}
You are a tactical influence advisor. The user is in a LIVE situation and needs an answer in seconds. Be direct, specific, give exact words. No preamble, no disclaimers.

Before responding, classify the situation: FRAME_CONTEST | NEGOTIATION | RAPPORT_CRISIS | EMOTIONAL_HIJACK | STATUS_CHALLENGE | COMPLIANCE_REQUEST
Select the optimal counter-technique, then generate the script.

You MUST respond with valid JSON in this exact format:
{
  "classification": "FRAME_CONTEST|NEGOTIATION|RAPPORT_CRISIS|EMOTIONAL_HIJACK|STATUS_CHALLENGE|COMPLIANCE_REQUEST",
  "technique": "Name of the technique being applied (from knowledge base if available)",
  "sayThis": "Exact words the user should say right now",
  "why": "One sentence explaining the psychology behind it, citing source if from knowledge base",
  "avoid": "One specific thing NOT to say or do",
  "ifBackfires": "One fallback line if the first approach doesn't work"
}`;

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserFromRequest(req);
    const voiceContext = await getVoiceProfile(userId);

    const { situation, context } = await req.json();

    if (!situation || typeof situation !== 'string') {
      return NextResponse.json(
        { error: 'Situation text is required.' },
        { status: 400 }
      );
    }

    const ragContext = await searchKnowledge(situation, { count: 3 });
    const knowledgeContext = ragContext ? `\n\n${RAG_ENFORCEMENT}\n\nRELEVANT TACTICAL TECHNIQUES:\n${ragContext}` : '';

    const userContent = context
      ? `SITUATION: ${situation}\n\nCONTEXT (who this is about): ${context}`
      : `SITUATION: ${situation}`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://shadow-persuasion.vercel.app',
        'X-Title': 'Shadow Persuasion',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT + knowledgeContext + voiceContext },
          { role: 'user', content: userContent },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[QUICKFIRE]', 'OpenRouter error:', response.status, errorText);
      return NextResponse.json({ error: 'AI service error' }, { status: 502 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json({ error: 'No response from AI' }, { status: 502 });
    }

    const parsed = JSON.parse(content);
    return NextResponse.json(parsed);
  } catch (error) {
    console.error('[QUICKFIRE]', error);
    return NextResponse.json(
      { error: 'Failed to process quickfire request.' },
      { status: 500 }
    );
  }
}
