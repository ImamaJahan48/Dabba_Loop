# Design System

## Direction

Premium **editorial food-tech** rather than generic restaurant marketplace UI.

The design takes broad principles from Awwwards food/ecommerce examples: bold typography, clean composition, color used with confidence and motion that supports browsing. MotionSites guidance also favors strong visual direction, sparse editable typography, scroll-triggered reveals and carefully limited motion instead of covering a page in effects.

References used for direction only:
- https://www.awwwards.com/inspiration/website-for-buying-ice-cream
- https://www.awwwards.com/inspiration/scroll-flavori-restaurant
- https://motionsites.ai/lesson/build-scroll-animated-website-with-ai
- https://motionsites.ai/academy

Do not pixel-copy any reference.

## Palette

- Ink `#171712`
- Warm paper `#F4EFE5`
- Card `#FFFAF1`
- Coral `#FF5B35`
- Acid lime `#C7FF66`
- Sky `#9BD8FF`
- Gold `#FFC65B`

Solid colors are preferred. Avoid glassy gradients and the generic purple-blue AI look.

## Typography

- Display: **Syne**
- Body: **Manrope**
- Labels/data: **DM Mono**

Production can self-host fonts later to remove dependency on Google Fonts.

## Motion

Current implementation uses IntersectionObserver reveal animations and CSS motion only. This keeps the ordering experience light. If the marketing site later gets a 3D/scroll-scrub hero, load it only on capable devices and respect `prefers-reduced-motion`.

## Component language

- 24–32 px soft radii
- heavy editorial headlines
- sparse cards, not dashboards made of 30 tiny tiles
- one primary coral action per screen
- mono micro-labels for operational clarity
- dark sections for menu/product storytelling

## Accessibility

- preserve high text contrast
- all interactive controls need keyboard access/focus states
- do not encode order status by color alone
- keep customer actions large enough for phone use
- motion is decoration, never the only way information appears
