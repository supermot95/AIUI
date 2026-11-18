// Hoofdlus: klok, scherm, tekenen, debug.
(function () {
  const U = window.UilUtil, CFG = window.UIL_CONFIG;
  const { clamp, smooth, rand } = U;
  const canvas = document.getElementById('scherm');
  const ctx = canvas.getContext('2d');
  const owlCanvas = document.createElement('canvas');
  const octx = owlCanvas.getContext('2d');
  const skyCanvas = document.createElement('canvas');
  const skyCtx = skyCanvas.getContext('2d');

  // ---------- klok (met testmogelijkheden via de URL) ----------
  // ?tijd=21:30   ?datum=2026-12-24   ?snel=60 (60x zo snel)
  const qs = new URLSearchParams(location.search);
  let speed = parseFloat(qs.get('snel')) || 1;
  let simBase = Date.now(), realBase = performance.now();
  if (qs.get('datum') || qs.get('tijd')) {
    const d = qs.get('datum') ? new Date(qs.get('datum') + 'T12:00:00') : new Date();
    if (qs.get('tijd')) { const [h, m] = qs.get('tijd').split(':').map(Number); d.setHours(h, m || 0, 0, 0); }
    simBase = d.valueOf();
  }
  const simNow = () => new Date(simBase + (performance.now() - realBase) * speed);
  function setSpeed(s) { simBase = simNow().valueOf(); realBase = performance.now(); speed = s; }
  function jump(hours) { simBase = simNow().valueOf() + hours * 3600000; realBase = performance.now(); }

  // ---------- scherm ----------
  let W = 1778, H = 1000, scale = 1, room = null;
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, CFG.maxPixelRatio || 1);
    canvas.width = Math.round(innerWidth * dpr); canvas.height = Math.round(innerHeight * dpr);
    owlCanvas.width = skyCanvas.width = canvas.width; owlCanvas.height = skyCanvas.height = canvas.height;
    H = 1000; scale = canvas.height / H; W = canvas.width / scale;
    room = UilScene.renderRoom(W, H, scale);
    brain.W = W; brain.H = H;
    brain.moveLimit = Math.max(40, Math.min(150, room.layout.win.x - W / 2 - 170));
    brain.owlX = W / 2;
  }

  const rig = new UilOwl.Rig();
  const brain = new UilBrain.Brain(rig);
  addEventListener('resize', resize);
  resize();

  // ---------- deeltjes ----------
  const particles = [];
  let zzzTimer = 0, snore = { phase: 0, popAt: rand(4, 9), popping: 0 };
  function spawnFeather(x, y) {
    particles.push({ type: 'veer', x, y, vx: rand(-60, 60), vy: rand(-90, -30), rot: rand(0, 6), vr: rand(-2, 2), life: 0, max: rand(4, 7) });
  }
  function updateParticles(dt, owlPos, S) {
    for (const e of brain.events.splice(0)) {
      if (e.type === 'veertjes') for (let i = 0; i < e.n; i++) spawnFeather(owlPos.x + rand(-80, 80), owlPos.y - rand(100, 250));
    }
    if (rig.asleep && rig.p.eyeL < 0.1 && rig.p.eyeR < 0.1 && rig.visible) {
      zzzTimer -= dt;
      if (zzzTimer <= 0) {
        zzzTimer = rand(2.2, 3.2);
        particles.push({ type: 'z', x: owlPos.x + 70 * S, y: owlPos.y - 300 * S, life: 0, max: 4, size: rand(26, 36) });
      }
    }
    for (const p of particles) {
      p.life += dt;
      if (p.type === 'z') { p.y -= 28 * dt; p.x += Math.sin(p.life * 2) * 18 * dt + 10 * dt; }
      else { p.vy += 20 * dt; p.vx *= 0.98; p.vy = Math.min(p.vy, 40); p.x += (p.vx + Math.sin(p.life * 3) * 30) * dt; p.y += p.vy * dt; p.rot += p.vr * dt; }
    }
    for (let i = particles.length - 1; i >= 0; i--) if (particles[i].life > particles[i].max) particles.splice(i, 1);
  }
  function drawParticles(c, dim) {
    for (const p of particles) {
      const a = clamp(Math.min(p.life / 0.4, (p.max - p.life) / 1));
      if (p.type === 'z') {
        c.fillStyle = `rgba(235,235,255,${a * 0.85})`;
        c.font = `bold ${p.size + p.life * 6}px "Comic Sans MS", "Chalkboard SE", "Marker Felt", sans-serif`;
        c.fillText('z', p.x, p.y);
      } else {
        c.save(); c.translate(p.x, p.y); c.rotate(p.rot);
        c.fillStyle = `rgba(${dim ? '150,110,75' : '200,160,115'},${a})`;
        c.beginPath(); c.ellipse(0, 0, 5, 14, 0, 0, 7); c.fill();
        c.strokeStyle = `rgba(90,60,35,${a})`; c.lineWidth = 1;
        c.beginPath(); c.moveTo(0, -14); c.lineTo(0, 16); c.stroke();
        c.restore();
      }
    }
  }

  function snoreBubble(dt) {
    if (!rig.asleep || rig.p.eyeL > 0.1 || !rig.visible) { snore.phase = 0; return 0; }
    snore.phase += dt;
    if (snore.popping > 0) { snore.popping -= dt; return 0; }
    const r = 4 + 12 * Math.max(0, Math.sin(snore.phase * 2 * Math.PI / 4.2));
    if (snore.phase > snore.popAt && r > 14) { snore.popping = rand(5, 15); snore.popAt = snore.phase + snore.popping + rand(4, 12); return 0; }
    return r;
  }

  function drawBubble(c, b, x, y) {
    const age = brain.clock - b.born, left = b.until - brain.clock;
    const a = clamp(Math.min(age / 0.2, left / 0.4));
    const pop = 0.85 + 0.15 * clamp(age / 0.15);
    c.save();
    c.globalAlpha = a;
    c.font = 'bold 34px "Comic Sans MS", "Chalkboard SE", "Marker Felt", sans-serif';
    const tw = c.measureText(b.text).width, w = tw + 44, h = 62;
    const bx = clamp(x, 20, W - w - 20), by = y - h;
    c.translate(bx + w / 2, by + h / 2); c.scale(pop, pop); c.translate(-(bx + w / 2), -(by + h / 2));
    c.fillStyle = '#fffaf0'; c.strokeStyle = '#3a2410'; c.lineWidth = 3;
    c.beginPath();
    c.roundRect ? c.roundRect(bx, by, w, h, 28) : c.rect(bx, by, w, h);
    c.fill(); c.stroke();
    c.beginPath(); c.moveTo(bx + 30, by + h - 2); c.lineTo(bx + 10, by + h + 26); c.lineTo(bx + 56, by + h - 2); c.fill();
    c.beginPath(); c.moveTo(bx + 30, by + h); c.lineTo(bx + 10, by + h + 26); c.lineTo(bx + 56, by + h); c.stroke();
    c.fillStyle = '#3a2410'; c.textBaseline = 'middle';
    c.fillText(b.text, bx + 22, by + h / 2 + 2);
    c.restore();
  }

  // ---------- debug ----------
  const dbg = document.getElementById('debug');
  let showDebug = qs.has('debug');
  let fpsAcc = 0, fpsN = 0, fps = 0, dbgTimer = 0;
  const fmt = (d) => d ? d.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }) : '–';
  const bar = (v) => '█'.repeat(Math.round(v * 10)).padEnd(10, '·');
  let lastTimesDay = '', times = {};
  function updateDebug(env) {
    dbg.style.display = showDebug ? 'block' : 'none';
    if (!showDebug) return;
    const n = brain.needs;
    dbg.textContent =
`🦉 De uil op zolder — debug (d = verbergen)
tijd      ${env.date.toLocaleString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}  (${speed}x)
locatie   ${CFG.locatie.naam}
zon       ${env.sun.alt.toFixed(1)}°   op ${fmt(times.sunrise)}  onder ${fmt(times.sunset)}
maan      ${Astro.phaseName(env.moonIllum.phase)} (${Math.round(env.moonIllum.fraction * 100)}%), ${env.moon.alt.toFixed(0)}°
licht     ${env.dayLight.toFixed(2)}   scherm ${Math.round(env.brightness * 100)}%
modus     ${brain.mode}${brain.busy ? ' (bezig)' : ''}
actie     ${brain.current ? brain.current.name : '–'}
eerder    ${brain.history.slice(1).join(', ')}
energie   ${bar(n.energy)}
honger    ${bar(n.hunger)}
verveling ${bar(n.boredom)}
nieuwsgier${bar(n.curiosity)}
fps       ${fps}

toetsen: 1 rondkijken  2 kopdraai  3 poetsen  4 rekken
         5 oehoe  6 jagen  7 schudden  8 gapen  9 bijna vallen
         0 kopschuin  h hupjes  m muisje  z slapen
         t +1 uur  T -1 uur  [ ] trager/sneller`;
  }

  addEventListener('keydown', (e) => {
    const map = { 1: 'rondkijken', 2: 'kopdraai', 3: 'poetsen', 4: 'rekken', 5: 'oehoe', 6: 'jagen', 7: 'schudden', 8: 'gapen', 9: 'bijnaVallen', 0: 'kopschuin', h: 'verschuiven', z: 'inslapen' };
    if (e.key === 'd') showDebug = !showDebug;
    else if (e.key === 'm') { brain.mouse = null; brain.busy = false; brain.spawnMouse(); }
    else if (e.key === 't') jump(1);
    else if (e.key === 'T') jump(-1);
    else if (e.key === ']') setSpeed(speed >= 1 ? Math.min(speed * 4, 4096) : 1);
    else if (e.key === '[') setSpeed(speed > 1 ? Math.max(1, speed / 4) : 1);
    else if (map[e.key]) brain.force(map[e.key]);
  });

  // ---------- lus ----------
  let last = performance.now(), lastSim = simNow(), mouseTimer = 0;
  function frame(now) {
    requestAnimationFrame(frame);
    const minDt = 1000 / (CFG.maxFps || 30);
    if (now - last < minDt - 2) return;
    const dt = Math.min(0.1, (now - last) / 1000); last = now;
    fpsAcc += dt; fpsN++; if (fpsAcc > 1) { fps = Math.round(fpsN / fpsAcc); fpsAcc = 0; fpsN = 0; }

    const date = simNow();
    const simHours = Math.max(0, (date - lastSim) / 3600000); lastSim = date;
    const { lat, lon } = CFG.locatie;
    const sun = Astro.sunPosition(date, lat, lon);
    const moon = Astro.moonPosition(date, lat, lon);
    const moonIllum = Astro.moonIllumination(date);
    const dayKey = date.toDateString();
    if (dayKey !== lastTimesDay) { times = Astro.sunTimes(date, lat, lon); lastTimesDay = dayKey; }
    const dayLight = smooth(-7, 10, sun.alt);
    const nightness = 1 - smooth(-8, 2, sun.alt);
    const brightness = U.lerp(CFG.helderheid.nacht, CFG.helderheid.dag, smooth(-8, 4, sun.alt));
    const t = now / 1000;
    const env = { date, sun, moon, moonIllum, dayLight, nightness, brightness, time: t, sunAlt: sun.alt };

    // zeldzame verrassing
    mouseTimer += dt;
    if (mouseTimer > 10) { mouseTimer = 0; if (Math.random() < 10 / (60 * (CFG.muisjeElkeMinuten || 40))) brain.spawnMouse(); }

    brain.update(dt, simHours, env);
    rig.update(dt);

    // --- tekenen ---
    const L = room.layout;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    let driftX = 0, driftY = 0;
    if (CFG.inbrandBescherming) { driftX = Math.sin(t / 97) * 9; driftY = Math.sin(t / 131) * 6; }
    const zoom = (tx) => { tx.translate(W / 2 + driftX, H / 2 + driftY); tx.scale(1.025, 1.025); tx.translate(-W / 2, -H / 2); };
    zoom(ctx);

    // 1) zolder, verduisterd naar het daglicht
    ctx.drawImage(room.canvas, 0, 0, W, H);
    ctx.save(); ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = `rgba(8,10,28,${0.72 * (1 - dayLight)})`;
    ctx.fillRect(-20, -20, W + 40, H + 40);
    ctx.restore();
    // 2) lucht achter het raamgat
    skyCtx.setTransform(1, 0, 0, 1, 0, 0);
    skyCtx.clearRect(0, 0, skyCanvas.width, skyCanvas.height);
    skyCtx.setTransform(scale, 0, 0, scale, 0, 0); zoom(skyCtx);
    UilScene.drawSky(skyCtx, L, env);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'destination-over';
    ctx.drawImage(skyCanvas, 0, 0);
    ctx.restore();
    UilScene.drawGlass(ctx, L, env);
    const lit = 1 - smooth(-6, 3, sun.alt);
    UilScene.drawLantern(ctx, L, t, lit);

    // 3) uil (+ muisje) apart, iets minder verduisterd, zodat je hem altijd ziet
    const S = (H * (CFG.uilGrootte || 0.46)) / 400;
    const owlPos = { x: W / 2, y: L.beamY + 4 };
    octx.setTransform(1, 0, 0, 1, 0, 0);
    octx.clearRect(0, 0, owlCanvas.width, owlCanvas.height);
    octx.setTransform(scale, 0, 0, scale, 0, 0);
    zoom(octx);
    const bubbleR = snoreBubble(dt);
    UilOwl.drawOwl(octx, rig, owlPos, S, t, { snoreBubble: bubbleR });
    if (brain.mouse) UilOwl.drawRunningMouse(octx, brain.mouse.x, L.beamY + 2, brain.mouse.dir, t);
    octx.setTransform(1, 0, 0, 1, 0, 0);
    octx.globalCompositeOperation = 'source-atop';
    octx.fillStyle = `rgba(10,12,32,${0.42 * (1 - dayLight)})`;
    octx.fillRect(0, 0, owlCanvas.width, owlCanvas.height);
    octx.globalCompositeOperation = 'source-over';
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(owlCanvas, 0, 0);
    ctx.restore();

    // 4) warm licht van het lantaarntje
    UilScene.lanternGlow(ctx, L, t, lit);

    // 5) deeltjes en tekstballon
    updateParticles(dt, { x: owlPos.x + rig.p.x, y: owlPos.y + rig.p.headY }, S);
    drawParticles(ctx, dayLight < 0.5);
    if (brain.bubble && rig.visible) {
      drawBubble(ctx, brain.bubble, owlPos.x + rig.p.x + rig.p.flyX + 95 * S, owlPos.y + rig.p.flyY - 400 * S);
    }

    // 6) dimmen voor de nacht
    if (env.brightness < 1) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = `rgba(0,0,0,${1 - env.brightness})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    dbgTimer -= dt;
    if (dbgTimer <= 0) { dbgTimer = 0.25; updateDebug(env); }
  }
  requestAnimationFrame(frame);

  // Voor testen vanuit de console
  window.uil = { brain, rig, setSpeed, jump, simNow };
})();
