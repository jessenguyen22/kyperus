# System Patterns: Kyperus Theme

## System Architecture
- Modular, single-responsibility files for navigation, performance, and caching.
- Progressive enhancement: core features work without JS, enhanced with JS.
- Integration points in theme.liquid and hydrogen-init.liquid for configuration.

## Key Technical Decisions
- SPA navigation via custom HydrogenNavigation class.
- Multi-layered caching: memory, service worker, browser.
- Loading state system with multiple visual styles.
- Conditional feature loading based on theme settings and editor mode.

## Design Patterns Used
- Module Pattern: Each file has a single responsibility.
- Observer Pattern: Event-driven architecture with PubSub.
- Strategy Pattern: Multiple cache strategies by content type.
- Factory Pattern: Dynamic loading bar creation.
- Singleton Pattern: Single navigation instance per page.

## Component Relationships
- assets/hydrogen-navigation.js: SPA navigation, event system.
- assets/performance-optimizer.js: Resource loading, prefetching.
- assets/service-worker.js: Caching, background sync.
- snippets/hydrogen-init.liquid: Settings/config bridge.
- layout/theme.liquid: Meta tags, script/CSS integration. 