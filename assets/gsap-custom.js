/**
 * Custom GSAP Animations for XO Builder Elements
 * This file is independent from XO Builder and won't be overridden
 * 
 * Naming Convention for XO Builder elements:
 * - Add custom classes like: gsap-fade-in, gsap-slide-up, etc.
 * - Use data attributes: data-gsap="animation-name"
 * - Target by XO classes: .xb-section, .xb-element, etc.
 */

// Wait for GSAP to load
document.addEventListener('DOMContentLoaded', function() {
  if (typeof gsap !== 'undefined') {
    console.log('🎬 GSAP Custom Animations Loaded');
    initGSAPAnimations();
  } else {
    console.warn('⚠️ GSAP not loaded - animations disabled');
  }
});

// Reinitialize on instant navigation
document.addEventListener('page:loaded', function() {
  setTimeout(() => {
    if (typeof gsap !== 'undefined') {
      console.log('🔄 Reinitializing GSAP animations after navigation');
      initGSAPAnimations();
    }
  }, 100);
});

/**
 * Main GSAP initialization function
 */
function initGSAPAnimations() {
  // Register ScrollTrigger if available
  if (typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }
  
  // Initialize all animation types
  initFadeAnimations();
  initSlideAnimations();
  initScaleAnimations();
  initRotateAnimations();
  initStaggerAnimations();
  initCustomAnimations();
  
  // Refresh ScrollTrigger after all animations
  if (typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.refresh();
  }
}

/**
 * Fade Animations
 * Usage: Add class "gsap-fade-in" or data-gsap="fade-in"
 */
function initFadeAnimations() {
  // Fade In
  gsap.set('.gsap-fade-in, [data-gsap="fade-in"]', { opacity: 0 });
  gsap.to('.gsap-fade-in, [data-gsap="fade-in"]', {
    opacity: 1,
    duration: 1,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '.gsap-fade-in, [data-gsap="fade-in"]',
      start: 'top 85%',
      toggleActions: 'play none none reverse'
    }
  });

  // Fade In Up
  gsap.set('.gsap-fade-up, [data-gsap="fade-up"]', { 
    opacity: 0, 
    y: 50 
  });
  gsap.to('.gsap-fade-up, [data-gsap="fade-up"]', {
    opacity: 1,
    y: 0,
    duration: 1,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '.gsap-fade-up, [data-gsap="fade-up"]',
      start: 'top 85%',
      toggleActions: 'play none none reverse'
    }
  });

  // Fade In Down
  gsap.set('.gsap-fade-down, [data-gsap="fade-down"]', { 
    opacity: 0, 
    y: -50 
  });
  gsap.to('.gsap-fade-down, [data-gsap="fade-down"]', {
    opacity: 1,
    y: 0,
    duration: 1,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '.gsap-fade-down, [data-gsap="fade-down"]',
      start: 'top 85%',
      toggleActions: 'play none none reverse'
    }
  });
}

/**
 * Slide Animations
 * Usage: Add class "gsap-slide-left" or data-gsap="slide-left"
 */
function initSlideAnimations() {
  // Slide from Left
  gsap.set('.gsap-slide-left, [data-gsap="slide-left"]', { 
    x: -100,
    opacity: 0 
  });
  gsap.to('.gsap-slide-left, [data-gsap="slide-left"]', {
    x: 0,
    opacity: 1,
    duration: 1,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '.gsap-slide-left, [data-gsap="slide-left"]',
      start: 'top 85%',
      toggleActions: 'play none none reverse'
    }
  });

  // Slide from Right
  gsap.set('.gsap-slide-right, [data-gsap="slide-right"]', { 
    x: 100,
    opacity: 0 
  });
  gsap.to('.gsap-slide-right, [data-gsap="slide-right"]', {
    x: 0,
    opacity: 1,
    duration: 1,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '.gsap-slide-right, [data-gsap="slide-right"]',
      start: 'top 85%',
      toggleActions: 'play none none reverse'
    }
  });
}

/**
 * Scale Animations
 * Usage: Add class "gsap-scale-in" or data-gsap="scale-in"
 */
function initScaleAnimations() {
  // Scale In
  gsap.set('.gsap-scale-in, [data-gsap="scale-in"]', { 
    scale: 0.8,
    opacity: 0 
  });
  gsap.to('.gsap-scale-in, [data-gsap="scale-in"]', {
    scale: 1,
    opacity: 1,
    duration: 0.8,
    ease: 'back.out(1.7)',
    scrollTrigger: {
      trigger: '.gsap-scale-in, [data-gsap="scale-in"]',
      start: 'top 85%',
      toggleActions: 'play none none reverse'
    }
  });

  // Scale Up on Hover
  const scaleHoverElements = document.querySelectorAll('.gsap-scale-hover, [data-gsap="scale-hover"]');
  scaleHoverElements.forEach(element => {
    element.addEventListener('mouseenter', () => {
      gsap.to(element, { scale: 1.05, duration: 0.3, ease: 'power2.out' });
    });
    element.addEventListener('mouseleave', () => {
      gsap.to(element, { scale: 1, duration: 0.3, ease: 'power2.out' });
    });
  });
}

/**
 * Rotate Animations
 * Usage: Add class "gsap-rotate-in" or data-gsap="rotate-in"
 */
function initRotateAnimations() {
  gsap.set('.gsap-rotate-in, [data-gsap="rotate-in"]', { 
    rotation: -10,
    opacity: 0 
  });
  gsap.to('.gsap-rotate-in, [data-gsap="rotate-in"]', {
    rotation: 0,
    opacity: 1,
    duration: 1,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '.gsap-rotate-in, [data-gsap="rotate-in"]',
      start: 'top 85%',
      toggleActions: 'play none none reverse'
    }
  });
}

/**
 * Stagger Animations
 * Usage: Add class "gsap-stagger" to parent, children will animate with delay
 */
function initStaggerAnimations() {
  const staggerContainers = document.querySelectorAll('.gsap-stagger, [data-gsap="stagger"]');
  
  staggerContainers.forEach(container => {
    const children = container.children;
    
    gsap.set(children, { 
      opacity: 0, 
      y: 30 
    });
    
    gsap.to(children, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power2.out',
      stagger: 0.1,
      scrollTrigger: {
        trigger: container,
        start: 'top 85%',
        toggleActions: 'play none none reverse'
      }
    });
  });
}

/**
 * Custom Animations
 * Add your specific XO Builder animations here
 */
function initCustomAnimations() {
  // Example: Hero Section Animation
  const heroSection = document.querySelector('.xb-hero, [data-gsap="hero"]');
  if (heroSection) {
    const heroTitle = heroSection.querySelector('h1, .hero-title');
    const heroSubtitle = heroSection.querySelector('.hero-subtitle, .subtitle');
    const heroButton = heroSection.querySelector('.btn, .button');
    
    if (heroTitle || heroSubtitle || heroButton) {
      const tl = gsap.timeline();
      
      if (heroTitle) {
        gsap.set(heroTitle, { opacity: 0, y: 50 });
        tl.to(heroTitle, { opacity: 1, y: 0, duration: 1, ease: 'power2.out' });
      }
      
      if (heroSubtitle) {
        gsap.set(heroSubtitle, { opacity: 0, y: 30 });
        tl.to(heroSubtitle, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, '-=0.5');
      }
      
      if (heroButton) {
        gsap.set(heroButton, { opacity: 0, scale: 0.8 });
        tl.to(heroButton, { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.7)' }, '-=0.3');
      }
    }
  }

  // Example: Product Cards Animation
  const productCards = document.querySelectorAll('.product-card, .xb-product, [data-gsap="product"]');
  if (productCards.length > 0) {
    gsap.set(productCards, { 
      opacity: 0, 
      y: 50,
      scale: 0.95
    });
    
    gsap.to(productCards, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.8,
      ease: 'power2.out',
      stagger: 0.1,
      scrollTrigger: {
        trigger: productCards[0],
        start: 'top 85%',
        toggleActions: 'play none none reverse'
      }
    });
  }

  // Video Pin & Scrub Animation
  initVideoScrubAnimation();

  // ADD YOUR CUSTOM ANIMATIONS HERE
  // Example structure:
  /*
  const customElement = document.querySelector('.your-xo-class');
  if (customElement) {
    gsap.fromTo(customElement, 
      { opacity: 0, x: -50 },
      { 
        opacity: 1, 
        x: 0, 
        duration: 1,
        scrollTrigger: {
          trigger: customElement,
          start: 'top 85%'
        }
      }
    );
  }
  */
}

/**
 * Video Pin & Scrub Animation
 * Based on XO Builder video section with class kpr-video-wrapper
 */
function initVideoScrubAnimation() {
  const videoWrapper = document.querySelector('.kpr-video-wrapper');
  if (!videoWrapper) {
    console.log('📹 No video wrapper found with class .kpr-video-wrapper');
    return;
  }

  const video = videoWrapper.querySelector('video.xb-html-video__item');
  if (!video) {
    console.log('📹 No video element found in .kpr-video-wrapper');
    return;
  }

  console.log('📹 Initializing video scrub animation for:', videoWrapper.className);

  // Set initial state
  gsap.set(videoWrapper, { 
    marginTop: '-150vh', 
    opacity: 0 
  });

  // Video setup - ensure proper configuration
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.preload = 'auto';
  
  // Prevent auto-play
  video.pause();

  // Function to setup scrub animation
  const setupScrubAnimation = () => {
    if (video.duration && video.duration > 0) {
      console.log(`📹 Video loaded: ${video.duration}s duration`);
      
      // Create main timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: videoWrapper,
          start: 'top top',
          end: '+=200% top',
          scrub: true,
          pin: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            // Optional: Debug scroll progress
            // console.log('Scroll progress:', self.progress);
          }
        }
      });

      // Find previous section (hero) to fade out
      const heroSection = document.querySelector('.hero-section, .xb-section:first-child');
      if (heroSection && heroSection !== videoWrapper) {
        tl.to(heroSection, { 
          delay: 0.5, 
          opacity: 0, 
          ease: 'power1.inOut' 
        });
      }

      // Fade in video wrapper
      tl.to(videoWrapper, { 
        opacity: 1, 
        duration: 2, 
        ease: 'power1.inOut' 
      });

      // Video scrub animation
      tl.to(video, { 
        currentTime: video.duration, 
        duration: 3, 
        ease: 'none' // Smooth scrubbing
      }, '<'); // Start with previous animation

      console.log('📹 Video scrub animation initialized successfully');
      
    } else {
      console.warn('📹 Video duration not available, retrying...');
      // Retry after a short delay
      setTimeout(setupScrubAnimation, 100);
    }
  };

  // Handle video loading
  const handleVideoReady = () => {
    // Set to first frame
    video.currentTime = 0;
    setupScrubAnimation();
  };

  // Check if video is already loaded
  if (video.readyState >= 1) {
    // Metadata already loaded
    handleVideoReady();
  } else {
    // Wait for metadata to load
    video.addEventListener('loadedmetadata', handleVideoReady, { once: true });
    
    // Fallback: also listen for canplay event
    video.addEventListener('canplay', () => {
      if (video.duration && video.duration > 0) {
        handleVideoReady();
      }
    }, { once: true });
  }

  // Error handling
  video.addEventListener('error', (e) => {
    console.error('📹 Video loading error:', e);
  });

  // Additional video optimization
  video.addEventListener('loadstart', () => {
    console.log('📹 Video loading started');
  });
}

/**
 * Utility Functions
 */

// Function to add animation to specific XO elements
window.addGSAPAnimation = function(selector, animation) {
  const elements = document.querySelectorAll(selector);
  if (elements.length > 0 && typeof gsap !== 'undefined') {
    gsap.fromTo(elements, animation.from, animation.to);
  }
};

// Function to create timeline for complex animations
window.createGSAPTimeline = function(animations) {
  if (typeof gsap !== 'undefined') {
    const tl = gsap.timeline();
    animations.forEach(anim => {
      const elements = document.querySelectorAll(anim.selector);
      if (elements.length > 0) {
        tl.fromTo(elements, anim.from, anim.to, anim.position || '');
      }
    });
    return tl;
  }
};

// Debug function
window.debugGSAP = function() {
  console.log('🎬 GSAP Debug Info:');
  console.log('GSAP loaded:', typeof gsap !== 'undefined');
  console.log('ScrollTrigger loaded:', typeof ScrollTrigger !== 'undefined');
  console.log('Elements with GSAP classes:', document.querySelectorAll('[class*="gsap-"], [data-gsap]').length);
  
  // List all elements with GSAP classes
  const gsapElements = document.querySelectorAll('[class*="gsap-"], [data-gsap]');
  gsapElements.forEach((el, index) => {
    console.log(`Element ${index + 1}:`, el.className, el.dataset.gsap || '');
  });
};

// Video debug function
window.debugVideo = function() {
  console.log('📹 Video Debug Info:');
  const videoWrapper = document.querySelector('.kpr-video-wrapper');
  const video = document.querySelector('.kpr-video-wrapper video.xb-html-video__item');
  
  console.log('Video wrapper found:', !!videoWrapper);
  console.log('Video element found:', !!video);
  
  if (video) {
    console.log('Video src:', video.src);
    console.log('Video duration:', video.duration);
    console.log('Video readyState:', video.readyState);
    console.log('Video currentTime:', video.currentTime);
    console.log('Video muted:', video.muted);
    console.log('Video paused:', video.paused);
  }
  
  if (videoWrapper) {
    console.log('Video wrapper classes:', videoWrapper.className);
    console.log('Video wrapper computed style:', window.getComputedStyle(videoWrapper).marginTop);
  }
  
  return { videoWrapper, video };
};