/**
 * area-guide.js
 * NIVRRITII Villa — Area Guide interactions
 *
 * Handles:
 *   - Beach accordion open / close
 *   - Restaurant carousel per beach
 *   - Sticky nav scroll behaviour + active tab tracking
 *   - Custom cursor (isolated so it never clashes with main.js)
 */

(function () {
  'use strict';

  /* ============================================
     ACCORDION
     ============================================ */

  /**
   * Toggle a beach accordion panel open or closed.
   * Exposed on window so inline onclick attributes can call it.
   * @param {string} beachId  — matches [data-beach] attribute
   */
  function toggleBeach(beachId) {
    var item   = document.querySelector('[data-beach="' + beachId + '"]');
    if (!item) return;

    var isOpen = item.classList.contains('open');

    // Close every open panel first
    document.querySelectorAll('.beach-item.open').forEach(function (el) {
      el.classList.remove('open');
      el.querySelector('.beach-trigger').setAttribute('aria-expanded', 'false');
    });

    // If this panel was closed, open it
    if (!isOpen) {
      item.classList.add('open');
      item.querySelector('.beach-trigger').setAttribute('aria-expanded', 'true');

      // Lazy-init the carousel on first open
      var carouselShell = item.querySelector('.cs');
      if (carouselShell && carouselShell.dataset.carousel) {
        initCarousel(carouselShell.dataset.carousel);
      }

      // Smooth scroll so the header is visible
      setTimeout(function () {
        item.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    }
  }

  // Make globally accessible for onclick attributes
  window.toggleBeach = toggleBeach;


  /* ============================================
     CAROUSEL
     ============================================ */

  var carousels = {};   // registry — prevents double-init

  /**
   * Initialise a carousel inside an accordion panel.
   * @param {string} id — matches [data-carousel] attribute
   */
  function initCarousel(id) {
    if (carousels[id]) return;   // already initialised

    var shell   = document.querySelector('[data-carousel="' + id + '"]');
    if (!shell) return;

    var track   = shell.querySelector('.ct');
    var cards   = Array.from(track.querySelectorAll('.rc'));
    var dotsEl  = shell.querySelector('.c-dots');
    var prevBtn = shell.querySelector('.ca.prev');
    var nextBtn = shell.querySelector('.ca.next');
    var arrows  = shell.querySelector('.c-arrows');

    if (!cards.length) return;

    var currentIdx = 0;

    /** How many cards fit side-by-side at the current viewport width */
    function visibleCount() {
      var w = shell.offsetWidth;
      if (w < 500) return 1;
      if (w < 860) return 2;
      return 3;
    }

    /** Maximum slide index */
    function maxIndex() {
      return Math.max(0, cards.length - visibleCount());
    }

    /** Rebuild dot indicators to match current slide count */
    function buildDots() {
      dotsEl.innerHTML = '';
      var total = maxIndex() + 1;

      // Hide controls when everything fits on one screen
      var hide = total <= 1;
      if (arrows) arrows.style.display = hide ? 'none' : 'flex';
      if (hide) return;

      for (var i = 0; i < total; i++) {
        (function (idx) {
          var dot = document.createElement('button');
          dot.className  = 'cdot' + (idx === currentIdx ? ' on' : '');
          dot.setAttribute('aria-label', 'Slide ' + (idx + 1));
          dot.onclick    = function () { goTo(idx); };
          dotsEl.appendChild(dot);
        })(i);
      }
    }

    /** Refresh arrow disabled states and dot highlight */
    function updateControls() {
      if (prevBtn) prevBtn.disabled = currentIdx === 0;
      if (nextBtn) nextBtn.disabled = currentIdx >= maxIndex();

      dotsEl.querySelectorAll('.cdot').forEach(function (dot, i) {
        dot.classList.toggle('on', i === currentIdx);
      });
    }

    /** Slide to a specific index */
    function goTo(idx) {
      currentIdx = Math.max(0, Math.min(idx, maxIndex()));

      // Calculate pixel offset: card width + 1rem gap (16px)
      var cardWidth = cards[0].offsetWidth;
      var gap       = 16;
      track.style.transform = 'translateX(-' + (currentIdx * (cardWidth + gap)) + 'px)';

      updateControls();
    }

    // Arrow buttons
    if (prevBtn) prevBtn.addEventListener('click', function () { goTo(currentIdx - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { goTo(currentIdx + 1); });

    // Touch / swipe support
    var touchStartX = 0;
    track.addEventListener('touchstart', function (e) {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });
    track.addEventListener('touchend', function (e) {
      var delta = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(delta) > 50) {
        goTo(currentIdx + (delta > 0 ? 1 : -1));
      }
    });

    // Re-evaluate on resize (breakpoint changes visible count)
    window.addEventListener('resize', function () {
      buildDots();
      goTo(Math.min(currentIdx, maxIndex()));
    });

    buildDots();
    updateControls();

    carousels[id] = { goTo: goTo };   // register
  }


  /* ============================================
     NAV — scroll state + active section tab
     ============================================ */

  var nav      = document.getElementById('ag-nav');
  var tabs     = Array.from(document.querySelectorAll('.gtab'));
  var sections = ['beaches', 'secret', 'party', 'cafes', 'activities'];

  function onScroll() {
    // Frosted nav after 60px
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 60);

    // Active tab: last section whose top edge has scrolled past
    var activeId = sections[0];
    sections.forEach(function (id) {
      var el = document.getElementById(id);
      if (el && window.scrollY >= el.offsetTop - 160) activeId = id;
    });

    tabs.forEach(function (tab) {
      tab.classList.toggle('on', tab.getAttribute('href') === '#' + activeId);
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });


  /* ============================================
     CUSTOM CURSOR
     Fully isolated — no global var declarations
     that could clash with main.js
     ============================================ */

  (function initCursor() {
    var dot  = document.getElementById('cursor');
    var ring = document.getElementById('cring');
    if (!dot || !ring) return;

    var mouseX = 0, mouseY = 0;
    var ringX  = 0, ringY  = 0;

    document.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left = mouseX + 'px';
      dot.style.top  = mouseY + 'px';
    });

    function animateCursor() {
      // Smooth lag on ring
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      ring.style.left = ringX + 'px';
      ring.style.top  = ringY + 'px';
      requestAnimationFrame(animateCursor);
    }
    animateCursor();
  })();

})();