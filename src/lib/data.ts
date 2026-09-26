import {
  demoAdmin,
  demoCustomers,
  demoHubs,
  demoMeals,
  demoMenu,
  demoOrders,
  demoPayments,
  demoPlans
} from "@/lib/demo-data";
import { hasSupabaseEnv, isDemoMode } from "@/lib/env";
import { createClient } from "@/lib/supabase-server";
import type { Hub, Meal, MenuSlot } from "@/types";

const fallbackFoodPhotos = {
  karahi: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=1200&q=86",
  daal: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=1200&q=86",
  qeema: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=1200&q=86",
  rice: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=1200&q=86"
};

function fallbackMealImage(name = "") {
  const value = name.toLowerCase();
  if (value.includes("karahi")) return fallbackFoodPhotos.karahi;
  if (value.includes("daal") || value.includes("dal") || value.includes("chana")) return fallbackFoodPhotos.daal;
  if (value.includes("qeema") || value.includes("keema")) return fallbackFoodPhotos.qeema;
  if (value.includes("pulao") || value.includes("pilao") || value.includes("biryani") || value.includes("rice")) return fallbackFoodPhotos.rice;
  return fallbackFoodPhotos.karahi;
}

function mealImageUrl(db: Awaited<ReturnType<typeof createClient>>, imagePath?: string | null, mealName = "") {
  if (!imagePath) return fallbackMealImage(mealName);
  if (/^https?:\/\//i.test(imagePath)) return imagePath;
  return db.storage.from("meal-images").getPublicUrl(imagePath).data.publicUrl;
}

function one<T = any>(value: T | T[] | null | undefined): T | undefined {
  return Array.isArray(value) ? value[0] : value || undefined;
}

export async function getMenu(): Promise<MenuSlot[]> {
  if (isDemoMode() || !hasSupabaseEnv()) return demoMenu;

  try {
    const db = await createClient();
    const today = new Date().toISOString().slice(0, 10);
    const { data: slots, error } = await db
      .from("public_menu_slots")
      .select("id,service_date,period,meal_id,price,credit_cost,remaining")
      .gte("service_date", today)
      .eq("active", true)
      .order("service_date")
      .limit(30);

    if (error || !slots) throw error;

    const mealIds = [...new Set(slots.map((s: any) => s.meal_id))];
    const { data: meals, error: mealError } = await db
      .from("meals")
      .select("id,name,description,category,ingredients,allergens,calories,protein_grams,accent,image_path,active")
      .in("id", mealIds);

    if (mealError) throw mealError;
    const byId = new Map((meals || []).map((m: any) => [m.id, m]));

    return slots.map((slot: any) => {
      const meal: any = byId.get(slot.meal_id) || {};
      return {
        id: slot.id,
        date: slot.service_date,
        period: slot.period,
        price: Number(slot.price),
        creditCost: Number(slot.credit_cost),
        remaining: Number(slot.remaining),
        cutoffLabel: slot.period === "lunch" ? "Order by 9:30 AM" : "Order by 3:30 PM",
        meal: {
          id: meal.id || slot.meal_id,
          name: meal.name || "Meal",
          description: meal.description || "",
          category: meal.category || "Daily",
          ingredients: meal.ingredients || undefined,
          allergens: meal.allergens || [],
          calories: meal.calories || undefined,
          protein: meal.protein_grams ? Number(meal.protein_grams) : undefined,
          accent: meal.accent || "green",
          imagePath: meal.image_path || undefined,
          imageUrl: mealImageUrl(db, meal.image_path, meal.name),
          active: meal.active !== false
        }
      } as MenuSlot;
    });
  } catch {
    return demoMenu;
  }
}

export async function getAdminMeals(): Promise<Meal[]> {
  if (isDemoMode() || !hasSupabaseEnv()) return Object.values(demoMeals);

  try {
    const db = await createClient();
    const { data, error } = await db
      .from("meals")
      .select("id,name,description,category,ingredients,allergens,calories,protein_grams,accent,image_path,active")
      .order("created_at", { ascending: false });

    if (error || !data) throw error;

    return data.map((meal: any) => ({
      id: meal.id,
      name: meal.name,
      description: meal.description || "",
      category: meal.category || "Daily",
      ingredients: meal.ingredients || undefined,
      allergens: meal.allergens || [],
      calories: meal.calories || undefined,
      protein: meal.protein_grams ? Number(meal.protein_grams) : undefined,
      accent: meal.accent || "green",
      imagePath: meal.image_path || undefined,
      imageUrl: mealImageUrl(db, meal.image_path, meal.name),
      active: meal.active !== false
    }));
  } catch {
    return Object.values(demoMeals);
  }
}

export async function getAdminMenuSlots() {
  if (isDemoMode() || !hasSupabaseEnv()) {
    return demoMenu.map((slot) => ({
      id: slot.id,
      date: slot.date,
      period: slot.period,
      mealId: slot.meal.id,
      mealName: slot.meal.name,
      price: slot.price,
      creditCost: slot.creditCost,
      capacity: slot.remaining + 12,
      remaining: slot.remaining,
      cutoff: slot.period === "lunch" ? "09:30" : "15:30",
      active: true
    }));
  }

  try {
    const db = await createClient();
    const today = new Date().toISOString().slice(0, 10);
    const { data, error } = await db
      .from("menu_slots")
      .select("id,service_date,period,meal_id,price,credit_cost,capacity,cutoff_at,active,meals(name)")
      .gte("service_date", today)
      .order("service_date")
      .limit(100);

    if (error || !data) throw error;
    return data.map((slot: any) => {
      const meal: any = one(slot.meals);
      const cutoffDate = new Date(slot.cutoff_at);
      const cutoff = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Karachi", hour: "2-digit", minute: "2-digit", hour12: false }).format(cutoffDate);
      return {
        id: slot.id,
        date: slot.service_date,
        period: slot.period,
        mealId: slot.meal_id,
        mealName: meal?.name || "Meal",
        price: Number(slot.price),
        creditCost: Number(slot.credit_cost),
        capacity: Number(slot.capacity),
        remaining: Number(slot.capacity),
        cutoff,
        active: Boolean(slot.active)
      };
    });
  } catch {
    return demoMenu.map((slot) => ({
      id: slot.id, date: slot.date, period: slot.period, mealId: slot.meal.id, mealName: slot.meal.name, price: slot.price, creditCost: slot.creditCost, capacity: slot.remaining + 12, remaining: slot.remaining, cutoff: slot.period === "lunch" ? "09:30" : "15:30", active: true
    }));
  }
}

export async function getHubs(): Promise<Hub[]> {
  if (isDemoMode() || !hasSupabaseEnv()) return demoHubs;

  try {
    const db = await createClient();
    const { data, error } = await db
      .from("hubs")
      .select("id,name,type,area,address,pickup_label,active,capacity")
      .eq("active", true)
      .order("name");

    if (error || !data) throw error;
    return data.map((h: any) => ({
      id: h.id,
      name: h.name,
      type: h.type,
      area: h.area,
      address: h.address,
      pickup: h.pickup_label || "See schedule",
      active: h.active,
      capacity: h.capacity
    }));
  } catch {
    return demoHubs;
  }
}

export async function getPlans() {
  if (isDemoMode() || !hasSupabaseEnv()) return demoPlans.filter((p) => p.active);

  try {
    const db = await createClient();
    const { data, error } = await db
      .from("credit_packs")
      .select("id,name,credits,price,description,validity_days,bonus_credits,featured,active")
      .eq("active", true)
      .order("credits");

    if (error || !data) throw error;
    return data.map((p: any) => ({
      id: p.id,
      name: p.name,
      credits: Number(p.credits),
      price: Number(p.price),
      note: p.description || "Flexible meal credits.",
      validityDays: p.validity_days ? Number(p.validity_days) : null,
      bonusCredits: Number(p.bonus_credits || 0),
      featured: Boolean(p.featured),
      active: Boolean(p.active)
    }));
  } catch {
    return demoPlans.filter((p) => p.active);
  }
}

export async function getAdminPlans() {
  if (isDemoMode() || !hasSupabaseEnv()) return demoPlans;

  try {
    const db = await createClient();
    const { data, error } = await db
      .from("credit_packs")
      .select("id,name,credits,price,description,validity_days,bonus_credits,featured,active")
      .order("credits");

    if (error || !data) throw error;
    return data.map((p: any) => ({
      id: p.id,
      name: p.name,
      credits: Number(p.credits),
      price: Number(p.price),
      note: p.description || "",
      validityDays: p.validity_days ? Number(p.validity_days) : null,
      bonusCredits: Number(p.bonus_credits || 0),
      featured: Boolean(p.featured),
      active: Boolean(p.active)
    }));
  } catch {
    return demoPlans;
  }
}

export async function getAdminOrders() {
  if (isDemoMode() || !hasSupabaseEnv()) return demoOrders;

  try {
    const db = await createClient();
    const { data, error } = await db
      .from("orders")
      .select("id,service_date,period,status,credit_cost,cash_total,created_at,profiles(full_name,phone,email),hubs(name),menu_slots(meals(name))")
      .order("created_at", { ascending: false })
      .limit(150);

    if (error || !data) throw error;

    return data.map((o: any) => {
      const profile: any = one(o.profiles);
      const hub: any = one(o.hubs);
      const slot: any = one(o.menu_slots);
      const meal: any = one(slot?.meals);
      return {
        id: `DL-${String(o.id).slice(0, 6).toUpperCase()}`,
        rawId: o.id,
        date: o.service_date,
        period: o.period,
        meal: meal?.name || "Meal",
        hub: hub?.name || "Hub",
        customer: profile?.full_name || profile?.email || "Customer",
        phone: profile?.phone || "—",
        status: o.status,
        credits: Number(o.credit_cost || 0),
        cashTotal: Number(o.cash_total || 0)
      };
    });
  } catch {
    return demoOrders;
  }
}

export async function getAdminCustomers() {
  if (isDemoMode() || !hasSupabaseEnv()) return demoCustomers;

  try {
    const db = await createClient();
    const { data, error } = await db
      .from("profiles")
      .select("id,full_name,phone,email,blocked,hubs(name),wallets(balance)")
      .eq("role", "customer")
      .order("created_at", { ascending: false })
      .limit(250);

    if (error || !data) throw error;

    return data.map((c: any) => {
      const wallet: any = one(c.wallets);
      const hub: any = one(c.hubs);
      return {
        id: c.id,
        name: c.full_name || "Unnamed customer",
        phone: c.phone || "—",
        email: c.email || "—",
        balance: Number(wallet?.balance || 0),
        hub: hub?.name || "Not set",
        blocked: Boolean(c.blocked)
      };
    });
  } catch {
    return demoCustomers;
  }
}

export async function getAdminPayments() {
  if (isDemoMode() || !hasSupabaseEnv()) return demoPayments;

  try {
    const db = await createClient();
    const { data, error } = await db
      .from("payments")
      .select("id,amount,method,status,reference,created_at,profiles(full_name,email),credit_packs(name)")
      .order("created_at", { ascending: false })
      .limit(150);

    if (error || !data) throw error;

    return data.map((p: any) => {
      const profile: any = one(p.profiles);
      const pack: any = one(p.credit_packs);
      return {
        id: p.id,
        customer: profile?.full_name || profile?.email || "Customer",
        method: p.method,
        amount: Number(p.amount),
        reference: p.reference || "—",
        status: p.status,
        pack: pack?.name || "Custom"
      };
    });
  } catch {
    return demoPayments;
  }
}

export async function getCustomerSnapshot() {
  if (isDemoMode() || !hasSupabaseEnv()) {
    return { name: "Awais", balance: 13, hub: demoHubs[0], orders: demoOrders, next: demoOrders[0] };
  }

  try {
    const db = await createClient();
    const { data: { user } } = await db.auth.getUser();
    if (!user) return { name: "Guest", balance: 0, hub: demoHubs[0], orders: [], next: null };

    const [{ data: profile }, { data: wallet }, { data: orders }] = await Promise.all([
      db.from("profiles").select("full_name,default_hub_id,hubs(name,area,address,pickup_label,type,active,capacity)").eq("id", user.id).maybeSingle(),
      db.from("wallets").select("balance").eq("user_id", user.id).maybeSingle(),
      db.from("orders").select("id,service_date,period,status,credit_cost,hubs(name),menu_slots(meals(name))").eq("user_id", user.id).order("service_date", { ascending: false }).limit(10)
    ]);

    const mapped = (orders || []).map((o: any) => ({
      id: o.id.slice(0, 8).toUpperCase(),
      rawId: o.id,
      date: o.service_date,
      period: o.period,
      meal: o.menu_slots?.meals?.name || "Meal",
      hub: o.hubs?.name || "Hub",
      status: o.status,
      credits: Number(o.credit_cost || 1)
    }));

    const h: any = (profile as any)?.hubs;
    return {
      name: profile?.full_name?.split(" ")[0] || "there",
      balance: Number(wallet?.balance || 0),
      hub: h ? {
        id: (profile as any).default_hub_id,
        name: h.name,
        type: h.type,
        area: h.area,
        address: h.address,
        pickup: h.pickup_label,
        active: h.active,
        capacity: h.capacity
      } : demoHubs[0],
      orders: mapped,
      next: mapped.find((o: any) => ["scheduled", "confirmed", "preparing", "packed"].includes(String(o.status).toLowerCase())) || null
    };
  } catch {
    return { name: "Awais", balance: 13, hub: demoHubs[0], orders: demoOrders, next: demoOrders[0] };
  }
}

export async function getAdminSnapshot() {
  if (isDemoMode() || !hasSupabaseEnv()) return demoAdmin;

  try {
    const db = await createClient();
    const today = new Date().toISOString().slice(0, 10);
    const [{ count: ordersToday }, { count: pendingPayments }, { count: activeHubs }, { data: payments }, { data: prod }] = await Promise.all([
      db.from("orders").select("id", { count: "exact", head: true }).eq("service_date", today).neq("status", "cancelled"),
      db.from("payments").select("id", { count: "exact", head: true }).eq("status", "pending"),
      db.from("hubs").select("id", { count: "exact", head: true }).eq("active", true),
      db.from("payments").select("amount").eq("status", "paid").gte("created_at", `${today}T00:00:00`),
      db.from("kitchen_production_summary").select("meal_name,regular_qty,protein_qty").eq("service_date", today)
    ]);

    return {
      revenue: (payments || []).reduce((sum: number, p: any) => sum + Number(p.amount), 0),
      ordersToday: ordersToday || 0,
      pendingPayments: pendingPayments || 0,
      activeHubs: activeHubs || 0,
      lowRatings: 0,
      production: (prod || []).map((p: any) => ({ meal: p.meal_name, regular: Number(p.regular_qty), protein: Number(p.protein_qty) }))
    };
  } catch {
    return demoAdmin;
  }
}

export async function getAdminWalletTransactions() {
  const demoLedger = [
    { id: "wt1", time: new Date().toISOString(), customer: "Awais Anjum", type: "purchase", amount: 10, reference: "PAY-8402", reason: "Verified payment" },
    { id: "wt2", time: new Date(Date.now() - 3600000).toISOString(), customer: "Hira Khan", type: "order_debit", amount: -1, reference: "DL-1049", reason: "Confirmed order" },
    { id: "wt3", time: new Date(Date.now() - 7200000).toISOString(), customer: "Saad Ali", type: "order_refund", amount: 1, reference: "DL-1030", reason: "Skip before cutoff" }
  ];

  if (isDemoMode() || !hasSupabaseEnv()) return demoLedger;

  try {
    const db = await createClient();
    const { data, error } = await db
      .from("wallet_transactions")
      .select("id,type,amount,order_id,payment_id,reason,created_at,profiles(full_name,email)")
      .order("created_at", { ascending: false })
      .limit(250);

    if (error || !data) throw error;
    return data.map((tx: any) => {
      const profile: any = one(tx.profiles);
      return {
        id: tx.id,
        time: tx.created_at,
        customer: profile?.full_name || profile?.email || "Customer",
        type: tx.type,
        amount: Number(tx.amount),
        reference: tx.order_id ? `ORDER ${String(tx.order_id).slice(0, 6).toUpperCase()}` : tx.payment_id ? `PAY ${String(tx.payment_id).slice(0, 6).toUpperCase()}` : "—",
        reason: tx.reason || "—"
      };
    });
  } catch {
    return demoLedger;
  }
}
