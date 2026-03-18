-- RPC: delete_book_job — allows a user to delete their own job (bypasses RLS)
CREATE OR REPLACE FUNCTION public.delete_book_job(p_job_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INT;
BEGIN
  DELETE FROM public.book_jobs
   WHERE id = p_job_id
     AND user_id = p_user_id;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count > 0;
END;
$$;
