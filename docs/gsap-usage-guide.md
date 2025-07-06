# GSAP Animation Guide for XO Builder

## 🎯 Overview

This guide explains how to use GSAP animations with XO Builder elements in your Shopify theme. The system allows you to add custom animations without modifying XO-generated files.

## 📁 Files Created

- `assets/gsap-custom.js` - Main animation logic (edit this file)
- `assets/gsap-custom.css` - Supporting CSS styles
- GSAP CDN loaded in `theme.liquid`

## 🎬 How to Use

### Method 1: CSS Classes

Add these classes to your XO Builder elements:

#### Fade Animations
```html
<div class="gsap-fade-in">Fades in on scroll</div>
<div class="gsap-fade-up">Fades in from bottom</div>
<div class="gsap-fade-down">Fades in from top</div>
```

#### Slide Animations
```html
<div class="gsap-slide-left">Slides in from left</div>
<div class="gsap-slide-right">Slides in from right</div>
```

#### Scale Animations
```html
<div class="gsap-scale-in">Scales in with bounce</div>
<div class="gsap-scale-hover">Scales up on hover</div>
```

#### Other Animations
```html
<div class="gsap-rotate-in">Rotates in</div>
<div class="gsap-stagger">
  <div>Child 1</div>
  <div>Child 2</div>
  <div>Child 3</div>
</div>
```

### Method 2: Data Attributes

Use `data-gsap` attribute for cleaner markup:

```html
<div data-gsap="fade-in">Content here</div>
<div data-gsap="slide-left">Content here</div>
<div data-gsap="scale-in">Content here</div>
<div data-gsap="hero">Hero section</div>
<div data-gsap="product">Product card</div>
```

## 🔧 XO Builder Integration

### Step 1: In XO Builder
1. Create your section/element
2. Add a **Custom CSS Class** or **Custom Attribute**
3. Use one of these approaches:

**Option A: CSS Class**
- Add class: `gsap-fade-up` 

**Option B: Data Attribute**
- Add attribute: `data-gsap="fade-up"`

**Option C: Custom Naming**
- Add class: `hero-section` 
- Then add animation in `gsap-custom.js`

### Step 2: Custom Animations

Edit `assets/gsap-custom.js` and add to the `initCustomAnimations()` function:

```javascript
// Example: Animate specific XO elements
const heroSection = document.querySelector('.hero-section');
if (heroSection) {
  gsap.fromTo(heroSection, 
    { opacity: 0, y: 50 },
    { 
      opacity: 1, 
      y: 0, 
      duration: 1,
      scrollTrigger: {
        trigger: heroSection,
        start: 'top 85%'
      }
    }
  );
}
```

## 🎨 Advanced Usage

### Timeline Animations

```javascript
// In gsap-custom.js - initCustomAnimations()
const productGrid = document.querySelector('.product-grid');
if (productGrid) {
  const cards = productGrid.querySelectorAll('.product-card');
  
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: productGrid,
      start: 'top 85%'
    }
  });
  
  tl.fromTo(cards, 
    { opacity: 0, y: 30 },
    { opacity: 1, y: 0, duration: 0.8, stagger: 0.1 }
  );
}
```

### Hover Effects

```javascript
// In gsap-custom.js - initCustomAnimations()
const buttons = document.querySelectorAll('.custom-button');
buttons.forEach(button => {
  button.addEventListener('mouseenter', () => {
    gsap.to(button, { scale: 1.05, duration: 0.3 });
  });
  button.addEventListener('mouseleave', () => {
    gsap.to(button, { scale: 1, duration: 0.3 });
  });
});
```

## 🛠️ Utility Functions

### Add Animation Dynamically
```javascript
// Add animation to any element
addGSAPAnimation('.my-element', {
  from: { opacity: 0, x: -50 },
  to: { opacity: 1, x: 0, duration: 1 }
});
```

### Create Complex Timeline
```javascript
const timeline = createGSAPTimeline([
  {
    selector: '.title',
    from: { opacity: 0, y: 50 },
    to: { opacity: 1, y: 0, duration: 1 }
  },
  {
    selector: '.subtitle', 
    from: { opacity: 0 },
    to: { opacity: 1, duration: 0.8 },
    position: '-=0.5'
  }
]);
```

## 🔍 Debugging

### Console Commands
```javascript
// Check GSAP status
debugGSAP()

// Check what elements have animations
document.querySelectorAll('[class*="gsap-"], [data-gsap]')
```

### Debug Mode
Add `gsap-debug` class to any element to see visual indicators:

```html
<div class="gsap-fade-in gsap-debug">Debug this element</div>
```

## 📱 Performance Notes

### Best Practices
1. **Use `will-change: transform`** for animated elements
2. **Prefer transforms over position changes** for better performance
3. **Use `ScrollTrigger.refresh()`** after dynamic content loads
4. **Batch DOM reads/writes** to avoid layout thrashing

### Mobile Optimization
- Animations automatically reduce on `prefers-reduced-motion`
- Stagger delays are shorter on mobile
- Hardware acceleration enabled for smooth performance

## 🎯 Common XO Builder Patterns

### Hero Section
```javascript
// Target XO hero sections
const heroes = document.querySelectorAll('.xb-hero, [data-gsap="hero"]');
heroes.forEach(hero => {
  const title = hero.querySelector('h1');
  const subtitle = hero.querySelector('.subtitle');
  const button = hero.querySelector('.btn');
  
  const tl = gsap.timeline();
  if (title) tl.from(title, { opacity: 0, y: 50, duration: 1 });
  if (subtitle) tl.from(subtitle, { opacity: 0, y: 30, duration: 0.8 }, '-=0.5');
  if (button) tl.from(button, { opacity: 0, scale: 0.8, duration: 0.6 }, '-=0.3');
});
```

### Product Cards
```javascript
// Target XO product cards
const products = document.querySelectorAll('.xb-product, [data-gsap="product"]');
gsap.from(products, {
  opacity: 0,
  y: 50,
  duration: 0.8,
  stagger: 0.1,
  scrollTrigger: {
    trigger: products[0],
    start: 'top 85%'
  }
});
```

### Image Galleries
```javascript
// Target XO image galleries
const galleries = document.querySelectorAll('.xb-gallery');
galleries.forEach(gallery => {
  const images = gallery.querySelectorAll('img');
  gsap.from(images, {
    scale: 0.8,
    opacity: 0,
    duration: 0.6,
    stagger: 0.1,
    ease: 'back.out(1.7)',
    scrollTrigger: {
      trigger: gallery,
      start: 'top 85%'
    }
  });
});
```

## 🚀 Tips for XO Builder

1. **Use consistent naming**: Create a naming convention for your XO elements
2. **Test animations**: Always preview in XO Builder before publishing
3. **Mobile-first**: Design animations that work well on all devices
4. **Performance**: Keep animations lightweight and smooth
5. **Fallbacks**: Ensure content is visible even without animations

## 📚 GSAP Resources

- [GSAP Documentation](https://greensock.com/docs/)
- [ScrollTrigger Docs](https://greensock.com/docs/v3/Plugins/ScrollTrigger)
- [GSAP Cheat Sheet](https://greensock.com/cheatsheet/)

---

**Note**: This file won't be overwritten by XO Builder updates. Your animations will persist across theme updates as long as you don't modify XO-generated files directly.