-- Drop the old 4-param insert_book that conflicts with the 6-param version
DROP FUNCTION IF EXISTS public.insert_book(UUID, TEXT, JSONB, BOOLEAN);
