import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SYSTEM_PROMPT = `You are an expert persuasion coach analyzing feedback on advice that was given to a user. Based on whether the advice worked, partially worked, or failed, provide actionable analysis.

Respond in this exact JSON format:
{
  "analysis": "Brief overall analysis of what happened",
  "whatWorked": "What aspects of the approach were effective (even if overall it failed)",
  "whatToImprove": "Specific things to change or improve next time",
  "adjustedApproach": "A concrete revised approach for next time"
}

Be specific and tactical. Reference psychological principles where relevant.`;

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

async function searchKnowledge(query: string): Promise<string> {
  try {
    const embedding = await getEmbedding(query);
    if (embedding.length === 0) return '';

    const { data, error } = await supabase.rpc('match_chunks', {
      query_embedding: embedding,
      match_threshold: 0.35,
      match_count: 3,
    });

    if (error || !data || data.length === 0) return '';

    return data
      .map((chunk: any) =>
        `[${chunk.book_title} by ${chunk.author}]\n${chunk.content}`
      )
      .join('\n\n---\n\n');
  } catch (e) {
    console.error('Knowledge search error:', e);
    return '';
  }
}

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { type, referenceId, originalAdvice, outcome, notes } = await req.json();

    if (!originalAdvice || !outcome) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    // Search for relevant knowledge to improve the advice
    const knowledgeContext = await searchKnowledge(
      `${originalAdvice} ${outcome === 'failed' ? 'what went wrong' : 'improvement'}`
    );

    const userMessage = `FEATURE TYPE: ${type || 'general'}
ORIGINAL ADVICE GIVEN: "${originalAdvice}"
OUTCOME: ${outcome}
${notes ? `USER NOTES: "${notes}"` : ''}
${knowledgeContext ? `\nRELEVANT KNOWLEDGE:\n${knowledgeContext}` : ''}

Analyze this outcome and provide specific improvement suggestions.`;

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
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[FEEDBACK API] OpenRouter error:', response.status, errorText);
      return NextResponse.json({ error: 'AI service error' }, { status: 502 });
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    try {
      const result = JSON.parse(content);
      // Return the feedback data so the client can save it
      return NextResponse.json({
        ...result,
        feedbackRecord: {
          id: crypto.randomUUID(),
          type,
          referenceId,
          originalAdvice,
          outcome,
          notes,
          createdAt: new Date().toISOString(),
        },
      });
    } catch (parseError) {
      console.error('[FEEDBACK API] JSON parse error:', parseError);
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }
  } catch (error) {
    console.error('[FEEDBACK API] Error:', error);
    return NextResponse.json({ error: 'Failed to process feedback.' }, { status: 500 });
  }
}
