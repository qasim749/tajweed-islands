/* Tajweed Islands – the 3D world: sea, islands, sky, day/night and weather */
(function () {
  var W = TI.World = {};
  var M = TI.Models, C = TI.Content;
  var V = function (x, y, z) { return new THREE.Vector3(x, y, z); };

  var WEATHER = {
    clear:  { cloud: 0.25, rain: 0, wind: 0.25, fog: 0, icon: '☀️', name: 'Clear' },
    cloudy: { cloud: 0.9, rain: 0, wind: 0.4, fog: 0.15, icon: '☁️', name: 'Cloudy' },
    rain:   { cloud: 1, rain: 1, wind: 0.6, fog: 0.35, icon: '🌧️', name: 'Rain' },
    windy:  { cloud: 0.5, rain: 0, wind: 1, fog: 0, icon: '💨', name: 'Windy' },
    fog:    { cloud: 0.6, rain: 0, wind: 0.1, fog: 1, icon: '🌫️', name: 'Fog' }
  };
  W.WEATHER = WEATHER;

  W.init = function (canvas) {
    var r = W.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    r.setSize(window.innerWidth, window.innerHeight);
    r.shadowMap.enabled = true;
    r.shadowMap.type = THREE.PCFSoftShadowMap;

    var s = W.scene = new THREE.Scene();
    s.background = new THREE.Color(0x8fd3ff);
    s.fog = new THREE.Fog(0x8fd3ff, 80, 300);

    W.camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1500);
    W.camera.position.set(30, 15, 30);

    W.hemi = new THREE.HemisphereLight(0xdff3ff, 0x5a7a5a, 0.55); s.add(W.hemi);
    W.amb = new THREE.AmbientLight(0xffffff, 0.12); s.add(W.amb);
    var sun = W.sun = new THREE.DirectionalLight(0xfff1d6, 0.9);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    var sc = sun.shadow.camera;
    sc.left = -35; sc.right = 35; sc.top = 35; sc.bottom = -35; sc.near = 1; sc.far = 300;
    sun.shadow.bias = -0.0008;
    s.add(sun); s.add(sun.target);

    W.lamps = [];
    W.spinners = [];
    W.weather = { state: 'clear', timer: 240, cur: Object.assign({}, WEATHER.clear) };

    buildSky(); buildWater(); buildIslands(); buildClouds(); buildRain(); buildLife();

    window.addEventListener('resize', function () {
      W.camera.aspect = window.innerWidth / window.innerHeight;
      W.camera.updateProjectionMatrix();
      W.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  };

  /* ---------- sky: stars, sun, moon ---------- */
  function buildSky() {
    var n = 900, pos = new Float32Array(n * 3);
    for (var i = 0; i < n; i++) {
      var v = V(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1).normalize();
      if (v.y < 0.03) v.y = Math.abs(v.y) + 0.03;
      v.normalize().multiplyScalar(700);
      pos[i * 3] = v.x; pos[i * 3 + 1] = v.y; pos[i * 3 + 2] = v.z;
    }
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    W.starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 2, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false });
    W.stars = new THREE.Points(g, W.starMat);
    W.scene.add(W.stars);
    W.sunMesh = new THREE.Mesh(new THREE.SphereGeometry(20, 10, 8), new THREE.MeshBasicMaterial({ color: 0xfff3b0, fog: false }));
    W.moonMesh = new THREE.Mesh(new THREE.SphereGeometry(13, 10, 8), new THREE.MeshBasicMaterial({ color: 0xeef0ff, fog: false }));
    W.scene.add(W.sunMesh, W.moonMesh);
  }

  /* ---------- the sea, with turquoise shallows ---------- */
  function buildWater() {
    var geo = new THREE.PlaneGeometry(1100, 1100, 110, 110);
    geo.rotateX(-Math.PI / 2);
    geo.translate(0, 0, -250);
    var p = geo.attributes.position, n = p.count;
    var colors = new Float32Array(n * 3);
    W.waterBase = new Float32Array(n * 2);
    var deep = new THREE.Color(0x1b5fa8), mid = new THREE.Color(0x2a9fd0), shallow = new THREE.Color(0x40e0d0), c = new THREE.Color();
    for (var i = 0; i < n; i++) {
      var x = p.getX(i), z = p.getZ(i);
      W.waterBase[i * 2] = x; W.waterBase[i * 2 + 1] = z;
      var md = 1e9;
      C.MAP.forEach(function (isl) { md = Math.min(md, Math.hypot(x - isl.x, z - isl.z) - isl.r); });
      if (md < 4) c.copy(shallow);
      else if (md < 18) c.copy(shallow).lerp(mid, (md - 4) / 14);
      else if (md < 45) c.copy(mid).lerp(deep, (md - 18) / 27);
      else c.copy(deep);
      colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    var mat = new THREE.MeshPhongMaterial({ vertexColors: true, flatShading: true, shininess: 70, specular: 0x557799, transparent: true, opacity: 0.9 });
    W.water = new THREE.Mesh(geo, mat);
    W.water.receiveShadow = true;
    W.scene.add(W.water);
  }

  function updateWater(t, wind) {
    var p = W.water.geometry.attributes.position, a = p.array, amp = 0.22 + wind * 0.4;
    for (var i = 0, j = 0; i < p.count; i++, j += 3) {
      var x = W.waterBase[i * 2], z = W.waterBase[i * 2 + 1];
      a[j + 1] = (Math.sin(x * 0.06 + t * 1.1) + Math.cos(z * 0.08 + t * 0.9)) * 0.5 * amp + Math.sin((x + z) * 0.15 + t * 2) * 0.08;
    }
    p.needsUpdate = true;
  }

  /* ---------- islands ---------- */
  function hash(a, b) { var s = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return s - Math.floor(s); }

  function jitterTop(geo, topY) {
    var p = geo.attributes.position;
    for (var i = 0; i < p.count; i++) {
      var x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      if (Math.abs(y - topY) < 0.01) {
        var h = hash(Math.round(x * 100), Math.round(z * 100));
        var k = 1 + (h - 0.5) * 0.12;
        p.setX(i, x * k); p.setZ(i, z * k); p.setY(i, y + (h - 0.5) * 0.2);
      }
    }
    geo.computeVertexNormals();
  }

  function buildIslands() {
    W.islands = {};
    C.MAP.forEach(function (d, idx) {
      var target = d.id === 'harbor' ? C.MAP[1] : C.MAP[idx - 1];
      W.islands[d.id] = makeIsland(d, target);
    });
  }

  function makeIsland(d, target) {
    var g = new THREE.Group(); g.position.set(d.x, 0, d.z); W.scene.add(g);
    var isl = { id: d.id, x: d.x, z: d.z, r: d.r, built: !!d.built, group: g, obstacles: [], spots: {}, grassR: d.grass ? d.r * 0.72 : 0 };

    var sand = d.style === 'desert' ? 0xe8c27a : 0xf2dca0;
    var base = new THREE.CylinderGeometry(d.r, d.r * 1.25, 4, 18, 1);
    base.translate(0, -1, 0);
    jitterTop(base, 1.0);
    g.add(M.mesh(base, sand));
    if (d.grass) {
      var gg = new THREE.CylinderGeometry(d.r * 0.72, d.r * 0.78, 0.3, 16);
      gg.translate(0, 1.0, 0);
      g.add(M.mesh(gg, d.grass));
    }

    // dock facing the neighbouring island
    var dx = target.x - d.x, dz = target.z - d.z, L = Math.hypot(dx, dz);
    var dir = { x: dx / L, z: dz / L }, perp = { x: -dir.z, z: dir.x };
    var heading = Math.atan2(dir.x, dir.z);
    var local = function (along, side) { return { x: dir.x * along + perp.x * side, z: dir.z * along + perp.z * side }; };
    var world = function (along, side, y) { var l = local(along, side); return V(d.x + l.x, y || 0, d.z + l.z); };
    isl.local = local; isl.world = world;

    var pc = local(d.r + 2, 0);
    var pier = M.mesh(M.G.box(2.4, 0.15, 10), 0xa8774a, pc.x, 1.175, pc.z);
    pier.rotation.y = heading; g.add(pier);
    for (var a = d.r - 1; a <= d.r + 7; a += 2.5) {
      [-1.1, 1.1].forEach(function (s) {
        var pp = local(a, s);
        g.add(M.mesh(M.G.cyl(0.12, 0.12, 2.6, 5), 0x6b4a2b, pp.x, -0.1, pp.z));
      });
    }
    isl.dock = {
      dir: dir, perp: perp, heading: heading,
      ferryPos: world(d.r + 5, 3.1),
      captainPos: world(d.r + 5.8, 0.5, 1.25),
      alongMin: d.r - 3, alongMax: d.r + 7
    };

    function polar(angle, dist) { return local(Math.cos(angle) * dist, Math.sin(angle) * dist); }
    function palm(angle, dist) {
      var l = polar(angle, dist), p = M.palm(3.4 + Math.random() * 1.6);
      p.position.set(l.x, 1.0, l.z); p.rotation.y = Math.random() * 6; g.add(p);
      isl.obstacles.push({ x: d.x + l.x, z: d.z + l.z, r: 0.45 });
    }
    function rock(angle, dist, s) {
      var l = polar(angle, dist), m = M.rock(s);
      m.position.set(l.x, 1.0, l.z); g.add(m);
      if (dist < d.r - 1) isl.obstacles.push({ x: d.x + l.x, z: d.z + l.z, r: s * 0.9 });
    }
    function lantern(along, side, withLight) {
      var l = local(along, side), ln = M.lantern();
      ln.group.position.set(l.x, along > d.r - 3 && Math.abs(side) < 1.3 ? 1.25 : 1.0, l.z); g.add(ln.group);
      var entry = { mat: ln.mat, light: null };
      if (withLight) {
        var pl = new THREE.PointLight(0xffb347, 0, 14, 2);
        pl.position.set(l.x, 3, l.z); g.add(pl); entry.light = pl;
      }
      W.lamps.push(entry);
    }
    function flowers(n, minD, maxD) {
      var cols = [0xff6b6b, 0xffd166, 0xf28482, 0xcdb4db, 0xffffff];
      for (var i = 0; i < n; i++) {
        var ang = 0.6 + Math.random() * (Math.PI * 2 - 1.2), dist = minD + Math.random() * (maxD - minD);
        var l = polar(ang, dist), f = M.flower(cols[i % cols.length]);
        f.position.set(l.x, 1.14, l.z); g.add(f);
      }
    }

    if (d.id === 'harbor') {
      [1.6, 2.2, 2.9, 3.6, 4.3, -1.3, -2.0, -2.7].forEach(function (a, i) { palm(a, d.r - 3.5 - (i % 3)); });
      var booth = M.booth(); var bl = local(d.r - 6, -4.5);
      booth.position.set(bl.x, 1.0, bl.z); booth.rotation.y = heading + Math.PI / 2; g.add(booth);
      isl.obstacles.push({ x: d.x + bl.x, z: d.z + bl.z, r: 1.7 });
      isl.spots.booth = world(d.r - 6, -4.5, 1);
      lantern(d.r - 1, 1.05, true); lantern(d.r + 6.5, -1.05, true); lantern(d.r - 6, -2.4, false);
      [0.9, -0.9, 3.1].forEach(function (a) { rock(a, d.r - 0.5, 0.6 + Math.random() * 0.5); });
      flowers(14, 4, d.r * 0.65);
      isl.spots.afra = world(d.r - 6, -1.6, 1);
      isl.spots.spawn = world(d.r - 9, 0.5, 1);
      isl.spots.spawnFacesDock = true;
    } else if (d.built) {
      var pav = M.pavilion({ roof: d.roof, board: d.board }); var pl2 = local(-4, 0);
      pav.position.set(pl2.x, 0, pl2.z); pav.rotation.y = heading; g.add(pav);
      for (var i = 0; i < 6; i++) {
        var aa = i / 6 * Math.PI * 2 + Math.PI / 6;
        var cx = Math.cos(aa) * 3.5, cz = Math.sin(aa) * 3.5;
        // rotate pillar offsets by the pavilion's heading
        var rx = cx * Math.cos(heading) + cz * Math.sin(heading), rz = -cx * Math.sin(heading) + cz * Math.cos(heading);
        isl.obstacles.push({ x: d.x + pl2.x + rx, z: d.z + pl2.z + rz, r: 0.3 });
      }
      if (d.style === 'cliffs') {
        // tall grey cliffs along the far side, where the echoes bounce back
        [2.45, 2.75, 3.05, 3.35, 3.65, 3.95].forEach(function (a, k) {
          var cl = polar(a, d.r - 2.2 + (k % 2) * 0.8), cm = M.rock(2.3 + Math.random() * 0.8, k % 2 ? 0x9c8f80 : 0x8a8178);
          cm.scale.y = 2.6 + Math.random() * 1.8; cm.position.set(cl.x, 1.0, cl.z); g.add(cm);
          isl.obstacles.push({ x: d.x + cl.x, z: d.z + cl.z, r: 2.5 });
        });
        [1.4, 2.05, -1.2, -2.0].forEach(function (a, i) { palm(a, d.r - 3.5 - (i % 2)); });
        [0.8, -0.8, 2.2, -2.6].forEach(function (a) { rock(a, d.r - 0.5, 0.7 + Math.random() * 0.6); });
        flowers(10, 6, d.r * 0.6);
      } else if (d.style === 'desert') {
        // rolling dunes behind the pavilion
        [2.75, 3.1, 3.45, 3.8].forEach(function (a, k) {
          var dl = polar(a, d.r - 3.2), dune = M.mesh(M.G.cone(3.2 + (k % 2) * 0.8, 1.6 + (k % 3) * 0.5, 7), k % 2 ? 0xe2b765 : 0xd9a94f);
          dune.position.set(dl.x, 1.0 + 0.6, dl.z); g.add(dune);
          isl.obstacles.push({ x: d.x + dl.x, z: d.z + dl.z, r: 3.0 });
        });
        // a small oasis with palms
        var ol = polar(-2.35, 12.5);
        g.add(M.mesh(M.G.cyl(2.6, 2.6, 0.12, 12), 0x2ec4b6, ol.x, 1.17, ol.z, { shininess: 80 }));
        g.add(M.mesh(M.G.cyl(2.9, 3.0, 0.1, 12), 0x8fbf5a, ol.x, 1.12, ol.z));
        isl.obstacles.push({ x: d.x + ol.x, z: d.z + ol.z, r: 2.7 });
        [0, 2.1, 4.2].forEach(function (a) {
          var p = M.palm(3.6 + Math.random()), px = ol.x + Math.cos(a) * 3.3, pz = ol.z + Math.sin(a) * 3.3;
          p.position.set(px, 1.0, pz); p.rotation.y = Math.random() * 6; g.add(p);
          isl.obstacles.push({ x: d.x + px, z: d.z + pz, r: 0.45 });
        });
        [1.2, 2.05, -1.25, 4.3].forEach(function (a, i) {
          var cl = polar(a, d.r - 3.5 - (i % 2)), c = M.cactus(1.8 + Math.random() * 1.2);
          c.position.set(cl.x, 1.0, cl.z); c.rotation.y = Math.random() * 6; g.add(c);
          isl.obstacles.push({ x: d.x + cl.x, z: d.z + cl.z, r: 0.6 });
        });
        [0.8, -0.8, 2.3].forEach(function (a) { rock(a, d.r - 0.5, 0.7 + Math.random() * 0.6); });
        flowers(5, 6, d.r * 0.6);
      } else if (d.style === 'aclopips') {
        // trees with metal trunks and solar-panel leaves
        [1.35, 2.05, 2.85, 3.45, -2.6, -1.95, -1.25].forEach(function (a, i) {
          var tl = polar(a, d.r - 3.5 - (i % 2) * 1.5), tr = M.techTree(3.2 + Math.random() * 1.2);
          tr.position.set(tl.x, 1.0, tl.z); tr.rotation.y = Math.random() * 6; g.add(tr);
          isl.obstacles.push({ x: d.x + tl.x, z: d.z + tl.z, r: 0.5 });
        });
        W.lamps.push({ mat: M.glowMat, light: null });
        // flowers that are also wind turbines
        [[1.0, 16, 0xff8fab], [-1.0, 16, 0xb39ddb], [3.15, 15.5, 0x80ffdb]].forEach(function (w, i) {
          var wl = polar(w[0], w[1]), wf = M.windFlower(4.5 + i * 0.6, w[2]);
          wf.position.set(wl.x, 1.0, wl.z); wf.rotation.y = heading + Math.PI * 0.15 * (i - 1); g.add(wf);
          W.spinners.push({ obj: wf.userData.rotor, speed: 1.2 + i * 0.3 });
          isl.obstacles.push({ x: d.x + wl.x, z: d.z + wl.z, r: 0.4 });
        });
        // glass garden domes
        [[2.45, 15, 1.8], [-2.25, 13.5, 1.5]].forEach(function (o) {
          var dl = polar(o[0], o[1]), dm = M.dome(o[2]);
          dm.position.set(dl.x, 1.0, dl.z); g.add(dm);
          isl.obstacles.push({ x: d.x + dl.x, z: d.z + dl.z, r: o[2] + 0.3 });
        });
        [0.8, -0.8].forEach(function (a) { rock(a, d.r - 0.5, 0.7 + Math.random() * 0.5); });
        flowers(18, 6, d.r * 0.68);
      } else {
        [1.4, 2.0, 2.6, 3.3, 3.9, 4.6, -1.2, -1.9].forEach(function (a, i) { palm(a, d.r - 3.5 - (i % 3)); });
        [0.8, -0.8, 2.3, 4.1].forEach(function (a) { rock(a, d.r - 0.5, 0.6 + Math.random() * 0.6); });
        flowers(22, 6, d.r * 0.68);
      }
      lantern(d.r - 1, 1.05, false); lantern(d.r + 6.5, -1.05, false);
      isl.spots.afra = world(-4, 0.6, 1.18);
      isl.spots.spawn = world(d.r - 5, 0.5, 1);
      var s2 = M.label(d.label || C.islandName(d.id), { h: 1.4 });
      s2.position.set(0, 8.5, 0); g.add(s2);
      var info = C.ISLANDS && C.ISLANDS[d.id];
      if (info && info.stones) {
        // standing stones / signs to read around the island
        isl.stones = [];
        var stoneCols = [0x8fb8de, 0xd98c8c, 0xe6a3b5, 0xc97b84, 0xb39ddb];
        var angles = info.stones.length === 3 ? [1.0, 2.4, -1.0]
          : info.stones.length === 4 ? [0.75, 1.6, -1.6, -0.75] : [0.75, 1.55, 2.5, -1.55, -0.75];
        info.stones.forEach(function (z, i) {
          var a = angles[i], sl = polar(a, 10.5), st = M.stone(z.icon + ' ' + z.name, stoneCols[i % 5]);
          st.position.set(sl.x, 1.1, sl.z); g.add(st);
          isl.obstacles.push({ x: d.x + sl.x, z: d.z + sl.z, r: 1.1 });
          isl.stones.push({ pos: V(d.x + sl.x, 1.1, d.z + sl.z), zone: z });
        });
      }
    } else {
      // islands still to come
      if (d.style === 'cliffs') {
        for (var k = 0; k < 7; k++) {
          var cl = polar(k * 0.9, 3 + (k % 3) * 3), cm = M.rock(2 + Math.random() * 1.5, 0x9c8f80);
          cm.scale.y = 2 + Math.random() * 1.5; cm.position.set(cl.x, 1.5, cl.z); g.add(cm);
        }
      } else if (d.style === 'desert') {
        for (var q = 0; q < 6; q++) {
          var dl = polar(q * 1.1, 4 + (q % 3) * 3.5), dune = M.mesh(M.G.cone(3 + Math.random() * 2, 1.5 + Math.random(), 7), 0xe2b765);
          dune.position.set(dl.x, 1.4, dl.z); g.add(dune);
        }
      } else {
        [0.5, 1.7, 2.9, 4.0, 5.2].forEach(function (a, i) { palm(a, d.r * 0.5 + (i % 3) * 2); });
      }
      var lab = M.label('🔒 ' + C.islandName(d.id), { h: 2.2 });
      lab.position.set(0, 11, 0); g.add(lab);
    }
    return isl;
  }

  /* ---------- clouds, rain, sea life ---------- */
  function buildClouds() {
    W.cloudMat = new THREE.MeshPhongMaterial({ color: 0xffffff, flatShading: true, transparent: true, opacity: 0.9 });
    W.clouds = [];
    for (var i = 0; i < 22; i++) {
      var c = M.cloud(W.cloudMat);
      c.position.set(-350 + Math.random() * 700, 45 + Math.random() * 25, -650 + Math.random() * 900);
      c.rotation.y = Math.random() * 6;
      W.scene.add(c); W.clouds.push(c);
    }
  }

  function buildRain() {
    var n = 1200, pos = new Float32Array(n * 6);
    for (var i = 0; i < n; i++) {
      var x = Math.random() * 80 - 40, y = Math.random() * 40, z = Math.random() * 80 - 40;
      pos.set([x, y, z, x, y - 0.7, z], i * 6);
    }
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    W.rainMat = new THREE.LineBasicMaterial({ color: 0xbfd8ff, transparent: true, opacity: 0 });
    W.rain = new THREE.LineSegments(g, W.rainMat);
    W.rain.frustumCulled = false;
    W.rain.visible = false;
    W.scene.add(W.rain);
  }

  function buildLife() {
    W.gulls = [];
    for (var i = 0; i < 4; i++) { var gu = M.gull(); W.scene.add(gu); W.gulls.push(gu); }
    W.dolphins = [];
    for (var j = 0; j < 3; j++) { var dp = M.dolphin(); dp.visible = false; W.scene.add(dp); W.dolphins.push(dp); }
    // a fishing sailboat between the harbor and Starter Island
    var h = C.MAP[0], s = C.MAP[1];
    var mx = (h.x + s.x) / 2, mz = (h.z + s.z) / 2, dx = s.x - h.x, dz = s.z - h.z, L = Math.hypot(dx, dz);
    W.boat = M.sailboat();
    W.boat.position.set(mx + (dz / L) * 30, 0, mz - (dx / L) * 30);
    W.boat.rotation.y = 1.2;
    W.scene.add(W.boat);
  }

  function pickWeather() {
    var r = Math.random() * 100;
    return r < 40 ? 'clear' : r < 60 ? 'cloudy' : r < 75 ? 'rain' : r < 90 ? 'windy' : 'fog';
  }

  var cNight = new THREE.Color(0x0b1633), cDay = new THREE.Color(0x8fd3ff), cSet = new THREE.Color(0xff9e6b),
      cGrey = new THREE.Color(0x9aa6b2), cFog = new THREE.Color(0xc9d3dc), tmp = new THREE.Color(),
      cCloudNight = new THREE.Color(0x2b3550), cCloudRain = new THREE.Color(0x8a939c), white = new THREE.Color(0xffffff);
  var sunDir = V(0, 1, 0);

  /* Called every frame. minutes = in-game clock. focus = where the action is. */
  W.update = function (dt, t, minutes, focus, gullCenter) {
    // weather (1 real second = 1 game minute)
    var w = W.weather;
    w.timer -= dt;
    if (w.timer <= 0) { w.state = pickWeather(); w.timer = 180 + Math.random() * 180; }
    var tgt = WEATHER[w.state], k = Math.min(1, dt * 0.03);
    ['cloud', 'rain', 'wind', 'fog'].forEach(function (key) { w.cur[key] += (tgt[key] - w.cur[key]) * k; });
    var cur = w.cur;

    // sun position
    var m = ((minutes % 1440) + 1440) % 1440;
    var ang = (m / 1440) * Math.PI * 2 - Math.PI / 2;
    var elev = Math.sin(ang);
    sunDir.set(Math.cos(ang), elev, 0.35).normalize();
    var day = THREE.MathUtils.clamp((elev + 0.08) / 0.35, 0, 1);
    var sunset = THREE.MathUtils.clamp(1 - Math.abs(elev) / 0.28, 0, 1);
    W.dayFactor = day;

    tmp.copy(cNight).lerp(cDay, day).lerp(cSet, sunset * 0.5 * (1 - cur.cloud * 0.5));
    tmp.lerp(cGrey, cur.cloud * 0.4 * day);
    tmp.lerp(cFog, cur.fog * 0.5 * Math.max(day, 0.2));
    W.scene.background.copy(tmp);
    W.scene.fog.color.copy(tmp);
    W.scene.fog.near = THREE.MathUtils.lerp(90, 4, cur.fog);
    W.scene.fog.far = THREE.MathUtils.lerp(320, 80, cur.fog);

    var light = W.sun;
    var above = elev > -0.02;
    var ld = above ? sunDir : V(-sunDir.x, -sunDir.y, -sunDir.z);
    light.position.copy(focus).addScaledVector(ld, 120);
    light.target.position.copy(focus);
    if (above) {
      light.color.setHex(0xfff1d6).lerp(tmp.setHex(0xffa060), sunset * 0.6);
      light.intensity = (0.15 + 0.85 * day) * (1 - cur.cloud * 0.45);
    } else {
      light.color.setHex(0x8fa8ff);
      light.intensity = 0.22 * (1 - cur.cloud * 0.5);
    }
    W.hemi.intensity = 0.22 + 0.45 * day;
    W.amb.intensity = 0.1 + 0.06 * (1 - day);

    var cam = W.camera.position;
    W.stars.position.copy(cam);
    W.starMat.opacity = (1 - day) * (1 - cur.cloud * 0.8);
    W.sunMesh.position.copy(cam).addScaledVector(sunDir, 600);
    W.sunMesh.visible = elev > -0.1 && cur.fog < 0.7;
    W.moonMesh.position.copy(cam).addScaledVector(sunDir, -600);
    W.moonMesh.visible = elev < 0.1 && cur.fog < 0.7;

    var night = 1 - day;
    W.lamps.forEach(function (l) {
      l.mat.emissiveIntensity = night * 1.2;
      if (l.light) l.light.intensity = night * 1.3;
    });

    W.spinners.forEach(function (s) { s.obj.rotation.z += dt * s.speed * (0.6 + cur.wind * 2.5); });

    // clouds
    var visibleClouds = Math.round(6 + 16 * cur.cloud);
    W.cloudMat.color.copy(cCloudNight).lerp(white, day).lerp(cCloudRain, cur.rain * 0.6);
    W.cloudMat.opacity = 0.55 + 0.4 * cur.cloud;
    W.clouds.forEach(function (c, i) {
      c.visible = i < visibleClouds;
      c.position.x += dt * (1 + cur.wind * 5);
      if (c.position.x > 380) c.position.x = -380;
    });

    // rain falls around the camera
    W.rain.visible = cur.rain > 0.03;
    if (W.rain.visible) {
      W.rainMat.opacity = cur.rain * 0.55;
      W.rain.position.set(cam.x, 0, cam.z);
      var rp = W.rain.geometry.attributes.position, ra = rp.array, slant = cur.wind * 0.35;
      for (var i = 0; i < ra.length; i += 6) {
        ra[i + 1] -= dt * 28; ra[i + 4] = ra[i + 1] - 0.7;
        if (ra[i + 1] < 0) { ra[i + 1] = 38 + Math.random() * 4; ra[i + 4] = ra[i + 1] - 0.7; }
        ra[i + 3] = ra[i] - slant;
      }
      rp.needsUpdate = true;
    }

    updateWater(t, cur.wind);

    // seagulls circle overhead
    var gc = gullCenter || focus;
    W.gulls.forEach(function (gu, i) {
      var a = t * (0.35 + i * 0.05) + i * 1.7, rad = 8 + i * 3;
      gu.position.set(gc.x + Math.cos(a) * rad, gc.y + 9 + i * 1.2 + Math.sin(t + i) * 0.6, gc.z + Math.sin(a) * rad);
      gu.rotation.y = -a;
      var fl = Math.sin(t * 7 + i) * 0.5;
      gu.userData.wl.rotation.z = fl; gu.userData.wr.rotation.z = -fl;
      gu.visible = day > 0.2 && cur.rain < 0.5;
    });

    // sailboat bobs
    W.boat.position.y = Math.sin(t * 1.2) * 0.15;
    W.boat.rotation.z = Math.sin(t * 0.9) * 0.05;

    return {
      wave: 0.6 + cur.wind * 0.4,
      wind: cur.wind,
      rain: cur.rain,
      gulls: day > 0.3 && cur.rain < 0.5,
      day: day
    };
  };

  W.weatherLabel = function () {
    var s = W.weather.state, w = WEATHER[s];
    if (s === 'clear' && W.dayFactor < 0.3) return '🌙 Clear night';
    return w.icon + ' ' + w.name;
  };

  W.render = function () { W.renderer.render(W.scene, W.camera); };
})();
