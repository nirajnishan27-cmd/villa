/**
 * gallery.js — NIVRRITII Gallery Page
 * Tabs scroll to sections (no filtering/hiding)
 * Lightbox for photo viewing
 */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {

    /* ─────────────────────────────────────────
       TAB → SCROLL TO SECTION
       Each tab maps to a section id.
       No images are hidden — tabs are navigation.
    ───────────────────────────────────────── */
    var TAB_MAP = {
      'all':          null,          // scroll to top of gallery
      'villa':        'sec-villa',
      'bedrooms':     'sec-bedrooms',
      'spaces':       'sec-spaces',
      'outdoor':      'sec-outdoor',
      'beaches':      'sec-beaches',
      'surroundings': 'sec-surroundings'
    };

    function getOffset() {
      // Fixed nav (~62px unscrolled, ~50px scrolled) + filter bar (~46px) + breathing room
      return 120;
    }

    function scrollToSection(sectionId) {
      var el = sectionId ? document.getElementById(sectionId) : document.getElementById('gl-main-start');
      if (!el) el = document.querySelector('.gl-main');
      if (!el) return;
      var top = el.getBoundingClientRect().top + window.pageYOffset - getOffset();
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    }

    /* Highlight active tab on click + scroll */
    var tabs = Array.from(document.querySelectorAll('.gl-tab'));
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');
        var sectionId = TAB_MAP[tab.dataset.filter];
        scrollToSection(sectionId);
      });
    });

    /* Highlight active tab on scroll */
    var sections = [
      { id: 'sec-villa',         filter: 'villa' },
      { id: 'sec-bedrooms',      filter: 'bedrooms' },
      { id: 'sec-spaces',        filter: 'spaces' },
      { id: 'sec-outdoor',       filter: 'outdoor' },
      { id: 'sec-beaches',       filter: 'beaches' },
      { id: 'sec-surroundings',  filter: 'surroundings' }
    ];

    window.addEventListener('scroll', function () {
      var offset = getOffset() + 40;
      var active = null;
      sections.forEach(function (s) {
        var el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= offset) {
          active = s.filter;
        }
      });
      tabs.forEach(function (tab) {
        var isAll = tab.dataset.filter === 'all';
        var match = tab.dataset.filter === active;
        tab.classList.toggle('active', isAll ? !active : match);
      });
    }, { passive: true });

    /* Footer / inline anchor links → scroll with offset */
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#sec-"]');
      if (!a) return;
      var id = a.getAttribute('href').replace('#', '');
      e.preventDefault();
      scrollToSection(id);
    });

    /* ─────────────────────────────────────────
       LIGHTBOX
    ───────────────────────────────────────── */
    var lb      = document.getElementById('gl-lightbox');
    var lbImg   = document.getElementById('gl-lb-img');
    var lbCap   = document.getElementById('gl-lb-caption');
    var lbCount = document.getElementById('gl-lb-counter');
    var lbLoad  = document.getElementById('gl-lb-loading');
    var lbClose = document.getElementById('gl-lb-close');
    var lbPrev  = document.getElementById('gl-lb-prev');
    var lbNext  = document.getElementById('gl-lb-next');

    if (!lb) return;

    var imgList = [];
    var current = 0;

    function buildList() {
      imgList = Array.from(document.querySelectorAll('.gl-item[data-idx]')).map(function (item) {
        var img = item.querySelector('img');
        return {
          src:   img ? img.getAttribute('src') : '',
          alt:   img ? img.alt : '',
          title: item.dataset.title || '',
          idx:   parseInt(item.dataset.idx, 10) || 0
        };
      });
    }

    function openLB(dataIdx) {
      buildList();
      current = imgList.findIndex(function (im) { return im.idx === dataIdx; });
      if (current < 0) current = 0;
      renderLB();
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeLB() {
      lb.classList.remove('open');
      document.body.style.overflow = '';
    }

    function renderLB() {
      if (!imgList.length) return;
      var d = imgList[current];

      // Load higher-res version
      var hiSrc = d.src.replace(/[?].*$/, '') + '?w=1600&q=90';

      lbImg.classList.add('loading');
      if (lbLoad) lbLoad.style.display = 'block';

      var tmp = new Image();
      tmp.onload = function () {
        lbImg.src = hiSrc;
        lbImg.alt = d.alt;
        lbImg.classList.remove('loading');
        if (lbLoad) lbLoad.style.display = 'none';
      };
      tmp.onerror = function () {
        // fallback to original src
        lbImg.src = d.src;
        lbImg.classList.remove('loading');
        if (lbLoad) lbLoad.style.display = 'none';
      };
      tmp.src = hiSrc;

      if (lbCap)   lbCap.textContent   = d.title;
      if (lbCount) lbCount.textContent = (current + 1) + ' / ' + imgList.length;
      if (lbPrev)  lbPrev.disabled = current === 0;
      if (lbNext)  lbNext.disabled = current >= imgList.length - 1;
    }

    function go(dir) {
      current = Math.max(0, Math.min(current + dir, imgList.length - 1));
      renderLB();
    }

    /* Open lightbox on item click */
    document.addEventListener('click', function (e) {
      if (lb.classList.contains('open')) return;
      var item = e.target.closest('.gl-item[data-idx]');
      if (!item) return;
      openLB(parseInt(item.dataset.idx, 10) || 0);
    });

    lbClose.addEventListener('click', closeLB);
    lbPrev.addEventListener('click',  function () { go(-1); });
    lbNext.addEventListener('click',  function () { go(1); });

    lb.addEventListener('click', function (e) {
      if (e.target === lb) closeLB();
    });

    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape')     closeLB();
      if (e.key === 'ArrowLeft')  go(-1);
      if (e.key === 'ArrowRight') go(1);
    });

    /* Touch swipe in lightbox */
    var swipeX = 0;
    lb.addEventListener('touchstart', function (e) {
      swipeX = e.touches[0].clientX;
    }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      var delta = swipeX - e.changedTouches[0].clientX;
      if (Math.abs(delta) > 60) go(delta > 0 ? 1 : -1);
    });

  }); // DOMContentLoaded

})();