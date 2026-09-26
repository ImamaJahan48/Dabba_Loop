# Architecture

```text
Browser / PWA
   |
   | HTTPS + Supabase session cookie
   v
Next.js 16.3 App Router
   |-- Server Components / Server Actions
   |-- Public marketing routes
   |-- Customer portal
   |-- Admin portal
   |-- Partner portal
   |
   v
Supabase
   |-- Auth
   |-- Postgres + RLS
   |-- RPC transactional business functions
   |-- Storage (meal images / private payment proofs)
   `-- Edge Functions later for gateway/notifications
```

## Why one Next.js project

The customer, admin and partner surfaces share the same business model and design primitives. Separate projects add deployment and synchronization cost before the company has proven the workflow.

## Demo mode

When `NEXT_PUBLIC_DEMO_MODE=true` or Supabase variables are absent, data loaders return `src/lib/demo-data.ts`. This is intentionally useful for design review and sales demos. Production must set demo mode false.
