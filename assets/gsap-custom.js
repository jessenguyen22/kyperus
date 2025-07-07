class KPRVideoScroll {
  constructor() {
    this.init();
  }

  init() {
    if (this.shouldEnable()) {
      this.setupVideoScrollAnimations();
      this.setupModernConcept();
    }
  }

  shouldEnable() {
    return !window.Shopify?.designMode && 
           typeof gsap !== 'undefined' && 
           typeof ScrollTrigger !== 'undefined';
  }

  setupVideoScrollAnimations() {
    const videoWrappers = document.querySelectorAll('.kpr-video-wrapper');
    
    videoWrappers.forEach((wrapper) => {
      this.setupSingleVideoAnimation(wrapper);
    });
  }

  setupSingleVideoAnimation(wrapper) {
    const video = wrapper.querySelector('.kpr-video-ani .xb-html-video__item');
    
    if (!video) return;

    this.setupVideoProperties(video);
    
    gsap.set(wrapper, { marginTop: '', opacity: 0 });
    
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

    this.buildTimeline(tl, wrapper, video);
  }

  setupVideoProperties(video) {
    video.muted = true;
    video.playsInline = true;
    video.loop = false;
    video.autoplay = false;
    video.pause();
    video.currentTime = 0;
  }

  buildTimeline(tl, wrapper, video) {
    tl.to(wrapper, { opacity: 1, duration: 2, ease: 'power1.inOut' });
    
    if (video.duration > 0) {
      tl.to(video, { currentTime: video.duration, duration: 3, ease: 'none' }, '<');
    } else {
      video.addEventListener('loadedmetadata', () => {
        tl.to(video, { currentTime: video.duration, duration: 3, ease: 'none' }, '<');
      }, { once: true });
    }
  }

  setupModernConcept() {
    const modernConcept = document.querySelector('.modern-concept');
    
    if (!modernConcept) return;
    
    gsap.set(modernConcept, { marginTop: '-80vh' });
    
    gsap.timeline({
      scrollTrigger: {
        trigger: modernConcept,
        start: 'top 90%',
        end: '10% center',
        scrub: 2,
      }
    }).to('.kpr-video-wrapper', { opacity: 0, duration: 1, ease: 'power1.inOut' });
  }
}

// Initialize
function initKPRVideoScroll() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      new KPRVideoScroll();
    });
  } else {
    new KPRVideoScroll();
  }
}

if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
  initKPRVideoScroll();
} else {
  const checkGSAP = setInterval(() => {
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      clearInterval(checkGSAP);
      initKPRVideoScroll();
    }
  }, 100);
  
  setTimeout(() => clearInterval(checkGSAP), 10000);
}




// Hero Banner
class HeroMaskScroll {
  constructor() {
    this.init();
  }

  init() {
    if (this.shouldEnable()) {
      this.setupMaskAnimation();
    }
  }

  shouldEnable() {
    return !window.Shopify?.designMode && 
           typeof gsap !== 'undefined' && 
           typeof ScrollTrigger !== 'undefined';
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
        initialMaskPos: "50% 22%",
        initialMaskSize: "4000% 4000%",
        maskPos: "50% 22%",
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

  setupMaskAnimation() {
    const heroSection = document.querySelector('.hero-section');
    
    if (!heroSection) return;
    
    const { initialMaskPos, initialMaskSize, maskPos, maskSize } = this.getMaskSettings();
    
    gsap.set('.mask-wrapper', {
      maskPosition: initialMaskPos,
      maskSize: initialMaskSize,
    });

    gsap.set('.mask-logo', { marginTop: '-100vh', opacity: 0 });

    gsap.set('.entrance-message', { marginTop: '0vh' });

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
      }, '<')
      .to('.entrance-message', { 
        duration: 1, 
        ease: 'power1.inOut', 
        maskImage: 'radial-gradient(circle at 50% 0vh, black 50%, transparent 100%)' 
      }, '<');
  }
}

// Initialize
function initHeroMaskScroll() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      new HeroMaskScroll();
    });
  } else {
    new HeroMaskScroll();
  }
}

if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
  initHeroMaskScroll();
} else {
  const checkGSAP = setInterval(() => {
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      clearInterval(checkGSAP);
      initHeroMaskScroll();
    }
  }, 100);
  
  setTimeout(() => clearInterval(checkGSAP), 10000);
}