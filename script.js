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
    var count = window.innerWidth < 640 ? 30 : 60;

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
          p.x -= dx * 0.01;
          p.y -= dy * 0.01;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = dist < 120 ? 'rgba(108,92,231,0.8)' : 'rgba(108,92,231,0.3)';
        ctx.fill();

        for (var j = i + 1; j < particles.length; j++) {
          var p2 = particles[j];
          var d = Math.sqrt((p.x - p2.x) ** 2 + (p.y - p2.y) ** 2);
          if (d < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = 'rgba(108,92,231,' + (0.15 * (1 - d / 120)) + ')';
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
    var currentText = '';

    function tick() {
      var word = TYPING_WORDS[wordIndex];
      if (!deleting) {
        currentText = word.substring(0, charIndex + 1);
        target.textContent = currentText;
        charIndex++;
        if (charIndex >= word.length) {
          deleting = true;
          setTimeout(tick, TYPING_PAUSE);
          return;
        }
        setTimeout(tick, TYPING_SPEED);
      } else {
        charIndex--;
        currentText = word.substring(0, charIndex);
        target.textContent = currentText;
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
            if (link.getAttribute('href') === '#' + id) {
              link.classList.add('active-nav');
            }
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
        var centerX = rect.width / 2;
        var centerY = rect.height / 2;
        var rotateX = (y - centerY) / centerY * -6;
        var rotateY = (x - centerX) / centerX * 6;

        card.style.transform = 'perspective(800px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateY(-4px)';
      });

      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
      });

      card.addEventListener('click', function () {
        var modalId = card.getAttribute('data-modal');
        if (modalId) openModal(modalId);
      });
    });
  }

  function initTimelineProgress() {
    var items = document.querySelectorAll('.timeline-item');
    var fill = document.getElementById('progress-fill');
    var markers = document.querySelectorAll('.timeline-marker');
    if (!fill || !items.length) return;

    function update() {
      var scrollPos = window.scrollY + window.innerHeight * 0.6;
      var sectionTop = items[0].closest('section').offsetTop;
      var sectionHeight = items[0].closest('section').offsetHeight;
      var progress = Math.min(Math.max((scrollPos - sectionTop) / sectionHeight, 0), 1);

      fill.style.width = (progress * 100) + '%';

      var activeIndex = Math.min(Math.floor(progress * items.length), items.length - 1);
      markers.forEach(function (m, i) {
        if (i <= activeIndex) {
          m.classList.add('active');
        } else {
          m.classList.remove('active');
        }
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

    function calc() {
      var emp = parseInt(empSlider.value, 10);
      var hrs = parseInt(hrsSlider.value, 10);
      var rate = parseInt(rateSlider.value, 10);

      empVal.textContent = emp;
      hrsVal.textContent = hrs;
      rateVal.textContent = rate.toLocaleString('ru-RU');

      var savedHrs = Math.round(emp * hrs * 0.4 * 4);
      var savedMoney = Math.round(savedHrs * rate);

      // update slider track fills
      updateSliderFill(empSlider);
      updateSliderFill(hrsSlider);
      updateSliderFill(rateSlider);

      hoursSaved.textContent = savedHrs.toLocaleString('ru-RU');
      moneySaved.textContent = '\u20BD ' + savedMoney.toLocaleString('ru-RU');

      var months = Math.ceil(450000 / savedMoney);
      if (months < 1) months = 1;
      payback.textContent = months === 1 ? '~1 \u043C\u0435\u0441' : '~' + months + ' \u043C\u0435\u0441';
    }

    function updateSliderFill(slider) {
      var pct = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
      slider.style.background = 'linear-gradient(to right, #6c5ce7 0%, #6c5ce7 ' + pct + '%, #161628 ' + pct + '%, #161628 100%)';
    }

    empSlider.addEventListener('input', calc);
    hrsSlider.addEventListener('input', calc);
    rateSlider.addEventListener('input', calc);
    calc();
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

  function initModals() {
    var overlay = document.getElementById('modal-overlay');
    var modal = document.getElementById('modal');
    var closeBtn = document.getElementById('modal-close');
    var title = document.getElementById('modal-title');
    var body = document.getElementById('modal-body');

    if (!overlay) return;

    var modalData = {
      audit: {
        title: 'AI-аудит',
        body: '<p>Комплексный анализ ваших бизнес-процессов для выявления точек применения AI.</p><ul><li>Карта процессов и bbox automated-потенциала</li><li>ROI-модель для каждого кейса</li><li>Приоритизированная дорожная карта</li><li>Оценка данных и готовности инфраструктуры</li><li>Срок: 2–5 дней</li><li>Стоимость: от 150 000 ₽</li></ul>'
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

    window.openModal = function (id) {
      var data = modalData[id];
      if (!data) return;
      title.textContent = data.title;
      body.innerHTML = data.body;
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    };

    function closeModal() {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeModal();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeModal();
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

  initParticles();
  initCursorGlow();
  initTyping();
  initScrollAnimations();
  animateCounters();
  initNav();
  initScrollSpy();
  initCardTilt();
  initTimelineProgress();
  initROI();
  initFAQ();
  initModals();
  initPricingToggle();
  initForm();
  initHeaderScroll();
  initSmoothScroll();
})();