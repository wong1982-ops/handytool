-- =============================================================
-- 017_get_book_by_id.sql
-- Efficient single-book fetch (avoids loading all books)
-- =============================================================

CREATE OR REPLACE FUNCTION public.get_book_by_id(p_user_id UUID, p_book_id UUID)
RETURNS SETOF public.books
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT * FROM public.books
  WHERE id = p_book_id AND user_id = p_user_id
  LIMIT 1;
$$;
