"use server";

import { createClient } from "@/lib/supabase-server";
import { hasSupabaseEnv, isDemoMode } from "@/lib/env";

export async function submitInquiry(
  formData: FormData
): Promise<void> {
  if (isDemoMode() || !hasSupabaseEnv()) return;

  const db = await createClient();

  const { error } = await db.from("inquiries").insert({
    name: String(formData.get("name") || ""),
    organization: String(formData.get("organization") || ""),
    email: String(formData.get("email") || ""),
    phone: String(formData.get("phone") || ""),
    area: String(formData.get("area") || ""),
    estimated_people:
      Number(formData.get("estimatedPeople") || 0) || null,
    message: String(formData.get("message") || ""),
  });

  if (error) return;
}