#!/usr/bin/env bash
set -euo pipefail
npm install
[ -f .env.local ] || cp .env.example .env.local
echo "Ready in demo mode: npm run dev"
echo "Then connect Supabase: npx supabase login && npx supabase link --project-ref YOUR_REF && npm run db:push"
