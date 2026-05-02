(function () {
  'use strict';

  var ANIM_THRESHOLD = 0.15;
  var SYSTEM_PROMPT = 'Ты — AI-ассистент компании «Это Тема». Отвечай на русском. Конкретно, структурированно, без воды. Используй **жирный**, списки, заголовки ##.';
  var API_URL = 'https://text.pollinations.ai/openai/chat/completions';
  var MAX_RETRIES = 3;
  var RETRY_DELAY = 2000;

  function initScrollAnimations() {
    var els = document.querySelectorAll('[data-anim]');
    if (!els.length) return;
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
    }, { threshold: ANIM_THRESHOLD });
    els.forEach(function (el) { obs.observe(el); });
  }

  function initCountUp() {
    var els = document.querySelectorAll('.stat-value, .metric-value');
    var done = new Set();
    function anim(el) {
      if (done.has(el)) return; done.add(el);
      var t = parseInt(el.dataset.target, 10); if (isNaN(t)) return;
      var dur = 1500, s = performance.now(), sf = el.dataset.suffix || '';
      function tick(now) {
        var p = Math.min((now - s) / dur, 1);
        el.textContent = Math.floor((1 - Math.pow(1 - p, 3)) * t).toLocaleString('ru-RU') + sf;
        if (p < 1) requestAnimationFrame(tick); else el.textContent = t.toLocaleString('ru-RU') + sf;
      }
      requestAnimationFrame(tick);
    }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { anim(e.target); obs.unobserve(e.target); } });
    }, { threshold: ANIM_THRESHOLD });
    els.forEach(function (el) { obs.observe(el); });
  }

  function renderMarkdown(text) {
    if (!text) return '';
    var h = text;
    h = h.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    h = h.replace(/```(\w*)\n([\s\S]*?)```/g, function (m, l, c) { return '<pre><code>' + c.trim() + '</code></pre>'; });
    h = h.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    h = h.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    h = h.replace(/^# (.+)$/gm, '<h1>$1</h1>');
    h = h.replace(/^---$/gm, '<hr>');
    h = h.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    h = h.replace(/\*(.+?)\*/g, '<em>$1</em>');
    h = h.replace(/`([^`]+)`/g, '<code>$1</code>');
    h = h.replace(/^- (.+)$/gm, '<li>$1</li>');
    h = h.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
    h = h.replace(/(<li>[\s\S]*?<\/li>\s*)+/g, '<ul>$&</ul>');
    h = h.replace(/\n{2,}/g, '</p><p>');
    h = h.replace(/\n/g, '<br>');
    h = '<p>' + h + '</p>';
    h = h.replace(/<p><\/p>/g, '');
    h = h.replace(/<p>(<h[123]>)/g, '$1');
    h = h.replace(/(<\/h[123]>)<\/p>/g, '$1');
    h = h.replace(/<p>(<ul>)/g, '$1');
    h = h.replace(/(<\/ul>)<\/p>/g, '$1');
    h = h.replace(/<p>(<pre>)/g, '$1');
    h = h.replace(/(<\/pre>)<\/p>/g, '$1');
    h = h.replace(/<p>(<hr>)/g, '$1');
    return h;
  }

  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  function initPlayground() {
    var runBtn = document.getElementById('pg-run');
    var input = document.getElementById('pg-input');
    var output = document.getElementById('pg-output');
    var meta = document.getElementById('pg-meta');
    if (!runBtn || !input || !output) return;

    var isProcessing = false;

    function typewriter(text) {
      return new Promise(function (resolve) {
        var i = 0, speed = Math.max(8, Math.min(30, 3000 / (text.length || 1)));
        function step() {
          if (i < text.length) {
            i += Math.min(3, text.length - i);
            output.innerHTML = renderMarkdown(text.substring(0, i));
            output.scrollTop = output.scrollHeight;
            setTimeout(step, speed);
          } else { resolve(); }
        }
        step();
      });
    }

    async function callAI(message, attempt) {
      var attemptNum = attempt || 1;

      try {
        var response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'openai-fast',
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              { role: 'user', content: message }
            ],
            temperature: 0.7,
            max_tokens: 2048
          })
        });

        if (response.status === 429 || response.status === 502 || response.status === 503 || response.status === 500) {
          if (attemptNum < MAX_RETRIES) {
            output.innerHTML = '<div class="pg-result-line" style="color:var(--text-tertiary)">Подключение... попытка ' + (attemptNum + 1) + ' из ' + MAX_RETRIES + '</div>';
            await sleep(RETRY_DELAY * attemptNum);
            return callAI(message, attemptNum + 1);
          }
          throw new Error('Сервер временно занят. Подождите 10 секунд и попробуйте снова.');
        }

        if (!response.ok) {
          throw new Error('Ошибка (' + response.status + '). Попробуйте позже.');
        }

        var contentType = response.headers.get('content-type') || '';
        if (contentType.indexOf('json') === -1) {
          if (attemptNum < MAX_RETRIES) {
            output.innerHTML = '<div class="pg-result-line" style="color:var(--text-tertiary)">Переподключение... попытка ' + (attemptNum + 1) + '</div>';
            await sleep(RETRY_DELAY * attemptNum);
            return callAI(message, attemptNum + 1);
          }
          throw new Error('Сервер вернул неожиданный ответ. Попробуйте через 10 секунд.');
        }

        var data;
        try { data = await response.json(); } catch (e) {
          if (attemptNum < MAX_RETRIES) {
            await sleep(RETRY_DELAY * attemptNum);
            return callAI(message, attemptNum + 1);
          }
          throw new Error('Не удалось прочитать ответ сервера. Попробуйте снова.');
        }

        if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
          return data.choices[0].message.content;
        }

        throw new Error('Пустой ответ. Попробуйте снова.');
      } catch (err) {
        if (err.message && (err.message.indexOf('Failed to fetch') !== -1 || err.message.indexOf('NetworkError') !== -1 || err.message.indexOf('Load failed') !== -1 || err.message.indexOf('NetworkError') !== -1)) {
          if (attemptNum < MAX_RETRIES) {
            output.innerHTML = '<div class="pg-result-line" style="color:var(--text-tertiary)">Переподключение... попытка ' + (attemptNum + 1) + '</div>';
            await sleep(RETRY_DELAY * attemptNum);
            return callAI(message, attemptNum + 1);
          }
          throw new Error('Нет подключения к серверу. Проверьте интернет и попробуйте снова.');
        }
        throw err;
      }
    }

    runBtn.addEventListener('click', async function () {
      if (isProcessing) return;
      var text = input.value.trim();
      if (!text) { input.focus(); return; }

      isProcessing = true;
      runBtn.disabled = true;
      runBtn.textContent = 'Думаю...';
      meta.textContent = '';
      output.innerHTML = '<div class="pg-result-line" style="color:var(--text-tertiary)">● ● ●</div>';
      output.classList.add('processing');

      var startTime = Date.now();

      try {
        var fullText = await callAI(text);
        output.classList.remove('processing');
        output.innerHTML = '';
        await typewriter(fullText);
        var elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        meta.textContent = Math.ceil(fullText.length / 4) + ' токенов · ' + elapsed + 'с · Это Тема AI';
      } catch (err) {
        output.classList.remove('processing');
        output.innerHTML = '<div class="pg-result-line error">' + (err.message || 'Неизвестная ошибка') + '</div>';
      }

      isProcessing = false;
      runBtn.disabled = false;
      runBtn.textContent = 'Отправить';
    });

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); runBtn.click(); }
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
      var c = parseInt(complexityRange.value);
      var w = parseInt(timelineRange.value);
      complexityValue.textContent = complexityLabels[c - 1] || 'Средняя';
      timelineValue.textContent = w;
      var base = basePrices[currentType] || 600000;
      var mult = 0.5 + (c * 0.3);
      var rush = w <= 2 ? 1.3 : w <= 4 ? 1.0 : 0.85;
      var price = Math.round(base * mult * rush / 10000) * 10000;
      priceEl.textContent = '\u20BD ' + price.toLocaleString('ru-RU');
    }
    complexityRange.addEventListener('input', update);
    timelineRange.addEventListener('input', update);
    update();
  }

  function initPricing() {
    var periods = document.querySelectorAll('.pricing-period');
    var amounts = document.querySelectorAll('.pricing-amount');
    periods.forEach(function (p) {
      p.addEventListener('click', function () {
        periods.forEach(function (pp) { pp.classList.remove('active'); });
        p.classList.add('active');
        var yearly = p.dataset.period === 'yearly';
        amounts.forEach(function (el) {
          var m = el.dataset.monthly, a = el.dataset.yearly;
          if (m === '0') return;
          el.innerHTML = '\u20BD ' + (yearly ? parseInt(a, 10) : parseInt(m, 10)).toLocaleString('ru-RU') + '<span class="pricing-period-label">/\u043C\u0435\u0441</span>';
        });
      });
    });
  }

  function initNavToggle() {
    var toggle = document.getElementById('nav-toggle'), nav = document.getElementById('nav');
    if (!toggle || !nav) return;
    toggle.addEventListener('click', function () { nav.classList.toggle('open'); });
    nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { nav.classList.remove('open'); }); });
  }

  function initHeaderScroll() {
    var header = document.querySelector('.header');
    if (!header) return;
    window.addEventListener('scroll', function () {
      header.style.borderBottomColor = window.pageYOffset > 80 ? 'var(--border)' : 'transparent';
    }, { passive: true });
  }

  function initContactForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      btn.textContent = 'Отправлено \u2713'; btn.disabled = true; btn.style.background = 'var(--success)';
      setTimeout(function () { btn.textContent = 'Отправить заявку'; btn.disabled = false; btn.style.background = ''; form.reset(); }, 3000);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initScrollAnimations(); initCountUp(); initPlayground();
    initCalculator(); initPricing(); initNavToggle(); initHeaderScroll(); initContactForm();
  });
})();