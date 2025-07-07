# Tech Context: Kyperus Theme

## Technologies Used
- Shopify Dawn Theme (v15.3.0) as base
- Custom JavaScript (SPA navigation, caching, preloading)
- Service Workers for advanced caching
- Intersection Observer for lazy loading
- View Transition API for smooth transitions
- Liquid for settings/configuration bridge

## Development Setup
- Modular JS files in assets/
- Theme settings in config/settings_schema.json
- Integration via snippets/hydrogen-init.liquid and layout/theme.liquid

## Technical Constraints
- Must remain compatible with Shopify’s theme architecture
- All enhancements must degrade gracefully if unsupported
- No breaking changes to Dawn’s core structure

## Dependencies
- Shopify Storefront API (for product/collection data)
- Shopify Admin API (for theme editor detection)
- Web standards: Service Workers, Intersection Observer, View Transition API 