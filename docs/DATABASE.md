# Database & Backend Design

## Core model

Supabase supplies PostgreSQL, Auth, Storage and RLS. The browser receives only the publishable key. Privileged operations happen through database functions or trusted server code.

### Primary tables

| Table | Purpose |
|---|---|
| `profiles` | application profile + role for each Auth user |
| `hubs` | hostel, office and community pickup points |
| `hub_memberships` | customer/partner relationship to a hub |
| `meals` | reusable recipe catalogue |
| `menu_slots` | meal offered on a date + lunch/dinner period |
| `orders` | one confirmed reservation |
| `order_items` | meal variant/add-ons for the order |
| `wallets` | cached current balance |
| `wallet_transactions` | append-only source of truth for credits |
| `credit_packs` | purchasable meal-credit products |
| `payments` | manual/gateway reconciliation record |
| `delivery_runs` | route header |
| `delivery_run_hubs` | ordered route stops |
| `feedback` | structured quality ratings |
| `referrals` | referral state and reward link |
| `notifications` | message log |
| `audit_logs` | privileged action history |
| `app_settings` | configurable cutoffs/policies |

## Atomic business functions

### `create_meal_order`
Locks the menu slot and hub, checks user/account, server clock cutoff, menu capacity, hub capacity and wallet balance, then creates order + item + wallet debit in one transaction.

### `skip_meal_order`
Checks ownership, status and server-side cutoff; marks the order cancelled and inserts one refund transaction. A partial unique index prevents duplicate refunds.

### `approve_manual_payment`
Admin/finance only. Locks a pending payment, reads its credit pack, marks payment paid and inserts one purchase transaction. A unique index on payment ID makes repeated approvals idempotent.

### `admin_adjust_wallet`
Admin/finance only. Creates a compensating ledger entry with mandatory reason and audit log.

## Why the ledger matters

Never directly edit a customer's credit balance. Purchases, debits, refunds, promotions and corrections are separate rows. The balance is updated by trigger and can be reconciled from history.

## Storage

- `meal-images`: public read, admin write
- `payment-proofs`: private; customers upload to their own user folder; only owner/admin/finance can read

## RLS test idea

Create Customer A and Customer B. Add data to both. In Customer B's session, queries for Customer A's `orders`, `payments`, `wallets` and `wallet_transactions` must return no rows.
