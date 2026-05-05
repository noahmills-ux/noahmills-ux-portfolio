
(function() {
  "use strict";

  /**
   * Page Loader — black overlay with progress bar that fills to 100% then
   * slides up to reveal the page.
   */
  (function initLoader() {
    const loader = document.getElementById('page-loader');
    if (!loader) return;

    // Only show loader on first visit per session
    if (sessionStorage.getItem('loaderShown')) {
      loader.style.display = 'none';
      document.body.classList.remove('is-loading');
      return;
    }
    sessionStorage.setItem('loaderShown', '1');

    const fill = loader.querySelector('.loader-bar-fill');
    const percentEl = loader.querySelector('.loader-percent');
    const logoFill = document.getElementById('loaderLogoFill');
    const fillDuration = 2000;
    const startTime = performance.now();

    // Animate percentage counter
    function animateProgress() {
      var elapsed = performance.now() - startTime;
      var progress = Math.min(elapsed / fillDuration, 1);
      var pct = Math.round(progress * 100);
      if (percentEl) percentEl.textContent = pct + '%';
      if (progress < 1) requestAnimationFrame(animateProgress);
    }

    // Kick off the fill animation + logo fill
    requestAnimationFrame(function() {
      if (fill) fill.style.width = '100%';
      if (logoFill) logoFill.classList.add('filling');
      animateProgress();
    });

    function hideLoader() {
      loader.classList.add('is-hidden');
      document.body.classList.remove('is-loading');
      setTimeout(function() { loader.style.display = 'none'; }, 1000);
    }

    // Reveal when both the bar has filled AND the window has loaded
    var barDone = false;
    var pageDone = document.readyState === 'complete';
    function maybeHide() { if (barDone && pageDone) hideLoader(); }

    setTimeout(function() { barDone = true; maybeHide(); }, fillDuration + 200);
    if (!pageDone) {
      window.addEventListener('load', function() { pageDone = true; maybeHide(); });
    }
  })();

  /**
   * Helper: select element(s)
   */
  const select = (el, all = false) => {
    el = el.trim();
    if (all) {
      return [...document.querySelectorAll(el)];
    } else {
      return document.querySelector(el);
    }
  };

  /**
   * Helper: add event listener
   */
  const on = (type, el, listener, all = false) => {
    let selectEl = select(el, all);
    if (selectEl) {
      if (all) {
        selectEl.forEach(e => e.addEventListener(type, listener));
      } else {
        selectEl.addEventListener(type, listener);
      }
    }
  };

  /**
   * Helper: scroll event listener
   */
  const onscroll = (el, listener) => {
    el.addEventListener('scroll', listener);
  };

  /**
   * Navbar links active state on scroll
   */
  let navbarlinks = select('#nav-panel .nav-menu .scrollto', true);
  const navbarlinksActive = () => {
    let position = window.scrollY + 200;
    navbarlinks.forEach(navbarlink => {
      if (!navbarlink.hash) return;
      let section = select(navbarlink.hash);
      if (!section) return;
      if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
        navbarlink.classList.add('active');
      } else {
        navbarlink.classList.remove('active');
      }
    });
  };
  window.addEventListener('load', navbarlinksActive);
  onscroll(document, navbarlinksActive);

  /**
   * Smooth scroll to element
   */
  const scrollto = (el) => {
    let element = select(el);
    if (element) {
      window.scrollTo({
        top: element.offsetTop,
        behavior: 'smooth'
      });
    }
  };

  /**
   * Back to top button
   */
  let backtotop = select('.back-to-top');
  if (backtotop) {
    const toggleBacktotop = () => {
      if (window.scrollY > 100) {
        backtotop.classList.add('active');
      } else {
        backtotop.classList.remove('active');
      }
    };
    window.addEventListener('load', toggleBacktotop);
    onscroll(document, toggleBacktotop);
  }

  /**
   * Hamburger Navigation Toggle
   */
  const navToggle = select('#navToggle');
  const navClose = select('#nav-panel .nav-close');

  // Reveal hamburger after loader/page is ready (prevents flash on load)
  window.addEventListener('load', function() {
    setTimeout(function() {
      if (navToggle) navToggle.classList.add('visible');
    }, 200);
  });

  function openNav() {
    document.body.classList.add('nav-open');
  }

  function closeNav() {
    document.body.classList.remove('nav-open');
  }

  if (navToggle) {
    navToggle.addEventListener('click', function(e) {
      e.stopPropagation();
      if (document.body.classList.contains('nav-open')) {
        closeNav();
      } else {
        openNav();
      }
    });
  }

  if (navClose) {
    navClose.addEventListener('click', function() {
      closeNav();
    });
  }

  // Close nav when clicking on page wrapper while nav is open
  const pageWrapper = select('#page-wrapper');
  if (pageWrapper) {
    pageWrapper.addEventListener('click', function() {
      if (document.body.classList.contains('nav-open')) {
        closeNav();
      }
    });
  }

  // Close nav when navigating away from the page (project links, etc.)
  // Links inside nav that go to a different page should close nav first
  const navPageLinks = select('#nav-panel a:not(.scrollto)', true);
  navPageLinks.forEach(link => {
    link.addEventListener('click', function() {
      // External links or page-changing links: close nav
      if (!this.hash || !this.getAttribute('href').startsWith('#')) {
        closeNav();
      }
    });
  });

  /**
   * Scroll with offset on links with class .scrollto
   * On same page: keep nav open, just scroll to section
   * On different page (project pages linking back): close nav and navigate
   */
  on('click', '.scrollto', function(e) {
    const href = this.getAttribute('href');
    const hash = this.hash;

    // If it's a pure anchor link (#section) on the same page
    if (href.startsWith('#') && select(hash)) {
      e.preventDefault();
      // Keep nav open - just scroll to the section
      scrollto(hash);
    }
    // If it's a link to another page with a hash (e.g., ../#portfolio from project pages)
    else if (hash && !href.startsWith('#')) {
      // Close nav and let the browser navigate
      closeNav();
    }
  }, true);

  /**
   * Scroll with offset on page load with hash links
   */
  window.addEventListener('load', () => {
    if (window.location.hash) {
      if (select(window.location.hash)) {
        scrollto(window.location.hash);
      }
    }
  });

  /**
   * Hero typed effect
   */
  const typed = select('.typed');
  if (typed) {
    let typed_strings = typed.getAttribute('data-typed-items');
    typed_strings = typed_strings.split(',');
    new Typed('.typed', {
      strings: typed_strings,
      loop: true,
      typeSpeed: 100,
      backSpeed: 50,
      backDelay: 2000
    });
  }

  /**
   * Portfolio isotope and filter
   */
  window.addEventListener('load', () => {
    let portfolioContainer = select('.portfolio-container');
    if (portfolioContainer) {
      let portfolioIsotope = new Isotope(portfolioContainer, {
        itemSelector: '.portfolio-item'
      });

      let portfolioFilters = select('#portfolio-flters li', true);

      on('click', '#portfolio-flters li', function(e) {
        e.preventDefault();
        portfolioFilters.forEach(function(el) {
          el.classList.remove('filter-active');
        });
        this.classList.add('filter-active');

        // Ensure all items keep their "visible" state across filter changes so
        // they don't replay the stagger-reveal "fly down from top" animation.
        const items = portfolioContainer.querySelectorAll('.portfolio-item.stagger-reveal');
        items.forEach(item => {
          item.classList.add('visible');
          item.style.transitionDelay = '0s';
        });

        portfolioIsotope.arrange({
          filter: this.getAttribute('data-filter')
        });
      }, true);
    }
  });

  /**
   * Portfolio lightbox (for project page galleries if needed)
   */
  const lightboxSelector = select('.portfolio-lightbox');
  if (lightboxSelector) {
    const portfolioLightbox = GLightbox({
      selector: '.portfolio-lightbox'
    });
  }

  /**
   * Portfolio details slider - manual navigation only (no autoplay)
   * Creative slide effect with progress indicator
   */
  const sliderEl = select('.portfolio-details-slider');
  if (sliderEl) {
    const progressBar = select('.slider-progress-bar');
    const totalSlides = sliderEl.querySelectorAll('.swiper-slide').length;

    const detailsSlider = new Swiper('.portfolio-details-slider', {
      speed: 800,
      loop: true,
      effect: 'creative',
      creativeEffect: {
        prev: {
          shadow: false,
          translate: ['-100%', 0, 0],
          opacity: 0
        },
        next: {
          translate: ['100%', 0, 0],
          opacity: 0
        }
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      pagination: {
        el: '.swiper-pagination',
        type: 'bullets',
        clickable: true
      }
    });

    // Update progress bar based on current slide position
    if (progressBar) {
      function updateProgress() {
        const realIndex = detailsSlider.realIndex;
        const percent = ((realIndex + 1) / totalSlides) * 100;
        progressBar.style.width = percent + '%';
      }

      detailsSlider.on('slideChange', () => {
        updateProgress();
      });

      updateProgress();
    }
  }

  /**
   * Resume Lightbox (uses document.getElementById for elements outside #page-wrapper)
   */
  const resumeThumbnail = document.getElementById('resumeThumbnail');
  const resumeViewBtn = document.getElementById('resumeViewBtn');
  const resumeLightbox = document.getElementById('resumeLightbox');
  const resumeLightboxClose = document.getElementById('resumeLightboxClose');

  function openResumeLightbox() {
    if (resumeLightbox) {
      resumeLightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeResumeLightbox() {
    if (resumeLightbox) {
      resumeLightbox.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  if (resumeThumbnail) {
    resumeThumbnail.addEventListener('click', openResumeLightbox);
    resumeThumbnail.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openResumeLightbox();
      }
    });
  }

  if (resumeViewBtn) {
    resumeViewBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      openResumeLightbox();
    });
  }

  if (resumeLightboxClose) {
    resumeLightboxClose.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      closeResumeLightbox();
    });
  }

  // Close lightbox on backdrop click
  if (resumeLightbox) {
    resumeLightbox.addEventListener('click', function(e) {
      if (e.target === resumeLightbox) {
        closeResumeLightbox();
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && resumeLightbox.classList.contains('active')) {
        closeResumeLightbox();
      }
    });
  }

  /**
   * Page transition overlay — fade to black wipe, then wipe away to reveal
   */
  (function initPageTransitions() {
    // Create overlay element
    let overlay = document.querySelector('.page-transition-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'page-transition-overlay';
      document.body.appendChild(overlay);
    }

    // On page load: if we arrived via a transition, play the reveal
    if (sessionStorage.getItem('pageTransitioning')) {
      sessionStorage.removeItem('pageTransitioning');
      document.body.classList.add('page-covered');
      overlay.classList.add('covering');
      // Small delay to ensure paint, then wipe away
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          overlay.classList.remove('covering');
          overlay.classList.add('exiting');
          document.body.classList.remove('page-covered');
          overlay.addEventListener('animationend', function handler() {
            overlay.classList.remove('exiting');
            overlay.removeEventListener('animationend', handler);
          });
        });
      });
    }

    // Handle browser back/forward (bfcache)
    window.addEventListener('pageshow', function(e) {
      if (e.persisted) {
        // Page was restored from bfcache (back/forward)
        document.body.classList.add('page-covered');
        overlay.classList.add('covering');
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            overlay.classList.remove('covering');
            overlay.classList.add('exiting');
            document.body.classList.remove('page-covered');
            overlay.addEventListener('animationend', function handler() {
              overlay.classList.remove('exiting');
              overlay.removeEventListener('animationend', handler);
            });
          });
        });
      }
    });

    // Intercept internal link clicks
    const internalLinks = select('a[href]', true);
    internalLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href && !href.startsWith('#') && !href.startsWith('http') && !href.startsWith('mailto') && !this.getAttribute('target') && !this.hasAttribute('download')) {
          e.preventDefault();
          sessionStorage.setItem('pageTransitioning', '1');
          overlay.classList.add('entering');
          overlay.addEventListener('animationend', function handler() {
            overlay.removeEventListener('animationend', handler);
            window.location.href = href;
          });
        }
      });
    });
  })();

  /**
   * Staggered portfolio item reveal on scroll
   */
  const portfolioItems = select('.portfolio-item', true);
  if (portfolioItems.length > 0) {
    portfolioItems.forEach(item => item.classList.add('stagger-reveal'));

    const portfolioObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Find index among siblings for stagger delay
          const siblings = [...entry.target.parentElement.children].filter(el => el.classList.contains('portfolio-item'));
          const idx = siblings.indexOf(entry.target);
          const row = Math.floor(idx / 3);
          const col = idx % 3;
          entry.target.style.transitionDelay = (row * 0.15 + col * 0.08) + 's';
          entry.target.classList.add('visible');
          portfolioObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    portfolioItems.forEach(item => portfolioObserver.observe(item));
  }

  /**
   * Subtle parallax effect on sections
   */
  const parallaxSections = select('.section-title, .about-img, .resume-thumbnail, .hero-container', true);
  if (parallaxSections.length > 0) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          parallaxSections.forEach(el => {
            const rect = el.getBoundingClientRect();
            const center = rect.top + rect.height / 2;
            const viewCenter = window.innerHeight / 2;
            const offset = (center - viewCenter) * 0.03;
            el.style.transform = `translateY(${offset}px)`;
          });
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  /**
   * Scroll-based animations (Intersection Observer)
   */
  const animateElements = select('.animate-on-scroll', true);
  if (animateElements.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    animateElements.forEach(el => observer.observe(el));
  }

  /**
   * Text reveal animation
   */
  const revealLines = select('.text-reveal-line', true);
  if (revealLines.length > 0) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    revealLines.forEach((el, index) => {
      el.style.transitionDelay = (index * 0.15) + 's';
      revealObserver.observe(el);
    });
  }

  /**
   * AOS (Animate on Scroll) init - with varied animations
   */
  window.addEventListener('load', () => {
    AOS.init({
      duration: 1000,
      easing: 'ease-in-out-cubic',
      once: true,
      mirror: false
    });
  });

  /**
   * Scroll-triggered element animations
   * - Section titles: gradient underline grows on scroll
   * - Parallax depth on hero background
   * - Counter-style number reveals
   * - Subtle scale-in for project cards beyond the stagger-reveal
   */

  // Parallax effect on hero background
  window.addEventListener('scroll', function() {
    var hero = document.getElementById('hero');
    if (!hero) return;
    var scrollY = window.scrollY;
    var heroH = hero.offsetHeight;
    if (scrollY < heroH) {
      var bg = hero.querySelector('.hero-bg');
      if (bg) bg.style.transform = 'translateY(' + (scrollY * 0.3) + 'px)';
      // Fade hero content as user scrolls down
      var container = hero.querySelector('.hero-container');
      if (container) {
        var opacity = 1 - (scrollY / (heroH * 0.7));
        container.style.opacity = Math.max(0, opacity);
      }
    }
  });

  // Reveal section title underlines with a grow animation on scroll
  var titleObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('title-visible');
        titleObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.section-title h2').forEach(function(el) {
    titleObserver.observe(el);
  });

  // Scale-up reveal for project info cards on project pages
  var cardObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('card-visible');
        cardObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  document.querySelectorAll('.project-info, .similar-item').forEach(function(el) {
    el.classList.add('card-reveal');
    cardObserver.observe(el);
  });

  // Fade-slide for contact section content
  var fadeObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.contact-content, .resume-content').forEach(function(el) {
    el.classList.add('fade-reveal');
    fadeObserver.observe(el);
  });

})();
