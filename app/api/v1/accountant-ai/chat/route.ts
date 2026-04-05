import { createClient } from '@/lib/supabase/server'
import { getAdminSupabase } from '@/lib/supabase/admin'
import { getAuthUserId, apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'
import { ragSearch } from '@/lib/accountant-ai/rag-search'

export const maxDuration = 30

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''
const GEMINI_MODEL = 'gemini-2.5-flash'

const SYSTEM_PROMPT = `You are an NZ accounting and tax assistant. Answer based ONLY on the provided context from official NZ government sources.

Rules:
- Only answer from the provided context. If the context doesn't cover the question, say "I don't have specific information on that topic. You may want to check ird.govt.nz directly."
- Cite sources using [Source](url) format.
- Be concise but thorough.
- Always end with: "⚠️ This is general information only, not professional tax advice. Please consult a qualified accountant for your specific situation."`

interface ChatRequestBody {
  conversationId?: string
  content: string
}

export async function POST(request: Request) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  let body: ChatRequestBody
  try {
    body = await request.json()
  } catch {
    return apiError('Invalid request body', 'VALIDATION_ERROR', 400)
  }

  const { content, conversationId } = body

  if (!content?.trim()) {
    return apiError('content is required', 'VALIDATION_ERROR', 400)
  }

  const supabase = getAdminSupabase()

  // 1. Deduct 1 credit via deduct_credits RPC (uses user-facing client)
  const userClient = await createClient()
  const { error: creditError } = await userClient.rpc('deduct_credits', {
    p_user_id: userId,
    p_amount: 1,
    p_description: 'Accountant AI: chat message',
    p_tool: 'accountant-ai',
  })

  if (creditError) {
    if (creditError.message?.toLowerCase().includes('insufficient')) {
      return apiError('Insufficient credits', 'INSUFFICIENT_CREDITS', 402)
    }
    console.error('[accountant-ai/chat] Credit deduction error:', creditError)
    return apiError('Failed to deduct credits', 'CREDIT_ERROR', 500)
  }

  try {
    // 2. Search RAG for relevant context
    const ragResults = await ragSearch(content.trim(), 5)

    // 3. Build prompt with context
    const contextText = ragResults.length > 0
      ? 'CONTEXT:\n' + ragResults.map((r) => `[Source: ${r.url}]\n${r.content}`).join('\n\n')
      : 'CONTEXT:\nNo relevant context found.'

    const prompt = `${SYSTEM_PROMPT}

${contextText}

USER QUESTION: ${content.trim()}`

    // 4. Call Gemini 2.5 Flash
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
        signal: AbortSignal.timeout(25_000),
      },
    )

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text()
      throw new Error(`Gemini API ${geminiResponse.status}: ${errText.substring(0, 300)}`)
    }

    const geminiData = await geminiResponse.json()
    const assistantContent =
      geminiData.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I'm sorry, I wasn't able to generate a response. Please try again."

    // 5. Create conversation if no conversationId
    let activeConversationId = conversationId

    if (!activeConversationId) {
      const title = content.trim().slice(0, 40)
      const { data: conv, error: convError } = await (supabase.from as any)(
        'accountant_ai_conversations',
      )
        .insert({ user_id: userId, title })
        .select('id')
        .single()

      if (convError) {
        throw new Error(`Failed to create conversation: ${convError.message}`)
      }

      activeConversationId = conv.id
    }

    // 6. Save user message
    await (supabase.from as any)('accountant_ai_messages').insert({
      conversation_id: activeConversationId,
      role: 'user',
      content: content.trim(),
      sources: [],
    })

    // Extract unique source URLs from RAG results
    const sources = ragResults
      .map((r) => ({ url: r.url, title: r.title }))
      .filter((s, i, arr) => arr.findIndex((x) => x.url === s.url) === i)
      .slice(0, 5)

    // Save assistant message
    const { data: assistantMsg, error: msgError } = await (supabase.from as any)(
      'accountant_ai_messages',
    )
      .insert({
        conversation_id: activeConversationId,
        role: 'assistant',
        content: assistantContent,
        sources,
      })
      .select('id, role, content, sources, created_at')
      .single()

    if (msgError) {
      throw new Error(`Failed to save assistant message: ${msgError.message}`)
    }

    // 7. Update conversation updated_at
    await (supabase.from as any)('accountant_ai_conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', activeConversationId)

    return apiSuccess({
      conversationId: activeConversationId,
      message: {
        id: assistantMsg.id,
        role: assistantMsg.role,
        content: assistantMsg.content,
        sources: assistantMsg.sources,
        createdAt: assistantMsg.created_at,
      },
    })
  } catch (err) {
    console.error('[accountant-ai/chat] Error:', err)
    return API_ERRORS.INTERNAL()
  }
}
