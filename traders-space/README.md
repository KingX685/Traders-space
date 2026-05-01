# Traders Space

Premium trading journal — your edge, your space. Track trades, journal Notion-style, calculate your real edge, and (now) sync across devices.

Anonymous-first. Optional cloud accounts. Free forever.

---

## What's in here

- **Landing page** at `/` — public marketing site (problem, features, pricing, FAQ, waitlist)
- **The journal** at `/app` — onboarding, dashboard, calendar, trade logging, deep analytics, Notion-style writing, missed-trade tracking
- **Cloud sync (Phase 2)** — optional sign-in via Supabase, full sync of trades + journal + screenshots + confluences across devices
- **Pro paywall** — locked previews collect waitlist emails

---

## v2.1 — Phase 2 highlights

- **Cloud sync.** Sign in to use the same journal on phone, tablet, and laptop.
- **Migration on first sign-in.** Existing local data copies into your cloud account.
- **Sync indicator.** Top-right pill shows live sync state (synced / syncing / offline).
- **Account-aware everything.** Trades, journal entries, confluences, screenshots — all scoped to your user.
- **RLS-protected.** Database-level policies make it impossible for one user to read another's data.
- **Screenshots in private Supabase Storage** — signed URLs, 1-hour expiry, scoped per user.

---

## Quick start

```bash
cp .env.example .env
# Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm install
npm run dev
```

Visit `http://localhost:5173`. Marketing page first; click "Open journal" or visit `/app`.

**Without Supabase env vars:** the app runs in anonymous-only mode. Auth UI shows "Accounts not configured" if attempted. Everything else works.

---

## Setting up Supabase (~15 minutes)

See **`SUPABASE_SETUP.md`** for the step-by-step guide. Short version:

1. Create a Supabase project in `eu-west-2 (London)`.
2. Run `supabase/schema.sql` in the SQL editor.
3. Create a private Storage bucket called `screenshots` (5MB limit, image/* MIME types).
4. Configure auth redirect URLs.
5. Copy URL + anon key to `.env`.

---

## Deploy

### Vercel (recommended)

```bash
vercel        # preview
vercel --prod # production
```

Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to Vercel env vars.

`vercel.json` handles SPA routing.

### Netlify

```bash
npm run build
# Drag dist/ to app.netlify.com/drop
```

`public/_redirects` handles SPA routing.

---

## Install on phone (PWA)

iOS Safari → Share → **Add to Home Screen**
Android Chrome → ⋮ → **Install app**

Launches fullscreen at `/app`. Works offline (except market prices and cloud sync).

---

## Privacy

Anonymous users: data only on device.
Cloud users: data on Supabase eu-west-2 (London), encrypted at rest, RLS-scoped per user.

See **`PRIVACY_POLICY_DRAFT.md`** for the user-facing privacy policy.

---

## Architecture

```
src/
  App.jsx             # Main app (~4400 lines, organized by feature)
  landing.jsx         # Marketing page
  main.jsx            # Entry point with routing + providers
  lib/
    auth.jsx          # AuthProvider, useAuth() hook
    auth-ui.jsx       # Sign in / sign up / migrate UI
    storage.js        # Local + cloud adapters, migration logic
    use-store.js      # useStore() hook returns the right adapter
    store-context.jsx # StoreProvider + useStoreCtx() so children share one adapter
    supabase.js       # Supabase client init
public/
  icon.svg            # App icon (works for PWA install)
  og.svg              # Open Graph image
  manifest.json       # PWA manifest
  _redirects          # Netlify SPA routing
supabase/
  schema.sql          # Schema + RLS policies (paste into Supabase SQL editor)
```

---

## Tech stack

- **React 18** + **Vite** with chunk splitting
- **Recharts** (lazy-loaded) for analytics
- **Lucide** for icons
- **Supabase** for auth + Postgres + Storage
- **CoinGecko** + **Frankfurter** + **Binance** for live prices
- **localStorage** for anonymous mode + per-device flags

Bundle (gzipped):
- Landing page: ~70KB total
- Full app first load: ~190KB
- Subsequent navigation: instant (cached chunks)

---

## What's NOT done yet (deferred to Phase 3+)

- **Real-time multi-device sync** — edits don't push live between sessions; refresh shows latest
- **Offline queue** — signed-in users need network to save (sync indicator turns red if offline)
- **Paid Pro tier** — waitlist exists, billing not built
- **AI Trade Review** — Pro feature, locked preview only
- **MT4/MT5 Expert Advisor** — for users who want real-time push instead of statement upload
- **Broker API integrations** (Deriv, etc.) — see prior notes on why this is deferred

These are all justifiable, all built in time, all need feedback first.

---

## License

Yours. Build, ship, sell.
