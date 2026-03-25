## 2025-10-24 - Modal Focus Management & Tab Order Optimization
**Learning:** For interactive project cards that use CSS `:focus-within` to trigger animations, adding a `tabindex="0"` to the container creates redundant tab stops. Removing these while ensuring inner buttons have clear focus states improves navigation speed for keyboard users. Additionally, manual focus trapping in modals is essential for a "native" feel on the web.
**Action:** Always audit tab stops in galleries and implement `lastFocusedElement` tracking for modal components.
