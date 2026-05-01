-- ============================================================
-- TRADERS SPACE — SUPABASE SCHEMA
-- ============================================================
-- Run this in your Supabase SQL Editor in this exact order.
-- Each block is idempotent (CREATE IF NOT EXISTS / DROP IF EXISTS)
-- so you can safely re-run any section.
-- ============================================================

-- ------------------------------------------------------------
-- 1. PROFILES
--    One row per authenticated user. Created automatically on
--    sign-up via the trigger at the bottom of this file.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT,
  name            TEXT NOT NULL DEFAULT 'Trader',
  welcome_message TEXT NOT NULL DEFAULT 'Trader',
  starting_balance NUMERIC NOT NULL DEFAULT 10000,
  theme           TEXT NOT NULL DEFAULT 'green',
  confluence_check_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  confluence_check_seconds INTEGER NOT NULL DEFAULT 20,
  plan            TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to allow re-running this script
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ------------------------------------------------------------
-- 2. TRADES
--    All real and missed trades for a user.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.trades (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Core fields
  asset           TEXT NOT NULL,
  type            TEXT NOT NULL CHECK (type IN ('buy', 'sell')),
  lot_size        NUMERIC,
  entry_price     NUMERIC,
  exit_price      NUMERIC,
  pnl             NUMERIC NOT NULL DEFAULT 0,

  -- Timing
  entry_at        TIMESTAMPTZ NOT NULL,
  exit_at         TIMESTAMPTZ NOT NULL,
  duration_minutes NUMERIC NOT NULL DEFAULT 0,

  -- Context
  setup_type      TEXT,
  notes           TEXT,
  emotion         TEXT,
  discipline      INTEGER CHECK (discipline IS NULL OR (discipline >= 1 AND discipline <= 5)),
  confluence_ids  UUID[] NOT NULL DEFAULT '{}',

  -- Missed trade fields (null for real trades)
  missed          BOOLEAN NOT NULL DEFAULT FALSE,
  missed_reason   TEXT,
  estimated_pnl   NUMERIC,

  -- Import / dedupe
  ticket          TEXT,                      -- broker ticket for MT4/MT5 imports
  imported        BOOLEAN NOT NULL DEFAULT FALSE,

  -- Screenshot pointers (actual files live in storage)
  screenshot_paths TEXT[] NOT NULL DEFAULT '{}',

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Per-user dedupe by broker ticket (allows same ticket across users)
  UNIQUE (user_id, ticket)
);

CREATE INDEX IF NOT EXISTS trades_user_entry_idx ON public.trades(user_id, entry_at DESC);
CREATE INDEX IF NOT EXISTS trades_user_missed_idx ON public.trades(user_id, missed);

ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own trades" ON public.trades;
DROP POLICY IF EXISTS "Users can insert own trades" ON public.trades;
DROP POLICY IF EXISTS "Users can update own trades" ON public.trades;
DROP POLICY IF EXISTS "Users can delete own trades" ON public.trades;

CREATE POLICY "Users can read own trades"
  ON public.trades FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trades"
  ON public.trades FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trades"
  ON public.trades FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own trades"
  ON public.trades FOR DELETE
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------
-- 3. CONFLUENCES
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.confluences (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  note            TEXT,
  active          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS confluences_user_idx ON public.confluences(user_id);

ALTER TABLE public.confluences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own confluences" ON public.confluences;
DROP POLICY IF EXISTS "Users can insert own confluences" ON public.confluences;
DROP POLICY IF EXISTS "Users can update own confluences" ON public.confluences;
DROP POLICY IF EXISTS "Users can delete own confluences" ON public.confluences;

CREATE POLICY "Users can read own confluences"
  ON public.confluences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own confluences"
  ON public.confluences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own confluences"
  ON public.confluences FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own confluences"
  ON public.confluences FOR DELETE
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------
-- 4. JOURNAL ENTRIES
--    Notion-style multi-block entries with tags.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title           TEXT NOT NULL DEFAULT '',
  blocks          JSONB NOT NULL DEFAULT '[]',
  tags            JSONB NOT NULL DEFAULT '{}',
  linked_trade_id UUID REFERENCES public.trades(id) ON DELETE SET NULL,
  pinned          BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS journal_user_updated_idx ON public.journal_entries(user_id, pinned DESC, updated_at DESC);

ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own journal" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can insert own journal" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can update own journal" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can delete own journal" ON public.journal_entries;

CREATE POLICY "Users can read own journal"
  ON public.journal_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own journal"
  ON public.journal_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journal"
  ON public.journal_entries FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own journal"
  ON public.journal_entries FOR DELETE
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------
-- 5. WAITLIST
--    Pro-tier waitlist signups. Public table — anyone can insert
--    their own email, but nobody can read it back. You read it
--    via the Supabase dashboard.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.waitlist (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT NOT NULL,
  source          TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (email)
);

ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can join waitlist" ON public.waitlist;
DROP POLICY IF EXISTS "Nobody can read waitlist" ON public.waitlist;

-- Anyone (even anonymous) can insert their own email
CREATE POLICY "Anyone can join waitlist"
  ON public.waitlist FOR INSERT
  WITH CHECK (TRUE);

-- Nobody can SELECT — read via Supabase dashboard with service_role
-- (No policy = no access for normal users)

-- ------------------------------------------------------------
-- 6. AUTOMATIC PROFILE CREATION ON SIGN-UP
--    When auth.users gets a new row, automatically create a
--    matching profile row.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, welcome_message)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Trader'),
    COALESCE(NEW.raw_user_meta_data->>'welcome_message', NEW.raw_user_meta_data->>'name', 'Trader')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------
-- 7. UPDATED_AT TRIGGER
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_touch ON public.profiles;
CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trades_touch ON public.trades;
CREATE TRIGGER trades_touch BEFORE UPDATE ON public.trades
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS confluences_touch ON public.confluences;
CREATE TRIGGER confluences_touch BEFORE UPDATE ON public.confluences
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS journal_touch ON public.journal_entries;
CREATE TRIGGER journal_touch BEFORE UPDATE ON public.journal_entries
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============================================================
-- DONE. Now create the storage bucket for screenshots.
-- ------------------------------------------------------------
-- IN A SEPARATE STEP — go to Supabase dashboard → Storage:
--   1. Click "New bucket"
--   2. Name: screenshots
--   3. Public: NO (keep private)
--   4. File size limit: 5 MB
--   5. Allowed MIME types: image/jpeg, image/png, image/webp
-- Then run THIS SQL to add storage policies:
-- ============================================================

-- Allow authenticated users to upload to their own folder
DROP POLICY IF EXISTS "Users can upload own screenshots" ON storage.objects;
CREATE POLICY "Users can upload own screenshots"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'screenshots'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to read their own files
DROP POLICY IF EXISTS "Users can read own screenshots" ON storage.objects;
CREATE POLICY "Users can read own screenshots"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'screenshots'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to delete their own files
DROP POLICY IF EXISTS "Users can delete own screenshots" ON storage.objects;
CREATE POLICY "Users can delete own screenshots"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'screenshots'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
