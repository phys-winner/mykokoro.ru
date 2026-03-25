## 2025-10-24 - Modal Focus Management & Tab Order Optimization
**Learning:** For interactive project cards that use CSS `:focus-within` to trigger animations, adding a `tabindex="0"` to the container creates redundant tab stops. Removing these while ensuring inner buttons have clear focus states improves navigation speed for keyboard users. Additionally, manual focus trapping in modals is essential for a "native" feel on the web.
**Action:** Always audit tab stops in galleries and implement `lastFocusedElement` tracking for modal components.

## 2026-03-25 - Themed Focus Consistency in Glassmorphism
**Learning:** In highly stylized, theme-driven UIs (like glassmorphism dashboards), default browser focus rings often break the visual "immersion." Synchronizing the `box-shadow` of focused elements with the current theme's primary accent variable (`--theme-accent`) preserves the aesthetic while significantly improving accessibility for keyboard users.
**Action:** Use CSS variables for focus states (`outline-color` or `box-shadow`) to ensure they adapt to dynamic theme changes automatically.
