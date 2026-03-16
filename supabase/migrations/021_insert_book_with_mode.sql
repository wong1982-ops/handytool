-- Update insert_book RPC to accept p_mode parameter
DROP FUNCTION IF EXISTS public.insert_book(UUID, TEXT, JSONB, BOOLEAN, UUID);

CREATE OR REPLACE FUNCTION public.insert_book(
  p_user_id UUID,
  p_slug TEXT,
  p_data JSONB,
  p_is_public BOOLEAN DEFAULT false,
  p_series_id UUID DEFAULT NULL,
  p_mode TEXT DEFAULT 'speed'
) RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO public.books (user_id, slug, data, is_public, series_id, title, cover_url, page_count, audience, style, mode)
  VALUES (
    p_user_id,
    p_slug,
    p_data,
    p_is_public,
    p_series_id,
    COALESCE(p_data->>'title', 'Untitled'),
    CASE
      WHEN (p_data->>'coverImageUrl') LIKE 'http%' THEN p_data->>'coverImageUrl'
      ELSE NULL
    END,
    COALESCE(jsonb_array_length(p_data->'pages'), 0),
    COALESCE(p_data->'concept'->'tags'->>'audience', ''),
    COALESCE(p_data->'concept'->'tags'->>'style', ''),
    p_mode
  )
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;
