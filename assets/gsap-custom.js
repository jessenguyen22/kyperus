/**
 * KPR Video Scroll Animation System
 * Converts React/GSAP logic to vanilla JavaScript for Shopify theme
 * Compatible with XB Builder sections and theme architecture
 */

class KPRVideoScroll {
  constructor() {
    this.videos = new Map();
    this.timelines = new Map();
    this.isInitialized = false;
    
    // Configuration
    this.config = {
      selectors: {
        wrapper: '.kpr-video-wrapper',
        video: '.kpr-video-ani .xb-html-video__item',
        heroSection: '.hero-section, .image-banner, .slideshow'
      },
      animation: {
        initialOffset: '-50vh',
        duration: 3,
        ease: 'power1.inOut'
      }
    };
    
    this.init();
  }

  init() {
    if (this.shouldEnable()) {
      this.setupVideoScrollAnimations();
      this.isInitialized = true;
      console.log('🎬 KPR Video Scroll initialized');
    }
  }

  shouldEnable() {
    // Theme editor check
    if (window.Shopify?.designMode) {
      console.log('🎨 Theme Editor detected - Video scroll disabled');
      return false;
    }
    
    // GSAP availability check
    if (typeof gsap === 'undefined') {
      console.warn('⚠️ GSAP not loaded - Video scroll disabled');
      return false;
    }
    
    // ScrollTrigger availability check
    if (typeof ScrollTrigger === 'undefined') {
      console.warn('⚠️ ScrollTrigger not loaded - Video scroll disabled');
      return false;
    }
    
    return true;
  }

  setupVideoScrollAnimations() {
    const videoWrappers = document.querySelectorAll(this.config.selectors.wrapper);
    
    if (videoWrappers.length === 0) {
      console.log('📹 No video wrappers found with selector:', this.config.selectors.wrapper);
      return;
    }

    videoWrappers.forEach((wrapper, index) => {
      this.setupSingleVideoAnimation(wrapper, index);
    });
  }

  setupSingleVideoAnimation(wrapper, index) {
    const video = wrapper.querySelector(this.config.selectors.video);
    
    if (!video) {
      console.warn('⚠️ Video element not found in wrapper:', wrapper);
      return;
    }

    // Setup video properties
    this.setupVideoProperties(video);
    
    // Create unique ID for this animation
    const animationId = `kpr-video-${index}`;
    this.videos.set(animationId, { wrapper, video });
    
    // Set initial state
    gsap.set(wrapper, { 
      marginTop: this.config.animation.initialOffset, 
      opacity: 0 
    });
    
    // Create timeline
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: wrapper,
        start: 'top top',
        end: '+=200% top',
        scrub: true,
        pin: true,
        onUpdate: (self) => {
          this.handleScrollUpdate(self, video);
        }
      }
    });

    // Animation sequence
    this.buildTimeline(tl, wrapper, video);
    
    // Store timeline reference
    this.timelines.set(animationId, tl);
    
    console.log(`🎬 Video animation setup complete for: ${animationId}`);
  }

  setupVideoProperties(video) {
    // Ensure video is properly configured
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.loop = false;
    video.autoplay = false;
    
    // Prevent video from auto-playing
    video.pause();
    
    // Handle video loading
    const handleCanPlay = () => {
      video.currentTime = 0;
      console.log('📹 Video ready for scrubbing');
    };

    const handleLoadedMetadata = () => {
      // Video metadata is loaded, ready for currentTime manipulation
      console.log('📊 Video metadata loaded, duration:', video.duration);
    };

    if (video.readyState >= 1) {
      handleLoadedMetadata();
    } else {
      video.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true });
    }

    if (video.readyState >= 3) {
      handleCanPlay();
    } else {
      video.addEventListener('canplay', handleCanPlay, { once: true });
    }
  }

  buildTimeline(tl, wrapper, video) {
    // Find hero section to fade out
    const heroSection = document.querySelector(this.config.selectors.heroSection);
    
    if (heroSection) {
      tl.to(heroSection, { 
        delay: 0.5, 
        opacity: 0, 
        ease: this.config.animation.ease 
      });
    }
    
    // Fade in video wrapper
    tl.to(wrapper, { 
      opacity: 1, 
      duration: 2, 
      ease: this.config.animation.ease 
    });
    
    // Add video scrubbing when metadata is loaded
    this.addVideoScrubbing(tl, video);
  }

  addVideoScrubbing(tl, video) {
    const addScrubbing = () => {
      if (video.duration && video.duration > 0) {
        tl.to(video, { 
          currentTime: video.duration, 
          duration: this.config.animation.duration, 
          ease: 'none' // Smooth scrubbing
        }, '<');
        
        console.log('🎬 Video scrubbing added to timeline');
      }
    };

    if (video.readyState >= 1 && video.duration) {
      addScrubbing();
    } else {
      video.addEventListener('loadedmetadata', addScrubbing, { once: true });
    }
  }

  handleScrollUpdate(self, video) {
    // Additional scroll handling if needed
    // This is called during scroll updates
    if (video.readyState >= 1) {
      // Ensure video stays paused during scrubbing
      if (!video.paused) {
        video.pause();
      }
    }
  }

  // Debug and control methods
  getDebugInfo() {
    return {
      isInitialized: this.isInitialized,
      videosCount: this.videos.size,
      timelinesCount: this.timelines.size,
      config: this.config
    };
  }

  destroy() {
    // Clean up timelines
    this.timelines.forEach((tl) => {
      if (tl.scrollTrigger) {
        tl.scrollTrigger.kill();
      }
      tl.kill();
    });
    
    // Clean up maps
    this.videos.clear();
    this.timelines.clear();
    
    console.log('🧹 KPR Video Scroll destroyed');
  }

  refresh() {
    // Refresh ScrollTrigger instances
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.refresh();
      console.log('🔄 ScrollTrigger refreshed');
    }
  }
}

// Initialize when DOM is ready and GSAP is loaded
function initKPRVideoScroll() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.kprVideoScroll = new KPRVideoScroll();
    });
  } else {
    window.kprVideoScroll = new KPRVideoScroll();
  }
}

// Check if GSAP is already loaded
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
  initKPRVideoScroll();
} else {
  // Wait for GSAP to load
  const checkGSAP = setInterval(() => {
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      clearInterval(checkGSAP);
      initKPRVideoScroll();
    }
  }, 100);
  
  // Timeout after 10 seconds
  setTimeout(() => {
    clearInterval(checkGSAP);
    console.warn('⚠️ GSAP/ScrollTrigger not loaded within 10 seconds');
  }, 10000);
}

// Global debug functions
window.getVideoScrollDebug = () => {
  return window.kprVideoScroll ? window.kprVideoScroll.getDebugInfo() : null;
};

window.refreshVideoScroll = () => {
  if (window.kprVideoScroll) {
    window.kprVideoScroll.refresh();
  }
};

window.destroyVideoScroll = () => {
  if (window.kprVideoScroll) {
    window.kprVideoScroll.destroy();
    window.kprVideoScroll = null;
  }
};
