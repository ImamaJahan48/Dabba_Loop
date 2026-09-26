"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";
import { hasSupabaseEnv, isDemoMode } from "@/lib/env";

export async function createOrder(formData: FormData): Promise<void> {
  if (isDemoMode() || !hasSupabaseEnv()) return;

  const slotId = String(formData.get("slotId"));
  const hubId = String(formData.get("hubId"));

  const supabase = await createClient();

  const { error } = await supabase.rpc("create_meal_order", {
    p_menu_slot_id: slotId,
    p_hub_id: hubId,
    p_notes: null,
  });

  if (error) return;

  revalidatePath("/app");
  revalidatePath("/app/orders");
  revalidatePath("/app/wallet");
}

export async function skipOrder(formData: FormData): Promise<void> {
  if (isDemoMode() || !hasSupabaseEnv()) return;

  const orderId = String(formData.get("orderId"));

  const supabase = await createClient();

  const { error } = await supabase.rpc("skip_meal_order", {
    p_order_id: orderId,
  });

  if (error) return;

  revalidatePath("/app");
  revalidatePath("/app/orders");
  revalidatePath("/app/wallet");
}

export async function submitManualPayment(
  formData: FormData
): Promise<void> {
  if (isDemoMode() || !hasSupabaseEnv()) return;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const amount = Number(formData.get("amount"));
  const method = String(formData.get("method"));
  const reference = String(formData.get("reference"));
  const packId = String(formData.get("packId") || "") || null;

  const file = formData.get("proof") as File | null;

  let proofPath: string | null = null;

  if (file && file.size > 0) {
    proofPath = `${user.id}/${crypto.randomUUID()}-${file.name.replace(
      /[^a-zA-Z0-9._-]/g,
      "_"
    )}`;

    const { error } = await supabase.storage
      .from("payment-proofs")
      .upload(proofPath, file, {
        upsert: false,
      });

    if (error) return;
  }

  const { error } = await supabase.from("payments").insert({
    user_id: user.id,
    amount,
    method,
    reference,
    proof_path: proofPath,
    credit_pack_id: packId,
    status: "pending",
  });

  if (error) return;

  revalidatePath("/app/payments");
}

export async function changeOrder(formData: FormData): Promise<void> {
  if (isDemoMode() || !hasSupabaseEnv()) return;

  const supabase = await createClient();

  const { error } = await supabase.rpc("change_meal_order", {
    p_order_id: String(formData.get("orderId")),
    p_new_menu_slot_id: String(formData.get("slotId")),
    p_new_hub_id: String(formData.get("hubId")),
  });

  if (error) return;

  revalidatePath("/app");
  revalidatePath("/app/orders");
  revalidatePath("/app/wallet");
  revalidatePath("/app/planner");
}

export async function updateProfile(formData: FormData): Promise<void> {
  if (isDemoMode() || !hasSupabaseEnv()) return;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: String(formData.get("fullName") || ""),
      phone: String(formData.get("phone") || ""),
      spice_preference: String(formData.get("spice") || "normal"),
    })
    .eq("id", user.id);

  if (error) return;

  revalidatePath("/app/profile");
}

export async function createSupportTicket(
  formData: FormData
): Promise<void> {
  if (isDemoMode() || !hasSupabaseEnv()) return;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { error } = await supabase.from("support_tickets").insert({
    user_id: user.id,
    category: String(formData.get("category") || "other"),
    details: String(formData.get("details") || ""),
    priority: "normal",
  });

  if (error) return;

  revalidatePath("/app/support");
}

export async function submitFeedback(formData: FormData): Promise<void> {
  if (isDemoMode() || !hasSupabaseEnv()) return;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const orderId = String(formData.get("orderId") || "");
  const rating = Number(formData.get("rating") || 5);

  const { error } = await supabase.from("feedback").insert({
    order_id: orderId,
    user_id: user.id,
    rating,
    taste: Number(formData.get("taste") || rating),
    portion: Number(formData.get("portion") || rating),
    packaging: Number(formData.get("packaging") || rating),
    delivery: Number(formData.get("delivery") || rating),
    comment: String(formData.get("comment") || ""),
  });

  if (error) return;

  revalidatePath("/app/feedback");
}

export async function planWeek(formData: FormData): Promise<void> {
  if (isDemoMode() || !hasSupabaseEnv()) return;

  const supabase = await createClient();

  const hubId = String(formData.get("hubId") || "");

  if (!hubId) return;

  const selected = [...formData.entries()]
    .filter(
      ([key, value]) =>
        key.startsWith("slot_") &&
        typeof value === "string" &&
        value.length > 0
    )
    .map(([, value]) => String(value));

  for (const slotId of selected) {
    await supabase.rpc("create_meal_order", {
      p_menu_slot_id: slotId,
      p_hub_id: hubId,
      p_notes: "Created from weekly planner",
    });
  }

  revalidatePath("/app");
  revalidatePath("/app/planner");
  revalidatePath("/app/orders");
  revalidatePath("/app/wallet");
}