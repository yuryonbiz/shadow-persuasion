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

async function searchKnowledge(goal: string): Promise<string> {
  try {
    const embedding = await getEmbedding(goal);
    if (embedding.length === 0) return '';

    const { data, error } = await supabase.rpc('match_chunks', {
      query_embedding: embedding,
      match_threshold: 0.3,
      match_count: 5,
    });

    if (error || !data || data.length === 0) return '';

    const context = data
      .map(
        (chunk: any) =>
          `[${chunk.book_title} by ${chunk.author} - ${chunk.technique_name}]\n${chunk.content}`
      )
      .join('\n\n---\n\n');

    return `\n\nRELEVANT TECHNIQUE KNOWLEDGE:\n${context}\n\nGround your technique recommendations in this knowledge. Reference specific techniques by name.`;
  } catch (e) {
    console.error('Knowledge search error:', e);
    return '';
  }
}

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
    const { goal } = await req.json();

    if (!goal || typeof goal !== 'string') {
      return NextResponse.json(
        { error: 'Goal is required.' },
        { status: 400 }
      );
    }

    const knowledgeContext = await searchKnowledge(goal);

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
    console.error('[STACKING API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process stacking request.' },
      { status: 500 }
    );
  }
}
