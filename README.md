# Trade Log Pro

Premium trading journal. Track trades, calculate your real edge, review by calendar, enforce pre-trade discipline.

All data stored locally on your device. No signup, no tracking.

---

## What's in here

- **Landing page** at `/` — public marketing site (problem, features, pricing, FAQ, waitlist).
- **The journal** at `/app` — onboarding, dashboard, calendar, trade logging, deep analytics.
- **Pro paywall scaffolding** — Pro features show as locked previews; "Join the waitlist" collects emails locally for now.

When the URL is shared, visitors see the landing page. When it's installed as a PWA, it opens straight to the journal.

---

## Run it locally

```bash
npm install
npm run dev
```

Open the URL it prints (usually `http://localhost:5173`). You'll land on the marketing page first; click "Open journal" or visit `/app` directly to skip it.

**Test on your phone over WiFi:** the dev command also prints a "Network" URL like `http://192.168.x.x:5173`. Open that on your phone (must be on same WiFi).

---

## Deploy

### Vercel (recommended)

**Via GitHub:**
1. Push this folder to a new GitHub repo.
2. Go to **vercel.com** → sign up with GitHub → **Add New Project** → pick the repo → **Deploy**.
3. ~60 seconds later you get `your-project.vercel.app`.

**Via CLI:**
```bash
npm install -g vercel
vercel        # preview deploy
vercel --prod # production
```

The `vercel.json` in this repo handles SPA routing so `/app` works on direct visits.

### Netlify

**Drag and drop:**
```bash
npm run build
```
Then drag the resulting `dist/` folder onto **app.netlify.com/drop**.

**Via CLI:**
```bash
npm install -g netlify-cli
netlify deploy        # preview
netlify deploy --prod # production
```

The `public/_redirects` file handles SPA routing.

---

## Install on your phone (PWA)

Once deployed:

**iOS Safari** → Share → **Add to Home Screen**
**Android Chrome** → ⋮ menu → **Install app**

The icon launches the journal fullscreen at `/app`. Works offline (except live market prices).

---

## What works in Phase 1

**Free (everything works now):**
- Onboarding (name, starting balance, theme, welcome message)
- Pre-trade confluence checklist (skippable countdown)
- Dashboard: equity curve, win rate, R:R, expectancy, max drawdown, streak, avg hold
- Live market prices: crypto (CoinGecko + Binance fallback), forex (ECB)
- Trade logging: 7 default markets + custom, screenshots, discipline scoring, emotion notes
- Calendar heatmap (P&L per day)
- Analytics page: P&L distribution, day-of-week, hold-time scatter
- CSV export, themes, full data reset

**Pro (locked previews + waitlist):**
- Setup-by-setup expectancy
- Confluence performance analysis
- AI trade review (powered by Claude)
- Cloud sync, PDF reports, time-of-day heatmap

Pro features show real (blurred) previews of your own data with an "Upgrade to Pro" overlay → opens waitlist modal → stores emails locally.

---

## Where the waitlist emails go

Right now: stored in `localStorage` under `tlp:waitlist`. Useful only on your dev machine.

**To collect them centrally** (recommended once you launch):

1. Sign up at **formspree.io** (free, 50 submissions/month).
2. In `src/landing.jsx` (the `submit` function in `WaitlistModal`) and `src/App.jsx` (the `submit` function in `UpgradeModal`), replace the `try/catch` block with:
   ```js
   await fetch('https://formspree.io/f/YOUR_ID', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
     body: JSON.stringify({ email })
   });
   ```
3. Now every signup arrives in your inbox.

---

## Phase 2 (next)

After you've shown the app to 5 traders and gotten real feedback:

- Supabase auth + cloud sync (replaces `localStorage` with a proper backend)
- Setup expectancy and confluence performance (unlock the Pro previews)
- AI trade review using Anthropic API

Don't build Phase 2 until 3 of those 5 traders ask for an account or sync.

---

## Phase 3

After someone says "I'd pay for this":

- Paystack/Flutterwave integration
- Pro tier billing
- PDF reports, time-of-day heatmap

---

## Files you might edit

- `src/landing.jsx` — marketing copy, FAQ, pricing
- `src/App.jsx` — the journal itself (large file, well-commented sections)
- `index.html` — SEO meta, OG tags, page title
- `public/og.svg` — Open Graph image (the preview when shared)
- `public/manifest.json` — app name, icons, install behavior

---

## Tech stack

React 18 · Vite · Recharts · Lucide · CoinGecko · Frankfurter (ECB) · localStorage. No backend.

---

## License

Yours. Build, sell, fork. No attribution required.
