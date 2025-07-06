# Development Rules & Guidelines - Kyperus Theme

## 🎯 Core Development Principles

### 1. Performance First Philosophy
- **Every feature must improve or maintain performance**
- **Measure before implementing** - Use performance.mark() and performance.measure()
- **Bundle size matters** - Minimize JavaScript/CSS payload
- **Progressive enhancement always** - Core functionality works without JS

### 2. Shopify Ecosystem Compatibility
- **Theme Editor is sacred** - Never break customizer functionality
- **Liquid integration required** - All settings must be configurable via theme customizer
- **Section compatibility** - Work with all Dawn sections and custom sections
- **App compatibility** - Don't interfere with Shopify apps

### 3. Error Resilience & Graceful Degradation
- **Assume failures will happen** - Network, browser, user errors
- **Always provide fallbacks** - Normal navigation if instant fails
- **No broken experiences** - Degrade gracefully, never crash
- **User control paramount** - Always allow disabling features

---

## 📁 File Organization Rules

### Directory Structure Standards
```
assets/
├── hydrogen-*.js          # Navigation system files
├── hydrogen-*.css         # Performance-related styles
├── performance-*.js       # Optimization modules
└── service-worker.js      # Caching strategies

snippets/
├── hydrogen-*.liquid      # Configuration bridges
└── performance-*.liquid   # Optimization helpers

docs/
├── *.md                   # All documentation in markdown
└── guides/               # Detailed implementation guides
```

### Naming Conventions
- **Files**: kebab-case (hydrogen-navigation.js)
- **Classes**: PascalCase (HydrogenNavigation)
- **Functions**: camelCase (shouldEnableNavigation)
- **Constants**: SCREAMING_SNAKE_CASE (MAX_CACHE_SIZE)
- **CSS**: BEM methodology (.loading-bar__progress--active)

### File Size Guidelines
- **JavaScript files**: Max 600 lines per file
- **CSS files**: Max 300 lines per file
- **Liquid files**: Max 150 lines per file
- **Split large files** into logical modules

---

## 🔧 Code Architecture Rules

### 1. JavaScript Architecture

#### Class Design Principles
```javascript
class FeatureName {
  constructor() {
    // Initialize state only
    this.cache = new Map();
    this.isActive = false;
    this.init();
  }

  init() {
    // Setup logic here
    if (!this.shouldEnable()) return;
    this.setupEventListeners();
  }

  shouldEnable() {
    // Always check if feature should be enabled
    return !designMode && settingsEnabled && browserSupported;
  }
}
```

#### Error Handling Pattern
```javascript
async function riskyOperation() {
  try {
    const result = await dangerousCall();
    return result;
  } catch (error) {
    console.warn('Operation failed, using fallback:', error);
    return fallbackSolution();
  }
}
```

#### Memory Management
```javascript
// Always implement cleanup
class CacheManager {
  constructor() {
    this.cache = new Map();
    this.maxSize = 50;
  }

  set(key, value) {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }
}
```

### 2. CSS Architecture

#### Performance-First CSS
```css
/* Use custom properties for theme integration */
:root {
  --feature-speed: {{ settings.speed | json }}ms;
  --feature-color: rgb(var(--color-button));
}

/* Optimize for 60fps animations */
.animated-element {
  will-change: transform;
  transform: translateZ(0); /* Force GPU layer */
}

/* Progressive enhancement */
@supports (view-transition-name: main) {
  /* Modern browser features */
}
```

#### Mobile-First Approach
```css
/* Base styles for mobile */
.component {
  font-size: 14px;
}

/* Enhanced for larger screens */
@media screen and (min-width: 750px) {
  .component {
    font-size: 16px;
  }
}
```

### 3. Liquid Template Rules

#### Settings Integration Pattern
```liquid
{% comment %}
  Always check settings before loading features
{% endcomment %}
{% if settings.enable_feature %}
  <script src="{{ 'feature.js' | asset_url }}"></script>
{% endif %}

{% comment %}
  Provide default values for all settings
{% endcomment %}
{{ settings.option | default: 'fallback-value' | json }}
```

#### Configuration Bridge Pattern
```liquid
<script>
  window.featureConfig = {
    enabled: {{ settings.enable_feature | default: false | json }},
    option: {{ settings.option | default: 'default' | json }},
    isEditor: {{ request.design_mode | json }}
  };
</script>
```

---

## 🎮 Feature Development Workflow

### 1. Planning Phase (Required)
- [ ] **Performance Impact Assessment** - Will this improve or maintain speed?
- [ ] **Theme Editor Compatibility Check** - How will this work in customizer?
- [ ] **Mobile Optimization Plan** - How will this work on mobile devices?
- [ ] **Fallback Strategy** - What happens when this fails?
- [ ] **Browser Support Matrix** - Which browsers will this support?

### 2. Implementation Phase

#### Always Start With Detection
```javascript
shouldEnableFeature() {
  // Theme editor check
  if (window.Shopify?.designMode) return false;
  
  // Settings check
  if (!window.config?.enableFeature) return false;
  
  // Browser support check
  if (!('requiredAPI' in window)) return false;
  
  // User preference check
  if (localStorage.getItem('feature-disabled')) return false;
  
  return true;
}
```

#### Progressive Enhancement Pattern
```javascript
class NewFeature {
  constructor() {
    this.enhancementLevel = this.detectCapabilities();
    this.init();
  }

  detectCapabilities() {
    if ('modernAPI' in window) return 'advanced';
    if ('basicAPI' in window) return 'basic';
    return 'fallback';
  }

  init() {
    switch (this.enhancementLevel) {
      case 'advanced':
        this.setupAdvancedFeatures();
        // fallthrough
      case 'basic':
        this.setupBasicFeatures();
        // fallthrough
      case 'fallback':
        this.setupFallback();
        break;
    }
  }
}
```

### 3. Testing Requirements (Mandatory)

#### Browser Testing Checklist
- [ ] **Chrome** (latest 2 versions)
- [ ] **Firefox** (latest 2 versions)
- [ ] **Safari** (latest 2 versions)
- [ ] **Edge** (latest 2 versions)
- [ ] **Mobile Safari** (iOS)
- [ ] **Chrome Mobile** (Android)

#### Functionality Testing
- [ ] **Theme Editor** - Feature disabled, no conflicts
- [ ] **Settings Toggle** - All combinations work
- [ ] **JavaScript Disabled** - Core functionality intact
- [ ] **Slow Network** - Graceful timeouts
- [ ] **Error Scenarios** - Fallbacks triggered correctly

#### Performance Testing
- [ ] **Core Web Vitals** - No regression in LCP, FID, CLS
- [ ] **Bundle Size** - Total JavaScript under 100KB
- [ ] **Memory Usage** - No memory leaks detected
- [ ] **Cache Efficiency** - Hit rate above 80%

---

## 🚫 Strict Prohibitions

### Never Do These Things
1. **❌ Break Theme Editor** - Any feature that conflicts with customizer
2. **❌ Assume JavaScript Enabled** - Core features must work without JS
3. **❌ Ignore Settings** - All features must be toggleable
4. **❌ Hardcode Values** - Use theme settings and CSS custom properties
5. **❌ Block Main Thread** - Use async/await and web workers for heavy tasks
6. **❌ Ignore Errors** - Always handle and log errors gracefully
7. **❌ Skip Fallbacks** - Every feature needs a degradation path
8. **❌ Forget Mobile** - Test on actual mobile devices
9. **❌ Ignore Performance** - Monitor impact on Core Web Vitals
10. **❌ Remove Features** - Only add features, never break existing ones

### Code Quality Violations
```javascript
// ❌ BAD: No error handling
const data = await fetch('/api/data').then(r => r.json());

// ✅ GOOD: Proper error handling
try {
  const response = await fetch('/api/data');
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  return data;
} catch (error) {
  console.warn('API call failed, using fallback:', error);
  return fallbackData;
}
```

```javascript
// ❌ BAD: No theme editor check
class NewFeature {
  constructor() {
    this.interceptAllClicks(); // Breaks theme editor!
  }
}

// ✅ GOOD: Proper detection
class NewFeature {
  constructor() {
    if (this.shouldEnable()) {
      this.interceptClicks();
    }
  }
  
  shouldEnable() {
    return !window.Shopify?.designMode;
  }
}
```

---

## 📊 Performance Standards

### Required Metrics
- **Page Navigation**: < 100ms (target: < 50ms)
- **First Contentful Paint**: < 2.5s
- **Largest Contentful Paint**: < 2.5s
- **First Input Delay**: < 100ms
- **Cumulative Layout Shift**: < 0.1

### Bundle Size Limits
- **Critical JavaScript**: < 50KB gzipped
- **Total JavaScript**: < 100KB gzipped
- **Critical CSS**: < 20KB gzipped
- **Total CSS**: < 50KB gzipped

### Cache Targets
- **Static Assets**: 95% hit rate
- **Page Content**: 80% hit rate
- **API Responses**: 70% hit rate

### Memory Guidelines
- **Cache Size**: Max 50 pages in memory
- **Event Listeners**: Always cleanup on disconnect
- **Timers**: Clear all setTimeout/setInterval
- **Objects**: Null references when done

---

## 🔧 Debug & Development Tools

### Required Debug Functions
```javascript
// Every feature must expose debug info
window.getFeatureDebug = () => {
  return {
    enabled: feature.isEnabled(),
    status: feature.getStatus(),
    metrics: feature.getMetrics(),
    errors: feature.getErrors()
  };
};

// Testing functions for manual validation
window.testFeature = (options) => {
  return feature.runTest(options);
};

// User control functions
window.disableFeature = () => feature.disable();
window.enableFeature = () => feature.enable();
```

### Console Logging Standards
```javascript
// Use emoji prefixes for easy scanning
console.log('🚀 Feature initialized');
console.log('⚙️ Settings loaded:', config);
console.log('🔄 Processing started');
console.log('✅ Task completed');
console.warn('⚠️ Non-critical issue:', warning);
console.error('❌ Critical error:', error);
```

### Performance Monitoring
```javascript
// Always measure performance impact
const startMarker = performance.mark('feature-start');
await doWork();
const endMarker = performance.mark('feature-end');
performance.measure('feature-duration', 'feature-start', 'feature-end');
```

---

## 🎨 UI/UX Standards

### Loading States
- **Always provide visual feedback** for operations > 100ms
- **Use realistic progress** (0% → 85% → 100%)
- **Match brand aesthetics** with theme colors
- **Respect user preferences** (prefers-reduced-motion)

### Accessibility Requirements
```css
/* Respect motion preferences */
@media (prefers-reduced-motion: reduce) {
  .animated-element {
    animation: none;
    transition: none;
  }
}

/* Maintain focus management */
.hidden-content {
  clip: rect(0 0 0 0);
  clipPath: inset(50%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  white-space: nowrap;
  width: 1px;
}
```

### Mobile Optimization
- **Touch targets**: Minimum 44px × 44px
- **Hover effects**: Use @media (hover: hover)
- **Performance**: 60fps animations on mobile
- **Network**: Handle slow connections gracefully

---

## 📚 Documentation Requirements

### Code Documentation
```javascript
/**
 * Fetch page content with caching and deduplication
 * @param {string} url - Target URL to fetch
 * @param {Object} options - Fetch options
 * @param {boolean} options.useCache - Whether to use cache
 * @returns {Promise<Object>} Page content object
 * @throws {Error} When network request fails
 * @example
 * const content = await fetchPage('/products/example', { useCache: true });
 */
async function fetchPage(url, options = {}) {
  // Implementation
}
```

### Feature Documentation
Each feature must include:
- **Purpose**: What problem does this solve?
- **Implementation**: How does it work?
- **Configuration**: What settings are available?
- **Testing**: How to test functionality?
- **Troubleshooting**: Common issues and solutions

### README Updates
Update main documentation when adding:
- New files or major features
- New configuration options
- Breaking changes or deprecations
- Performance improvements or regressions

---

## 🔄 Maintenance & Updates

### Regular Maintenance Tasks
- **Performance Audits**: Monthly Core Web Vitals checks
- **Browser Testing**: Test with new browser versions
- **Cache Cleanup**: Review and optimize cache strategies
- **Error Monitoring**: Check for new error patterns
- **Settings Validation**: Ensure all theme settings work

### Update Procedures
1. **Backup Current Theme** before any changes
2. **Test in Development** environment first
3. **Performance Benchmark** before and after
4. **Browser Compatibility** check
5. **Theme Editor Validation** 
6. **Documentation Updates** as needed

### Deprecation Process
1. **Mark as deprecated** with console warnings
2. **Provide migration path** in documentation
3. **Maintain backward compatibility** for 2 versions
4. **Remove after notice period** with clear communication

---

## 🚀 Deployment Guidelines

### Pre-Deployment Checklist
- [ ] All tests pass in multiple browsers
- [ ] Performance metrics within targets
- [ ] Theme editor functionality verified
- [ ] Settings work in all combinations
- [ ] Error scenarios handled gracefully
- [ ] Documentation updated
- [ ] Debug functions working

### Deployment Process
1. **Staging Deployment** - Test with real data
2. **Performance Validation** - Confirm metrics
3. **User Acceptance Testing** - Gather feedback
4. **Production Deployment** - Deploy during low traffic
5. **Monitor Metrics** - Watch for issues
6. **Rollback Plan** - Ready if needed

### Post-Deployment Monitoring
- **Error Rates**: Watch for new error patterns
- **Performance Metrics**: Monitor Core Web Vitals
- **User Feedback**: Check for reported issues
- **Cache Efficiency**: Verify cache hit rates
- **Browser Analytics**: Track browser compatibility

---

## 💡 Innovation Guidelines

### When Adding New Features
1. **Solve Real Problems** - Address actual user pain points
2. **Measure Impact** - Quantify improvements
3. **Start Small** - MVP approach with iterative improvement
4. **User Control** - Always allow disabling
5. **Performance Budget** - Stay within limits

### Experimental Features
- **Feature Flags**: Use settings to enable/disable
- **A/B Testing**: Compare with existing implementation
- **Gradual Rollout**: Test with subset of users
- **Monitoring**: Extra attention to metrics
- **Rollback Plan**: Quick disable mechanism

### Technology Adoption
- **Proven Technologies**: Use stable, well-supported APIs
- **Progressive Enhancement**: Layer new tech on solid foundation
- **Browser Support**: Maintain compatibility matrix
- **Polyfills**: Provide fallbacks for older browsers
- **Performance**: Ensure new tech improves experience

---

*These rules ensure consistent, high-quality development that maintains the performance and reliability standards established in the Kyperus theme optimization project.*