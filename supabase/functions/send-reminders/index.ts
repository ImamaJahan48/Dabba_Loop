// Scheduled reminder queue builder. Connect Resend/WhatsApp/SMS provider later.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async () => {
  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const { data: orders, error } = await db.from("orders").select("user_id,id,service_date,period").eq("service_date", tomorrow).eq("status", "confirmed");
  if (error) return Response.json({ ok:false,error:error.message }, {status:500});

  const rows = (orders || []).map(o => ({ user_id:o.user_id, channel:"in_app", template:"tomorrow_meal_reminder", payload:{ order_id:o.id, period:o.period }, status:"queued" }));
  if (rows.length) await db.from("notifications").insert(rows);
  return Response.json({ ok:true, queued:rows.length });
});
