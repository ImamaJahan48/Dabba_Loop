"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";
import { hasSupabaseEnv, isDemoMode } from "@/lib/env";

async function dbOrDemo() {
  if (isDemoMode() || !hasSupabaseEnv()) return null;
  return createClient();
}

const text = (formData: FormData, key: string, fallback = "") => String(formData.get(key) || fallback).trim();
const number = (formData: FormData, key: string, fallback = 0) => Number(formData.get(key) || fallback);
const checked = (formData: FormData, key: string) => formData.get(key) === "on" || formData.get(key) === "true";
const list = (value: string) => value.split(",").map((item) => item.trim()).filter(Boolean);

async function uploadMealImage(db: Awaited<ReturnType<typeof createClient>>, file: FormDataEntryValue | null) {
  if (!(file instanceof File) || file.size === 0) return null;
  if (!file.type.startsWith("image/")) throw new Error("Meal image must be an image file.");
  if (file.size > 5 * 1024 * 1024) throw new Error("Meal image must be 5 MB or smaller.");

  const safeExt = (file.name.split(".").pop() || "jpg").replace(/[^a-z0-9]/gi, "").toLowerCase() || "jpg";
  const path = `meals/${randomUUID()}.${safeExt}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  const { error } = await db.storage.from("meal-images").upload(path, bytes, {
    contentType: file.type,
    upsert: false,
    cacheControl: "3600"
  });
  if (error) throw error;
  return path;
}

export async function createMeal(formData: FormData) {
  const db = await dbOrDemo();
  if (!db) return { ok: true, demo: true };

  try {
    const uploadedPath = await uploadMealImage(db, formData.get("image"));
    const remoteImage = text(formData, "imageUrl");
    const { error } = await db.from("meals").insert({
      name: text(formData, "name"),
      description: text(formData, "description"),
      category: text(formData, "category", "Daily"),
      ingredients: text(formData, "ingredients") || null,
      allergens: list(text(formData, "allergens")),
      calories: number(formData, "calories") || null,
      protein_grams: number(formData, "protein") || null,
      image_path: uploadedPath || remoteImage || null,
      accent: "green",
      active: true
    });
    if (error) return { ok: false, error: error.message };
    revalidatePath("/admin/menu");
    revalidatePath("/menu");
    revalidatePath("/");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Unable to create meal." };
  }
}

export async function updateMeal(formData: FormData) {
  const db = await dbOrDemo();
  if (!db) return { ok: true, demo: true };

  try {
    const mealId = text(formData, "mealId");
    const existingImage = text(formData, "existingImage");
    const uploadedPath = await uploadMealImage(db, formData.get("image"));
    const remoteImage = text(formData, "imageUrl");

    const { error } = await db.from("meals").update({
      name: text(formData, "name"),
      description: text(formData, "description"),
      category: text(formData, "category", "Daily"),
      ingredients: text(formData, "ingredients") || null,
      allergens: list(text(formData, "allergens")),
      calories: number(formData, "calories") || null,
      protein_grams: number(formData, "protein") || null,
      image_path: uploadedPath || remoteImage || existingImage || null,
      active: checked(formData, "active"),
      updated_at: new Date().toISOString()
    }).eq("id", mealId);

    if (error) return { ok: false, error: error.message };
    revalidatePath("/admin/menu");
    revalidatePath("/menu");
    revalidatePath("/");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Unable to update meal." };
  }
}

export async function toggleMealActive(formData: FormData) {
  const db = await dbOrDemo();
  if (!db) return { ok: true, demo: true };
  const { error } = await db.from("meals").update({ active: text(formData, "nextActive") === "true" }).eq("id", text(formData, "mealId"));
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/menu");
  revalidatePath("/menu");
  revalidatePath("/");
  return { ok: true };
}

export async function createHub(formData: FormData) {
  const db = await dbOrDemo();
  if (!db) return { ok: true, demo: true };
  const slug = text(formData, "name").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const { error } = await db.from("hubs").insert({
    name: text(formData, "name"),
    slug: `${slug}-${Date.now().toString().slice(-5)}`,
    type: text(formData, "type", "hostel"),
    area: text(formData, "area"),
    address: text(formData, "address"),
    capacity: number(formData, "capacity", 30),
    active: true
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/hubs");
  revalidatePath("/hubs");
  return { ok: true };
}

export async function approvePayment(formData: FormData) {
  const db = await dbOrDemo();
  if (!db) return { ok: true, demo: true };
  const { error } = await db.rpc("approve_manual_payment", { p_payment_id: text(formData, "paymentId") });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/payments");
  revalidatePath("/admin");
  return { ok: true };
}

export async function createCoupon(formData: FormData) {
  const db = await dbOrDemo();
  if (!db) return { ok: true, demo: true };
  const { error } = await db.from("coupons").insert({
    code: text(formData, "code").toUpperCase(),
    kind: text(formData, "kind", "bonus_credit"),
    value: number(formData, "value"),
    max_uses: number(formData, "maxUses", 100),
    active: true
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/promos");
  return { ok: true };
}

export async function updateBusinessSettings(formData: FormData) {
  const db = await dbOrDemo();
  if (!db) return { ok: true, demo: true };

  const lunch = text(formData, "lunchCutoff", "09:30");
  const dinner = text(formData, "dinnerCutoff", "15:30");
  const lunchWindow = text(formData, "lunchWindow", "12:00-14:00");
  const dinnerWindow = text(formData, "dinnerWindow", "18:30-20:30");
  const beforeCutoff = text(formData, "beforeCutoff", "full_credit_return");
  const afterCutoff = text(formData, "afterCutoff", "admin_exception_only");

  const { error } = await db.from("app_settings").upsert([
    { key: "cutoffs", value: { lunch, dinner }, public_read: true },
    { key: "delivery_windows", value: { lunch: lunchWindow, dinner: dinnerWindow }, public_read: true },
    { key: "cancellation_policy", value: { before_cutoff: beforeCutoff, after_cutoff: afterCutoff }, public_read: true }
  ], { onConflict: "key" });

  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/settings");
  return { ok: true };
}

export async function createMenuSlot(formData: FormData) {
  const db = await dbOrDemo();
  if (!db) return { ok: true, demo: true };
  const date = text(formData, "date");
  const period = text(formData, "period");
  const cutoff = text(formData, "cutoff", period === "dinner" ? "15:30" : "09:30");
  const cutoffAt = new Date(`${date}T${cutoff}:00+05:00`).toISOString();
  const { error } = await db.from("menu_slots").insert({
    service_date: date,
    period,
    meal_id: text(formData, "mealId"),
    price: number(formData, "price"),
    credit_cost: number(formData, "creditCost", 1),
    capacity: number(formData, "capacity", 50),
    cutoff_at: cutoffAt,
    active: true
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/calendar");
  revalidatePath("/menu");
  revalidatePath("/");
  return { ok: true };
}

export async function updateMenuSlot(formData: FormData) {
  const db = await dbOrDemo();
  if (!db) return { ok: true, demo: true };
  const date = text(formData, "date");
  const period = text(formData, "period");
  const cutoff = text(formData, "cutoff", period === "dinner" ? "15:30" : "09:30");
  const cutoffAt = new Date(`${date}T${cutoff}:00+05:00`).toISOString();
  const { error } = await db.from("menu_slots").update({
    service_date: date,
    period,
    meal_id: text(formData, "mealId"),
    price: number(formData, "price"),
    credit_cost: number(formData, "creditCost", 1),
    capacity: number(formData, "capacity", 50),
    cutoff_at: cutoffAt,
    active: checked(formData, "active"),
    updated_at: new Date().toISOString()
  }).eq("id", text(formData, "slotId"));
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/calendar");
  revalidatePath("/menu");
  revalidatePath("/");
  return { ok: true };
}

export async function createCreditPack(formData: FormData) {
  const db = await dbOrDemo();
  if (!db) return { ok: true, demo: true };
  const { error } = await db.from("credit_packs").insert({
    name: text(formData, "name"),
    credits: number(formData, "credits"),
    price: number(formData, "price"),
    validity_days: number(formData, "validityDays") || null,
    description: text(formData, "description"),
    bonus_credits: number(formData, "bonusCredits"),
    featured: checked(formData, "featured"),
    active: true
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/plans");
  revalidatePath("/plans");
  revalidatePath("/");
  return { ok: true };
}

export async function updateCreditPack(formData: FormData) {
  const db = await dbOrDemo();
  if (!db) return { ok: true, demo: true };
  const { error } = await db.from("credit_packs").update({
    name: text(formData, "name"),
    credits: number(formData, "credits"),
    price: number(formData, "price"),
    validity_days: number(formData, "validityDays") || null,
    description: text(formData, "description"),
    bonus_credits: number(formData, "bonusCredits"),
    featured: checked(formData, "featured"),
    active: checked(formData, "active"),
    updated_at: new Date().toISOString()
  }).eq("id", text(formData, "packId"));
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/plans");
  revalidatePath("/plans");
  revalidatePath("/");
  return { ok: true };
}

export async function updateOrderStatus(formData: FormData) {
  const db = await dbOrDemo();
  if (!db) return { ok: true, demo: true };
  const status = text(formData, "status");
  const patch: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
  if (status === "delivered" || status === "collected") patch.delivered_at = new Date().toISOString();
  if (status === "cancelled") patch.cancelled_at = new Date().toISOString();
  const { error } = await db.from("orders").update(patch).eq("id", text(formData, "orderId"));
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  revalidatePath("/admin/kitchen");
  revalidatePath("/admin/delivery");
  return { ok: true };
}

export async function setCustomerBlocked(formData: FormData) {
  const db = await dbOrDemo();
  if (!db) return { ok: true, demo: true };
  const { error } = await db.from("profiles").update({ blocked: text(formData, "blocked") === "true", updated_at: new Date().toISOString() }).eq("id", text(formData, "userId"));
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/customers");
  return { ok: true };
}

export async function adjustWallet(formData: FormData) {
  const db = await dbOrDemo();
  if (!db) return { ok: true, demo: true };
  const { error } = await db.rpc("admin_adjust_wallet", {
    p_user_id: text(formData, "userId"),
    p_amount: number(formData, "amount"),
    p_reason: text(formData, "reason")
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/customers");
  revalidatePath("/admin/wallets");
  return { ok: true };
}
