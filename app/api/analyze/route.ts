import { NextRequest, NextResponse } from 'next/server';
import { DECODE_SYSTEM_PROMPT, RAG_ENFORCEMENT } from '@/lib/prompts';
import { searchKnowledge } from '@/lib/rag';
import { getUserFromRequest } from '@/lib/auth-api';
import { getVoiceProfile } from '@/lib/voice-profile';
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 60;

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
    const userId = await getUserFromRequest(req);
    const voiceContext = await getVoiceProfile(userId);

    let textContent = '';
    let imageDataUrl: string | null = null;
    let isImage = false;

    // Context fields
    let role = '';
    let goal = '';
    let personId = '';
    let personContext = '';
    let backgroundContext = '';

    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      // Image upload — supports multiple images (image_0, image_1, ... image_4)
      const formData = await req.formData();
      const imageFiles: File[] = [];
      for (let i = 0; i < 5; i++) {
        const file = formData.get(`image_${i}`) as File | null;
        if (file) imageFiles.push(file);
      }
      // Fallback: single 'image' field for backwards compatibility
      if (imageFiles.length === 0) {
        const single = formData.get('image') as File | null;
        if (single) imageFiles.push(single);
      }
      if (imageFiles.length === 0) {
        return NextResponse.json({ error: 'At least one image file is required.' }, { status: 400 });
      }

      // Process each image: convert to base64 and extract text
      const imageDataUrls: string[] = [];
      const extractedTexts: string[] = [];
      for (let i = 0; i < imageFiles.length; i++) {
        const bytes = await imageFiles[i].arrayBuffer();
        const dataUrl = `data:${imageFiles[i].type};base64,${Buffer.from(bytes).toString('base64')}`;
        imageDataUrls.push(dataUrl);
        const extracted = await extractTextFromImage(dataUrl);
        extractedTexts.push(`--- Screenshot ${i + 1} ---\n${extracted}`);
      }

      textContent = extractedTexts.join('\n\n');
      imageDataUrl = imageDataUrls[0]; // primary image for analysis context

      // Extract context fields from formData
      role = (formData.get('role') as string) || '';
      goal = (formData.get('goal') as string) || '';
      personId = (formData.get('personId') as string) || '';
      personContext = (formData.get('personContext') as string) || '';
      backgroundContext = (formData.get('backgroundContext') as string) || '';

      isImage = true;
    } else {
      // Text input
      const body = await req.json();
      const { text } = body;
      if (!text || typeof text !== 'string') {
        return NextResponse.json({ error: 'Text to analyze is required.' }, { status: 400 });
      }
      textContent = text;

      // Extract context fields from JSON body
      role = body.role || '';
      goal = body.goal || '';
      personId = body.personId || '';
      personContext = body.personContext || '';
      backgroundContext = body.backgroundContext || '';
    }

    // If personId is provided, fetch the People profile from Supabase
    if (personId && userId) {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
        const { data: profile } = await supabase
          .from('user_profiles_people')
          .select('name, relationship_type, traits, notes')
          .eq('id', personId)
          .eq('user_id', userId)
          .single();
        if (profile) {
          const parts: string[] = [];
          parts.push(`Name: ${profile.name}`);
          if (profile.relationship_type) parts.push(`Relationship: ${profile.relationship_type}`);
          if (profile.traits) {
            const t = profile.traits;
            if (t.communication?.sensoryPreference) parts.push(`Sensory preference: ${t.communication.sensoryPreference}`);
            if (t.communication?.emotionalPattern) parts.push(`Emotional pattern: ${t.communication.emotionalPattern}`);
            if (t.communication?.summary) parts.push(`Communication summary: ${t.communication.summary}`);
            if (t.triggers?.defensive?.length) parts.push(`Known defensive triggers: ${t.triggers.defensive.join(', ')}`);
            if (t._lastAnalysis) {
              parts.push(`Previous threat score: ${t._lastAnalysis.threat_score}`);
              if (t._lastAnalysis.techniques_identified?.length) {
                parts.push(`Previously identified techniques: ${t._lastAnalysis.techniques_identified.join(', ')}`);
              }
            }
          }
          if (profile.notes) parts.push(`Notes: ${profile.notes}`);
          personContext = parts.join('\n');
        }
      } catch (e) {
        console.error('[ANALYZE] Failed to fetch person profile:', e);
      }
    }

    // Build user context block
    const contextParts: string[] = [];
    if (role) {
      const roleLabels: Record<string, string> = {
        sender: 'the sender (left/blue side)',
        receiver: 'the receiver (right/gray side)',
        observer: 'an outside observer analyzing someone else\'s conversation',
      };
      contextParts.push(`- The user is ${roleLabels[role] || role} in this conversation`);
    }
    if (goal) contextParts.push(`- Their goal: ${goal}`);
    if (personContext) contextParts.push(`- The other person: ${personContext}`);
    if (backgroundContext) contextParts.push(`- Background: ${backgroundContext}`);

    const userContextBlock = contextParts.length > 0
      ? `\n\nUSER CONTEXT:\n${contextParts.join('\n')}\n\nUse this context to tailor your analysis. Address the user based on their role. Focus your response options on achieving their stated goal.`
      : '';

    // RAG search using the actual content
    const ragContext = await searchKnowledge(textContent);
    const enhancedPrompt = COMPREHENSIVE_SYSTEM_PROMPT + userContextBlock + (ragContext ? `\n\n${RAG_ENFORCEMENT}\n\nRELEVANT KNOWLEDGE BASE CONTEXT:\n${ragContext}` : '') + voiceContext;

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
      console.error('[ANALYZE]', 'OpenRouter error:', response.status, errorText);
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
    console.error('[ANALYZE]', error);
    return NextResponse.json(
      { error: 'Failed to process analysis request.' },
      { status: 500 }
    );
  }
}
