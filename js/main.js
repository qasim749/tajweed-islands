/* Tajweed Islands – the game: start screens, walking, talking, ferry rides, saving */
(function () {
  var W = TI.World, M = TI.Models, UI = TI.UI, S = TI.Save, A = TI.Audio, I = TI.Input, C = TI.Content;
  var G = TI.Game = { mode: 'menu', t: 0, started: false, loc: 'harbor', cut: null, stepT: 0, petHop: 0, cowHop: 0 };
  var V = function (x, y, z) { return new THREE.Vector3(x, y, z); };
  var $ = function (id) { return document.getElementById(id); };

  var player = null, pet = null, captain, afra, cow, ferry;
  var actionLock = false, last = 0, hudT = 0;

  /* ================= START ================= */
  G.start = async function () {
    S.load();
    var lang = null;
    try { lang = localStorage.getItem('tajweedIslands.lang'); } catch (e) { /* ignore */ }
    TI.setLang(lang || 'en');

    W.init($('game'));
    I.init($('game'));
    UI.init();
    hookButtons();
    hookAutosave();
    buildActors();
    placeAt('harbor');
    $('loading').remove();
    requestAnimationFrame(loop);

    var code = await UI.languageSelect();
    TI.setLang(code);
    A.init();
    var choice = await UI.titleScreen(S.exists());
    if (choice === 'continue') {
      S.load();
    } else {
      S.reset();
      var c = await UI.characterSelect();
      S.data.character = c.character;
      S.data.skin = c.skin;
      S.data.pet = await UI.petSelect();
    }
    S.data.lang = code;
    beginGame();
  };

  function beginGame() {
    G.started = true;
    A.setEnabled(S.data.settings.sound);
    makePlayer();
    placeAt(S.data.location || 'harbor');
    snapCamera();
    showHud(true);
    G.mode = 'walk';
    S.save();
    updateHud();
    if (!S.data.introDone) setTimeout(function () { runAction(intro); }, 700);
  }

  function buildActors() {
    captain = M.person('captain');
    afra = M.person('afra');
    ferry = M.ferry();
    cow = M.cow(0.8);
    ferry.add(cow);
    cow.position.set(0.55, 1.0, 1.9);
    cow.rotation.y = -1.2;
    W.scene.add(captain, afra, ferry);
  }

  function makePlayer() {
    if (player) W.scene.remove(player);
    if (pet) W.scene.remove(pet);
    player = M.person(S.data.character || 'girl', { skin: S.data.skin });
    pet = M.pet(S.data.pet || 'cat');
    W.scene.add(player, pet);
  }

  function showHud(on) {
    $('hud').classList.toggle('hidden', !on);
    $('joystick').classList.toggle('hidden', !(on && I.isTouch));
  }

  /* ================= PLACING THINGS ON AN ISLAND ================= */
  function placeAt(loc) {
    if (!W.islands[loc] || !W.islands[loc].built) loc = 'harbor';
    var isl = W.islands[loc], d = isl.dock;
    G.loc = loc;
    if (G.started) S.data.location = loc;
    [captain, afra, player, pet].forEach(function (o) { if (o) W.scene.add(o); });

    ferry.position.set(d.ferryPos.x, 0, d.ferryPos.z);
    ferry.rotation.set(0, d.heading, 0);
    captain.position.copy(d.captainPos);
    captain.rotation.set(0, d.heading + Math.PI, 0);
    afra.position.copy(isl.spots.afra);
    if (player) {
      player.position.copy(isl.spots.spawn);
      player.position.y = groundY(player.position.x, player.position.z);
      var faceDock = !!isl.spots.spawnFacesDock;
      player.rotation.set(0, faceDock ? d.heading : d.heading + Math.PI, 0);
      I.yaw = faceDock ? d.heading + Math.PI : d.heading;
      I.pitch = 0.42;
      afra.rotation.y = Math.atan2(player.position.x - afra.position.x, player.position.z - afra.position.z);
      pet.position.copy(player.position).add(V(-1, 0, -1));
    }
  }

  function walkable(x, z) {
    var isl = W.islands[G.loc], dx = x - isl.x, dz = z - isl.z;
    if (dx * dx + dz * dz < (isl.r - 1.2) * (isl.r - 1.2)) return true;
    var d = isl.dock, along = dx * d.dir.x + dz * d.dir.z, side = dx * d.perp.x + dz * d.perp.z;
    return along > d.alongMin && along < d.alongMax - 0.4 && Math.abs(side) < 1.0;
  }

  function groundY(x, z) {
    var isl = W.islands[G.loc], dx = x - isl.x, dz = z - isl.z, d = isl.dock;
    var along = dx * d.dir.x + dz * d.dir.z, side = dx * d.perp.x + dz * d.perp.z;
    if (along > d.alongMin && along < d.alongMax && Math.abs(side) < 1.2) return 1.25;
    var dist = Math.hypot(dx, dz);
    if (isl.grassR && dist < isl.grassR) return 1.12;
    return 1.0;
  }

  function pushOut(p) {
    W.islands[G.loc].obstacles.forEach(function (o) {
      var dx = p.x - o.x, dz = p.z - o.z, d = Math.hypot(dx, dz), min = o.r + 0.35;
      if (d < min && d > 0.0001) { p.x = o.x + dx / d * min; p.z = o.z + dz / d * min; }
    });
  }

  function lerpAngle(a, b, k) {
    var d = ((b - a + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;
    return a + d * k;
  }

  function face(npc, target) {
    npc.rotation.y = Math.atan2(target.position.x - npc.position.x, target.position.z - npc.position.z);
  }

  /* ================= MAIN LOOP ================= */
  function loop(now) {
    requestAnimationFrame(loop);
    var dt = Math.min(0.05, (now - (last || now)) / 1000);
    last = now;
    G.t += dt;

    if (G.started) advanceClock(dt);
    var minutes = S.data ? S.data.gameMinutes : 420;

    var focus = G.mode === 'cutscene' ? ferry.position : player && G.mode === 'walk' ? player.position : W.islands.harbor.group.position;
    var gullCenter = G.mode === 'cutscene' ? ferry.position : W.islands[G.loc].group.position;
    var env = W.update(dt, G.t, minutes, focus, gullCenter);
    env.land = G.mode !== 'cutscene';
    A.update(dt, env);

    if (G.mode === 'walk') updateWalk(dt);
    else if (G.mode === 'cutscene') updateCutscene(dt);
    else menuCamera();

    // idle animations
    M.animatePerson(captain, G.t, false);
    M.animatePerson(afra, G.t + 1, false);
    M.animateFerry(ferry, G.t, G.mode === 'cutscene');
    if (G.mode !== 'cutscene') {
      ferry.position.y = Math.sin(G.t * 1.2) * 0.08;
      ferry.rotation.z = Math.sin(G.t * 0.9) * 0.015;
    }
    var cu = cow.userData;
    cu.tail.rotation.z = Math.sin(G.t * 2.5) * 0.4;
    cu.head.rotation.y = Math.sin(G.t * 0.5) * 0.3;
    if (G.cowHop > 0) { G.cowHop -= dt; cow.position.y = 1.0 + Math.sin((0.5 - G.cowHop) / 0.5 * Math.PI) * 0.25; }
    else cow.position.y = 1.0;
    if (pet) updatePet(dt);

    hudT -= dt;
    if (hudT <= 0 && G.started) { updateHud(); hudT = 0.5; }

    W.render();
  }

  function advanceClock(dt) {
    if (G.mode === 'menu') return;
    var before = S.data.gameMinutes % 1440;
    S.data.gameMinutes += dt;           // 1 real second = 1 game minute
    var after = S.data.gameMinutes % 1440;
    C.PRAYERS.forEach(function (p) {
      var crossed = after >= before ? (before < p.m && after >= p.m) : (p.m > before || p.m <= after);
      if (crossed) onPrayer(p);
    });
  }

  function onPrayer(p) {
    UI.toast('🕌 It is time for ' + p.name + '. The azan is being called.', 6000);
    A.azan();
  }

  function menuCamera() {
    var h = W.islands.harbor.group.position, a = G.t * 0.05;
    W.camera.position.set(h.x + Math.sin(a) * 38, 16, h.z + Math.cos(a) * 38);
    W.camera.lookAt(h.x, 2, h.z);
  }

  /* ================= WALKING ================= */
  function updateWalk(dt) {
    var busy = UI.busy() || actionLock;
    var moving = false;
    if (!busy) {
      var m = I.getMove(), yaw = I.yaw;
      var fx = -Math.sin(yaw), fz = -Math.cos(yaw), rx = Math.cos(yaw), rz = -Math.sin(yaw);
      var vx = fx * m.y + rx * m.x, vz = fz * m.y + rz * m.x, l = Math.hypot(vx, vz);
      if (l > 0.05) {
        if (l > 1) { vx /= l; vz /= l; }
        var sp = I.run() ? 6.8 : 4.2;
        var p = player.position, nx = p.x + vx * sp * dt, nz = p.z + vz * sp * dt;
        if (walkable(nx, nz)) { p.x = nx; p.z = nz; }
        else if (walkable(nx, p.z)) p.x = nx;
        else if (walkable(p.x, nz)) p.z = nz;
        pushOut(p);
        player.rotation.y = lerpAngle(player.rotation.y, Math.atan2(vx, vz), 1 - Math.exp(-dt * 12));
        moving = true;
        G.stepT -= dt;
        if (G.stepT <= 0) { A.step(); G.stepT = sp > 5 ? 0.28 : 0.38; }
      }
    }
    player.position.y = groundY(player.position.x, player.position.z);
    M.animatePerson(player, G.t, moving);

    if (!busy) {
      var near = nearestInteractable();
      UI.prompt(near ? near.label : null, I.isTouch);
      var pressed = I.consumeAction();
      if (near && pressed && performance.now() - UI.lastClose > 300) runAction(near.fn);
    } else {
      I.consumeAction();
    }
    followCamera(dt);
  }

  function followCamera(dt) {
    var tgt = player.position.clone().add(V(0, 1.3, 0)), p = I.pitch, y = I.yaw, d = I.dist;
    var desired = tgt.clone().add(V(Math.sin(y) * Math.cos(p) * d, Math.sin(p) * d, Math.cos(y) * Math.cos(p) * d));
    if (desired.y < 1.4) desired.y = 1.4;
    W.camera.position.lerp(desired, 1 - Math.exp(-dt * 10));
    W.camera.lookAt(tgt);
  }

  function snapCamera() {
    if (!player) return;
    followCamera(10);
  }

  function updatePet(dt) {
    var ud = pet.userData;
    if (pet.parent !== W.scene) { M.animatePet(pet, G.t, false); return; }
    var ry = player.rotation.y;
    var ox = ud.fly ? -0.7 : -0.9, oz = ud.fly ? -0.5 : -1.1;
    var tx = player.position.x + ox * Math.cos(ry) + oz * Math.sin(ry);
    var tz = player.position.z - ox * Math.sin(ry) + oz * Math.cos(ry);
    var dx = tx - pet.position.x, dz = tz - pet.position.z, dist = Math.hypot(dx, dz), moving = false;
    if (dist > 12) { pet.position.x = tx; pet.position.z = tz; }
    else if (dist > 0.25) {
      var step = Math.min(dist * 4, 8) * dt;
      pet.position.x += dx / dist * step; pet.position.z += dz / dist * step;
      pet.rotation.y = lerpAngle(pet.rotation.y, Math.atan2(dx, dz), 1 - Math.exp(-dt * 10));
      moving = true;
    }
    var hop = 0;
    if (G.petHop > 0) { G.petHop -= dt; hop = Math.max(0, Math.sin((0.6 - G.petHop) / 0.6 * Math.PI)) * 0.5; }
    pet.position.y = ud.fly ? player.position.y + 1.9 + Math.sin(G.t * 2.2) * 0.15 + hop : groundY(pet.position.x, pet.position.z) + hop;
    M.animatePet(pet, G.t, moving);
  }

  /* ================= TALKING ================= */
  function nearestInteractable() {
    var p = player.position, best = null, bestD = 1e9;
    var cowPos = new THREE.Vector3(); cow.getWorldPosition(cowPos);
    var list = [
      { pos: captain.position, r: 2.6, label: TI.t('talk') + ': Captain Baqara', fn: talkCaptain },
      { pos: afra.position, r: 2.8, label: TI.t('talk') + ': Ms. Afra', fn: talkAfra },
      { pos: cowPos, r: 4.0, label: '🐄 Pat the captain\'s cow', fn: patCow }
    ];
    if (G.loc === 'harbor') list.push({ pos: W.islands.harbor.spots.booth, r: 3.2, label: '🎟️ Ticket booth', fn: booth });
    (W.islands[G.loc].stones || []).forEach(function (s) {
      list.push({ pos: s.pos, r: 2.6, label: s.zone.icon + ' Read: ' + s.zone.name, fn: function () { return readStone(s.zone); } });
    });
    list.forEach(function (it) {
      var d = Math.hypot(it.pos.x - p.x, it.pos.z - p.z);
      if (d < it.r && d < bestD) { best = it; bestD = d; }
    });
    if (!best) best = { label: '🐾 Pet your ' + TI.t(S.data.pet || 'cat').toLowerCase(), fn: patPet };
    return best;
  }

  function runAction(fn) {
    if (actionLock) return;
    actionLock = true;
    UI.prompt(null);
    Promise.resolve().then(fn).catch(function (e) { console.error(e); }).then(function () {
      actionLock = false;
      UI.lastClose = performance.now();
      updateHud();
    });
  }

  async function intro() {
    face(captain, player); face(afra, player);
    await UI.say('captain', 'Assalamu alaikum, young traveler! Welcome to the Harbor!');
    await UI.say('captain', 'I am Captain Baqara, and that is my ferry, the finest cow on the sea! The ride is always free.');
    A.moo(); G.cowHop = 0.5;
    await UI.say('captain', 'And that is my cow. She comes on every trip with me!');
    await UI.say('afra', 'Assalamu alaikum! I am Ms. Afra, your teacher. Together we will sail to many islands, and each one has something beautiful to learn about the Quran.');
    await UI.say('afra', 'Every island has a lesson and a challenge. Finish the challenge and you will earn a free ferry ticket to the next island, in shaa Allah.');
    var c = await UI.choose('afra', 'Do you already know the basics: the letters, harakat, sukoon, shaddah and leen letters?',
      ['I know them. Let me take the Harbor Test!', 'Not yet. Let\'s start at Starter Island.']);
    S.data.introDone = true;
    if (S.data.tickets.indexOf('starter') < 0) S.data.tickets.push('starter');
    S.save();
    if (c === 0) await harborTest();
    else await UI.say('afra', 'Wonderful! Talk to Captain Baqara at the end of the pier, and he will take us to Starter Island.');
  }

  async function harborTest() {
    await UI.say('afra', 'The Harbor Test has 5 questions. Get at least 4 right and you can skip Starter Island. Bismillah!');
    var res = await UI.runQuiz(C.harborTest, { title: '📝 Harbor Test', review: false });
    if (res.correct >= 4) {
      S.data.passedTest = true;
      if (S.data.tickets.indexOf('makharij') < 0) S.data.tickets.push('makharij');
      S.save();
      await UI.ticket('The Harbor', 'Makharij Isle');
      await UI.say('afra', 'MashaAllah, ' + res.correct + ' out of 5! You can skip Starter Island. Ask Captain Baqara to sail us straight to Makharij Isle. You can still visit Starter Island to practise any time.');
    } else {
      await UI.say('afra', 'You got ' + res.correct + ' out of 5, a good start! Starter Island will help you learn the rest. Let\'s ask Captain Baqara to take us there.');
    }
  }

  async function talkCaptain() {
    face(captain, player);
    if (!S.data.introDone) { await intro(); return; }
    var T = S.data.tickets, opts = [], acts = [];
    if (G.loc !== 'harbor') { opts.push('⛴️ Sail back to the Harbor'); acts.push(function () { return sailTo('harbor'); }); }
    C.ORDER.forEach(function (o) {
      if (o.id === G.loc || T.indexOf(o.id) < 0) return;
      if (W.islands[o.id] && W.islands[o.id].built) {
        opts.push('⛴️ Sail to ' + o.name);
        acts.push(function () { return sailTo(o.id); });
      } else {
        opts.push('⛴️ Sail to ' + o.name + ' (coming soon)');
        acts.push(async function () {
          A.moo();
          await UI.say('captain', o.name + '? MashaAllah, you have the ticket! But the island is still being built. It will be ready in a future update, in shaa Allah!');
        });
      }
    });
    opts.push('👋 Not now');
    acts.push(async function () { await UI.say('captain', 'No problem! The ferry will be right here whenever you are ready.'); });
    var i = await UI.choose('captain', 'Assalamu alaikum! Where shall we sail? Remember, the ride is always free!', opts);
    await acts[i]();
  }

  async function talkAfra() {
    face(afra, player);
    if (!S.data.introDone) { await intro(); return; }
    if (G.loc === 'harbor') {
      // the next island the player has a ticket for but hasn't finished
      var next = C.ORDER.find(function (o) {
        return S.data.tickets.indexOf(o.id) >= 0 && S.data.completed.indexOf(o.id) < 0 && !(o.id === 'starter' && S.data.passedTest);
      });
      var msg;
      if (!next) msg = 'MashaAllah, you have finished every island that is ready! New islands are coming in future updates, in shaa Allah.';
      else if (W.islands[next.id] && W.islands[next.id].built) msg = 'Ready to learn? Ask Captain Baqara to sail us to ' + next.name + '.' + (S.data.passedTest || S.data.completed.length ? '' : ' Or, if you already know the basics, try the Harbor Test!');
      else msg = 'MashaAllah, you have a ticket to ' + next.name + '! It is still being built and will come in a future update, in shaa Allah. You can practise on the other islands any time.';
      var i = await UI.choose('afra', msg, ['📝 Take the Harbor Test', '📓 Open my notebook', '👋 Bye']);
      if (i === 0) await harborTest();
      else if (i === 1) await openNotebook();
      return;
    }
    if (C.ISLANDS[G.loc]) await islandMenu(G.loc);
  }

  async function readStone(z) {
    await UI.say('narrator', z.icon + ' ' + z.name + ' (' + z.translit + ')\nLetters: ' + z.letters + '\n\n' + z.desc);
  }

  async function islandMenu(id) {
    var island = C.ISLANDS[id];
    while (true) {
      var sel = await UI.lessonMenu(island, S.data.lessonsDone, S.data.completed.indexOf(id) >= 0);
      if (!sel) return;
      if (sel === 'challenge') { await islandChallenge(id); return; }
      var L = island.lessons.find(function (l) { return l.id === sel; });
      await UI.showLesson(L);
      if (S.data.lessonsDone.indexOf(L.id) < 0) {
        S.data.lessonsDone.push(L.id);
        S.data.notebook.push(L.id);
        S.save();
        UI.toast('📓 Added to your notebook: ' + L.title);
      }
    }
  }

  async function islandChallenge(id) {
    var island = C.ISLANDS[id], nextId = C.nextIsland(id), nextName = nextId ? C.islandName(nextId) : null;
    await UI.say('afra', 'Time for the ' + island.title + ' exam! When you get one right, I will explain it so you learn. If you make a mistake, keep going. At the end you get one more try at each mistake, and if it is still wrong, I will show you the right answer and explain it. You need ' + Math.ceil(island.challenge.length * 0.8) + ' out of ' + island.challenge.length + ' to earn your ticket.');
    var res = await UI.runQuiz(island.challenge, { title: '🎟️ ' + island.title + ' Exam', review: true, pass: 0.8 });
    if (!res.passed) {
      await UI.say('afra', 'You scored ' + res.score + ' out of ' + res.total + '. You need ' + res.need + ' to pass. That\'s okay, every scholar studied many times! Read the lessons again, then come back and retake the exam whenever you are ready.');
      return;
    }
    var first = S.data.completed.indexOf(id) < 0;
    if (first) {
      S.data.completed.push(id);
      if (nextId && S.data.tickets.indexOf(nextId) < 0) S.data.tickets.push(nextId);
      S.save();
      if (nextId) await UI.ticket(island.title, nextName);
    }
    await UI.say('afra', (res.score === res.total
      ? 'MashaAllah! Alhamdulillah, you got all ' + res.total + ' right.'
      : 'MashaAllah! You passed with ' + res.score + ' out of ' + res.total + '.') + ' Your score stays private, between you and Allah.');
    if (first && nextId) {
      if (W.islands[nextId] && W.islands[nextId].built) await UI.say('afra', 'Talk to Captain Baqara at the pier when you are ready to sail to ' + nextName + '!');
      else await UI.say('afra', nextName + ' is still being built, and it is coming in a future update, in shaa Allah. Until then, you can practise here any time.');
    }
  }

  async function booth() {
    var names = S.data.tickets.map(C.islandName);
    await UI.say('narrator', '🎟️ Ticket Booth: rides on the cow ferry are always FREE. Your tickets: ' + (names.length ? names.join(', ') : 'none yet') + '.');
  }

  function patCow() { A.moo(); G.cowHop = 0.5; UI.toast('🐄 Mooo!'); }
  function patPet() { A.petSound(S.data.pet); G.petHop = 0.6; UI.toast('💕'); }

  function openNotebook() {
    var lessons = S.data.notebook.map(C.findLesson).filter(Boolean);
    return UI.notebook(lessons);
  }

  function openSettings() {
    return UI.settings({
      onSound: function (v) { A.setEnabled(v); S.save(); },
      onLang: function (code) { TI.setLang(code); S.data.lang = code; S.save(); updateHud(); },
      onReciter: function (r) { S.data.settings.reciter = r; S.save(); },
      onNewGame: function () {
        if (!confirm('Erase your progress and start a new game?')) return;
        G.started = false;
        S.erase();
        location.reload();
      }
    });
  }

  /* ================= FERRY RIDE (cutscene) ================= */
  function sailTo(toId) {
    var fromId = G.loc;
    return new Promise(async function (resolve) {
      G.mode = 'cutscene';
      UI.prompt(null);
      showHud(false);
      await UI.fade(true);
      ferry.add(captain); captain.position.set(0, 1.0, -0.45); captain.rotation.set(0, 0, 0);
      ferry.add(afra); afra.position.set(0.75, 1.0, 0.7); afra.rotation.set(0, -0.6, 0);
      ferry.add(player); player.position.set(-0.6, 1.0, 1.2); player.rotation.set(0, 0.5, 0);
      ferry.add(pet); pet.position.set(-0.3, pet.userData.fly ? 2.0 : 1.0, 2.4); pet.rotation.set(0, 0, 0);
      M.animatePerson(player, 0, false);

      var fd = W.islands[fromId].dock, td = W.islands[toId].dock;
      var p0 = V(fd.ferryPos.x, 0, fd.ferryPos.z), p2 = V(td.ferryPos.x, 0, td.ferryPos.z);
      var mid = p0.clone().add(p2).multiplyScalar(0.5), dir = p2.clone().sub(p0), len = dir.length();
      dir.normalize();
      var perp = V(-dir.z, 0, dir.x);
      // pick the curve that keeps the ferry farthest from every island
      var best = null, bestClear = -1e9;
      [0.22, -0.22, 0.35, -0.35, 0.1, -0.1].forEach(function (k) {
        var c1 = mid.clone().addScaledVector(perp, len * k), clear = 1e9;
        for (var si = 3; si <= 17; si++) {
          var s = si / 20, a = 1 - s;
          var px = p0.x * a * a + c1.x * 2 * a * s + p2.x * s * s, pz = p0.z * a * a + c1.z * 2 * a * s + p2.z * s * s;
          C.MAP.forEach(function (m) { clear = Math.min(clear, Math.hypot(px - m.x, pz - m.z) - m.r * 1.25); });
        }
        if (clear > bestClear + 0.5) { bestClear = clear; best = c1; }
      });
      var p1 = best;
      G.cut = { t: 0, dur: Math.min(120, Math.max(50, len / 3)), p0: p0, p1: p1, p2: p2, lines: C.ferryLines(fromId, toId), idx: 0,
        shot: -1, look: V(0, 0, 0), dolphinT: -1, fromId: fromId, toId: toId, done: false, skip: false, resolve: resolve };
      $('cinebars').classList.remove('hidden');
      $('btn-skip').classList.remove('hidden');
      updateCutscene(0);
      await UI.fade(false);
    }).then(function () { return arrived(toId); });
  }

  function updateCutscene(dt) {
    var c = G.cut; if (!c) return;
    c.t += dt;
    if (c.skip) { c.t = c.dur; c.idx = c.lines.length; }
    var u = Math.min(1, c.t / c.dur);
    var s = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
    var a = 1 - s;
    var pos = V(0, 0, 0).addScaledVector(c.p0, a * a).addScaledVector(c.p1, 2 * a * s).addScaledVector(c.p2, s * s);
    var tan = c.p1.clone().sub(c.p0).multiplyScalar(2 * a).add(c.p2.clone().sub(c.p1).multiplyScalar(2 * s));
    var h = Math.atan2(tan.x, tan.z);
    ferry.position.set(pos.x, Math.sin(G.t * 1.3) * 0.12, pos.z);
    ferry.rotation.set(Math.sin(G.t * 0.9) * 0.025, h, Math.sin(G.t * 1.1) * 0.035);

    var f = V(Math.sin(h), 0, Math.cos(h)), L = V(Math.cos(h), 0, -Math.sin(h)), F = ferry.position;
    var shot = u < 0.14 ? 0 : u < 0.3 ? 1 : u < 0.5 ? 2 : u < 0.68 ? 3 : u < 0.84 ? 4 : 5;
    var desired, look;
    switch (shot) {
      case 0: { var ang = G.t * 0.25; desired = F.clone().add(V(Math.sin(ang) * 15, 7, Math.cos(ang) * 15)); look = F.clone().add(V(0, 1.5, 0)); break; }
      case 1: desired = F.clone().addScaledVector(L, -10).addScaledVector(f, -1).add(V(0, 1.8, 0)); look = F.clone().addScaledVector(f, 2).add(V(0, 1.4, 0)); break;
      case 2: desired = F.clone().addScaledVector(L, 12).addScaledVector(f, -3).add(V(0, 3, 0)); look = F.clone().addScaledVector(L, 4).addScaledVector(f, 5).add(V(0, 1, 0)); break;
      case 3: desired = F.clone().addScaledVector(f, -9).add(V(0, 4.2, 0)); look = F.clone().addScaledVector(f, 25).add(V(0, 1, 0)); break;
      case 4: desired = F.clone().addScaledVector(f, 9).addScaledVector(L, -2.5).add(V(0, 2.6, 0)); look = F.clone().addScaledVector(f, 4.4).add(V(0, 1.7, 0)); break;
      default: { var dst = W.islands[c.toId].group.position; desired = F.clone().addScaledVector(L, 16).addScaledVector(f, -12).add(V(0, 9, 0)); look = F.clone().lerp(dst, 0.5).add(V(0, 1, 0)); }
    }
    if (shot !== c.shot) { c.shot = shot; W.camera.position.copy(desired); c.look.copy(look); }
    else { var k = 1 - Math.exp(-dt * 4); W.camera.position.lerp(desired, k); c.look.lerp(look, k); }
    W.camera.lookAt(c.look);

    while (c.idx < c.lines.length && u >= c.lines[c.idx].at) {
      var ln = c.lines[c.idx++];
      UI.subtitle(ln.who, ln.text, ln.dur || 6);
      if (ln.fx === 'bell') A.bell();
      if (ln.fx === 'moo') { A.moo(); G.cowHop = 0.5; }
      if (ln.fx === 'dolphins') c.dolphinT = 0;
    }

    // dolphins jump alongside on the left
    if (c.dolphinT >= 0 && !c.skip) {
      c.dolphinT += dt;
      W.dolphins.forEach(function (dp, i) {
        var lt = c.dolphinT - i * 0.5, period = 2.2, ph = ((lt % period) + period) % period / 1.4;
        var show = lt >= 0 && ph <= 1 && c.dolphinT < 12;
        dp.visible = show;
        if (!show) return;
        dp.position.copy(F).addScaledVector(L, 5.5 + i * 1.1).addScaledVector(f, 3 + i * 1.5 + ph * 3 - 1.5);
        dp.position.y = Math.sin(Math.PI * ph) * 2.0 - 0.4;
        dp.rotation.set(-Math.cos(Math.PI * ph) * 0.9, h, 0, 'YXZ');
      });
    }

    if (u >= 1 && !c.done) { c.done = true; finishSail(); }
  }

  async function finishSail() {
    var c = G.cut;
    await UI.fade(true);
    $('cinebars').classList.add('hidden');
    $('btn-skip').classList.add('hidden');
    UI.hideSubtitle();
    W.dolphins.forEach(function (dp) { dp.visible = false; });
    G.cut = null;
    placeAt(c.toId);
    if (S.data.visited.indexOf(c.toId) < 0) S.data.visited.push(c.toId);
    G.mode = 'walk';
    snapCamera();
    S.save();
    showHud(true);
    await UI.fade(false);
    c.resolve();
  }

  async function arrived(id) {
    var island = C.ISLANDS[id];
    if (!island || !island.welcome) return;
    var started = island.lessons.some(function (l) { return S.data.lessonsDone.indexOf(l.id) >= 0; });
    if (!started) await UI.say('afra', island.welcome);
  }

  /* ================= HUD, BUTTONS & SAVING ================= */
  function updateHud() {
    if (!S.data) return;
    var m = Math.floor(S.data.gameMinutes % 1440), hh = Math.floor(m / 60), mm = m % 60;
    $('hud-clock').textContent = '🕰️ ' + String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0');
    $('hud-weather').textContent = W.weatherLabel();
    $('hud-place').textContent = '📍 ' + C.islandName(G.loc);
    var T = S.data.tickets;
    var next = C.ORDER.find(function (o) { return T.indexOf(o.id) >= 0 && S.data.completed.indexOf(o.id) < 0; });
    $('hud-ticket').textContent = next ? '🎟️ Next: ' + next.name : (T.length ? '🎟️ ' + T.length + ' tickets' : '');
  }

  function hookButtons() {
    $('btn-save').addEventListener('click', function () {
      if (!G.started) return;
      UI.toast(S.save() ? '💾 ' + TI.t('saved') : '⚠️ Could not save in this browser.');
    });
    $('btn-notebook').addEventListener('click', function () {
      if (G.started && G.mode === 'walk' && !UI.busy()) runAction(openNotebook);
    });
    $('btn-settings').addEventListener('click', function () {
      if (G.started && G.mode === 'walk' && !UI.busy()) runAction(openSettings);
    });
    $('btn-skip').addEventListener('click', function () { if (G.cut) G.cut.skip = true; });
    $('btn-action').addEventListener('click', function () { I.press(); });
  }

  /* Automatic saving: when the tab is closed, hidden, or every 30 seconds */
  function hookAutosave() {
    var save = function () { if (G.started) S.save(); };
    window.addEventListener('beforeunload', save);
    window.addEventListener('pagehide', save);
    document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') save(); });
    setInterval(save, 30000);
  }
})();
