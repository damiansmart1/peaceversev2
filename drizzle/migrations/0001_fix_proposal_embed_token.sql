CREATE OR REPLACE FUNCTION public.generate_embed_token() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF NEW.embed_token IS NULL THEN NEW.embed_token := replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''); END IF;
  RETURN NEW;
END $$;