# Privacy Policy — Traders Space

_Last updated: [date you publish this]_

This is a draft. Have a lawyer review it before deploying to production, especially if you target users in regulated regions (EU, Nigeria, California, etc.). I've written it to match how the app actually works.

---

## What we collect

**If you use the app anonymously (no signup):**
We collect nothing. Zero. Your trade data, journal entries, and settings live in your browser's local storage. No copy of your data exists on our servers, in our analytics, or anywhere we control. If you clear your browser data, the data is gone — even from us.

**If you create an account:**
We collect:
- Your email address (used for sign-in, password reset, and Pro waitlist notifications only)
- A password hash (we never see your actual password — Supabase handles this)
- Your trades, journal entries, confluences, and profile preferences (the data you type into the app)
- Chart screenshots you upload (stored in encrypted Supabase storage, scoped to your account)
- Account creation date and last sign-in time (for security and abuse prevention)

We do not collect:
- Cookies for tracking, advertising, or analytics
- Your IP address (beyond standard server logs which Supabase auto-rotates)
- Browser fingerprints
- Behavioral analytics (we don't use Google Analytics, Mixpanel, Posthog, etc.)
- Anything you don't explicitly enter into the app

---

## Where your data lives

If you create an account, your data is stored on **Supabase** infrastructure (built on AWS) in the **eu-west-2 (London)** region.

If you use the app anonymously, your data lives **only in your browser's local storage** on your device. We have no copy and no access.

---

## Who can see your data

**Anonymous users:** No one. Your data never leaves your device.

**Account users:** Only you. Database row-level security policies prevent any other user — or even our app code — from reading your trades, journal entries, or screenshots without your authentication. We (the operators) can technically access the database with our admin credentials for backup, debugging, or if compelled by law, but:
- We do not read user data as part of normal operations
- We have no plans to monetize, sell, share, or analyze user data
- Account passwords are stored as one-way hashes — we cannot read them

---

## What we use it for

The data you submit is used to:
- Display your own trades and journal entries back to you
- Calculate your performance analytics (expectancy, win rate, etc.)
- Sync data across your devices when you sign in on a new one
- Send you password reset emails or sign-in magic links you request
- Notify you when Pro features launch (only if you join the waitlist)

We do not use your data to:
- Train AI models (yours or anyone else's)
- Sell to third parties
- Build aggregated analytics products
- Personalize ads (we don't run ads)

---

## Live market prices

Live crypto and forex prices shown in the app come from public APIs:
- **CoinGecko** for crypto
- **Frankfurter (ECB)** for forex
- **Binance** as crypto fallback

Your trade data is never sent to these services. We just fetch their public price feeds.

---

## Data retention

**Anonymous users:** Data persists in your browser until you clear it. No retention policy on our side because we don't have your data.

**Account users:**
- Active account: data kept indefinitely
- After account deletion (Settings → Delete Account): all data deleted within 30 days, including database rows and storage files
- Backup retention: 7 days (Supabase free tier)

---

## Your rights

You can, at any time:
- **Export your data:** Settings → Export to CSV
- **Delete your data:** Settings → Reset Everything (anonymous mode) or Settings → Delete Account (signed in)
- **Sign out without losing data:** Sign out keeps your cloud data intact in your account; you can sign back in anytime
- **Use the app without an account:** You're never required to create one

If you're in the EU/UK (GDPR), Nigeria (NDPR), or California (CCPA), you have additional rights including data portability, rectification, and the right to lodge a complaint with your data protection authority. Contact us at [your email] to exercise any of these rights.

---

## Children

Traders Space is not intended for users under 18. We do not knowingly collect data from minors. If you believe we have data from a minor, contact us and we'll delete it.

---

## Cookies & local storage

- We use **localStorage** (not cookies) to store your trades and preferences when you use the app anonymously.
- We use **Supabase's authentication cookies** (signed JWTs) when you sign in to keep you signed in across page refreshes.
- We do not use third-party tracking cookies, advertising cookies, or analytics cookies.

---

## Changes to this policy

If we change this policy materially, we'll notify users via in-app banner and (if you have an account) email. You can always see the latest version at /privacy.

---

## Contact

Questions, concerns, or rights requests: **[your email here]**

---

## Disclaimer

This is a personal trading journal tool. We are not a broker, not a financial advisor, and not a regulated financial entity. We display your own trade data back to you — that's it. Nothing in this app constitutes financial advice. Past performance shown in the journal does not predict future results. Trade at your own risk.
