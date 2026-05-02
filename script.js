(function () {
  'use strict';

  var ANIM_THRESHOLD = 0.15;

  var SYSTEM_PROMPT = 'Ты — AI-ассистент компании «Это Тема», эксперта по внедрению AI в бизнес. ' +
    'Отвечай на русском языке. Давай конкретные, обдуманные, структурированные ответы. ' +
    'Если вопрос про бизнес-процессы — подробно объясни, как AI может помочь. ' +
    'Если вопрос общий — отвечай полно и по существу. ' +
    'Не используй шаблонные фразы и общие слова. Каждый ответ должен быть уникальным, полезным и практичным. ' +
    'Используй Markdown-форматирование для структуры: заголовки (##), списки, **жирный**, `код`.';

  var PROVIDERS = {
    openai: {
      endpoint: 'https://api.openai.com/v1/chat/completions',
      models: [
        { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
        { value: 'gpt-4o', label: 'GPT-4o' },
        { value: 'gpt-4.1-mini', label: 'GPT-4.1 Mini' },
        { value: 'gpt-4.1', label: 'GPT-4.1' }
      ]
    },
    openrouter: {
      endpoint: 'https://openrouter.ai/api/v1/chat/completions',
      models: [
        { value: 'openai/gpt-4o-mini', label: 'GPT-4o Mini (via OR)' },
        { value: 'google/gemini-2.0-flash-001', label: 'Gemini 2.0 Flash' },
        { value: 'anthropic/claude-3.5-sonnet', label: 'Claude 3.5 Sonnet' },
        { value: 'meta-llama/llama-3.3-70b-instruct', label: 'Llama 3.3 70B' }
      ]
    },
    custom: {
      endpoint: '',
      models: [
        { value: 'default', label: 'Default model' }
      ]
    }
  };

  var LS_KEY = 'etotema_pg_apikey';
  var LS_PROVIDER = 'etotema_pg_provider';
  var LS_MODEL = 'etotema_pg_model';
  var LS_ENDPOINT = 'etotema_pg_endpoint';

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
    var toggleBtn = document.getElementById('pg-settings-toggle');
    var settingsPanel = document.getElementById('pg-settings');
    var saveBtn = document.getElementById('pg-save-settings');
    var providerSelect = document.getElementById('pg-provider');
    var apiKeyInput = document.getElementById('pg-apikey');
    var modelSelect = document.getElementById('pg-model');
    var endpointField = document.getElementById('pg-endpoint-field');
    var endpointInput = document.getElementById('pg-endpoint');
    var modelDisplay = document.getElementById('pg-model-display');
    var runBtn = document.getElementById('pg-run');
    var input = document.getElementById('pg-input');
    var output = document.getElementById('pg-output');
    var meta = document.getElementById('pg-meta');
    var statusEl = document.getElementById('pg-api-status');

    if (!toggleBtn || !runBtn) return;

    var isProcessing = false;

    function loadSettings() {
      var key = localStorage.getItem(LS_KEY) || '';
      var provider = localStorage.getItem(LS_PROVIDER) || 'openai';
      var model = localStorage.getItem(LS_MODEL) || 'gpt-4o-mini';
      var endpoint = localStorage.getItem(LS_ENDPOINT) || '';

      apiKeyInput.value = key;
      providerSelect.value = provider;
      endpointInput.value = endpoint;
      updateModelList(provider, model);
      updateStatus(key);
      syncModelDisplay(model);
      if (provider === 'custom') {
        endpointField.classList.remove('hidden');
      }
    }

    function updateModelList(provider, selectedModel) {
      var models = PROVIDERS[provider] ? PROVIDERS[provider].models : [];
      modelSelect.innerHTML = '';
      models.forEach(function (m) {
        var opt = document.createElement('option');
        opt.value = m.value;
        opt.textContent = m.label;
        if (m.value === selectedModel) opt.selected = true;
        modelSelect.appendChild(opt);
      });
    }

    function syncModelDisplay(model) {
      modelDisplay.innerHTML = '';
      var allModels = [];
      Object.keys(PROVIDERS).forEach(function (p) {
        PROVIDERS[p].models.forEach(function (m) { allModels.push(m); });
      });

      allModels.forEach(function (m) {
        var opt = document.createElement('option');
        opt.value = m.value;
        opt.textContent = m.label;
        modelDisplay.appendChild(opt);
      });

      var currentProvider = providerSelect.value;
      var providerModels = PROVIDERS[currentProvider].models.map(function (m) { return m.value; });
      if (providerModels.indexOf(model) === -1 && providerModels.length > 0) {
        model = providerModels[0];
      }
      modelDisplay.value = model;
    }

    function updateStatus(key) {
      if (key && key.length > 5) {
        statusEl.textContent = '✓ API ключ задан (' + key.substring(0, 4) + '...' + key.substring(key.length - 4) + ')';
        statusEl.className = 'pg-api-status connected';
      } else {
        statusEl.textContent = '⚠ API ключ не задан';
        statusEl.className = 'pg-api-status disconnected';
      }
    }

    function saveSettings() {
      localStorage.setItem(LS_KEY, apiKeyInput.value.trim());
      localStorage.setItem(LS_PROVIDER, providerSelect.value);
      localStorage.setItem(LS_MODEL, modelSelect.value);
      localStorage.setItem(LS_ENDPOINT, endpointInput.value.trim());
      updateStatus(apiKeyInput.value.trim());
      syncModelDisplay(modelSelect.value);
      settingsPanel.classList.add('hidden');
    }

    toggleBtn.addEventListener('click', function () {
      settingsPanel.classList.toggle('hidden');
    });

    saveBtn.addEventListener('click', saveSettings);

    providerSelect.addEventListener('change', function () {
      var p = providerSelect.value;
      updateModelList(p, '');
      syncModelDisplay(PROVIDERS[p].models[0].value);
      if (p === 'custom') {
        endpointField.classList.remove('hidden');
      } else {
        endpointField.classList.add('hidden');
      }
    });

    modelDisplay.addEventListener('change', function () {
      modelSelect.value = modelDisplay.value;
    });

    function getApiConfig() {
      var provider = localStorage.getItem(LS_PROVIDER) || 'openai';
      var key = localStorage.getItem(LS_KEY) || '';
      var model = modelDisplay.value || 'gpt-4o-mini';
      var endpoint = localStorage.getItem(LS_ENDPOINT) || '';

      if (provider === 'custom' && endpoint) {
        return { endpoint: endpoint, key: key, model: model };
      }

      var provConfig = PROVIDERS[provider];
      if (!provConfig) provConfig = PROVIDERS.openai;

      return { endpoint: provConfig.endpoint, key: key, model: model };
    }

    async function callAI(message) {
      var config = getApiConfig();

      if (!config.key) {
        throw new Error('API ключ не задан. Нажмите «Настроить API» и введите ключ.');
      }

      var headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + config.key
      };

      if (config.endpoint.indexOf('openrouter') !== -1) {
        headers['HTTP-Referer'] = window.location.origin;
        headers['X-Title'] = 'EtoTema Playground';
      }

      var body = {
        model: config.model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: message }
        ],
        stream: true,
        temperature: 0.7,
        max_tokens: 2048
      };

      var startTime = Date.now();
      var response = await fetch(config.endpoint, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        var errorText = '';
        try {
          var errorJson = await response.json();
          errorText = errorJson.error ? (errorJson.error.message || errorJson.error.type || JSON.stringify(errorJson.error)) : response.statusText;
        } catch (e) {
          errorText = response.status + ' ' + response.statusText;
        }
        throw new Error('API ошибка: ' + errorText);
      }

      return {
        stream: response.body,
        startTime: startTime
      };
    }

    function renderMarkdown(text) {
      var html = text;
      html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

      html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
      html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
      html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
      html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
      html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
      html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
      html = html.replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>');

      html = html.replace(/(<li>.*<\/li>\n?)+/g, function (match) {
        return '<ul>' + match + '</ul>';
      });

      html = html.replace(/\n\n/g, '</p><p>');
      html = html.replace(/\n/g, '<br>');
      html = '<p>' + html + '</p>';
      html = html.replace(/<p><\/p>/g, '');
      html = html.replace(/<p>(<h[123]>)/g, '$1');
      html = html.replace(/(<\/h[123]>)<\/p>/g, '$1');
      html = html.replace(/<p>(<ul>)/g, '$1');
      html = html.replace(/(<\/ul>)<\/p>/g, '$1');

      return html;
    }

    async function streamResponse(stream) {
      var reader = stream.getReader();
      var decoder = new TextDecoder();
      var fullText = '';
      var buffer = '';

      while (true) {
        var result = await reader.read();
        if (result.done) break;

        buffer += decoder.decode(result.value, { stream: true });
        var lines = buffer.split('\n');
        buffer = lines.pop();

        for (var i = 0; i < lines.length; i++) {
          var line = lines[i].trim();
          if (!line || line === 'data: [DONE]') continue;
          if (!line.startsWith('data: ')) continue;

          try {
            var json = JSON.parse(line.substring(6));
            var delta = json.choices && json.choices[0] && json.choices[0].delta;
            if (delta && delta.content) {
              fullText += delta.content;
              output.innerHTML = renderMarkdown(fullText);
              output.scrollTop = output.scrollHeight;
            }
          } catch (e) {
            // skip malformed chunks
          }
        }
      }

      return fullText;
    }

    runBtn.addEventListener('click', async function () {
      if (isProcessing) return;

      var text = input.value.trim();
      if (!text) {
        input.focus();
        return;
      }

      isProcessing = true;
      runBtn.disabled = true;
      runBtn.classList.add('loading');
      runBtn.textContent = 'Генерация...';
      meta.textContent = '';
      output.innerHTML = '<div class="pg-result-line">● ● ●</div>';
      output.classList.add('processing');

      try {
        var result = await callAI(text);
        output.classList.remove('processing');
        output.innerHTML = '';

        var fullText = await streamResponse(result.stream);
        var elapsed = ((Date.now() - result.startTime) / 1000).toFixed(1);
        var tokens = Math.ceil(fullText.length / 4);
        meta.textContent = tokens + ' токенов · ' + elapsed + 'с · ' + (modelDisplay.value || 'unknown');
      } catch (err) {
        output.classList.remove('processing');
        output.innerHTML = '<div class="pg-result-line error">' + err.message + '</div>';
        if (err.message.indexOf('API ключ') !== -1) {
          output.innerHTML += '<div class="pg-result-line" style="margin-top:0.5rem;color:var(--text-secondary)">Нажмите «Настроить API» выше и введите ваш ключ.</div>';
        }
      }

      isProcessing = false;
      runBtn.disabled = false;
      runBtn.classList.remove('loading');
      runBtn.textContent = 'Отправить';
    });

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        runBtn.click();
      }
    });

    loadSettings();
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

    periods.forEach(function (p) {
      p.addEventListener('click', function () {
        periods.forEach(function (pp) { pp.classList.remove('active'); });
        p.classList.add('active');
        var yearly = p.dataset.period === 'yearly';
        amounts.forEach(function (el) {
          var monthly = el.dataset.monthly;
          var annual = el.dataset.yearly;
          if (monthly === '0') return;
          var val = yearly ? parseInt(annual, 10) : parseInt(monthly, 10);
          el.innerHTML = '\u20BD ' + val.toLocaleString('ru-RU') + '<span class="pricing-period-label">/' + (yearly ? 'мес' : 'мес') + '</span>';
        });
      });
    });
  }

  function initNavToggle() {
    var toggle = document.getElementById('nav-toggle');
    var nav = document.getElementById('nav');
    if (!toggle || !nav) return;
    toggle.addEventListener('click', function () { nav.classList.toggle('open'); });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { nav.classList.remove('open'); });
    });
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