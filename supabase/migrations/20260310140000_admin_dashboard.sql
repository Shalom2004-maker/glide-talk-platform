-- ============================================================
-- ADMIN: roles, verification, and moderation
--
-- Adds:
--  1. profiles.is_admin            - admin flag (set manually/managed)
--  2. profiles.is_banned           - banned users cannot send messages
--  3. profiles.is_verified         - verified badge on profiles
--  4. profiles.deleted_at          - soft-delete / deactivated timestamp
--  5. profiles.role                - 'user' | 'admin' (default 'user')
--  6. admin-only RLS policies
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_admin     BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_banned    BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_verified  BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at   TIMESTAMPTZ;

-- Helper: is the current user an admin?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND is_admin = true
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- ---- Admin can read all profiles ----
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
CREATE POLICY "Admins can read all profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (public.is_admin());

-- ---- Admin can update profiles ----
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
CREATE POLICY "Admins can update profiles"
  ON public.profiles FOR UPDATE TO authenticated
  USING (public.is_admin());

-- ---- Admin can read all messages ----
DROP POLICY IF EXISTS "Admins can read all messages" ON public.messages;
CREATE POLICY "Admins can read all messages"
  ON public.messages FOR SELECT TO authenticated
  USING (public.is_admin());

-- ---- Admin can read all conversations ----
DROP POLICY IF EXISTS "Admins can read all conversations" ON public.conversations;
CREATE POLICY "Admins can read all conversations"
  ON public.conversations FOR SELECT TO authenticated
  USING (public.is_admin());

-- ---- Admins can delete any message (content moderation) ----
DROP POLICY IF EXISTS "Admins can delete messages" ON public.messages;
CREATE POLICY "Admins can delete messages"
  ON public.messages FOR DELETE TO authenticated
  USING (public.is_admin());
