# Customer Experience Rules

## Goal
A returning customer should be able to book a meal in roughly three taps.

## Order flow
1. open Today or Planner
2. choose available menu slot
3. confirm/default delivery hub
4. server validates and creates order
5. wallet debit appears in ledger

## Skip
Before cutoff: server cancels order and inserts a one-time refund transaction. After cutoff: no automatic refund; show policy/support path.

## Lunch ↔ Dinner and Move My Meal
The specification calls for these as first-class features. The current UI surfaces them; production implementation should perform the switch as one server-side transaction: validate target slot/hub, refund/adjust old credit cost, update or recreate order, and fail everything if any check fails.

## Notifications
Prioritize messages that change action or confidence:
- payment approved
- order confirmed
- cutoff approaching
- batch delivered to hub
- low wallet
- feedback request

Avoid six notifications about the existence of lunch.
