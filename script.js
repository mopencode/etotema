(function () {
  'use strict';

  var ANIM_THRESHOLD = 0.15;

  function initScrollAnimations() {
    var els = document.querySelectorAll('[data-anim]');
    if (!els.length) return;
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: ANIM_THRESHOLD });
    els.forEach(function (el) { obs.observe(el); });
  }

  function initCountUp() {
    var els = document.querySelectorAll('.stat-value, .metric-value');
    var animated = new Set();

    function animate(el) {
      if (animated.has(el)) return;
      animated.add(el);

      var target = parseInt(el.dataset.target, 10);
      if (isNaN(target)) return;

      var duration = 1500;
      var start = performance.now();
      var suffix = el.dataset.suffix || '';

      function tick(now) {
        var progress = Math.min((now - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var current = Math.floor(eased * target);
        el.textContent = current.toLocaleString('ru-RU') + suffix;
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = target.toLocaleString('ru-RU') + suffix;
      }

      requestAnimationFrame(tick);
    }

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animate(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: ANIM_THRESHOLD });

    els.forEach(function (el) { obs.observe(el); });
  }

  function initPlayground() {
    var runBtn = document.getElementById('pg-run');
    var input = document.getElementById('pg-input');
    var output = document.getElementById('pg-output');
    var meta = document.getElementById('pg-meta');
    var model = document.getElementById('pg-model');

    if (!runBtn || !input || !output) return;

    var responses = {
      'etotema-4': [
        'Анализирую входные данные...',
        'Определяю ключевые сущности: продажи, Q1, тренды',
        'Генерирую структурированный отчёт...',
        '',
        '## Отчёт по продажам Q1',
        '',
        '**Общие показатели:**',
        '• Выручка: +18% к Q4 прошлого года',
        '• Средний чек: вырос на 7%',
        '• Конверсия: 3.2% → 3.8%',
        '',
        '**Три основных тренда:**',
        '1. Рост онлайн-продаж на 34%',
        '2. Увеличение доли мобильного трафика до 62%',
        '3. Повторные покупки выросли на 21%',
        '',
        '**Рекомендация:** усилить мобильный канал и программу лояльности.'
      ],
      'etotema-mini': [
        'Обработка...',
        '',
        'Краткий анализ:',
        '• Продажи Q1: рост 18%',
        '• Онлайн: +34%, мобильный: 62%',
        '• Повторные покупки: +21%',
        '',
        'Рекомендация:investment in mobile.'
      ],
      'etotema-vision': [
        'Визуальный анализ...',
        '',
        '📊 Детекция объектов: 3 графика',
        '📈 Трендовая линия: восходящая',
        '🔍 Аномалии: peak в середине марта',
        '',
        'Автоматический отчёт сгенерирован.',
        'Точность распознавания: 97.3%'
      ]
    };

    var typing = false;

    runBtn.addEventListener('click', function () {
      if (typing) return;
      var text = input.value.trim();
      if (!text) {
        input.focus();
        return;
      }

      typing = true;
      runBtn.disabled = true;
      runBtn.textContent = 'Обработка...';

      output.innerHTML = '';
      output.classList.add('processing');

      var selected = model.value;
      var lines = responses[selected] || responses['etotema-4'];
      var tokens = 0;
      var startTime = Date.now();

      meta.textContent = '';

      function typeLines(i) {
        if (i >= lines.length) {
          var elapsed = Date.now() - startTime;
          output.classList.remove('processing');
          tokens = Math.floor(text.length * 1.7 + lines.reduce(function (s, l) { return s + l.length; }, 0) * 0.6);
          meta.textContent = tokens + ' токенов · ' + (elapsed / 1000).toFixed(1) + 'с · ' + selected;
          typing = false;
          runBtn.disabled = false;
          runBtn.textContent = 'Запустить';
          return;
        }

        var line = lines[i];
        var div = document.createElement('div');
        div.className = 'pg-result-line' + (line.startsWith('##') || line.startsWith('**Общие') ? '' : '');
        if (line.indexOf('Рекомендация') !== -1 || line.indexOf('investment') !== -1) {
          div.classList.add('success');
        }
        output.appendChild(div);

        if (line === '') {
          div.innerHTML = '&nbsp;';
          setTimeout(function () { typeLines(i + 1); }, 100);
          return;
        }

        var charIndex = 0;
        var speed = Math.max(8, 25 - Math.floor(line.length / 10));

        function typeChar() {
          if (charIndex < line.length) {
            div.textContent = line.substring(0, charIndex + 1);
            charIndex++;
            setTimeout(typeChar, speed);
          } else {
            setTimeout(function () { typeLines(i + 1); }, 80);
          }
        }
        typeChar();
      }

      setTimeout(function () { typeLines(0); }, 400);
    });
  }

  function initCalculator() {
    var typeBtns = document.querySelectorAll('#calc-type .calc-option');
    var complexityRange = document.getElementById('calc-complexity');
    var timelineRange = document.getElementById('calc-timeline');
    var complexityValue = document.getElementById('complexity-value');
    var timelineValue = document.getElementById('timeline-value');
    var priceEl = document.getElementById('calc-price');

    if (!complexityRange || !priceEl) return;

    var currentType = 'audit';
    var complexityLabels = ['Простая', 'Простая', 'Средняя', 'Сложная', 'Сложная'];
    var basePrices = { audit: 400000, custom: 1500000, api: 600000, training: 300000 };

    typeBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        typeBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        currentType = btn.dataset.value;
        update();
      });
    });

    function update() {
      var complexity = parseInt(complexityRange.value);
      var weeks = parseInt(timelineRange.value);
      complexityValue.textContent = complexityLabels[complexity - 1] || 'Средняя';
      timelineValue.textContent = weeks;

      var base = basePrices[currentType] || 600000;
      var multiplier = 0.5 + (complexity * 0.3);
      var rush = weeks <= 2 ? 1.3 : weeks <= 4 ? 1.0 : 0.85;
      var price = Math.round(base * multiplier * rush / 10000) * 10000;

      priceEl.textContent = '\u20BD ' + price.toLocaleString('ru-RU');
    }

    complexityRange.addEventListener('input', update);
    timelineRange.addEventListener('input', update);
    update();
  }

  function initPricing() {
    var periods = document.querySelectorAll('.pricing-period');
    var amounts = document.querySelectorAll('.pricing-amount');
    var yearly = false;

    periods.forEach(function (p) {
      p.addEventListener('click', function () {
        periods.forEach(function (pp) { pp.classList.remove('active'); });
        p.classList.add('active');
        yearly = p.dataset.period === 'yearly';
        amounts.forEach(function (el) {
          var monthly = el.dataset.monthly;
          var annual = el.dataset.yearly;
          if (monthly === '0') return;
          var val = yearly ? parseInt(annual, 10) : parseInt(monthly, 10);
          el.innerHTML = '\u20BD ' + val.toLocaleString('ru-RU') + '<span class="pricing-period-label">/' + (yearly ? '\u043C\u0435\u0441' : '\u043C\u0435\u0441') + '</span>';
        });
      });
    });
  }

  function initNavToggle() {
    var toggle = document.getElementById('nav-toggle');
    var nav = document.getElementById('nav');
    if (!toggle || !nav) return;

    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });

    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('open');
      });
    });
  }

  function initHeaderScroll() {
    var header = document.querySelector('.header');
    if (!header) return;
    var lastScroll = 0;

    window.addEventListener('scroll', function () {
      var st = window.pageYOffset;
      if (st > 80) {
        header.style.borderBottomColor = 'var(--border)';
      } else {
        header.style.borderBottomColor = 'transparent';
      }
      lastScroll = st;
    }, { passive: true });
  }

  function initContactForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      btn.textContent = 'Отправлено ✓';
      btn.disabled = true;
      btn.style.background = 'var(--success)';
      setTimeout(function () {
        btn.textContent = 'Отправить заявку';
        btn.disabled = false;
        btn.style.background = '';
        form.reset();
      }, 3000);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initScrollAnimations();
    initCountUp();
    initPlayground();
    initCalculator();
    initPricing();
    initNavToggle();
    initHeaderScroll();
    initContactForm();
  });
})();