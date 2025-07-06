/**
 * Performance Optimizer for Hydrogen-like Speed
 * Critical resource loading and optimization
 */

class PerformanceOptimizer {
  constructor() {
    this.preloadQueue = new Set();
    this.intersectionObserver = null;
    this.performanceMetrics = {
      navigationStart: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      cumulativeLayoutShift: 0
    };
    
    this.init();
  }

  init() {
    this.setupServiceWorker();
    this.setupCriticalResourceHints();
    this.setupLazyLoading();
    this.setupPerformanceMonitoring();
    this.setupPrefetching();
    this.optimizeImages();
    
    console.log('⚡ Performance Optimizer initialized');
  }

  /**
   * Register service worker
   */
  async setupServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/assets/service-worker.js');
        console.log('📦 Service Worker registered:', registration);
        
        // Clear cache on development
        if (window.Shopify?.designMode) {
          navigator.serviceWorker.controller?.postMessage({ type: 'CLEAR_CACHE' });
        }
      } catch (error) {
        console.warn('Service Worker registration failed:', error);
      }
    }
  }

  /**
   * Setup critical resource hints
   */
  setupCriticalResourceHints() {
    const head = document.head;
    
    // DNS prefetch for external domains
    const dnsPrefetch = [
      '//cdn.shopify.com',
      '//fonts.shopifycdn.com',
      '//monorail-edge.shopifysvc.com'
    ];
    
    dnsPrefetch.forEach(domain => {
      if (!document.querySelector(`link[href="${domain}"]`)) {
        const link = document.createElement('link');
        link.rel = 'dns-prefetch';
        link.href = domain;
        head.appendChild(link);
      }
    });

    // Preconnect to CDN
    if (!document.querySelector('link[rel="preconnect"][href*="cdn.shopify.com"]')) {
      const preconnect = document.createElement('link');
      preconnect.rel = 'preconnect';
      preconnect.href = 'https://cdn.shopify.com';
      preconnect.crossOrigin = 'anonymous';
      head.appendChild(preconnect);
    }

    // Preload critical CSS
    this.preloadCriticalResources();
  }

  /**
   * Preload critical resources
   */
  preloadCriticalResources() {
    // Skip preloading in performance optimizer - let theme.liquid handle this
    // This prevents Liquid template strings from being cached by Service Worker
    console.log('🔧 Critical resources handled by theme template');
  }

  /**
   * Setup lazy loading for images and sections
   */
  setupLazyLoading() {
    // Native lazy loading for images
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    // Intersection Observer for custom lazy loading
    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadLazyElement(entry.target);
          this.intersectionObserver.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.1
    });

    // Observe lazy elements
    document.querySelectorAll('[data-lazy]').forEach(el => {
      this.intersectionObserver.observe(el);
    });
  }

  /**
   * Load lazy element
   */
  loadLazyElement(element) {
    const src = element.dataset.src;
    const srcset = element.dataset.srcset;
    
    if (element.tagName === 'IMG') {
      if (srcset) element.srcset = srcset;
      if (src) element.src = src;
    } else if (element.dataset.lazy === 'section') {
      this.loadLazySection(element);
    }
    
    element.classList.add('loaded');
    element.removeAttribute('data-lazy');
  }

  /**
   * Load lazy section content
   */
  async loadLazySection(element) {
    const sectionId = element.dataset.sectionId;
    if (!sectionId) return;

    try {
      const response = await fetch(`/?section_id=${sectionId}`);
      const html = await response.text();
      element.innerHTML = html;
      
      // Reinitialize components in loaded section
      this.reinitializeSection(element);
    } catch (error) {
      console.warn('Failed to load lazy section:', error);
    }
  }

  /**
   * Setup performance monitoring
   */
  setupPerformanceMonitoring() {
    // Core Web Vitals
    this.measureCoreWebVitals();
    
    // Navigation timing
    window.addEventListener('load', () => {
      setTimeout(() => {
        this.reportNavigationMetrics();
      }, 0);
    });
    
    // Page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.reportMetrics();
      }
    });
  }

  /**
   * Measure Core Web Vitals
   */
  measureCoreWebVitals() {
    // FCP - First Contentful Paint
    new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          this.performanceMetrics.firstContentfulPaint = entry.startTime;
        }
      });
    }).observe({ entryTypes: ['paint'] });

    // LCP - Largest Contentful Paint
    new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        this.performanceMetrics.largestContentfulPaint = entry.startTime;
      });
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // CLS - Cumulative Layout Shift
    let clsValue = 0;
    new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          this.performanceMetrics.cumulativeLayoutShift = clsValue;
        }
      });
    }).observe({ entryTypes: ['layout-shift'] });
  }

  /**
   * Report navigation metrics
   */
  reportNavigationMetrics() {
    const navigation = performance.getEntriesByType('navigation')[0];
    
    const metrics = {
      dns: navigation.domainLookupEnd - navigation.domainLookupStart,
      connect: navigation.connectEnd - navigation.connectStart,
      ttfb: navigation.responseStart - navigation.requestStart,
      download: navigation.responseEnd - navigation.responseStart,
      domInteractive: navigation.domInteractive - navigation.fetchStart,
      domComplete: navigation.domComplete - navigation.fetchStart,
      loadComplete: navigation.loadEventEnd - navigation.fetchStart
    };

    console.log('📊 Navigation Metrics:', metrics);
    
    // Send to analytics if needed
    this.sendMetrics('navigation', metrics);
  }

  /**
   * Setup intelligent prefetching
   */
  setupPrefetching() {
    let hoverTimer;
    let touchTimer;

    // Prefetch on hover (desktop)
    document.addEventListener('mouseover', (e) => {
      const link = e.target.closest('a[href]');
      if (!link || !this.shouldPrefetch(link)) return;

      hoverTimer = setTimeout(() => {
        this.prefetchPage(link.href);
      }, 65); // 65ms hover threshold
    });

    document.addEventListener('mouseout', () => {
      clearTimeout(hoverTimer);
    });

    // Prefetch on touch start (mobile)
    document.addEventListener('touchstart', (e) => {
      const link = e.target.closest('a[href]');
      if (!link || !this.shouldPrefetch(link)) return;

      this.prefetchPage(link.href);
    }, { passive: true });

    // Prefetch visible links on idle
    this.setupIdlePrefetching();
  }

  /**
   * Setup idle prefetching
   */
  setupIdlePrefetching() {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        this.prefetchVisibleLinks();
      });
    } else {
      setTimeout(() => {
        this.prefetchVisibleLinks();
      }, 2000);
    }
  }

  /**
   * Prefetch visible links
   */
  prefetchVisibleLinks() {
    const links = document.querySelectorAll('a[href]');
    const visibleLinks = Array.from(links).filter(link => {
      const rect = link.getBoundingClientRect();
      return rect.top < window.innerHeight && rect.bottom > 0;
    });

    // Prefetch first few visible links
    visibleLinks.slice(0, 3).forEach(link => {
      if (this.shouldPrefetch(link)) {
        this.prefetchPage(link.href);
      }
    });
  }

  /**
   * Check if URL should be prefetched
   */
  shouldPrefetch(link) {
    const href = link.href;
    
    // Skip if already prefetched
    if (this.preloadQueue.has(href)) return false;
    
    // Skip external links
    if (!href.includes(window.location.hostname)) return false;
    
    // Skip special links
    if (link.hasAttribute('data-no-prefetch') ||
        href.includes('/cart') ||
        href.includes('/checkout') ||
        href.includes('#')) return false;
    
    return true;
  }

  /**
   * Prefetch page
   */
  async prefetchPage(url) {
    if (this.preloadQueue.has(url)) return;
    
    this.preloadQueue.add(url);

    try {
      // Use link prefetch if supported
      if (document.createElement('link').relList?.supports?.('prefetch')) {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        document.head.appendChild(link);
      } else {
        // Fallback to fetch
        fetch(url, { 
          credentials: 'same-origin',
          headers: { 'X-Purpose': 'prefetch' }
        });
      }
      
      console.log('🔮 Prefetched:', url);
    } catch (error) {
      console.warn('Prefetch failed:', url, error);
      this.preloadQueue.delete(url);
    }
  }

  /**
   * Optimize images
   */
  optimizeImages() {
    // Add loading=lazy to images
    document.querySelectorAll('img:not([loading])').forEach(img => {
      if (img.getBoundingClientRect().top > window.innerHeight) {
        img.loading = 'lazy';
      }
    });

    // Decode images asynchronously
    document.querySelectorAll('img[src]').forEach(img => {
      if (img.complete && img.decode) {
        img.decode().catch(() => {
          // Ignore decode errors
        });
      }
    });
  }

  /**
   * Reinitialize section after lazy load
   */
  reinitializeSection(section) {
    // Reinitialize Web Components
    section.querySelectorAll('[is], :not(:defined)').forEach(el => {
      if (el.tagName.includes('-')) {
        // Custom element
        const CustomElement = customElements.get(el.tagName.toLowerCase());
        if (CustomElement && !el.__initialized) {
          el.__initialized = true;
        }
      }
    });

    // Trigger event for other scripts
    section.dispatchEvent(new CustomEvent('section:loaded'));
  }

  /**
   * Send metrics to analytics
   */
  sendMetrics(type, data) {
    // Send to Shopify Analytics or custom endpoint
    if (window.ShopifyAnalytics) {
      window.ShopifyAnalytics.meta.page.customPayload = {
        ...window.ShopifyAnalytics.meta.page.customPayload,
        [type]: data
      };
    }
  }

  /**
   * Report all metrics
   */
  reportMetrics() {
    console.log('📈 Performance Metrics:', this.performanceMetrics);
    this.sendMetrics('webVitals', this.performanceMetrics);
  }
}

// Initialize performance optimizer
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.performanceOptimizer = new PerformanceOptimizer();
  });
} else {
  window.performanceOptimizer = new PerformanceOptimizer();
}

// Expose for debugging
window.reportPerformance = () => window.performanceOptimizer?.reportMetrics();