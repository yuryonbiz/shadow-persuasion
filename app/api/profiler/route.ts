import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const maxDuration = 60;

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
      match_threshold: 0.32,
      match_count: 5,
    });

    if (error || !data || data.length === 0) return '';

    const context = data
      .map(
        (chunk: any) =>
          `[${chunk.book_title} by ${chunk.author} - ${chunk.technique_name}]\n${chunk.content}`
      )
      .join('\n\n---\n\n');

    return `\n\nRELEVANT TECHNIQUES FROM KNOWLEDGE BASE:\n${context}`;
  } catch (e) {
    console.error('Knowledge search error:', e);
    return '';
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'analyze-interaction') {
      return handleAnalyzeInteraction(body);
    } else if (action === 'generate-playbook') {
      return handleGeneratePlaybook(body);
    } else {
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('[PROFILER API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process profiler request.' },
      { status: 500 }
    );
  }
}

async function handleAnalyzeInteraction(body: any) {
  const { interaction, profile } = body;

  if (!interaction || !profile) {
    return NextResponse.json(
      { error: 'Missing interaction or profile data.' },
      { status: 400 }
    );
  }

  const searchQuery = `${interaction.summary} psychological analysis personality assessment communication style ${profile.relationshipType}`;
  const knowledgeContext = await searchKnowledge(searchQuery);

  const systemPrompt = `You are an expert psychologist and behavioral analyst. Given a person's profile and a new interaction, provide an updated psychological assessment.

You must respond ONLY with valid JSON in this exact structure:
{
  "interactionAnalysis": "2-3 sentence analysis of what this interaction reveals about the person",
  "updatedTraits": {
    "communication": {
      "directness": <number 0-100, 0=very indirect, 100=very direct>,
      "logicVsEmotion": <number 0-100, 0=purely emotional, 100=purely logical>,
      "assertiveness": <number 0-100>,
      "openness": <number 0-100>,
      "summary": "<brief description of communication style>"
    },
    "personality": {
      "openness": <number 0-100>,
      "conscientiousness": <number 0-100>,
      "extraversion": <number 0-100>,
      "agreeableness": <number 0-100>,
      "neuroticism": <number 0-100>
    },
    "triggers": {
      "defensive": ["<things that make them defensive>"],
      "openUp": ["<things that make them open up>"]
    },
    "motivations": ["<key motivations>"],
    "fears": ["<key fears>"],
    "attachmentStyle": {
      "style": "<Secure|Anxious|Avoidant|Disorganized>",
      "confidence": <number 0-100>
    }
  },
  "confidenceScore": <number 0-100, overall confidence in assessment>,
  "keyTraitTags": ["<3-6 short tags describing this person>"]
}

Consider ALL previous interactions and the existing profile when making assessments. Each new interaction should refine (not replace) the existing assessment. Increase confidence scores as more data is collected.`;

  const existingInteractions = (profile.interactions || [])
    .slice(-10)
    .map(
      (i: any) =>
        `[${i.date}] ${i.summary} (Outcome: ${i.outcome}/5)${i.aiAnalysis ? ` Analysis: ${i.aiAnalysis}` : ''}`
    )
    .join('\n');

  const existingTraits = profile.traits
    ? `\nCurrent Assessment:\n${JSON.stringify(profile.traits, null, 2)}`
    : '\nNo existing assessment yet.';

  const userMessage = `Person: ${profile.name} (${profile.relationshipType})
${existingTraits}

Previous Interactions (last 10):
${existingInteractions || 'None yet.'}

NEW INTERACTION:
Date: ${interaction.date}
Summary: ${interaction.summary}
Techniques Used: ${(interaction.techniques || []).join(', ') || 'None specified'}
Outcome: ${interaction.outcome}/5
Notes: ${interaction.notes || 'None'}
${knowledgeContext}

Analyze this interaction and provide an updated psychological profile.`;

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
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenRouter error:', response.status, errorText);
    return NextResponse.json({ error: 'AI service error' }, { status: 502 });
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  try {
    const analysis = JSON.parse(content);
    return NextResponse.json(analysis);
  } catch {
    console.error('Failed to parse AI response:', content);
    return NextResponse.json(
      { error: 'Failed to parse AI analysis' },
      { status: 500 }
    );
  }
}

async function handleGeneratePlaybook(body: any) {
  const { profile } = body;

  if (!profile) {
    return NextResponse.json({ error: 'Missing profile data.' }, { status: 400 });
  }

  const searchQuery = `strategy playbook influence tactics ${profile.relationshipType} relationship management persuasion approach`;
  const knowledgeContext = await searchKnowledge(searchQuery);

  const systemPrompt = `You are a strategic relationship advisor and behavioral expert. Generate a comprehensive, personalized strategy playbook for dealing with a specific person based on their psychological profile and interaction history.

You must respond ONLY with valid JSON in this exact structure:
{
  "bestApproach": "<2-3 paragraphs: the overall best way to communicate with and influence this person, including tone, framing, and channel preferences>",
  "timingPatterns": "<1-2 paragraphs: when this person is most receptive, best days/times to approach, patterns in their energy/mood>",
  "effectiveTactics": [
    {
      "tactic": "<name of tactic>",
      "description": "<how to apply it with this specific person>",
      "effectiveness": <estimated effectiveness 0-100>
    }
  ],
  "leveragePoints": [
    "<specific leverage point or vulnerability that can be ethically used>"
  ],
  "nextMove": "<specific, actionable recommendation for the next interaction with this person>"
}

Base everything on the actual data provided. Be specific and tactical, not generic. Reference actual patterns from their interaction history.`;

  const interactions = (profile.interactions || [])
    .map(
      (i: any) =>
        `[${i.date}] ${i.summary} | Techniques: ${(i.techniques || []).join(', ') || 'None'} | Outcome: ${i.outcome}/5 | Analysis: ${i.aiAnalysis || 'N/A'}`
    )
    .join('\n');

  const traits = profile.traits
    ? JSON.stringify(profile.traits, null, 2)
    : 'No traits assessed yet.';

  const userMessage = `Generate a strategic playbook for:

Person: ${profile.name}
Relationship: ${profile.relationshipType}
Created: ${profile.createdAt}
Total Interactions Logged: ${(profile.interactions || []).length}

Psychological Profile:
${traits}

Full Interaction History:
${interactions || 'No interactions logged yet. Provide general advice based on the relationship type.'}
${knowledgeContext}

Create a detailed, actionable strategy playbook for this person.`;

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
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenRouter error:', response.status, errorText);
    return NextResponse.json({ error: 'AI service error' }, { status: 502 });
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  try {
    const playbook = JSON.parse(content);
    return NextResponse.json(playbook);
  } catch {
    console.error('Failed to parse AI response:', content);
    return NextResponse.json(
      { error: 'Failed to parse AI playbook' },
      { status: 500 }
    );
  }
}
