# Setup Guide

## A. Preview the whole website without a backend

Windows PowerShell:

```powershell
cd flexible-meal-platform
npm install
Copy-Item .env.example .env.local
npm run dev
```

The default `.env.example` has `NEXT_PUBLIC_DEMO_MODE=true`. All public, customer, admin and partner pages render using local demo data. Login/signup route directly to the customer portal.

## B. Connect Supabase

1. Create a Supabase project.
2. Copy Project URL and Publishable Key into `.env.local`.
3. Install/link the CLI through npx:

```powershell
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npm run db:push
```

Alternative: paste `supabase/combined_setup.sql` into the Supabase SQL Editor and run it once.

Set:

```env
NEXT_PUBLIC_DEMO_MODE=false
```

Restart the dev server.

## C. Create the first admin

1. Sign up through `/signup` using the email you want to be admin.
2. Add the server-only service-role key and the email to `.env.local`:

```env
SUPABASE_SERVICE_ROLE_KEY=...
ADMIN_EMAIL=you@example.com
```

3. Run:

```powershell
npm run admin:promote
```

## D. Deploy to Vercel

Push the repo to GitHub, import it in Vercel, and copy the production environment variables. Set the Supabase Auth Site URL to your production domain and add `/auth/callback` to allowed redirects.

## E. Manual payment settings

Fill the support and payment display values in `.env.local`. The actual banking/JazzCash/Easypaisa account data should not be hardcoded into source.

## F. Before accepting money

- turn demo mode off
- create two test customer accounts and verify RLS isolation
- test an order with insufficient credits
- test slot capacity and hub capacity
- test skip before and after cutoff
- approve the same payment twice and verify only one credit transaction exists
- verify payment proofs are private
- verify kitchen/delivery accounts cannot access finance data
