CREATE EXTENSION IF NOT EXISTS vector;

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
GRANT ALL ON rag_chunks TO service_role;

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
  SELECT rc.id, rc.content, rc.metadata, 1 - (rc.embedding <=> query_embedding) AS similarity
  FROM rag_chunks rc
  ORDER BY rc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
