/* HABITURE — scroll choreography */
(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* ?static — verification mode: everything visible, no motion */
  if (location.search.indexOf('static') !== -1) {
    reduced = true;
    document.documentElement.classList.add('static-mode');
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
    document.querySelectorAll('.stat-n').forEach(function (el) {
      el.textContent = el.getAttribute('data-count') + (el.getAttribute('data-suffix') || '');
    });
    document.querySelectorAll('img[loading]').forEach(function (el) { el.loading = 'eager'; });
    var m = location.search.match(/y=(\d+)/);
    if (m) document.body.style.transform = 'translateY(-' + m[1] + 'px)';
  }

  /* year */
  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  /* nav: appears after hero */
  var nav = document.getElementById('nav');
  var hero = document.querySelector('.hero');
  function onScroll() {
    var past = window.scrollY > (hero ? hero.offsetHeight * 0.72 : 400);
    nav.classList.toggle('show', past);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* reveals */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

  /* counters */
  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var suffix = el.getAttribute('data-suffix') || '';
    var t0 = null, dur = 1600;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    if (reduced) { el.textContent = target + suffix; return; }
    requestAnimationFrame(step);
  }
  var cio = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        animateCount(e.target);
        cio.unobserve(e.target);
      }
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('.stat-n').forEach(function (el) { cio.observe(el); });

  /* parallax */
  if (!reduced) {
    var frames = Array.prototype.slice.call(document.querySelectorAll('.parallax-frame'));
    var ticking = false;
    function parallax() {
      frames.forEach(function (f) {
        var r = f.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) return;
        var img = f.querySelector('.parallax');
        if (!img) return;
        var progress = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
        img.style.transform = 'translateY(' + (progress * -9) + '%)';
      });
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { requestAnimationFrame(parallax); ticking = true; }
    }, { passive: true });
    parallax();
  }

  /* horizontal gallery: drag to scroll */
  var gal = document.querySelector('.h-gallery');
  if (gal) {
    var isDown = false, startX = 0, startLeft = 0;
    gal.addEventListener('pointerdown', function (e) {
      isDown = true; startX = e.clientX; startLeft = gal.scrollLeft;
      gal.classList.add('grabbing');
    });
    window.addEventListener('pointermove', function (e) {
      if (!isDown) return;
      gal.scrollLeft = startLeft - (e.clientX - startX);
    });
    window.addEventListener('pointerup', function () {
      isDown = false; gal.classList.remove('grabbing');
    });
    /* gentle auto-hint: nudge on first reveal */
    var gio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && !reduced) {
          gal.scrollTo({ left: 60, behavior: 'smooth' });
          setTimeout(function () { gal.scrollTo({ left: 0, behavior: 'smooth' }); }, 700);
          gio.unobserve(gal);
        }
      });
    }, { threshold: 0.5 });
    gio.observe(gal);
  }
})();
