/**
 * Hydrogen-like Navigation System for Dawn Theme
 * Provides instant page transitions similar to Hydrogen
 */

class HydrogenNavigation {
  constructor() {
    this.cache = new Map();
    this.preloadCache = new Set();
    this.pendingRequests = new Map(); // Track in-flight requests
    this.isNavigating = false;
    this.currentUrl = window.location.href;
    
    // Performance metrics
    this.navigationStartTime = 0;
    
    this.init();
  }

  init() {
    // Check if we should initialize navigation
    if (!this.shouldEnableNavigation()) {
      console.log('🚫 Hydrogen Navigation disabled (Theme Editor or Settings)');
      return;
    }

    this.interceptLinks();
    this.setupBackForward();
    this.setupPreloading();
    this.setupViewTransition();
    
    // Mark initial page as cached
    this.cacheCurrentPage();
    
    console.log('🚀 Hydrogen Navigation initialized');
  }

  /**
   * Check if navigation should be enabled
   */
  shouldEnableNavigation() {
    // Always disable in Theme Editor/Customize mode
    if (window.Shopify?.designMode || 
        document.documentElement.classList.contains('shopify-design-mode') ||
        window.location.search.includes('_ab=') ||
        window.location.search.includes('preview_theme_id=')) {
      return false;
    }

    // Check theme settings
    if (window.hydrogenConfig && !window.hydrogenConfig.enableNavigation) {
      return false;
    }

    // Check if user has disabled in browser
    if (localStorage.getItem('hydrogen-navigation-disabled') === 'true') {
      return false;
    }

    return true;
  }

  /**
   * Intercept all internal links for SPA navigation
   */
  interceptLinks() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href]');
      if (!link || !this.shouldIntercept(link)) return;
      
      e.preventDefault();
      this.navigateToUrl(link.href);
    });
  }

  /**
   * Check if link should be intercepted
   */
  shouldIntercept(link) {
    const href = link.getAttribute('href');
    
    // Skip if external link
    if (href.startsWith('http') && !href.includes(window.location.hostname)) {
      return false;
    }
    
    // Skip if special attributes
    if (link.hasAttribute('data-no-instant') || 
        link.hasAttribute('download') ||
        link.getAttribute('target') === '_blank') {
      return false;
    }
    
    // Skip if cart or checkout links
    if (href.includes('/cart') || href.includes('/checkout')) {
      return false;
    }
    
    return true;
  }

  /**
   * Main navigation function
   */
  async navigateToUrl(url) {
    if (this.isNavigating || url === this.currentUrl) return;
    
    this.isNavigating = true;
    this.navigationStartTime = performance.now();
    
    try {
      // Start with brief loading state (no cursor change yet)
      this.showBriefLoadingState();
      
      // Get page content
      const content = await this.fetchPage(url);
      if (!content) throw new Error('Failed to load page');
      
      // Only show full loading if it takes longer than 100ms
      const elapsed = performance.now() - this.navigationStartTime;
      if (elapsed > 100) {
        this.showLoadingIndicator();
      }
      
      // Update page with view transition
      await this.updatePage(content, url);
      
      // Update browser history
      history.pushState({ url }, '', url);
      this.currentUrl = url;
      
      // Performance logging
      const duration = performance.now() - this.navigationStartTime;
      console.log(`⚡ Page loaded in ${duration.toFixed(2)}ms`);
      
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback to normal navigation
      window.location.href = url;
    } finally {
      this.isNavigating = false;
      this.hideLoadingIndicator();
    }
  }

  /**
   * Brief loading state without cursor change
   */
  showBriefLoadingState() {
    // Add class that only disables clicks, no cursor change
    document.body.classList.add('page-loading-brief');
    
    // Remove after short delay if navigation is fast
    setTimeout(() => {
      if (this.isNavigating) {
        document.body.classList.remove('page-loading-brief');
      }
    }, 50);
  }

  /**
   * Fetch page content with caching and deduplication
   */
  async fetchPage(url) {
    // Check cache first
    if (this.cache.has(url)) {
      console.log('📦 Loading from cache:', url);
      return this.cache.get(url);
    }
    
    // Check if request is already in progress
    if (this.pendingRequests.has(url)) {
      console.log('⏳ Waiting for pending request:', url);
      return this.pendingRequests.get(url);
    }
    
    // Create new request promise
    const requestPromise = this.performFetch(url);
    this.pendingRequests.set(url, requestPromise);
    
    try {
      const content = await requestPromise;
      return content;
    } finally {
      // Clean up pending request
      this.pendingRequests.delete(url);
    }
  }

  /**
   * Perform actual fetch request
   */
  async performFetch(url) {
    try {
      console.log('🌐 Fetching:', url);
      
      const response = await fetch(url, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      const content = {
        title: doc.title,
        head: doc.head.innerHTML,
        main: doc.querySelector('#MainContent')?.innerHTML || '',
        breadcrumbs: doc.querySelector('.breadcrumbs-custom')?.innerHTML || '',
        url,
        timestamp: Date.now()
      };
      
      // Cache the content
      this.cache.set(url, content);
      
      // Limit cache size
      if (this.cache.size > 50) {
        const firstKey = this.cache.keys().next().value;
        this.cache.delete(firstKey);
      }
      
      return content;
      
    } catch (error) {
      console.error('Fetch error:', error);
      return null;
    }
  }

  /**
   * Update page content with smooth transition
   */
  async updatePage(content, url) {
    // Use View Transition API if available
    if (document.startViewTransition) {
      return document.startViewTransition(() => {
        this.replaceContent(content);
      });
    } else {
      // Fallback transition
      await this.fadeTransition(() => {
        this.replaceContent(content);
      });
    }
  }

  /**
   * Replace page content
   */
  replaceContent(content) {
    // Update title
    document.title = content.title;
    
    // Update main content
    const mainContent = document.getElementById('MainContent');
    if (mainContent && content.main) {
      HTMLUpdateUtility.setInnerHTML(mainContent, content.main);
    }
    
    // Update breadcrumbs
    const breadcrumbs = document.querySelector('.breadcrumbs-custom');
    if (breadcrumbs && content.breadcrumbs) {
      HTMLUpdateUtility.setInnerHTML(breadcrumbs, content.breadcrumbs);
    }
    
    // Re-initialize components
    this.reinitializeComponents();
    
    // Scroll to top
    window.scrollTo(0, 0);
  }

  /**
   * Reinitialize custom elements and scripts
   */
  reinitializeComponents() {
    // Small delay to ensure DOM is stable before reinitializing animations
    setTimeout(() => {
      // Trigger custom event for other scripts (especially GSAP)
      document.dispatchEvent(new CustomEvent('page:loaded', {
        detail: { 
          navigation: 'instant',
          timestamp: Date.now(),
          url: window.location.href
        }
      }));
      
      // Additional component initialization can go here
      this.initializeLazyComponents();
      
    }, 16); // ~1 frame delay for DOM to settle
  }

  /**
   * Initialize components that need to be reloaded after navigation
   */
  initializeLazyComponents() {
    // Re-initialize any components that need refresh after page transitions
    // Product forms, image galleries, etc.
    
    // Trigger ScrollTrigger refresh after animations are initialized
    setTimeout(() => {
      if (window.ScrollTrigger) {
        window.ScrollTrigger.refresh();
      }
    }, 100);
  }

  /**
   * Fallback fade transition
   */
  async fadeTransition(callback) {
    const main = document.getElementById('MainContent');
    if (!main) return callback();
    
    // Fade out
    main.style.transition = 'opacity 0.15s ease-out';
    main.style.opacity = '0';
    
    await new Promise(resolve => setTimeout(resolve, 150));
    
    // Update content
    callback();
    
    // Fade in
    main.style.opacity = '1';
    
    // Clean up
    setTimeout(() => {
      main.style.transition = '';
    }, 150);
  }

  /**
   * Cache current page
   */
  cacheCurrentPage() {
    const content = {
      title: document.title,
      head: document.head.innerHTML,
      main: document.getElementById('MainContent')?.innerHTML || '',
      breadcrumbs: document.querySelector('.breadcrumbs-custom')?.innerHTML || '',
      url: window.location.href
    };
    
    this.cache.set(window.location.href, content);
  }

  /**
   * Setup link preloading on hover
   */
  setupPreloading() {
    let hoverTimeout;
    let lastPreloadTime = 0;
    const PRELOAD_THROTTLE = 200; // Min time between preloads
    
    document.addEventListener('mouseover', (e) => {
      const link = e.target.closest('a[href]');
      if (!link || !this.shouldIntercept(link)) return;
      
      const href = link.href;
      
      // Skip if already handled or too frequent
      const now = Date.now();
      if (now - lastPreloadTime < PRELOAD_THROTTLE) return;
      
      // Clear any existing timeout
      clearTimeout(hoverTimeout);
      
      // Preload after hover threshold
      hoverTimeout = setTimeout(() => {
        if (this.cache.has(href) || 
            this.preloadCache.has(href) || 
            this.pendingRequests.has(href)) return;
            
        lastPreloadTime = now;
        this.preloadPage(href);
      }, 100);
    });
    
    document.addEventListener('mouseout', () => {
      clearTimeout(hoverTimeout);
    });
  }

  /**
   * Preload page content
   */
  async preloadPage(url) {
    // Skip if already cached, preloaded, or currently loading
    if (this.cache.has(url) || 
        this.preloadCache.has(url) || 
        this.pendingRequests.has(url)) {
      return;
    }
    
    this.preloadCache.add(url);
    
    try {
      await this.fetchPage(url);
      console.log('🔮 Preloaded:', url);
    } catch (error) {
      console.warn('Preload failed:', url, error);
      this.preloadCache.delete(url);
    }
  }

  /**
   * Handle browser back/forward
   */
  setupBackForward() {
    window.addEventListener('popstate', (e) => {
      if (e.state?.url) {
        this.navigateToUrl(e.state.url);
      } else {
        // Fallback for initial page load
        window.location.reload();
      }
    });
  }

  /**
   * Setup View Transition API
   */
  setupViewTransition() {
    // Add meta tag for view transitions
    if (!document.querySelector('meta[name="view-transition"]')) {
      const meta = document.createElement('meta');
      meta.name = 'view-transition';
      meta.content = 'same-origin';
      document.head.appendChild(meta);
    }
  }

  /**
   * Enhanced Loading indicator with progress
   */
  showLoadingIndicator() {
    // Remove brief loading state
    document.body.classList.remove('page-loading-brief');
    
    // Add loading class to body (with cursor change)
    document.body.classList.add('page-loading');
    
    // Create or show loading indicator
    let indicator = document.getElementById('instant-loading');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'instant-loading';
      
      // Get style from settings or default
      const style = window.hydrogenConfig?.loadingStyle || 'default';
      const speed = window.hydrogenConfig?.transitionSpeed || 'fast';
      
      indicator.innerHTML = `
        <div class="loading-bar ${speed} style-${style}"></div>
      `;
      document.body.appendChild(indicator);
    }
    
    // Show with animation
    indicator.classList.add('active');
    
    // Start progress animation
    const bar = indicator.querySelector('.loading-bar');
    if (bar) {
      // Reset any previous state
      bar.style.width = '0%';
      bar.classList.remove('complete');
      
      // Simulate realistic loading progress
      this.animateProgress(bar);
    }
    
    console.log('🔄 Loading bar shown');
  }

  /**
   * Animate loading progress realistically
   */
  animateProgress(bar) {
    if (!bar) return;
    
    let progress = 0;
    const duration = this.getProgressDuration();
    const steps = 60; // 60fps
    const increment = 100 / steps;
    const stepTime = duration / steps;
    
    const animate = () => {
      if (progress < 85) { // Stop at 85% until actual load completes
        progress += increment * (Math.random() * 0.5 + 0.5); // Random variance
        progress = Math.min(progress, 85);
        bar.style.width = progress + '%';
        
        setTimeout(animate, stepTime);
      }
    };
    
    // Start animation after small delay
    setTimeout(animate, 50);
  }

  /**
   * Complete loading progress
   */
  completeProgress(bar) {
    if (!bar) return;
    
    // Complete to 100%
    bar.style.width = '100%';
    
    // Add complete class after brief delay
    setTimeout(() => {
      bar.classList.add('complete');
    }, 100);
  }

  /**
   * Get progress duration based on settings
   */
  getProgressDuration() {
    const speed = window.hydrogenConfig?.transitionSpeed || 'fast';
    const durations = {
      fast: 400,
      normal: 800,
      slow: 1200
    };
    return durations[speed] || 400;
  }

  hideLoadingIndicator() {
    // Clean up all loading states
    document.body.classList.remove('page-loading', 'page-loading-brief');
    
    const indicator = document.getElementById('instant-loading');
    
    if (indicator) {
      const bar = indicator.querySelector('.loading-bar');
      
      // Complete the progress first
      this.completeProgress(bar);
      
      // Hide after completion animation
      setTimeout(() => {
        indicator.classList.remove('active');
      }, 150); // Reduced from 200ms
    }
    
    console.log('✅ Loading bar hidden');
  }

  /**
   * Clear cache (for development)
   */
  clearCache() {
    this.cache.clear();
    this.preloadCache.clear();
    this.pendingRequests.clear();
    console.log('🗑️ Cache cleared');
  }

  /**
   * Get debug information
   */
  getDebugInfo() {
    return {
      enabled: this.shouldEnableNavigation(),
      designMode: window.Shopify?.designMode || false,
      settings: window.hydrogenConfig || {},
      cacheSize: this.cache.size,
      preloadedPages: this.preloadCache.size,
      pendingRequests: this.pendingRequests.size,
      currentUrl: this.currentUrl,
      isNavigating: this.isNavigating,
      cacheEntries: Array.from(this.cache.keys()),
      preloadedEntries: Array.from(this.preloadCache),
      pendingEntries: Array.from(this.pendingRequests.keys())
    };
  }

  /**
   * Disable navigation (for user control)
   */
  disable() {
    localStorage.setItem('hydrogen-navigation-disabled', 'true');
    console.log('🚫 Hydrogen Navigation disabled by user');
    window.location.reload();
  }

  /**
   * Enable navigation (for user control)
   */
  enable() {
    localStorage.removeItem('hydrogen-navigation-disabled');
    console.log('✅ Hydrogen Navigation enabled by user');
    window.location.reload();
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.hydrogenNav = new HydrogenNavigation();
  });
} else {
  window.hydrogenNav = new HydrogenNavigation();
}

// Expose for debugging and control
window.clearNavigationCache = () => window.hydrogenNav?.clearCache();
window.disableHydrogenNavigation = () => window.hydrogenNav?.disable();
window.enableHydrogenNavigation = () => window.hydrogenNav?.enable();
window.getNavigationDebug = () => {
  if (window.hydrogenNav) {
    const debug = window.hydrogenNav.getDebugInfo();
    console.table(debug);
    return debug;
  }
  return {
    enabled: false,
    reason: window.hydrogenConfig?.isThemeEditor ? 'Theme Editor' : 
            !window.hydrogenConfig?.enableNavigation ? 'Disabled in Settings' : 
            'Not Initialized'
  };
};

// Test loading bar
window.testLoadingBar = (duration = 2000) => {
  if (window.hydrogenNav) {
    console.log('🧪 Testing loading bar...');
    window.hydrogenNav.showLoadingIndicator();
    
    setTimeout(() => {
      window.hydrogenNav.hideLoadingIndicator();
      console.log('✅ Loading bar test completed');
    }, duration);
  } else {
    console.warn('Hydrogen Navigation not initialized');
  }
};

// Test different loading styles
window.testLoadingStyles = () => {
  const styles = ['default', 'gradient', 'neon', 'minimal'];
  let currentIndex = 0;
  
  const testNext = () => {
    if (currentIndex >= styles.length) {
      console.log('✅ All loading styles tested');
      return;
    }
    
    const style = styles[currentIndex];
    console.log(`🎨 Testing ${style} style...`);
    
    // Update style temporarily
    const indicator = document.getElementById('instant-loading');
    if (indicator) {
      const bar = indicator.querySelector('.loading-bar');
      if (bar) {
        // Remove old style classes
        styles.forEach(s => bar.classList.remove(`style-${s}`));
        // Add new style
        bar.classList.add(`style-${style}`);
      }
    }
    
    window.testLoadingBar(1500);
    
    setTimeout(() => {
      currentIndex++;
      testNext();
    }, 2000);
  };
  
  testNext();
};