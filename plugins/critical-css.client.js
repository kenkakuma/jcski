// Critical CSS inlining plugin for JCSKI Blog
export default defineNuxtPlugin(() => {
  // Only run on client side after hydration
  if (process.client) {
    // Load non-critical CSS asynchronously
    const loadCSS = (href) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.media = 'print'; // Initially set to print to not block render
      link.onload = function() {
        this.media = 'all'; // Change to all once loaded
      };
      document.head.appendChild(link);
    };

    // Function to preload critical fonts
    const preloadFonts = () => {
      const fontFiles = [
        '/_nuxt/fonts/special-gothic-expanded-one.woff2',
        '/_nuxt/fonts/noto-sans-sc-400.woff2',
        '/_nuxt/fonts/noto-sans-jp-400.woff2'
      ];
      
      fontFiles.forEach(fontUrl => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'font';
        link.type = 'font/woff2';
        link.crossOrigin = 'anonymous';
        link.href = fontUrl;
        document.head.appendChild(link);
      });
    };

    // Preload fonts on page load
    preloadFonts();

    // Lazy load CSS for below-the-fold content
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Load CSS for specific sections when they come into view
          const sectionType = entry.target.dataset.section;
          if (sectionType === 'news' || sectionType === 'press') {
            // These styles are already in main CSS, so no additional loading needed
            observer.unobserve(entry.target);
          }
        }
      });
    }, { 
      rootMargin: '100px' // Load CSS 100px before element enters viewport
    });

    // Observe sections for lazy CSS loading
    document.addEventListener('DOMContentLoaded', () => {
      const sections = document.querySelectorAll('[data-section]');
      sections.forEach(section => observer.observe(section));
    });
  }
});