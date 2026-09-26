# QA / Acceptance Tests

## Customer
- signup creates profile and wallet
- another user cannot read the account
- zero-credit order fails
- closed cutoff order fails
- full menu slot fails
- full hub fails
- valid order deducts exactly once
- skip refunds exactly once
- skip after cutoff fails
- private payment proof cannot be fetched by another customer

## Finance
- pending payment adds no credits
- approval adds correct pack credits
- repeated approval adds no extra credits
- adjustment requires reason
- ledger row cannot be edited/deleted

## Roles
- kitchen cannot open payment/wallet data
- delivery sees only route-relevant operational data
- partner sees only linked hub data
- customer cannot reach admin data even by direct database query

## Responsive
Test 360 px, 390 px, tablet, 1366 px and wide desktop. Critical customer controls must remain usable with touch.

## Operations
Compare kitchen totals to confirmed orders for the same period and hubs. Compare delivery batch count to packing list. Verify cancelled orders are excluded.
