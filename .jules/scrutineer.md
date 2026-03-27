# Scrutineer's Log

## Architectural Traps & Bullshit Removed

### 2025-05-22: Redundant UI and Logic Cleanup
- **The Bullshit:** The codebase contained a static "Operational" status badge that never changed state, adding UI clutter. It also used a `transitTheme` wrapper function that did nothing but set a global variable, adding a layer of indirection.
- **The Fix:** Removed the status badge and its CSS. Replaced `transitTheme` calls with direct variable assignment. Simplified `Particle.update` by removing an unused `theme` parameter and redundant `hasWind` checks (since `gust` already accounts for it).
- **Result:** Reduced cognitive load and removed dead code.
