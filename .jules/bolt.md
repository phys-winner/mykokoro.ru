## 2025-03-24 - Particle System Optimization
**Learning:** In high-frequency animation loops (60 FPS), repeated object lookups (`themes[activeTheme]`), global function calls (`Date.now()`), and constant recalculations (`Math.PI * 2`) for every element (150+ particles) add unnecessary overhead that can lead to frame drops on lower-end devices.
**Action:** Move lookups and time calculations to the beginning of the frame (once per `requestAnimationFrame`) and pass them as parameters. Pre-calculate mathematical constants.

## 2025-03-25 - API Resilience & Load Speed
**Learning:** External API dependencies (like GitHub's) introduce unpredictability in load times and risk hitting rate limits on high-traffic static sites. Client-side caching using `localStorage` with a Time-To-Live (TTL) is an effective way to balance data freshness with performance.
**Action:** Implement `localStorage` caching for all non-critical, slow-changing external data to minimize network overhead and ensure a fast, consistent user experience.
