-- ============================================================
-- MUTE & BLOCK
--
--  1. user_blocks          - one user blocks another
--  2. conversation_mutes   - a user mutes notifications for a conversation
-- ============================================================

-- ---- user_blocks ----
CREATE TABLE IF NOT EXISTS public.user_blocks (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (blocker_id, blocked_id)
);

ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own blocks" ON public.user_blocks;
CREATE POLICY "Users can view their own blocks"
  ON public.user_blocks FOR SELECT TO authenticated
  USING (blocker_id = auth.uid());

DROP POLICY IF EXISTS "Users can create their own blocks" ON public.user_blocks;
CREATE POLICY "Users can create their own blocks"
  ON public.user_blocks FOR INSERT TO authenticated
  WITH CHECK (blocker_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own blocks" ON public.user_blocks;
CREATE POLICY "Users can delete their own blocks"
  ON public.user_blocks FOR DELETE TO authenticated
  USING (blocker_id = auth.uid());

CREATE INDEX IF NOT EXISTS user_blocks_blocker_idx ON public.user_blocks (blocker_id);
CREATE INDEX IF NOT EXISTS user_blocks_blocked_idx ON public.user_blocks (blocked_id);

-- ---- conversation_mutes ----
CREATE TABLE IF NOT EXISTS public.conversation_mutes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (conversation_id, user_id)
);

ALTER TABLE public.conversation_mutes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own mutes" ON public.conversation_mutes;
CREATE POLICY "Users can view their own mutes"
  ON public.conversation_mutes FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create their own mutes" ON public.conversation_mutes;
CREATE POLICY "Users can create their own mutes"
  ON public.conversation_mutes FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own mutes" ON public.conversation_mutes;
CREATE POLICY "Users can delete their own mutes"
  ON public.conversation_mutes FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS conversation_mutes_conv_idx ON public.conversation_mutes (conversation_id);
CREATE INDEX IF NOT EXISTS conversation_mutes_user_idx ON public.conversation_mutes (user_id);

-- ---- Blocked users cannot send messages ----
DROP POLICY IF EXISTS "Blocked users cannot send messages" ON public.messages;
CREATE POLICY "Blocked users cannot send messages"
  ON public.messages FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND NOT EXISTS (
      SELECT 1 FROM public.user_blocks b
      WHERE (b.blocker_id = auth.uid() AND b.blocked_id = (
        SELECT cp.user_id FROM public.conversation_participants cp
        WHERE cp.conversation_id = messages.conversation_id AND cp.user_id <> auth.uid()
        LIMIT 1
      ))
      OR (b.blocked_id = auth.uid() AND b.blocker_id = (
        SELECT cp.user_id FROM public.conversation_participants cp
        WHERE cp.conversation_id = messages.conversation_id AND cp.user_id <> auth.uid()
        LIMIT 1
      ))
    )
  );
