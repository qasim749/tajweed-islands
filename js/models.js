/* Tajweed Islands – low-poly 3D models, built from simple shapes.
   Every model faces +Z. */
(function () {
  var M = TI.Models = {};
  var cache = {};

  M.mat = function (color, opts) {
    var key = color + '|' + JSON.stringify(opts || {});
    if (!cache[key]) {
      cache[key] = new THREE.MeshPhongMaterial(Object.assign({ color: color, flatShading: true, shininess: 6 }, opts || {}));
    }
    return cache[key];
  };

  M.mesh = function (geo, color, x, y, z, opts) {
    var m = new THREE.Mesh(geo, color && color.isMaterial ? color : M.mat(color, opts));
    m.position.set(x || 0, y || 0, z || 0);
    m.castShadow = true;
    m.receiveShadow = true;
    return m;
  };

  var G = M.G = {
    box: function (w, h, d) { return new THREE.BoxGeometry(w, h, d); },
    cyl: function (rt, rb, h, s) { return new THREE.CylinderGeometry(rt, rb, h, s || 8); },
    sph: function (r, w, h) { return new THREE.SphereGeometry(r, w || 8, h || 6); },
    cone: function (r, h, s) { return new THREE.ConeGeometry(r, h, s || 6); },
    ico: function (r, d) { return new THREE.IcosahedronGeometry(r, d || 0); }
  };

  function group() { return new THREE.Group(); }

  /* ================= PEOPLE ================= */
  M.person = function (kind, opt) {
    opt = opt || {};
    var outer = group(), g = group();
    outer.add(g);
    var skin = opt.skin != null ? opt.skin : 0xc68642;
    var robe = 0x4b3f72, hijab = null, scale = 1;
    if (kind === 'girl') { robe = 0x3d4f7a; hijab = 0xf2c6d0; }
    else if (kind === 'boy') { robe = 0xf4f1ea; }
    else if (kind === 'afra') { robe = 0x264653; hijab = 0x2a9d8f; scale = 1.25; skin = 0xd8a477; }
    else if (kind === 'captain') { robe = 0x1d3557; scale = 1.3; skin = 0xb57a4c; }

    var legColor = kind === 'captain' ? 0xf1faee : robe;
    function leg(x) {
      var p = group(); p.position.set(x, 0.45, 0);
      p.add(M.mesh(G.cyl(0.07, 0.07, 0.45, 6), legColor, 0, -0.22, 0));
      p.add(M.mesh(G.box(0.13, 0.07, 0.22), 0x3d2b1f, 0, -0.42, 0.04));
      g.add(p);
      return p;
    }
    var legL = leg(-0.11), legR = leg(0.11);

    if (kind === 'captain') {
      g.add(M.mesh(G.cyl(0.27, 0.32, 0.6, 8), robe, 0, 0.73, 0));
      g.add(M.mesh(G.box(0.62, 0.07, 0.62), 0x2b2118, 0, 0.5, 0));            // belt
      g.add(M.mesh(G.box(0.05, 0.4, 0.02), 0xf1c453, 0, 0.78, 0.29));          // buttons
    } else {
      g.add(M.mesh(G.cyl(0.24, 0.37, 0.78, 8), robe, 0, 0.6, 0));
    }

    function arm(x) {
      var p = group(); p.position.set(x, 0.95, 0);
      p.add(M.mesh(G.cyl(0.065, 0.075, 0.5, 6), robe, 0, -0.25, 0));
      p.add(M.mesh(G.sph(0.07, 6, 5), skin, 0, -0.52, 0));
      g.add(p);
      return p;
    }
    var armL = arm(-0.3), armR = arm(0.3);

    var head = group(); head.position.set(0, 1.22, 0); g.add(head);
    head.add(M.mesh(G.sph(0.22, 10, 8), skin));
    head.add(M.mesh(G.sph(0.028, 5, 4), 0x1a1a1a, -0.08, 0.03, 0.2));
    head.add(M.mesh(G.sph(0.028, 5, 4), 0x1a1a1a, 0.08, 0.03, 0.2));
    head.add(M.mesh(G.box(0.08, 0.02, 0.02), 0x8a4b3a, 0, -0.08, 0.21));     // smile

    if (hijab) {
      var hm = M.mat(hijab, { side: THREE.DoubleSide });
      head.add(M.mesh(new THREE.SphereGeometry(0.25, 12, 6, 0, Math.PI * 2, 0, 0.95), hm));
      var gap = 1.9;
      head.add(M.mesh(new THREE.SphereGeometry(0.25, 12, 8, Math.PI / 2 + gap / 2, Math.PI * 2 - gap, 0.9, Math.PI - 0.9), hm));
      g.add(M.mesh(G.cyl(0.2, 0.38, 0.34, 10), hijab, 0, 1.0, 0));            // drape over shoulders
    }
    if (kind === 'boy') {
      head.add(M.mesh(new THREE.SphereGeometry(0.228, 10, 6, 0, Math.PI * 2, 0, 1.2), 0x2b1d14, 0, 0, -0.01));
      head.add(M.mesh(G.cyl(0.19, 0.205, 0.12, 12), 0xffffff, 0, 0.16, 0));  // kufi
    }
    if (kind === 'captain') {
      head.add(M.mesh(G.cyl(0.24, 0.24, 0.14, 10), 0xffffff, 0, 0.2, 0));
      head.add(M.mesh(G.cyl(0.25, 0.25, 0.03, 10), 0x1d3557, 0, 0.14, 0));
      head.add(M.mesh(G.box(0.3, 0.03, 0.16), 0x111111, 0, 0.14, 0.2));
      head.add(M.mesh(G.box(0.06, 0.05, 0.02), 0xf1c453, 0, 0.21, 0.24));
      var beard = M.mesh(G.sph(0.17, 8, 6), 0xd9d9d9, 0, -0.12, 0.08);
      beard.scale.set(1, 0.8, 0.8); head.add(beard);
    }
    if (kind === 'afra') {
      var book = M.mesh(G.box(0.2, 0.26, 0.06), 0x9b2226, 0, -0.5, 0.08);
      armR.add(book);
    }

    g.scale.setScalar(scale);
    outer.userData.anim = { legL: legL, legR: legR, armL: armL, armR: armR, head: head };
    outer.userData.kind = kind;
    return outer;
  };

  M.animatePerson = function (p, t, moving) {
    var a = p.userData.anim; if (!a) return;
    var s = moving ? Math.sin(t * 10) * 0.6 : 0;
    a.legL.rotation.x = s; a.legR.rotation.x = -s;
    a.armL.rotation.x = -s * 0.8; a.armR.rotation.x = s * 0.8;
    a.head.position.y = 1.22 + (moving ? Math.abs(Math.sin(t * 10)) * 0.03 : Math.sin(t * 2) * 0.008);
  };

  /* ================= PETS ================= */
  M.pet = function (kind) {
    var g = group(), ud = { kind: kind, fly: false, legs: [], wings: [] };
    if (kind === 'cat') {
      var c = 0xe09f3e;
      g.add(M.mesh(G.box(0.24, 0.2, 0.44), c, 0, 0.26, 0));
      var head = M.mesh(G.box(0.24, 0.22, 0.2), c, 0, 0.4, 0.26); g.add(head);
      g.add(M.mesh(G.box(0.12, 0.08, 0.04), 0xfff1e0, 0, 0.35, 0.37));
      g.add(M.mesh(G.cone(0.05, 0.1, 4), c, -0.07, 0.55, 0.26));
      g.add(M.mesh(G.cone(0.05, 0.1, 4), c, 0.07, 0.55, 0.26));
      g.add(M.mesh(G.sph(0.02, 4, 3), 0x1a1a1a, -0.06, 0.43, 0.36));
      g.add(M.mesh(G.sph(0.02, 4, 3), 0x1a1a1a, 0.06, 0.43, 0.36));
      [[-0.08, 0.15], [0.08, 0.15], [-0.08, -0.15], [0.08, -0.15]].forEach(function (p) {
        var l = group(); l.position.set(p[0], 0.18, p[1]);
        l.add(M.mesh(G.box(0.06, 0.18, 0.06), c, 0, -0.09, 0)); g.add(l); ud.legs.push(l);
      });
      var tail = group(); tail.position.set(0, 0.32, -0.22);
      var tm = M.mesh(G.cyl(0.03, 0.03, 0.36, 5), c, 0, 0.16, -0.05); tm.rotation.x = -0.4; tail.add(tm);
      g.add(tail); ud.tail = tail;
    } else if (kind === 'chick') {
      g.add(M.mesh(G.sph(0.15, 8, 6), 0xffd23f, 0, 0.17, 0));
      g.add(M.mesh(G.sph(0.1, 8, 6), 0xffd23f, 0, 0.33, 0.06));
      var beak = M.mesh(G.cone(0.03, 0.07, 4), 0xf77f00, 0, 0.32, 0.17); beak.rotation.x = Math.PI / 2; g.add(beak);
      g.add(M.mesh(G.sph(0.015, 4, 3), 0x111111, -0.04, 0.36, 0.14));
      g.add(M.mesh(G.sph(0.015, 4, 3), 0x111111, 0.04, 0.36, 0.14));
      [-0.05, 0.05].forEach(function (x) {
        var l = group(); l.position.set(x, 0.05, 0);
        l.add(M.mesh(G.box(0.04, 0.06, 0.06), 0xf77f00, 0, -0.02, 0.02)); g.add(l); ud.legs.push(l);
      });
      [-1, 1].forEach(function (s) {
        var w = group(); w.position.set(0.14 * s, 0.2, 0);
        var wm = M.mesh(G.sph(0.07, 6, 4), 0xf5c518, 0.02 * s, 0, 0); wm.scale.set(0.5, 0.8, 1.2); w.add(wm);
        g.add(w); ud.wings.push(w);
      });
    } else {
      // parrot or dove: flying birds
      var parrot = kind === 'parrot';
      ud.fly = true;
      var body = M.mesh(G.sph(0.13, 8, 6), parrot ? 0x2fb344 : 0xf4f4f4, 0, 0, 0); body.scale.set(1, 1, 1.35); g.add(body);
      g.add(M.mesh(G.sph(0.1, 8, 6), parrot ? 0xe63946 : 0xf4f4f4, 0, 0.1, 0.14));
      var bk = M.mesh(G.cone(0.035, 0.08, 4), parrot ? 0xffd166 : 0xf2a7b5, 0, 0.08, 0.26); bk.rotation.x = Math.PI / 2; g.add(bk);
      g.add(M.mesh(G.sph(0.015, 4, 3), 0x111111, -0.05, 0.14, 0.21));
      g.add(M.mesh(G.sph(0.015, 4, 3), 0x111111, 0.05, 0.14, 0.21));
      var tl = M.mesh(G.box(0.08, 0.02, 0.3), parrot ? 0x1d6fd6 : 0xdddddd, 0, -0.02, -0.26); tl.rotation.x = 0.3; g.add(tl);
      [-1, 1].forEach(function (s) {
        var w = group(); w.position.set(0.1 * s, 0.03, 0);
        w.add(M.mesh(G.box(0.3, 0.02, 0.18), parrot ? 0x1f8a35 : 0xcfcfcf, 0.15 * s, 0, 0));
        g.add(w); ud.wings.push(w); w.userData.side = s;
      });
    }
    g.userData = ud;
    return g;
  };

  M.animatePet = function (p, t, moving) {
    var ud = p.userData;
    if (ud.fly) {
      ud.wings.forEach(function (w) { w.rotation.z = Math.sin(t * 18) * 0.7 * w.userData.side; });
      return;
    }
    var s = moving ? Math.sin(t * 14) * 0.6 : 0;
    ud.legs.forEach(function (l, i) { l.rotation.x = (i % 2 ? -s : s); });
    if (ud.tail) ud.tail.rotation.z = Math.sin(t * 3) * 0.4;
    ud.wings.forEach(function (w, i) { w.rotation.z = (i ? 1 : -1) * (moving ? Math.abs(Math.sin(t * 12)) * 0.4 : 0); });
  };

  /* ================= COW ================= */
  M.cow = function (scale) {
    var outer = group(), g = group(); outer.add(g);
    var W = 0xf7f7f2, B = 0x1d1d1d, P = 0xf4a6b8;
    g.add(M.mesh(G.box(0.7, 0.6, 1.2), W, 0, 0.75, 0));
    [[0.36, 0.8, 0.2, 0.3], [-0.36, 0.7, -0.25, 0.35], [0, 1.06, -0.2, 0.3], [0.36, 0.65, -0.35, 0.2]].forEach(function (s) {
      var sp = M.mesh(G.box(s[0] === 0 ? s[3] : 0.03, s[0] === 0 ? 0.03 : s[3] * 0.8, s[3]), B, s[0] + (s[0] > 0 ? 0.005 : s[0] < 0 ? -0.005 : 0), s[1], s[2]);
      g.add(sp);
    });
    var head = group(); head.position.set(0, 0.95, 0.72); g.add(head);
    head.add(M.mesh(G.box(0.44, 0.42, 0.42), W, 0, 0, 0));
    head.add(M.mesh(G.box(0.38, 0.2, 0.14), P, 0, -0.1, 0.25));
    head.add(M.mesh(G.box(0.15, 0.12, 0.03), B, -0.1, 0.09, 0.215));
    head.add(M.mesh(G.sph(0.03, 4, 3), B, -0.11, 0.08, 0.22));
    head.add(M.mesh(G.sph(0.03, 4, 3), B, 0.11, 0.08, 0.22));
    var h1 = M.mesh(G.cone(0.04, 0.16, 5), 0xf1e3c6, -0.17, 0.27, 0); h1.rotation.z = 0.5; head.add(h1);
    var h2 = M.mesh(G.cone(0.04, 0.16, 5), 0xf1e3c6, 0.17, 0.27, 0); h2.rotation.z = -0.5; head.add(h2);
    head.add(M.mesh(G.box(0.16, 0.06, 0.1), W, -0.29, 0.12, -0.04));
    head.add(M.mesh(G.box(0.16, 0.06, 0.1), W, 0.29, 0.12, -0.04));
    [[-0.22, 0.4], [0.22, 0.4], [-0.22, -0.4], [0.22, -0.4]].forEach(function (p) {
      g.add(M.mesh(G.cyl(0.08, 0.08, 0.45, 6), W, p[0], 0.25, p[1]));
      g.add(M.mesh(G.cyl(0.085, 0.085, 0.08, 6), B, p[0], 0.04, p[1]));
    });
    var tail = group(); tail.position.set(0, 0.95, -0.6);
    tail.add(M.mesh(G.cyl(0.025, 0.025, 0.5, 5), W, 0, -0.25, 0));
    tail.add(M.mesh(G.sph(0.06, 5, 4), B, 0, -0.52, 0));
    g.add(tail);
    g.scale.setScalar(scale || 1);
    outer.userData = { head: head, tail: tail, body: g };
    return outer;
  };

  /* ================= THE COW FERRY ================= */
  M.ferry = function () {
    var g = group();
    var W = 0xfafaf5, B = 0x1d1d1d, P = 0xf4a6b8, WOOD = 0xb5835a;
    g.add(M.mesh(G.box(2.6, 1.2, 6), W, 0, 0.3, 0));
    g.add(M.mesh(G.cyl(1.5, 1.5, 1.2, 3), W, 0, 0.3, 3.75));
    g.add(M.mesh(G.box(2.64, 0.18, 6.02), P, 0, -0.18, 0));             // pink waterline stripe
    g.add(M.mesh(G.box(2.4, 0.1, 5.8), WOOD, 0, 0.95, 0));
    g.add(M.mesh(G.cyl(1.38, 1.38, 0.1, 3), WOOD, 0, 0.95, 3.75));
    // black cow spots on the hull
    [[3, 0.5, 1.6, 0.8], [-3, 0.35, 1.0, 0.6], [0.5, 0.45, 1.2, 0.7], [-1.2, 0.6, 0.8, 0.5], [2, 0.2, 0.6, 0.4]].forEach(function (s, i) {
      [-1, 1].forEach(function (side) {
        var z = side > 0 ? s[0] * 0.8 : -s[0] * 0.6 + (i % 2) * 0.5;
        g.add(M.mesh(G.box(0.04, s[3], s[2]), B, side * 1.31, s[1], Math.max(-2.6, Math.min(2.6, z))));
      });
    });
    // rails
    g.add(M.mesh(G.box(0.07, 0.07, 5.6), W, -1.17, 1.32, 0.1));
    g.add(M.mesh(G.box(0.07, 0.07, 5.6), W, 1.17, 1.32, 0.1));
    for (var i = -2; i <= 2; i++) {
      g.add(M.mesh(G.box(0.06, 0.36, 0.06), W, -1.17, 1.13, i * 1.3));
      g.add(M.mesh(G.box(0.06, 0.36, 0.06), W, 1.17, 1.13, i * 1.3));
    }
    // cabin
    g.add(M.mesh(G.box(2.0, 1.4, 1.8), W, 0, 1.7, -1.9));
    g.add(M.mesh(G.box(2.3, 0.15, 2.1), B, 0, 2.47, -1.9));
    g.add(M.mesh(G.box(1.4, 0.45, 0.04), 0x2b5d8a, 0, 1.95, -0.99));
    g.add(M.mesh(G.box(0.04, 0.45, 1.0), 0x2b5d8a, 1.01, 1.95, -1.9));
    g.add(M.mesh(G.box(0.04, 0.45, 1.0), 0x2b5d8a, -1.01, 1.95, -1.9));
    g.add(M.mesh(G.box(0.5, 0.35, 0.04), B, 0.55, 1.4, -0.99));          // cabin spot
    var wheel = M.mesh(new THREE.TorusGeometry(0.28, 0.04, 5, 10), 0x7a4e2d, 0, 1.75, -0.92);
    g.add(wheel);
    var buoy = M.mesh(new THREE.TorusGeometry(0.32, 0.1, 6, 10), 0xf77f00, 1.05, 1.7, -2.4);
    buoy.rotation.y = Math.PI / 2; g.add(buoy);
    // flag
    g.add(M.mesh(G.cyl(0.03, 0.03, 1.2, 5), 0x555555, 0, 3.1, -2.5));
    var flag = M.mesh(G.box(0.02, 0.4, 0.6), W, 0, 3.45, -2.2); g.add(flag);
    g.add(M.mesh(G.box(0.03, 0.18, 0.2), B, 0, 3.47, -2.15));

    // cow head at the bow
    var head = group(); head.position.set(0, 1.75, 4.55); g.add(head);
    head.add(M.mesh(G.box(1.1, 1.0, 1.1), W, 0, 0, 0));
    head.add(M.mesh(G.box(0.4, 0.35, 0.04), B, 0.25, 0.25, 0.56));
    head.add(M.mesh(G.box(0.92, 0.5, 0.35), P, 0, -0.22, 0.65));
    head.add(M.mesh(G.box(0.12, 0.12, 0.04), 0x8a3b4f, -0.2, -0.2, 0.83));
    head.add(M.mesh(G.box(0.12, 0.12, 0.04), 0x8a3b4f, 0.2, -0.2, 0.83));
    [-0.3, 0.3].forEach(function (x) {
      head.add(M.mesh(G.sph(0.11, 6, 5), 0xffffff, x, 0.22, 0.53));
      head.add(M.mesh(G.sph(0.06, 5, 4), 0x111111, x, 0.22, 0.62));
    });
    var hornL = M.mesh(G.cone(0.1, 0.45, 5), 0xf1e3c6, -0.45, 0.68, 0); hornL.rotation.z = 0.55; head.add(hornL);
    var hornR = M.mesh(G.cone(0.1, 0.45, 5), 0xf1e3c6, 0.45, 0.68, 0); hornR.rotation.z = -0.55; head.add(hornR);
    function ear(s) {
      var e = group(); e.position.set(0.55 * s, 0.25, -0.1);
      e.add(M.mesh(G.box(0.5, 0.1, 0.3), W, 0.25 * s, 0, 0));
      e.add(M.mesh(G.box(0.38, 0.11, 0.18), P, 0.23 * s, 0.01, 0.03));
      head.add(e); return e;
    }
    var earL = ear(-1), earR = ear(1);
    head.add(M.mesh(G.box(1.12, 0.14, 0.14), 0xc1121f, 0, -0.52, -0.1)); // collar
    var bell = group(); bell.position.set(0, -0.6, 0.05); head.add(bell);
    bell.add(M.mesh(G.cone(0.17, 0.3, 7), 0xf1c453, 0, -0.18, 0, { shininess: 60 }));
    bell.add(M.mesh(G.sph(0.06, 5, 4), 0x8a6d1f, 0, -0.34, 0));
    // tail at the stern
    var tail = group(); tail.position.set(0, 1.0, -3.02); g.add(tail);
    var tm = M.mesh(G.cyl(0.06, 0.06, 1.1, 5), W, 0, -0.5, -0.15); tm.rotation.x = 0.25; tail.add(tm);
    tail.add(M.mesh(G.sph(0.16, 6, 5), B, 0, -1.05, -0.28));

    g.userData = { earL: earL, earR: earR, tail: tail, bell: bell, head: head };
    return g;
  };

  M.animateFerry = function (f, t, sailing) {
    var u = f.userData, sp = sailing ? 6 : 2;
    u.earL.rotation.z = -0.25 + Math.sin(t * sp) * (sailing ? 0.35 : 0.12);
    u.earR.rotation.z = 0.25 - Math.sin(t * sp + 0.5) * (sailing ? 0.35 : 0.12);
    u.tail.rotation.z = Math.sin(t * 1.6) * 0.35;
    u.bell.rotation.x = Math.sin(t * 2.2) * (sailing ? 0.3 : 0.1);
  };

  /* ================= SCENERY ================= */
  M.palm = function (h) {
    var g = group(), segs = 4, x = 0, y = 0, lean = 0.12 + Math.random() * 0.1;
    for (var i = 0; i < segs; i++) {
      var sh = h / segs;
      var m = M.mesh(G.cyl(0.16 - i * 0.02, 0.2 - i * 0.02, sh, 6), 0x8b6b43, x, y + sh / 2, 0);
      m.rotation.z = -lean * 0.5; g.add(m);
      x += lean * sh; y += sh * 0.98;
    }
    var top = group(); top.position.set(x, y, 0); g.add(top);
    for (var j = 0; j < 7; j++) {
      var leaf = group(); leaf.rotation.set(0.45, j / 7 * Math.PI * 2, 0, 'YXZ');
      leaf.add(M.mesh(G.box(0.45, 0.06, 1.9), j % 2 ? 0x3e9b4f : 0x4caf50, 0, 0, 0.95));
      top.add(leaf);
    }
    for (var k = 0; k < 3; k++) top.add(M.mesh(G.sph(0.14, 6, 5), 0x6b4a2b, Math.cos(k * 2.1) * 0.18, -0.12, Math.sin(k * 2.1) * 0.18));
    return g;
  };

  M.rock = function (s, color) {
    var m = M.mesh(G.ico(s, 0), color || 0x8d99ae);
    m.scale.set(1, 0.6 + Math.random() * 0.4, 1);
    m.rotation.y = Math.random() * 6;
    return m;
  };

  /* ---------- Madd Desert ---------- */
  M.cactus = function (h) {
    var g = group(), c = 0x5a9e4b;
    g.add(M.mesh(G.cyl(0.32, 0.38, h, 7), c, 0, h / 2, 0));
    g.add(M.mesh(G.sph(0.32, 7, 5), c, 0, h, 0));
    [[-1, 0.45], [1, 0.62]].forEach(function (a) {
      var y = h * a[1];
      var arm = M.mesh(G.cyl(0.17, 0.17, 0.6, 6), c, a[0] * 0.5, y, 0); arm.rotation.z = Math.PI / 2; g.add(arm);
      g.add(M.mesh(G.cyl(0.17, 0.17, h * 0.32, 6), c, a[0] * 0.8, y + h * 0.16, 0));
      g.add(M.mesh(G.sph(0.17, 6, 4), c, a[0] * 0.8, y + h * 0.32, 0));
    });
    g.add(M.mesh(G.ico(0.12, 0), 0xff6fae, 0, h + 0.3, 0));
    return g;
  };

  /* ---------- Leen Aclopips: nature merged with inventions ---------- */
  var glowMat = new THREE.MeshPhongMaterial({ color: 0x80ffdb, emissive: 0x80ffdb, emissiveIntensity: 0, flatShading: true });
  M.glowMat = glowMat;
  M.techTree = function (h) {
    var g = group(), metal = { shininess: 70 };
    g.add(M.mesh(G.cyl(0.2, 0.32, h, 6), 0x9aa5b1, 0, h / 2, 0, metal));
    for (var i = 1; i <= 3; i++) g.add(M.mesh(G.cyl(0.27 - i * 0.03, 0.27 - i * 0.03, 0.12, 6), 0xb87333, 0, h * i / 4, 0, metal));
    // roots of vines climbing the metal trunk
    for (var v = 0; v < 4; v++) {
      var vine = M.mesh(G.box(0.08, h * 0.55, 0.08), 0x2d6a4f, Math.cos(v * 1.6) * 0.27, h * 0.27, Math.sin(v * 1.6) * 0.27);
      vine.rotation.z = 0.12 * (v % 2 ? 1 : -1); g.add(vine);
    }
    var crown = M.mesh(G.ico(1.5, 0), 0x52b788, 0, h + 0.6, 0); crown.scale.set(1, 0.75, 1); g.add(crown);
    // solar-panel leaves on top
    for (var p = 0; p < 3; p++) {
      var leaf = group(); leaf.rotation.y = p / 3 * Math.PI * 2; leaf.position.y = h + 1.4;
      var pan = M.mesh(G.box(0.9, 0.06, 0.65), 0x1d3557, 0, 0, 0.55, { shininess: 90, specular: 0x6699cc });
      pan.rotation.x = -0.35; leaf.add(pan); g.add(leaf);
    }
    var bulb = M.mesh(G.ico(0.18, 0), glowMat, 0, h + 1.15, 1.25); g.add(bulb);
    return g;
  };

  M.windFlower = function (h, petal) {
    var g = group();
    g.add(M.mesh(G.cyl(0.09, 0.14, h, 6), 0xe0e6ea, 0, h / 2, 0, { shininess: 60 }));
    var leafL = M.mesh(G.box(0.7, 0.05, 0.3), 0x4caf50, 0.35, h * 0.4, 0); leafL.rotation.z = 0.4; g.add(leafL);
    var rotor = group(); rotor.position.set(0, h, 0.2); g.add(rotor);
    rotor.add(M.mesh(G.ico(0.28, 0), 0xffd166, 0, 0, 0.05));
    for (var i = 0; i < 6; i++) {
      var bl = group(); bl.rotation.z = i / 6 * Math.PI * 2;
      var b = M.mesh(G.box(0.36, 1.25, 0.05), i % 2 ? (petal || 0xff8fab) : 0xffffff, 0, 0.78, 0); b.rotation.y = 0.35;
      bl.add(b); rotor.add(bl);
    }
    g.userData.rotor = rotor;
    return g;
  };

  M.dome = function (r) {
    var g = group();
    g.add(M.mesh(G.cyl(r + 0.1, r + 0.2, 0.25, 12), 0x9aa5b1, 0, 0.12, 0, { shininess: 60 }));
    var t = M.mesh(G.cyl(0.12, 0.16, r * 0.6, 5), 0x8b6b43, 0, r * 0.3, 0); g.add(t);
    g.add(M.mesh(G.ico(r * 0.45, 0), 0x40916c, 0, r * 0.7, 0));
    [0xff6b6b, 0xffd166, 0xcdb4db].forEach(function (c, i) { g.add(M.mesh(G.ico(0.12, 0), c, Math.cos(i * 2) * r * 0.6, 0.35, Math.sin(i * 2) * r * 0.6)); });
    var glass = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshPhongMaterial({ color: 0xbde0fe, transparent: true, opacity: 0.32, shininess: 100, specular: 0xffffff, flatShading: true, depthWrite: false }));
    glass.position.y = 0.2; g.add(glass);
    // metal ribs
    for (var i2 = 0; i2 < 4; i2++) {
      var rib = new THREE.Mesh(new THREE.TorusGeometry(r, 0.04, 4, 16, Math.PI), M.mat(0x9aa5b1));
      rib.position.y = 0.2; rib.rotation.y = i2 / 4 * Math.PI; g.add(rib);
    }
    return g;
  };

  M.flower = function (color) {
    var g = group();
    g.add(M.mesh(G.cyl(0.02, 0.02, 0.3, 4), 0x2d6a4f, 0, 0.15, 0));
    g.add(M.mesh(G.ico(0.09, 0), color, 0, 0.32, 0));
    return g;
  };

  M.lantern = function () {
    var g = group();
    g.add(M.mesh(G.cyl(0.06, 0.08, 1.6, 6), 0x3d2b1f, 0, 0.8, 0));
    var lampMat = new THREE.MeshPhongMaterial({ color: 0xffe9a8, emissive: 0xffb347, emissiveIntensity: 0, flatShading: true });
    g.add(M.mesh(G.box(0.3, 0.36, 0.3), lampMat, 0, 1.75, 0));
    g.add(M.mesh(G.cone(0.26, 0.2, 4), 0x3d2b1f, 0, 2.03, 0));
    return { group: g, mat: lampMat };
  };

  M.booth = function () {
    var g = group();
    g.add(M.mesh(G.box(2.4, 1.8, 1.8), 0x5fa8d3, 0, 0.9, 0));
    g.add(M.mesh(G.box(2.6, 0.12, 0.6), 0xb5835a, 0, 1.05, 1.1));
    g.add(M.mesh(G.box(1.6, 0.7, 0.05), 0x1d3557, 0, 1.5, 0.91));
    var roof = M.mesh(G.cyl(0.01, 1.9, 0.9, 4), 0xe76f51, 0, 2.25, 0); roof.rotation.y = Math.PI / 4; g.add(roof);
    var sign = M.label('🎟️ Tickets: FREE', { bg: '#fff6e3', color: '#1d3557', h: 0.55 });
    sign.position.set(0, 2.95, 0.4); g.add(sign);
    return g;
  };

  M.pavilion = function (o) {
    o = o || {};
    var g = group();
    g.add(M.mesh(G.cyl(4, 4.2, 0.15, 6), 0xe9d8a6, 0, 1.1, 0));
    for (var i = 0; i < 6; i++) {
      var a = i / 6 * Math.PI * 2 + Math.PI / 6;
      g.add(M.mesh(G.cyl(0.18, 0.2, 3, 6), 0xfaf3e0, Math.cos(a) * 3.5, 2.6, Math.sin(a) * 3.5));
    }
    g.add(M.mesh(G.cone(5, 2, 6), o.roof || 0x2a9d8f, 0, 5.1, 0));
    g.add(M.mesh(G.sph(0.3, 6, 5), 0xf1c453, 0, 6.2, 0));
    // board with letters (faces +z)
    var b = o.board || ['ا ب ت ث', 'Starter Island'];
    var boardTex = makeBoardTexture(b[0], b[1]);
    var board = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 1.6), new THREE.MeshBasicMaterial({ map: boardTex }));
    board.position.set(0, 2.4, -3.0);
    g.add(board);
    g.add(M.mesh(G.box(3.4, 1.8, 0.1), 0x7a4e2d, 0, 2.4, -3.07));
    return g;
  };

  function makeBoardTexture(arabic, title) {
    var c = document.createElement('canvas'); c.width = 512; c.height = 256;
    var x = c.getContext('2d');
    var draw = function () {
      x.fillStyle = '#2f5d50'; x.fillRect(0, 0, 512, 256);
      x.fillStyle = '#ffffff'; x.textAlign = 'center'; x.textBaseline = 'middle';
      x.font = '100px Amiri, serif';
      x.fillText(arabic, 256, 115);
      x.font = 'bold 30px Nunito, sans-serif';
      x.fillText(title, 256, 220);
    };
    draw();
    var tex = new THREE.CanvasTexture(c);
    // redraw once the web fonts have loaded
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { draw(); tex.needsUpdate = true; });
    return tex;
  }

  /* A standing stone for Makharij Isle, with a floating sign */
  M.stone = function (text, color) {
    var g = group();
    var s = M.mesh(G.ico(1, 0), color || 0x9a8fb5, 0, 1.6, 0);
    s.scale.set(0.9, 2.0, 0.7); g.add(s);
    g.add(M.mesh(G.cyl(1.1, 1.3, 0.25, 7), 0xcfc6b0, 0, 0.1, 0));
    var lab = M.label(text, { h: 0.7 });
    lab.position.set(0, 4.2, 0); g.add(lab);
    return g;
  };

  M.sailboat = function () {
    var g = group();
    g.add(M.mesh(G.box(1.4, 0.6, 3.6), 0x8b5a2b, 0, 0.1, 0));
    g.add(M.mesh(G.cyl(0.06, 0.06, 3.6, 5), 0x5a3a1a, 0, 2.1, 0.2));
    var shape = new THREE.Shape(); shape.moveTo(0, 0); shape.lineTo(0, 3); shape.lineTo(1.8, 0); shape.lineTo(0, 0);
    var sail = new THREE.Mesh(new THREE.ShapeGeometry(shape), M.mat(0xfff8e7, { side: THREE.DoubleSide }));
    sail.position.set(0, 0.6, 0.3); sail.rotation.y = -Math.PI / 2; sail.castShadow = true;
    g.add(sail);
    return g;
  };

  M.dolphin = function () {
    var g = group();
    var body = M.mesh(G.sph(0.4, 8, 6), 0x6c8ea4, 0, 0, 0); body.scale.set(0.8, 0.8, 2.4); g.add(body);
    var belly = M.mesh(G.sph(0.32, 8, 6), 0xd8e2e8, 0, -0.1, 0.1); belly.scale.set(0.8, 0.6, 2.2); g.add(belly);
    var fin = M.mesh(G.cone(0.15, 0.4, 4), 0x5a7a90, 0, 0.42, -0.1); fin.rotation.x = -0.4; g.add(fin);
    var tail = M.mesh(G.box(0.8, 0.05, 0.3), 0x5a7a90, 0, 0, -1.0); g.add(tail);
    var nose = M.mesh(G.cone(0.12, 0.35, 5), 0x6c8ea4, 0, -0.05, 1.05); nose.rotation.x = Math.PI / 2; g.add(nose);
    return g;
  };

  M.gull = function () {
    var g = group();
    var b = M.mesh(G.box(0.22, 0.18, 0.6), 0xffffff, 0, 0, 0); g.add(b);
    g.add(M.mesh(G.cone(0.05, 0.15, 4), 0xf4a261, 0, 0, 0.36));
    var wl = group(), wr = group();
    wl.add(M.mesh(G.box(0.9, 0.03, 0.3), 0xbfc7cf, -0.45, 0, 0));
    wr.add(M.mesh(G.box(0.9, 0.03, 0.3), 0xbfc7cf, 0.45, 0, 0));
    g.add(wl, wr);
    g.userData = { wl: wl, wr: wr };
    return g;
  };

  M.cloud = function (mat) {
    var g = group(), n = 3 + Math.floor(Math.random() * 3);
    for (var i = 0; i < n; i++) {
      var m = new THREE.Mesh(G.ico(3 + Math.random() * 3, 0), mat);
      m.position.set(i * 4 - n * 2, Math.random() * 1.5, Math.random() * 3);
      g.add(m);
    }
    return g;
  };

  /* Floating sign made from a canvas */
  M.label = function (text, o) {
    o = o || {};
    var c = document.createElement('canvas'), x = c.getContext('2d');
    var font = 'bold 44px Nunito, "Segoe UI Emoji", sans-serif';
    x.font = font;
    var w = Math.ceil(x.measureText(text).width) + 48;
    c.width = w; c.height = 76;
    x.font = font;
    x.fillStyle = o.bg || 'rgba(29,42,58,0.75)';
    var r = 22;
    x.beginPath();
    x.moveTo(r, 0); x.lineTo(w - r, 0); x.quadraticCurveTo(w, 0, w, r); x.lineTo(w, 76 - r);
    x.quadraticCurveTo(w, 76, w - r, 76); x.lineTo(r, 76); x.quadraticCurveTo(0, 76, 0, 76 - r);
    x.lineTo(0, r); x.quadraticCurveTo(0, 0, r, 0); x.fill();
    x.fillStyle = o.color || '#ffffff'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText(text, w / 2, 40);
    var tex = new THREE.CanvasTexture(c);
    var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthWrite: false }));
    var h = o.h || 1.2;
    sp.scale.set(w / 76 * h, h, 1);
    return sp;
  };
})();
