import { NextRequest, NextResponse } from 'next/server';
import { searchKnowledge } from '@/lib/rag';
import { RAG_ENFORCEMENT } from '@/lib/prompts';
import { getUserFromRequest } from '@/lib/auth-api';
import { getVoiceProfile } from '@/lib/voice-profile';

const SYSTEM_PROMPT = `You are a tactical influence strategist. Given a goal, create technique stacking sequences that combine multiple persuasion/influence techniques in optimal order for maximum impact.

You MUST respond with valid JSON in this exact format:
{
  "primary": {
    "name": "Stack name (e.g., 'The Velvet Hammer')",
    "philosophy": "One sentence describing the approach philosophy",
    "steps": [
      {
        "stepNumber": 1,
        "technique": "Technique Name",
        "action": "Exactly what to say or do at this step",
        "rationale": "Why this technique at this point in the sequence",
        "ifPositive": "Step N",
        "ifResist": "Step M"
      }
    ]
  },
  "alternatives": [
    {
      "name": "Alternative stack name",
      "philosophy": "Different approach philosophy (e.g., aggressive vs rapport-based)",
      "steps": [same format as primary]
    }
  ]
}

Rules:
- Primary stack should have 4-6 steps
- Each alternative should have 4-6 steps
- Include exactly 2 alternatives with different philosophies (e.g., "Aggressive" vs "Rapport-Based", or "Direct" vs "Indirect")
- ifPositive and ifResist should reference step numbers as "Step N" or "End (success)" / "End (walk away)"
- Use real, named persuasion techniques
- Actions should be specific scripts, not vague advice
- Rationale should explain the psychological sequence logic`;

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserFromRequest(req);
    const voiceContext = await getVoiceProfile(userId);

    const { goal } = await req.json();

    if (!goal || typeof goal !== 'string') {
      return NextResponse.json(
        { error: 'Goal is required.' },
        { status: 400 }
      );
    }

    const ragContext = await searchKnowledge(goal);
    const knowledgeContext = ragContext ? `\n\n${RAG_ENFORCEMENT}\n\nRELEVANT TECHNIQUE KNOWLEDGE:\n${ragContext}` : '';

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
          {
            role: 'user',
            content: `Create technique stacking sequences for this goal: "${goal}"`,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.8,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[STACKING]', 'OpenRouter error:', response.status, errorText);
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
    console.error('[STACKING]', error);
    return NextResponse.json(
      { error: 'Failed to process stacking request.' },
      { status: 500 }
    );
  }
}
