"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";
import { hasSupabaseEnv, isDemoMode } from "@/lib/env";

async function dbOrDemo() {
  if (isDemoMode() || !hasSupabaseEnv()) {
    return null;
  }

  return createClient();
}

/* =========================================================
   MEALS
   ========================================================= */

export async function createMeal(formData: FormData): Promise<void> {
  const db = await dbOrDemo();
  if (!db) return;

  const { error } = await db.from("meals").insert({
    name: String(formData.get("name") || "").trim(),
    description: String(formData.get("description") || ""),
    category: String(formData.get("category") || "Daily"),
    active: true,
  });

  if (error) return;

  revalidatePath("/admin/menu");
  revalidatePath("/menu");
}

export async function updateMeal(formData: FormData): Promise<void> {
  const db = await dbOrDemo();
  if (!db) return;

  const mealId = String(formData.get("mealId") || "");

  if (!mealId) return;

  const updates: Record<string, unknown> = {};

  if (formData.has("name")) {
    updates.name = String(formData.get("name") || "").trim();
  }

  if (formData.has("description")) {
    updates.description = String(formData.get("description") || "");
  }

  if (formData.has("category")) {
    updates.category = String(formData.get("category") || "Daily");
  }

  if (formData.has("ingredients")) {
    updates.ingredients = String(formData.get("ingredients") || "");
  }

  if (formData.has("calories")) {
    const value = Number(formData.get("calories"));
    updates.calories = Number.isFinite(value) ? value : null;
  }

  if (formData.has("proteinGrams")) {
    const value = Number(formData.get("proteinGrams"));
    updates.protein_grams = Number.isFinite(value) ? value : null;
  }

  if (formData.has("active")) {
    updates.active = String(formData.get("active")) === "true";
  }

  if (Object.keys(updates).length === 0) return;

  const { error } = await db
    .from("meals")
    .update(updates)
    .eq("id", mealId);

  if (error) return;

  revalidatePath("/admin/menu");
  revalidatePath("/menu");
}

export async function toggleMealActive(
  formData: FormData
): Promise<void> {
  const db = await dbOrDemo();
  if (!db) return;

  const mealId = String(formData.get("mealId") || "");

  if (!mealId) return;

  const requested = formData.get("active");

  let active: boolean;

  if (requested !== null) {
    active =
      String(requested) === "true" ||
      String(requested) === "1" ||
      String(requested) === "on";
  } else {
    const { data, error } = await db
      .from("meals")
      .select("active")
      .eq("id", mealId)
      .single();

    if (error || !data) return;

    active = !Boolean(data.active);
  }

  const { error } = await db
    .from("meals")
    .update({ active })
    .eq("id", mealId);

  if (error) return;

  revalidatePath("/admin/menu");
  revalidatePath("/menu");
}

/* =========================================================
   HUBS
   ========================================================= */

export async function createHub(formData: FormData): Promise<void> {
  const db = await dbOrDemo();
  if (!db) return;

  const { error } = await db.from("hubs").insert({
    name: String(formData.get("name") || "").trim(),
    slug:
      String(formData.get("slug") || "").trim() ||
      String(formData.get("name") || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, ""),
    type: String(formData.get("type") || "hostel"),
    area: String(formData.get("area") || ""),
    address: String(formData.get("address") || ""),
    contact_name: String(formData.get("contactName") || "") || null,
    contact_phone: String(formData.get("contactPhone") || "") || null,
    capacity: Number(formData.get("capacity") || 30),
    active: true,
  });

  if (error) return;

  revalidatePath("/admin/hubs");
  revalidatePath("/app");
}

 /* =========================================================
    MENU CALENDAR
    ========================================================= */

export async function createMenuSlot(
  formData: FormData
): Promise<void> {
  const db = await dbOrDemo();
  if (!db) return;

  const date = String(formData.get("date") || "");
  const period = String(formData.get("period") || "lunch");
  const mealId = String(formData.get("mealId") || "");
  const price = Number(formData.get("price") || 0);
  const creditCost = Number(formData.get("creditCost") || 1);
  const capacity = Number(formData.get("capacity") || 50);
  const cutoff = String(formData.get("cutoff") || "09:30");

  if (!date || !mealId) return;

  const cutoffAt = new Date(
    `${date}T${cutoff}:00+05:00`
  ).toISOString();

  const { error } = await db.from("menu_slots").insert({
    service_date: date,
    period,
    meal_id: mealId,
    price,
    credit_cost: creditCost,
    capacity,
    cutoff_at: cutoffAt,
    active: true,
  });

  if (error) return;

  revalidatePath("/admin/calendar");
  revalidatePath("/menu");
  revalidatePath("/app");
}

export async function updateMenuSlot(
  formData: FormData
): Promise<void> {
  const db = await dbOrDemo();
  if (!db) return;

  const slotId = String(formData.get("slotId") || "");

  if (!slotId) return;

  const updates: Record<string, unknown> = {};

  if (formData.has("date")) {
    updates.service_date = String(formData.get("date") || "");
  }

  if (formData.has("period")) {
    updates.period = String(formData.get("period") || "lunch");
  }

  if (formData.has("mealId")) {
    updates.meal_id = String(formData.get("mealId") || "");
  }

  if (formData.has("price")) {
    updates.price = Number(formData.get("price") || 0);
  }

  if (formData.has("creditCost")) {
    updates.credit_cost = Number(formData.get("creditCost") || 1);
  }

  if (formData.has("capacity")) {
    updates.capacity = Number(formData.get("capacity") || 50);
  }

  if (formData.has("cutoff")) {
    const date = String(formData.get("date") || "");

    if (date) {
      updates.cutoff_at = new Date(
        `${date}T${String(formData.get("cutoff"))}:00+05:00`
      ).toISOString();
    }
  }

  if (formData.has("active")) {
    updates.active =
      String(formData.get("active")) === "true" ||
      String(formData.get("active")) === "1" ||
      String(formData.get("active")) === "on";
  }

  if (Object.keys(updates).length === 0) return;

  const { error } = await db
    .from("menu_slots")
    .update(updates)
    .eq("id", slotId);

  if (error) return;

  revalidatePath("/admin/calendar");
  revalidatePath("/menu");
  revalidatePath("/app");
}

/* =========================================================
   CUSTOMERS / WALLET
   ========================================================= */

export async function adjustWallet(
  formData: FormData
): Promise<void> {
  const db = await dbOrDemo();
  if (!db) return;

  const userId = String(
    formData.get("userId") ||
      formData.get("customerId") ||
      formData.get("id") ||
      ""
  );

  const amount = Number(formData.get("amount") || 0);

  if (!userId || !Number.isFinite(amount) || amount === 0) {
    return;
  }

  const { data: wallet, error: walletError } = await db
    .from("wallets")
    .select("balance")
    .eq("user_id", userId)
    .maybeSingle();

  if (walletError) return;

  const currentBalance = Number(wallet?.balance || 0);
  const newBalance = currentBalance + amount;

  if (newBalance < 0) return;

  const { error: upsertError } = await db
    .from("wallets")
    .upsert({
      user_id: userId,
      balance: newBalance,
      updated_at: new Date().toISOString(),
    });

  if (upsertError) return;

  const { error: transactionError } = await db
    .from("wallet_transactions")
    .insert({
      user_id: userId,
      type: "admin_adjustment",
      amount,
      reason:
        String(formData.get("reason") || "Admin wallet adjustment"),
    });

  if (transactionError) return;

  revalidatePath("/admin/customers");
  revalidatePath("/admin/wallets");
}

export async function setCustomerBlocked(
  formData: FormData
): Promise<void> {
  const db = await dbOrDemo();
  if (!db) return;

  const userId = String(
    formData.get("userId") ||
      formData.get("customerId") ||
      formData.get("id") ||
      ""
  );

  if (!userId) return;

  const raw = formData.get("blocked");

  const blocked =
    raw === null
      ? true
      : String(raw) === "true" ||
        String(raw) === "1" ||
        String(raw) === "on";

  const { error } = await db
    .from("profiles")
    .update({ blocked })
    .eq("id", userId);

  if (error) return;

  revalidatePath("/admin/customers");
}

/* =========================================================
   CREDIT PACKS
   ========================================================= */

export async function createCreditPack(
  formData: FormData
): Promise<void> {
  const db = await dbOrDemo();
  if (!db) return;

  const { error } = await db.from("credit_packs").insert({
    name: String(formData.get("name") || "").trim(),
    credits: Number(formData.get("credits") || 0),
    price: Number(formData.get("price") || 0),
    validity_days:
      Number(formData.get("validityDays") || 0) || null,
    description: String(formData.get("description") || ""),
    bonus_credits: Number(formData.get("bonusCredits") || 0),
    featured:
      String(formData.get("featured") || "") === "true" ||
      String(formData.get("featured") || "") === "1" ||
      String(formData.get("featured") || "") === "on",
    active: true,
  });

  if (error) return;

  revalidatePath("/admin/plans");
  revalidatePath("/plans");
  revalidatePath("/app/payments");
}

export async function updateCreditPack(
  formData: FormData
): Promise<void> {
  const db = await dbOrDemo();
  if (!db) return;

  const packId = String(
    formData.get("packId") ||
      formData.get("id") ||
      ""
  );

  if (!packId) return;

  const updates: Record<string, unknown> = {};

  if (formData.has("name")) {
    updates.name = String(formData.get("name") || "").trim();
  }

  if (formData.has("credits")) {
    updates.credits = Number(formData.get("credits") || 0);
  }

  if (formData.has("price")) {
    updates.price = Number(formData.get("price") || 0);
  }

  if (formData.has("validityDays")) {
    updates.validity_days =
      Number(formData.get("validityDays") || 0) || null;
  }

  if (formData.has("description")) {
    updates.description = String(formData.get("description") || "");
  }

  if (formData.has("bonusCredits")) {
    updates.bonus_credits = Number(
      formData.get("bonusCredits") || 0
    );
  }

  if (formData.has("featured")) {
    updates.featured =
      String(formData.get("featured")) === "true" ||
      String(formData.get("featured")) === "1" ||
      String(formData.get("featured")) === "on";
  }

  if (formData.has("active")) {
    updates.active =
      String(formData.get("active")) === "true" ||
      String(formData.get("active")) === "1" ||
      String(formData.get("active")) === "on";
  }

  if (Object.keys(updates).length === 0) return;

  const { error } = await db
    .from("credit_packs")
    .update(updates)
    .eq("id", packId);

  if (error) return;

  revalidatePath("/admin/plans");
  revalidatePath("/plans");
  revalidatePath("/app/payments");
}

/* =========================================================
   ORDERS
   ========================================================= */

export async function updateOrderStatus(
  formData: FormData
): Promise<void> {
  const db = await dbOrDemo();
  if (!db) return;

  const orderId = String(formData.get("orderId") || "");
  const status = String(formData.get("status") || "");

  if (!orderId || !status) return;

  const updates: Record<string, unknown> = {
    status,
  };

  if (status === "delivered") {
    updates.delivered_at = new Date().toISOString();
  }

  if (status === "cancelled") {
    updates.cancelled_at = new Date().toISOString();
  }

  const { error } = await db
    .from("orders")
    .update(updates)
    .eq("id", orderId);

  if (error) return;

  revalidatePath("/admin/orders");
  revalidatePath("/app/orders");
}

/* =========================================================
   PAYMENTS
   ========================================================= */

export async function approvePayment(
  formData: FormData
): Promise<void> {
  const db = await dbOrDemo();
  if (!db) return;

  const { error } = await db.rpc("approve_manual_payment", {
    p_payment_id: String(formData.get("paymentId") || ""),
  });

  if (error) return;

  revalidatePath("/admin/payments");
  revalidatePath("/app/payments");
}

/* =========================================================
   COUPONS
   ========================================================= */

export async function createCoupon(
  formData: FormData
): Promise<void> {
  const db = await dbOrDemo();
  if (!db) return;

  const { error } = await db.from("coupons").insert({
    code: String(formData.get("code") || "")
      .trim()
      .toUpperCase(),
    kind: String(formData.get("kind") || "bonus_credit"),
    value: Number(formData.get("value") || 0),
    max_uses:
      Number(formData.get("maxUses") || 0) || null,
    active: true,
  });

  if (error) return;

  revalidatePath("/admin/promos");
}

/* =========================================================
   SETTINGS
   ========================================================= */

export async function updateBusinessSettings(
  formData: FormData
): Promise<void> {
  const db = await dbOrDemo();
  if (!db) return;

  const lunch = String(
    formData.get("lunchCutoff") || "09:30"
  );

  const dinner = String(
    formData.get("dinnerCutoff") || "15:30"
  );

  const { error } = await db.from("app_settings").upsert({
    key: "cutoffs",
    value: {
      lunch,
      dinner,
    },
    public_read: true,
  });

  if (error) return;

  revalidatePath("/admin/settings");
}