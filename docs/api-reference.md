# API Reference - Hydrogen Performance System

## 🎯 Global Objects & Functions

### Window Objects
```javascript
window.hydrogenNav          // Main navigation instance
window.hydrogenConfig       // Configuration object
window.performanceOptimizer // Performance optimization instance
```

### Debug Functions
```javascript
getNavigationDebug()        // Get system status and metrics
testLoadingBar(duration)    // Test loading bar manually
testLoadingStyles()         // Test all loading bar styles
clearNavigationCache()      // Clear navigation cache
disableHydrogenNavigation() // Disable and reload
enableHydrogenNavigation()  // Enable and reload
systemHealthCheck()         // Quick system health check
```

---

## 🔧 HydrogenNavigation Class

### Constructor
```javascript
class HydrogenNavigation {
  constructor() {
    this.cache = new Map();           // Page content cache
    this.preloadCache = new Set();    // Preloaded URLs
    this.pendingRequests = new Map(); // In-flight requests
    this.isNavigating = false;        // Navigation state
    this.currentUrl = window.location.href; // Current URL
  }
}
```

### Core Methods

#### `shouldEnableNavigation()`
Determines if navigation system should be active.

**Returns:** `boolean`

**Checks:**
- Theme editor/customize mode
- Theme settings
- Browser support
- User preferences

```javascript
shouldEnableNavigation() {
  if (window.Shopify?.designMode) return false;
  if (!window.hydrogenConfig?.enableNavigation) return false;
  if (localStorage.getItem('hydrogen-navigation-disabled')) return false;
  return true;
}
```

#### `navigateToUrl(url)`
Main navigation method for instant page transitions.

**Parameters:**
- `url` (string): Target URL to navigate to

**Returns:** `Promise<void>`

**Flow:**
1. Check if already navigating
2. Show brief loading state
3. Fetch page content
4. Show full loading if needed
5. Update DOM with content
6. Update browser history
7. Hide loading state

```javascript
async navigateToUrl(url) {
  if (this.isNavigating || url === this.currentUrl) return;
  
  this.isNavigating = true;
  try {
    this.showBriefLoadingState();
    const content = await this.fetchPage(url);
    if (performance.now() - this.navigationStartTime > 100) {
      this.showLoadingIndicator();
    }
    await this.updatePage(content, url);
    history.pushState({ url }, '', url);
  } finally {
    this.isNavigating = false;
    this.hideLoadingIndicator();
  }
}
```

#### `fetchPage(url)`
Fetch page content with caching and deduplication.

**Parameters:**
- `url` (string): URL to fetch

**Returns:** `Promise<Object>` - Page content object

**Content Object Structure:**
```javascript
{
  title: string,        // Page title
  head: string,         // Head innerHTML
  main: string,         // Main content innerHTML
  breadcrumbs: string,  // Breadcrumbs innerHTML
  url: string,          // Original URL
  timestamp: number     // Cache timestamp
}
```

#### `preloadPage(url)`
Preload page content for instant navigation.

**Parameters:**
- `url` (string): URL to preload

**Returns:** `Promise<void>`

**Conditions:**
- Not already cached
- Not currently loading
- Passes preload filters

#### `updatePage(content, url)`
Update page DOM with new content using smooth transitions.

**Parameters:**
- `content` (Object): Page content object
- `url` (string): Target URL

**Returns:** `Promise<void>`

**Uses:**
- View Transition API (if supported)
- Fallback CSS transitions
- Component reinitialization

### Loading State Methods

#### `showLoadingIndicator()`
Display loading bar with progress animation.

**Features:**
- Dynamic style application
- Realistic progress simulation
- Configurable appearance

#### `hideLoadingIndicator()`
Hide loading bar with completion animation.

**Features:**
- Progress completion to 100%
- Smooth fade out
- State cleanup

#### `animateProgress(bar)`
Animate loading bar progress realistically.

**Parameters:**
- `bar` (HTMLElement): Loading bar element

**Animation:**
- 0% → 85% during fetch
- 85% → 100% on completion
- Variable speed with randomization

### Cache Management

#### `cacheCurrentPage()`
Cache current page content for back navigation.

#### `clearCache()`
Clear all cached content and reset state.

### Debug Methods

#### `getDebugInfo()`
Get comprehensive system information.

**Returns:** `Object`
```javascript
{
  enabled: boolean,           // System enabled status
  designMode: boolean,        // Theme editor status
  settings: Object,           // Configuration object
  cacheSize: number,         // Number of cached pages
  preloadedPages: number,    // Number of preloaded pages
  pendingRequests: number,   // Active requests
  currentUrl: string,        // Current page URL
  isNavigating: boolean,     // Navigation state
  cacheEntries: Array,       // Cached URLs
  preloadedEntries: Array,   // Preloaded URLs
  pendingEntries: Array      // Pending request URLs
}
```

---

## ⚡ PerformanceOptimizer Class

### Constructor
```javascript
class PerformanceOptimizer {
  constructor() {
    this.preloadQueue = new Set();
    this.intersectionObserver = null;
    this.performanceMetrics = {};
    this.init();
  }
}
```

### Core Methods

#### `setupServiceWorker()`
Register and configure Service Worker.

**Features:**
- Development cache clearing
- Registration error handling
- Update notifications

#### `setupCriticalResourceHints()`
Add DNS prefetch and preconnect hints.

**Domains:**
- `//cdn.shopify.com`
- `//fonts.shopifycdn.com`
- `//monorail-edge.shopifysvc.com`

#### `setupLazyLoading()`
Configure Intersection Observer for lazy loading.

**Targets:**
- Images with `loading="lazy"`
- Elements with `data-lazy` attribute
- Sections with deferred content

#### `prefetchPage(url)`
Intelligent page prefetching.

**Parameters:**
- `url` (string): URL to prefetch

**Strategies:**
- Link prefetch (if supported)
- Fetch API fallback
- Error handling and cleanup

#### `measureCoreWebVitals()`
Monitor Core Web Vitals metrics.

**Metrics:**
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)

---

## 🗄️ Service Worker API

### Cache Strategies

#### `CACHE_FIRST`
For static assets (CSS, JS, images).

**Flow:**
1. Check cache first
2. Return cached version if available
3. Fetch from network if not cached
4. Cache response for future use

#### `NETWORK_FIRST`
For API calls with cache fallback.

**Flow:**
1. Try network request first
2. Cache successful response
3. Return cached version if network fails

#### `STALE_WHILE_REVALIDATE`
For HTML pages.

**Flow:**
1. Return cached version immediately
2. Fetch updated version in background
3. Update cache with new content

### Cache Management

#### `cleanupOldCaches()`
Remove outdated cache versions.

**Returns:** `Promise<void>`

#### `isStaticAsset(pathname)`
Check if request is for static asset.

**Parameters:**
- `pathname` (string): Request pathname

**Returns:** `boolean`

**Criteria:**
- Starts with `/assets/`
- Ends with `.css`, `.js`, `.svg`, `.png`, `.jpg`, `.webp`
- Contains `shopifycdn.com`

---

## 🎨 CSS Custom Properties

### Configuration Variables
```css
:root {
  --hydrogen-transition-speed: 150ms;  /* Transition duration */
  --hydrogen-loading-display: block;   /* Loading visibility */
  --hydrogen-loading-height: 4px;     /* Loading bar height */
}
```

### Loading States
```css
.page-loading {
  cursor: progress;  /* Loading cursor */
}

.page-loading-brief {
  /* Brief loading state without cursor change */
}

#instant-loading {
  /* Loading bar container */
  position: fixed;
  top: 0;
  z-index: 99999;
}

.loading-bar {
  /* Progress bar element */
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

## 📊 Events & Callbacks

### Custom Events

#### `page:loaded`
Fired after instant navigation completes.

**Event Detail:**
```javascript
{
  navigation: 'instant',  // Navigation type
  url: string,           // Target URL
  duration: number       // Navigation duration (ms)
}
```

**Usage:**
```javascript
document.addEventListener('page:loaded', (event) => {
  console.log('Page loaded via instant navigation:', event.detail);
  // Reinitialize components
});
```

#### `modalClosed`
Fired when modal dialogs are closed.

**Usage:**
```javascript
document.body.addEventListener('modalClosed', () => {
  // Handle modal close
});
```

### Performance Observers

#### Navigation Timing
```javascript
new PerformanceObserver((list) => {
  list.getEntries().forEach(entry => {
    console.log('Navigation timing:', entry);
  });
}).observe({ entryTypes: ['navigation'] });
```

#### Paint Timing
```javascript
new PerformanceObserver((list) => {
  list.getEntries().forEach(entry => {
    if (entry.name === 'first-contentful-paint') {
      console.log('FCP:', entry.startTime);
    }
  });
}).observe({ entryTypes: ['paint'] });
```

---

## 🔧 Configuration Options

### Liquid Configuration
```liquid
window.hydrogenConfig = {
  enableNavigation: boolean,      // Master toggle
  enableServiceWorker: boolean,   // Service Worker toggle
  enablePrefetching: boolean,     // Preloading toggle
  transitionSpeed: string,        // 'fast'|'normal'|'slow'
  showLoadingIndicator: boolean,  // Loading bar toggle
  loadingStyle: string,          // 'default'|'gradient'|'neon'|'minimal'
  loadingHeight: number,         // 2-8 pixels
  hideLoadingCursor: boolean,    // Cursor behavior
  preloadThreshold: number,      // Hover delay (ms)
  cacheSize: number,            // Max cached pages
  debug: boolean,               // Debug mode
  isThemeEditor: boolean        // Theme editor detection
};
```

### Runtime Configuration
```javascript
// Update configuration at runtime
window.hydrogenConfig.transitionSpeed = 'slow';

// Apply changes (requires page reload for some settings)
window.location.reload();
```

---

## 🚀 Performance Metrics

### Automatic Measurements
```javascript
// Navigation performance
performance.measure('navigation-duration', startMarker, endMarker);

// Cache efficiency
const hitRate = (cacheHits / totalRequests) * 100;

// Memory usage
const memoryInfo = performance.memory;
```

### Manual Measurements
```javascript
// Measure custom operations
const startMarker = performance.mark('operation-start');
await performOperation();
const endMarker = performance.mark('operation-end');
performance.measure('operation', 'operation-start', 'operation-end');
```

### Metric Collection
```javascript
function getPerformanceMetrics() {
  return {
    navigation: performance.getEntriesByType('navigation')[0],
    paint: performance.getEntriesByType('paint'),
    measure: performance.getEntriesByType('measure'),
    memory: performance.memory,
    timing: performance.timing
  };
}
```

---

## 🔍 Error Handling

### Error Types
```javascript
// Navigation errors
try {
  await navigateToUrl(url);
} catch (error) {
  if (error.name === 'NetworkError') {
    // Handle network failure
    window.location.href = url; // Fallback
  }
}

// Cache errors
try {
  const content = await cache.match(request);
} catch (error) {
  console.warn('Cache error:', error);
  // Continue without cache
}

// Service Worker errors
navigator.serviceWorker.addEventListener('error', (error) => {
  console.error('Service Worker error:', error);
});
```

### Error Recovery
```javascript
// Automatic fallback to normal navigation
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason?.message?.includes('navigation')) {
    console.warn('Navigation failed, using fallback');
    window.location.href = event.reason.url;
    event.preventDefault();
  }
});
```

---

## 🧪 Testing Utilities

### Manual Testing Functions
```javascript
// Test navigation performance
async function testNavigation(url, iterations = 5) {
  const results = [];
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await window.hydrogenNav.navigateToUrl(url);
    const duration = performance.now() - start;
    results.push(duration);
  }
  return {
    average: results.reduce((a, b) => a + b) / results.length,
    min: Math.min(...results),
    max: Math.max(...results),
    results
  };
}

// Test cache effectiveness
function testCacheEffectiveness() {
  const debug = getNavigationDebug();
  return {
    hitRate: debug.cacheSize / (debug.cacheSize + debug.pendingRequests) * 100,
    cacheSize: debug.cacheSize,
    preloadedPages: debug.preloadedPages
  };
}

// Test loading bar styles
function testAllLoadingStyles() {
  const styles = ['default', 'gradient', 'neon', 'minimal'];
  styles.forEach((style, index) => {
    setTimeout(() => {
      console.log(`Testing ${style} style...`);
      testLoadingBar(1500);
    }, index * 2000);
  });
}
```

### Automated Testing
```javascript
// Performance regression testing
function performanceRegressionTest() {
  const baseline = {
    navigationSpeed: 50, // ms
    cacheHitRate: 80,    // %
    memoryUsage: 50      // MB
  };
  
  const current = {
    navigationSpeed: getAverageNavigationSpeed(),
    cacheHitRate: getCacheHitRate(),
    memoryUsage: getCurrentMemoryUsage()
  };
  
  Object.keys(baseline).forEach(metric => {
    const regression = ((current[metric] - baseline[metric]) / baseline[metric]) * 100;
    if (regression > 10) {
      console.warn(`⚠️ Performance regression in ${metric}: ${regression.toFixed(2)}%`);
    }
  });
}
```

---

*This API reference provides comprehensive documentation for all public methods, properties, and configurations available in the Hydrogen Performance System.*