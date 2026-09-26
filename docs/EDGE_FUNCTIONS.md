# Edge Functions

Two templates are included under `supabase/functions/`.

## `payment-webhook`

A deliberately generic future gateway endpoint. It refuses requests without a shared secret and records a unique event ID, but it **does not pretend to implement JazzCash/Easypaisa signature verification** because that depends on the exact merchant product and current provider contract.

Before real deployment:
1. use the gateway's current server-to-server verification method
2. verify signature, merchant, payment ID, amount and status
3. store provider event ID uniquely
4. call an idempotent database function to issue credits
5. test replayed callbacks

## `send-reminders`

Builds notification queue rows for tomorrow's confirmed orders. Connect the queue to email/WhatsApp/SMS only after a provider is selected.

Deploy example:

```bash
npx supabase functions deploy send-reminders
```

Store service/provider secrets with Supabase secrets rather than in source control.
