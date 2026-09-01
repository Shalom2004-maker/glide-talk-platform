-- ============================================================
-- FEATURE 1: File/Image Attachments on messages
-- ============================================================

-- Add attachment metadata to messages
ALTER TABLE public.messages
  ADD COLUMN attachment_name TEXT,
  ADD COLUMN attachment_url TEXT,
  ADD COLUMN attachment_type TEXT,
  ADD COLUMN attachment_size BIGINT;

-- ============================================================
-- FEATURE 2: Presence (online / last_seen)
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN is_online BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN last_seen TIMESTAMP WITH TIME ZONE;

-- Function to mark the current user online
CREATE OR REPLACE FUNCTION public.user_online()
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET is_online = true, last_seen = now()
  WHERE user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to mark the current user offline
CREATE OR REPLACE FUNCTION public.user_offline()
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET is_online = false, last_seen = now()
  WHERE user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add to realtime publication so presence changes propagate live
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================

-- Chat attachments bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-attachments', 'chat-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Avatars bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: chat attachments
DROP POLICY IF EXISTS "Authenticated users can upload attachments" ON storage.objects;
CREATE POLICY "Authenticated users can upload attachments"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'chat-attachments');

DROP POLICY IF EXISTS "Anyone can read chat attachments" ON storage.objects;
CREATE POLICY "Anyone can read chat attachments"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'chat-attachments');

DROP POLICY IF EXISTS "Owners can delete their attachments" ON storage.objects;
CREATE POLICY "Owners can delete their attachments"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'chat-attachments' AND owner = auth.uid());

-- Storage policies: avatars
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
CREATE POLICY "Authenticated users can upload avatars"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Anyone can read avatars" ON storage.objects;
CREATE POLICY "Anyone can read avatars"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;
CREATE POLICY "Users can delete their own avatars"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND owner = auth.uid());
