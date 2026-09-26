$ErrorActionPreference = "Stop"
Write-Host "Installing dependencies..."
npm install
if (-not (Test-Path ".env.local")) { Copy-Item ".env.example" ".env.local" }
Write-Host "\nReady in demo mode. Run: npm run dev"
Write-Host "For Supabase: edit .env.local, then npx supabase login; npx supabase link --project-ref YOUR_REF; npm run db:push"
