# Quick Commands

## Preview only

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

## Connect existing Supabase project

```powershell
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npm run db:push
```

Put the Project URL + Publishable Key in `.env.local`, set `NEXT_PUBLIC_DEMO_MODE=false`, restart.

## First admin

Sign up through the site, put your email in `ADMIN_EMAIL` and service-role key in `SUPABASE_SERVICE_ROLE_KEY`, then:

```powershell
npm run admin:promote
```

## Production build

```powershell
npm run lint
npm run build
npm start
```

## No CLI route

Run `supabase/combined_setup.sql` once in Supabase SQL Editor.
