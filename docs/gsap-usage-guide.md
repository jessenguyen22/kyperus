# GSAP Animation System v2.0 - Hydrogen Integrated

## 🎯 Overview

The new GSAP Animation System is fully integrated with Hydrogen Navigation, providing seamless animations that work across SPA-like page transitions. The system automatically handles cleanup and reinitialization when navigating between pages.

## 🚀 Key Features

- **Hydrogen Navigation Compatible**: Auto-reinitializes on page transitions
- **Smart Cleanup**: Prevents memory leaks and performance issues
- **Optimized Performance**: Batched DOM updates and efficient timelines
- **Easy Extension**: Clear structure for adding new animations
- **Debug Tools**: Comprehensive debugging and monitoring
- **Responsive Design**: Automatic breakpoint handling

## 📁 Architecture

### Core Files
- `assets/gsap-custom.js` - Main animation manager (edit this file)
- `assets/gsap-custom.css` - Supporting CSS styles
- `assets/hydrogen-navigation.js` - Navigation system integration

### Class Structure
```javascript
class GSAPAnimationManager {
  // Properties
  animations: Map     // Track animations by name
  timelines: Map      // Track timelines for cleanup
  scrollTriggers: []  // Track ScrollTriggers for cleanup
  isInitialized: boolean
  debugMode: boolean

  // Core Methods
  init()                    // Initialize system
  registerAnimations()      // Register all animations
  cleanup()                 // Clean up before reinit
  reinitializeAnimations()  // Handle page transitions
}
```

## 🔄 How It Works

### Initial Load
1. GSAP Manager initializes on `DOMContentLoaded`
2. All animations are registered and started
3. ScrollTriggers are created and tracked

### Page Transition (Hydrogen Navigation)
1. User clicks a link → Hydrogen Navigation intercepts
2. New page content is fetched and updated
3. `page:loaded` event is dispatched
4. GSAP Manager automatically:
   - Cleans up old animations
   - Resets element properties
   - Reinitializes all animations
   - Refreshes ScrollTriggers

### Visual Flow
```
Page Load → Initialize GSAP → Animations Running
    ↓
User Clicks Link → Hydrogen Navigation → Fetch New Content
    ↓
Replace DOM → Cleanup Old Animations → Reinitialize → New Animations
```

## 🎬 Current Animations

### 1. Hero Mask Animation
- **Target**: `.hero-section`
- **Effect**: Mask transition with fade and scale effects
- **Trigger**: Scroll from top
- **Responsive**: Different mask sizes for mobile/tablet/desktop

### 2. Intro Reveal Animation  
- **Target**: `.entrance-message`
- **Effect**: Radial mask reveal with opacity transition
- **Trigger**: Scroll-based reveal
- **Synchronized**: With hero section timing

### 3. Video Scroll Animation
- **Target**: `.kpr-video-wrapper`
- **Effect**: Video scrubbing with scroll position
- **Features**: Auto-pause, timeline control
- **Multiple**: Handles multiple video instances

### 4. Modern Concept Animation
- **Target**: `.modern-concept`
- **Effect**: Fade out previous sections
- **Trigger**: Element enters viewport

## 🛠️ Adding New Animations

### Step 1: Create Animation Method
Copy the template in `gsap-custom.js`:

```javascript
newProductCardAnimation() {
  const productCards = document.querySelectorAll('.product-card');
  if (!productCards.length) {
    this.log('Product cards not found, skipping animation');
    return;
  }
  
  // Set initial state
  gsap.set(productCards, { 
    opacity: 0, 
    y: 50,
    scale: 0.9
  });
  
  // Create timeline
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '.product-grid',
      start: 'top 80%',
      end: 'bottom 20%',
      toggleActions: 'play none none reverse'
    }
  });

  // Add animations
  tl.to(productCards, { 
    opacity: 1, 
    y: 0,
    scale: 1,
    duration: 0.6,
    stagger: 0.1,
    ease: 'power2.out' 
  });

  // Register for tracking
  this.registerAnimation('productCards', tl, tl.scrollTrigger);
}
```

### Step 2: Register in System
Add to `registerAnimations()` method:

```javascript
registerAnimations() {
  // ... existing animations
  this.heroMaskAnimation();
  this.introRevealAnimation();
  this.videoScrollAnimation();
  this.modernConceptAnimation();
  
  // Add your new animation
  this.newProductCardAnimation();
  
  this.log(`Registered ${this.animations.size} animations`);
}
```

### Step 3: Add Reset Logic (if needed)
If your animation modifies elements that need reset, add to `resetElements()`:

```javascript
resetElements() {
  const elementsToReset = [
    '.hero-section',
    '.entrance-message', 
    '.kpr-video-wrapper',
    '.modern-concept',
    '.product-card'  // Add your elements
  ];
  // ... rest of method
}
```

## 🎨 XO Builder Integration

### Method 1: CSS Classes
In XO Builder, add CSS classes to elements:

```css
/* Add these classes to your XO Builder elements */
.gsap-fade-up    /* Will be animated by system */
.gsap-scale-in   /* Will be animated by system */
.gsap-slide-left /* Will be animated by system */
```

### Method 2: Target Specific Sections
Use XO Builder's custom CSS class feature:

1. In XO Builder, add class: `my-custom-section`
2. Create animation targeting `.my-custom-section`
3. Register in `registerAnimations()`

### Method 3: Data Attributes
Add custom attributes in XO Builder:

```html
<div data-gsap="product-reveal">Content</div>
```

Then create animations that target `[data-gsap="product-reveal"]`.

## 🔧 Performance Optimization

### Best Practices Implemented
- **Batched DOM Updates**: Using `gsap.set()` for multiple properties
- **Efficient Selectors**: Cache elements, use specific selectors
- **Memory Management**: Proper cleanup and garbage collection
- **Timeline Optimization**: Reuse timelines, avoid unnecessary complexity
- **ScrollTrigger Efficiency**: Minimal trigger recalculation

### Responsive Handling
```javascript
getMaskSettings() {
  const width = window.innerWidth;
  const settings = {
    mobile: { condition: width <= 768, /* settings */ },
    tablet: { condition: width <= 1024, /* settings */ },
    desktop: { /* default settings */ }
  };
  // Auto-select based on screen size
}
```

## 🐛 Debugging Tools

### Console Commands
```javascript
// Check system status
window.gsapDebug.status()

// Enable debug logging
window.gsapDebug.log(true)

// Refresh all animations
window.gsapDebug.refresh()

// Force reinitialize
window.gsapDebug.reinit()

// Destroy all animations
window.gsapDebug.destroy()

// Legacy commands (still work)
window.refreshAnimations()
window.destroyAnimations()
```

### Debug Output Example
```javascript
🎬 GSAP Manager: Initializing animations...
🎬 GSAP Manager: Registered animation: heroMask
🎬 GSAP Manager: Registered animation: introReveal
🎬 GSAP Manager: Registered animation: videoScroll_0
🎬 GSAP Manager: Registered animation: modernConcept
🎬 GSAP Manager: Registered 4 animations
```

### Status Information
```javascript
window.gsapDebug.status()
// Returns:
{
  initialized: true,
  animations: 4,
  timelines: 4,
  scrollTriggers: 4
}
```

## 🎯 Timeline Optimization Examples

### Before (Inefficient)
```javascript
gsap.to('.element1', { opacity: 1, duration: 1 });
gsap.to('.element2', { opacity: 1, duration: 1, delay: 0.5 });
gsap.to('.element3', { opacity: 1, duration: 1, delay: 1 });
```

### After (Optimized)
```javascript
const tl = gsap.timeline();
tl.to(['.element1', '.element2', '.element3'], { 
  opacity: 1, 
  duration: 1, 
  stagger: 0.5 
});
```

## 🔄 Hydrogen Navigation Integration

### Event Flow
```javascript
// Navigation happens
document.dispatchEvent(new CustomEvent('page:loaded', {
  detail: { 
    navigation: 'instant',
    timestamp: Date.now(),
    url: window.location.href
  }
}));

// GSAP Manager responds
reinitializeAnimations() {
  this.cleanup();        // Kill old animations
  setTimeout(() => {
    this.registerAnimations(); // Create new ones
  }, 50);
}
```

### Timing Considerations
- **DOM Stability**: 16ms delay ensures DOM is stable
- **Animation Cleanup**: All previous animations are properly destroyed
- **ScrollTrigger Refresh**: Automatic refresh after initialization
- **Performance**: Minimal impact on navigation speed

## 🚨 Common Issues & Solutions

### Issue: Animations don't restart after navigation
**Solution**: Already fixed with new system - animations auto-reinitialize

### Issue: ScrollTrigger positions are wrong
**Solution**: Automatic `ScrollTrigger.refresh()` is called after reinit

### Issue: Memory leaks with animations
**Solution**: Comprehensive cleanup system destroys all timelines and triggers

### Issue: Animations conflict with each other
**Solution**: Each animation is properly tracked and managed independently

## 📱 Mobile Optimization

### Automatic Optimizations
- Reduced motion support via `prefers-reduced-motion`
- Shorter stagger delays on mobile
- Hardware acceleration enabled
- Touch-friendly interaction zones

### Responsive Breakpoints
```javascript
// Automatic responsive handling
const settings = this.getMaskSettings(); // Auto-detects screen size
gsap.set(element, settings); // Applies appropriate settings
```

## 🎓 Advanced Usage

### Custom Timeline Creation
```javascript
createComplexAnimation() {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '.complex-section',
      start: 'top center',
      end: 'bottom center',
      scrub: 1,
      onUpdate: self => {
        // Custom logic during animation
        const progress = self.progress;
        this.updateCustomLogic(progress);
      }
    }
  });
  
  tl.to('.element1', { x: 100, duration: 1 })
    .to('.element2', { rotation: 360, duration: 0.5 }, '<')
    .to('.element3', { scale: 2, duration: 0.8 }, '-=0.3');
    
  this.registerAnimation('complex', tl, tl.scrollTrigger);
}
```

### Dynamic Animation Creation
```javascript
createDynamicAnimation(selector, options) {
  const elements = document.querySelectorAll(selector);
  if (!elements.length) return;
  
  const tl = gsap.timeline(options.timeline || {});
  tl.fromTo(elements, options.from, options.to);
  
  this.registerAnimation(options.name, tl, tl.scrollTrigger);
}
```

This system provides a robust, performance-optimized, and maintainable solution for complex scroll-based animations that work seamlessly with modern SPA navigation.