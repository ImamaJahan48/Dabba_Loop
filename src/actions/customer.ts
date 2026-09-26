"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";
import { hasSupabaseEnv, isDemoMode } from "@/lib/env";

export async function createOrder(formData: FormData) {
  if (isDemoMode() || !hasSupabaseEnv()) return { ok:true, demo:true };
  const slotId = String(formData.get("slotId"));
  const hubId = String(formData.get("hubId"));
  const supabase = await createClient();
  const { error } = await supabase.rpc("create_meal_order", { p_menu_slot_id:slotId, p_hub_id:hubId, p_notes:null });
  if (error) return { ok:false, error:error.message };
  revalidatePath("/app"); revalidatePath("/app/orders"); revalidatePath("/app/wallet");
  return { ok:true };
}

export async function skipOrder(formData: FormData) {
  if (isDemoMode() || !hasSupabaseEnv()) return { ok:true, demo:true };
  const orderId = String(formData.get("orderId"));
  const supabase = await createClient();
  const { error } = await supabase.rpc("skip_meal_order", { p_order_id:orderId });
  if (error) return { ok:false, error:error.message };
  revalidatePath("/app"); revalidatePath("/app/orders"); revalidatePath("/app/wallet");
  return { ok:true };
}

export async function submitManualPayment(formData: FormData) {
  if (isDemoMode() || !hasSupabaseEnv()) return { ok:true, demo:true };
  const supabase = await createClient();
  const { data:{ user } } = await supabase.auth.getUser();
  if (!user) return { ok:false, error:"Not signed in" };
  const amount = Number(formData.get("amount"));
  const method = String(formData.get("method"));
  const reference = String(formData.get("reference"));
  const packId = String(formData.get("packId") || "") || null;
  const file = formData.get("proof") as File | null;
  let proofPath:string|null = null;
  if (file && file.size > 0) {
    proofPath = `${user.id}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g,"_")}`;
    const { error } = await supabase.storage.from("payment-proofs").upload(proofPath, file, { upsert:false });
    if (error) return { ok:false, error:error.message };
  }
  const { error } = await supabase.from("payments").insert({ user_id:user.id, amount, method, reference, proof_path:proofPath, credit_pack_id:packId, status:"pending" });
  if (error) return { ok:false, error:error.message };
  revalidatePath("/app/payments");
  return { ok:true };
}


export async function changeOrder(formData: FormData) {
  if (isDemoMode() || !hasSupabaseEnv()) return { ok:true, demo:true };
  const supabase = await createClient();
  const { error } = await supabase.rpc("change_meal_order", {
    p_order_id: String(formData.get("orderId")),
    p_new_menu_slot_id: String(formData.get("slotId")),
    p_new_hub_id: String(formData.get("hubId"))
  });
  if (error) return { ok:false, error:error.message };
  revalidatePath("/app"); revalidatePath("/app/orders"); revalidatePath("/app/wallet"); revalidatePath("/app/planner");
  return { ok:true };
}

export async function updateProfile(formData: FormData) {
  if (isDemoMode() || !hasSupabaseEnv()) return { ok:true, demo:true };
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) return {ok:false,error:"Not signed in"};
  const {error}=await supabase.from("profiles").update({
    full_name:String(formData.get("fullName")||""), phone:String(formData.get("phone")||""),
    spice_preference:String(formData.get("spice")||"normal")
  }).eq("id",user.id);
  if(error) return {ok:false,error:error.message}; revalidatePath("/app/profile"); return {ok:true};
}

export async function createSupportTicket(formData: FormData) {
  if (isDemoMode() || !hasSupabaseEnv()) return { ok:true, demo:true };
  const supabase=await createClient(); const {data:{user}}=await supabase.auth.getUser();
  if(!user) return {ok:false,error:"Not signed in"};
  const {error}=await supabase.from("support_tickets").insert({user_id:user.id,category:String(formData.get("category")||"other"),details:String(formData.get("details")||""),priority:"normal"});
  if(error) return {ok:false,error:error.message}; revalidatePath("/app/support"); return {ok:true};
}

export async function submitFeedback(formData: FormData) {
  if (isDemoMode() || !hasSupabaseEnv()) return { ok:true, demo:true };
  const supabase=await createClient(); const {data:{user}}=await supabase.auth.getUser();
  if(!user) return {ok:false,error:"Not signed in"};
  const orderId=String(formData.get("orderId")||""); const rating=Number(formData.get("rating")||5);
  const {error}=await supabase.from("feedback").insert({order_id:orderId,user_id:user.id,rating,taste:Number(formData.get("taste")||rating),portion:Number(formData.get("portion")||rating),packaging:Number(formData.get("packaging")||rating),delivery:Number(formData.get("delivery")||rating),comment:String(formData.get("comment")||"")});
  if(error) return {ok:false,error:error.message}; revalidatePath("/app/feedback"); return {ok:true};
}

export async function planWeek(formData: FormData) {
  if (isDemoMode() || !hasSupabaseEnv()) return { ok:true, demo:true, created:0 };
  const supabase=await createClient();
  const hubId=String(formData.get("hubId")||"");
  if(!hubId) return {ok:false,error:"Choose a hub"};
  const selected=[...formData.entries()].filter(([k,v])=>k.startsWith("slot_") && typeof v==="string" && v.length>0).map(([,v])=>String(v));
  const results=[] as string[];
  for(const slotId of selected){
    const {data,error}=await supabase.rpc("create_meal_order",{p_menu_slot_id:slotId,p_hub_id:hubId,p_notes:"Created from weekly planner"});
    if(!error && data) results.push(String(data));
  }
  revalidatePath("/app");revalidatePath("/app/planner");revalidatePath("/app/orders");revalidatePath("/app/wallet");
  return {ok:true,created:results.length};
}
