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

  function lin(hex) { return new THREE.Color(hex).convertSRGBToLinear(); }
  function smooth(t) { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); }
  var SEABED = lin(0x0e3f63);

  W.init = function (canvas) {
    var r = W.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, powerPreference: 'high-performance' });
    var mobile = W.mobile = Math.min(window.innerWidth, window.innerHeight) < 600;
    r.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2));
    r.setSize(window.innerWidth, window.innerHeight);
    r.outputEncoding = THREE.sRGBEncoding;
    r.toneMapping = THREE.ACESFilmicToneMapping;
    r.toneMappingExposure = 0.6;
    r.shadowMap.enabled = true;
    r.shadowMap.type = THREE.PCFSoftShadowMap;

    var s = W.scene = new THREE.Scene();
    s.fog = new THREE.Fog(0xb9d9ee, 80, 300);

    W.camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 3000);
    W.camera.position.set(30, 15, 30);

    W.hemi = new THREE.HemisphereLight(lin(0xdff3ff), lin(0x5a6a4a), 0.35); s.add(W.hemi);
    W.amb = new THREE.AmbientLight(0xffffff, 0.02); s.add(W.amb);
    var sun = W.sun = new THREE.DirectionalLight(lin(0xfff1d6), 2.6);
    sun.castShadow = true;
    sun.shadow.mapSize.set(mobile ? 1024 : 2048, mobile ? 1024 : 2048);
    var sc = sun.shadow.camera;
    sc.left = -35; sc.right = 35; sc.top = 35; sc.bottom = -35; sc.near = 1; sc.far = 300;
    sun.shadow.bias = -0.0004;
    sun.shadow.normalBias = 0.03;
    s.add(sun); s.add(sun.target);

    W.lamps = [];
    W.spinners = [];
    W.foams = [];
    W.grassTime = { value: 0 }; W.grassWind = { value: 0.3 };
    W.weather = { state: 'clear', timer: 240, cur: Object.assign({}, WEATHER.clear) };
    W.pmrem = new THREE.PMREMGenerator(r);
    W.envTimer = 0;

    buildSky(); buildWater(); buildIslands(); buildClouds(); buildRain(); buildLife();

    window.addEventListener('resize', function () {
      W.camera.aspect = window.innerWidth / window.innerHeight;
      W.camera.updateProjectionMatrix();
      W.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  };

  /* ---------- sky: atmosphere, haze, stars, moon ---------- */
  function buildSky() {
    // physically based sky (sun disc, Rayleigh and Mie scattering)
    var sky = W.sky = new THREE.Sky();
    sky.scale.setScalar(10000);
    var u = sky.material.uniforms;
    u.turbidity.value = 4; u.rayleigh.value = 1.4; u.mieCoefficient.value = 0.004; u.mieDirectionalG.value = 0.82;
    W.scene.add(sky);

    // horizon haze: blends the sky into the fogged sea
    var c = document.createElement('canvas'); c.width = 4; c.height = 256;
    var x = c.getContext('2d');
    for (var j = 0; j < 256; j++) {
      var v = 1 - j / 256, a = v < 0.5 ? 1 : Math.exp(-(v - 0.5) * 30);
      var g = Math.round(a * 255); x.fillStyle = 'rgb(' + g + ',' + g + ',' + g + ')'; x.fillRect(0, j, 4, 1);
    }
    W.hazeMat = new THREE.MeshBasicMaterial({ color: 0xffffff, alphaMap: new THREE.CanvasTexture(c), transparent: true, side: THREE.BackSide, fog: false, depthWrite: false, toneMapped: false });
    W.haze = new THREE.Mesh(new THREE.SphereGeometry(1500, 48, 32), W.hazeMat);
    W.haze.renderOrder = -2;
    // overcast / fog / night veil over the whole sky
    W.veilMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, side: THREE.BackSide, fog: false, depthWrite: false, toneMapped: false });
    W.veil = new THREE.Mesh(new THREE.SphereGeometry(1450, 32, 16), W.veilMat);
    W.veil.renderOrder = -1;
    W.scene.add(W.haze, W.veil);

    var n = 1400, pos = new Float32Array(n * 3);
    for (var i = 0; i < n; i++) {
      var p = V(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1).normalize();
      if (p.y < 0.03) p.y = Math.abs(p.y) + 0.03;
      p.normalize().multiplyScalar(1300);
      pos[i * 3] = p.x; pos[i * 3 + 1] = p.y; pos[i * 3 + 2] = p.z;
    }
    var sg = new THREE.BufferGeometry();
    sg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    W.starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 1.6, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false, toneMapped: false });
    W.stars = new THREE.Points(sg, W.starMat);
    W.scene.add(W.stars);
    W.moonMesh = new THREE.Mesh(new THREE.SphereGeometry(22, 48, 32),
      new THREE.MeshBasicMaterial({ color: 0xe8ecff, map: M.tex.lumps(), fog: false, toneMapped: false }));
    W.scene.add(W.moonMesh);
  }

  /* reflections and ambient light come from the sky itself */
  function updateEnv() {
    if (W.envRT) W.envRT.dispose();
    W.envRT = W.pmrem.fromScene(W.sky);
    W.scene.environment = W.envRT.texture;
  }

  /* ---------- the sea: reflective, rippled, see-through in the shallows ---------- */
  function buildWater() {
    var geo = new THREE.PlaneGeometry(1100, 1100, 160, 160);
    geo.rotateX(-Math.PI / 2);
    geo.translate(0, 0, -250);
    var p = geo.attributes.position, n = p.count;
    var colors = new Float32Array(n * 3), alpha = new Float32Array(n);
    W.waterBase = new Float32Array(n * 2);
    var deep = lin(0x0b3d6b), mid = lin(0x1a7fa8), shallow = lin(0x3fd0c8), c = new THREE.Color();
    for (var i = 0; i < n; i++) {
      var x = p.getX(i), z = p.getZ(i);
      W.waterBase[i * 2] = x; W.waterBase[i * 2 + 1] = z;
      var md = 1e9;
      C.MAP.forEach(function (isl) { md = Math.min(md, Math.hypot(x - isl.x, z - isl.z) - isl.r); });
      if (md < 4) c.copy(shallow);
      else if (md < 18) c.copy(shallow).lerp(mid, (md - 4) / 14);
      else if (md < 50) c.copy(mid).lerp(deep, (md - 18) / 32);
      else c.copy(deep);
      colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
      alpha[i] = 0.5 + 0.45 * smooth((md - 1) / 16);
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('aAlpha', new THREE.BufferAttribute(alpha, 1));
    var nt = W.waterTex = M.tex.waterNormal();
    nt.repeat.set(90, 90);
    var mat = new THREE.MeshPhysicalMaterial({
      vertexColors: true, roughness: 0.06, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.04,
      normalMap: nt, normalScale: new THREE.Vector2(0.45, 0.45), transparent: true, envMapIntensity: 0.85
    });
    mat.onBeforeCompile = function (sh) {
      sh.vertexShader = 'attribute float aAlpha;\nvarying float vAlpha;\n' +
        sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvAlpha = aAlpha;');
      sh.fragmentShader = 'varying float vAlpha;\n' +
        sh.fragmentShader.replace('#include <dithering_fragment>', '#include <dithering_fragment>\ngl_FragColor.a *= vAlpha;');
    };
    W.water = new THREE.Mesh(geo, mat);
    W.water.receiveShadow = true;
    W.scene.add(W.water);
    // the sea floor, seen through the clear water
    var floor = new THREE.Mesh(new THREE.PlaneGeometry(1100, 1100), new THREE.MeshStandardMaterial({ color: SEABED, roughness: 1 }));
    floor.rotation.x = -Math.PI / 2; floor.position.set(0, -3.3, -250);
    W.scene.add(floor);
    // the open ocean beyond, out to the horizon
    var farTex = nt.clone(); farTex.needsUpdate = true; farTex.repeat.set(200, 200);
    var far = new THREE.Mesh(new THREE.RingGeometry(540, 2800, 96, 1),
      new THREE.MeshPhysicalMaterial({ color: deep, roughness: 0.1, clearcoat: 1, clearcoatRoughness: 0.08, normalMap: farTex, normalScale: new THREE.Vector2(0.3, 0.3) }));
    far.rotation.x = -Math.PI / 2; far.position.set(0, -0.2, -250);
    W.scene.add(far);
  }

  function updateWater(t, wind) {
    var p = W.water.geometry.attributes.position, a = p.array, amp = 0.16 + wind * 0.32;
    for (var i = 0, j = 0; i < p.count; i++, j += 3) {
      var x = W.waterBase[i * 2], z = W.waterBase[i * 2 + 1];
      a[j + 1] = (Math.sin(x * 0.06 + t * 1.1) + Math.cos(z * 0.08 + t * 0.9)) * 0.5 * amp
        + Math.sin((x + z) * 0.15 + t * 2) * 0.06 + Math.sin(x * 0.23 - z * 0.17 + t * 2.6) * 0.04;
    }
    p.needsUpdate = true;
    W.water.geometry.computeVertexNormals();
    W.waterTex.offset.set(t * 0.006, t * 0.004);
  }

  /* ---------- island terrain ---------- */
  /* Height of the ground at a distance from an island's centre: a flat walkable
     top at y = 1, a sandy beach sloping into the sea, then the sea floor. */
  function terrainH(d, lx, lz) {
    var dist = Math.hypot(lx, lz), flat = d.r - 0.5;
    var n = (M.fbm(lx * 0.15 + d.x * 0.01, 3.7, lz * 0.15 + d.z * 0.01, 3) - 0.5) * 0.06;
    if (dist <= flat) return 1.0 + n;
    var t = (dist - flat) / (d.r * 0.4);
    return 1.0 + n * (1 - smooth(t)) - 4.2 * smooth(t) + (M.fbm(lx * 0.3, 1.3, lz * 0.3, 2) - 0.5) * 0.25 * smooth(t * 3);
  }
  W.terrainY = function (isl, x, z) { return terrainH(isl.def, x - isl.x, z - isl.z); };

  function buildTerrain(d, g) {
    var R2 = d.r * 1.5, seg = d.built ? 150 : 70;
    var geo = new THREE.PlaneGeometry(R2 * 2, R2 * 2, seg, seg);
    geo.rotateX(-Math.PI / 2);
    var p = geo.attributes.position, n = p.count, col = new Float32Array(n * 3);
    var sandHex = d.style === 'desert' ? 0xcfa264 : 0xdcc493;
    var dry = lin(sandHex), wet = lin(sandHex).multiplyScalar(0.62), sea = lin(0x2f6f7a), deepSea = SEABED;
    var grassA = d.grass ? lin(d.grass) : null, grassB = d.grass ? lin(d.grass).lerp(lin(0x2f5a1e), 0.6) : null, dirt = lin(0x9a8158);
    var desert = d.style === 'desert', c = new THREE.Color(), gc = new THREE.Color();
    for (var i = 0; i < n; i++) {
      var x = p.getX(i), z = p.getZ(i), dist = Math.hypot(x, z), y = terrainH(d, x, z);
      p.setY(i, y);
      var nz = M.fbm(x * 0.2 + 11, 0.5, z * 0.2, 4);
      if (y < -0.25) c.copy(wet).lerp(sea, smooth(-y / 1.8)).lerp(deepSea, smooth((-y - 1.5) / 2.5));
      else if (y < 0.45) c.copy(wet).lerp(dry, smooth((y + 0.25) / 0.7));
      else c.copy(dry).multiplyScalar(0.92 + nz * 0.16);
      if (grassA) {
        var edge = d.r * 0.72 + (nz - 0.5) * 3.5;
        var k = smooth((edge - dist) / 1.2);
        if (k > 0) {
          gc.copy(grassA).lerp(grassB, smooth((nz - 0.35) * 2.5));
          if (!desert && M.fbm(x * 0.5, 9.1, z * 0.5, 3) > 0.68) gc.lerp(dirt, 0.4);
          c.lerp(gc, k);
        }
      }
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    geo.computeVertexNormals();
    var det = M.tex.detail().clone(); det.needsUpdate = true; det.repeat.set(R2 / 1.5, R2 / 1.5);
    var bump = M.tex.grain().clone(); bump.needsUpdate = true; bump.repeat.set(R2 / 2, R2 / 2);
    var mat = new THREE.MeshStandardMaterial({ vertexColors: true, map: det, bumpMap: bump, bumpScale: 0.03, roughness: 0.95 });
    var m = new THREE.Mesh(geo, mat);
    m.receiveShadow = true;
    g.add(m);

    // surf foam where the beach meets the sea
    var shoreR = d.r - 0.5 + d.r * 0.4 * 0.31;
    var foamTex = M.tex.foam().clone(); foamTex.needsUpdate = true; foamTex.repeat.set(Math.round(shoreR), 1);
    var fm = new THREE.MeshStandardMaterial({ color: 0xffffff, map: foamTex, transparent: true, depthWrite: false, roughness: 0.9, side: THREE.DoubleSide });
    var foam = new THREE.Mesh(new THREE.LatheGeometry([new THREE.Vector2(shoreR - 0.6, 0), new THREE.Vector2(shoreR + 2.2, 0)], 96), fm);
    foam.position.y = 0.08; foam.renderOrder = 1;
    g.add(foam);
    W.foams.push({ mesh: foam, mat: fm, tex: foamTex, phase: Math.random() * 6 });
  }

  /* swaying grass blades */
  function buildGrass(isl, d, g, avoid) {
    if (!d.grass || d.style === 'desert') return;
    var count = W.mobile ? 3000 : 9000;
    var bg = new THREE.PlaneGeometry(0.045, 0.3, 1, 4), bp = bg.attributes.position;
    for (var i = 0; i < bp.count; i++) {
      var y = bp.getY(i) + 0.15, t = y / 0.3;
      bp.setXYZ(i, bp.getX(i) * (1 - t * 0.85), y, t * t * 0.08);
    }
    var nrm = bg.attributes.normal;
    for (var j = 0; j < nrm.count; j++) nrm.setXYZ(j, 0, 1, 0.2);
    var mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.85, side: THREE.DoubleSide });
    mat.onBeforeCompile = function (sh) {
      sh.uniforms.uTime = W.grassTime; sh.uniforms.uWind = W.grassWind;
      sh.vertexShader = 'uniform float uTime;\nuniform float uWind;\n' + sh.vertexShader.replace('#include <begin_vertex>',
        '#include <begin_vertex>\n' +
        'vec4 ip = instanceMatrix[3];\n' +
        'float k = position.y * position.y * 6.0;\n' +
        'transformed.x += sin(uTime * 2.2 + ip.x * 0.7 + ip.z * 0.4) * k * (0.04 + uWind * 0.14);\n' +
        'transformed.z += cos(uTime * 1.7 + ip.x * 0.3) * k * 0.03;');
    };
    var im = new THREE.InstancedMesh(bg, mat, count);
    im.receiveShadow = true;
    var base = lin(d.grass).multiplyScalar(0.7), dark = lin(d.grass).lerp(lin(0x24481a), 0.65), dry = lin(d.grass).lerp(lin(0xc9b26a), 0.35);
    var m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), s = new THREE.Vector3(), pos = new THREE.Vector3(), c = new THREE.Color();
    var placed = 0, tries = 0, R = d.r * 0.72;
    while (placed < count && tries < count * 4) {
      tries++;
      var a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * R, x = Math.cos(a) * r, z = Math.sin(a) * r;
      var nz = M.fbm(x * 0.2 + 11, 0.5, z * 0.2, 4);
      if (r > R + (nz - 0.5) * 3.5 - 0.6) continue;
      var blocked = avoid.some(function (o) { var dx = x - o.x, dz = z - o.z; return dx * dx + dz * dz < o.r * o.r; });
      if (blocked) continue;
      pos.set(x, terrainH(d, x, z) - 0.02, z);
      e.set((Math.random() - 0.5) * 0.4, Math.random() * Math.PI * 2, (Math.random() - 0.5) * 0.4);
      q.setFromEuler(e);
      var sc = 0.6 + Math.random() * 0.8 * (0.6 + nz * 0.8);
      s.set(sc, sc, sc);
      im.setMatrixAt(placed, m4.compose(pos, q, s));
      c.copy(base).lerp(dark, Math.random() * 0.6).lerp(dry, Math.max(0, nz - 0.55) * 1.5);
      im.setColorAt(placed, c);
      placed++;
    }
    im.count = placed;
    g.add(im);
  }

  /* ---------- islands ---------- */
  function buildIslands() {
    W.islands = {};
    C.MAP.forEach(function (d, idx) {
      var target = d.id === 'harbor' ? C.MAP[1] : C.MAP[idx - 1];
      W.islands[d.id] = makeIsland(d, target);
    });
  }

  function makeIsland(d, target) {
    var g = new THREE.Group(); g.position.set(d.x, 0, d.z); W.scene.add(g);
    var isl = { id: d.id, def: d, x: d.x, z: d.z, r: d.r, built: !!d.built, group: g, obstacles: [], spots: {}, grassR: d.grass ? d.r * 0.72 : 0 };
    var grassAvoid = [];

    buildTerrain(d, g);
    var gy = function (l) { return terrainH(d, l.x, l.z); };

    // dock facing the neighbouring island
    var dx = target.x - d.x, dz = target.z - d.z, L = Math.hypot(dx, dz);
    var dir = { x: dx / L, z: dz / L }, perp = { x: -dir.z, z: dir.x };
    var heading = Math.atan2(dir.x, dir.z);
    var local = function (along, side) { return { x: dir.x * along + perp.x * side, z: dir.z * along + perp.z * side }; };
    var world = function (along, side, y) { var l = local(along, side); return V(d.x + l.x, y || 0, d.z + l.z); };
    isl.local = local; isl.world = world;

    var WOOD = { tex: 'wood', rough: 0.8, bump: 'grain', bumpScale: 0.02 };
    var pc = local(d.r + 2, 0);
    var pier = M.mesh(M.G.box(2.4, 0.15, 10), 0xa8774a, pc.x, 1.175, pc.z, WOOD);
    pier.rotation.y = heading; g.add(pier);
    for (var a = d.r - 1; a <= d.r + 7; a += 2.5) {
      [-1.1, 1.1].forEach(function (s) {
        var pp = local(a, s);
        g.add(M.mesh(M.G.cyl(0.13, 0.15, 3.6, 12), 0x5b3d22, pp.x, -0.6, pp.z, { tex: 'bark', rough: 0.9 }));
      });
    }
    var pierEnd = local(d.r - 1.5, 0);
    grassAvoid.push({ x: pierEnd.x, z: pierEnd.z, r: 1.8 });
    isl.dock = {
      dir: dir, perp: perp, heading: heading,
      ferryPos: world(d.r + 5, 3.1),
      captainPos: world(d.r + 5.8, 0.5, 1.25),
      alongMin: d.r - 3, alongMax: d.r + 7
    };

    function polar(angle, dist) { return local(Math.cos(angle) * dist, Math.sin(angle) * dist); }
    function palm(angle, dist) {
      var l = polar(angle, dist), p = M.palm(3.4 + Math.random() * 1.6);
      p.position.set(l.x, gy(l) - 0.05, l.z); p.rotation.y = Math.random() * 6; g.add(p);
      isl.obstacles.push({ x: d.x + l.x, z: d.z + l.z, r: 0.45 });
    }
    function rock(angle, dist, s) {
      var l = polar(angle, dist), m = M.rock(s);
      m.position.set(l.x, gy(l) - s * 0.2, l.z); g.add(m);
      if (dist < d.r - 1) isl.obstacles.push({ x: d.x + l.x, z: d.z + l.z, r: s * 0.9 });
    }
    function lantern(along, side, withLight) {
      var l = local(along, side), ln = M.lantern();
      ln.group.position.set(l.x, along > d.r - 3 && Math.abs(side) < 1.3 ? 1.25 : gy(l), l.z); g.add(ln.group);
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
        var ang = 0.6 + Math.random() * (Math.PI * 2 - 1.2), dist = minD + Math.random() * (maxD - minD), col = cols[i % cols.length];
        // small clusters look more natural than single flowers
        for (var k = 0; k < 3; k++) {
          var l = polar(ang + (Math.random() - 0.5) * 0.08, dist + (Math.random() - 0.5) * 0.8), f = M.flower(col);
          f.position.set(l.x, gy(l), l.z); f.scale.setScalar(0.8 + Math.random() * 0.5); f.rotation.y = Math.random() * 6; g.add(f);
        }
      }
    }
    function avoidObstacles() {
      isl.obstacles.forEach(function (o) { grassAvoid.push({ x: o.x - d.x, z: o.z - d.z, r: o.r + 0.3 }); });
    }

    if (d.id === 'harbor') {
      [1.6, 2.2, 2.9, 3.6, 4.3, -1.3, -2.0, -2.7].forEach(function (a, i) { palm(a, d.r - 3.5 - (i % 3)); });
      var booth = M.booth(); var bl = local(d.r - 6, -4.5);
      booth.position.set(bl.x, gy(bl), bl.z); booth.rotation.y = heading + Math.PI / 2; g.add(booth);
      isl.obstacles.push({ x: d.x + bl.x, z: d.z + bl.z, r: 1.7 });
      isl.spots.booth = world(d.r - 6, -4.5, 1);
      lantern(d.r - 1, 1.05, true); lantern(d.r + 6.5, -1.05, true); lantern(d.r - 6, -2.4, false);
      [0.9, -0.9, 3.1].forEach(function (a) { rock(a, d.r - 0.5, 0.6 + Math.random() * 0.5); });
      flowers(8, 4, d.r * 0.65);
      isl.spots.afra = world(d.r - 6, -1.6, 1);
      isl.spots.spawn = world(d.r - 9, 0.5, 1);
      isl.spots.spawnFacesDock = true;
    } else if (d.built) {
      var pav = M.pavilion({ roof: d.roof, board: d.board }); var pl2 = local(-4, 0);
      pav.position.set(pl2.x, 0, pl2.z); pav.rotation.y = heading; g.add(pav);
      grassAvoid.push({ x: pl2.x, z: pl2.z, r: 4.8 });
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
          cm.scale.y = 2.6 + Math.random() * 1.8; cm.position.set(cl.x, 0.6, cl.z); g.add(cm);
          isl.obstacles.push({ x: d.x + cl.x, z: d.z + cl.z, r: 2.5 });
        });
        [1.4, 2.05, -1.2, -2.0].forEach(function (a, i) { palm(a, d.r - 3.5 - (i % 2)); });
        [0.8, -0.8, 2.2, -2.6].forEach(function (a) { rock(a, d.r - 0.5, 0.7 + Math.random() * 0.6); });
        flowers(6, 6, d.r * 0.6);
      } else if (d.style === 'desert') {
        // rolling dunes behind the pavilion
        [2.75, 3.1, 3.45, 3.8].forEach(function (a, k) {
          var dl = polar(a, d.r - 3.2), rr = 3.4 + (k % 2) * 0.8;
          var dune = M.mesh(M.lumpy(1, 0.12, k * 7), k % 2 ? 0xe2b765 : 0xd9a94f, dl.x, 0.75, dl.z, { rough: 1, bump: 'grain', bumpScale: 0.04 });
          dune.scale.set(rr, 1.4 + (k % 3) * 0.45, rr * 0.8); dune.rotation.y = a; g.add(dune);
          isl.obstacles.push({ x: d.x + dl.x, z: d.z + dl.z, r: 3.0 });
        });
        // a small oasis with palms
        var ol = polar(-2.35, 12.5);
        var pool = new THREE.Mesh(new THREE.CircleGeometry(2.6, 48),
          new THREE.MeshPhysicalMaterial({ color: lin(0x1f8f8a), roughness: 0.05, clearcoat: 1, normalMap: M.tex.waterNormal(), normalScale: new THREE.Vector2(0.15, 0.15) }));
        pool.rotation.x = -Math.PI / 2; pool.position.set(ol.x, 1.06, ol.z); g.add(pool);
        var bank = M.mesh(new THREE.RingGeometry(2.5, 3.3, 48), 0x7fa850, ol.x, 1.05, ol.z, { rough: 0.9, bump: 'grain', bumpScale: 0.03 });
        bank.rotation.x = -Math.PI / 2; g.add(bank);
        isl.obstacles.push({ x: d.x + ol.x, z: d.z + ol.z, r: 2.7 });
        [0, 2.1, 4.2].forEach(function (a) {
          var p = M.palm(3.6 + Math.random()), px = ol.x + Math.cos(a) * 3.3, pz = ol.z + Math.sin(a) * 3.3;
          p.position.set(px, 1.0, pz); p.rotation.y = Math.random() * 6; g.add(p);
          isl.obstacles.push({ x: d.x + px, z: d.z + pz, r: 0.45 });
        });
        [1.2, 2.05, -1.25, 4.3].forEach(function (a, i) {
          var cl = polar(a, d.r - 3.5 - (i % 2)), c = M.cactus(1.8 + Math.random() * 1.2);
          c.position.set(cl.x, gy(cl), cl.z); c.rotation.y = Math.random() * 6; g.add(c);
          isl.obstacles.push({ x: d.x + cl.x, z: d.z + cl.z, r: 0.6 });
        });
        [0.8, -0.8, 2.3].forEach(function (a) { rock(a, d.r - 0.5, 0.7 + Math.random() * 0.6); });
        flowers(3, 6, d.r * 0.6);
      } else if (d.style === 'aclopips') {
        // trees with metal trunks and solar-panel leaves
        [1.35, 2.05, 2.85, 3.45, -2.6, -1.95, -1.25].forEach(function (a, i) {
          var tl = polar(a, d.r - 3.5 - (i % 2) * 1.5), tr = M.techTree(3.2 + Math.random() * 1.2);
          tr.position.set(tl.x, gy(tl), tl.z); tr.rotation.y = Math.random() * 6; g.add(tr);
          isl.obstacles.push({ x: d.x + tl.x, z: d.z + tl.z, r: 0.5 });
        });
        W.lamps.push({ mat: M.glowMat, light: null });
        // flowers that are also wind turbines
        [[1.0, 16, 0xff8fab], [-1.0, 16, 0xb39ddb], [3.15, 15.5, 0x80ffdb]].forEach(function (w, i) {
          var wl = polar(w[0], w[1]), wf = M.windFlower(4.5 + i * 0.6, w[2]);
          wf.position.set(wl.x, gy(wl), wl.z); wf.rotation.y = heading + Math.PI * 0.15 * (i - 1); g.add(wf);
          W.spinners.push({ obj: wf.userData.rotor, speed: 1.2 + i * 0.3 });
          isl.obstacles.push({ x: d.x + wl.x, z: d.z + wl.z, r: 0.4 });
        });
        // glass garden domes
        [[2.45, 15, 1.8], [-2.25, 13.5, 1.5]].forEach(function (o) {
          var dl = polar(o[0], o[1]), dm = M.dome(o[2]);
          dm.position.set(dl.x, gy(dl), dl.z); g.add(dm);
          isl.obstacles.push({ x: d.x + dl.x, z: d.z + dl.z, r: o[2] + 0.3 });
        });
        [0.8, -0.8].forEach(function (a) { rock(a, d.r - 0.5, 0.7 + Math.random() * 0.5); });
        flowers(10, 6, d.r * 0.68);
      } else {
        [1.4, 2.0, 2.6, 3.3, 3.9, 4.6, -1.2, -1.9].forEach(function (a, i) { palm(a, d.r - 3.5 - (i % 3)); });
        [0.8, -0.8, 2.3, 4.1].forEach(function (a) { rock(a, d.r - 0.5, 0.6 + Math.random() * 0.6); });
        flowers(12, 6, d.r * 0.68);
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
          st.position.set(sl.x, gy(sl), sl.z); g.add(st);
          isl.obstacles.push({ x: d.x + sl.x, z: d.z + sl.z, r: 1.1 });
          isl.stones.push({ pos: V(d.x + sl.x, 1.1, d.z + sl.z), zone: z });
        });
      }
    } else {
      // islands still to come
      if (d.style === 'cliffs') {
        for (var k = 0; k < 7; k++) {
          var cl = polar(k * 0.9, 3 + (k % 3) * 3), cm = M.rock(2 + Math.random() * 1.5, 0x9c8f80);
          cm.scale.y = 2 + Math.random() * 1.5; cm.position.set(cl.x, 0.8, cl.z); g.add(cm);
        }
      } else if (d.style === 'desert') {
        for (var q = 0; q < 6; q++) {
          var dl = polar(q * 1.1, 4 + (q % 3) * 3.5), rr = 3 + Math.random() * 2;
          var dune = M.mesh(M.lumpy(1, 0.12, q * 5), 0xe2b765, dl.x, 0.8, dl.z, { rough: 1, bump: 'grain', bumpScale: 0.04 });
          dune.scale.set(rr, 1.5 + Math.random(), rr * 0.8); g.add(dune);
        }
      } else {
        [0.5, 1.7, 2.9, 4.0, 5.2].forEach(function (a, i) { palm(a, d.r * 0.5 + (i % 3) * 2); });
      }
      var lab = M.label('🔒 ' + C.islandName(d.id), { h: 2.2 });
      lab.position.set(0, 11, 0); g.add(lab);
    }
    avoidObstacles();
    buildGrass(isl, d, g, grassAvoid);
    return isl;
  }

  /* ---------- clouds, rain, sea life ---------- */
  function buildClouds() {
    W.cloudMat = new THREE.SpriteMaterial({ map: M.tex.cloud(), color: 0xffffff, transparent: true, opacity: 0.9, depthWrite: false, fog: false, toneMapped: false });
    W.clouds = [];
    for (var i = 0; i < 26; i++) {
      var c = M.cloud(W.cloudMat);
      c.position.set(-400 + Math.random() * 800, 60 + Math.random() * 40, -700 + Math.random() * 950);
      W.scene.add(c); W.clouds.push(c);
    }
  }

  function buildRain() {
    var n = 1600, pos = new Float32Array(n * 6);
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

  var cNight = new THREE.Color(0x0b1633), cDay = new THREE.Color(0xb9d9ee), cSet = new THREE.Color(0xffa877),
      cGrey = new THREE.Color(0x9aa6b2), cFog = new THREE.Color(0xc9d3dc), tmp = new THREE.Color(), linCol = new THREE.Color(),
      cCloudNight = lin(0x2b3550), cCloudRain = lin(0x7a838c), cCloudSet = lin(0xffc4a0), white = new THREE.Color(0xffffff);
  var sunDir = V(0, 1, 0), lastSun = V(0, -2, 0), lastCloud = -1;

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
    var night = 1 - day;

    // sky
    var su = W.sky.material.uniforms;
    su.sunPosition.value.copy(sunDir);
    su.turbidity.value = 1.5 + cur.cloud * 6 + cur.fog * 6;
    su.rayleigh.value = 2.6 + sunset * 1.2 - cur.cloud * 1.2;
    su.mieCoefficient.value = 0.004 + cur.fog * 0.02;
    // refresh the reflections when the sky has visibly changed
    W.envTimer -= dt;
    if (W.envTimer <= 0 && (sunDir.distanceTo(lastSun) > 0.03 || Math.abs(cur.cloud - lastCloud) > 0.05)) {
      updateEnv(); lastSun.copy(sunDir); lastCloud = cur.cloud; W.envTimer = 2;
    }

    // haze and fog colour
    tmp.copy(cNight).lerp(cDay, day).lerp(cSet, sunset * 0.55 * (1 - cur.cloud * 0.5));
    tmp.lerp(cGrey, cur.cloud * 0.45 * day);
    tmp.lerp(cFog, cur.fog * 0.5 * Math.max(day, 0.2));
    linCol.copy(tmp).convertSRGBToLinear();
    W.scene.fog.color.copy(tmp);           // r128 applies fog after the sRGB conversion
    W.scene.fog.near = THREE.MathUtils.lerp(110, 4, cur.fog);
    W.scene.fog.far = THREE.MathUtils.lerp(420, 80, cur.fog);
    W.hazeMat.color.copy(linCol);
    W.veilMat.color.copy(linCol);
    W.veilMat.opacity = THREE.MathUtils.clamp(Math.max(cur.fog * 0.95, cur.cloud * 0.75 - 0.15, night * 0.55), 0, 1);
    W.renderer.toneMappingExposure = THREE.MathUtils.lerp(0.9, 0.46, day) * (1 + cur.cloud * 0.15);

    var light = W.sun;
    var above = elev > -0.02;
    var ld = above ? sunDir : V(-sunDir.x, -sunDir.y, -sunDir.z);
    light.position.copy(focus).addScaledVector(ld, 120);
    light.target.position.copy(focus);
    if (above) {
      light.color.copy(lin(0xfff1d6)).lerp(lin(0xff9850), sunset * 0.7);
      light.intensity = (0.3 + 2.2 * day) * (1 - cur.cloud * 0.55) * (1 - cur.fog * 0.4);
    } else {
      light.color.copy(lin(0xc4d0f0));
      light.intensity = 0.22 * (1 - cur.cloud * 0.5);
    }
    W.hemi.intensity = 0.08 + 0.12 * day + cur.cloud * 0.3;
    W.amb.intensity = 0.03 + 0.05 * night;

    var cam = W.camera.position;
    W.sky.position.copy(cam);
    W.haze.position.copy(cam); W.veil.position.copy(cam);
    W.stars.position.copy(cam);
    W.starMat.opacity = night * (1 - cur.cloud * 0.8) * (1 - cur.fog);
    W.moonMesh.position.copy(cam).addScaledVector(sunDir, -1100);
    W.moonMesh.visible = elev < 0.1 && cur.fog < 0.7;

    W.lamps.forEach(function (l) {
      l.mat.emissiveIntensity = night * 2.5;
      if (l.light) l.light.intensity = night * 1.6;
    });

    W.spinners.forEach(function (s) { s.obj.rotation.z += dt * s.speed * (0.6 + cur.wind * 2.5); });
    W.grassTime.value = t; W.grassWind.value = cur.wind;
    W.foams.forEach(function (f) {
      f.mat.opacity = 0.55 + 0.35 * Math.sin(t * 0.9 + f.phase);
      f.tex.offset.set(t * 0.004, Math.sin(t * 0.9 + f.phase) * 0.06);
      f.mat.color.setScalar(0.25 + 0.75 * day);
    });

    // clouds
    var visibleClouds = Math.round(8 + 18 * cur.cloud);
    W.cloudMat.color.copy(cCloudNight).lerp(white, day).lerp(cCloudSet, sunset * 0.5 * day).lerp(cCloudRain, cur.rain * 0.6);
    W.cloudMat.opacity = 0.6 + 0.35 * cur.cloud;
    W.clouds.forEach(function (c, i) {
      c.visible = i < visibleClouds;
      c.position.x += dt * (1 + cur.wind * 5);
      if (c.position.x > 420) c.position.x = -420;
    });

    // rain falls around the camera
    W.rain.visible = cur.rain > 0.03;
    if (W.rain.visible) {
      W.rainMat.opacity = cur.rain * 0.45;
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
