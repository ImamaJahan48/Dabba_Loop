# Security Checklist

## Mandatory before launch

- keep Supabase service-role key server-only
- keep RLS enabled on every exposed business table
- test cross-user isolation
- payment proof bucket remains private
- verify upload file size/type limits server-side before public launch
- rate-limit signup/login/referral/contact endpoints at the edge or provider layer
- configure email verification/reset policy intentionally
- validate all wallet, capacity, cutoff, price and role logic server-side
- add audit records for privileged finance/role changes
- review Supabase and Next.js security updates regularly

## Payment webhooks later

When a gateway replaces manual verification:
- verify provider signature
- store unique provider event ID
- process idempotently
- never trust amount/credits posted by the browser
- reconcile gateway settlement against `payments`

## Data minimization

For a meal service, collect only what is operationally required. Do not request CNIC or other unnecessary identity data.
