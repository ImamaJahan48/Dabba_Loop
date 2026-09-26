# Flexible Meal Service Platform

A complete Next.js + Supabase starter for the flexible Lahore lunch/dinner business described in the supplied website system specification.

The **working brand is intentionally replaceable**. `DabbaLoop` is only the default placeholder because the final business name has not been locked. Change two environment values and the application branding updates globally.

## What is included

- Premium responsive marketing site
- Customer portal: Today, weekly planner, wallet, orders, hubs, payments, referrals, profile and support
- Admin portal: dashboard, orders, meals, menu calendar, kitchen, customers, payments, wallets, hubs, delivery, feedback, reports, staff and settings
- Hostel / office partner portal
- Supabase Postgres schema, RLS, Storage policies and demo seed
- Immutable wallet ledger
- Atomic order creation and skip/refund database functions
- Idempotent manual payment approval
- Demo mode so the UI runs before Supabase is connected
- Setup scripts and detailed Markdown documentation

## Fastest preview

```powershell
cd flexible-meal-platform
npm install
Copy-Item .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

`NEXT_PUBLIC_DEMO_MODE=true` is the default. Login accepts any values and the dashboards use realistic local demo data.

## Connect the real database

Create a Supabase project, then:

```powershell
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npm run db:push
```

Then fill `.env.local`:

```env
NEXT_PUBLIC_DEMO_MODE=false
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVER_ONLY_SERVICE_ROLE_KEY
ADMIN_EMAIL=your@email.com
```

Restart `npm run dev`, sign up with `ADMIN_EMAIL`, then:

```powershell
npm run admin:promote
```

**Do not expose `SUPABASE_SERVICE_ROLE_KEY` to the browser.** It is used only by the one-off admin promotion script / trusted server work.

### No Supabase CLI?

Open Supabase SQL Editor and run [`supabase/combined_setup.sql`](supabase/combined_setup.sql) once. The two migration files are the canonical source; the combined file merely saves clicking.

## Brand change

Change:

```env
NEXT_PUBLIC_BRAND_NAME=YourFinalName
NEXT_PUBLIC_BRAND_TAGLINE=Your final tagline
```

See [`docs/BRANDING.md`](docs/BRANDING.md).

## Important routes

### Public
`/`, `/menu`, `/plans`, `/how-it-works`, `/hubs`, `/for-hostels`, `/for-companies`, `/faq`, `/contact`, `/login`, `/signup`

### Customer
`/app`, `/app/today`, `/app/planner`, `/app/wallet`, `/app/orders`, `/app/hubs`, `/app/payments`, `/app/referrals`, `/app/profile`, `/app/support`

### Admin
`/admin`, `/admin/orders`, `/admin/menu`, `/admin/calendar`, `/admin/kitchen`, `/admin/customers`, `/admin/payments`, `/admin/wallets`, `/admin/hubs`, `/admin/delivery`, `/admin/feedback`, `/admin/reports`, `/admin/staff`, `/admin/settings`

### Partner
`/partner`, `/partner/hub`, `/partner/orders`, `/partner/invoices`, `/partner/support`

## Production warning

This repository is a strong MVP foundation, not a claim that food safety, tax, payment-provider onboarding, WhatsApp API approval or operational QA disappear because TypeScript exists. Validate policies and provider requirements before public launch.

Read [`docs/SETUP.md`](docs/SETUP.md) next.
