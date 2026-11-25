/* Tajweed Islands – 3D models, built in code with physically based materials
   and procedurally generated textures. Every model faces +Z. */
(function () {
  var M = TI.Models = {};
  var cache = {};

  /* Colours are written as sRGB hex; the renderer works in linear light. */
  M.lin = function (hex) { return new THREE.Color(hex).convertSRGBToLinear(); };

  /* ================= NOISE ================= */
  function hash3(x, y, z) { var s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453; return s - Math.floor(s); }
  function vnoise3(x, y, z) {
    var xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
    var xf = x - xi, yf = y - yi, zf = z - zi;
    var u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), w = zf * zf * (3 - 2 * zf);
    function L(a, b, t) { return a + (b - a) * t; }
    return L(
      L(L(hash3(xi, yi, zi), hash3(xi + 1, yi, zi), u), L(hash3(xi, yi + 1, zi), hash3(xi + 1, yi + 1, zi), u), v),
      L(L(hash3(xi, yi, zi + 1), hash3(xi + 1, yi, zi + 1), u), L(hash3(xi, yi + 1, zi + 1), hash3(xi + 1, yi + 1, zi + 1), u), v), w);
  }
  /* fractal noise in 0..1 */
  M.fbm = function (x, y, z, oct) {
    var s = 0, a = 0.5, f = 1, n = 0;
    for (var i = 0; i < (oct || 4); i++) { s += a * vnoise3(x * f, y * f, z * f); n += a; a *= 0.5; f *= 2; }
    return s / n;
  };
  /* tileable 2D noise, for textures */
  function pnoise(x, y, px, py) {
    var xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    var u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    function h(i, j) { i = ((i % px) + px) % px; j = ((j % py) + py) % py; var s = Math.sin(i * 127.1 + j * 311.7) * 43758.5453; return s - Math.floor(s); }
    var a = h(xi, yi), b = h(xi + 1, yi), c = h(xi, yi + 1), d = h(xi + 1, yi + 1);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  }
  function pfbm(u, v, px, py, oct) {
    var s = 0, a = 0.5, f = 1, n = 0;
    for (var i = 0; i < oct; i++) { s += a * pnoise(u * px * f, v * py * f, px * f, py * f); n += a; a *= 0.5; f *= 2; }
    return s / n;
  }

  /* ================= PROCEDURAL TEXTURES ================= */
  function canvas(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
  function pixelTex(w, h, fn, srgb) {
    var c = canvas(w, h), x = c.getContext('2d'), img = x.createImageData(w, h), d = img.data, out = [0, 0, 0, 255];
    for (var j = 0; j < h; j++) for (var i = 0; i < w; i++) {
      fn(i / w, j / h, out);
      var k = (j * w + i) * 4;
      d[k] = out[0]; d[k + 1] = out[1]; d[k + 2] = out[2]; d[k + 3] = out[3];
    }
    x.putImageData(img, 0, 0);
    return finish(new THREE.CanvasTexture(c), srgb);
  }
  function finish(t, srgb) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = 4;
    if (srgb) t.encoding = THREE.sRGBEncoding;
    return t;
  }
  var texCache = {};
  function lazy(name, make) { return function () { return texCache[name] || (texCache[name] = make()); }; }

  var TX = M.tex = {
    // fine grey grain, used as a bump map for fabric, sand, stone
    grain: lazy('grain', function () {
      return pixelTex(256, 256, function (u, v, o) {
        var n = pfbm(u, v, 16, 16, 4) * 0.6 + Math.random() * 0.4; o[0] = o[1] = o[2] = n * 255;
      });
    }),
    // larger lumpy noise for rock and bark
    lumps: lazy('lumps', function () {
      return pixelTex(256, 256, function (u, v, o) { o[0] = o[1] = o[2] = pfbm(u, v, 6, 6, 5) * 255; });
    }),
    // wood planks (colour multiplier)
    wood: lazy('wood', function () {
      return pixelTex(256, 256, function (u, v, o) {
        var plank = Math.floor(u * 4), g = pfbm(u + plank * 0.37, v, 3, 28, 4);
        var seam = (u * 4) % 1 < 0.03 ? 0.55 : 1;
        var c = (0.72 + 0.28 * g) * seam * (0.92 + 0.08 * hash3(plank, 1, 2));
        o[0] = c * 255; o[1] = c * 248; o[2] = c * 240;
      }, true);
    }),
    // palm bark rings (colour multiplier, rings run along v)
    bark: lazy('bark', function () {
      return pixelTex(128, 256, function (u, v, o) {
        var ring = Math.pow(Math.abs(Math.sin(v * Math.PI * 14)), 0.4), n = pfbm(u, v, 8, 16, 4);
        var c = 0.5 + 0.35 * ring + 0.25 * n; o[0] = c * 255; o[1] = c * 235; o[2] = c * 210;
      }, true);
    }),
    // terrain detail (colour multiplier)
    detail: lazy('detail', function () {
      return pixelTex(256, 256, function (u, v, o) {
        var c = 0.82 + 0.18 * pfbm(u, v, 12, 12, 4) + (Math.random() - 0.5) * 0.08; o[0] = o[1] = o[2] = Math.min(255, c * 255);
      }, true);
    }),
    // black-and-white cow hide
    spots: lazy('spots', function () {
      return pixelTex(256, 256, function (u, v, o) {
        var n = pfbm(u, v, 4, 3, 4), k = THREE.MathUtils.smoothstep(n, 0.58, 0.62);
        var c = 0.97 - k * 0.9; o[0] = c * 255; o[1] = c * 252; o[2] = c * 245;
      }, true);
    }),
    // stone tiles for the pavilion floor
    tiles: lazy('tiles', function () {
      return pixelTex(256, 256, function (u, v, o) {
        var gx = (u * 4) % 1, gy = (v * 4) % 1, edge = (gx < 0.03 || gy < 0.03) ? 0.6 : 1;
        var c = (0.85 + 0.15 * pfbm(u, v, 8, 8, 4)) * edge; o[0] = c * 255; o[1] = c * 250; o[2] = c * 238;
      }, true);
    }),
    // palm frond: midrib with leaflets, alpha-cut
    frond: lazy('frond', function () {
      var c = canvas(128, 512), x = c.getContext('2d');
      x.lineCap = 'round';
      for (var i = 0; i < 46; i++) {
        var t = i / 46, y = 500 - t * 490, len = 58 * Math.sin(Math.min(1, t * 1.25 + 0.12) * Math.PI) + 6;
        [-1, 1].forEach(function (s) {
          var g = 70 + Math.random() * 50;
          x.strokeStyle = 'rgb(' + (40 + Math.random() * 25 | 0) + ',' + (g + 40 | 0) + ',' + (30 + Math.random() * 20 | 0) + ')';
          x.lineWidth = 5 + Math.random() * 2;
          x.beginPath(); x.moveTo(64, y);
          x.quadraticCurveTo(64 + s * len * 0.5, y - 10, 64 + s * len, y - 26 - t * 10); x.stroke();
        });
      }
      x.strokeStyle = '#8a7a3e'; x.lineWidth = 5;
      x.beginPath(); x.moveTo(64, 512); x.lineTo(64, 6); x.stroke();
      return finish(new THREE.CanvasTexture(c), true);
    }),
    // a soft, fluffy cloud puff
    cloud: lazy('cloud', function () {
      var c = canvas(256, 256), x = c.getContext('2d');
      for (var i = 0; i < 40; i++) {
        var a = Math.random() * Math.PI * 2, d = Math.random() * 70, px = 128 + Math.cos(a) * d * 1.2, py = 140 + Math.sin(a) * d * 0.6;
        var r = 30 + Math.random() * 40, g = x.createRadialGradient(px, py, 0, px, py, r);
        g.addColorStop(0, 'rgba(255,255,255,0.35)'); g.addColorStop(1, 'rgba(255,255,255,0)');
        x.fillStyle = g; x.fillRect(0, 0, 256, 256);
      }
      var t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t;
    }),
    // surf foam along a shoreline: bright at v=0, fading outwards
    foam: lazy('foam', function () {
      return pixelTex(512, 64, function (u, v, o) {
        var n = pfbm(u, v, 24, 3, 4), fade = Math.pow(1 - v, 2.2);
        var a = THREE.MathUtils.clamp((n - 0.35) * 2.2, 0, 1) * fade + Math.max(0, 1 - v * 7) * 0.6;
        o[0] = o[1] = o[2] = 255; o[3] = Math.min(1, a) * 255;
      }, true);
    }),
    // tileable normal map for small water ripples
    waterNormal: lazy('waterNormal', function () {
      var S = 256, h = new Float32Array(S * S);
      for (var j = 0; j < S; j++) for (var i = 0; i < S; i++) h[j * S + i] = pfbm(i / S, j / S, 8, 8, 5);
      return pixelTex(S, S, function (u, v, o) {
        var i = Math.round(u * S), j = Math.round(v * S);
        var H = function (a, b) { return h[(((b % S) + S) % S) * S + (((a % S) + S) % S)]; };
        var dx = (H(i - 1, j) - H(i + 1, j)) * 6, dy = (H(i, j - 1) - H(i, j + 1)) * 6;
        var l = Math.sqrt(dx * dx + dy * dy + 1);
        o[0] = (dx / l * 0.5 + 0.5) * 255; o[1] = (dy / l * 0.5 + 0.5) * 255; o[2] = (1 / l * 0.5 + 0.5) * 255;
      });
    })
  };

  /* ================= MATERIALS ================= */
  /* opts: rough, metal, tex (colour texture), bump (bump texture), bumpScale,
     plus any MeshStandardMaterial option. Old Phong options are translated. */
  M.mat = function (color, opts) {
    var key = color + '|' + JSON.stringify(opts || {});
    if (cache[key]) return cache[key];
    var o = Object.assign({}, opts || {});
    var rough = o.rough != null ? o.rough : o.shininess != null ? Math.max(0.12, 1 - o.shininess / 100) : 0.78;
    var p = { color: M.lin(color), roughness: rough, metalness: o.metal || 0 };
    if (o.tex) p.map = TX[o.tex]();
    if (o.bump) { p.bumpMap = TX[o.bump](); p.bumpScale = o.bumpScale != null ? o.bumpScale : 0.02; }
    ['rough', 'metal', 'tex', 'bump', 'bumpScale', 'shininess', 'specular'].forEach(function (k) { delete o[k]; });
    if (o.emissive != null && !o.emissive.isColor) o.emissive = M.lin(o.emissive);
    return (cache[key] = new THREE.MeshStandardMaterial(Object.assign(p, o)));
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
    cyl: function (rt, rb, h, s) { return new THREE.CylinderGeometry(rt, rb, h, Math.max(s || 0, 20)); },
    sph: function (r, w, h) { return new THREE.SphereGeometry(r, Math.max(w || 0, 24), Math.max(h || 0, 16)); },
    cone: function (r, h, s) { return new THREE.ConeGeometry(r, h, Math.max(s || 0, 20)); },
    ico: function (r, d) { return new THREE.IcosahedronGeometry(r, Math.max(d || 0, 2)); },
    // ellipsoid
    ell: function (rx, ry, rz, s) { var g = new THREE.SphereGeometry(1, s || 24, Math.round((s || 24) * 0.7)); g.scale(rx, ry, rz); return g; },
    // flat-sided shapes (architecture) keep their facets
    facet: function (rt, rb, h, s) { return new THREE.CylinderGeometry(rt, rb, h, s); }
  };

  /* a lumpy sphere, for rocks, stones and foliage */
  function lumpy(r, amt, seed, segs) {
    var g = new THREE.SphereGeometry(r, segs || 28, Math.round((segs || 28) * 0.75)), p = g.attributes.position, v = new THREE.Vector3();
    for (var i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      var n = v.clone().normalize();
      var k = 1 + (M.fbm(n.x * 1.6 + seed, n.y * 1.6, n.z * 1.6, 5) - 0.5) * amt * 2;
      v.multiplyScalar(k); p.setXYZ(i, v.x, v.y, v.z);
    }
    g.computeVertexNormals();
    return g;
  }
  M.lumpy = lumpy;

  /* vertical ribs, like a cactus */
  function ribbed(g, n, amt) {
    var p = g.attributes.position;
    for (var i = 0; i < p.count; i++) {
      var x = p.getX(i), z = p.getZ(i), a = Math.atan2(z, x), k = 1 + amt * Math.cos(n * a);
      p.setX(i, x * k); p.setZ(i, z * k);
    }
    g.computeVertexNormals();
    return g;
  }

  function tube(points, r, segs) {
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), segs || 16, r, 10, false);
  }
  function lathe(pts, segs) {
    return new THREE.LatheGeometry(pts.map(function (p) { return new THREE.Vector2(p[0], p[1]); }), segs || 32);
  }

  function group() { return new THREE.Group(); }

  var FABRIC = { rough: 0.92, bump: 'grain', bumpScale: 0.006 };
  var SKIN = { rough: 0.55 };
  function fab(extra) { return Object.assign({}, FABRIC, extra || {}); }

  /* eye: white, iris and a tiny highlight */
  function eye(parent, x, y, z, r, iris) {
    parent.add(M.mesh(G.ell(r, r * 0.85, r * 0.6, 16), 0xf6f3ee, x, y, z, { rough: 0.25 }));
    parent.add(M.mesh(G.sph(r * 0.62, 16, 12), iris || 0x3b2414, x, y, z + r * 0.38, { rough: 0.15 }));
    parent.add(M.mesh(G.sph(r * 0.3, 10, 8), 0x050505, x, y, z + r * 0.62, { rough: 0.1 }));
  }

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
      p.add(M.mesh(G.cyl(0.072, 0.064, 0.45, 16), legColor, 0, -0.22, 0, fab()));
      p.add(M.mesh(G.ell(0.068, 0.045, 0.12), 0x3d2b1f, 0, -0.42, 0.035, { rough: 0.45 }));
      g.add(p);
      return p;
    }
    var legL = leg(-0.11), legR = leg(0.11);

    if (kind === 'captain') {
      g.add(M.mesh(lathe([[0, 0.43], [0.32, 0.43], [0.315, 0.6], [0.285, 0.82], [0.27, 0.95], [0.21, 1.02], [0.1, 1.05], [0, 1.06]]), robe, 0, 0, 0, fab()));
      g.add(M.mesh(G.cyl(0.322, 0.325, 0.07, 32), 0x2b2118, 0, 0.5, 0, { rough: 0.4 }));       // belt
      g.add(M.mesh(G.box(0.07, 0.05, 0.02), 0xd4af37, 0, 0.5, 0.325, { rough: 0.3, metal: 1 }));
      [0.64, 0.77, 0.9].forEach(function (y, i) {
        g.add(M.mesh(G.sph(0.018, 12, 8), 0xd4af37, 0, y, 0.307 - i * 0.017, { rough: 0.3, metal: 1 }));
      });
    } else {
      g.add(M.mesh(lathe([[0, 0.2], [0.37, 0.2], [0.365, 0.26], [0.33, 0.5], [0.28, 0.76], [0.25, 0.9], [0.21, 0.98], [0.11, 1.03], [0, 1.04]]), robe, 0, 0, 0, fab()));
    }

    function arm(x) {
      var p = group(); p.position.set(x, 0.95, 0);
      p.add(M.mesh(G.sph(0.085, 16, 12), robe, 0, 0, 0, fab()));
      p.add(M.mesh(G.cyl(0.068, 0.085, 0.48, 16), robe, 0, -0.24, 0, fab()));
      p.add(M.mesh(G.ell(0.055, 0.07, 0.045), skin, 0, -0.52, 0, SKIN));
      g.add(p);
      return p;
    }
    var armL = arm(-0.3), armR = arm(0.3);

    g.add(M.mesh(G.cyl(0.07, 0.08, 0.14, 16), skin, 0, 1.08, 0, SKIN));                       // neck
    var head = group(); head.position.set(0, 1.22, 0); head.scale.setScalar(0.72); g.add(head);
    head.add(M.mesh(G.sph(0.22, 40, 30), skin, 0, 0, 0, SKIN));
    eye(head, -0.075, 0.03, 0.185, 0.034);
    eye(head, 0.075, 0.03, 0.185, 0.034);
    var hair = kind === 'captain' ? 0x9e9e9e : 0x2b1d14;
    [-1, 1].forEach(function (s) {
      var br = M.mesh(G.cyl(0.008, 0.008, 0.065, 8), hair, s * 0.075, 0.085, 0.2);
      br.rotation.z = Math.PI / 2 + s * 0.12; head.add(br);
      head.add(M.mesh(G.ell(0.025, 0.045, 0.035), skin, s * 0.215, 0, 0, SKIN));            // ears
    });
    head.add(M.mesh(G.ell(0.024, 0.032, 0.028), skin, 0, -0.025, 0.21, SKIN));               // nose
    var smile = M.mesh(new THREE.TorusGeometry(0.045, 0.008, 8, 20, Math.PI), 0x9a4b3e, 0, -0.075, 0.2, { rough: 0.4 });
    smile.rotation.z = Math.PI; head.add(smile);

    if (hijab) {
      var hm = M.mat(hijab, fab({ side: THREE.DoubleSide }));
      head.add(M.mesh(new THREE.SphereGeometry(0.25, 40, 16, 0, Math.PI * 2, 0, 0.95), hm));
      var gap = 1.9;
      head.add(M.mesh(new THREE.SphereGeometry(0.25, 40, 24, Math.PI / 2 + gap / 2, Math.PI * 2 - gap, 0.9, Math.PI - 0.9), hm));
      g.add(M.mesh(lathe([[0.15, 1.16], [0.19, 1.07], [0.3, 0.96], [0.385, 0.84], [0.37, 0.82]]), hm));  // drape over shoulders
    }
    if (kind === 'boy') {
      head.add(M.mesh(new THREE.SphereGeometry(0.228, 40, 16, 0, Math.PI * 2, 0, 1.2), 0x2b1d14, 0, 0, -0.01, { rough: 0.7, bump: 'grain', bumpScale: 0.01 }));
      head.add(M.mesh(G.cyl(0.19, 0.205, 0.12, 40), 0xffffff, 0, 0.16, 0, fab({ bumpScale: 0.012 })));  // kufi
    }
    if (kind === 'captain') {
      head.add(M.mesh(G.cyl(0.235, 0.24, 0.14, 40), 0xffffff, 0, 0.2, 0, fab()));
      head.add(M.mesh(G.cyl(0.25, 0.25, 0.03, 40), 0x1d3557, 0, 0.14, 0, fab()));
      var visor = M.mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.02, 32, 1, false, -Math.PI / 2, Math.PI), 0x111111, 0, 0.135, 0.06, { rough: 0.2 });
      visor.scale.set(1, 1, 0.8); head.add(visor);
      head.add(M.mesh(G.box(0.06, 0.05, 0.02), 0xd4af37, 0, 0.21, 0.24, { rough: 0.3, metal: 1 }));
      head.add(M.mesh(G.ell(0.17, 0.14, 0.13), 0xd9d9d9, 0, -0.12, 0.08, { rough: 0.95, bump: 'grain', bumpScale: 0.03 }));
    }
    if (kind === 'afra') {
      var book = M.mesh(G.box(0.2, 0.26, 0.06), 0x9b2226, 0, -0.5, 0.08, { rough: 0.6 });
      armR.add(book);
      armR.add(M.mesh(G.box(0.19, 0.25, 0.045), 0xf4ecd8, 0.005, -0.5, 0.08));
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
    var FUR = { rough: 0.95, bump: 'grain', bumpScale: 0.015 };
    if (kind === 'cat') {
      var c = 0xe09f3e;
      g.add(M.mesh(G.ell(0.13, 0.12, 0.25), c, 0, 0.27, 0, FUR));
      g.add(M.mesh(G.ell(0.1, 0.08, 0.2), 0xfff1e0, 0, 0.22, 0.02, FUR));
      var head = group(); head.position.set(0, 0.41, 0.24); g.add(head);
      head.add(M.mesh(G.ell(0.12, 0.105, 0.105), c, 0, 0, 0, FUR));
      head.add(M.mesh(G.ell(0.055, 0.04, 0.04), 0xfff1e0, 0, -0.035, 0.085, FUR));
      head.add(M.mesh(G.ell(0.014, 0.01, 0.01), 0xd88a8a, 0, -0.012, 0.115));
      [-1, 1].forEach(function (s) {
        var ear = M.mesh(G.cone(0.045, 0.09, 16), c, s * 0.065, 0.1, 0, FUR); ear.rotation.z = -s * 0.25; head.add(ear);
        head.add(M.mesh(G.ell(0.024, 0.024, 0.012), 0x9ccc65, s * 0.045, 0.02, 0.092, { rough: 0.1 }));
        head.add(M.mesh(G.ell(0.006, 0.02, 0.006), 0x050505, s * 0.045, 0.02, 0.103, { rough: 0.1 }));
      });
      [[-0.07, 0.15], [0.07, 0.15], [-0.07, -0.15], [0.07, -0.15]].forEach(function (p) {
        var l = group(); l.position.set(p[0], 0.2, p[1]);
        l.add(M.mesh(G.cyl(0.032, 0.028, 0.18, 12), c, 0, -0.09, 0, FUR));
        l.add(M.mesh(G.ell(0.032, 0.022, 0.04), 0xfff1e0, 0, -0.185, 0.01, FUR));
        g.add(l); ud.legs.push(l);
      });
      var tail = group(); tail.position.set(0, 0.3, -0.22);
      tail.add(M.mesh(tube([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0.08, -0.1), new THREE.Vector3(0, 0.25, -0.13), new THREE.Vector3(0, 0.36, -0.06)], 0.026), c, 0, 0, 0, FUR));
      g.add(tail); ud.tail = tail;
    } else if (kind === 'chick') {
      var FLUFF = { rough: 1, bump: 'grain', bumpScale: 0.03 };
      g.add(M.mesh(G.ell(0.15, 0.14, 0.16), 0xffd23f, 0, 0.17, 0, FLUFF));
      g.add(M.mesh(G.sph(0.1, 24, 18), 0xffd23f, 0, 0.33, 0.06, FLUFF));
      var beak = M.mesh(G.cone(0.028, 0.07, 12), 0xf77f00, 0, 0.32, 0.17, { rough: 0.4 }); beak.rotation.x = Math.PI / 2; g.add(beak);
      [-1, 1].forEach(function (s) {
        g.add(M.mesh(G.sph(0.017, 10, 8), 0x111111, s * 0.042, 0.36, 0.145, { rough: 0.1 }));
      });
      [-0.05, 0.05].forEach(function (x) {
        var l = group(); l.position.set(x, 0.05, 0);
        l.add(M.mesh(G.cyl(0.01, 0.01, 0.06, 8), 0xf77f00, 0, -0.01, 0));
        l.add(M.mesh(G.ell(0.025, 0.008, 0.04), 0xf77f00, 0, -0.04, 0.02));
        g.add(l); ud.legs.push(l);
      });
      [-1, 1].forEach(function (s) {
        var w = group(); w.position.set(0.13 * s, 0.2, 0);
        w.add(M.mesh(G.ell(0.035, 0.06, 0.09), 0xf5c518, 0.01 * s, 0, 0, FLUFF));
        g.add(w); ud.wings.push(w);
      });
    } else {
      // parrot or dove: flying birds
      var parrot = kind === 'parrot', FEATHER = { rough: 0.7, bump: 'grain', bumpScale: 0.01 };
      ud.fly = true;
      g.add(M.mesh(G.ell(0.12, 0.12, 0.18), parrot ? 0x2fb344 : 0xf4f4f4, 0, 0, 0, FEATHER));
      g.add(M.mesh(G.sph(0.095, 24, 18), parrot ? 0xe63946 : 0xf4f4f4, 0, 0.1, 0.14, FEATHER));
      var bk = M.mesh(G.cone(0.032, 0.08, 12), parrot ? 0xffd166 : 0xf2a7b5, 0, 0.08, 0.26, { rough: 0.35 }); bk.rotation.x = Math.PI / 2; g.add(bk);
      [-1, 1].forEach(function (s) { g.add(M.mesh(G.sph(0.016, 10, 8), 0x111111, s * 0.05, 0.14, 0.21, { rough: 0.1 })); });
      var tl = M.mesh(G.ell(0.05, 0.012, 0.17), parrot ? 0x1d6fd6 : 0xdddddd, 0, -0.02, -0.26, FEATHER); tl.rotation.x = 0.3; g.add(tl);
      [-1, 1].forEach(function (s) {
        var w = group(); w.position.set(0.1 * s, 0.03, 0);
        w.add(M.mesh(G.ell(0.16, 0.012, 0.09), parrot ? 0x1f8a35 : 0xcfcfcf, 0.15 * s, 0, -0.01, FEATHER));
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
  var HIDE = { tex: 'spots', rough: 0.85, bump: 'grain', bumpScale: 0.01 };
  M.cow = function (scale) {
    var outer = group(), g = group(); outer.add(g);
    var W = 0xffffff, B = 0x1d1d1d, P = 0xe9a2b0;
    g.add(M.mesh(G.ell(0.37, 0.33, 0.62, 32), W, 0, 0.78, 0, HIDE));
    g.add(M.mesh(G.ell(0.11, 0.08, 0.12), P, 0, 0.5, -0.22, { rough: 0.6 }));                     // udder
    var head = group(); head.position.set(0, 0.98, 0.66); g.add(head);
    head.add(M.mesh(G.ell(0.2, 0.21, 0.26, 32), W, 0, 0, 0, HIDE));
    head.add(M.mesh(G.ell(0.17, 0.12, 0.13), P, 0, -0.1, 0.2, { rough: 0.5 }));
    [-1, 1].forEach(function (s) {
      head.add(M.mesh(G.ell(0.025, 0.018, 0.01), 0x6a2c3a, s * 0.06, -0.09, 0.325));
      eye(head, s * 0.12, 0.07, 0.17, 0.04, 0x1a1a1a);
      var horn = M.mesh(G.cone(0.035, 0.17, 16), 0xf1e3c6, s * 0.14, 0.24, 0, { rough: 0.4 }); horn.rotation.z = -s * 0.55; head.add(horn);
      var earm = M.mesh(G.ell(0.1, 0.035, 0.06), W, s * 0.27, 0.11, -0.03, { rough: 0.85 }); earm.rotation.z = -s * 0.25; head.add(earm);
    });
    [[-0.2, 0.38], [0.2, 0.38], [-0.2, -0.38], [0.2, -0.38]].forEach(function (p) {
      g.add(M.mesh(G.cyl(0.075, 0.06, 0.52, 16), W, p[0], 0.3, p[1], HIDE));
      g.add(M.mesh(G.cyl(0.064, 0.07, 0.08, 16), B, p[0], 0.04, p[1], { rough: 0.4 }));
    });
    var tail = group(); tail.position.set(0, 0.95, -0.6);
    tail.add(M.mesh(tube([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -0.2, -0.05), new THREE.Vector3(0, -0.48, -0.02)], 0.02), W, 0, 0, 0, { rough: 0.8 }));
    tail.add(M.mesh(G.ell(0.045, 0.08, 0.045), B, 0, -0.53, -0.02, { rough: 1, bump: 'grain', bumpScale: 0.03 }));
    g.add(tail);
    g.scale.setScalar(scale || 1);
    outer.userData = { head: head, tail: tail, body: g };
    return outer;
  };

  /* ================= THE COW FERRY ================= */
  /* a boat hull from a deck outline (x across, z along), extruded upwards */
  function hullGeo(halfW, sternZ, midZ, bowZ, height, bevel) {
    var s = new THREE.Shape();
    s.moveTo(-halfW, -sternZ);
    s.lineTo(halfW, -sternZ);
    s.lineTo(halfW, -midZ);
    s.quadraticCurveTo(halfW * 0.95, -(midZ + (bowZ - midZ) * 0.7), 0, -bowZ);
    s.quadraticCurveTo(-halfW * 0.95, -(midZ + (bowZ - midZ) * 0.7), -halfW, -midZ);
    s.lineTo(-halfW, -sternZ);
    var g = new THREE.ExtrudeGeometry(s, { depth: height, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 5, curveSegments: 16 });
    g.rotateX(-Math.PI / 2);
    return g;
  }

  M.ferry = function () {
    var g = group();
    var W = 0xfafaf5, B = 0x1d1d1d, P = 0xf4a6b8, WOOD = 0xb5835a;
    var PAINT = { rough: 0.35 }, DECK = { tex: 'wood', rough: 0.7, bump: 'grain', bumpScale: 0.01 };
    var hull = hullGeo(1.18, -2.88, 2.6, 5.1, 1.0, 0.12); hull.translate(0, -0.2, 0);
    g.add(M.mesh(hull, W, 0, 0, 0, PAINT));
    var stripe = hullGeo(1.2, -2.9, 2.6, 5.12, 0.12, 0.12); stripe.translate(0, -0.3, 0);
    g.add(M.mesh(stripe, P, 0, 0, 0, PAINT));                                                     // pink waterline stripe
    var deck = hullGeo(1.12, -2.82, 2.6, 4.95, 0.06, 0.02); deck.translate(0, 0.92, 0);
    g.add(M.mesh(deck, WOOD, 0, 0, 0, DECK));
    // black cow spots on the hull
    var spotMat = M.mat(B, { rough: 0.35, polygonOffset: true, polygonOffsetFactor: -2 });
    [[3, 0.5, 1.6, 0.8], [-3, 0.35, 1.0, 0.6], [0.5, 0.45, 1.2, 0.7], [-1.2, 0.6, 0.8, 0.5], [2, 0.2, 0.6, 0.4]].forEach(function (s, i) {
      [-1, 1].forEach(function (side) {
        var z = side > 0 ? s[0] * 0.8 : -s[0] * 0.6 + (i % 2) * 0.5;
        var sp = new THREE.Mesh(new THREE.CircleGeometry(0.5, 28), spotMat);
        sp.scale.set(s[2], s[3], 1); sp.rotation.y = side * Math.PI / 2;
        sp.position.set(side * 1.305, s[1], Math.max(-2.4, Math.min(2.3, z))); g.add(sp);
      });
    });
    // rails
    var RAIL = { rough: 0.3 };
    [-1.12, 1.12].forEach(function (x) {
      var r = M.mesh(G.cyl(0.035, 0.035, 5.4, 12), W, x, 1.32, 0.1, RAIL); r.rotation.x = Math.PI / 2; g.add(r);
      for (var i = -2; i <= 2; i++) g.add(M.mesh(G.cyl(0.03, 0.03, 0.4, 10), W, x, 1.12, i * 1.3, RAIL));
    });
    // cabin
    var GLASS = { rough: 0.05, metal: 0.3 };
    g.add(M.mesh(G.box(2.0, 1.4, 1.8), W, 0, 1.68, -1.9, PAINT));
    g.add(M.mesh(G.box(2.3, 0.12, 2.1), B, 0, 2.44, -1.9, { rough: 0.5 }));
    g.add(M.mesh(G.box(1.4, 0.45, 0.04), 0x2b5d8a, 0, 1.95, -0.99, GLASS));
    g.add(M.mesh(G.box(0.04, 0.45, 1.0), 0x2b5d8a, 1.01, 1.95, -1.9, GLASS));
    g.add(M.mesh(G.box(0.04, 0.45, 1.0), 0x2b5d8a, -1.01, 1.95, -1.9, GLASS));
    var cs = new THREE.Mesh(new THREE.CircleGeometry(0.25, 24), spotMat); cs.scale.set(1.1, 0.8, 1); cs.position.set(0.55, 1.4, -0.995); g.add(cs);
    var wheel = M.mesh(new THREE.TorusGeometry(0.28, 0.035, 10, 32), 0x7a4e2d, 0, 1.75, -0.92, { tex: 'wood', rough: 0.5 });
    g.add(wheel);
    for (var sp2 = 0; sp2 < 4; sp2++) {
      var spoke = M.mesh(G.cyl(0.015, 0.015, 0.62, 8), 0x7a4e2d, 0, 1.75, -0.92, { rough: 0.5 });
      spoke.rotation.z = sp2 * Math.PI / 4; g.add(spoke);
    }
    var buoy = M.mesh(new THREE.TorusGeometry(0.32, 0.1, 14, 32), 0xf77f00, 1.05, 1.7, -2.4, { rough: 0.5 });
    buoy.rotation.y = Math.PI / 2; g.add(buoy);
    // flag
    g.add(M.mesh(G.cyl(0.03, 0.03, 1.2, 10), 0x777777, 0, 3.1, -2.5, { rough: 0.3, metal: 1 }));
    var flag = M.mesh(new THREE.PlaneGeometry(0.6, 0.4, 8, 4), W, 0, 3.45, -2.2, fab({ tex: 'spots', side: THREE.DoubleSide }));
    flag.rotation.y = Math.PI / 2; g.add(flag);

    // cow head at the bow
    var head = group(); head.position.set(0, 1.75, 4.55); g.add(head);
    head.add(M.mesh(G.ell(0.56, 0.52, 0.58, 40), 0xffffff, 0, 0, 0, Object.assign({}, HIDE, { rough: 0.4 })));
    head.add(M.mesh(G.ell(0.46, 0.28, 0.25, 32), P, 0, -0.22, 0.52, PAINT));
    [-1, 1].forEach(function (s) {
      head.add(M.mesh(G.ell(0.07, 0.07, 0.03), 0x8a3b4f, s * 0.2, -0.18, 0.77, PAINT));
      eye(head, s * 0.28, 0.2, 0.44, 0.12, 0x1a1a1a);
      var horn = M.mesh(G.cone(0.1, 0.45, 20), 0xf1e3c6, s * 0.45, 0.62, 0, { rough: 0.35 }); horn.rotation.z = -s * 0.55; head.add(horn);
    });
    function ear(s) {
      var e = group(); e.position.set(0.52 * s, 0.25, -0.1);
      e.add(M.mesh(G.ell(0.26, 0.06, 0.15), W, 0.25 * s, 0, 0, PAINT));
      e.add(M.mesh(G.ell(0.19, 0.04, 0.09), P, 0.24 * s, 0.025, 0.03, PAINT));
      head.add(e); return e;
    }
    var earL = ear(-1), earR = ear(1);
    var collar = M.mesh(new THREE.TorusGeometry(0.5, 0.07, 12, 40), 0xc1121f, 0, -0.45, -0.05, { rough: 0.5 });
    collar.rotation.x = Math.PI / 2; head.add(collar);
    var bell = group(); bell.position.set(0, -0.55, 0.38); head.add(bell);
    bell.add(M.mesh(lathe([[0, 0], [0.06, -0.01], [0.09, -0.08], [0.12, -0.22], [0.17, -0.3], [0, -0.3]]), 0xd4af37, 0, 0, 0, { rough: 0.25, metal: 1 }));
    bell.add(M.mesh(G.sph(0.05, 12, 10), 0x8a6d1f, 0, -0.32, 0, { rough: 0.4, metal: 1 }));
    // tail at the stern
    var tail = group(); tail.position.set(0, 1.0, -3.02); g.add(tail);
    tail.add(M.mesh(tube([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -0.4, -0.12), new THREE.Vector3(0, -0.95, -0.22)], 0.05), W, 0, 0, 0, PAINT));
    tail.add(M.mesh(G.ell(0.13, 0.2, 0.13), B, 0, -1.05, -0.26, { rough: 1, bump: 'grain', bumpScale: 0.04 }));

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
  var frondGeo = null;
  function getFrondGeo() {
    if (frondGeo) return frondGeo;
    var g = new THREE.PlaneGeometry(1.1, 2.8, 4, 14), p = g.attributes.position;
    for (var i = 0; i < p.count; i++) {
      var x = p.getX(i), t = (p.getY(i) + 1.4) / 2.8;
      p.setXYZ(i, x, 0.55 * t - 1.7 * t * t - Math.abs(x) * 0.3, t * 2.8);
    }
    g.computeVertexNormals();
    return (frondGeo = g);
  }

  M.palm = function (h) {
    var g = group(), lean = 0.12 + Math.random() * 0.1, pts = [];
    for (var i = 0; i <= 40; i++) {
      var y = i / 40 * h, ring = 0.012 * Math.abs(Math.sin(y * 14));
      pts.push([0.23 - 0.09 * (y / h) + ring, y]);
    }
    pts.unshift([0, 0]);
    var trunk = lathe(pts, 18), p = trunk.attributes.position;
    for (var j = 0; j < p.count; j++) { var yy = p.getY(j) / h; p.setX(j, p.getX(j) + lean * h * Math.pow(yy, 1.6)); }
    trunk.computeVertexNormals();
    g.add(M.mesh(trunk, 0xa58660, 0, 0, 0, { tex: 'bark', rough: 0.95, bump: 'lumps', bumpScale: 0.03 }));

    var top = group(); top.position.set(lean * h, h, 0); g.add(top);
    var fm = M.mat(0xffffff, { tex: 'frond', rough: 0.65, alphaTest: 0.45, side: THREE.DoubleSide });
    for (var k = 0; k < 11; k++) {
      var leaf = M.mesh(getFrondGeo(), fm);
      leaf.rotation.set(-0.15 + Math.random() * 0.35, k / 11 * Math.PI * 2 + Math.random() * 0.3, 0, 'YXZ');
      leaf.scale.setScalar(0.85 + Math.random() * 0.3);
      top.add(leaf);
    }
    for (var c = 0; c < 4; c++) top.add(M.mesh(G.ell(0.13, 0.15, 0.13), 0x5b3a1e, Math.cos(c * 1.6) * 0.18, -0.14, Math.sin(c * 1.6) * 0.18, { rough: 0.6 }));
    return g;
  };

  M.rock = function (s, color) {
    var m = M.mesh(lumpy(s, 0.35, Math.random() * 50), color || 0x8a857c, 0, 0, 0, { rough: 0.95, bump: 'lumps', bumpScale: 0.06 });
    m.scale.set(1, 0.6 + Math.random() * 0.4, 1);
    m.rotation.y = Math.random() * 6;
    return m;
  };

  /* ---------- Madd Desert ---------- */
  M.cactus = function (h) {
    var g = group(), c = 0x4f8a43, CM = { rough: 0.6, bump: 'grain', bumpScale: 0.01 };
    g.add(M.mesh(ribbed(new THREE.CylinderGeometry(0.32, 0.36, h, 48, 8), 12, 0.07), c, 0, h / 2, 0, CM));
    g.add(M.mesh(ribbed(new THREE.SphereGeometry(0.32, 48, 16, 0, Math.PI * 2, 0, Math.PI / 2), 12, 0.07), c, 0, h, 0, CM));
    [[-1, 0.45], [1, 0.62]].forEach(function (a) {
      var y = h * a[1];
      var arm = M.mesh(ribbed(new THREE.CylinderGeometry(0.17, 0.17, 0.6, 32, 2), 10, 0.06), c, a[0] * 0.5, y, 0, CM); arm.rotation.z = Math.PI / 2; g.add(arm);
      g.add(M.mesh(G.sph(0.17, 24, 16), c, a[0] * 0.8, y, 0, CM));
      g.add(M.mesh(ribbed(new THREE.CylinderGeometry(0.17, 0.17, h * 0.32, 32, 4), 10, 0.06), c, a[0] * 0.8, y + h * 0.16, 0, CM));
      g.add(M.mesh(G.sph(0.17, 24, 16), c, a[0] * 0.8, y + h * 0.32, 0, CM));
    });
    for (var i = 0; i < 5; i++) {
      var pt = M.mesh(G.ell(0.06, 0.04, 0.12), 0xff6fae, Math.cos(i * 1.26) * 0.08, h + 0.32, Math.sin(i * 1.26) * 0.08, { rough: 0.5 });
      pt.rotation.y = -i * 1.26; g.add(pt);
    }
    return g;
  };

  /* ---------- Leen Aclopips: nature merged with inventions ---------- */
  var glowMat = new THREE.MeshStandardMaterial({ color: M.lin(0x80ffdb), emissive: M.lin(0x80ffdb), emissiveIntensity: 0, roughness: 0.3 });
  M.glowMat = glowMat;
  var LEAF = { rough: 0.8, bump: 'lumps', bumpScale: 0.08 };
  M.techTree = function (h) {
    var g = group(), metal = { rough: 0.3, metal: 0.9 };
    g.add(M.mesh(G.cyl(0.2, 0.32, h, 24), 0x9aa5b1, 0, h / 2, 0, metal));
    for (var i = 1; i <= 3; i++) g.add(M.mesh(G.cyl(0.27 - i * 0.03, 0.27 - i * 0.03, 0.12, 24), 0xb87333, 0, h * i / 4, 0, metal));
    // vines climbing the metal trunk
    for (var v = 0; v < 4; v++) {
      var a0 = v * 1.6, pts = [];
      for (var k = 0; k <= 8; k++) { var a = a0 + k * 0.5, y = k / 8 * h * 0.6; pts.push(new THREE.Vector3(Math.cos(a) * 0.29, y, Math.sin(a) * 0.29)); }
      g.add(M.mesh(tube(pts, 0.035, 40), 0x2d6a4f, 0, 0, 0, { rough: 0.7 }));
    }
    for (var c = 0; c < 4; c++) {
      var crown = M.mesh(lumpy(1.0 + Math.random() * 0.3, 0.25, c * 9 + Math.random() * 20), c % 2 ? 0x52b788 : 0x40916c,
        Math.cos(c * 1.7) * 0.6, h + 0.6 + (c % 2) * 0.4, Math.sin(c * 1.7) * 0.6, LEAF);
      crown.scale.set(1, 0.75, 1); g.add(crown);
    }
    // solar-panel leaves on top
    for (var p = 0; p < 3; p++) {
      var leaf = group(); leaf.rotation.y = p / 3 * Math.PI * 2; leaf.position.y = h + 1.7;
      var pan = M.mesh(G.box(0.9, 0.04, 0.65), 0x1d3557, 0, 0, 0.75, { rough: 0.15, metal: 0.6 });
      pan.rotation.x = -0.35; leaf.add(pan);
      var frame = M.mesh(G.box(0.94, 0.03, 0.69), 0xc0c6cc, 0, -0.02, 0.75, { rough: 0.3, metal: 1 }); frame.rotation.x = -0.35; leaf.add(frame);
      g.add(leaf);
    }
    var bulb = M.mesh(G.sph(0.18, 20, 16), glowMat, 0, h + 1.15, 1.25); g.add(bulb);
    return g;
  };

  M.windFlower = function (h, petal) {
    var g = group();
    g.add(M.mesh(G.cyl(0.08, 0.13, h, 20), 0xe0e6ea, 0, h / 2, 0, { rough: 0.3, metal: 0.7 }));
    var leafL = M.mesh(G.ell(0.38, 0.03, 0.16), 0x4caf50, 0.35, h * 0.4, 0, { rough: 0.6 }); leafL.rotation.z = 0.4; g.add(leafL);
    var rotor = group(); rotor.position.set(0, h, 0.2); g.add(rotor);
    rotor.add(M.mesh(G.sph(0.26, 24, 16), 0xffd166, 0, 0, 0.05, { rough: 0.4 }));
    for (var i = 0; i < 6; i++) {
      var bl = group(); bl.rotation.z = i / 6 * Math.PI * 2;
      var b = M.mesh(G.ell(0.18, 0.62, 0.025), i % 2 ? (petal || 0xff8fab) : 0xffffff, 0, 0.78, 0, { rough: 0.45 }); b.rotation.y = 0.35;
      bl.add(b); rotor.add(bl);
    }
    g.userData.rotor = rotor;
    return g;
  };

  M.dome = function (r) {
    var g = group();
    g.add(M.mesh(G.cyl(r + 0.1, r + 0.2, 0.25, 40), 0x9aa5b1, 0, 0.12, 0, { rough: 0.3, metal: 0.8 }));
    g.add(M.mesh(G.cyl(0.1, 0.15, r * 0.6, 12), 0x6b4a2b, 0, r * 0.3, 0, { tex: 'bark', rough: 0.9 }));
    g.add(M.mesh(lumpy(r * 0.45, 0.25, Math.random() * 30), 0x40916c, 0, r * 0.7, 0, LEAF));
    [0xff6b6b, 0xffd166, 0xcdb4db].forEach(function (c, i) { g.add(M.flower(c).translateX(Math.cos(i * 2) * r * 0.6).translateZ(Math.sin(i * 2) * r * 0.6).translateY(0.2)); });
    var glass = new THREE.Mesh(new THREE.SphereGeometry(r, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshPhysicalMaterial({ color: M.lin(0xdcefff), transparent: true, opacity: 0.22, roughness: 0.03, metalness: 0, clearcoat: 1, depthWrite: false }));
    glass.position.y = 0.2; g.add(glass);
    for (var i2 = 0; i2 < 4; i2++) {
      var rib = new THREE.Mesh(new THREE.TorusGeometry(r, 0.035, 8, 48, Math.PI), M.mat(0x9aa5b1, { rough: 0.3, metal: 0.8 }));
      rib.position.y = 0.2; rib.rotation.y = i2 / 4 * Math.PI; g.add(rib);
    }
    return g;
  };

  var petalGeo = null;
  M.flower = function (color) {
    var g = group();
    var stem = M.mesh(G.cyl(0.012, 0.015, 0.3, 6), 0x2d6a4f, 0, 0.15, 0, { rough: 0.7 }); stem.castShadow = false; g.add(stem);
    if (!petalGeo) petalGeo = G.ell(0.05, 0.012, 0.03, 12);
    var pm = M.mat(color, { rough: 0.55, side: THREE.DoubleSide });
    for (var i = 0; i < 5; i++) {
      var a = i / 5 * Math.PI * 2, p = new THREE.Mesh(petalGeo, pm);
      p.position.set(Math.cos(a) * 0.045, 0.31, Math.sin(a) * 0.045); p.rotation.set(0, -a, 0.25);
      p.castShadow = false; g.add(p);
    }
    var ctr = M.mesh(G.sph(0.022, 10, 8), 0xf4c430, 0, 0.315, 0, { rough: 0.8 }); ctr.castShadow = false; g.add(ctr);
    return g;
  };

  M.lantern = function () {
    var g = group(), IRON = { rough: 0.45, metal: 0.8 };
    g.add(M.mesh(G.cyl(0.05, 0.08, 1.6, 16), 0x2e2620, 0, 0.8, 0, IRON));
    var lampMat = new THREE.MeshStandardMaterial({ color: M.lin(0xffe9a8), emissive: M.lin(0xffb347), emissiveIntensity: 0, roughness: 0.1 });
    g.add(M.mesh(G.box(0.26, 0.34, 0.26), lampMat, 0, 1.75, 0));
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (c) { g.add(M.mesh(G.box(0.03, 0.36, 0.03), 0x2e2620, c[0] * 0.135, 1.75, c[1] * 0.135, IRON)); });
    var cap = M.mesh(G.facet(0.01, 0.24, 0.2, 4), 0x2e2620, 0, 2.02, 0, Object.assign({ flatShading: true }, IRON)); cap.rotation.y = Math.PI / 4; g.add(cap);
    return { group: g, mat: lampMat };
  };

  M.booth = function () {
    var g = group(), PW = { tex: 'wood', rough: 0.7 };
    g.add(M.mesh(G.box(2.4, 1.8, 1.8), 0x5fa8d3, 0, 0.9, 0, PW));
    g.add(M.mesh(G.box(2.6, 0.12, 0.6), 0xb5835a, 0, 1.05, 1.1, PW));
    g.add(M.mesh(G.box(1.6, 0.7, 0.05), 0x1d3557, 0, 1.5, 0.91, { rough: 0.05, metal: 0.3 }));
    var roof = M.mesh(G.facet(0.01, 1.9, 0.9, 4), 0xc8553d, 0, 2.25, 0, { flatShading: true, rough: 0.8, bump: 'grain', bumpScale: 0.03 });
    roof.rotation.y = Math.PI / 4; g.add(roof);
    var sign = M.label('🎟️ Tickets: FREE', { bg: '#fff6e3', color: '#1d3557', h: 0.55 });
    sign.position.set(0, 2.95, 0.4); g.add(sign);
    return g;
  };

  M.pavilion = function (o) {
    o = o || {};
    var g = group();
    g.add(M.mesh(G.facet(4, 4.2, 0.15, 6), 0xe9d8a6, 0, 1.1, 0, { tex: 'tiles', rough: 0.6, flatShading: true }));
    g.add(M.mesh(G.facet(4.3, 4.5, 0.12, 6), 0xbfae88, 0, 0.98, 0, { rough: 0.8, flatShading: true }));
    var MARBLE = { rough: 0.35, bump: 'lumps', bumpScale: 0.01 };
    for (var i = 0; i < 6; i++) {
      var a = i / 6 * Math.PI * 2 + Math.PI / 6, cx = Math.cos(a) * 3.5, cz = Math.sin(a) * 3.5;
      g.add(M.mesh(ribbed(new THREE.CylinderGeometry(0.17, 0.19, 3, 32, 1), 16, 0.04), 0xfaf3e0, cx, 2.6, cz, MARBLE));
      g.add(M.mesh(G.cyl(0.26, 0.28, 0.16, 24), 0xfaf3e0, cx, 1.25, cz, MARBLE));
      g.add(M.mesh(G.cyl(0.28, 0.22, 0.18, 24), 0xfaf3e0, cx, 4.06, cz, MARBLE));
    }
    g.add(M.mesh(G.facet(4.3, 4.3, 0.3, 6), 0xfaf3e0, 0, 4.25, 0, Object.assign({ flatShading: true }, MARBLE)));
    g.add(M.mesh(G.facet(0.01, 5, 2, 6), o.roof || 0x2a9d8f, 0, 5.4, 0, { flatShading: true, rough: 0.55, bump: 'grain', bumpScale: 0.03 }));
    g.add(M.mesh(G.sph(0.3, 24, 16), 0xd4af37, 0, 6.5, 0, { rough: 0.25, metal: 1 }));
    // board with letters (faces +z)
    var b = o.board || ['ا ب ت ث', 'Starter Island'];
    var boardTex = makeBoardTexture(b[0], b[1]);
    var board = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 1.6), new THREE.MeshStandardMaterial({ map: boardTex, roughness: 0.85 }));
    board.position.set(0, 2.4, -3.0);
    g.add(board);
    g.add(M.mesh(G.box(3.4, 1.8, 0.1), 0x7a4e2d, 0, 2.4, -3.07, { tex: 'wood', rough: 0.6 }));
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
    tex.encoding = THREE.sRGBEncoding;
    // redraw once the web fonts have loaded
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { draw(); tex.needsUpdate = true; });
    return tex;
  }

  /* A standing stone, with a floating sign */
  M.stone = function (text, color) {
    var g = group();
    var tint = new THREE.Color(color || 0x9a8fb5).lerp(new THREE.Color(0x8c877d), 0.45).getHex();
    var s = M.mesh(lumpy(1, 0.18, Math.random() * 40), tint, 0, 1.6, 0, { rough: 0.9, bump: 'lumps', bumpScale: 0.05 });
    s.scale.set(0.9, 2.0, 0.7); g.add(s);
    var base = M.mesh(lumpy(1.2, 0.08, Math.random() * 40), 0xcfc6b0, 0, 0.05, 0, { rough: 0.95, bump: 'grain', bumpScale: 0.03 });
    base.scale.set(1, 0.15, 1); g.add(base);
    var lab = M.label(text, { h: 0.7 });
    lab.position.set(0, 4.2, 0); g.add(lab);
    return g;
  };

  M.sailboat = function () {
    var g = group();
    var hull = hullGeo(0.62, -1.7, 0.8, 2.0, 0.55, 0.08); hull.translate(0, -0.18, 0);
    g.add(M.mesh(hull, 0x7a4a24, 0, 0, 0, { tex: 'wood', rough: 0.6 }));
    g.add(M.mesh(G.cyl(0.05, 0.06, 3.6, 12), 0x5a3a1a, 0, 2.1, 0.2, { tex: 'wood', rough: 0.6 }));
    var shape = new THREE.Shape(); shape.moveTo(0, 0); shape.lineTo(0, 3); shape.quadraticCurveTo(1.0, 1.4, 1.8, 0); shape.lineTo(0, 0);
    var sail = new THREE.Mesh(new THREE.ShapeGeometry(shape, 16), M.mat(0xfff8e7, fab({ side: THREE.DoubleSide })));
    sail.position.set(0, 0.6, 0.3); sail.rotation.y = -Math.PI / 2; sail.castShadow = true;
    g.add(sail);
    return g;
  };

  M.dolphin = function () {
    var g = group(), SK = { rough: 0.3 };
    g.add(M.mesh(G.ell(0.32, 0.32, 0.95, 32), 0x6c8ea4, 0, 0, 0, SK));
    g.add(M.mesh(G.ell(0.26, 0.2, 0.8, 32), 0xd8e2e8, 0, -0.12, 0.08, SK));
    var fin = M.mesh(G.cone(0.14, 0.38, 16), 0x5a7a90, 0, 0.38, -0.1, SK); fin.scale.z = 0.35; fin.rotation.x = -0.5; g.add(fin);
    [-1, 1].forEach(function (s) {
      var fl = M.mesh(G.ell(0.24, 0.02, 0.12), 0x5a7a90, s * 0.25, -0.02, -1.0, SK); fl.rotation.y = s * 0.4; g.add(fl);
      var pf = M.mesh(G.ell(0.16, 0.02, 0.08), 0x5a7a90, s * 0.3, -0.15, 0.35, SK); pf.rotation.z = s * 0.5; g.add(pf);
    });
    var nose = M.mesh(G.cone(0.11, 0.33, 20), 0x6c8ea4, 0, -0.06, 1.05, SK); nose.rotation.x = Math.PI / 2; g.add(nose);
    return g;
  };

  M.gull = function () {
    var g = group(), F = { rough: 0.7 };
    g.add(M.mesh(G.ell(0.11, 0.1, 0.3), 0xffffff, 0, 0, 0, F));
    g.add(M.mesh(G.sph(0.08, 16, 12), 0xffffff, 0, 0.06, 0.26, F));
    var bk = M.mesh(G.cone(0.025, 0.12, 10), 0xf4b400, 0, 0.05, 0.38, { rough: 0.4 }); bk.rotation.x = Math.PI / 2; g.add(bk);
    var wl = group(), wr = group();
    [[wl, -1], [wr, 1]].forEach(function (w) {
      w[0].add(M.mesh(G.ell(0.45, 0.015, 0.14), 0xbfc7cf, w[1] * 0.45, 0, 0, F));
      w[0].add(M.mesh(G.ell(0.12, 0.016, 0.08), 0x222222, w[1] * 0.82, 0, -0.03, F));
    });
    g.add(wl, wr);
    g.userData = { wl: wl, wr: wr };
    return g;
  };

  /* soft billboard clouds */
  M.cloud = function (mat) {
    var g = group(), n = 5 + Math.floor(Math.random() * 5);
    for (var i = 0; i < n; i++) {
      var s = new THREE.Sprite(mat), k = 14 + Math.random() * 16;
      s.scale.set(k * 1.6, k, 1);
      s.position.set((i - n / 2) * 7 + Math.random() * 4, Math.random() * 4, Math.random() * 8 - 4);
      g.add(s);
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
    tex.encoding = THREE.sRGBEncoding;
    var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthWrite: false, toneMapped: false, fog: false }));
    var h = o.h || 1.2;
    sp.scale.set(w / 76 * h, h, 1);
    return sp;
  };
})();
