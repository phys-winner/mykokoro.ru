## 2025-03-24 - Particle System Optimization
**Learning:** In high-frequency animation loops (60 FPS), repeated object lookups (`themes[activeTheme]`), global function calls (`Date.now()`), and constant recalculations (`Math.PI * 2`) for every element (150+ particles) add unnecessary overhead that can lead to frame drops on lower-end devices.
**Action:** Move lookups and time calculations to the beginning of the frame (once per `requestAnimationFrame`) and pass them as parameters. Pre-calculate mathematical constants.
