import { NextRequest, NextResponse } from 'next/server';
import { HANDLER_SYSTEM_PROMPT, RAG_ENFORCEMENT, HANDLER_VOICE } from '@/lib/prompts';
import { searchKnowledge, getEmbedding, supabase } from '@/lib/rag';
import { getUserFromRequest } from '@/lib/auth-api';
import { getVoiceProfile } from '@/lib/voice-profile';

export const maxDuration = 60;

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY!;

// Search knowledge base for relevant chunks with source metadata
type SearchResult = {
  context: string;
  sources: { book: string; author: string; technique: string; similarity: number }[];
};

async function searchKnowledgeWithSources(query: string, limit: number = 5): Promise<SearchResult> {
  try {
    const embedding = await getEmbedding(query);
    if (embedding.length === 0) return { context: '', sources: [] };

    const { data, error } = await supabase.rpc('match_chunks', {
      query_embedding: embedding,
      match_threshold: 0.3,
      match_count: limit,
    });

    if (error || !data || data.length === 0) return { context: '', sources: [] };

    const context = data.map((chunk: any) =>
      `[Source: "${chunk.book_title}" by ${chunk.author} | Technique: ${chunk.technique_name}]\n${chunk.content}`
    ).join('\n\n---\n\n');

    const sources = data.map((chunk: any) => ({
      book: chunk.book_title,
      author: chunk.author,
      technique: chunk.technique_name,
      similarity: Math.round(chunk.similarity * 100),
    }));

    return { context, sources };
  } catch (e) {
    console.error('RAG search error:', e);
    return { context: '', sources: [] };
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserFromRequest(req);
    const voiceContext = await getVoiceProfile(userId);

    const { messages, session_id } = await req.json();
    const recentMessages = messages.slice(-10);
    
    // Get the latest user message for RAG search
    const lastUserMessage = [...recentMessages].reverse().find((m: any) => m.role === 'user');
    
    // Search knowledge base
    let ragResult: SearchResult = { context: '', sources: [] };
    if (lastUserMessage) {
      ragResult = await searchKnowledgeWithSources(lastUserMessage.content);
    }

    // Build system prompt with RAG context
    let systemContent = HANDLER_VOICE + HANDLER_SYSTEM_PROMPT;
    if (ragResult.context) {
      const ragContext = ragResult.context;
      systemContent += `\n\n${RAG_ENFORCEMENT}\n\n---\n\nRELEVANT KNOWLEDGE BASE EXCERPTS:\n${ragContext}`;
    }
    systemContent += voiceContext;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_KEY}`,
        'HTTP-Referer': 'https://shadow-persuasion.vercel.app',
        'X-Title': 'Shadow Persuasion',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-sonnet-4',
        messages: [{ role: 'system', content: systemContent }, ...recentMessages],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[CHAT]', 'OpenRouter error:', response.status, errorText);
      return NextResponse.json({ error: 'AI service error' }, { status: 502 });
    }

    if (!response.body) {
      return NextResponse.json({ error: 'No response body from AI service' }, { status: 502 });
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    
    // Resolve or create session for persistence
    let activeSessionId = session_id;
    if (!activeSessionId) {
      try {
        const firstUserMsg = recentMessages.find((m: any) => m.role === 'user');
        const title = firstUserMsg?.content?.slice(0, 80) || 'New Chat';
        const { data: newSession } = await supabase
          .from('chat_sessions')
          .insert({ title, session_type: 'general' })
          .select('id')
          .single();
        activeSessionId = newSession?.id;
      } catch (e) {
        console.error('[CHAT]', 'Failed to create session:', e);
      }
    }

    // Save user message
    if (activeSessionId && lastUserMessage) {
      supabase
        .from('chat_messages')
        .insert({ session_id: activeSessionId, role: 'user', content: lastUserMessage.content })
        .then(({ error }) => { if (error) console.error('[CHAT]', 'Save user msg error:', error); });
    }

    let fullAssistantContent = '';

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body!.getReader();
        let buffer = '';
        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';
            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || !trimmed.startsWith('data: ')) continue;
              const data = trimmed.slice(6);
              if (data === '[DONE]') continue;
              try {
                const json = JSON.parse(data);
                const content = json.choices?.[0]?.delta?.content;
                if (content) {
                  fullAssistantContent += content;
                  controller.enqueue(encoder.encode(content));
                }
              } catch {}
            }
          }
        } catch (e) {
          console.error('[CHAT]', 'Stream error:', e);
        } finally {
          // Append sources as a special delimiter + JSON at the end
          if (ragResult.sources.length > 0) {
            controller.enqueue(encoder.encode(`\n\n<!--SOURCES:${JSON.stringify(ragResult.sources)}-->`));
          }
          controller.close();

          // Save assistant message to DB
          if (activeSessionId && fullAssistantContent) {
            const cleanContent = fullAssistantContent.replace(/\n\n<!--SOURCES:.*?-->/, '');
            supabase
              .from('chat_messages')
              .insert({
                session_id: activeSessionId,
                role: 'assistant',
                content: cleanContent,
                metadata: ragResult.sources.length > 0 ? { sources: ragResult.sources } : {},
              })
              .then(({ error }) => { if (error) console.error('[CHAT]', 'Save assistant msg error:', error); });

            supabase
              .from('chat_sessions')
              .update({ updated_at: new Date().toISOString() })
              .eq('id', activeSessionId)
              .then(() => {});
          }
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        ...(activeSessionId ? { 'X-Session-Id': activeSessionId } : {}),
      },
    });

  } catch (error) {
    console.error('[CHAT]', error);
    return NextResponse.json({ error: 'Failed to get chat response.' }, { status: 500 });
  }
}
