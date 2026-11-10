/* Tajweed Islands – menus, dialogue, lessons and challenges */
(function () {
  var UI = TI.UI = {};
  var $ = function (id) { return document.getElementById(id); };

  function el(tag, props) {
    var e = document.createElement(tag);
    if (props) {
      Object.keys(props).forEach(function (k) {
        var v = props[k];
        if (v == null || v === false) return;
        if (k === 'class') e.className = v;
        else if (k === 'html') e.innerHTML = v;
        else if (k === 'style') e.setAttribute('style', v);
        else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), v);
        else if (k === 'disabled') e.disabled = !!v;
        else e.setAttribute(k, v);
      });
    }
    for (var i = 2; i < arguments.length; i++) append(e, arguments[i]);
    return e;
  }
  function append(e, c) {
    if (c == null || c === false) return;
    if (Array.isArray(c)) { c.forEach(function (x) { append(e, x); }); return; }
    e.append(c.nodeType ? c : document.createTextNode(String(c)));
  }
  UI.el = el;

  var WHO = {
    captain: { name: 'Captain Baqara', icon: '⛴️' },
    afra: { name: 'Ms. Afra', icon: '👩‍🏫' },
    narrator: { name: '', icon: '📜' }
  };

  var dlg = { active: false, typing: false, full: '', timer: null, resolve: null, choices: null };
  var panelOpen = false;
  UI.lastClose = 0;
  UI.busy = function () { return dlg.active || panelOpen; };

  UI.init = function () {
    $('dialogue').addEventListener('click', function (e) {
      if (e.target.closest('.choice')) return;
      advance();
    });
    window.addEventListener('keydown', function (e) {
      if (dlg.active) {
        if (dlg.choices && !dlg.typing) {
          var n = parseInt(e.key, 10);
          if (n >= 1 && n <= dlg.choices.length) { e.preventDefault(); e.stopImmediatePropagation(); finish(n - 1); return; }
        }
        if (e.code === 'Space' || e.code === 'KeyE' || e.code === 'Enter') {
          e.preventDefault(); e.stopImmediatePropagation(); advance();
        }
      } else if (panelOpen) {
        if (e.code === 'Space' || e.code === 'KeyE') e.stopImmediatePropagation();
      }
    }, true);
  };

  /* ---------- dialogue ---------- */
  function showDialogue(who, text, choices) {
    var w = WHO[who] || WHO.narrator;
    $('dlg-portrait').textContent = w.icon;
    $('dlg-portrait').className = 'p-' + who;
    $('dlg-name').textContent = w.name;
    $('dlg-choices').innerHTML = '';
    $('dlg-next').classList.add('hidden');
    $('dialogue').classList.remove('hidden');
    UI.prompt(null);
    dlg.active = true; dlg.full = text; dlg.choices = choices; dlg.typing = true;
    var chars = Array.from(text), i = 0, t = $('dlg-text');
    t.textContent = '';
    clearInterval(dlg.timer);
    dlg.timer = setInterval(function () {
      i += 2;
      t.textContent = chars.slice(0, i).join('');
      if (i >= chars.length) finishTyping();
    }, 22);
  }
  function finishTyping() {
    clearInterval(dlg.timer);
    dlg.typing = false;
    $('dlg-text').textContent = dlg.full;
    if (dlg.choices) {
      var box = $('dlg-choices');
      dlg.choices.forEach(function (c, i) {
        box.append(el('button', { class: 'choice', onclick: function () { finish(i); } }, (i + 1) + '. ' + c));
      });
    } else {
      $('dlg-next').classList.remove('hidden');
    }
  }
  function advance() {
    if (!dlg.active) return;
    if (dlg.typing) { finishTyping(); return; }
    if (dlg.choices) return;
    finish(undefined);
  }
  function finish(v) {
    dlg.active = false;
    $('dialogue').classList.add('hidden');
    var r = dlg.resolve; dlg.resolve = null;
    UI.lastClose = performance.now();
    if (r) r(v);
  }
  UI.say = function (who, text) {
    return new Promise(function (res) { showDialogue(who, text, null); dlg.resolve = res; });
  };
  UI.choose = function (who, text, options) {
    return new Promise(function (res) { showDialogue(who, text, options); dlg.resolve = res; });
  };

  UI.subtitle = function (who, text, dur) {
    var w = WHO[who] || WHO.narrator;
    $('sub-name').textContent = w.icon + ' ' + w.name;
    $('sub-text').textContent = text;
    $('subtitle').classList.remove('hidden');
    clearTimeout(UI._subT);
    UI._subT = setTimeout(function () { $('subtitle').classList.add('hidden'); }, (dur || 6) * 1000);
  };
  UI.hideSubtitle = function () { clearTimeout(UI._subT); $('subtitle').classList.add('hidden'); };

  /* ---------- small helpers ---------- */
  UI.openPanel = function () {
    var p = $('panel'); p.innerHTML = '';
    for (var i = 0; i < arguments.length; i++) append(p, arguments[i]);
    $('screen').classList.remove('hidden');
    UI.prompt(null);
    panelOpen = true;
    p.scrollTop = 0;
  };
  UI.closePanel = function () {
    $('screen').classList.add('hidden');
    panelOpen = false;
    UI.lastClose = performance.now();
    TI.Audio.stopRecitation();
  };

  UI.toast = function (text, ms) {
    var t = $('toast'); t.textContent = text; t.classList.add('show');
    clearTimeout(UI._toastT);
    UI._toastT = setTimeout(function () { t.classList.remove('show'); }, ms || 2600);
  };

  UI.fade = function (on) {
    $('fade').classList.toggle('on', !!on);
    return new Promise(function (r) { setTimeout(r, 650); });
  };

  UI.prompt = function (text, touch) {
    var p = $('prompt'), b = $('btn-action');
    if (!text) { p.classList.add('hidden'); b.classList.add('hidden'); return; }
    p.innerHTML = '';
    if (!touch) p.append(el('kbd', null, 'E'));
    p.append(document.createTextNode(text));
    p.classList.remove('hidden');
    b.classList.toggle('hidden', !touch);
  };

  function header(title, label) {
    return el('div', { class: 'q-head' }, el('span', { class: 'q-title' }, title || ''), el('span', { class: 'q-count' }, label || ''));
  }

  function audioBtn(code, label) {
    return el('div', { class: 'audio-row' }, el('button', {
      class: 'btn', onclick: function () {
        TI.Audio.recite(code).catch(function () { UI.toast('⚠️ Could not play the recitation. Check your internet connection.'); });
      }
    }, '🔊 ' + (label || TI.t('listen'))));
  }

  function shuffled(n) {
    var a = []; for (var i = 0; i < n; i++) a.push(i);
    for (var j = n - 1; j > 0; j--) { var k = Math.floor(Math.random() * (j + 1)); var t = a[j]; a[j] = a[k]; a[k] = t; }
    return a;
  }

  /* ---------- start screens ---------- */
  UI.languageSelect = function () {
    return new Promise(function (res) {
      var grid = el('div', { class: 'lang-grid' });
      TI.LANGS.forEach(function (L) {
        grid.append(el('button', { class: 'lang-btn', onclick: function () { UI.closePanel(); res(L.code); } }, L.name));
      });
      UI.openPanel(
        el('div', { class: 'logo' }, '🏝️'),
        el('h1', { class: 'title' }, 'Tajweed Islands'),
        el('div', { class: 'title-ar quran' }, 'جُزُرُ التَّجْوِيدِ'),
        el('h3', null, '🌍 Choose your language'),
        grid
      );
    });
  };

  UI.titleScreen = function (hasSave) {
    return new Promise(function (res) {
      var col = el('div', { class: 'col' });
      if (hasSave) col.append(el('button', { class: 'btn big', onclick: function () { UI.closePanel(); res('continue'); } }, '▶ ' + TI.t('cont')));
      col.append(el('button', { class: 'btn big' + (hasSave ? ' secondary' : ''), onclick: function () {
        if (hasSave && !confirm('Start a new game? Your saved progress will be replaced.')) return;
        UI.closePanel(); res('new');
      } }, '✨ ' + TI.t('newGame')));
      UI.openPanel(
        el('div', { class: 'logo' }, '🏝️⛴️🐄'),
        el('h1', { class: 'title' }, TI.t('title')),
        el('div', { class: 'title-ar quran' }, 'جُزُرُ التَّجْوِيدِ'),
        el('p', { class: 'sub' }, 'Sail between islands and learn tajweed, one island at a time.'),
        col
      );
    });
  };

  UI.characterSelect = function () {
    return new Promise(function (res) {
      var state = { character: null, skin: 0xc68642 };
      var next = el('button', { class: 'btn big', disabled: true, onclick: function () { UI.closePanel(); res(state); } }, TI.t('next') + ' →');
      var cards = el('div', { class: 'cards' });
      [['girl', '🧕', TI.t('girl'), 'Hijab & abaya'], ['boy', '👦', TI.t('boy'), 'Thobe & kufi']].forEach(function (c) {
        var card = el('button', { class: 'card', onclick: function () {
          state.character = c[0];
          Array.prototype.forEach.call(cards.children, function (x) { x.classList.remove('sel'); });
          card.classList.add('sel'); next.disabled = false;
        } }, el('span', { class: 'emoji' }, c[1]), c[2], el('small', { style: 'font-weight:700;color:#5b6b7d' }, c[3]));
        cards.append(card);
      });
      var sw = el('div', { class: 'swatches' });
      [0xf1c27d, 0xe0ac69, 0xc68642, 0x8d5524, 0x5c3a21].forEach(function (col) {
        var b = el('button', { class: 'swatch' + (col === state.skin ? ' sel' : ''), style: 'background:#' + col.toString(16).padStart(6, '0'), onclick: function () {
          state.skin = col;
          Array.prototype.forEach.call(sw.children, function (x) { x.classList.remove('sel'); });
          b.classList.add('sel');
        } });
        sw.append(b);
      });
      UI.openPanel(el('h2', null, TI.t('chooseChar')), cards, el('h3', null, TI.t('skin')), sw, el('div', { class: 'nav' }, next));
    });
  };

  UI.petSelect = function () {
    return new Promise(function (res) {
      var choice = null;
      var next = el('button', { class: 'btn big', disabled: true, onclick: function () { UI.closePanel(); res(choice); } }, TI.t('next') + ' →');
      var cards = el('div', { class: 'cards' });
      [['cat', '🐱'], ['parrot', '🦜'], ['chick', '🐥'], ['dove', '🕊️']].forEach(function (p) {
        var card = el('button', { class: 'card', onclick: function () {
          choice = p[0];
          Array.prototype.forEach.call(cards.children, function (x) { x.classList.remove('sel'); });
          card.classList.add('sel'); next.disabled = false;
          TI.Audio.petSound(p[0]);
        } }, el('span', { class: 'emoji' }, p[1]), TI.t(p[0]));
        cards.append(card);
      });
      UI.openPanel(el('h2', null, '🐾 ' + TI.t('choosePet')), el('p', { class: 'sub' }, 'Your pet will follow you everywhere, even onto the ferry!'), cards, el('div', { class: 'nav' }, next));
    });
  };

  /* ---------- lessons ---------- */
  UI.lessonMenu = function (island, done, challengeDone) {
    return new Promise(function (res) {
      var list = el('div', { class: 'lesson-list' });
      island.lessons.forEach(function (L, i) {
        var isDone = done.indexOf(L.id) >= 0;
        list.append(el('button', { class: 'lesson-item' + (isDone ? ' done' : ''), onclick: function () { UI.closePanel(); res(L.id); } },
          el('span', { class: 'num' }, isDone ? '✓' : String(i + 1)), el('span', null, L.title)));
      });
      list.append(el('button', { class: 'lesson-item challenge' + (challengeDone ? ' done' : ''), onclick: function () { UI.closePanel(); res('challenge'); } },
        el('span', { class: 'num' }, challengeDone ? '✓' : '🎟️'), el('span', null, TI.t('challenge') + (challengeDone ? ' (practise again)' : ': earn your ferry ticket'))));
      UI.openPanel(
        el('h2', null, '👩‍🏫 ' + island.title),
        el('p', { class: 'sub' }, island.intro),
        el('div', { class: 'color-key' }, el('span', null, '🎨 Ms. Afra\'s Color Code:'),
          el('span', null, el('b', null, '■ Black'), ' = just say it'),
          el('span', null, el('b', { class: 'c-red' }, '■ Red'), ' = hold / stretch'),
          el('span', null, el('b', { class: 'c-blue' }, '■ Blue'), ' = tricky word')),
        list,
        el('div', { class: 'nav' }, el('button', { class: 'btn secondary', onclick: function () { UI.closePanel(); res(null); } }, TI.t('close')))
      );
    });
  };

  function renderPage(pg) {
    var box = el('div', { class: 'lesson-text', html: TI.colorize(pg.html || '') });
    if (pg.type === 'letters') {
      var info = el('div', { class: 'letter-info' }, '👆');
      var grid = el('div', { class: 'letters-grid' });
      TI.Content.LETTERS.forEach(function (l) {
        var b = el('button', { class: 'letter-btn', onclick: function () {
          Array.prototype.forEach.call(grid.children, function (x) { x.classList.remove('sel'); });
          b.classList.add('sel');
          info.innerHTML = '';
          info.append(el('span', { class: 'quran' }, l[0]), el('b', null, l[1]), el('span', { class: 'quran', style: 'font-size:30px' }, l[2]));
          if (!UI.speakArabic(l[2])) info.append(el('div', { class: 'note' }, 'No Arabic voice found on this device, so names are shown only.'));
        } }, l[0]);
        grid.append(b);
      });
      box.append(grid, info);
    }
    if (pg.type === 'mouth') box.append(UI.mouthDiagram());
    if (pg.ayah) box.append(audioBtn(pg.ayah));
    var key = colorKey(box); if (key) box.append(key);
    return box;
  }

  /* Ms. Afra's Color Code key: shown under any page or question that uses the colors */
  function colorKey(root) {
    var has = function (c) { return !!root.querySelector('.' + c) || root.classList.contains(c); };
    var items = [];
    if (has('c-red')) items.push(el('span', null, el('b', { class: 'c-red' }, '■ Red'), ' = hold / stretch'));
    if (has('c-blue')) items.push(el('span', null, el('b', { class: 'c-blue' }, '■ Blue'), ' = tricky word'));
    if (has('c-hl')) items.push(el('span', null, el('span', { class: 'c-hl' }, 'Yellow'), ' = look here'));
    if (!items.length) return null;
    return el('div', { class: 'color-key' }, el('span', null, '🎨 Ms. Afra\'s Color Code: '), items, el('span', null, 'Black = just say it'));
  }
  UI.colorKey = colorKey;

  /* Side view of a head (facing right) with the 5 makharij areas to tap */
  UI.mouthDiagram = function () {
    var svg =
      '<svg viewBox="40 20 270 225" class="mouth-svg" role="img" aria-label="Makharij diagram">' +
      '<path d="M70,240 L70,140 Q62,40 160,30 Q240,26 262,80 L288,112 L266,121 L274,140 L268,151 L276,166 L262,173 Q258,192 230,194 L202,196 L200,240 Z" fill="#f6dcc4" stroke="#c89f7f" stroke-width="3"/>' +
      '<path data-zone="jawf" class="zone" d="M176,240 L176,150 Q200,128 262,138 L266,168 Q230,176 196,176 L196,240 Z" fill="#8fb8de" fill-opacity=".35" stroke="#4a7fb0" stroke-dasharray="5 4" stroke-width="2"/>' +
      '<rect data-zone="halq" class="zone" x="174" y="182" width="24" height="56" rx="10" fill="#d98c8c"/>' +
      '<path data-zone="lisan" class="zone" d="M178,182 Q186,150 232,150 Q258,152 260,162 Q240,172 200,176 Z" fill="#e6a3b5" stroke="#b5657a" stroke-width="2"/>' +
      '<ellipse data-zone="shafatan" class="zone" cx="272" cy="156" rx="8" ry="15" fill="#c97b84"/>' +
      '<ellipse data-zone="khayshum" class="zone" cx="258" cy="106" rx="18" ry="9" fill="#b39ddb"/>' +
      '<circle cx="215" cy="85" r="5" fill="#333"/>' +
      '<text x="186" y="215" font-size="16">🗣️</text><text x="210" y="166" font-size="14">👅</text>' +
      '<text x="278" y="150" font-size="14">👄</text><text x="236" y="98" font-size="14">👃</text><text x="222" y="146" font-size="13">🌬️</text>' +
      '</svg>';
    var wrap = el('div', { class: 'mouth' });
    wrap.innerHTML = svg;
    var info = el('div', { class: 'zone-info' }, '👆 Tap a colored area or a button below.');
    var btns = el('div', { class: 'zone-btns' });
    function show(id) {
      var z = TI.Content.ZONES.find(function (x) { return x.id === id; });
      if (!z) return;
      Array.prototype.forEach.call(wrap.querySelectorAll('.zone'), function (n) { n.classList.toggle('sel', n.getAttribute('data-zone') === id); });
      Array.prototype.forEach.call(btns.children, function (b) { b.classList.toggle('sel', b.getAttribute('data-zone') === id); });
      info.innerHTML = '';
      info.append(
        el('div', { class: 'zone-title' }, z.icon + ' ' + z.name + ' · ' + z.translit + ' ', el('span', { class: 'quran' }, z.ar)),
        el('div', { class: 'quran zone-letters', dir: 'rtl' }, z.letters),
        el('div', null, z.desc));
    }
    wrap.addEventListener('click', function (e) {
      var t = e.target.closest('[data-zone]');
      if (t) show(t.getAttribute('data-zone'));
    });
    TI.Content.ZONES.forEach(function (z) {
      btns.append(el('button', { class: 'zone-btn', 'data-zone': z.id, onclick: function () { show(z.id); } }, z.icon + ' ' + z.name));
    });
    return el('div', null, wrap, btns, info);
  };

  UI.speakArabic = function (text) {
    if (!('speechSynthesis' in window)) return false;
    var voices = speechSynthesis.getVoices();
    var v = voices.find(function (x) { return /^ar/i.test(x.lang); });
    if (!v) return false;
    var u = new SpeechSynthesisUtterance(text);
    u.voice = v; u.lang = v.lang; u.rate = 0.75;
    speechSynthesis.cancel(); speechSynthesis.speak(u);
    return true;
  };
  if ('speechSynthesis' in window) { try { speechSynthesis.getVoices(); } catch (e) { /* ignore */ } }

  UI.showLesson = function (lesson) {
    return new Promise(function (resolve) {
      var i = 0;
      function render() {
        var pg = lesson.pages[i], last = i === lesson.pages.length - 1;
        var nav = el('div', { class: 'nav' });
        if (i > 0) nav.append(el('button', { class: 'btn secondary', onclick: function () { i--; render(); } }, '← ' + TI.t('back')));
        nav.append(el('button', { class: 'btn', onclick: function () {
          if (last) { UI.closePanel(); resolve(); } else { i++; render(); }
        } }, last ? TI.t('done') + ' ✓' : TI.t('next') + ' →'));
        UI.openPanel(header('📖 ' + lesson.title, (i + 1) + ' / ' + lesson.pages.length), renderPage(pg), nav);
      }
      render();
    });
  };

  /* ---------- challenges (exams) ----------
     First pass: answers are never shown, the exam just carries on.
     Retry: each mistake gets ONE more try with no hints, and the answer is never revealed.
     Ms. Afra explains a question only after you get it right yourself. */
  function askQuestion(q, ctx) {
    return new Promise(function (resolve) {
      if (q.type === 'record') { askRecord(q, ctx, resolve); return; }
      var isAr = q.ar !== false;
      var order = shuffled(q.options.length);
      var fb = el('div', { class: 'feedback' });
      var nodes = [header(ctx.title, ctx.label)];
      nodes.push(el('div', { class: 'q-prompt' }, q.prompt));
      if (q.arabic) nodes.push(el('div', { class: 'q-arabic quran', dir: 'rtl', html: TI.colorize(q.arabic) }));
      if (q.audio) nodes.push(audioBtn(q.audio));
      var grid = el('div', { class: 'opts' + (isAr ? ' ar-opts' : '') });
      var locked = false, btns = [];
      order.forEach(function (oi) {
        var b = el('button', { class: 'opt' + (isAr ? ' quran' : ''), dir: isAr ? 'rtl' : 'auto', html: TI.colorize(q.options[oi]) });
        b.addEventListener('click', function () {
          if (locked) return;
          if (oi === q.answer) {
            // right answer: Ms. Afra explains why, so you learn
            locked = true;
            b.classList.add('right');
            fb.textContent = '✅ ' + TI.t('correct'); fb.className = 'feedback good';
            TI.Audio.pop(true);
            if (q.explain) {
              fb.after(afraNote(q.explain));
              grid.parentNode.append(el('div', { class: 'nav' }, el('button', { class: 'btn', onclick: function () { resolve(true); } }, TI.t('next') + ' →')));
            } else setTimeout(function () { resolve(true); }, 1000);
          } else if (ctx.review) {
            // wrong on the second try: now show the right answer and explain it
            locked = true;
            b.classList.add('wrong');
            btns[q.answer].classList.add('right');
            fb.textContent = '🌱 Not quite. The right answer is shown in green.'; fb.className = 'feedback soft';
            TI.Audio.pop(false);
            if (q.explain) fb.after(afraNote(q.explain));
            grid.parentNode.append(el('div', { class: 'nav' }, el('button', { class: 'btn', onclick: function () { resolve(false); } }, TI.t('next') + ' →')));
          } else {
            locked = true;
            b.classList.add('chosen');
            fb.textContent = '🌱 ' + TI.t('notQuite'); fb.className = 'feedback soft';
            TI.Audio.pop(false);
            setTimeout(function () { resolve(false); }, 1400);
          }
        });
        btns[oi] = b;
        grid.append(b);
      });
      nodes.push(grid, fb);
      var tmp = el('div'); nodes.forEach(function (n) { tmp.append(n.cloneNode(true)); });
      var key = colorKey(tmp); if (key) nodes.push(key);
      UI.openPanel(nodes);
    });
  }

  function afraNote(text) {
    return el('div', { class: 'afra-note' }, el('span', { class: 'afra-icon' }, '👩‍🏫'),
      el('div', null, el('b', null, 'Ms. Afra: '), el('span', { html: TI.colorize(text) })));
  }

  var rec = { mr: null, chunks: [], url: null, stream: null };
  function canRecord() { return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder); }

  function askRecord(q, ctx, resolve) {
    var status = el('div', { class: 'status' });
    var playMine = el('button', { class: 'btn secondary', disabled: !rec.url, onclick: function () { if (rec.url) new Audio(rec.url).play(); } }, '▶️ ' + TI.t('playMine'));
    var recBtn = el('button', { class: 'btn secondary' }, '🎙️ ' + TI.t('record'));
    var recording = false;
    recBtn.addEventListener('click', function () {
      if (!canRecord()) { status.textContent = 'Recording is not available here. Recite out loud instead, then answer below.'; return; }
      if (!recording) {
        navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
          rec.stream = stream; rec.chunks = [];
          rec.mr = new MediaRecorder(stream);
          rec.mr.ondataavailable = function (e) { if (e.data.size) rec.chunks.push(e.data); };
          rec.mr.onstop = function () {
            var blob = new Blob(rec.chunks, { type: rec.mr.mimeType || 'audio/webm' });
            if (rec.url) URL.revokeObjectURL(rec.url);
            rec.url = URL.createObjectURL(blob);
            stream.getTracks().forEach(function (t) { t.stop(); });
            playMine.disabled = false;
            status.textContent = '✅ Recorded! Now play the reciter and then yours, and compare.';
          };
          rec.mr.start();
          recording = true;
          recBtn.textContent = '⏹ ' + TI.t('stop');
          status.textContent = '🔴 Recording… recite now.';
        }).catch(function () {
          status.textContent = 'Microphone not allowed. You can still recite out loud and answer below.';
        });
      } else {
        recording = false;
        recBtn.textContent = '🎙️ ' + TI.t('record');
        if (rec.mr && rec.mr.state !== 'inactive') rec.mr.stop();
      }
    });
    var fb = el('div', { class: 'feedback' });
    var answered = false;
    var yes = el('button', { class: 'opt', onclick: function () {
      if (answered) return; answered = true; stopRec();
      yes.classList.add('right'); fb.textContent = '✅ MashaAllah! Keep practising every day.'; fb.className = 'feedback good';
      TI.Audio.pop(true);
      if (q.explain) {
        fb.after(afraNote(q.explain));
        fb.parentNode.append(el('div', { class: 'nav' }, el('button', { class: 'btn', onclick: function () { resolve(true); } }, TI.t('next') + ' →')));
      } else setTimeout(function () { resolve(true); }, 1200);
    } }, '😊 Yes, it sounded close');
    var no = el('button', { class: 'opt', onclick: function () {
      if (answered) return;
      answered = true; stopRec();
      no.classList.add('chosen'); fb.className = 'feedback soft';
      if (ctx.review) {
        fb.textContent = '🌱 Keep practising with the reciter every day. You will get there, in shaa Allah!';
        if (q.explain) fb.after(afraNote(q.explain));
        fb.parentNode.append(el('div', { class: 'nav' }, el('button', { class: 'btn', onclick: function () { resolve(false); } }, TI.t('next') + ' →')));
        return;
      }
      fb.textContent = '🌱 ' + TI.t('notQuite');
      setTimeout(function () { resolve(false); }, 1400);
    } }, '🌱 Not yet');
    function stopRec() { if (recording && rec.mr && rec.mr.state !== 'inactive') { recording = false; rec.mr.stop(); } }

    var nodes = [header(ctx.title, ctx.label)];
    nodes.push(
      el('div', { class: 'q-prompt' }, q.prompt),
      el('div', { class: 'q-arabic quran', dir: 'rtl', html: TI.colorize(q.arabic) }),
      el('div', { class: 'audio-row' },
        el('button', { class: 'btn', onclick: function () { TI.Audio.recite(q.audio).catch(function () { UI.toast('⚠️ Could not play the recitation. Check your internet connection.'); }); } }, '🔊 Reciter'),
        recBtn, playMine),
      status,
      el('div', { class: 'q-prompt', style: 'margin-top:14px' }, 'Did your recitation sound like the reciter\'s?'),
      el('div', { class: 'opts' }, yes, no),
      fb
    );
    UI.openPanel(nodes);
    if (!canRecord()) status.textContent = 'Recording is not available in this browser. Recite out loud instead.';
  }

  function message(nodes, btnText) {
    return new Promise(function (res) {
      UI.openPanel(nodes, el('div', { class: 'nav' }, el('button', { class: 'btn big', onclick: function () { res(); } }, btnText || TI.t('ok'))));
    });
  }

  UI.runQuiz = function (questions, opts) {
    opts = opts || {};
    var title = opts.title || TI.t('challenge');
    return (async function () {
      var mistakes = [], correct = 0, fixed = 0;
      for (var i = 0; i < questions.length; i++) {
        var ok = await askQuestion(questions[i], { title: title, label: (i + 1) + ' / ' + questions.length, review: false });
        if (ok) correct++; else mistakes.push(questions[i]);
      }
      if (opts.review && mistakes.length) {
        await message([
          el('div', { class: 'logo' }, '👩‍🏫'),
          el('h2', null, '🔁 Second Try'),
          el('p', { class: 'sub' }, mistakes.length + (mistakes.length === 1 ? ' question was' : ' questions were') + ' not right. You get one more try at each one, with no hints. Think carefully!')
        ], 'Bismillah →');
        for (var j = 0; j < mistakes.length; j++) {
          if (await askQuestion(mistakes[j], { title: '🔁 Second Try', label: (j + 1) + ' / ' + mistakes.length, review: true })) fixed++;
        }
      }
      var total = questions.length, score = correct + fixed;
      var need = Math.ceil(total * (opts.pass || 0));
      UI.closePanel();
      return { correct: correct, fixed: fixed, score: score, total: total, need: need, passed: score >= need, mistakes: mistakes.length };
    })();
  };

  UI.ticket = function (fromName, toName) {
    return message([
      el('div', { class: 'ticket' },
        el('div', { class: 't-top' }, '🎟️ ' + TI.t('ticketEarned')),
        el('div', { class: 't-route' }, fromName + ' → ' + toName),
        el('div', { class: 't-row' }, el('span', null, 'Ferry: Captain Baqara 🐄'), el('span', { class: 'free' }, 'Price: FREE')))
    ]).then(function () { UI.closePanel(); });
  };

  /* ---------- notebook & settings ---------- */
  UI.notebook = function (lessons) {
    var list = lessons.length ? lessons.map(function (L) {
      return el('div', { class: 'nb-entry' }, el('h4', null, '📖 ' + L.title), el('div', { html: TI.colorize(L.note) }));
    }) : el('p', { class: 'sub' }, 'Your notebook is empty. Learn a lesson with Ms. Afra to add notes!');
    var code = el('div', { class: 'nb-entry nb-code' }, el('h4', null, '🎨 Ms. Afra\'s Color Code'),
      el('div', { html: 'Black: just say it. ' +
        '<b class="c-red">Red</b>: hold it / stretch it, like <span class="quran c-red">نٓ</span> at the start of Surah Al-Qalam. ' +
        '<b class="c-blue">Blue</b>: a tricky word, so slow down and be careful. ' +
        '<span class="c-hl">Yellow</span>: look here, this is the part the question is about.' }));
    return message([el('h2', null, '📓 ' + TI.t('notebook')), el('p', { class: 'sub' }, 'Only you can see this notebook.'), code, list], TI.t('close'))
      .then(function () { UI.closePanel(); });
  };

  UI.settings = function (h) {
    var s = TI.Save.data.settings;
    function select(options, value, onchange) {
      var sel = el('select', { onchange: function () { onchange(sel.value); } });
      options.forEach(function (o) {
        var op = el('option', { value: o[0], disabled: o[2] }, o[1]);
        if (o[0] === value) op.selected = true;
        sel.append(op);
      });
      return sel;
    }
    var soundBtn = el('button', { class: 'btn' + (s.sound ? '' : ' secondary'), onclick: function () {
      s.sound = !s.sound; soundBtn.textContent = s.sound ? TI.t('on') : TI.t('off');
      soundBtn.className = 'btn' + (s.sound ? '' : ' secondary'); h.onSound(s.sound);
    } }, s.sound ? TI.t('on') : TI.t('off'));
    return message([
      el('h2', null, '⚙️ ' + TI.t('settings')),
      el('div', { class: 'set-row' }, el('span', null, '🔊 ' + TI.t('sound')), soundBtn),
      el('div', { class: 'set-row' }, el('span', null, '🌍 ' + TI.t('language')),
        select(TI.LANGS.map(function (L) { return [L.code, L.name]; }), TI.lang, h.onLang)),
      el('div', { class: 'set-row' }, el('span', null, '🎙️ Reciter'),
        select([['Husary_128kbps', 'Sheikh Mahmoud Khalil Al-Husary'], ['Alafasy_128kbps', 'Sheikh Mishary Alafasy']], s.reciter, h.onReciter)),
      el('div', { class: 'set-row' }, el('span', null, '✍️ ' + TI.t('script')),
        select([['uthmani', 'Uthmani'], ['indopak', 'IndoPak (coming soon)', true]], s.script, function () {})),
      el('div', { class: 'set-row' }, el('span', null, '🗑️ ' + TI.t('newGame')),
        el('button', { class: 'btn secondary', onclick: h.onNewGame }, 'Erase & restart'))
    ], TI.t('close')).then(function () { UI.closePanel(); });
  };
})();
