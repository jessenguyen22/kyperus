# Troubleshooting Guide - Hydrogen Performance System

## 🚨 Quick Diagnostic Commands

### Essential Debug Commands
```javascript
// Check system status
getNavigationDebug()

// View current configuration  
console.table(window.hydrogenConfig)

// Test loading bar manually
testLoadingBar(3000)

// Clear cache and test
clearNavigationCache()

// Check for JavaScript errors
console.log(window.errors || 'No errors logged')
```

### System Health Check
```javascript
// Quick health check function
function systemHealthCheck() {
  const health = {
    navigationEnabled: !!window.hydrogenNav,
    configLoaded: !!window.hydrogenConfig,
    serviceWorkerActive: !!navigator.serviceWorker?.controller,
    cacheWorking: false,
    errorsPresent: false
  };
  
  // Test cache
  try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
    health.cacheWorking = true;
  } catch (e) {
    health.cacheWorking = false;
  }
  
  // Check for errors
  health.errorsPresent = window.console?.memory ? 
    performance.getEntriesByType('navigation')[0]?.loadEventEnd > 5000 : false;
  
  console.table(health);
  return health;
}

// Run health check
systemHealthCheck()
```

---

## 🔍 Common Issues & Solutions

### 1. Navigation Not Working

#### Symptoms
- Clicks lead to normal page loads
- No instant navigation
- Console shows "Navigation disabled"

#### Diagnostic Steps
```javascript
// Check if system is initialized
console.log('Navigation object:', window.hydrogenNav);
console.log('Configuration:', window.hydrogenConfig);

// Check theme editor status
console.log('Design mode:', window.Shopify?.designMode);
console.log('Editor class:', document.documentElement.classList.contains('shopify-design-mode'));
```

#### Solutions
```javascript
// Solution 1: Check theme settings
// Go to Customize → Hydrogen Performance → Enable Navigation

// Solution 2: Verify not in theme editor
if (window.Shopify?.designMode) {
  console.log('✅ Theme editor detected - this is normal behavior');
}

// Solution 3: Force enable for testing
localStorage.removeItem('hydrogen-navigation-disabled');
window.location.reload();

// Solution 4: Check browser support
if (!('fetch' in window)) {
  console.warn('Browser too old - missing fetch API');
}
```

### 2. Loading Bar Not Showing

#### Symptoms
- Navigation works but no visual feedback
- Loading bar setting enabled but not visible

#### Diagnostic Steps
```javascript
// Check loading bar configuration
console.log('Show loading:', window.hydrogenConfig?.showLoadingIndicator);
console.log('Loading style:', window.hydrogenConfig?.loadingStyle);

// Check if element exists
console.log('Loading element:', document.getElementById('instant-loading'));

// Test manually
testLoadingBar(2000);
```

#### Solutions
```css
/* Solution 1: Check CSS conflicts */
#instant-loading {
  z-index: 99999 !important;
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  pointer-events: none !important;
}

/* Solution 2: Force visibility for testing */
#instant-loading {
  opacity: 1 !important;
  visibility: visible !important;
  background: red !important; /* Temporary for debugging */
}
```

```javascript
// Solution 3: Manual creation
function createTestLoadingBar() {
  const existing = document.getElementById('instant-loading');
  if (existing) existing.remove();
  
  const indicator = document.createElement('div');
  indicator.id = 'instant-loading';
  indicator.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: red;
    z-index: 99999;
    opacity: 1;
  `;
  document.body.appendChild(indicator);
  
  setTimeout(() => indicator.remove(), 3000);
}

createTestLoadingBar();
```

### 3. Performance Issues

#### Symptoms
- Navigation slower than expected
- High memory usage
- Browser becomes unresponsive

#### Diagnostic Steps
```javascript
// Check cache size
const debug = getNavigationDebug();
console.log('Cache size:', debug.cacheSize);
console.log('Pending requests:', debug.pendingRequests);

// Monitor memory usage
console.log('Memory usage:', performance.memory);

// Check for memory leaks
setInterval(() => {
  console.log('Cache size over time:', window.hydrogenNav?.cache.size);
}, 5000);
```

#### Solutions
```javascript
// Solution 1: Clear cache if too large
if (window.hydrogenNav?.cache.size > 50) {
  clearNavigationCache();
  console.log('✅ Cache cleared due to size limit');
}

// Solution 2: Disable preloading temporarily
localStorage.setItem('disable-preloading', 'true');
window.location.reload();

// Solution 3: Check for infinite loops
const originalFetch = window.fetch;
let requestCount = 0;
window.fetch = function(...args) {
  requestCount++;
  if (requestCount > 100) {
    console.error('❌ Too many requests detected!');
    return Promise.reject(new Error('Request limit exceeded'));
  }
  return originalFetch.apply(this, args);
};
```

### 4. Service Worker Issues

#### Symptoms
- Cache not working
- Offline functionality missing
- Console errors about Service Worker

#### Diagnostic Steps
```javascript
// Check Service Worker status
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('SW registrations:', registrations.length);
  registrations.forEach(reg => {
    console.log('SW state:', reg.active?.state);
    console.log('SW scope:', reg.scope);
  });
});

// Check cache storage
caches.keys().then(cacheNames => {
  console.log('Available caches:', cacheNames);
  cacheNames.forEach(name => {
    caches.open(name).then(cache => {
      cache.keys().then(keys => {
        console.log(`Cache ${name} has ${keys.length} entries`);
      });
    });
  });
});
```

#### Solutions
```javascript
// Solution 1: Unregister and re-register Service Worker
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(registration => {
    registration.unregister().then(() => {
      console.log('✅ Service Worker unregistered');
      window.location.reload();
    });
  });
});

// Solution 2: Clear all caches
caches.keys().then(cacheNames => {
  return Promise.all(
    cacheNames.map(cacheName => caches.delete(cacheName))
  );
}).then(() => {
  console.log('✅ All caches cleared');
  window.location.reload();
});

// Solution 3: Force update Service Worker
navigator.serviceWorker.register('/assets/service-worker.js', {
  updateViaCache: 'none'
}).then(registration => {
  registration.update();
  console.log('✅ Service Worker update triggered');
});
```

### 5. Theme Editor Conflicts

#### Symptoms
- Customizer not loading properly
- Sections not updating
- Editor interface broken

#### Diagnostic Steps
```javascript
// Check if in theme editor
console.log('Design mode:', window.Shopify?.designMode);
console.log('Preview theme:', window.location.search.includes('preview_theme_id'));
console.log('A/B test:', window.location.search.includes('_ab='));

// Check navigation status in editor
console.log('Navigation should be disabled:', 
  window.hydrogenNav?.shouldEnableNavigation() === false);
```

#### Solutions
```javascript
// Solution 1: Force disable navigation in editor
if (window.Shopify?.designMode) {
  if (window.hydrogenNav) {
    window.hydrogenNav = null;
  }
  console.log('✅ Navigation disabled for theme editor');
}

// Solution 2: Check for editor-specific CSS
document.body.classList.add('theme-editor-debug');
```

```css
/* Add to CSS for debugging */
.theme-editor-debug::before {
  content: 'THEME EDITOR MODE';
  position: fixed;
  top: 10px;
  right: 10px;
  background: red;
  color: white;
  padding: 5px;
  z-index: 999999;
}
```

---

## 🛠️ Advanced Debugging

### 1. Network Request Monitoring

```javascript
// Monitor all fetch requests
const originalFetch = window.fetch;
const requests = [];

window.fetch = function(...args) {
  const request = {
    url: args[0],
    timestamp: Date.now(),
    options: args[1]
  };
  requests.push(request);
  
  console.log('🌐 Fetch request:', request.url);
  
  return originalFetch.apply(this, args).then(response => {
    console.log('✅ Fetch response:', request.url, response.status);
    return response;
  }).catch(error => {
    console.error('❌ Fetch error:', request.url, error);
    throw error;
  });
};

// View all requests
console.table(requests);
```

### 2. Performance Profiling

```javascript
// Profile navigation performance
function profileNavigation(url) {
  const startTime = performance.now();
  const startMarker = performance.mark('nav-start');
  
  window.hydrogenNav.navigateToUrl(url).then(() => {
    const endTime = performance.now();
    const endMarker = performance.mark('nav-end');
    
    performance.measure('navigation', 'nav-start', 'nav-end');
    
    console.log(`Navigation to ${url} took ${endTime - startTime}ms`);
    
    // Get detailed timing
    const entries = performance.getEntriesByType('measure');
    console.table(entries);
  });
}

// Profile specific navigation
profileNavigation('/products/example');
```

### 3. Cache Analysis

```javascript
// Analyze cache effectiveness
function analyzeCachePerformance() {
  const debug = getNavigationDebug();
  const analysis = {
    cacheSize: debug.cacheSize,
    preloadedPages: debug.preloadedPages,
    hitRate: 0,
    averageLoadTime: 0
  };
  
  // Calculate hit rate (simplified)
  const totalRequests = debug.cacheEntries.length + debug.pendingEntries.length;
  analysis.hitRate = totalRequests > 0 ? 
    (debug.cacheEntries.length / totalRequests * 100).toFixed(2) + '%' : '0%';
  
  console.table(analysis);
  return analysis;
}

analyzeCachePerformance();
```

---

## 🔧 Recovery Procedures

### Emergency Disable
```javascript
// Complete system disable
function emergencyDisable() {
  // Disable navigation
  localStorage.setItem('hydrogen-navigation-disabled', 'true');
  
  // Unregister service worker
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(reg => reg.unregister());
  });
  
  // Clear all caches
  caches.keys().then(cacheNames => {
    cacheNames.forEach(name => caches.delete(name));
  });
  
  // Remove from DOM
  const indicator = document.getElementById('instant-loading');
  if (indicator) indicator.remove();
  
  // Clean up classes
  document.body.classList.remove('page-loading', 'page-loading-brief');
  
  console.log('🚨 Emergency disable completed - refresh page');
}

// Run emergency disable
emergencyDisable();
```

### System Reset
```javascript
// Complete system reset
function resetHydrogenSystem() {
  // Clear all local storage related to hydrogen
  Object.keys(localStorage).forEach(key => {
    if (key.includes('hydrogen') || key.includes('navigation')) {
      localStorage.removeItem(key);
    }
  });
  
  // Clear session storage
  Object.keys(sessionStorage).forEach(key => {
    if (key.includes('hydrogen') || key.includes('navigation')) {
      sessionStorage.removeItem(key);
    }
  });
  
  // Clear caches
  caches.keys().then(cacheNames => {
    return Promise.all(
      cacheNames.map(name => caches.delete(name))
    );
  }).then(() => {
    console.log('✅ System reset complete - refresh page');
    window.location.reload();
  });
}

// Run system reset
resetHydrogenSystem();
```

---

## 📊 Performance Debugging

### Core Web Vitals Monitoring
```javascript
// Monitor Core Web Vitals in real-time
function monitorCoreWebVitals() {
  // LCP
  new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.entryType === 'largest-contentful-paint') {
        console.log('LCP:', entry.startTime);
      }
    });
  }).observe({entryTypes: ['largest-contentful-paint']});
  
  // FID
  new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      console.log('FID:', entry.processingStart - entry.startTime);
    });
  }).observe({entryTypes: ['first-input']});
  
  // CLS
  let clsValue = 0;
  new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (!entry.hadRecentInput) {
        clsValue += entry.value;
        console.log('CLS:', clsValue);
      }
    });
  }).observe({entryTypes: ['layout-shift']});
}

monitorCoreWebVitals();
```

### Memory Leak Detection
```javascript
// Monitor for memory leaks
let memoryCheckInterval;

function startMemoryMonitoring() {
  let initialMemory = performance.memory?.usedJSHeapSize || 0;
  let checkCount = 0;
  
  memoryCheckInterval = setInterval(() => {
    checkCount++;
    const currentMemory = performance.memory?.usedJSHeapSize || 0;
    const memoryIncrease = currentMemory - initialMemory;
    
    console.log(`Memory check ${checkCount}:`, {
      current: Math.round(currentMemory / 1024 / 1024) + 'MB',
      increase: Math.round(memoryIncrease / 1024 / 1024) + 'MB',
      cacheSize: window.hydrogenNav?.cache.size || 0
    });
    
    // Alert if memory increased significantly
    if (memoryIncrease > 50 * 1024 * 1024) { // 50MB increase
      console.warn('⚠️ Potential memory leak detected!');
      console.log('Consider running: clearNavigationCache()');
    }
  }, 10000); // Check every 10 seconds
}

// Start monitoring
startMemoryMonitoring();

// Stop monitoring
function stopMemoryMonitoring() {
  clearInterval(memoryCheckInterval);
  console.log('Memory monitoring stopped');
}
```

---

## 📱 Mobile-Specific Issues

### Touch Event Debugging
```javascript
// Debug touch events
function debugTouchEvents() {
  let touchStartTime = 0;
  
  document.addEventListener('touchstart', (e) => {
    touchStartTime = performance.now();
    console.log('👆 Touch start:', e.target);
  });
  
  document.addEventListener('touchend', (e) => {
    const duration = performance.now() - touchStartTime;
    console.log('👆 Touch end:', duration + 'ms', e.target);
  });
  
  document.addEventListener('click', (e) => {
    console.log('🖱️ Click after touch:', e.target);
  });
}

debugTouchEvents();
```

### Viewport Debugging
```javascript
// Check viewport issues
function checkViewport() {
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio,
    orientation: screen.orientation?.type || 'unknown'
  };
  
  console.table(viewport);
  
  // Check for viewport changes
  window.addEventListener('resize', () => {
    console.log('📱 Viewport changed:', window.innerWidth, 'x', window.innerHeight);
  });
  
  return viewport;
}

checkViewport();
```

---

## 🆘 When All Else Fails

### Contact Information & Resources
1. **Check Browser Console** for error messages
2. **Test in Incognito Mode** to rule out extensions
3. **Try Different Browser** to isolate browser-specific issues
4. **Check Network Tab** in DevTools for failed requests
5. **Disable Browser Extensions** that might interfere

### Creating Bug Reports
When reporting issues, include:
```javascript
// Collect system information
function collectSystemInfo() {
  const info = {
    userAgent: navigator.userAgent,
    url: window.location.href,
    timestamp: new Date().toISOString(),
    navigation: getNavigationDebug(),
    config: window.hydrogenConfig,
    errors: window.console?.memory || 'Not available',
    performance: {
      navigation: performance.getEntriesByType('navigation')[0],
      memory: performance.memory
    }
  };
  
  console.log('📋 System info for bug report:');
  console.log(JSON.stringify(info, null, 2));
  
  return info;
}

// Generate bug report
collectSystemInfo();
```

### Safe Mode Operation
```javascript
// Run in safe mode (minimal features)
function enableSafeMode() {
  localStorage.setItem('hydrogen-safe-mode', 'true');
  
  // Disable advanced features
  if (window.hydrogenConfig) {
    window.hydrogenConfig.enablePrefetching = false;
    window.hydrogenConfig.enableServiceWorker = false;
    window.hydrogenConfig.showLoadingIndicator = false;
  }
  
  console.log('🛡️ Safe mode enabled - basic navigation only');
  window.location.reload();
}

// Enable safe mode
enableSafeMode();

// Disable safe mode
function disableSafeMode() {
  localStorage.removeItem('hydrogen-safe-mode');
  console.log('✅ Safe mode disabled');
  window.location.reload();
}
```

---

*This troubleshooting guide covers the most common issues and provides step-by-step solutions for diagnosing and fixing problems with the Hydrogen performance system.*