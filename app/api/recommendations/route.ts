import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { techniques } from '@/lib/techniques';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SYSTEM_PROMPT = `You are an expert persuasion coach. Given a user's goal, their recently practiced techniques, and their weak areas, recommend 3-5 techniques they should focus on next.

You have access to a library of techniques and relevant knowledge from persuasion books.

Respond in this exact JSON format:
{
  "recommendations": [
    {
      "techniqueId": "technique-id-from-library",
      "techniqueName": "Technique Name",
      "reason": "Why this technique is recommended for their goal",
      "priority": "High" or "Medium",
      "relatedGoal": "How this connects to their stated goal"
    }
  ],
  "learningPath": [
    {
      "step": 1,
      "technique": "technique-id",
      "rationale": "Why learn this first/next"
    }
  ]
}

Only recommend techniques from the provided library. Prioritize techniques that address weak areas and align with the user's goal.`;

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
      match_count: 4,
    });

    if (error || !data || data.length === 0) return '';

    return data
      .map((chunk: any) =>
        `[${chunk.book_title} by ${chunk.author} - ${chunk.technique_name}]\n${chunk.content}`
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
    const { userGoal, recentTechniques = [], weakAreas = [] } = await req.json();

    if (!userGoal) {
      return NextResponse.json({ error: 'No goal provided.' }, { status: 400 });
    }

    // Build technique library context
    const techniqueList = techniques
      .map((t) => `- ${t.id}: ${t.name} (${t.category}, difficulty ${t.difficulty}) - ${t.description}`)
      .join('\n');

    // RAG search
    const knowledgeContext = await searchKnowledge(
      `${userGoal} persuasion techniques for ${weakAreas.join(', ')}`
    );

    const userMessage = `USER GOAL: ${userGoal}

RECENTLY PRACTICED TECHNIQUES: ${recentTechniques.length > 0 ? recentTechniques.join(', ') : 'None yet'}

WEAK AREAS: ${weakAreas.length > 0 ? weakAreas.join(', ') : 'None identified yet'}

AVAILABLE TECHNIQUES:
${techniqueList}

${knowledgeContext ? `\nRELEVANT KNOWLEDGE BASE EXCERPTS:\n${knowledgeContext}` : ''}

Based on the user's goal and current skill gaps, recommend 3-5 techniques and create a learning path.`;

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
      console.error('[RECOMMENDATIONS API] OpenRouter error:', response.status, errorText);
      return NextResponse.json({ error: 'AI service error' }, { status: 502 });
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    try {
      const result = JSON.parse(content);
      return NextResponse.json(result);
    } catch (parseError) {
      console.error('[RECOMMENDATIONS API] JSON parse error:', parseError);
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }
  } catch (error) {
    console.error('[RECOMMENDATIONS API] Error:', error);
    return NextResponse.json({ error: 'Failed to generate recommendations.' }, { status: 500 });
  }
}
