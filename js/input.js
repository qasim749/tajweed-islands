/* Tajweed Islands – controls
   Keyboard: WASD / arrow keys to walk, Shift to run, E / Space / Enter to talk.
   Mouse: drag to look around, scroll to zoom.
   Touch: joystick (bottom left), drag to look, ✋ button to talk. */
(function () {
  var I = TI.Input = { keys: {}, yaw: 0, pitch: 0.42, dist: 8.5, joy: { x: 0, y: 0 }, action: false, isTouch: false };

  I.init = function (canvas) {
    I.isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

    window.addEventListener('keydown', function (e) {
      I.keys[e.code] = true;
      if ((e.code === 'KeyE' || e.code === 'Space' || e.code === 'Enter') && !e.repeat) I.action = true;
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'ArrowDown') e.preventDefault();
    });
    window.addEventListener('keyup', function (e) { I.keys[e.code] = false; });
    window.addEventListener('blur', function () { I.keys = {}; });

    var drag = null;
    canvas.addEventListener('pointerdown', function (e) {
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY };
      try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    });
    canvas.addEventListener('pointermove', function (e) {
      if (!drag || drag.id !== e.pointerId) return;
      var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      drag.x = e.clientX; drag.y = e.clientY;
      I.yaw -= dx * 0.006;
      I.pitch = Math.max(0.08, Math.min(1.2, I.pitch + dy * 0.004));
    });
    var end = function (e) { if (drag && drag.id === e.pointerId) drag = null; };
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);
    canvas.addEventListener('wheel', function (e) {
      I.dist = Math.max(4, Math.min(16, I.dist + e.deltaY * 0.01));
      e.preventDefault();
    }, { passive: false });

    var joy = document.getElementById('joystick'), stick = document.getElementById('stick');
    var jid = null, cx = 0, cy = 0;
    function moveJ(e) {
      var dx = e.clientX - cx, dy = e.clientY - cy, max = 45, l = Math.hypot(dx, dy);
      if (l > max) { dx *= max / l; dy *= max / l; }
      stick.style.transform = 'translate(calc(-50% + ' + dx + 'px), calc(-50% + ' + dy + 'px))';
      I.joy.x = dx / max; I.joy.y = -dy / max;
    }
    joy.addEventListener('pointerdown', function (e) {
      jid = e.pointerId;
      var r = joy.getBoundingClientRect(); cx = r.left + r.width / 2; cy = r.top + r.height / 2;
      try { joy.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      moveJ(e); e.preventDefault();
    });
    joy.addEventListener('pointermove', function (e) { if (e.pointerId === jid) moveJ(e); });
    var endJ = function (e) {
      if (e.pointerId !== jid) return;
      jid = null; I.joy.x = 0; I.joy.y = 0;
      stick.style.transform = 'translate(-50%, -50%)';
    };
    joy.addEventListener('pointerup', endJ);
    joy.addEventListener('pointercancel', endJ);
  };

  I.getMove = function () {
    var k = I.keys;
    var x = ((k.KeyD || k.ArrowRight) ? 1 : 0) - ((k.KeyA || k.ArrowLeft) ? 1 : 0);
    var y = ((k.KeyW || k.ArrowUp) ? 1 : 0) - ((k.KeyS || k.ArrowDown) ? 1 : 0);
    return { x: x + I.joy.x, y: y + I.joy.y };
  };
  I.run = function () { return !!(I.keys.ShiftLeft || I.keys.ShiftRight); };
  I.consumeAction = function () { var a = I.action; I.action = false; return a; };
  I.press = function () { I.action = true; };
})();
