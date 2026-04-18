import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 60;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY!;

async function getEmbedding(text: string): Promise<number[]> {
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
  if (!res.ok) throw new Error(`Embedding error: ${res.status}`);
  const data = await res.json();
  return data.data[0].embedding;
}

async function extractMetadata(chunk: string, bookTitle: string, author: string) {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'openai/gpt-4o',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: `You are an expert metadata extractor for books on influence, persuasion, and social dynamics. Respond ONLY with valid JSON.

Extract structured metadata from the provided book chunk. Be specific — identify the EXACT technique name as the author describes it, not a generic label.

## Field definitions

- "technique_name": The specific technique or concept discussed (e.g. "Door-in-the-Face", "Anchoring", "Mirroring"). Use the author's terminology. Only use "General" if the chunk is purely introductory with no identifiable technique.
- "technique_id": A URL-safe slug of the technique name (e.g. "door-in-the-face", "anchoring", "mirroring").
- "category": Classify into exactly one:
    - influence — broad principles of influence (reciprocity, scarcity, authority, social proof, liking, commitment)
    - persuasion — deliberate verbal/written persuasion tactics (framing, storytelling, rhetoric)
    - negotiation — tactics used in negotiation contexts (anchoring, BATNA, logrolling, concession patterns)
    - body_language — nonverbal communication, facial expressions, posture, gestures
    - nlp — neuro-linguistic programming patterns (reframing, anchoring in NLP sense, Milton model, meta-model)
    - social_dynamics — group behavior, status, rapport, social hierarchies, tribal dynamics
    - power_strategy — strategic power plays, Machiavellian tactics, 48-laws-style strategies
    - dark_psychology — manipulation, coercion, gaslighting, emotional exploitation
    - defense — recognizing and defending against manipulation, critical thinking, boundaries
- "chunk_type": Classify into exactly one:
    - technique_overview — defines or introduces a technique/concept
    - technique_application — explains how to apply a technique step by step
    - example — a story, case study, or real-world illustration
    - framework — a model, taxonomy, or multi-step system
    - exercise — a practice drill, worksheet, or self-assessment
- "difficulty": "beginner" (common knowledge), "intermediate" (requires practice), or "advanced" (nuanced/expert-level).
- "use_cases": Pick 1-4 realistic situations from this list ONLY: career, dating, sales, negotiation, conflict, leadership, social, defense, relationships, business.
- "risk_level": "low" (ethical everyday use), "medium" (could backfire or be seen as manipulative), "high" (coercive or ethically dubious).
- "related_techniques": List 1-3 related technique slugs that a reader might also want to study.

## Example

For a chunk about Cialdini's reciprocity principle with a story about free samples:
{
  "technique_name": "Reciprocity Principle",
  "technique_id": "reciprocity-principle",
  "category": "influence",
  "chunk_type": "example",
  "difficulty": "beginner",
  "use_cases": ["sales", "social", "business"],
  "risk_level": "low",
  "related_techniques": ["commitment-and-consistency", "liking-principle", "door-in-the-face"]
}` },
        { role: 'user', content: `From "${bookTitle}" by ${author}. Extract metadata as JSON for this chunk:

${chunk.slice(0, 1500)}` }
      ],
      temperature: 0.1,
      max_tokens: 500,
    }),
  });

  if (!res.ok) return defaultMetadata();
  try {
    const data = await res.json();
    const content = data.choices[0].message.content
      .replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(content);
  } catch {
    return defaultMetadata();
  }
}

function defaultMetadata() {
  return {
    technique_name: 'General', technique_id: 'general', category: 'influence',
    chunk_type: 'technique_overview', difficulty: 'beginner',
    use_cases: [], risk_level: 'low', related_techniques: [],
  };
}

// POST: Process a BATCH of chunks (client sends 3 at a time)
export async function POST(req: NextRequest) {
  try {
    const { chunks, title, author, storagePath } = await req.json();

    if (!chunks || !Array.isArray(chunks) || !title || !author) {
      return NextResponse.json({ error: 'chunks array, title, and author required' }, { status: 400 });
    }

    let successCount = 0;

    for (const chunk of chunks) {
      try {
        const [metadata, embedding] = await Promise.all([
          extractMetadata(chunk, title, author),
          getEmbedding(chunk),
        ]);

        const { error } = await supabase.from('knowledge_chunks').insert({
          book_title: title,
          author: author,
          section: metadata.technique_name,
          chunk_type: metadata.chunk_type,
          technique_name: metadata.technique_name,
          technique_id: metadata.technique_id,
          category: metadata.category,
          difficulty: metadata.difficulty,
          use_cases: metadata.use_cases,
          risk_level: metadata.risk_level,
          related_techniques: metadata.related_techniques,
          content: chunk,
          token_count: chunk.split(/\s+/).length,
          embedding: embedding,
          ...(storagePath ? { storage_path: storagePath } : {}),
        });

        if (!error) successCount++;
      } catch (e) {
        console.error('Chunk error:', e);
      }
    }

    return NextResponse.json({ success: true, processed: successCount });

  } catch (error: any) {
    console.error('[INGEST] Error:', error);
    return NextResponse.json({ error: error.message || 'Ingestion failed' }, { status: 500 });
  }
}

// DELETE
export async function DELETE(req: NextRequest) {
  try {
    const { title } = await req.json();
    const { error } = await supabase.from('knowledge_chunks').delete().eq('book_title', title);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
