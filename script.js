(function () {
  'use strict';

  var ANIM_THRESHOLD = 0.12;
  var ANIM_DELAY = 80;

  function initScrollAnimations() {
    var els = document.querySelectorAll('[data-anim]');
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var delay = parseInt(entry.target.getAttribute('data-delay') || '0', 10);
          setTimeout(function () {
            entry.target.classList.add('visible');
          }, delay * ANIM_DELAY);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: ANIM_THRESHOLD });

    els.forEach(function (el) { observer.observe(el); });
  }

  function animateCounters() {
    var counters = document.querySelectorAll('[data-anim] .counter, [data-anim] .stat-val[data-target]');
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseInt(el.getAttribute('data-target'), 10);
        var suffix = el.getAttribute('data-suffix') || '';
        if (!target || el.dataset.counted) return;
        el.dataset.counted = '1';
        var duration = 1500;
        var start = performance.now();
        function step(now) {
          var progress = Math.min((now - start) / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          var current = Math.round(eased * target);
          el.textContent = current + suffix;
          if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        observer.unobserve(el);
      });
    }, { threshold: 0.5 });

    counters.forEach(function (c) { observer.observe(c); });
  }

  function initNav() {
    var toggle = document.getElementById('nav-toggle');
    var nav = document.getElementById('nav');
    if (!toggle || !nav) return;

    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
      toggle.classList.toggle('active');
    });

    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('open');
        toggle.classList.remove('active');
      });
    });
  }

  function initPricingToggle() {
    var btns = document.querySelectorAll('.toggle-btn');
    if (!btns.length) return;

    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        btns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var yearly = btn.getAttribute('data-period') === 'yearly';
        document.querySelectorAll('.pricing-price').forEach(function (price) {
          var monthly = price.getAttribute('data-monthly');
          var yearlyVal = price.getAttribute('data-yearly');
          if (!monthly || monthly === '0') return;
          if (yearly) {
            price.innerHTML = '\u20BD ' + Number(yearlyVal).toLocaleString('ru-RU') + '<span class="pricing-period">/\u043C\u0435\u0441 \u043F\u0440\u0438 \u043E\u043F\u043B\u0430\u0442\u0435 \u0437\u0430 \u0433\u043E\u0434</span>';
          } else {
            price.innerHTML = '\u20BD ' + Number(monthly).toLocaleString('ru-RU') + '<span class="pricing-period">/\u043C\u0435\u0441</span>';
          }
        });
      });
    });
  }

  function initForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      var originalText = btn.textContent;
      btn.textContent = '\u2713 \u041E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u043E!';
      btn.style.background = 'var(--accent-2)';
      btn.disabled = true;
      setTimeout(function () {
        btn.textContent = originalText;
        btn.style.background = '';
        btn.disabled = false;
        form.reset();
      }, 3000);
    });
  }

  function initHeaderScroll() {
    var header = document.getElementById('header');
    if (!header) return;
    var scrolled = false;

    window.addEventListener('scroll', function () {
      if (window.scrollY > 60 && !scrolled) {
        header.style.background = 'rgba(6, 6, 14, 0.95)';
        header.style.borderBottomColor = 'rgba(30, 30, 58, 0.8)';
        scrolled = true;
      } else if (window.scrollY <= 60 && scrolled) {
        header.style.background = 'rgba(6, 6, 14, 0.8)';
        header.style.borderBottomColor = 'rgba(30, 30, 58, 0.5)';
        scrolled = false;
      }
    });
  }

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var target = document.querySelector(link.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  initScrollAnimations();
  animateCounters();
  initNav();
  initPricingToggle();
  initForm();
  initHeaderScroll();
  initSmoothScroll();
})();