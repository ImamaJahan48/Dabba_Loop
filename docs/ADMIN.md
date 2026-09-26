# Admin & Operations Guide

## Daily sequence
1. verify pending manual payments
2. inspect current menu capacity/hub capacity
3. after cutoff, freeze production totals
4. kitchen works from aggregate quantities
5. print/generate packing list by hub
6. create delivery run and stop sequence
7. mark pickup and delivered hubs
8. review exceptions and low feedback
9. reconcile payment/order totals

## Role boundaries

- **Admin:** full operational access
- **Finance:** payments, refunds, wallet ledger, finance reporting
- **Kitchen:** meals needed, supported variants, packing labels; no finance
- **Delivery:** assigned stops/counts/status; no finance/customer history
- **Partner:** their hub data only

Database RLS is the enforcement layer. Hiding menu items is not authorization.

## Menu operations

Keep daily choice count intentionally small during pilot. Each slot has its own date, meal period, capacity, price, credit cost and exact cutoff timestamp.
