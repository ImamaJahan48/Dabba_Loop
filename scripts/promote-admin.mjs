import { createClient } from "@supabase/supabase-js";
const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
const email=process.env.ADMIN_EMAIL;
if(!url||!key||!email){console.error("Set NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and ADMIN_EMAIL first.");process.exit(1)}
const db=createClient(url,key,{auth:{persistSession:false}});
const {data:{users},error}=await db.auth.admin.listUsers({perPage:1000});
if(error) throw error;
const user=users.find(u=>u.email?.toLowerCase()===email.toLowerCase());
if(!user){console.error(`No Supabase Auth user found for ${email}. Sign up through the website first.`);process.exit(1)}
const {error:updateError}=await db.from("profiles").update({role:"admin"}).eq("id",user.id);
if(updateError) throw updateError;
console.log(`Promoted ${email} to admin.`);
