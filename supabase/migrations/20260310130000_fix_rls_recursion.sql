-- ============================================================
-- FIX: RLS infinite recursion on conversation_participants
--
-- The original SELECT policy on conversation_participants
-- referenced conversation_participants itself, causing infinite
-- recursion during RLS evaluation (HTTP 500 on every SELECT).
-- Replaced with a SECURITY DEFINER helper that bypasses RLS,
-- which is the canonical Supabase pattern for self-referential
-- membership checks.
-- ============================================================

-- Helper: is the current user a participant of this conversation?
CREATE OR REPLACE FUNCTION public.is_conversation_participant(conv_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversation_participants cp
    WHERE cp.conversation_id = conv_id AND cp.user_id = auth.uid()
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- ---- conversations ----
DROP POLICY IF EXISTS "Users can view their conversations" ON public.conversations;
CREATE POLICY "Users can view their conversations"
  ON public.conversations FOR SELECT TO authenticated
  USING (public.is_conversation_participant(id));

-- ---- conversation_participants ----
DROP POLICY IF EXISTS "Users can view participants of their conversations"
  ON public.conversation_participants;
CREATE POLICY "Users can view participants of their conversations"
  ON public.conversation_participants FOR SELECT TO authenticated
  USING (public.is_conversation_participant(conversation_id));

DROP POLICY IF EXISTS "Users can add participants to conversations"
  ON public.conversation_participants;
CREATE POLICY "Users can add participants to conversations"
  ON public.conversation_participants FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    OR public.is_conversation_participant(conversation_id)
  );