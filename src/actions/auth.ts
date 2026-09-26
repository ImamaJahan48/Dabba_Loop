"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { hasSupabaseEnv, isDemoMode } from "@/lib/env";

export async function signIn(formData: FormData) {
  if (isDemoMode() || !hasSupabaseEnv()) redirect("/app");
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`);
  redirect("/app");
}

export async function signUp(formData: FormData) {
  if (isDemoMode() || !hasSupabaseEnv()) redirect("/app");
  const fullName = String(formData.get("fullName") || "");
  const phone = String(formData.get("phone") || "");
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({ email, password, options:{ data:{ full_name:fullName, phone } } });
  if (error) redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  redirect("/app?welcome=1");
}

export async function signOut() {
  if (!isDemoMode() && hasSupabaseEnv()) { const supabase=await createClient(); await supabase.auth.signOut(); }
  redirect("/login");
}
