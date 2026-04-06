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

async function searchKnowledge(query: string): Promise<string> {
  try {
    const embedding = await getEmbedding(query);
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

    return `\n\nRELEVANT TECHNIQUE KNOWLEDGE:\n${context}\n\nUse these techniques to craft realistic challenges.`;
  } catch (e) {
    console.error('Knowledge search error:', e);
    return '';
  }
}

const GENERATE_SYSTEM_PROMPT = `You are a sparring coach for influence and persuasion training. Generate realistic conversational challenges that test the user's ability to respond under pressure.

You MUST respond with valid JSON in this exact format:
{
  "rounds": [
    {
      "challenge": "The exact provocative statement or scenario the user must respond to",
      "context": "Brief context setting the scene (1 sentence)",
      "idealTechniques": ["technique1", "technique2"]
    }
  ]
}

Generate exactly 10 rounds. Each challenge should be a direct quote or situation that demands a tactical response. Make them progressively harder. Be specific and realistic.`;

const GRADE_SYSTEM_PROMPT = `You are a sparring judge for influence and persuasion training. Grade the user's response to a conversational challenge.

You MUST respond with valid JSON in this exact format:
{
  "score": 7,
  "feedback": "One concise sentence about what was strong or weak",
  "techniquesDetected": ["technique1", "technique2"]
}

Score from 1-10:
- 1-3: Weak, defensive, no technique used
- 4-5: Adequate but predictable
- 6-7: Good use of technique, could be sharper
- 8-9: Excellent tactical response
- 10: Masterful, textbook execution

Be honest and direct. If the response is empty or says TIME'S UP, score it 0.`;

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'generate') {
      const { sparringType, difficulty } = body;

      const typeDescriptions: Record<string, string> = {
        'Deflecting Manipulation': 'Someone is trying to manipulate the user using psychological tactics. The user must deflect without escalating.',
        'Objection Handling': 'A client, boss, or counterpart raises tough objections. The user must handle them tactically.',
        'Frame Wars': 'Two people competing for frame control. The user must assert or maintain their frame against strong opposition.',
        'Negotiation Pressure': 'High-pressure negotiation scenarios where someone is applying tactics against the user.',
        'Emotional Provocations': 'Someone is trying to provoke an emotional reaction. The user must stay composed and respond strategically.',
      };

      const knowledgeContext = await searchKnowledge(
        `${sparringType} persuasion techniques tactical response`
      );

      const timeLimit = difficulty === 'Advanced' ? 8 : 15;

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
            { role: 'system', content: GENERATE_SYSTEM_PROMPT + knowledgeContext },
            {
              role: 'user',
              content: `Generate 10 sparring rounds for: "${sparringType}"\n\nDescription: ${typeDescriptions[sparringType] || sparringType}\n\nDifficulty: ${difficulty} (${timeLimit}s per round). ${difficulty === 'Advanced' ? 'Make challenges especially tricky and layered.' : 'Keep challenges clear but still demanding.'}`,
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.9,
          max_tokens: 3000,
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
    }

    if (action === 'grade') {
      const { challenge, userResponse, idealTechniques, timeUsed } = body;

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
            { role: 'system', content: GRADE_SYSTEM_PROMPT },
            {
              role: 'user',
              content: `CHALLENGE: "${challenge}"\n\nUSER RESPONSE: "${userResponse || '[TIME EXPIRED - NO RESPONSE]'}"\n\nIDEAL TECHNIQUES: ${idealTechniques?.join(', ') || 'any'}\n\nTIME USED: ${timeUsed !== undefined ? `${timeUsed}s` : 'unknown'}`,
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.5,
          max_tokens: 300,
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
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('[SPARRING API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process sparring request.' },
      { status: 500 }
    );
  }
}
