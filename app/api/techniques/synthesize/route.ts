import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/rag';
import { RAG_ENFORCEMENT } from '@/lib/prompts';

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY!;

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { techniqueId, force } = await req.json();

    if (!techniqueId) {
      return NextResponse.json({ error: 'No techniqueId provided.' }, { status: 400 });
    }

    // Check for cached summary first (unless force regenerate)
    if (!force) {
      const { data: cached, error: cacheError } = await supabase
        .from('technique_summaries')
        .select('*')
        .eq('technique_id', techniqueId)
        .single();

      if (!cacheError && cached) {
        return NextResponse.json({
          techniqueId,
          techniqueName: techniqueId,
          cached: true,
          profile: {
            description: cached.description,
            howTo: cached.how_to,
            whenToUse: cached.when_to_use,
            whenNotToUse: cached.when_not_to_use,
            examples: cached.examples,
            conversationExamples: cached.conversation_examples || [],
          },
        });
      }
    }

    // Fetch all chunks for this technique
    const { data: chunks, error } = await supabase
      .from('knowledge_chunks')
      .select('content, chunk_type, book_title, author, technique_name')
      .eq('technique_id', techniqueId);

    if (error || !chunks || chunks.length === 0) {
      return NextResponse.json({ error: 'Technique not found or no chunks available.' }, { status: 404 });
    }

    const techniqueName = chunks[0].technique_name;

    // Organize chunks by type for the prompt
    const chunksByType: Record<string, string[]> = {};
    for (const chunk of chunks) {
      const type = chunk.chunk_type || 'general';
      if (!chunksByType[type]) chunksByType[type] = [];
      chunksByType[type].push(`[${chunk.book_title} by ${chunk.author}]\n${chunk.content}`);
    }

    const chunkText = Object.entries(chunksByType)
      .map(([type, contents]) => `=== ${type.toUpperCase()} ===\n${contents.join('\n\n')}`)
      .join('\n\n---\n\n');

    const systemPrompt = `You are an expert persuasion and influence analyst. You synthesize raw knowledge chunks from expert books into clean, structured technique profiles.

${RAG_ENFORCEMENT}

You MUST respond with valid JSON matching this exact schema:
{
  "description": "2-3 sentence description of the technique",
  "howTo": ["Step 1...", "Step 2...", "Step 3...", "Step 4...", "Step 5..."],
  "whenToUse": "A paragraph describing optimal situations for this technique",
  "whenNotToUse": "A paragraph describing situations to avoid using this technique",
  "examples": [
    { "scenario": "Real-world scenario title", "description": "2-3 sentence description of how the technique applies" }
  ],
  "conversationExamples": [
    {
      "context": "Workplace",
      "title": "Short descriptive title of the scenario",
      "script": [
        { "speaker": "You", "line": "What you say", "annotation": "[TECHNIQUE: Name] Brief explanation of the technique being used" },
        { "speaker": "Other Person", "line": "Their response" },
        { "speaker": "You", "line": "Your follow-up", "annotation": "[TECHNIQUE: Name] Brief explanation" }
      ],
      "result": "What outcome was achieved",
      "whyItWorked": "2-3 sentences explaining the psychology behind why these techniques worked in this conversation"
    }
  ]
}

The howTo should be 3-5 numbered actionable steps.
The examples should be 2-3 real-world scenarios drawn from the book content provided.
The conversationExamples should be exactly 3 realistic conversation scripts across different contexts:
  1. A Workplace scenario (negotiation, conflict, leadership)
  2. A Personal/Dating scenario (relationship dynamics, boundaries, attraction)
  3. A Business/Social scenario (sales, networking, deal-making)
Each script should have 4-6 exchanges with annotations on the "You" lines showing which technique is applied.
Scripts should feel natural and conversational, not robotic.
Be specific and tactical, not generic.`;

    const userMessage = `Synthesize a structured technique profile for "${techniqueName}" using these knowledge chunks:

${chunkText}`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('OpenRouter error:', errText);
      return NextResponse.json({ error: 'AI generation failed.' }, { status: 502 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json({ error: 'Empty AI response.' }, { status: 502 });
    }

    const profile = JSON.parse(content);

    // Cache the generated summary in Supabase
    const { error: upsertError } = await supabase
      .from('technique_summaries')
      .upsert({
        technique_id: techniqueId,
        description: profile.description,
        how_to: profile.howTo,
        when_to_use: profile.whenToUse,
        when_not_to_use: profile.whenNotToUse,
        examples: profile.examples,
        conversation_examples: profile.conversationExamples || [],
        generated_at: new Date().toISOString(),
      }, { onConflict: 'technique_id' });

    if (upsertError) {
      console.error('Failed to cache technique summary:', upsertError);
    }

    return NextResponse.json({
      techniqueId,
      techniqueName,
      cached: false,
      profile: {
        ...profile,
        conversationExamples: profile.conversationExamples || [],
      },
    });
  } catch (err) {
    console.error('Synthesize error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
