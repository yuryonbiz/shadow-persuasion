import { NextRequest, NextResponse } from 'next/server';
import { searchKnowledge } from '@/lib/rag';
import { RAG_ENFORCEMENT, HANDLER_VOICE } from '@/lib/prompts';
import { getUserFromRequest } from '@/lib/auth-api';
import { getVoiceProfile } from '@/lib/voice-profile';

export const maxDuration = 60;

const CONTEXT_CHARACTERS: Record<string, { role: string; setting: string }> = {
  // Original 3
  work: {
    role: 'a colleague, manager, or direct report in a professional workplace',
    setting: 'a workplace situation such as a meeting, negotiation, performance review, or team conflict',
  },
  relationship: {
    role: 'a romantic partner, close friend, or family member',
    setting: 'a personal or relationship situation such as a difficult conversation, boundary-setting, or emotional negotiation',
  },
  business: {
    role: 'a client, investor, vendor, or business counterpart',
    setting: 'a business situation such as a sales call, partnership negotiation, pitch meeting, or deal closing',
  },
  // Taxonomy categories
  career: {
    role: 'your manager at work',
    setting: 'a career advancement situation',
  },
  leadership: {
    role: 'a team member who reports to you',
    setting: 'a leadership and management situation',
  },
  finance: {
    role: 'a salesperson or service provider',
    setting: 'a financial negotiation',
  },
  dating: {
    role: 'someone you are romantically interested in',
    setting: 'a dating situation',
  },
  relationships: {
    role: 'a close friend or family member',
    setting: 'a personal relationship situation',
  },
  parenting: {
    role: 'your teenage child',
    setting: 'a parenting situation',
  },
  personal_power: {
    role: 'a stranger at a social event',
    setting: 'a situation requiring confidence and presence',
  },
  high_stakes: {
    role: 'a decision-maker with authority over your situation',
    setting: 'a high-stakes critical moment',
  },
  texting: {
    role: 'someone you are texting with',
    setting: 'an online/text conversation',
  },
  influence: {
    role: 'a potential follower or audience member',
    setting: 'a content and influence situation',
  },
  defense: {
    role: 'someone who is trying to manipulate or pressure you',
    setting: 'a defensive situation against manipulation',
  },
};

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserFromRequest(req);
    const voiceContext = await getVoiceProfile(userId);

    const { techniqueId, techniqueName, context, messages } = await req.json();

    if (!techniqueName || !context) {
      return NextResponse.json({ error: 'techniqueName and context are required' }, { status: 400 });
    }

    const ctxInfo = CONTEXT_CHARACTERS[context];
    if (!ctxInfo) {
      return NextResponse.json({ error: 'Invalid context provided.' }, { status: 400 });
    }

    // RAG search for technique knowledge
    const ragContext = await searchKnowledge(
      `${techniqueName} technique application examples psychology practice`,
      { count: 4 }
    );
    const knowledgeBlock = ragContext ? `\n\n${RAG_ENFORCEMENT}\n\nRELEVANT KNOWLEDGE BASE CONTENT:\n${ragContext}` : '';

    const isFirstMessage = !messages || messages.length === 0;

    const systemPrompt = `${HANDLER_VOICE}
You are running a role-play practice session. The user is practicing the persuasion/influence technique called "${techniqueName}".

YOUR DUAL ROLE:
1. IN-CHARACTER: You play ${ctxInfo.role}. Stay in character for the conversation set in ${ctxInfo.setting}. Be realistic — don't make it too easy. Push back naturally, show realistic resistance and emotions. Use natural dialogue, not scripted corporate speak.
2. COACH: After each user response, provide coaching feedback.

${isFirstMessage ? `FIRST MESSAGE INSTRUCTIONS:
Generate a realistic scenario. Your response must follow this exact format:

**SCENARIO:** [2-3 sentences setting up the situation — who you are, what's happening, what tension exists]

**YOUR CHARACTER:** [Your name and 1-sentence description of your personality/stance]

---

[Your opening line in character — something that creates tension or a challenge the user needs to navigate using ${techniqueName}]

<!--COACHING:{"score":0,"feedback":"Welcome to the practice session! Try to apply ${techniqueName} in your response.","idealResponse":"","techniqueApplication":"Scenario setup — no score yet.","turnNumber":1,"maxTurns":5}-->` : `CONVERSATION INSTRUCTIONS:
Continue the role-play in character. Respond naturally to what the user said — react as your character would.

After your in-character response, add coaching feedback about the user's PREVIOUS message.

Your in-character response should be 1-3 sentences of natural dialogue. Then add:

<!--COACHING:{"score":<1-10>,"feedback":"<what they did well and what could improve>","idealResponse":"<example of a stronger response using ${techniqueName}>","techniqueApplication":"<specific analysis of how they applied or missed the technique>","turnNumber":<current turn>,"maxTurns":5}-->

SCORING GUIDE:
- 1-3: Missed the technique entirely or used counterproductive approach
- 4-5: Showed awareness but weak/incorrect application
- 6-7: Decent application with room for improvement
- 8-9: Strong, natural application of the technique
- 10: Masterful, textbook-perfect application

If this is turn 5 (the final exchange), add a summary field:
<!--COACHING:{"score":<1-10>,"feedback":"...","idealResponse":"...","techniqueApplication":"...","turnNumber":5,"maxTurns":5,"summary":{"overallScore":<1-10>,"strengths":["..."],"improvements":["..."],"keyTakeaway":"One sentence summary of what to remember"}}-->`}
${voiceContext}${knowledgeBlock}`;

    const apiMessages: { role: string; content: string }[] = [
      { role: 'system', content: systemPrompt },
    ];

    if (isFirstMessage) {
      apiMessages.push({
        role: 'user',
        content: `Start the role-play scenario for practicing "${techniqueName}" in a ${context} context. Generate the situation and your opening line.`,
      });
    } else {
      for (const msg of messages) {
        apiMessages.push({ role: msg.role, content: msg.content });
      }
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
        messages: apiMessages,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[ROLEPLAY]', 'OpenRouter error:', response.status, errorText);
      return NextResponse.json({ error: 'AI service error' }, { status: 502 });
    }

    // Stream response through
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('[ROLEPLAY]', error);
    return NextResponse.json({ error: 'Failed to process roleplay.' }, { status: 500 });
  }
}
