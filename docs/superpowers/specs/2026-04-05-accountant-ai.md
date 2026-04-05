# Accountant AI — Design Spec (Phase 1)

**Date:** 2026-04-05
**Status:** Approved

---

## Overview

An AI accounting chatbot at `/tools/accountant-ai` powered by RAG over NZ government sources (IRD, Companies Office, MBIE). Users ask accounting/tax questions and get sourced, disclaimed answers. Phase 1 covers the RAG pipeline and chat interface. Phase 2 (future) adds personal Tax Manager data integration.

## RAG Pipeline

### Scraper
- Server-side Node.js script crawling 3 domains:
  - `ird.govt.nz` — tax guides, GST, PAYE, income tax, deductions
  - `companiesoffice.govt.nz` — company registration, annual returns, director obligations
  - `employment.govt.nz` — employment law, minimum wage, leave entitlements
- Follows internal links up to 3 levels deep from seed URLs
- Extracts main content (strips nav/footer/sidebars)
- Rate limited: 1 req/sec per domain, respects robots.txt
- Triggered via admin API: `POST /api/v1/accountant-ai/scrape`
- Monthly re-scrape via cron

### Chunking
- 500-token chunks with 50-token overlap
- Each chunk retains: source URL, document title, section heading
- Stored in `rag_chunks` table with pgvector embedding column

### Embedding
- Model: Gemini `text-embedding-004` (768 dimensions)
- Batched: 50 chunks per API call
- Stored as `vector(768)` in Supabase pgvector

### Database Tables

**`rag_documents`**
```sql
id UUID PRIMARY KEY
url TEXT NOT NULL UNIQUE
title TEXT
source TEXT NOT NULL  -- 'ird' | 'companies-office' | 'mbie'
content_text TEXT NOT NULL
scraped_at TIMESTAMPTZ DEFAULT now()
```

**`rag_chunks`**
```sql
id UUID PRIMARY KEY
document_id UUID REFERENCES rag_documents(id)
chunk_index INT
content TEXT NOT NULL
metadata JSONB  -- { url, title, section }
embedding vector(768)
created_at TIMESTAMPTZ DEFAULT now()
```

**`accountant_ai_conversations`**
```sql
id UUID PRIMARY KEY
user_id UUID NOT NULL
title TEXT
created_at TIMESTAMPTZ DEFAULT now()
updated_at TIMESTAMPTZ DEFAULT now()
```

**`accountant_ai_messages`**
```sql
id UUID PRIMARY KEY
conversation_id UUID REFERENCES accountant_ai_conversations(id)
role TEXT NOT NULL  -- 'user' | 'assistant'
content TEXT NOT NULL
sources JSONB  -- [{ url, title }]
created_at TIMESTAMPTZ DEFAULT now()
```

## Chat Flow

1. User sends message (1 credit)
2. Embed user question with `text-embedding-004`
3. Vector search: cosine similarity against `rag_chunks`, top 5 results
4. Construct prompt: system instructions + context chunks + question + disclaimer rule
5. Call Gemini 2.5 Flash
6. Return response with source citations
7. Persist both messages to DB

### System Prompt
```
You are an NZ accounting and tax assistant. Answer based ONLY on the provided context from official NZ government sources.

Rules:
- Only answer from the provided context. If the context doesn't cover the question, say "I don't have specific information on that topic."
- Cite the source URL for each fact using [Source](url) format.
- Be concise but thorough.
- Always end with: "⚠️ This is general information only, not professional tax advice. Please consult a qualified accountant for your specific situation."
```

## Chat UI

### Route: `/tools/accountant-ai`
- ToolFrame: utility category (blue theme), no tabs
- ToolFrame `actions` prop: chat input bar (fixed bottom)

### Layout
**Desktop:**
- Left sidebar (w-64): "New Chat" button + conversation history list
- Right: chat messages area (scrollable)

**Mobile:**
- No sidebar (hamburger toggles conversation list as overlay)
- Chat area full width
- Input pinned at bottom

### Message Rendering
- User: right-aligned, `bg-[#3D6AF2]/20` bubble
- Assistant: left-aligned, `bg-[#131a23]` bubble
  - Markdown rendered (headings, lists, bold, links)
  - Source pills below message (linked to govt pages)
  - Disclaimer in muted italic text
- Typing indicator: 3 pulsing dots while waiting

### Empty State
- Centered AI icon + "Ask me anything about NZ tax, accounting, or business compliance"
- 3 example question chips:
  - "What's the current GST rate?"
  - "How do I register a company in NZ?"
  - "What are the minimum wage rates?"

## API Routes

| Route | Method | Auth | Credits | Purpose |
|---|---|---|---|---|
| `/api/v1/accountant-ai/chat` | POST | Yes | 1 | Send message, get AI response |
| `/api/v1/accountant-ai/conversations` | GET | Yes | 0 | List user's conversations |
| `/api/v1/accountant-ai/conversations/[id]` | GET | Yes | 0 | Get conversation messages |
| `/api/v1/accountant-ai/scrape` | POST | Admin | 0 | Trigger RAG scrape pipeline |

## File Structure

### New Files
| File | Responsibility |
|---|---|
| `tools/accountant-ai/chat-page.tsx` | Main chat UI component |
| `tools/accountant-ai/chat-sidebar.tsx` | Conversation history sidebar |
| `tools/accountant-ai/chat-message.tsx` | Individual message bubble |
| `tools/accountant-ai/chat-input.tsx` | Input bar with send button |
| `tools/accountant-ai/types.ts` | Types for conversations, messages |
| `tools/accountant-ai/use-chat.ts` | Chat state hook |
| `app/tools/accountant-ai/page.tsx` | Route page |
| `app/api/v1/accountant-ai/chat/route.ts` | Chat API (embed → search → generate) |
| `app/api/v1/accountant-ai/conversations/route.ts` | List conversations |
| `app/api/v1/accountant-ai/conversations/[id]/route.ts` | Get conversation messages |
| `app/api/v1/accountant-ai/scrape/route.ts` | RAG scrape trigger |
| `lib/accountant-ai/scraper.ts` | Web scraper for govt sites |
| `lib/accountant-ai/chunker.ts` | Text chunking logic |
| `lib/accountant-ai/embedder.ts` | Gemini embedding wrapper |
| `lib/accountant-ai/rag-search.ts` | Vector similarity search |
| `supabase/migrations/040_accountant_ai.sql` | All tables + pgvector |

### Modified Files
| File | Changes |
|---|---|
| `lib/tools.tsx` | Add Accountant AI tool entry |
| `components/home/bento-showcase.tsx` | Add Accountant AI card |
| `components/layout/tool-categories.ts` | Add 'accountant-ai': 'utility' |

## Credits
- 1 credit per user message
- Scraping: free (admin only)
- Viewing history: free

## Out of Scope (Phase 2)
- Tax Manager data integration (personalized advice)
- Document upload (user uploads their own tax documents)
- Tax return generation
- Real-time IRD API integration
- Multi-language support

## Decision Log

| # | Decision | Alternatives | Rationale |
|---|---|---|---|
| 1 | Standalone chat tool | Tab in Tax Manager; widget | Best chat UX |
| 2 | Automated scraping | Manual curation; API | Widest coverage |
| 3 | Gemini embedding-004 + pgvector | OpenAI; Pinecone | Free, native Supabase |
| 4 | Gemini 2.5 Flash | GPT-4; Claude | Consistent |
| 5 | Phase 1 RAG only | All at once | Validate first |
| 6 | Always disclaim | Smart; none | Legal safety |
| 7 | 500-token chunks | Larger; smaller | Balance |
| 8 | 1 credit/message | Free; per-conversation | Platform consistency |
| 9 | Monthly re-scrape | Weekly | Content changes slowly |
| 10 | Persist chat history | No persistence | Reference past Q&A |
