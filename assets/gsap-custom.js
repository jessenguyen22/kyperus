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
   * Reinitialize animations after page transition
   */
  reinitializeAnimations() {
    // Cleanup existing animations
    this.destroy();
    
    // Small delay to ensure DOM is ready
    setTimeout(() => {
      this.initializeAnimations();
    }, 50);
  }

  initializeAnimations() {
    // Clear animations array
    this.animations = [];
    
    // Thêm tất cả animations vào đây
    this.heroMaskAnimation();
    this.introRevealAnimation();
    this.videoScrollAnimation();
    this.modernConceptAnimation();
    
    // Thêm animation mới ở đây:
    // this.newAnimationName();
  }

  // ===========================================
  // ANIMATION 1: Hero Mask Effect
  // ===========================================
  heroMaskAnimation() {
    const heroSection = document.querySelector('.hero-section');
    if (!heroSection) return;
    
    const { initialMaskPos, initialMaskSize, maskPos, maskSize } = this.getMaskSettings();
    
    gsap.set('.mask-wrapper', {
      maskPosition: initialMaskPos,
      maskSize: initialMaskSize,
    });

    gsap.set('.mask-logo', { marginTop: '-100vh', opacity: 0 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '.hero-section',
        start: 'top top',
        end: '+=200%',
        scrub: 2.5,
        pin: true,
      }
    });

    tl
      .to('.fade-out', { opacity: 0, ease: 'power1.inOut' })
      .to('.scale-out', { scale: 1, ease: 'power1.inOut' })
      .to('.mask-wrapper', { maskSize, ease: 'power1.inOut' }, '<')
      .to('.mask-wrapper', { opacity: 0 })
      .to('.overlay-logo', { 
        opacity: 1, 
        onComplete: () => {
          gsap.to('.overlay-logo', { opacity: 0 });
        } 
      }, '<');

    this.animations.push({ name: 'heroMask', timeline: tl });
  }

  // ===========================================
  // ANIMATION 1.5: Intro Section Reveal
  // ===========================================
  introRevealAnimation() {
    const introSection = document.querySelector('.entrance-message');
    if (!introSection) return;

    // Set initial state
    gsap.set(introSection, { 
      opacity: 0,
      maskImage: 'radial-gradient(circle at 50% 100vh, black 0%, transparent 0%)',
      marginTop: '-200vh'
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: introSection,
        start: 'top top',
        end: '+=200%', // Đồng bộ với hero section
        scrub: 2.5,   // Đồng bộ với hero section
        pin: true,
      }
    });

    tl
      .to(introSection, { 
        opacity: 1,
        duration: 0.5,
        ease: 'power1.inOut'
      })
      .to(introSection, { 
        maskImage: 'radial-gradient(circle at 50% 0vh, black 70%, transparent 100%)',
        duration: 1, 
        ease: 'power1.inOut' 
      }, '<0.2');

    this.animations.push({ name: 'introReveal', timeline: tl });
  }

  getMaskSettings() {
    const width = window.innerWidth;
    
    if (width <= 768) {
      return {
        initialMaskPos: "50% -1500vh",
        initialMaskSize: "3100% 3100%",
        maskPos: "50% 7vh",
        maskSize: "50% 50%",
      };
    }
    
    if (width <= 1024) {
      return {
        initialMaskPos: "50% -1700vh",
        initialMaskSize: "3500% 3500%",
        maskPos: "50% 17vh",
        maskSize: "30% 30%",
      };
    }
    
    if (width >= 1920) {
      return {
        initialMaskPos: "50% 20%",
        initialMaskSize: "4000% 4000%",
        maskPos: "50% 20%",
        maskSize: "15% 15%",
      };
    }
    
    if (width >= 1440) {
      return {
        initialMaskPos: "50% 25%",
        initialMaskSize: "4200% 4200%",
        maskPos: "50% 25%",
        maskSize: "16% 16%",
      };
    }
    
    return {
      initialMaskPos: "50% 24%",
      initialMaskSize: "4000% 4000%",
      maskPos: "50% 22.3%",
      maskSize: "17% 17%",
    };
  }

  // ===========================================
  // ANIMATION 2: Video Scroll Effect
  // ===========================================
  videoScrollAnimation() {
    const videoWrappers = document.querySelectorAll('.kpr-video-wrapper');
    
    videoWrappers.forEach((wrapper, index) => {
      const video = wrapper.querySelector('.kpr-video-ani .xb-html-video__item');
      if (!video) return;

      this.setupVideoProperties(video);
      
      gsap.set(wrapper, { marginTop: '-120vh', opacity: 0 });
      
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapper,
          start: 'top top',
          end: '+=200% top',
          scrub: true,
          pin: true,
          onUpdate: () => {
            if (!video.paused) video.pause();
          }
        }
      });

      tl.to(wrapper, { opacity: 1, duration: 2, ease: 'power1.inOut' })
        .to('.entrance-message', { 
        opacity: 0,
        duration: 0.5,
        ease: 'power1.inOut'
      },'<');
      
      if (video.duration > 0) {
        tl.to(video, { currentTime: video.duration, duration: 3, ease: 'none' }, '<');
      } else {
        video.addEventListener('loadedmetadata', () => {
          tl.to(video, { currentTime: video.duration, duration: 3, ease: 'none' }, '<');
        }, { once: true });
      }

      this.animations.push({ name: `videoScroll_${index}`, timeline: tl });
    });
  }

  setupVideoProperties(video) {
    video.muted = true;
    video.playsInline = true;
    video.loop = false;
    video.autoplay = false;
    video.pause();
    video.currentTime = 0;
  }

  // ===========================================
  // ANIMATION 3: Modern Concept Effect
  // ===========================================
  modernConceptAnimation() {
    const modernConcept = document.querySelector('.modern-concept');
    if (!modernConcept) return;
    
    gsap.set(modernConcept, { marginTop: '-80vh' });
    
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: modernConcept,
        start: 'top 90%',
        end: '10% center',
        scrub: 2,
      }
    });

    tl.to('.kpr-video-wrapper', { opacity: 0, duration: 1, ease: 'power1.inOut' });

    this.animations.push({ name: 'modernConcept', timeline: tl });
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
    this.animations.forEach(({ timeline }) => {
      if (timeline.scrollTrigger) {
        timeline.scrollTrigger.kill();
      }
      timeline.kill();
    });
    this.animations = [];
  }
}

// ===========================================
// INITIALIZATION
// ===========================================
function initGSAPAnimations() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.gsapManager = new GSAPAnimationManager();
    });
  } else {
    window.gsapManager = new GSAPAnimationManager();
  }
}

if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
  initGSAPAnimations();
} else {
  const checkGSAP = setInterval(() => {
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      clearInterval(checkGSAP);
      initGSAPAnimations();
    }
  }, 100);
  
  setTimeout(() => clearInterval(checkGSAP), 10000);
}

// ===========================================
// GLOBAL ACCESS (for debugging)
// ===========================================
window.refreshAnimations = () => {
  if (window.gsapManager) {
    window.gsapManager.refresh();
  }
};

window.destroyAnimations = () => {
  if (window.gsapManager) {
    window.gsapManager.destroy();
  }
};