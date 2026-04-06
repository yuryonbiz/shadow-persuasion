import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { scenarios } from '@/lib/scenarios';

export const maxDuration = 60;

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY!;
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getEmbedding(text: string): Promise<number[]> {
  try {
    const res = await fetch('https://openrouter.ai/api/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_KEY}`,
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

async function searchKnowledgeForDebrief(scenarioContext: string): Promise<string> {
  try {
    const embedding = await getEmbedding(scenarioContext);
    if (embedding.length === 0) return '';

    const { data, error } = await supabase.rpc('match_chunks', {
      query_embedding: embedding,
      match_threshold: 0.3,
      match_count: 5,
    });

    if (error || !data || data.length === 0) return '';

    const context = data.map((chunk: any) =>
      `[${chunk.book_title} by ${chunk.author} - ${chunk.technique_name}]\n${chunk.content}`
    ).join('\n\n---\n\n');

    return `\n\nKNOWLEDGE BASE REFERENCE (use these to ground your evaluation):
${context}`;
  } catch (e) {
    console.error('Knowledge search error:', e);
    return '';
  }
}

export async function POST(req: NextRequest) {
  try {
    const { messages, scenarioId } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided.' }, { status: 400 });
    }

    const scenario = scenarios.find(s => s.id === scenarioId);
    if (!scenario) {
      return NextResponse.json({ error: 'Scenario not found.' }, { status: 404 });
    }

    // Build context for RAG search from user messages + scenario
    const userMessages = messages.filter((m: any) => m.role === 'user').map((m: any) => m.content).join(' ');
    const searchContext = `${scenario.title} ${scenario.objective} ${scenario.techniques.join(' ')} ${userMessages.slice(0, 2000)}`;
    const knowledgeContext = await searchKnowledgeForDebrief(searchContext);

    // Strip coaching annotations from conversation for clean analysis
    const cleanMessages = messages.map((m: any) => ({
      role: m.role,
      content: m.content.replace(/<!--COACHING:.*?-->/gs, '').trim(),
    }));

    const conversationTranscript = cleanMessages
      .map((m: any) => `${m.role === 'user' ? 'USER' : 'COUNTERPART'}: ${m.content}`)
      .join('\n\n');

    const debriefPrompt = `You are an expert scenario debrief analyst for a persuasion/influence training platform.

SCENARIO: "${scenario.title}"
Description: ${scenario.description}
Objective: ${scenario.objective}
Target techniques: ${scenario.techniques.join(', ')}
${knowledgeContext}

CONVERSATION TRANSCRIPT:
${conversationTranscript}

Analyze the user's performance in this role-play scenario. Return a JSON object with exactly this structure:
{
  "score": <number 1-100>,
  "techniquesUsed": [
    { "name": "<technique name>", "example": "<quote or paraphrase from user's message>", "effectiveness": <1-10> }
  ],
  "missedOpportunities": [
    { "moment": "<describe the moment>", "technique": "<what they should have used>", "suggestedResponse": "<what they could have said>" }
  ],
  "turningPoints": [
    { "moment": "<describe the key moment>", "impact": "positive|negative", "explanation": "<why this was significant>" }
  ],
  "suggestions": [
    "<specific actionable improvement suggestion>"
  ]
}

Be specific. Reference actual messages from the conversation. Ground your analysis in the knowledge base techniques. Score fairly: 50 is average, 80+ is excellent, below 30 is poor.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_KEY}`,
        'HTTP-Referer': 'https://shadow-persuasion.vercel.app',
        'X-Title': 'Shadow Persuasion',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o',
        messages: [
          { role: 'system', content: debriefPrompt },
          { role: 'user', content: 'Analyze the conversation and provide the debrief JSON.' },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter debrief error:', response.status, errorText);
      return NextResponse.json({ error: 'AI service error' }, { status: 502 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json({ error: 'No debrief content returned' }, { status: 502 });
    }

    try {
      const debrief = JSON.parse(content);
      return NextResponse.json(debrief);
    } catch {
      console.error('Failed to parse debrief JSON:', content);
      return NextResponse.json({ error: 'Invalid debrief response' }, { status: 502 });
    }

  } catch (error) {
    console.error('[DEBRIEF API] Error:', error);
    return NextResponse.json({ error: 'Failed to generate debrief.' }, { status: 500 });
  }
}
