# Branding & Renaming

The product architecture deliberately does not depend on the final brand name.

## Rename globally

Set in `.env.local` and Vercel:

```env
NEXT_PUBLIC_BRAND_NAME=YourName
NEXT_PUBLIC_BRAND_TAGLINE=Your tagline
```

Fallback values live in `src/config/brand.ts`.

## Logo component

`src/components/ui/brand-mark.tsx` uses a simple loop-inspired mark made in CSS, so there is no stale baked-in wordmark. Replace this component with the final SVG when the name/logo is approved.

## Voice
Short, local and useful. The brand promise should be flexibility + home-style reliability, not broad claims such as “the healthiest food in Lahore” unless they can be substantiated.
