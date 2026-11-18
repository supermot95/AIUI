// De zolder: houten wand, balk, raampje met de echte lucht, lantaarntje.
(function () {
  const U = (window.UilUtil = window.UilUtil || {});

  // ---------- kleine hulpjes ----------
  U.clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  U.lerp = (a, b, t) => a + (b - a) * t;
  U.smooth = (a, b, v) => { const t = U.clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
  U.rand = (a, b) => a + Math.random() * (b - a);
  U.pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  // Vast "toeval", zodat het hout er elke keer hetzelfde uitziet.
  U.seeded = (seed) => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  U.mix = (a, b, t) => {
    const A = hex(a), B = hex(b);
    return `rgb(${A.map((v, i) => Math.round(U.lerp(v, B[i], t))).join(',')})`;
  };

  // ---------- layout ----------
  // Alles wordt getekend in een wereld van 1000 eenheden hoog; de breedte
  // volgt de beeldverhouding van het scherm.
  function layout(W, H) {
    if (W < H) { // staand scherm: uil schermvullend, raampje rechtsboven in de hoek
      const w = W * 0.3;
      const win = { cx: W * 0.79, cy: 0, w, h: w * 1.12 };
      win.x = win.cx - w / 2; win.y = 22; win.cy = win.y + win.h / 2;
      return {
        W, H, portrait: true,
        beamY: H * 0.9, beamH: 70,
        win,
        postL: W * 0.03, postR: W * 0.97, postW: 44,
        lantern: { x: W * 0.13, y: H * 0.13 },
      };
    }
    const win = { cx: W * 0.79, cy: H * 0.3, w: Math.min(290, W * 0.17), h: 330 };
    win.x = win.cx - win.w / 2; win.y = win.cy - win.h / 2;
    return {
      W, H,
      beamY: H * 0.72, beamH: 74,
      win,
      postL: W * 0.055, postR: W * 0.945, postW: 74,
      lantern: { x: W * 0.13, y: H * 0.4 },
    };
  }

  function windowPath(ctx, win, inset = 0) {
    const x = win.x + inset, y = win.y + inset, w = win.w - inset * 2, h = win.h - inset * 2;
    const r = w / 2;
    ctx.beginPath();
    ctx.moveTo(x, y + h);
    ctx.lineTo(x, y + r);
    ctx.arc(x + r, y + r, r, Math.PI, 0);
    ctx.lineTo(x + w, y + h);
    ctx.closePath();
  }

  function woodGrain(ctx, rnd, x, y, w, h, vertical, alpha) {
    ctx.save();
    ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    ctx.lineWidth = 1.4;
    const n = Math.floor((vertical ? w : h) / 7);
    for (let i = 0; i < n; i++) {
      ctx.strokeStyle = `rgba(20,10,4,${alpha * (0.4 + rnd() * 0.6)})`;
      ctx.beginPath();
      const off = (vertical ? x : y) + rnd() * (vertical ? w : h);
      const len = vertical ? h : w;
      const wav = 2 + rnd() * 5, freq = 0.004 + rnd() * 0.01, ph = rnd() * 6;
      for (let s = 0; s <= len; s += 12) {
        const o = off + Math.sin(s * freq + ph) * wav;
        if (vertical) (s ? ctx.lineTo(o, y + s) : ctx.moveTo(o, y + s));
        else (s ? ctx.lineTo(x + s, o) : ctx.moveTo(x + s, o));
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  function knot(ctx, x, y, r) {
    ctx.save();
    ctx.translate(x, y);
    for (let i = 3; i >= 1; i--) {
      ctx.strokeStyle = `rgba(25,12,5,${0.25 + 0.15 * i})`;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(0, 0, r * i * 0.6, r * i * 0.35, 0, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.fillStyle = 'rgba(30,15,6,0.7)';
    ctx.beginPath(); ctx.ellipse(0, 0, r * 0.4, r * 0.25, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  // De vaste zolder, één keer getekend in een offscreen canvas (met een gat
  // waar het raam zit; de lucht wordt daar elk beeld achter geschilderd).
  function renderRoom(W, H, scale) {
    const L = layout(W, H);
    const c = document.createElement('canvas');
    c.width = Math.ceil(W * scale); c.height = Math.ceil(H * scale);
    const ctx = c.getContext('2d');
    ctx.scale(scale, scale);
    const rnd = U.seeded(42);

    // Planken
    const plankW = 88;
    for (let x = 0, i = 0; x < W; x += plankW, i++) {
      const base = ['#3e2718', '#45301e', '#3a2416', '#422b1a'][i % 4];
      const g = ctx.createLinearGradient(x, 0, x + plankW, 0);
      g.addColorStop(0, base); g.addColorStop(0.5, U.mix(base, '#5a3d27', 0.25)); g.addColorStop(1, base);
      ctx.fillStyle = g; ctx.fillRect(x, 0, plankW, H);
      woodGrain(ctx, rnd, x, 0, plankW, H, true, 0.35);
      ctx.fillStyle = 'rgba(12,6,2,0.85)'; ctx.fillRect(x, 0, 3, H); // naad
      if (rnd() < 0.6) knot(ctx, x + 20 + rnd() * (plankW - 40), rnd() * H, 6 + rnd() * 6);
      // spijkertjes
      ctx.fillStyle = 'rgba(30,25,20,0.9)';
      for (const ny of [H * 0.12, H * 0.9]) { ctx.beginPath(); ctx.arc(x + 14, ny, 3, 0, 7); ctx.fill(); }
    }

    // Zachte vignettering (prentenboekgevoel)
    const vg = ctx.createRadialGradient(W / 2, H * 0.55, H * 0.2, W / 2, H * 0.55, Math.max(W, H) * 0.75);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(8,4,2,0.55)');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);

    // Bovenste gording (horizontale balk)
    const pY = 40, pH = 56;
    ctx.fillStyle = '#5b3c25'; ctx.fillRect(0, pY, W, pH);
    woodGrain(ctx, rnd, 0, pY, W, pH, false, 0.4);
    ctx.fillStyle = 'rgba(255,220,170,0.08)'; ctx.fillRect(0, pY, W, 6);
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(0, pY + pH, W, 14);

    // Raam: kozijn en dan het gat
    const win = L.win;
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 25;
    ctx.fillStyle = '#6b4a2e';
    windowPath(ctx, win, -22); ctx.fill();
    ctx.restore();
    woodGrain(ctx, rnd, win.x - 22, win.y - 22, win.w + 44, win.h + 44, true, 0.25);
    ctx.fillStyle = '#7a5636'; // vensterbank
    ctx.fillRect(win.x - 40, win.y + win.h + 8, win.w + 80, 22);
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(win.x - 40, win.y + win.h + 30, win.w + 80, 8);
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = '#000';
    windowPath(ctx, win); ctx.fill();
    ctx.restore();

    // Staanders links en rechts
    for (const px of [L.postL, L.postR]) {
      const x = px - L.postW / 2;
      const g = ctx.createLinearGradient(x, 0, x + L.postW, 0);
      g.addColorStop(0, '#4a311e'); g.addColorStop(0.4, '#65452b'); g.addColorStop(1, '#3d2716');
      ctx.fillStyle = g; ctx.fillRect(x, 0, L.postW, H);
      woodGrain(ctx, rnd, x, 0, L.postW, H, true, 0.35);
      ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(x + L.postW, 0, 12, H);
    }

    // Spinnenweb in de hoek linksboven
    ctx.save();
    ctx.strokeStyle = 'rgba(230,225,215,0.22)'; ctx.lineWidth = 1.2;
    const wx = L.postL + L.postW / 2, wy = pY + pH, webR = L.portrait ? 100 : 150;
    for (let a = 0; a <= 6; a++) {
      const ang = (a / 6) * Math.PI / 2;
      ctx.beginPath(); ctx.moveTo(wx, wy); ctx.lineTo(wx + Math.cos(ang) * webR, wy + Math.sin(ang) * webR); ctx.stroke();
    }
    for (let r = 25; r <= webR; r += 25) {
      ctx.beginPath();
      for (let a = 0; a <= 6; a++) {
        const ang = (a / 6) * Math.PI / 2, rr = r - (a % 2 ? 4 : 0);
        const px = wx + Math.cos(ang) * rr, py = wy + Math.sin(ang) * rr;
        a ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
      }
      ctx.stroke();
    }
    ctx.restore();

    // Spijker voor het lantaarntje
    ctx.fillStyle = '#2a2420';
    ctx.beginPath(); ctx.arc(L.lantern.x, L.lantern.y - 95, 5, 0, 7); ctx.fill();

    // Schaduw van de balk op de wand
    const sg = ctx.createLinearGradient(0, L.beamY + L.beamH, 0, L.beamY + L.beamH + 90);
    sg.addColorStop(0, 'rgba(0,0,0,0.55)'); sg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = sg; ctx.fillRect(0, L.beamY + L.beamH, W, 90);

    // De balk waar de uil op zit
    const bg = ctx.createLinearGradient(0, L.beamY, 0, L.beamY + L.beamH);
    bg.addColorStop(0, '#8a6240'); bg.addColorStop(0.15, '#76512f'); bg.addColorStop(1, '#4b311c');
    ctx.fillStyle = bg; ctx.fillRect(0, L.beamY, W, L.beamH);
    woodGrain(ctx, rnd, 0, L.beamY, W, L.beamH, false, 0.45);
    ctx.fillStyle = 'rgba(255,225,180,0.18)'; ctx.fillRect(0, L.beamY, W, 4);
    for (let i = 0; i < W / 300; i++) knot(ctx, rnd() * W, L.beamY + 20 + rnd() * 35, 7);
    // krasjes van uilenklauwen in het midden
    ctx.strokeStyle = 'rgba(30,15,5,0.5)'; ctx.lineWidth = 1.5;
    for (let i = 0; i < 14; i++) {
      const x = W / 2 + (rnd() - 0.5) * 260, y = L.beamY + 4 + rnd() * 14;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 3 + rnd() * 5, y + 6 + rnd() * 8); ctx.stroke();
    }

    // Donkere vloer/schaduw onderaan
    const fg = ctx.createLinearGradient(0, H * 0.86, 0, H);
    fg.addColorStop(0, 'rgba(0,0,0,0)'); fg.addColorStop(1, 'rgba(0,0,0,0.6)');
    ctx.fillStyle = fg; ctx.fillRect(0, H * 0.86, W, H * 0.14);

    return { canvas: c, layout: L };
  }

  // ---------- de lucht ----------
  const SKY = [ // [zonshoogte, kleur boven, kleur horizon]
    [-18, '#070b1f', '#121a3a'],
    [-10, '#0e1636', '#2b2a55'],
    [-5, '#22305f', '#8a4f5e'],
    [-1, '#3d5b93', '#e5875a'],
    [4, '#5288c6', '#f2c48e'],
    [12, '#4a8fd8', '#bcdcf2'],
    [40, '#3b80d4', '#a6d1f2'],
  ];
  function skyColors(alt) {
    if (alt <= SKY[0][0]) return [SKY[0][1], SKY[0][2]];
    for (let i = 1; i < SKY.length; i++) {
      if (alt <= SKY[i][0]) {
        const t = (alt - SKY[i - 1][0]) / (SKY[i][0] - SKY[i - 1][0]);
        return [U.mix(SKY[i - 1][1], SKY[i][1], t), U.mix(SKY[i - 1][2], SKY[i][2], t)];
      }
    }
    const l = SKY[SKY.length - 1]; return [l[1], l[2]];
  }

  const starRnd = U.seeded(7);
  const STARS = Array.from({ length: 70 }, () => ({ x: starRnd(), y: starRnd(), r: 0.6 + starRnd() * 1.4, p: starRnd() * 6 }));
  const roofRnd = U.seeded(99);
  const HOUSES = (() => { // silhouet van Hollandse geveltjes
    const out = []; let x = -0.05;
    while (x < 1.05) {
      const w = 0.12 + roofRnd() * 0.12;
      out.push({ x, w, h: 0.1 + roofRnd() * 0.12, type: Math.floor(roofRnd() * 3), lit: roofRnd(), lit2: roofRnd() });
      x += w + 0.005;
    }
    return out;
  })();

  // Kijkrichting van het raam: het zuiden, met ±75° gezichtsveld.
  function skyToWindow(win, az, alt) {
    // Een beetje kunstzinnige vrijheid: de hemel wordt samengedrukt zodat zon
    // en maan meestal in het raampje passen.
    const horizon = win.y + win.h * 0.86;
    return {
      x: win.cx + Math.tanh(az / 70) * (win.w / 2) * 0.85,
      y: horizon - (1 - Math.exp(-Math.max(alt, -10) / 22)) * (horizon - win.y - 45),
    };
  }

  function drawMoon(ctx, x, y, r, phase, glow) {
    if (glow > 0) {
      const g = ctx.createRadialGradient(x, y, r, x, y, r * 4);
      g.addColorStop(0, `rgba(220,230,255,${0.35 * glow})`); g.addColorStop(1, 'rgba(220,230,255,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 4, 0, 7); ctx.fill();
    }
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = 'rgba(40,48,80,0.55)'; // donkere kant, nét zichtbaar
    ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill();
    if (phase > 0.5) ctx.scale(-1, 1); // afnemend: licht links (noordelijk halfrond)
    const k = Math.cos(phase * 2 * Math.PI); // 1 = nieuw, -1 = vol
    ctx.fillStyle = '#f4f1dc';
    ctx.beginPath();
    ctx.arc(0, 0, r, -Math.PI / 2, Math.PI / 2, false);
    ctx.ellipse(0, 0, Math.abs(k) * r, r, 0, Math.PI / 2, -Math.PI / 2, k > 0);
    ctx.fill();
    ctx.restore();
    // kratertjes
    ctx.fillStyle = 'rgba(150,145,120,0.25)';
    for (const [dx, dy, rr] of [[-0.3, -0.2, 0.18], [0.25, 0.3, 0.13], [0.1, -0.4, 0.1]]) {
      ctx.beginPath(); ctx.arc(x + dx * r, y + dy * r, rr * r, 0, 7); ctx.fill();
    }
  }

  // Tekent de lucht + huizen in het raam. env: {sun, moon, moonIllum, time}
  function drawSky(ctx, L, env) {
    const win = L.win;
    ctx.save();
    windowPath(ctx, win); ctx.clip();
    const [top, bot] = skyColors(env.sun.alt);
    const g = ctx.createLinearGradient(0, win.y, 0, win.y + win.h);
    g.addColorStop(0, top); g.addColorStop(1, bot);
    ctx.fillStyle = g; ctx.fillRect(win.x, win.y, win.w, win.h);

    // Sterren
    const starA = U.smooth(-5, -14, env.sun.alt);
    if (starA > 0) {
      for (const s of STARS) {
        const tw = 0.6 + 0.4 * Math.sin(env.time * 1.3 + s.p * 5);
        ctx.fillStyle = `rgba(255,255,240,${starA * tw})`;
        ctx.beginPath(); ctx.arc(win.x + s.x * win.w, win.y + s.y * win.h * 0.8, s.r, 0, 7); ctx.fill();
      }
    }

    // Zon
    if (env.sun.alt > -4) {
      const p = skyToWindow(win, env.sun.az, env.sun.alt);
      const sg = ctx.createRadialGradient(p.x, p.y, 10, p.x, p.y, 90);
      sg.addColorStop(0, 'rgba(255,240,190,0.8)'); sg.addColorStop(1, 'rgba(255,220,150,0)');
      ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(p.x, p.y, 90, 0, 7); ctx.fill();
      ctx.fillStyle = env.sun.alt < 5 ? '#ffc27a' : '#fff3c4';
      ctx.beginPath(); ctx.arc(p.x, p.y, 20, 0, 7); ctx.fill();
    }

    // Maan
    if (env.moon.alt > -4) {
      const p = skyToWindow(win, env.moon.az, env.moon.alt);
      drawMoon(ctx, p.x, p.y, 19, env.moonIllum.phase, U.smooth(0, -8, env.sun.alt) * env.moonIllum.fraction);
    }

    // Wolkjes (drijven langzaam voorbij; echt weer komt in fase 2)
    const dayL = U.smooth(-8, 8, env.sun.alt);
    ctx.fillStyle = `rgba(${Math.round(U.lerp(70, 255, dayL))},${Math.round(U.lerp(75, 250, dayL))},${Math.round(U.lerp(110, 245, dayL))},${U.lerp(0.35, 0.75, dayL)})`;
    for (let i = 0; i < 3; i++) {
      const speed = 4 + i * 2;
      const span = win.w + 260;
      const cx = win.x - 130 + ((env.time * speed + i * 170) % span);
      const cy = win.y + win.h * (0.25 + i * 0.17);
      for (const [dx, dy, r] of [[0, 0, 24], [26, -10, 28], [54, 0, 22], [28, 8, 22]]) {
        ctx.beginPath(); ctx.arc(cx + dx, cy + dy, r, 0, 7); ctx.fill();
      }
    }

    // Daken in de verte
    const base = win.y + win.h;
    const roofCol = U.mix('#0b0c18', '#4a4e5e', dayL);
    for (const hse of HOUSES) {
      const x = win.x + hse.x * win.w, w = hse.w * win.w, h = hse.h * win.h + win.h * 0.06;
      ctx.fillStyle = roofCol;
      ctx.beginPath();
      ctx.moveTo(x, base);
      ctx.lineTo(x, base - h);
      if (hse.type === 0) { ctx.lineTo(x + w / 2, base - h - w * 0.5); }           // puntgevel
      else if (hse.type === 1) {                                                   // trapgevel
        const st = w / 6;
        for (let i = 0; i < 3; i++) { ctx.lineTo(x + st * i, base - h - st * (i + 1)); ctx.lineTo(x + st * (i + 1), base - h - st * (i + 1)); }
        for (let i = 2; i >= 0; i--) { ctx.lineTo(x + w - st * (i + 1), base - h - st * (i + 1)); ctx.lineTo(x + w - st * i, base - h - st * i); }
      } else { ctx.lineTo(x + w * 0.3, base - h - w * 0.35); ctx.lineTo(x + w * 0.7, base - h - w * 0.35); } // klokgevel-ish
      ctx.lineTo(x + w, base - h);
      ctx.lineTo(x + w, base);
      ctx.fill();
      // verlichte ramen 's avonds
      const nightness = 1 - dayL;
      if (nightness > 0.3) {
        for (const [fx, fy, l] of [[0.25, 0.4, hse.lit], [0.6, 0.4, hse.lit2], [0.42, 0.7, (hse.lit + hse.lit2) / 2]]) {
          if (l > 0.45) {
            ctx.fillStyle = `rgba(255,205,110,${0.85 * nightness})`;
            ctx.fillRect(x + w * fx, base - h * (1 - fy) - 4, 7, 9);
          }
        }
      }
    }
    ctx.restore();
  }

  // Glimmen op het glas en de raamroeden, over de lucht heen.
  function drawGlass(ctx, L, env) {
    const win = L.win;
    ctx.save();
    windowPath(ctx, win); ctx.clip();
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.beginPath();
    ctx.moveTo(win.x + win.w * 0.15, win.y + win.h); ctx.lineTo(win.x + win.w * 0.45, win.y);
    ctx.lineTo(win.x + win.w * 0.6, win.y); ctx.lineTo(win.x + win.w * 0.3, win.y + win.h); ctx.fill();
    ctx.restore();
    // roeden
    const dark = 1 - U.smooth(-8, 8, env.sun.alt) * 0.6;
    ctx.fillStyle = U.mix('#7a5636', '#2c1d12', dark * 0.6);
    ctx.fillRect(win.cx - 6, win.y + 6, 12, win.h - 6);
    ctx.fillRect(win.x, win.y + win.h * 0.55, win.w, 12);
  }

  // Lantaarntje aan de spijker (brandt als het donker is).
  function drawLantern(ctx, L, time, lit) {
    const { x, y } = L.lantern;
    const sway = Math.sin(time * 0.7) * 0.03;
    ctx.save();
    ctx.translate(x, y - 95); ctx.rotate(sway); ctx.translate(-x, -(y - 95));
    ctx.strokeStyle = '#1e1a17'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x, y - 95); ctx.lineTo(x, y - 52); ctx.stroke();
    ctx.beginPath(); ctx.arc(x, y - 47, 9, 0, 7); ctx.stroke(); // ringetje
    // glas
    const flick = 0.85 + 0.15 * Math.sin(time * 9) * Math.sin(time * 4.3);
    ctx.fillStyle = lit > 0 ? `rgba(255,${Math.round(180 + 40 * flick)},90,${0.25 + 0.7 * lit * flick})` : 'rgba(90,90,100,0.35)';
    ctx.fillRect(x - 20, y - 34, 40, 52);
    if (lit > 0) { // vlammetje
      ctx.fillStyle = `rgba(255,240,180,${lit})`;
      ctx.beginPath(); ctx.ellipse(x, y - 2, 5, 11 * flick, 0, 0, 7); ctx.fill();
    }
    ctx.fillStyle = '#25201c';
    ctx.beginPath(); ctx.moveTo(x - 26, y - 34); ctx.lineTo(x, y - 52); ctx.lineTo(x + 26, y - 34); ctx.fill();
    ctx.fillRect(x - 24, y + 18, 48, 8);
    ctx.fillRect(x - 22, y - 34, 4, 52); ctx.fillRect(x + 18, y - 34, 4, 52);
    ctx.restore();
  }

  function lanternGlow(ctx, L, time, lit) {
    if (lit <= 0) return;
    const { x, y } = L.lantern;
    const flick = 0.9 + 0.1 * Math.sin(time * 9) * Math.sin(time * 4.3);
    const R = 620 * flick;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(x, y, 10, x, y, R);
    g.addColorStop(0, `rgba(255,170,70,${0.5 * lit})`);
    g.addColorStop(0.4, `rgba(200,110,40,${0.18 * lit})`);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(x - R, y - R, R * 2, R * 2);
    ctx.restore();
  }

  window.UilScene = { renderRoom, drawSky, drawGlass, drawLantern, lanternGlow, windowPath };
})();
