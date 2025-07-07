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