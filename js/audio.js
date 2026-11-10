/* Tajweed Islands – sound
   Nature only, no music and no game beeps:
   ocean surf and rolling waves, wind gusts, rain and droplets, songbirds by day,
   seagulls at sea, crickets at night, sandy footsteps, the cow bell and the cow.
   Everything is generated live in the browser. Quran recitation and the azan are real recordings. */
(function () {
  var A = TI.Audio = { ctx: null, enabled: true, cur: null };
  var T = { wave: 3, bird: 2, gull: 10, cricket: 1, drop: 0 };

  A.init = function () {
    if (A.ctx) return;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try { A.ctx = new AC(); } catch (e) { return; }
    var c = A.ctx;
    A.master = c.createGain();
    A.master.gain.value = A.enabled ? 0.9 : 0;
    A.master.connect(c.destination);

    A.white = makeNoise('white');
    A.pink = makeNoise('pink');
    A.brown = makeNoise('brown');

    A.surf = loop(A.brown, 'lowpass', 380, 0.5);    // constant low ocean rumble
    A.wind = loop(A.pink, 'bandpass', 600, 0.8);    // gusty wind
    A.leaves = loop(A.white, 'highpass', 5000, 0.5); // palm leaves rustling in the wind
    A.rain = loop(A.white, 'bandpass', 3500, 0.4);  // steady rain hiss

    document.addEventListener('pointerdown', A.resume);
    document.addEventListener('keydown', A.resume);
  };

  A.resume = function () { if (A.ctx && A.ctx.state === 'suspended') A.ctx.resume(); };

  function makeNoise(kind) {
    var c = A.ctx, len = c.sampleRate * 4, buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
    var b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0, last = 0;
    for (var i = 0; i < len; i++) {
      var w = Math.random() * 2 - 1;
      if (kind === 'white') d[i] = w;
      else if (kind === 'pink') {
        b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759; b2 = 0.969 * b2 + w * 0.153852;
        b3 = 0.8665 * b3 + w * 0.3104856; b4 = 0.55 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.016898;
        d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11; b6 = w * 0.115926;
      } else {
        last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5;
      }
    }
    return buf;
  }

  function loop(buf, type, freq, q) {
    var c = A.ctx;
    var s = c.createBufferSource(); s.buffer = buf; s.loop = true;
    s.loopStart = Math.random(); // avoid identical loops lining up
    var f = c.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
    var g = c.createGain(); g.gain.value = 0;
    s.connect(f); f.connect(g); g.connect(A.master); s.start(0, Math.random() * 3);
    return { s: s, f: f, g: g };
  }

  function panner(p) {
    var c = A.ctx;
    if (c.createStereoPanner) { var n = c.createStereoPanner(); n.pan.value = p; n.connect(A.master); return n; }
    return A.master;
  }

  A.setEnabled = function (on) {
    A.enabled = on;
    if (A.master) A.master.gain.setTargetAtTime(on ? 0.9 : 0, A.ctx.currentTime, 0.1);
  };

  /* env = { wave, wind, rain, day (0 night … 1 day), land (true on an island) } */
  A.update = function (dt, env) {
    if (!A.ctx) return;
    var t = A.ctx.currentTime, day = env.day == null ? 1 : env.day;
    var atSea = !env.land;

    // ocean: louder at sea
    A.surf.g.gain.setTargetAtTime((atSea ? 0.5 : 0.3) * env.wave * (0.85 + 0.15 * Math.sin(t * 0.21)), t, 0.8);

    // wind gusts: slowly wandering volume and pitch
    var gust = 0.5 + 0.5 * Math.sin(t * 0.17) * Math.sin(t * 0.073 + 1.3);
    A.wind.g.gain.setTargetAtTime(env.wind * (0.05 + 0.1 * gust), t, 0.6);
    A.wind.f.frequency.setTargetAtTime(350 + 500 * gust, t, 0.8);
    A.leaves.g.gain.setTargetAtTime(env.land ? env.wind * 0.012 * (0.4 + gust) : 0, t, 0.6);

    // rain
    A.rain.g.gain.setTargetAtTime(env.rain * 0.09, t, 0.6);
    if (env.rain > 0.1) {
      T.drop -= dt;
      while (T.drop <= 0) { droplet(env.rain); T.drop += 0.03 + Math.random() * 0.12 / env.rain; }
    }

    // rolling waves washing in and out
    T.wave -= dt;
    if (T.wave <= 0) { wave(env.wave * (atSea ? 1 : 0.75)); T.wave = 5 + Math.random() * 6; }

    // songbirds on the islands in daytime (quiet in rain)
    if (env.land && day > 0.35 && env.rain < 0.4) {
      T.bird -= dt;
      if (T.bird <= 0) { birdsong(); T.bird = 1.5 + Math.random() * 5; }
    }
    // seagulls, mostly over the sea
    if (day > 0.3 && env.rain < 0.5) {
      T.gull -= dt;
      if (T.gull <= 0) { gullCall(); T.gull = (atSea ? 8 : 16) + Math.random() * 14; }
    }
    // crickets at night on land
    if (env.land && day < 0.25 && env.rain < 0.3) {
      T.cricket -= dt;
      if (T.cricket <= 0) { cricket(); T.cricket = 0.6 + Math.random() * 0.9; }
    }
  };

  /* ---------- nature sound makers ---------- */
  function wave(strength) {
    var c = A.ctx, t = c.currentTime;
    var s = c.createBufferSource(); s.buffer = A.pink;
    var f = c.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = 0.3;
    var g = c.createGain();
    var rise = 1.6 + Math.random(), fall = 3 + Math.random() * 2, peak = 0.22 * strength;
    f.frequency.setValueAtTime(250, t);
    f.frequency.linearRampToValueAtTime(1600 + Math.random() * 800, t + rise);   // the wave breaks
    f.frequency.exponentialRampToValueAtTime(300, t + rise + fall);              // water washes back
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + rise);
    g.gain.exponentialRampToValueAtTime(0.0001, t + rise + fall);
    s.connect(f); f.connect(g); g.connect(panner(Math.random() * 1.2 - 0.6));
    s.start(t, Math.random() * 3); s.stop(t + rise + fall + 0.1);
  }

  function droplet(rain) {
    var c = A.ctx, t = c.currentTime;
    var s = c.createBufferSource(); s.buffer = A.white;
    var f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 2000 + Math.random() * 3000; f.Q.value = 6;
    var g = c.createGain(); g.gain.setValueAtTime(0.03 * rain * Math.random(), t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
    s.connect(f); f.connect(g); g.connect(panner(Math.random() * 2 - 1));
    s.start(t, Math.random() * 3, 0.04);
  }

  /* One chirped note: a sine with a pitch sweep and a fast flutter, like a real bird */
  function note(t, f0, f1, dur, vol, pan, flutter) {
    var c = A.ctx;
    var o = c.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    if (flutter) {
      var lfo = c.createOscillator(), lg = c.createGain();
      lfo.frequency.value = flutter; lg.gain.value = f0 * 0.06;
      lfo.connect(lg); lg.connect(o.frequency); lfo.start(t); lfo.stop(t + dur + 0.05);
    }
    var g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + Math.min(0.02, dur / 3));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(pan);
    o.start(t); o.stop(t + dur + 0.05);
  }

  function birdsong() {
    var c = A.ctx, t = c.currentTime + 0.05, kind = Math.floor(Math.random() * 3);
    var pan = panner(Math.random() * 1.6 - 0.8), vol = 0.015 + Math.random() * 0.02, i;
    if (kind === 0) {
      // warbler: a quick run of fluttering notes
      var n = 4 + Math.floor(Math.random() * 5), base = 3200 + Math.random() * 1500;
      for (i = 0; i < n; i++) {
        var f = base * (0.85 + Math.random() * 0.35);
        note(t, f, f * (0.9 + Math.random() * 0.3), 0.06 + Math.random() * 0.05, vol, pan, 40 + Math.random() * 30);
        t += 0.09 + Math.random() * 0.05;
      }
    } else if (kind === 1) {
      // whistler: two or three clear rising whistles
      var m = 2 + Math.floor(Math.random() * 2), w = 2000 + Math.random() * 700;
      for (i = 0; i < m; i++) { note(t, w, w * 1.25, 0.22, vol, pan, 8); t += 0.32; }
    } else {
      // sparrow-like double chirps
      for (i = 0; i < 2; i++) { note(t, 4200, 6000, 0.045, vol, pan, 0); note(t + 0.07, 5200, 3800, 0.05, vol * 0.8, pan, 0); t += 0.25; }
    }
  }

  function gullCall() {
    var c = A.ctx, t = c.currentTime, n = 2 + Math.floor(Math.random() * 3), pan = panner(Math.random() * 1.6 - 0.8);
    for (var i = 0; i < n; i++) {
      var tt = t + i * (0.32 + Math.random() * 0.1);
      var o = c.createOscillator(); o.type = 'sawtooth';
      o.frequency.setValueAtTime(950, tt);
      o.frequency.linearRampToValueAtTime(1350, tt + 0.07);
      o.frequency.exponentialRampToValueAtTime(820, tt + 0.3);
      var f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1700; f.Q.value = 3;
      var g = c.createGain();
      g.gain.setValueAtTime(0.0001, tt);
      g.gain.exponentialRampToValueAtTime(0.03, tt + 0.04);
      g.gain.exponentialRampToValueAtTime(0.0001, tt + 0.3);
      o.connect(f); f.connect(g); g.connect(pan);
      o.start(tt); o.stop(tt + 0.35);
    }
  }

  function cricket() {
    var c = A.ctx, t = c.currentTime, pan = panner(Math.random() * 1.6 - 0.8), freq = 4300 + Math.random() * 500;
    for (var i = 0; i < 3; i++) {
      var tt = t + i * 0.06;
      var o = c.createOscillator(); o.type = 'sine'; o.frequency.value = freq;
      var g = c.createGain();
      g.gain.setValueAtTime(0.0001, tt);
      g.gain.exponentialRampToValueAtTime(0.008, tt + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, tt + 0.035);
      o.connect(g); g.connect(pan); o.start(tt); o.stop(tt + 0.05);
    }
  }

  /* ---------- sounds used by the game ---------- */
  A.tone = function (type, f0, f1, dur, vol, delay) {
    if (!A.ctx) return;
    note(A.ctx.currentTime + (delay || 0), f0, f1 || f0, dur, vol, A.master, 0);
  };

  /* Correct answer: a soft bird whistle. Wrong answer: silence (no buzzers). */
  A.pop = function (good) {
    if (!A.ctx || !good) return;
    var t = A.ctx.currentTime + 0.02, pan = panner(0.3);
    note(t, 2300, 2900, 0.18, 0.035, pan, 8);
    note(t + 0.24, 2600, 3300, 0.2, 0.03, pan, 8);
  };

  A.bell = function () {
    [1, 2.76, 5.4, 8.93].forEach(function (m, i) {
      if (!A.ctx) return;
      var c = A.ctx, t = c.currentTime, o = c.createOscillator(), g = c.createGain();
      o.type = 'sine'; o.frequency.value = 520 * m;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.12 / (i + 1), t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 2.6 / (i + 1));
      o.connect(g); g.connect(A.master); o.start(t); o.stop(t + 2.7);
    });
  };

  /* Soft footstep on sand */
  A.step = function () {
    if (!A.ctx) return;
    var c = A.ctx, t = c.currentTime;
    var s = c.createBufferSource(); s.buffer = A.pink;
    var f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 900 + Math.random() * 500;
    var g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.05, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.11);
    s.connect(f); f.connect(g); g.connect(A.master);
    s.start(t, Math.random() * 3, 0.13);
  };

  A.moo = function () {
    if (!A.ctx) return;
    var c = A.ctx, t = c.currentTime;
    var o = c.createOscillator(); o.type = 'sawtooth';
    o.frequency.setValueAtTime(150, t);
    o.frequency.linearRampToValueAtTime(175, t + 0.25);
    o.frequency.linearRampToValueAtTime(115, t + 1.3);
    var f = c.createBiquadFilter(); f.type = 'lowpass';
    f.frequency.setValueAtTime(400, t);
    f.frequency.linearRampToValueAtTime(900, t + 0.3);
    f.frequency.linearRampToValueAtTime(350, t + 1.3);
    var g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.12, t + 0.15);
    g.gain.setValueAtTime(0.12, t + 1.0);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);
    o.connect(f); f.connect(g); g.connect(A.master);
    o.start(t); o.stop(t + 1.5);
  };

  A.petSound = function (kind) {
    if (!A.ctx) return;
    var c = A.ctx, t = c.currentTime, pan = panner(0);
    if (kind === 'cat') {
      var o = c.createOscillator(); o.type = 'sawtooth';
      o.frequency.setValueAtTime(480, t);
      o.frequency.linearRampToValueAtTime(780, t + 0.18);
      o.frequency.linearRampToValueAtTime(430, t + 0.6);
      var f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1400; f.Q.value = 1.2;
      var g = c.createGain();
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.08, t + 0.05); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
      o.connect(f); f.connect(g); g.connect(A.master); o.start(t); o.stop(t + 0.7);
    } else if (kind === 'chick') {
      for (var i = 0; i < 3; i++) note(t + i * 0.16, 3400, 2600, 0.1, 0.04, pan, 0);
    } else if (kind === 'parrot') {
      note(t, 1800, 2600, 0.12, 0.04, pan, 25);
      note(t + 0.16, 2400, 1500, 0.16, 0.04, pan, 25);
    } else {
      // dove: soft low coo
      note(t, 420, 380, 0.35, 0.06, pan, 5);
      note(t + 0.45, 400, 340, 0.55, 0.06, pan, 5);
    }
  };

  /* Quran recitation from everyayah.com. code = "SSSAAA", e.g. "001003" */
  A.recite = function (code) {
    return new Promise(function (resolve, reject) {
      if (A.cur) { A.cur.pause(); A.cur = null; }
      var r = (TI.Save.data && TI.Save.data.settings.reciter) || 'Husary_128kbps';
      var a = new Audio('https://everyayah.com/data/' + r + '/' + code + '.mp3');
      A.cur = a;
      a.onended = function () { resolve(); };
      a.onerror = function () { reject(new Error('audio')); };
      var p = a.play();
      if (p && p.catch) p.catch(reject);
    });
  };

  A.stopRecitation = function () { if (A.cur) { A.cur.pause(); A.cur = null; } };

  /* Azan: place your own recording at assets/audio/azan.mp3 */
  A.azan = function () {
    if (!A.enabled) return;
    var a = new Audio('assets/audio/azan.mp3');
    a.volume = 0.8;
    var p = a.play();
    if (p && p.catch) p.catch(function () { /* no azan file yet */ });
  };
})();
