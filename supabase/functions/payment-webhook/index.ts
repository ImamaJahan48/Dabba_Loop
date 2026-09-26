// Generic Supabase Edge Function skeleton for a future payment gateway.
// Do NOT deploy as-is for real money: implement the selected provider's signature verification first.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const secret = Deno.env.get("PAYMENT_WEBHOOK_SECRET");
  const supplied = req.headers.get("x-webhook-secret");
  if (!secret || supplied !== secret) return new Response("Unauthorized", { status: 401 });

  const body = await req.json();
  const eventId = String(body.event_id || "");
  const paymentId = String(body.payment_id || "");
  if (!eventId || !paymentId) return new Response("Invalid payload", { status: 400 });

  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: existing } = await db.from("payments").select("id,status,gateway_event_id").eq("gateway_event_id", eventId).maybeSingle();
  if (existing) return Response.json({ ok: true, duplicate: true });

  // Provider-specific amount/status verification belongs here.
  const { error } = await db.from("payments").update({ gateway_event_id: eventId }).eq("id", paymentId);
  if (error) return Response.json({ ok: false, error: error.message }, { status: 500 });

  // For a real gateway use a dedicated SECURITY DEFINER function that verifies
  // the stored payment amount/pack and issues credits idempotently.
  return Response.json({ ok: true, recorded: true });
});
