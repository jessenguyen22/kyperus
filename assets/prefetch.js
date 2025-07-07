/**
 * Simple Link Prefetching System
 * Prefetches pages on hover/touch for faster navigation
 */

class SimplePrefetch {
  constructor() {
    this.preloadQueue = new Set();
    this.init();
  }

  init() {
    this.setupPrefetching();
    this.setupIdlePrefetching();
    console.log('🔮 Simple Prefetch initialized');
  }

  /**
   * Setup intelligent prefetching
   */
  setupPrefetching() {
    let hoverTimer;

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
  }

  /**
   * Setup idle prefetching for visible links
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
   * Prefetch visible links during idle time
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
        href.includes('#') ||
        href.includes('mailto:') ||
        href.includes('tel:')) return false;
    
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
        link.as = 'document';
        document.head.appendChild(link);
      } else {
        // Fallback to fetch
        fetch(url, { 
          credentials: 'same-origin',
          headers: { 'X-Purpose': 'prefetch' }
        }).catch(() => {
          // Ignore fetch errors for prefetch
        });
      }
      
      console.log('🔮 Prefetched:', url);
    } catch (error) {
      console.warn('Prefetch failed:', url, error);
      this.preloadQueue.delete(url);
    }
  }
}

// Initialize prefetch system
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.simplePrefetch = new SimplePrefetch();
  });
} else {
  window.simplePrefetch = new SimplePrefetch();
} 