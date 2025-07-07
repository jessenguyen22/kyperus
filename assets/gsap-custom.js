/**
 * GSAP Animation Manager
 * Tổ chức tất cả animations trong một system dễ quản lý
 */

class GSAPAnimationManager {
  constructor() {
    this.animations = [];
    this.init();
  }

  init() {
    if (!this.shouldEnable()) return;
    
    // Khởi tạo tất cả animations
    this.initializeAnimations();
    
    // Listen for hydrogen navigation page changes
    this.setupNavigationListener();
  }

  shouldEnable() {
    return !window.Shopify?.designMode && 
           typeof gsap !== 'undefined' && 
           typeof ScrollTrigger !== 'undefined';
  }

  /**
   * Setup listener for hydrogen navigation page transitions
   */
  setupNavigationListener() {
    // Listen for hydrogen navigation page changes
    document.addEventListener('page:loaded', (e) => {
      console.log('🔄 Page loaded via navigation, reinitializing GSAP animations');
      this.reinitializeAnimations();
    });
  }

  /**
   * Reinitialize all animations after page transition
   */
  reinitializeAnimations() {
    // Cleanup existing animations
    this.destroy();
    
    // Small delay to ensure DOM is ready
    setTimeout(() => {
      this.initializeAnimations();
    }, 50);
  }

  /**
   * Initialize all animations
   */
  initializeAnimations() {
    console.log('🎬 Initializing GSAP animations');
    
    // ✨ FIX for XO Builder animations
    this.fixXOBuilderAnimations();
    
    // Khởi tạo từng animation
    this.heroMaskAnimation();
    this.introRevealAnimation(); 
    this.videoScrollAnimation();
    this.modernConceptAnimation();
    
    console.log('✅ GSAP animations initialized successfully');
  }

  /**
   * ✨ NEW: Fix XO Builder animation opacity issues
   */
  fixXOBuilderAnimations() {
    console.log('🔧 Fixing XO Builder animations...');
    
    // Find all elements with XO animate attributes
    const xoElements = document.querySelectorAll('[xo-animate]');
    
    xoElements.forEach((element, index) => {
      const animateType = element.getAttribute('xo-animate');
      const animationType = element.getAttribute('xo-type');
      const duration = element.getAttribute('xo-duration') || '800';
      const cascade = element.hasAttribute('xo-cascade');
      
      console.log(`📱 Found XO element: ${animateType}-${animationType}`, element);
      
      // Reset stuck opacity
      if (element.style.opacity === '0.01' || element.style.opacity === '0') {
        element.style.opacity = '';
        console.log('🔄 Reset stuck opacity for', element);
      }
      
      // Handle scroll animations specifically
      if (animateType === 'scroll') {
        this.handleXOScrollAnimation(element, animationType, duration, cascade, index);
      }
    });
    
    // Also trigger any existing XO systems
    this.triggerXOBuilderSystems();
  }

  /**
   * Handle XO Builder scroll animations with GSAP
   */
  handleXOScrollAnimation(element, type, duration, cascade, index) {
    const durationMs = parseInt(duration) / 1000;
    const delay = cascade ? index * 0.1 : 0;
    
    // Set initial state based on animation type
    let fromState = {};
    let toState = {};
    
    switch(type) {
      case 'fade-up':
        fromState = { opacity: 0, y: 30 };
        toState = { opacity: 1, y: 0 };
        break;
      case 'fade-down':
        fromState = { opacity: 0, y: -30 };
        toState = { opacity: 1, y: 0 };
        break;
      case 'fade-left':
        fromState = { opacity: 0, x: 30 };
        toState = { opacity: 1, x: 0 };
        break;
      case 'fade-right':
        fromState = { opacity: 0, x: -30 };
        toState = { opacity: 1, x: 0 };
        break;
      case 'fade-in':
      default:
        fromState = { opacity: 0 };
        toState = { opacity: 1 };
        break;
    }
    
    // Set initial state
    gsap.set(element, fromState);
    
    // Create scroll-triggered animation
    const timeline = gsap.to(element, {
      ...toState,
      duration: durationMs,
      delay: delay,
      ease: "power2.out",
      scrollTrigger: {
        trigger: element,
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play none none reverse",
        // markers: true, // Enable for debugging
      }
    });
    
    this.animations.push(timeline);
    console.log(`✨ Created ${type} animation for element`, element);
  }

  /**
   * Trigger existing XO Builder systems if available
   */
  triggerXOBuilderSystems() {
    // Try to reinitialize XO custom elements
    if (window.customElements) {
      // Force reconnection of XO custom elements
      const xoElements = document.querySelectorAll('[xo-animate], xb-section-background-slider');
      xoElements.forEach(element => {
        if (element.connectedCallback && typeof element.connectedCallback === 'function') {
          try {
            element.connectedCallback();
          } catch (e) {
            console.log('Could not reinitialize XO element:', e);
          }
        }
      });
    }
    
    // Try to trigger any global XO initialization
    if (window.xoAnimate) {
      try {
        window.xoAnimate.init();
      } catch (e) {
        console.log('XO animate not available');
      }
    }
    
    // Trigger intersection observer refresh for animations
    setTimeout(() => {
      window.dispatchEvent(new Event('scroll'));
    }, 100);
  }

  // ===========================================
  // ANIMATION 1: Hero Mask Effect
  // ===========================================
  heroMaskAnimation() {
    const heroSection = document.querySelector('.hero-mask-animation');
    if (!heroSection) return;

    const { maskUrl, animDuration, fps } = this.getMaskSettings();
    if (!maskUrl) return;

    const maskSteps = this.calculateMaskSteps(maskUrl);
    
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: heroSection,
        start: "top center",
        end: "bottom center",
        scrub: 1,
        onUpdate: (self) => {
          const step = Math.floor(self.progress * maskSteps);
          const progress = (step / maskSteps) * 100;
          heroSection.style.setProperty('--mask-position', `${progress}% 0`);
        }
      }
    });

    this.animations.push(tl);
  }

  // ===========================================
  // ANIMATION 1.5: Intro Section Reveal
  // ===========================================
  introRevealAnimation() {
    const introElements = document.querySelectorAll('.intro-reveal');
    if (introElements.length === 0) return;

    introElements.forEach((element, index) => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: element,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse"
        }
      });

      tl.from(element, {
        opacity: 0,
        y: 50,
        duration: 1,
        delay: index * 0.2,
        ease: "power2.out"
      });

      this.animations.push(tl);
    });
  }

  getMaskSettings() {
    return {
      maskUrl: 'path/to/mask.png',
      animDuration: 2,
      fps: 24
    };
  }

  calculateMaskSteps(maskUrl) {
    // Calculate based on sprite frames
    return 24; // Default fallback
  }

  // ===========================================
  // ANIMATION 2: Video Scroll Effect
  // ===========================================
  videoScrollAnimation() {
    const videoElements = document.querySelectorAll('.scroll-video');
    if (videoElements.length === 0) return;

    videoElements.forEach(videoElement => {
      const video = videoElement.querySelector('video');
      if (!video) return;

      this.setupVideoProperties(video);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: videoElement,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
          onUpdate: (self) => {
            if (video.duration) {
              video.currentTime = self.progress * video.duration;
            }
          }
        }
      });

      this.animations.push(tl);
    });
  }

  setupVideoProperties(video) {
    video.muted = true;
    video.preload = 'metadata';
    video.style.pointerEvents = 'none';
    
    video.addEventListener('loadedmetadata', () => {
      video.currentTime = 0;
    });
  }

  // ===========================================
  // ANIMATION 3: Modern Concept Effect
  // ===========================================
  modernConceptAnimation() {
    const conceptElements = document.querySelectorAll('.modern-concept');
    if (conceptElements.length === 0) return;

    conceptElements.forEach(element => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: element,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse"
        }
      });

      tl.from(element.children, {
        opacity: 0,
        scale: 0.8,
        duration: 0.8,
        stagger: 0.2,
        ease: "back.out(1.7)"
      });

      // Optional: Add hover effects
      // element.addEventListener('mouseenter', () => {
      //   gsap.to(element, { scale: 1.05, duration: 0.3 });
      // });
      // 
      // element.addEventListener('mouseleave', () => {
      //   gsap.to(element, { scale: 1, duration: 0.3 });
      // });

      this.animations.push(tl);
    });
  }

  // ===========================================
  // TEMPLATE: Thêm animation mới ở đây
  // ===========================================
  
  // newAnimationTemplate() {
  //   const targetElement = document.querySelector('.your-target');
  //   if (!targetElement) return;
  //   
  //   const tl = gsap.timeline({
  //     scrollTrigger: {
  //       trigger: '.your-trigger',
  //       start: 'top center',
  //       end: 'bottom center',
  //       scrub: 1,
  //     }
  //   });
  //
  //   tl.to('.your-element', { 
  //     opacity: 1, 
  //     y: 0, 
  //     duration: 1, 
  //     ease: 'power2.out' 
  //   });
  //
  //   this.animations.push({ name: 'newAnimation', timeline: tl });
  // }

  // ===========================================
  // UTILITY METHODS
  // ===========================================
  refresh() {
    ScrollTrigger.refresh();
  }

  destroy() {
    this.animations.forEach(timeline => {
      if (timeline.scrollTrigger) {
        timeline.scrollTrigger.kill();
      }
      timeline.kill();
    });
    this.animations = [];
  }
}

// Khởi tạo khi DOM sẵn sàng
function initGSAPAnimations() {
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    window.gsapAnimationManager = new GSAPAnimationManager();
  }
}

// Initialize on DOMContentLoaded
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initGSAPAnimations);
}

// ===========================================
// GLOBAL ACCESS (for debugging)
// ===========================================
window.refreshAnimations = () => {
  if (window.gsapAnimationManager) {
    window.gsapAnimationManager.refresh();
  }
};

window.destroyAnimations = () => {
  if (window.gsapAnimationManager) {
    window.gsapAnimationManager.destroy();
  }
};