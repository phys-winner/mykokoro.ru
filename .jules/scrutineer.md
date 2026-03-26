# 🔍 Scrutineer's Log

- **Redundant Helpers:** The project used both a `cachedIsMobile` variable (updated on resize) and a separate `isMobile()` function that performed the same calculation on every call. Always prefer the cached variable to avoid redundant DOM/User-Agent lookups in interaction handlers.
