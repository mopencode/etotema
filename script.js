(function () {
  'use strict';

  var ANIM_THRESHOLD = 0.12;
  var ANIM_DELAY = 80;
  var TYPING_WORDS = ['искусственный интеллект', 'автоматизацию', 'нейросети', 'компьютерное зрение', 'NLP-решения'];
  var TYPING_SPEED = 60;
  var TYPING_PAUSE = 2000;
  var TYPING_DELETE_SPEED = 30;

  function initParticles() {
    var canvas = document.getElementById('particles');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var particles = [];
    var mouse = { x: -1000, y: -1000 };
    var count = window.innerWidth < 640 ? 25 : 50;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    for (var i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.5 + 0.5
      });
    }

    document.addEventListener('mousemove', function (e) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      var isLight = document.body.classList.contains('light-theme');
      var lineColor = isLight ? '108,92,231' : '108,92,231';
      var dotColor = isLight ? '0.5' : '0.3';
      var dotColorNear = isLight ? '0.9' : '0.8';

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        var dx = mouse.x - p.x;
        var dy = mouse.y - p.y;
        var dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 150) {
          p.x -= dx * 0.008;
          p.y -= dy * 0.008;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + lineColor + ',' + (dist < 120 ? dotColorNear : dotColor) + ')';
        ctx.fill();

        for (var j = i + 1; j < particles.length; j++) {
          var p2 = particles[j];
          var d = Math.sqrt((p.x - p2.x) ** 2 + (p.y - p2.y) ** 2);
          if (d < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = 'rgba(' + lineColor + ',' + (0.12 * (1 - d / 120)) + ')';
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(draw);
    }
    draw();
  }

  function initCursorGlow() {
    var glow = document.getElementById('cursor-glow');
    if (!glow || window.innerWidth < 900) return;
    document.addEventListener('mousemove', function (e) {
      glow.style.left = e.clientX + 'px';
      glow.style.top = e.clientY + 'px';
    });
  }

  function initTyping() {
    var target = document.getElementById('typing-target');
    if (!target) return;
    var wordIndex = 0;
    var charIndex = 0;
    var deleting = false;

    function tick() {
      var word = TYPING_WORDS[wordIndex];
      if (!deleting) {
        charIndex++;
        target.textContent = word.substring(0, charIndex);
        if (charIndex >= word.length) {
          deleting = true;
          setTimeout(tick, TYPING_PAUSE);
          return;
        }
        setTimeout(tick, TYPING_SPEED);
      } else {
        charIndex--;
        target.textContent = word.substring(0, charIndex);
        if (charIndex <= 0) {
          deleting = false;
          wordIndex = (wordIndex + 1) % TYPING_WORDS.length;
          setTimeout(tick, 400);
          return;
        }
        setTimeout(tick, TYPING_DELETE_SPEED);
      }
    }
    setTimeout(tick, 800);
  }

  function initScrollAnimations() {
    var els = document.querySelectorAll('[data-anim]');
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var delay = parseInt(entry.target.getAttribute('data-delay') || '0', 10);
          setTimeout(function () { entry.target.classList.add('visible'); }, delay * ANIM_DELAY);
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
          el.textContent = Math.round(eased * target) + suffix;
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

  function initScrollSpy() {
    var sections = document.querySelectorAll('section[id]');
    var navLinks = document.querySelectorAll('.nav a[href^="#"]');
    function update() {
      var scrollPos = window.scrollY + 120;
      sections.forEach(function (section) {
        var top = section.offsetTop;
        var height = section.offsetHeight;
        var id = section.getAttribute('id');
        if (scrollPos >= top && scrollPos < top + height) {
          navLinks.forEach(function (link) {
            link.classList.remove('active-nav');
            if (link.getAttribute('href') === '#' + id) link.classList.add('active-nav');
          });
        }
      });
    }
    window.addEventListener('scroll', update);
    update();
  }

  function initCardTilt() {
    if (window.innerWidth < 768) return;
    var cards = document.querySelectorAll('.card-tilt');
    cards.forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var rotateX = (y - rect.height / 2) / (rect.height / 2) * -6;
        var rotateY = (x - rect.width / 2) / (rect.width / 2) * 6;
        card.style.transform = 'perspective(800px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateY(-4px)';
      });
      card.addEventListener('mouseleave', function () { card.style.transform = ''; });
      card.addEventListener('click', function () {
        var modalId = card.getAttribute('data-modal');
        if (modalId) openModal(modalId);
      });
    });
  }

  function initMagnetic() {
    if (window.innerWidth < 768) return;
    var els = document.querySelectorAll('.magnetic');
    els.forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var rect = el.getBoundingClientRect();
        var x = e.clientX - rect.left - rect.width / 2;
        var y = e.clientY - rect.top - rect.height / 2;
        el.style.transform = 'translate(' + (x * 0.15) + 'px, ' + (y * 0.15) + 'px)';
      });
      el.addEventListener('mouseleave', function () {
        el.style.transform = '';
      });
    });
  }

  function initTimelineProgress() {
    var items = document.querySelectorAll('.timeline-item');
    var fill = document.getElementById('progress-fill');
    var markers = document.querySelectorAll('.timeline-marker');
    if (!fill || !items.length) return;

    function update() {
      var sectionEl = items[0].closest('section');
      var scrollTop = window.scrollY + window.innerHeight * 0.6;
      var sectionTop = sectionEl.offsetTop;
      var sectionHeight = sectionEl.offsetHeight;
      var progress = Math.min(Math.max((scrollTop - sectionTop) / sectionHeight, 0), 1);
      fill.style.width = (progress * 100) + '%';
      var activeIndex = Math.min(Math.floor(progress * items.length), items.length - 1);
      markers.forEach(function (m, i) {
        if (i <= activeIndex) m.classList.add('active');
        else m.classList.remove('active');
      });
    }
    window.addEventListener('scroll', update);
    update();
  }

  function initROI() {
    var empSlider = document.getElementById('roi-employees');
    var hrsSlider = document.getElementById('roi-hours');
    var rateSlider = document.getElementById('roi-rate');
    if (!empSlider) return;

    var empVal = document.getElementById('roi-employees-val');
    var hrsVal = document.getElementById('roi-hours-val');
    var rateVal = document.getElementById('roi-rate-val');
    var hoursSaved = document.getElementById('roi-hours-saved');
    var moneySaved = document.getElementById('roi-money-saved');
    var payback = document.getElementById('roi-payback');

    function updateSliderFill(slider) {
      var pct = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
      slider.style.background = 'linear-gradient(to right, #6c5ce7 0%, #6c5ce7 ' + pct + '%, #161628 ' + pct + '%, #161628 100%)';
    }

    function calc() {
      var emp = parseInt(empSlider.value, 10);
      var hrs = parseInt(hrsSlider.value, 10);
      var rate = parseInt(rateSlider.value, 10);

      empVal.textContent = emp;
      hrsVal.textContent = hrs;
      rateVal.textContent = rate.toLocaleString('ru-RU');

      updateSliderFill(empSlider);
      updateSliderFill(hrsSlider);
      updateSliderFill(rateSlider);

      var sHrs = Math.round(emp * hrs * 0.4 * 4);
      var sMoney = Math.round(sHrs * rate);

      hoursSaved.textContent = sHrs.toLocaleString('ru-RU');
      moneySaved.textContent = '\u20BD ' + sMoney.toLocaleString('ru-RU');

      var months = Math.ceil(450000 / sMoney);
      if (months < 1) months = 1;
      payback.textContent = months === 1 ? '~1 \u043C\u0435\u0441' : '~' + months + ' \u043C\u0435\u0441';
    }

    empSlider.addEventListener('input', calc);
    hrsSlider.addEventListener('input', calc);
    rateSlider.addEventListener('input', calc);
    calc();
  }

  function initCasesCarousel() {
    var track = document.getElementById('cases-track');
    var dotsContainer = document.getElementById('cases-dots');
    var leftBtn = document.getElementById('case-left');
    var rightBtn = document.getElementById('case-right');
    if (!track || !dotsContainer) return;

    var cards = track.querySelectorAll('.case-card');
    var numPages = Math.ceil(cards.length / 1);
    var currentPage = 0;

    function buildDots() {
      dotsContainer.innerHTML = '';
      var pages = window.innerWidth <= 640 ? cards.length : Math.ceil(cards.length / 2);
      for (var i = 0; i < pages; i++) {
        var dot = document.createElement('div');
        dot.className = 'cases-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('data-index', i);
        dot.addEventListener('click', function () {
          var idx = parseInt(this.getAttribute('data-index'), 10);
          scrollToCard(idx);
        });
        dotsContainer.appendChild(dot);
      }
    }

    function scrollToCard(idx) {
      var cardWidth = cards[0].offsetWidth + 20;
      track.scrollTo({ left: idx * cardWidth, behavior: 'smooth' });
      currentPage = idx;
      updateDots();
    }

    function updateDots() {
      dotsContainer.querySelectorAll('.cases-dot').forEach(function (d, i) {
        d.classList.toggle('active', i === currentPage);
      });
    }

    leftBtn.addEventListener('click', function () {
      if (currentPage > 0) scrollToCard(currentPage - 1);
    });
    rightBtn.addEventListener('click', function () {
      var maxPage = window.innerWidth <= 640 ? cards.length - 1 : Math.ceil(cards.length / 2) - 1;
      if (currentPage < maxPage) scrollToCard(currentPage + 1);
    });

    track.addEventListener('scroll', function () {
      var cardWidth = cards[0].offsetWidth + 20;
      currentPage = Math.round(track.scrollLeft / cardWidth);
      updateDots();
    });

    buildDots();
  }

  function initFAQ() {
    var items = document.querySelectorAll('.faq-item');
    items.forEach(function (item) {
      var btn = item.querySelector('.faq-question');
      btn.addEventListener('click', function () {
        var wasOpen = item.classList.contains('open');
        items.forEach(function (i) { i.classList.remove('open'); });
        if (!wasOpen) item.classList.add('open');
      });
    });
  }

  var modalData = {
    audit: {
      title: 'AI-аудит',
      body: '<p>Комплексный анализ бизнес-процессов для выявления точек применения AI.</p><ul><li>Карта процессов и bbox automated-потенциала</li><li>ROI-модель для каждого кейса</li><li>Приоритизированная дорожная карта</li><li>Оценка данных и готовности инфраструктуры</li><li>Срок: 2–5 дней</li><li>Стоимость: от 150 000 ₽</li></ul>'
    },
    models: {
      title: 'Кастомные модели',
      body: '<p>Обучение и деплоймент AI-моделей под ваши данные и задачи.</p><ul><li>Fine-tuning GPT, Llama, Mistral</li><li>RAG-системы на ваших данных</li><li>Дистилляция и оптимизация инференса</li><li>Локальное развёртывание (on-premise)</li><li>Срок: 1–3 недели</li><li>Стоимость: от 300 000 ₽</li></ul>'
    },
    api: {
      title: 'Интеграция API',
      body: '<p>Подключение и настройка AI-сервисов в вашу инфраструктуру.</p><ul><li>GPT-4, Claude, Gemini, Llama</li><li>Безопасное проксирование и мониторинг</li><li>Rate limiting и fallback-стратегии</li><li>Админ-панель и аналитика</li><li>Срок: 1–2 недели</li><li>Стоимость: от 200 000 ₽</li></ul>'
    },
    training: {
      title: 'Обучение команды',
      body: '<p>Практические воркшопы по работе с AI для вашей команды.</p><ul><li>Промпт-инжиниринг: от баз до продвинутых техник</li><li>Работа с API и автоматизация</li><li>AI-безопасность и комплаенс</li><li>Персональный план развития</li><li>Срок: 3–5 дней</li><li>Стоимость: от 100 000 ₽</li></ul>'
    }
  };

  function initModals() {
    var overlay = document.getElementById('modal-overlay');
    var closeBtn = document.getElementById('modal-close');
    if (!overlay) return;

    function closeModal() {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });
  }

  window.openModal = function (id) {
    var data = modalData[id];
    if (!data) return;
    document.getElementById('modal-title').textContent = data.title;
    document.getElementById('modal-body').innerHTML = data.body;
    document.getElementById('modal-overlay').classList.add('open');
    document.body.style.overflow = 'hidden';
  };

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
      var btn = document.getElementById('submit-btn');
      btn.textContent = 'Отправка...';
      btn.disabled = true;
      fireConfetti();
      showToast('Заявка отправлена! Мы свяжемся с вами в течение 4 часов.');
    });
  }

  function fireConfetti() {
    var canvas = document.getElementById('confetti');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    var pieces = [];
    var colors = ['#6366f1', '#818cf8', '#f59e0b', '#fbbf24', '#a78bfa', '#34d399'];
    var confettiCount = 150;

    for (var i = 0; i < confettiCount; i++) {
      pieces.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        r: Math.random() * 8 + 4,
        d: Math.random() * confettiCount,
        color: colors[Math.floor(Math.random() * colors.length)],
        tilt: Math.random() * 10 - 5,
        tiltAngleIncremental: Math.random() * 0.07 + 0.05,
        tiltAngle: 0,
        swing: Math.random() * 3 + 2
      });
    }

    var startTime = performance.now();
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      var elapsed = performance.now() - startTime;
      if (elapsed > 3000) { ctx.clearRect(0, 0, canvas.width, canvas.height); return; }

      var opacity = elapsed > 2000 ? 1 - (elapsed - 2000) / 1000 : 1;
      pieces.forEach(function (p) {
        p.tiltAngle += p.tiltAngleIncremental;
        p.y += p.swing;
        p.x += Math.sin(p.tiltAngle) * 2;
        p.tilt = Math.sin(p.tiltAngle) * 12;

        ctx.globalAlpha = opacity;
        ctx.beginPath();
        ctx.lineWidth = p.r / 2;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + p.r, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r);
        ctx.stroke();
      });
      requestAnimationFrame(draw);
    }
    draw();
  }

  function initBackToTop() {
    var btn = document.getElementById('back-to-top');
    var ring = document.getElementById('progress-ring');
    if (!btn || !ring) return;
    var circumference = 2 * Math.PI * 18;
    ring.style.strokeDasharray = circumference;
    ring.style.strokeDashoffset = circumference;

    window.addEventListener('scroll', function () {
      var scrollY = window.scrollY;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var progress = docHeight > 0 ? scrollY / docHeight : 0;
      ring.style.strokeDashoffset = circumference - (progress * circumference);

      if (scrollY > 400) btn.classList.add('visible');
      else btn.classList.remove('visible');
    });

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  function initThemeToggle() {
    var btn = document.getElementById('theme-toggle');
    if (!btn) return;
    var saved = localStorage.getItem('theme');
    if (saved === 'light') {
      document.body.classList.add('light-theme');
      btn.textContent = '\u263E';
    }

    btn.addEventListener('click', function () {
      document.body.classList.toggle('light-theme');
      var isLight = document.body.classList.contains('light-theme');
      btn.textContent = isLight ? '\u263E' : '\u2600';
      localStorage.setItem('theme', isLight ? 'light' : 'dark');
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

  function initTagHover() {
    var tags = document.querySelectorAll('[data-tag-hover]');
    tags.forEach(function (tag) {
      tag.addEventListener('mouseenter', function () {
        tag.style.transform = 'translateY(-2px) scale(1.05)';
      });
      tag.addEventListener('mouseleave', function () {
        tag.style.transform = '';
      });
    });
  }

  function initRipple() {
    var btns = document.querySelectorAll('.btn');
    btns.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        var rect = btn.getBoundingClientRect();
        var ripple = document.createElement('span');
        ripple.className = 'ripple';
        var size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
        ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
        btn.appendChild(ripple);
        setTimeout(function () { ripple.remove(); }, 600);
      });
    });
  }

  function showToast(message) {
    var existing = document.querySelector('.toast');
    if (existing) existing.remove();
    var toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        toast.classList.add('show');
      });
    });
    setTimeout(function () {
      toast.classList.remove('show');
      setTimeout(function () { toast.remove(); }, 400);
    }, 3500);
  }

  initParticles();
  initCursorGlow();
  initTyping();
  initScrollAnimations();
  animateCounters();
  initNav();
  initScrollSpy();
  initCardTilt();
  initMagnetic();
  initTimelineProgress();
  initROI();
  initCasesCarousel();
  initFAQ();
  initModals();
  initPricingToggle();
  initForm();
  initBackToTop();
  initThemeToggle();
  initHeaderScroll();
  initSmoothScroll();
  initTagHover();
  initRipple();
})();