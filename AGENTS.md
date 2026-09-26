# AI / Developer Working Instructions

## Product invariant
This is a **flexible meal-credit + hub-delivery system**, not a generic restaurant ecommerce site.

Never remove these core flows without an explicit product decision:
1. meal credits / wallet ledger
2. lunch and dinner menu slots
3. skip before cutoff with automatic credit return
4. switch / move hub capability
5. hostel/office shared hubs
6. kitchen aggregation after cutoff
7. role separation between customer, admin, kitchen, delivery, finance and partner

## Technical invariant
- Next.js App Router, TypeScript
- Supabase Auth/Postgres/Storage/RLS
- Server-side validation for price, capacity, cutoff, wallet and permissions
- `wallet_transactions` is append-only; corrections are compensating entries
- Never put service-role keys in `NEXT_PUBLIC_*`
- Keep demo mode working for design review

## Design invariant
Editorial food-tech. Warm cream, charcoal, solid coral, one acid-lime support accent. Large Syne headlines, restrained motion, generous whitespace, rounded but not childish cards. Avoid glassmorphism overload, generic purple AI gradients, tiny dashboard-card carpets and gratuitous 3D that slows ordering.

## Before merging
Run `npm run build`. Test mobile widths. Test customer RLS using two different accounts. Test payment approval twice and confirm credits are not duplicated. Test skip twice and confirm only one refund exists.
