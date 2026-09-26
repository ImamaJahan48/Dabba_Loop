import { copyFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
const root=resolve(process.cwd());
const env=resolve(root,".env.local");
if(!existsSync(env)){ copyFileSync(resolve(root,".env.example"),env); console.log("Created .env.local from .env.example"); }
else console.log(".env.local already exists; leaving it unchanged.");
console.log(`\n1) npm run dev                  # instant demo mode\n2) Add Supabase URL + publishable key to .env.local\n3) npx supabase login\n4) npx supabase link --project-ref YOUR_PROJECT_REF\n5) npm run db:push\n6) Set NEXT_PUBLIC_DEMO_MODE=false and restart\n`);
