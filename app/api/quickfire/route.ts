import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getEmbedding(text: string): Promise<number[]> {
  try {
    const res = await fetch('https://openrouter.ai/api/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/text-embedding-3-small',
        input: text.slice(0, 8000),
      }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data?.[0]?.embedding || [];
  } catch (e) {
    console.error('Embedding error:', e);
    return [];
  }
}

async function searchKnowledge(situation: string): Promise<string> {
  try {
    const embedding = await getEmbedding(situation);
    if (embedding.length === 0) return '';

    const { data, error } = await supabase.rpc('match_chunks', {
      query_embedding: embedding,
      match_threshold: 0.3,
      match_count: 3,
    });

    if (error || !data || data.length === 0) return '';

    const context = data
      .map(
        (chunk: any) =>
          `[${chunk.book_title} by ${chunk.author} - ${chunk.technique_name}]\n${chunk.content}`
      )
      .join('\n\n---\n\n');

    return `\n\nRELEVANT TACTICAL TECHNIQUES:\n${context}\n\nApply these techniques in your response.`;
  } catch (e) {
    console.error('Knowledge search error:', e);
    return '';
  }
}

const SYSTEM_PROMPT = `You are a tactical influence advisor. The user is in a LIVE situation and needs an answer in seconds. Be direct, specific, give exact words. No preamble, no disclaimers.

You MUST respond with valid JSON in this exact format:
{
  "sayThis": "Exact words the user should say right now",
  "why": "One sentence explaining the psychology behind it",
  "avoid": "One specific thing NOT to say or do",
  "ifBackfires": "One fallback line if the first approach doesn't work"
}`;

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { situation, context } = await req.json();

    if (!situation || typeof situation !== 'string') {
      return NextResponse.json(
        { error: 'Situation text is required.' },
        { status: 400 }
      );
    }

    const knowledgeContext = await searchKnowledge(situation);

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
          { role: 'system', content: SYSTEM_PROMPT + knowledgeContext },
          { role: 'user', content: userContent },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter error:', response.status, errorText);
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
    console.error('[QUICKFIRE API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process quickfire request.' },
      { status: 500 }
    );
  }
}
