(function () {
  'use strict';

  var ANIM_THRESHOLD = 0.15;

  var SYSTEM_PROMPT = 'Ты — AI-ассистент компании «Это Тема», эксперт по внедрению AI в бизнес. ' +
    'Отвечай на русском языке. Давай конкретные, обдуманные, структурированные ответы. ' +
    'Если вопрос про бизнес-процессы — подробно объясни, как AI может помочь. ' +
    'Если вопрос общий — отвечай полно и по существу. ' +
    'Не используй шаблонные фразы и общие слова. Каждый ответ должен быть уникальным, полезным и практичным. ' +
    'Используй Markdown-форматирование: заголовки (##), списки, **жирный**, `код`.';

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
      var duration = 1500, start = performance.now();
      var suffix = el.dataset.suffix || '';
      function tick(now) {
        var progress = Math.min((now - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target).toLocaleString('ru-RU') + suffix;
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = target.toLocaleString('ru-RU') + suffix;
      }
      requestAnimationFrame(tick);
    }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { animate(entry.target); obs.unobserve(entry.target); }
      });
    }, { threshold: ANIM_THRESHOLD });
    els.forEach(function (el) { obs.observe(el); });
  }

  function renderMarkdown(text) {
    var html = text;
    html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, function (m, lang, code) {
      return '<pre><code' + (lang ? ' class="language-' + lang + '"' : '') + '>' + code.trim() + '</code></pre>';
    });
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
    html = html.replace(/^---$/gm, '<hr>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    html = html.replace(/(\|.+\|[\r\n]+\|[-| :]+\|[\r\n]+((\|.+\|[\r\n]*)+))/g, function (match) {
      var rows = match.trim().split('\n').filter(function (r) { return !r.match(/^[\s|:-]+$/); });
      var t = '<table><thead><tr>';
      rows[0].split('|').filter(function (c) { return c.trim(); }).forEach(function (c) { t += '<th>' + c.trim() + '</th>'; });
      t += '</tr></thead><tbody>';
      for (var i = 1; i < rows.length; i++) {
        var cells = rows[i].split('|').filter(function (c) { return c.trim(); });
        t += '<tr>'; cells.forEach(function (c) { t += '<td>' + c.trim() + '</td>'; }); t += '</tr>';
      }
      return t + '</tbody></table>';
    });
    html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
    html = html.replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>');
    html = html.replace(/(<li>[\s\S]*?<\/li>(\s*|$))+/g, '<ul>$&</ul>');
    html = html.replace(/\n\n/g, '</p><p>');
    html = html.replace(/\n/g, '<br>');
    html = '<p>' + html + '</p>';
    html = html.replace(/<p><\/p>/g, '');
    html = html.replace(/<p>(<h[123]>)/g, '$1');
    html = html.replace(/(<\/h[123]>)<\/p>/g, '$1');
    html = html.replace(/<p>(<ul>)/g, '$1');
    html = html.replace(/(<\/ul>)<\/p>/g, '$1');
    html = html.replace(/<p>(<table>)/g, '$1');
    html = html.replace(/(<\/table>)<\/p>/g, '$1');
    html = html.replace(/<p>(<pre>)/g, '$1');
    html = html.replace(/(<\/pre>)<\/p>/g, '$1');
    html = html.replace(/<p>(<hr>)<\/p>/g, '$1');
    return html;
  }

  function initPlayground() {
    var runBtn = document.getElementById('pg-run');
    var input = document.getElementById('pg-input');
    var output = document.getElementById('pg-output');
    var meta = document.getElementById('pg-meta');
    var isProcessing = false;

    if (!runBtn || !input || !output) return;

    function typewriter(text) {
      return new Promise(function (resolve) {
        var i = 0;
        var speed = Math.max(6, Math.min(25, 2500 / text.length));
        function type() {
          if (i < text.length) {
            i += Math.min(3, text.length - i);
            output.innerHTML = renderMarkdown(text.substring(0, i));
            output.scrollTop = output.scrollHeight;
            setTimeout(type, speed);
          } else { resolve(); }
        }
        type();
      });
    }

    runBtn.addEventListener('click', async function () {
      if (isProcessing) return;
      var text = input.value.trim();
      if (!text) { input.focus(); return; }

      isProcessing = true;
      runBtn.disabled = true;
      runBtn.textContent = 'Генерация...';
      meta.textContent = '';
      output.innerHTML = '<div class="pg-result-line">● ● ●</div>';
      output.classList.add('processing');

      var startTime = Date.now();

      try {
        var response = await fetch('https://text.pollinations.ai/openai/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'openai-fast',
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              { role: 'user', content: text }
            ],
            temperature: 0.7,
            max_tokens: 2048
          })
        });

        if (!response.ok) {
          var errBody = '';
          try { var errJson = await response.json(); errBody = errJson.error ? (errJson.error.message || JSON.stringify(errJson.error)) : response.statusText; } catch (e) { errBody = response.status + ' ' + response.statusText; }
          throw new Error('Ошибка сервера (' + response.status + '): ' + errBody);
        }

        var data = await response.json();
        var fullText = '';
        if (data.choices && data.choices[0] && data.choices[0].message) {
          fullText = data.choices[0].message.content;
        } else if (typeof data === 'string') {
          fullText = data;
        } else {
          fullText = JSON.stringify(data);
        }

        output.classList.remove('processing');
        output.innerHTML = '';
        await typewriter(fullText);

        var elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        var tokens = Math.ceil(fullText.length / 4);
        meta.textContent = tokens + ' токенов · ' + elapsed + 'с · Это Тема AI';

      } catch (err) {
        output.classList.remove('processing');
        output.innerHTML = '<div class="pg-result-line error">' + err.message + '</div>' +
          '<div class="pg-result-line" style="margin-top:0.5rem;color:var(--text-secondary)">Попробуйте повторить запрос через несколько секунд.</div>';
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
      var c = parseInt(complexityRange.value), w = parseInt(timelineRange.value);
      complexityValue.textContent = complexityLabels[c - 1] || 'Средняя';
      timelineValue.textContent = w;
      var base = basePrices[currentType] || 600000;
      var m = 0.5 + (c * 0.3), rush = w <= 2 ? 1.3 : w <= 4 ? 1.0 : 0.85;
      priceEl.textContent = '\u20BD ' + Math.round(base * m * rush / 10000) * 10000 .toLocaleString('ru-RU');
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
          var val = yearly ? parseInt(a, 10) : parseInt(m, 10);
          el.innerHTML = '\u20BD ' + val.toLocaleString('ru-RU') + '<span class="pricing-period-label">/\u043C\u0435\u0441</span>';
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