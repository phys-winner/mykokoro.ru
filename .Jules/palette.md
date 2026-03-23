## 2026-03-23 - [Synchronizing Delight with Accessibility]
**Learning:** Micro-interactions (like theme-shifting particles) are often coupled only to mouse `hover` events, creating an "experience gap" for keyboard users. By synchronizing CSS `:focus-within` and JS `focusin`/`focusout` with existing hover logic, we ensure that delight is accessible to all.
**Action:** Always verify that interactive "delight" states (animations, theme changes) are triggered by keyboard focus as well as mouse hover.
