import { NextRequest, NextResponse } from 'next/server';
import { DECODE_SYSTEM_PROMPT } from '@/lib/prompts';
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

    return `\n\nRELEVANT KNOWLEDGE BASE CONTEXT:\n${context}\n\nApply these specific concepts and frameworks in your analysis and recommendations.`;
  } catch (e) {
    console.error('Knowledge search error:', e);
    return '';
  }
}

async function extractTextFromImage(base64Image: string): Promise<string> {
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
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Extract ALL text from this screenshot. Return only the text content, preserving the conversation structure. Include who said what if it\'s a conversation. Also briefly summarize what influence or persuasion dynamics you see.',
            },
            { type: 'image_url', image_url: { url: base64Image } },
          ],
        },
      ],
      max_tokens: 2000,
    }),
  });

  if (!response.ok) throw new Error('Failed to extract text from image');
  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

const COMPREHENSIVE_SYSTEM_PROMPT = `You are an expert conversation analyst specializing in psychological influence, power dynamics, manipulation detection, and strategic communication. You perform a COMPREHENSIVE analysis that covers both offensive insights (how to respond strategically) and defensive insights (detecting manipulation tactics).

Address the user directly with "you" and "your". Refer to the other person as "they" or "them".

You MUST respond with valid JSON in this exact format:
{
  "powerDynamics": {
    "yourPower": <number 1-10>,
    "theirPower": <number 1-10>,
    "dynamicsDescription": "Detailed explanation of the power balance and dynamics"
  },
  "communicationStyle": {
    "sensoryPreference": "Visual|Auditory|Kinesthetic|Mixed",
    "emotionalState": "Brief description of their emotional state",
    "receptivity": <number 1-100, how open they are to influence>
  },
  "threatScore": <number 1-10, how manipulative the message is. 0 if no manipulation detected>,
  "tactics": [
    {
      "quote": "exact quoted text from the message",
      "tactic": "Name of the manipulation tactic",
      "category": "Urgency|Social Proof|Authority|Guilt|Misdirection|Scarcity|Fear|Flattery|Reciprocity|Anchoring",
      "explanation": "How this tactic works psychologically",
      "counterResponse": "Exact words to say to neutralize this tactic"
    }
  ],
  "counterScript": "A complete response that neutralizes all manipulation tactics at once (empty string if no manipulation detected)",
  "responseOptions": [
    {
      "type": "Strategy name (e.g. Authority Building, Rapport Enhancement, Frame Reorientation, Reciprocity Creation)",
      "message": "Exact copy-pasteable response message",
      "description": "Why this approach works in this situation",
      "powerImpact": <percentage increase in influence>,
      "riskLevel": "LOW|MEDIUM|HIGH",
      "psychologyPrinciple": "The psychology principle being applied"
    }
  ],
  "overallAssessment": "Comprehensive assessment combining strategic analysis and manipulation landscape",
  "successProbability": <number 1-100>,
  "techniques_identified": ["Array", "of", "technique", "names", "detected"]
}

Important rules:
- Always provide exactly 4 responseOptions covering different strategic approaches
- For tactics array: find EVERY manipulation tactic, even subtle ones. If no manipulation is present, return an empty array
- threatScore: 0-3 = low/no manipulation, 4-6 = moderate, 7-10 = heavy manipulation
- Be thorough and actionable. Response messages must be copy-pasteable
- Focus on: Cialdini's principles, NLP patterns, power dynamics, frame control, emotional intelligence`;

export async function POST(req: NextRequest) {
  try {
    let textContent = '';
    let imageDataUrl: string | null = null;
    let isImage = false;

    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      // Image upload
      const formData = await req.formData();
      const file = formData.get('image') as File | null;
      if (!file) {
        return NextResponse.json({ error: 'Image file is required.' }, { status: 400 });
      }
      const bytes = await file.arrayBuffer();
      imageDataUrl = `data:${file.type};base64,${Buffer.from(bytes).toString('base64')}`;

      // Pass 1: Extract text + initial summary from image
      textContent = await extractTextFromImage(imageDataUrl);
      isImage = true;
    } else {
      // Text input
      const { text } = await req.json();
      if (!text || typeof text !== 'string') {
        return NextResponse.json({ error: 'Text to analyze is required.' }, { status: 400 });
      }
      textContent = text;
    }

    // RAG search using the actual content
    const knowledgeContext = await searchKnowledge(textContent);
    const enhancedPrompt = COMPREHENSIVE_SYSTEM_PROMPT + knowledgeContext;

    // Build the analysis message
    const userContent: any[] = [];

    if (isImage && imageDataUrl) {
      // For images, include both the image and extracted text for best results
      userContent.push({ type: 'image_url', image_url: { url: imageDataUrl } });
      userContent.push({
        type: 'text',
        text: `Perform a comprehensive analysis of this conversation screenshot. Here is the extracted text for reference:\n\n${textContent}\n\nProvide your full JSON analysis.`,
      });
    } else {
      userContent.push({
        type: 'text',
        text: `Perform a comprehensive analysis of this text:\n\n${textContent}\n\nProvide your full JSON analysis.`,
      });
    }

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
          { role: 'system', content: enhancedPrompt },
          { role: 'user', content: userContent },
        ],
        temperature: 0.3,
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

    // Include extracted text for image uploads so the frontend can display it
    if (isImage) {
      parsed.extractedText = textContent;
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('[ANALYZE API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process analysis request.' },
      { status: 500 }
    );
  }
}
