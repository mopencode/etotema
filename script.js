(function () {
  'use strict';

  var ANIM_THRESHOLD = 0.15;

  var SYSTEM_PROMPT = 'Ты — AI-ассистент компании «Это Тема», эксперт по внедрению AI в бизнес. ' +
    'Отвечай на русском языке. Давай конкретные, обдуманные, структурированные ответы. ' +
    'Если вопрос про бизнес-процессы — подробно объясни, как AI может помочь. ' +
    'Если вопрос общий — отвечай полно и по существу. ' +
    'Не используй шаблонные фразы и общие слова. Каждый ответ должен быть уникальным, полезным и практичным. ' +
    'Используй Markdown-форматирование: заголовки (##), списки, **жирный**, `код`.';

  var PROVIDERS = {
    pollinations: {
      endpoint: 'https://text.pollinations.ai/openai/chat/completions',
      needsKey: false,
      models: [
        { value: 'openai', label: 'Это Тема AI (бесплатно)' },
        { value: 'openai-fast', label: 'Это Тема AI Fast (бесплатно)' }
      ]
    },
    openai: {
      endpoint: 'https://api.openai.com/v1/chat/completions',
      needsKey: true,
      models: [
        { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
        { value: 'gpt-4o', label: 'GPT-4o' },
        { value: 'gpt-4.1-mini', label: 'GPT-4.1 Mini' },
        { value: 'gpt-4.1', label: 'GPT-4.1' }
      ]
    },
    openrouter: {
      endpoint: 'https://openrouter.ai/api/v1/chat/completions',
      needsKey: true,
      models: [
        { value: 'openai/gpt-4o-mini', label: 'GPT-4o Mini (via OR)' },
        { value: 'google/gemini-2.0-flash-001', label: 'Gemini 2.0 Flash' },
        { value: 'anthropic/claude-3.5-sonnet', label: 'Claude 3.5 Sonnet' },
        { value: 'meta-llama/llama-3.3-70b-instruct', label: 'Llama 3.3 70B' }
      ]
    },
    custom: {
      endpoint: '',
      needsKey: true,
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
      var provider = localStorage.getItem(LS_PROVIDER) || 'pollinations';
      var model = localStorage.getItem(LS_MODEL) || 'openai';
      var endpoint = localStorage.getItem(LS_ENDPOINT) || '';

      apiKeyInput.value = key;
      providerSelect.value = provider;
      endpointInput.value = endpoint;
      updateModelList(provider, model);
      updateStatus(provider, key);
      syncModelDisplay(provider, model);
      toggleApiField(provider);
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

    function syncModelDisplay(provider, model) {
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

      var providerModels = PROVIDERS[provider].models.map(function (m) { return m.value; });
      if (providerModels.indexOf(model) === -1 && providerModels.length > 0) {
        model = providerModels[0];
      }
      modelDisplay.value = model;
    }

    function toggleApiField(provider) {
      var provConfig = PROVIDERS[provider];
      var apiKeyRow = apiKeyInput.closest('.pg-field');
      if (provConfig && !provConfig.needsKey) {
        apiKeyRow.style.display = 'none';
      } else {
        apiKeyRow.style.display = '';
      }
      if (provider === 'custom') {
        endpointField.classList.remove('hidden');
      } else {
        endpointField.classList.add('hidden');
      }
    }

    function updateStatus(provider, key) {
      var provConfig = PROVIDERS[provider];
      if (provConfig && !provConfig.needsKey) {
        statusEl.textContent = '✓ Бесплатный режим — работает без ключа';
        statusEl.className = 'pg-api-status connected';
      } else if (key && key.length > 5) {
        statusEl.textContent = '✓ API ключ задан (' + key.substring(0, 4) + '...' + key.substring(key.length - 4) + ')';
        statusEl.className = 'pg-api-status connected';
      } else {
        statusEl.textContent = '⚠ Для этого провайдера нужен API ключ';
        statusEl.className = 'pg-api-status disconnected';
      }
    }

    function saveSettings() {
      localStorage.setItem(LS_KEY, apiKeyInput.value.trim());
      localStorage.setItem(LS_PROVIDER, providerSelect.value);
      localStorage.setItem(LS_MODEL, modelSelect.value);
      localStorage.setItem(LS_ENDPOINT, endpointInput.value.trim());
      updateStatus(providerSelect.value, apiKeyInput.value.trim());
      syncModelDisplay(providerSelect.value, modelSelect.value);
      settingsPanel.classList.add('hidden');
    }

    toggleBtn.addEventListener('click', function () {
      settingsPanel.classList.toggle('hidden');
    });

    saveBtn.addEventListener('click', saveSettings);

    providerSelect.addEventListener('change', function () {
      var p = providerSelect.value;
      updateModelList(p, '');
      syncModelDisplay(p, PROVIDERS[p].models[0].value);
      updateStatus(p, apiKeyInput.value.trim());
      toggleApiField(p);
    });

    modelDisplay.addEventListener('change', function () {
      modelSelect.value = modelDisplay.value;
    });

    function getApiConfig() {
      var provider = localStorage.getItem(LS_PROVIDER) || 'pollinations';
      var key = localStorage.getItem(LS_KEY) || '';
      var model = modelDisplay.value || 'openai';
      var endpoint = localStorage.getItem(LS_ENDPOINT) || '';

      if (provider === 'custom' && endpoint) {
        return { endpoint: endpoint, key: key, model: model, needsKey: true, isFree: false };
      }

      var provConfig = PROVIDERS[provider] || PROVIDERS.pollinations;
      return {
        endpoint: provConfig.endpoint,
        key: key,
        model: model,
        needsKey: provConfig.needsKey,
        isFree: !provConfig.needsKey
      };
    }

    async function callAI(message) {
      var config = getApiConfig();

      if (config.needsKey && !config.key) {
        throw new Error('Для этого провайдера нужен API ключ. Нажмите «Настроить API» или переключитесь на бесплатный режим (Pollinations).');
      }

      var headers = { 'Content-Type': 'application/json' };

      if (config.key) {
        headers['Authorization'] = 'Bearer ' + config.key;
      }

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
        temperature: 0.7,
        max_tokens: 2048
      };

      if (!config.isFree) {
        body.stream = true;
      }

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
        throw new Error('API ошибка (' + response.status + '): ' + errorText);
      }

      return {
        response: response,
        startTime: startTime,
        isFree: config.isFree
      };
    }

function renderMarkdown(text) {
      var html = text;
      html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

      html = html.replace(/```(\w*)\n([\s\S]*?)```/g, function (match, lang, code) {
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
        var tableHtml = '<table><thead><tr>';
        var headerCells = rows[0].split('|').filter(function (c) { return c.trim(); });
        headerCells.forEach(function (c) { tableHtml += '<th>' + c.trim() + '</th>'; });
        tableHtml += '</tr></thead><tbody>';
        for (var i = 1; i < rows.length; i++) {
          var cells = rows[i].split('|').filter(function (c) { return c.trim(); });
          tableHtml += '<tr>';
          cells.forEach(function (c) { tableHtml += '<td>' + c.trim() + '</td>'; });
          tableHtml += '</tr>';
        }
        tableHtml += '</tbody></table>';
        return tableHtml;
      });

      html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
      html = html.replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>');

      html = html.replace(/(<li>[\s\S]*?<\/li>(\s*|$))+/g, function (match) {
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
      html = html.replace(/<p>(<table>)/g, '$1');
      html = html.replace(/(<\/table>)<\/p>/g, '$1');
      html = html.replace(/<p>(<pre>)/g, '$1');
      html = html.replace(/(<\/pre>)<\/p>/g, '$1');
      html = html.replace(/<p>(<hr>)<\/p>/g, '$1');
      html = html.replace(/<p>(<hr>)/g, '$1');
      html = html.replace(/(<hr>)<\/p>/g, '$1');

      return html;
    }

    async function streamResponse(response) {
      var reader = response.body.getReader();
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
            // skip
          }
        }
      }

      return fullText;
    }

    function typewriterText(text, startTime) {
      return new Promise(function (resolve) {
        var i = 0;
        var speed = Math.max(8, Math.min(30, 3000 / text.length));

        function type() {
          if (i < text.length) {
            var chunk = Math.min(3, text.length - i);
            i += chunk;
            output.innerHTML = renderMarkdown(text.substring(0, i));
            output.scrollTop = output.scrollHeight;
          }

          if (i < text.length) {
            setTimeout(type, speed);
          } else {
            resolve(text);
          }
        }
        type();
      });
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

        var fullText;
        var elapsed;

        if (result.isFree) {
          var data = await result.response.json();
          fullText = data.choices && data.choices[0] && data.choices[0].message
            ? data.choices[0].message.content
            : JSON.stringify(data);
          elapsed = ((Date.now() - result.startTime) / 1000).toFixed(1);
          await typewriterText(fullText, result.startTime);
        } else {
          fullText = await streamResponse(result.response);
          elapsed = ((Date.now() - result.startTime) / 1000).toFixed(1);
        }

        var tokens = Math.ceil(fullText.length / 4);
        var modelLabel = modelDisplay.options[modelDisplay.selectedIndex]
          ? modelDisplay.options[modelDisplay.selectedIndex].textContent
          : modelDisplay.value;
        meta.textContent = tokens + ' токенов · ' + elapsed + 'с · ' + modelLabel;
      } catch (err) {
        output.classList.remove('processing');
        output.innerHTML = '<div class="pg-result-line error">' + err.message + '</div>';
        if (err.message.indexOf('API ключ') !== -1 || err.message.indexOf('ключ') !== -1) {
          output.innerHTML += '<div class="pg-result-line" style="margin-top:0.5rem;color:var(--text-secondary)">Переключитесь на «Pollinations (бесплатно)» или нажмите «Настроить API».</div>';
        }
        if (err.message.indexOf('Failed to fetch') !== -1 || err.message.indexOf('NetworkError') !== -1) {
          output.innerHTML = '<div class="pg-result-line error">Не удалось подключиться к серверу. Попробуйте переключить провайдер или повторить позже.</div>';
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