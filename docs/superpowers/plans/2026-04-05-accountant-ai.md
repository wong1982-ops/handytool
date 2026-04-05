# Accountant AI (Phase 1) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an AI accounting chatbot with RAG over NZ government sources (IRD, Companies Office, MBIE) — scraping pipeline, vector search, and full chat interface.

**Architecture:** Two subsystems: (1) RAG pipeline — scraper fetches govt pages, chunker splits text, embedder generates vectors via Gemini, stored in Supabase pgvector. (2) Chat — user question is embedded, vector-searched against chunks, context injected into Gemini prompt, response with citations returned. Chat history persisted.

**Tech Stack:** Next.js 16, React 19, TypeScript, Gemini 2.5 Flash (chat) + text-embedding-004 (embeddings), Supabase pgvector, ToolFrame.

**Spec:** `docs/superpowers/specs/2026-04-05-accountant-ai.md`

---

## File Structure

### New Files — RAG Pipeline
| File | Responsibility |
|---|---|
| `supabase/migrations/040_accountant_ai.sql` | All tables + pgvector extension |
| `lib/accountant-ai/scraper.ts` | Web scraper for IRD/Companies Office/MBIE |
| `lib/accountant-ai/chunker.ts` | Text chunking (500 tokens, 50 overlap) |
| `lib/accountant-ai/embedder.ts` | Gemini embedding wrapper |
| `lib/accountant-ai/rag-search.ts` | Vector similarity search |
| `app/api/v1/accountant-ai/scrape/route.ts` | Admin trigger for scrape pipeline |

### New Files — Chat
| File | Responsibility |
|---|---|
| `tools/accountant-ai/types.ts` | Conversation, message types |
| `tools/accountant-ai/use-chat.ts` | Chat state hook |
| `tools/accountant-ai/chat-page.tsx` | Main chat layout (sidebar + messages) |
| `tools/accountant-ai/chat-sidebar.tsx` | Conversation history list |
| `tools/accountant-ai/chat-message.tsx` | Message bubble (user + AI) |
| `tools/accountant-ai/chat-input.tsx` | Input bar with send button |
| `app/tools/accountant-ai/page.tsx` | Route page |
| `app/api/v1/accountant-ai/chat/route.ts` | Chat API (embed → search → generate) |
| `app/api/v1/accountant-ai/conversations/route.ts` | List conversations |
| `app/api/v1/accountant-ai/conversations/[id]/route.ts` | Get conversation messages |

### Modified Files
| File | Changes |
|---|---|
| `lib/tools.tsx` | Add Accountant AI entry |
| `components/home/bento-showcase.tsx` | Add Accountant AI card |
| `components/layout/tool-categories.ts` | Add 'accountant-ai': 'utility' |

---

## Task 1: Database Migration

**Files:**
- Create: `supabase/migrations/040_accountant_ai.sql`

- [ ] **Step 1: Create migration**

```sql
-- supabase/migrations/040_accountant_ai.sql

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- RAG: scraped documents
CREATE TABLE IF NOT EXISTS public.rag_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL UNIQUE,
  title TEXT,
  source TEXT NOT NULL,
  content_text TEXT NOT NULL,
  scraped_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rag_documents_source ON rag_documents (source);
GRANT ALL ON rag_documents TO service_role;

-- RAG: text chunks with embeddings
CREATE TABLE IF NOT EXISTS public.rag_chunks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES rag_documents(id) ON DELETE CASCADE,
  chunk_index INT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB,
  embedding vector(768),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rag_chunks_document ON rag_chunks (document_id);
CREATE INDEX IF NOT EXISTS idx_rag_chunks_embedding ON rag_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
GRANT ALL ON rag_chunks TO service_role;

-- Chat: conversations
CREATE TABLE IF NOT EXISTS public.accountant_ai_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_acct_ai_conv_user ON accountant_ai_conversations (user_id, updated_at DESC);
ALTER TABLE accountant_ai_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own conversations" ON accountant_ai_conversations FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
GRANT ALL ON accountant_ai_conversations TO authenticated;

-- Chat: messages
CREATE TABLE IF NOT EXISTS public.accountant_ai_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES accountant_ai_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  sources JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_acct_ai_msg_conv ON accountant_ai_messages (conversation_id, created_at);
ALTER TABLE accountant_ai_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own messages" ON accountant_ai_messages FOR SELECT TO authenticated USING (
  conversation_id IN (SELECT id FROM accountant_ai_conversations WHERE user_id = auth.uid())
);
GRANT ALL ON accountant_ai_messages TO authenticated, service_role;

-- Vector similarity search function
CREATE OR REPLACE FUNCTION match_rag_chunks(
  query_embedding vector(768),
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    rc.id,
    rc.content,
    rc.metadata,
    1 - (rc.embedding <=> query_embedding) AS similarity
  FROM rag_chunks rc
  ORDER BY rc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

- [ ] **Step 2: Apply via Supabase MCP**

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/040_accountant_ai.sql
git commit -m "feat(accountant-ai): add database tables with pgvector"
```

---

## Task 2: RAG Pipeline — Scraper + Chunker + Embedder

**Files:**
- Create: `lib/accountant-ai/scraper.ts`
- Create: `lib/accountant-ai/chunker.ts`
- Create: `lib/accountant-ai/embedder.ts`
- Create: `lib/accountant-ai/rag-search.ts`

- [ ] **Step 1: Create scraper.ts**

Fetches pages from govt websites, extracts text content, follows internal links.

```typescript
// lib/accountant-ai/scraper.ts

const USER_AGENT = 'Toolk1t-RAG-Bot/1.0 (NZ accounting knowledge base)'
const MAX_PAGES_PER_DOMAIN = 200
const RATE_LIMIT_MS = 1000
const MAX_DEPTH = 3

interface ScrapedPage {
  url: string
  title: string
  source: string
  content: string
}

const SEED_URLS: { source: string; urls: string[] }[] = [
  {
    source: 'ird',
    urls: [
      'https://www.ird.govt.nz/gst',
      'https://www.ird.govt.nz/income-tax',
      'https://www.ird.govt.nz/employing-staff',
      'https://www.ird.govt.nz/running-a-business',
      'https://www.ird.govt.nz/tax-codes',
    ],
  },
  {
    source: 'companies-office',
    urls: [
      'https://companies-register.companiesoffice.govt.nz/',
      'https://www.companiesoffice.govt.nz/starting-a-company/',
    ],
  },
  {
    source: 'mbie',
    urls: [
      'https://www.employment.govt.nz/hours-and-wages/',
      'https://www.employment.govt.nz/leave-and-holidays/',
      'https://www.employment.govt.nz/starting-employment/',
    ],
  },
]

function extractTextFromHtml(html: string): { title: string; content: string } {
  // Remove script, style, nav, footer, header tags
  let cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '')

  // Extract title
  const titleMatch = cleaned.match(/<title[^>]*>(.*?)<\/title>/i)
  const title = titleMatch ? titleMatch[1].trim() : 'Untitled'

  // Extract main/article content if present
  const mainMatch = cleaned.match(/<main[\s\S]*?<\/main>/i) || cleaned.match(/<article[\s\S]*?<\/article>/i)
  if (mainMatch) cleaned = mainMatch[0]

  // Strip all remaining tags
  const content = cleaned
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  return { title, content }
}

function extractLinks(html: string, baseUrl: string, domain: string): string[] {
  const links: string[] = []
  const regex = /href=["'](.*?)["']/gi
  let match
  while ((match = regex.exec(html)) !== null) {
    try {
      const url = new URL(match[1], baseUrl)
      if (url.hostname.includes(domain) && !url.hash && !url.pathname.match(/\.(pdf|jpg|png|gif|css|js|xml|json)$/i)) {
        links.push(url.origin + url.pathname)
      }
    } catch {}
  }
  return [...new Set(links)]
}

export async function scrapeSource(source: string, seedUrls: string[]): Promise<ScrapedPage[]> {
  const visited = new Set<string>()
  const pages: ScrapedPage[] = []
  const queue: { url: string; depth: number }[] = seedUrls.map(u => ({ url: u, depth: 0 }))
  const domain = new URL(seedUrls[0]).hostname.replace('www.', '')

  while (queue.length > 0 && pages.length < MAX_PAGES_PER_DOMAIN) {
    const { url, depth } = queue.shift()!
    if (visited.has(url) || depth > MAX_DEPTH) continue
    visited.add(url)

    try {
      await new Promise(r => setTimeout(r, RATE_LIMIT_MS))
      const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT }, redirect: 'follow' })
      if (!res.ok || !res.headers.get('content-type')?.includes('text/html')) continue

      const html = await res.text()
      const { title, content } = extractTextFromHtml(html)

      if (content.length < 100) continue // Skip empty/thin pages

      pages.push({ url, title, source, content })

      // Follow links
      if (depth < MAX_DEPTH) {
        const links = extractLinks(html, url, domain)
        for (const link of links) {
          if (!visited.has(link)) queue.push({ url: link, depth: depth + 1 })
        }
      }

      console.log(`[scraper] ${source}: ${pages.length} pages (depth ${depth}) — ${url}`)
    } catch (err) {
      console.warn(`[scraper] Failed: ${url}`, err instanceof Error ? err.message : err)
    }
  }

  return pages
}

export async function scrapeAll(): Promise<ScrapedPage[]> {
  const allPages: ScrapedPage[] = []
  for (const { source, urls } of SEED_URLS) {
    console.log(`[scraper] Starting ${source}...`)
    const pages = await scrapeSource(source, urls)
    allPages.push(...pages)
    console.log(`[scraper] ${source}: ${pages.length} pages scraped`)
  }
  return allPages
}
```

- [ ] **Step 2: Create chunker.ts**

```typescript
// lib/accountant-ai/chunker.ts

const CHUNK_SIZE = 500    // approximate tokens (chars / 4)
const CHUNK_OVERLAP = 50  // overlap tokens
const CHARS_PER_TOKEN = 4

export interface TextChunk {
  content: string
  chunkIndex: number
  metadata: {
    url: string
    title: string
    source: string
  }
}

export function chunkDocument(content: string, metadata: { url: string; title: string; source: string }): TextChunk[] {
  const chunkChars = CHUNK_SIZE * CHARS_PER_TOKEN
  const overlapChars = CHUNK_OVERLAP * CHARS_PER_TOKEN
  const chunks: TextChunk[] = []

  let start = 0
  let index = 0

  while (start < content.length) {
    let end = start + chunkChars

    // Try to break at a sentence boundary
    if (end < content.length) {
      const lastPeriod = content.lastIndexOf('. ', end)
      if (lastPeriod > start + chunkChars * 0.5) {
        end = lastPeriod + 2
      }
    }

    const chunkText = content.slice(start, end).trim()
    if (chunkText.length > 50) {
      chunks.push({ content: chunkText, chunkIndex: index++, metadata })
    }

    start = end - overlapChars
  }

  return chunks
}
```

- [ ] **Step 3: Create embedder.ts**

```typescript
// lib/accountant-ai/embedder.ts

const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || '').replace(/[^\x20-\x7E]/g, '').trim()
const EMBEDDING_MODEL = 'text-embedding-004'
const BATCH_SIZE = 50

export async function embedTexts(texts: string[]): Promise<number[][]> {
  const embeddings: number[][] = []

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE)

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:batchEmbedContents?key=${GEMINI_API_KEY}`
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: batch.map(text => ({
          model: `models/${EMBEDDING_MODEL}`,
          content: { parts: [{ text }] },
        })),
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`Embedding API error ${response.status}: ${err.slice(0, 200)}`)
    }

    const data = await response.json()
    for (const emb of data.embeddings || []) {
      embeddings.push(emb.values)
    }

    console.log(`[embedder] Embedded ${embeddings.length}/${texts.length} chunks`)
  }

  return embeddings
}

export async function embedQuery(text: string): Promise<number[]> {
  const results = await embedTexts([text])
  return results[0]
}
```

- [ ] **Step 4: Create rag-search.ts**

```typescript
// lib/accountant-ai/rag-search.ts

import { getAdminSupabase } from '@/lib/supabase/admin'
import { embedQuery } from './embedder'

export interface RagResult {
  content: string
  url: string
  title: string
  source: string
  similarity: number
}

export async function searchRag(query: string, topK: number = 5): Promise<RagResult[]> {
  const embedding = await embedQuery(query)
  const supabase = getAdminSupabase()

  const { data, error } = await (supabase.rpc as any)('match_rag_chunks', {
    query_embedding: `[${embedding.join(',')}]`,
    match_count: topK,
  })

  if (error) {
    console.error('[rag-search] Vector search failed:', error)
    return []
  }

  return (data || []).map((row: { content: string; metadata: { url: string; title: string; source: string }; similarity: number }) => ({
    content: row.content,
    url: row.metadata?.url || '',
    title: row.metadata?.title || '',
    source: row.metadata?.source || '',
    similarity: row.similarity,
  }))
}
```

- [ ] **Step 5: Commit**

```bash
git add lib/accountant-ai/
git commit -m "feat(accountant-ai): add scraper, chunker, embedder, and RAG search"
```

---

## Task 3: Scrape API Route

**Files:**
- Create: `app/api/v1/accountant-ai/scrape/route.ts`

- [ ] **Step 1: Create scrape route**

Admin-only POST route that runs the full pipeline: scrape → chunk → embed → store.

```typescript
// app/api/v1/accountant-ai/scrape/route.ts
import { getAdminSupabase } from '@/lib/supabase/admin'
import { getAuthUserId, apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'
import { scrapeAll } from '@/lib/accountant-ai/scraper'
import { chunkDocument } from '@/lib/accountant-ai/chunker'
import { embedTexts } from '@/lib/accountant-ai/embedder'

export const maxDuration = 300 // 5 minutes

export async function POST() {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const supabase = getAdminSupabase()

  try {
    // 1. Scrape all sources
    console.log('[scrape] Starting scrape...')
    const pages = await scrapeAll()
    console.log(`[scrape] Scraped ${pages.length} pages total`)

    // 2. Store documents (upsert by URL)
    for (const page of pages) {
      await (supabase.from as any)('rag_documents').upsert({
        url: page.url,
        title: page.title,
        source: page.source,
        content_text: page.content,
        scraped_at: new Date().toISOString(),
      }, { onConflict: 'url' })
    }

    // 3. Chunk all documents
    const allChunks = pages.flatMap(page =>
      chunkDocument(page.content, { url: page.url, title: page.title, source: page.source })
    )
    console.log(`[scrape] Created ${allChunks.length} chunks`)

    // 4. Generate embeddings
    const texts = allChunks.map(c => c.content)
    const embeddings = await embedTexts(texts)
    console.log(`[scrape] Generated ${embeddings.length} embeddings`)

    // 5. Clear old chunks and insert new ones
    await (supabase.from as any)('rag_chunks').delete().neq('id', '00000000-0000-0000-0000-000000000000')

    // Insert in batches of 100
    for (let i = 0; i < allChunks.length; i += 100) {
      const batch = allChunks.slice(i, i + 100).map((chunk, j) => ({
        document_id: null, // We'll skip FK for simplicity — metadata has the URL
        chunk_index: chunk.chunkIndex,
        content: chunk.content,
        metadata: chunk.metadata,
        embedding: `[${embeddings[i + j].join(',')}]`,
      }))

      await (supabase.from as any)('rag_chunks').insert(batch)
      console.log(`[scrape] Inserted chunks ${i}-${i + batch.length}`)
    }

    return apiSuccess({
      pagesScraped: pages.length,
      chunksCreated: allChunks.length,
      embeddingsGenerated: embeddings.length,
    })
  } catch (err) {
    console.error('[scrape] Pipeline failed:', err)
    return apiError('Scrape pipeline failed', 'SCRAPE_FAILED', 500)
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/v1/accountant-ai/scrape/
git commit -m "feat(accountant-ai): add admin scrape pipeline API route"
```

---

## Task 4: Types + Chat Hook

**Files:**
- Create: `tools/accountant-ai/types.ts`
- Create: `tools/accountant-ai/use-chat.ts`

- [ ] **Step 1: Create types.ts**

```typescript
// tools/accountant-ai/types.ts

export interface Conversation {
  id: string
  title: string | null
  createdAt: string
  updatedAt: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources: { url: string; title: string }[]
  createdAt: string
}

export interface ChatSource {
  url: string
  title: string
  source: string
}
```

- [ ] **Step 2: Create use-chat.ts**

'use client' hook managing conversation state, sending messages, loading history.

State: `conversations`, `activeConversationId`, `messages`, `loading`, `sending`, `error`

Methods:
- `loadConversations()` — GET `/api/v1/accountant-ai/conversations`
- `loadMessages(conversationId)` — GET `/api/v1/accountant-ai/conversations/{id}`
- `sendMessage(content)` — POST `/api/v1/accountant-ai/chat` with `{ conversationId, content }`, returns AI response with sources
- `newConversation()` — clears activeConversationId and messages
- `selectConversation(id)` — sets active and loads messages

Auto-scroll: expose a `messagesEndRef` for the UI to scroll to.

The hook should handle:
- Optimistically adding user message to `messages` before API response
- Adding assistant message after API responds
- Creating new conversation if `activeConversationId` is null (API returns new conversationId)
- Unwrapping API responses with `json.data ?? json`
- 1 credit deducted server-side (not in hook)

- [ ] **Step 3: Commit**

```bash
git add tools/accountant-ai/types.ts tools/accountant-ai/use-chat.ts
git commit -m "feat(accountant-ai): add chat types and useChat hook"
```

---

## Task 5: Chat API Routes

**Files:**
- Create: `app/api/v1/accountant-ai/chat/route.ts`
- Create: `app/api/v1/accountant-ai/conversations/route.ts`
- Create: `app/api/v1/accountant-ai/conversations/[id]/route.ts`

- [ ] **Step 1: Create chat route**

POST. Accepts `{ conversationId?: string, content: string }`. Deducts 1 credit. Embeds question, searches RAG, builds prompt with context, calls Gemini, saves both messages, returns response with sources.

Uses `searchRag` from `@/lib/accountant-ai/rag-search`. Uses Gemini via the same `callGemini` pattern from `lib/seo-studio/gemini.ts` (or inline fetch).

System prompt includes: NZ accounting context, cite sources, always disclaim.

If no `conversationId`: create new conversation, auto-title from first 40 chars of user message.

Return: `{ conversationId, message: { id, role, content, sources, createdAt } }`

- [ ] **Step 2: Create conversations list route**

GET. Returns user's conversations ordered by `updated_at DESC`, limit 20.

- [ ] **Step 3: Create conversation messages route**

GET `[id]`. Returns all messages for the conversation, ordered by `created_at ASC`.

- [ ] **Step 4: Commit**

```bash
git add app/api/v1/accountant-ai/
git commit -m "feat(accountant-ai): add chat, conversations list, and messages API routes"
```

---

## Task 6: Chat UI Components

**Files:**
- Create: `tools/accountant-ai/chat-message.tsx`
- Create: `tools/accountant-ai/chat-input.tsx`
- Create: `tools/accountant-ai/chat-sidebar.tsx`

- [ ] **Step 1: Create chat-message.tsx**

Renders a single message bubble. User messages: right-aligned blue bubble. AI messages: left-aligned dark bubble with markdown content, source pills, and disclaimer.

Props: `message: ChatMessage`

Source pills: `rounded-full bg-[#1e2631] px-2.5 py-1 text-xs text-[#3D9DF2]`, linked to URL, opens new tab.

Disclaimer: italic muted text at bottom of AI messages.

- [ ] **Step 2: Create chat-input.tsx**

Fixed-bottom input bar. Text input + send button. Enter sends, Shift+Enter newline. Disabled when sending. "1 credit" badge.

Props: `onSend: (content: string) => void`, `sending: boolean`, `disabled: boolean`

- [ ] **Step 3: Create chat-sidebar.tsx**

Conversation history list. "New Chat" button at top. List of conversations with title + date. Active conversation highlighted.

Props: `conversations: Conversation[]`, `activeId: string | null`, `onSelect: (id: string) => void`, `onNew: () => void`, `loading: boolean`

Desktop: always visible (w-64). Mobile: overlay triggered by prop.

- [ ] **Step 4: Commit**

```bash
git add tools/accountant-ai/chat-message.tsx tools/accountant-ai/chat-input.tsx tools/accountant-ai/chat-sidebar.tsx
git commit -m "feat(accountant-ai): add chat message, input, and sidebar components"
```

---

## Task 7: Chat Page + Main Layout

**Files:**
- Create: `tools/accountant-ai/chat-page.tsx`
- Create: `app/tools/accountant-ai/page.tsx`

- [ ] **Step 1: Create chat-page.tsx**

Main chat layout. Uses `useChat` hook. Renders sidebar (desktop) + messages area + empty state.

Desktop: flex row — sidebar left, messages right.
Mobile: messages only, hamburger toggles sidebar overlay.

Empty state: centered icon + "Ask me anything about NZ tax, accounting, or business compliance" + 3 example chips. Clicking a chip calls `sendMessage(chipText)`.

Messages area: scrollable, auto-scroll to bottom via `messagesEndRef`.

ToolFrame `actions` prop receives `<ChatInput>`.

- [ ] **Step 2: Create page.tsx route**

```typescript
// app/tools/accountant-ai/page.tsx
import type { Metadata } from 'next'
import { ToolFrame } from '@/components/layout/tool-frame'
import ChatPage from '@/tools/accountant-ai/chat-page'

export const metadata: Metadata = {
  title: 'Accountant AI — NZ Tax & Business Assistant | Toolk1t',
  description: 'AI-powered NZ accounting assistant. Ask about GST, income tax, company registration, employment law, and more.',
}

export default function AccountantAiPage() {
  return <ChatPage />
}
```

Note: ToolFrame is rendered INSIDE ChatPage since it needs access to the `actions` prop for the input bar.

- [ ] **Step 3: Commit**

```bash
git add tools/accountant-ai/chat-page.tsx app/tools/accountant-ai/page.tsx
git commit -m "feat(accountant-ai): add chat page with ToolFrame layout"
```

---

## Task 8: Tool Registry + Build Verification

**Files:**
- Modify: `lib/tools.tsx`
- Modify: `components/home/bento-showcase.tsx`
- Modify: `components/layout/tool-categories.ts`

- [ ] **Step 1: Add to tool registry**

Add Accountant AI to `lib/tools.tsx` (calculator/chat icon, blue-to-indigo gradient), `bento-showcase.tsx` (preview card), and `tool-categories.ts` (`'accountant-ai': 'utility'`).

- [ ] **Step 2: Build check**

```bash
pnpm build
```

- [ ] **Step 3: Commit**

```bash
git add lib/tools.tsx components/home/bento-showcase.tsx components/layout/tool-categories.ts
git commit -m "feat(accountant-ai): add to tool registry and homepage"
```

---

## Task 9: E2E Test & Verification

- [ ] **Step 1: Test scrape API (admin, may take a while)**

```bash
curl -s -X POST http://localhost:3000/api/v1/accountant-ai/scrape --max-time 300 | python3 -m json.tool | head -10
```

- [ ] **Step 2: Test chat API**

```bash
curl -s -X POST http://localhost:3000/api/v1/accountant-ai/chat \
  -H "Content-Type: application/json" \
  -d '{"content":"What is the current GST rate in New Zealand?"}' | python3 -m json.tool | head -20
```

- [ ] **Step 3: Screenshot chat UI**

```bash
python3 -c "
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1440, 'height': 900})
    page.goto('http://localhost:3000/tools/accountant-ai', timeout=60000)
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(3000)
    page.screenshot(path='/tmp/accountant-ai.png')
    browser.close()
"
```

- [ ] **Step 4: Fix issues, re-test, commit**

```bash
git add -A && git commit -m "fix(accountant-ai): e2e test fixes"
```

---

## Task Summary

| Task | Description | Dependencies | Complexity |
|---|---|---|---|
| 1 | Database migration + pgvector | None | Simple |
| 2 | RAG pipeline (scraper/chunker/embedder/search) | Task 1 | High |
| 3 | Scrape API route | Tasks 1, 2 | Medium |
| 4 | Types + chat hook | None | Medium |
| 5 | Chat API routes | Tasks 1, 2 | High |
| 6 | Chat UI components | Task 4 | Medium |
| 7 | Chat page + layout | Tasks 4, 6 | Medium |
| 8 | Tool registry + build | Task 7 | Simple |
| 9 | E2E test | All | Medium |

Tasks 1 and 4 can run in parallel. Task 2 depends on 1. Tasks 3 and 5 depend on 1+2. Task 6 depends on 4. Task 7 depends on 4+6. Task 8 depends on 7. Task 9 runs last.
