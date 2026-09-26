# Deployment

## Vercel

1. Push repository to GitHub.
2. Import project into Vercel.
3. Add all public Supabase variables and server-only service key where required.
4. `NEXT_PUBLIC_DEMO_MODE=false` for production.
5. Set production brand/support values.
6. Deploy.

## Supabase Auth URLs

Set Site URL to the final HTTPS domain. Add:

`https://YOUR_DOMAIN/auth/callback`

as an allowed redirect URL.

## Database changes

Do not hand-edit production schema. Create a new SQL file under `supabase/migrations/` and run:

```bash
npm run db:push
```

## Environments

For a real team, maintain separate Supabase projects for development/staging and production. Do not test destructive migrations on the production lunch queue at 11:55 AM.
