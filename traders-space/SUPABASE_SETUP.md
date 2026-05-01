# Phase 2 — Supabase Setup Guide

Cloud sync is now fully wired. Follow this once and signed-in users get cross-device data, screenshots, journal entries, the works.

Total time: ~15 minutes for first-timers.

---

## 1. Create your Supabase project (5 minutes)

1. Go to **https://supabase.com** → **Start your project** → sign in with GitHub.
2. Click **New project**.
3. Fill in:
   - **Name:** `traders-space`
   - **Database Password:** Click **Generate a password** → **save it in a password manager**.
   - **Region:** **`West EU (London)` (eu-west-2)** — best latency for Nigerian, EU, and African users.
   - **Pricing:** **Free** (500MB database, 1GB file storage, 50K active users — plenty for now).
4. Click **Create new project**. Wait ~2 minutes for provisioning.

---

## 2. Run the schema SQL (3 minutes)

1. In your project, click **SQL Editor** in the left sidebar.
2. Click **New query**.
3. Open `supabase/schema.sql` from this repo.
4. Copy the **whole file** and paste it into the SQL editor.
5. Click **Run** (bottom-right). Should return "Success. No rows returned."

The script is idempotent — safe to re-run anytime.

---

## 3. Create the screenshots storage bucket (2 minutes)

The schema can't create buckets, so do this manually:

1. Click **Storage** in the left sidebar.
2. Click **New bucket**.
3. Fill in:
   - **Name:** `screenshots` (must match exactly)
   - **Public bucket:** **OFF** (keep private)
   - **File size limit:** `5 MB`
   - **Allowed MIME types:** `image/jpeg, image/png, image/webp`
4. Click **Save**.

Storage RLS policies were already added by the schema SQL.

---

## 4. Configure auth (3 minutes)

1. Click **Authentication** → **Providers**.
2. **Email** is enabled by default. Recommended:
   - **Enable email confirmations:** ON for production, OFF for testing.
3. Click **Authentication** → **URL Configuration**.
4. Set **Site URL** to your production URL (e.g., `https://traders-space.vercel.app`).
5. Add to **Redirect URLs**:
   - `http://localhost:5173/app` (dev)
   - `https://your-deployed-url.com/app` (prod)
6. Save.

---

## 5. Get your API keys (1 minute)

1. **Settings** → **API**.
2. Copy:
   - **Project URL**
   - **anon / public key** (safe to expose in frontend — RLS protects data)
3. **DO NOT use the service_role key** in the app. That's admin-only.

---

## 6. Add keys to your project (1 minute)

```bash
cp .env.example .env
```

Open `.env` and paste:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...long-string
```

For Vercel: Dashboard → Project → Settings → Environment Variables → add both `VITE_SUPABASE_*` vars → Redeploy.

For Netlify: Site settings → Build & deploy → Environment → same two variables.

---

## 7. Test the full flow (2 minutes)

```bash
npm install
npm run dev
```

Open `/app`, then:

1. **Anonymous flow** — go through onboarding, log a couple of trades. Confirm everything works.
2. **Sign up** — Settings → "Sync your data" banner → Create account. Should show migration sheet.
3. **Click "Import"** — your local trades copy to Supabase. Verify in Supabase dashboard → **Table Editor** → `trades`.
4. **Look for the sync indicator** — top-right should show a green pulsing "synced" pill.
5. **Add a new trade** — should appear in Supabase `trades` table immediately.
6. **Sign out** — go to Settings → Sign out. Should switch back to local data.
7. **Sign back in** — your cloud data should reappear.

---

## What's wired in Phase 2 (now complete)

- ✅ **Schema + RLS policies** — physically impossible for one user to read another's data.
- ✅ **Sign up / sign in / magic link / password reset** — full auth flow.
- ✅ **Account banner** in Settings (signed out) and account card (signed in).
- ✅ **First-time migration sheet** — copies localStorage to cloud on first sign-in.
- ✅ **Cloud sync of every entity** — trades, missed trades, journal entries, confluences, profile, screenshots.
- ✅ **Sync indicator** in the top-right showing live sync state (synced / syncing / offline).
- ✅ **Statement import** writes directly to cloud for signed-in users.
- ✅ **Screenshots** uploaded to private Supabase Storage bucket with signed URLs (1-hour expiry).
- ✅ **Pro waitlist** writes to Supabase `waitlist` table (visible in dashboard).

---

## What's still localStorage-only

- **Onboarding seeds** (default confluences and starting balance) — these write to localStorage even for signed-in users on first onboarding. Migration handles copying them to cloud later.
- **Migration completion flag** — per-device flag tracking whether localStorage was already migrated. This is intentionally device-local.
- **Pro waitlist email backup** — saved to localStorage as a backup in case Supabase + Formspree both fail.

This is the "right" architecture, not a workaround.

---

## Honest limits to be aware of

**No real-time sync between devices.** If you have the app open on phone and laptop simultaneously, edits on one don't push to the other live. They'll appear after a refresh. Real-time is a Phase 3+ feature using Supabase Realtime — easy to add when needed, but most journaling is single-device anyway.

**No offline queue.** If a signed-in user is offline and tries to save a trade, the save fails (the sync indicator turns red). They have to be online to write. The local data isn't lost — it stays in component state — but reconnect-and-retry isn't automatic. Adding this is a 1-day job; defer until users actually report it.

**Emails.** Supabase free tier sends auth emails via their default SMTP, which can land in spam. For real launch, configure a real SMTP provider (Resend, Postmark) in Supabase Settings → Auth → Email.

---

## What to do this week

1. Do the setup above and confirm sign-up works.
2. Test the migration flow with a fresh account against real localStorage data.
3. Send the deployed URL back to your 7 testers: "**Now you can create an account and your data syncs across devices.**"
4. **Track the signup rate.** If ≥3 of 7 sign up, cloud sync was the right call. If 0–1, anonymous is the dominant flow and Pro features should not require accounts.
5. Open the next conversation with what they said and what the data shows.

---

## Troubleshooting

**"Accounts not configured" error:**
Your `.env` isn't being read. Restart `npm run dev` after creating it. In production, verify env vars are set in your hosting dashboard.

**Sign-up succeeds but no email arrives:**
Check spam. Supabase free tier email is unreliable. Configure SMTP for production.

**Sync indicator stays red:**
Open browser console → look for Supabase errors. Most common: RLS policy mismatch, expired session, or schema not applied. Re-run the schema SQL.

**Screenshots show as broken images after sign-in:**
Screenshots from your localStorage data weren't migrated to cloud storage. This is fixable — sign out, the screenshots reappear locally. We may add a re-upload flow in Phase 3.

**`new row violates row-level security policy` in console:**
Means a save tried to write a row with no/wrong user_id. Sign out and back in to refresh the session, then retry.
