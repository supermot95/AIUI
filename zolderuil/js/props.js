// Feestspullen: dingen op de balk, vlaggetjes, kerstlampjes, en extra's in het raam.
(function () {
  const U = window.UilUtil;
  const TAU = Math.PI * 2;

  // ---------- losse spullen (oorsprong = onderkant midden, op de balk) ----------
  const DRAW = {
    schoen(ctx) { // gele klomp met een wortel voor het paard
      ctx.save(); ctx.rotate(-0.05);
      // wortel
      ctx.fillStyle = '#4f9a3a';
      for (const a of [-0.5, -0.2, 0.15]) {
        ctx.save(); ctx.translate(-14, -98); ctx.rotate(a);
        ctx.beginPath(); ctx.ellipse(0, -14, 5, 16, 0, 0, TAU); ctx.fill(); ctx.restore();
      }
      ctx.fillStyle = '#ef7d22';
      ctx.beginPath(); ctx.moveTo(-26, -40); ctx.lineTo(-14, -100); ctx.lineTo(-2, -40); ctx.fill();
      ctx.strokeStyle = 'rgba(120,50,0,0.5)'; ctx.lineWidth = 1.5;
      for (const y of [-55, -68, -82]) { ctx.beginPath(); ctx.moveTo(-20, y); ctx.lineTo(-11, y + 2); ctx.stroke(); }
      // klomp
      const g = ctx.createLinearGradient(0, -50, 0, 0);
      g.addColorStop(0, '#f7d257'); g.addColorStop(1, '#d9a82a');
      ctx.fillStyle = g; ctx.strokeStyle = '#8a6514'; ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-52, -2);
      ctx.quadraticCurveTo(-58, -40, -44, -50);
      ctx.lineTo(-10, -44);
      ctx.quadraticCurveTo(30, -42, 50, -28);
      ctx.quadraticCurveTo(66, -18, 58, -6);
      ctx.quadraticCurveTo(50, 2, 30, 0);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#5a3d10';
      ctx.beginPath(); ctx.ellipse(-27, -46, 18, 5, 0.05, 0, TAU); ctx.fill();
      // geschilderd bloemetje
      ctx.fillStyle = '#d23b2f';
      for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(14 + Math.cos(i * 1.26) * 6, -22 + Math.sin(i * 1.26) * 6, 4, 0, TAU); ctx.fill(); }
      ctx.fillStyle = '#2f62b8'; ctx.beginPath(); ctx.arc(14, -22, 3.5, 0, TAU); ctx.fill();
      ctx.restore();
    },

    pompoen(ctx, t, dark) {
      ctx.fillStyle = '#4b6b2a'; ctx.fillRect(-5, -82, 10, 18);
      for (const [dx, rx] of [[-26, 26], [26, 26], [0, 30]]) {
        const g = ctx.createRadialGradient(dx - 8, -50, 5, dx, -38, 45);
        g.addColorStop(0, '#ffa53d'); g.addColorStop(1, '#d9661a');
        ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(dx, -36, rx, 36, 0, 0, TAU); ctx.fill();
        ctx.strokeStyle = 'rgba(120,50,0,0.4)'; ctx.lineWidth = 2; ctx.stroke();
      }
      const fl = 0.8 + 0.2 * Math.sin(t * 11) * Math.sin(t * 5.3);
      ctx.fillStyle = dark > 0.3 ? `rgba(255,${200 + 40 * fl},90,1)` : '#5a2a08';
      ctx.beginPath(); ctx.moveTo(-24, -50); ctx.lineTo(-12, -50); ctx.lineTo(-18, -62); ctx.fill();
      ctx.beginPath(); ctx.moveTo(24, -50); ctx.lineTo(12, -50); ctx.lineTo(18, -62); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-26, -30);
      for (let i = 0; i <= 6; i++) ctx.lineTo(-26 + i * 8.6, i % 2 ? -22 : -32);
      ctx.lineTo(26, -26); ctx.quadraticCurveTo(0, -6, -26, -26); ctx.fill();
    },

    oliebol(ctx) {
      ctx.fillStyle = '#f4f2ee'; ctx.strokeStyle = '#b9b5ad'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(0, -5, 58, 10, 0, 0, TAU); ctx.fill(); ctx.stroke();
      for (const [dx, dy, r] of [[-20, -30, 26], [22, -28, 24], [0, -58, 24]]) {
        const g = ctx.createRadialGradient(dx - 8, dy - 8, 4, dx, dy, r);
        g.addColorStop(0, '#c98a45'); g.addColorStop(1, '#8a5524');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(dx, dy, r, 0, TAU); ctx.fill();
        ctx.fillStyle = '#3a1d0e';
        for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(dx + Math.cos(i * 2.1 + dx) * r * 0.55, dy + Math.sin(i * 2.1 + dx) * r * 0.5, 2.6, 0, TAU); ctx.fill(); }
        ctx.fillStyle = 'rgba(255,255,255,0.85)'; // poedersuiker
        for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.arc(dx + Math.cos(i * 1.7 + dy) * r * 0.6, dy - r * 0.35 + Math.sin(i * 2.3) * r * 0.25, 2.2, 0, TAU); ctx.fill(); }
      }
    },

    paasei(ctx) {
      ctx.strokeStyle = '#8a6a3a'; ctx.lineWidth = 3;
      for (let i = 0; i < 10; i++) { ctx.beginPath(); ctx.ellipse(0, -12, 46 - i % 3 * 4, 14, (i - 5) * 0.06, 0, Math.PI); ctx.stroke(); }
      ctx.save();
      ctx.beginPath(); ctx.ellipse(0, -48, 30, 40, 0, 0, TAU); ctx.clip();
      ctx.fillStyle = '#8fd0f0'; ctx.fillRect(-35, -95, 70, 100);
      ctx.fillStyle = '#f07aa8'; ctx.fillRect(-35, -60, 70, 14);
      ctx.strokeStyle = '#f7e05a'; ctx.lineWidth = 5; ctx.beginPath();
      for (let x = -35; x <= 35; x += 10) ctx.lineTo(x, x % 20 ? -34 : -24); ctx.stroke();
      ctx.fillStyle = '#ffffff'; for (const x of [-15, 0, 15]) { ctx.beginPath(); ctx.arc(x, -75, 4, 0, TAU); ctx.fill(); }
      ctx.restore();
      ctx.fillStyle = '#8a6a3a'; ctx.beginPath(); ctx.ellipse(0, -10, 42, 12, 0, 0, Math.PI); ctx.fill();
    },

    koffie(ctx, t) {
      ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 3; ctx.lineCap = 'round';
      for (const dx of [-10, 6]) {
        ctx.beginPath();
        for (let i = 0; i <= 10; i++) {
          const y = -70 - i * 6, x = dx + Math.sin(t * 2 + i * 0.6 + dx) * 6;
          i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        }
        ctx.stroke();
      }
      ctx.lineWidth = 8; ctx.strokeStyle = '#c8402f';
      ctx.beginPath(); ctx.arc(30, -36, 16, -1.2, 1.2); ctx.stroke();
      ctx.fillStyle = '#c8402f'; ctx.fillRect(-30, -68, 60, 66);
      ctx.fillStyle = '#5a3018'; ctx.beginPath(); ctx.ellipse(0, -68, 30, 7, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('MAANDAG', 0, -34); ctx.font = '16px sans-serif'; ctx.fillText('☹', 0, -14);
      ctx.textAlign = 'start';
    },

    lampion(ctx, t, dark) {
      const sw = Math.sin(t * 1.3) * 0.06;
      ctx.strokeStyle = '#6b4a2a'; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -230); ctx.quadraticCurveTo(10, -250, 40, -250); ctx.stroke();
      ctx.save(); ctx.translate(40, -250); ctx.rotate(sw);
      ctx.strokeStyle = '#222'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 22); ctx.stroke();
      const g = ctx.createRadialGradient(0, 55, 5, 0, 55, 40);
      g.addColorStop(0, dark > 0.3 ? '#ffe9a0' : '#ffb347'); g.addColorStop(1, '#e8641c');
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 55, 36, 34, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = 'rgba(150,50,10,0.6)'; ctx.lineWidth = 1.5;
      for (const rx of [12, 24]) { ctx.beginPath(); ctx.ellipse(0, 55, rx, 34, 0, 0, TAU); ctx.stroke(); }
      ctx.fillStyle = '#7a2a10'; ctx.fillRect(-14, 20, 28, 6); ctx.fillRect(-14, 86, 28, 6);
      // maantje erop
      ctx.fillStyle = 'rgba(255,250,210,0.9)'; ctx.beginPath(); ctx.arc(4, 52, 11, 0, TAU); ctx.fill();
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(9, 48, 10, 0, TAU); ctx.fill();
      ctx.restore();
    },
  };
  const GLOW = { pompoen: [0, -40, 140, '255,150,40'], lampion: [40, -195, 170, '255,160,60'] };
  const HEIGHT = { schoen: 100, pompoen: 82, oliebol: 82, paasei: 88, koffie: 130, lampion: 300 };

  // Waar staan de spullen? Om en om rechts en links naast de uil.
  function placements(kal, W, owlCx, S) {
    const list = [...kal.props].filter((p) => DRAW[p]);
    const portrait = W < 1000;
    const ps = portrait ? 0.85 : Math.min(1.25, S * 0.95);
    const off = portrait ? W / 2 - 56 : 115 * S + 70 * ps;
    return list.map((name, i) => ({
      name, ps,
      x: owlCx + (i % 2 === 0 ? 1 : -1) * (off + Math.floor(i / 2) * 120 * ps) * (name === 'lampion' ? 0.85 : 1),
    }));
  }

  function drawBeamProps(ctx, L, kal, owlCx, S, t, dark) {
    for (const p of placements(kal, L.W, owlCx, S)) {
      ctx.save(); ctx.translate(p.x, L.beamY + 8); ctx.scale(p.ps, p.ps);
      if (p.name !== 'lampion') { // schaduwtje
        ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(0, 2, 55, 8, 0, 0, TAU); ctx.fill();
      }
      DRAW[p.name](ctx, t, dark);
      ctx.restore();
    }
  }

  function glowAt(ctx, x, y, R, rgb, a) {
    const g = ctx.createRadialGradient(x, y, 2, x, y, R);
    g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(1, `rgba(${rgb},0)`);
    ctx.fillStyle = g; ctx.fillRect(x - R, y - R, R * 2, R * 2);
  }

  // ---------- kerstlampjes langs de balk ----------
  const BULB = ['#ff4a3d', '#ffd23d', '#47d16a', '#3da4ff', '#ff7ae0'];
  function bulbs(L) {
    const out = [], span = 160, y0 = L.beamY + 12, sag = 26;
    for (let x0 = -40; x0 < L.W + 40; x0 += span) {
      for (let i = 1; i <= 3; i++) {
        const f = i / 4, x = x0 + span * f, y = y0 + sag * 4 * f * (1 - f);
        out.push({ x, y, c: BULB[out.length % BULB.length], i: out.length });
      }
    }
    return out;
  }
  function drawLights(ctx, L, t) {
    const span = 160, y0 = L.beamY + 12, sag = 26;
    ctx.strokeStyle = '#1f2a1a'; ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let x0 = -40; x0 < L.W + 40; x0 += span) { ctx.moveTo(x0, y0); ctx.quadraticCurveTo(x0 + span / 2, y0 + sag * 2, x0 + span, y0); }
    ctx.stroke();
    for (const b of bulbs(L)) {
      const on = 0.55 + 0.45 * Math.sin(t * 1.7 + b.i * 2.4);
      ctx.fillStyle = '#2a2a2a'; ctx.fillRect(b.x - 4, b.y - 2, 8, 7);
      ctx.fillStyle = b.c; ctx.globalAlpha = 0.5 + 0.5 * on;
      ctx.beginPath(); ctx.ellipse(b.x, b.y + 13, 6.5, 10, 0, 0, TAU); ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  // ---------- vlaggetjesslinger ----------
  function drawBunting(ctx, L, slinger, t) {
    const x0 = L.postL + L.postW / 2, x1 = L.postR - L.postW / 2, y0 = L.portrait ? 30 : 100, sag = L.portrait ? 30 : 60;
    let letters = [...slinger.tekst];
    let fw = (x1 - x0 - 20) / letters.length;
    if (fw < 24) { letters = [...slinger.tekst.replace(/^HOERA /, '')]; fw = (x1 - x0 - 20) / letters.length; }
    fw = Math.min(fw, 70);
    const total = fw * letters.length, start = (x0 + x1) / 2 - total / 2;
    const yAt = (x) => { const f = (x - x0) / (x1 - x0); return y0 + sag * 4 * f * (1 - f); };
    ctx.strokeStyle = '#e8e0cf'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo((x0 + x1) / 2, y0 + sag * 2, x1, y0); ctx.stroke();
    letters.forEach((ch, i) => {
      const xa = start + i * fw + 2, xb = xa + fw - 4, xm = (xa + xb) / 2;
      const ya = yAt(xa), yb = yAt(xb), sway = Math.sin(t * 1.4 + i) * 2;
      const h = Math.min(fw * 1.15, 70);
      ctx.fillStyle = slinger.kleuren[i % slinger.kleuren.length];
      ctx.beginPath(); ctx.moveTo(xa, ya); ctx.lineTo(xb, yb); ctx.lineTo(xm + sway, (ya + yb) / 2 + h); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.2)'; ctx.lineWidth = 1; ctx.stroke();
      if (ch.trim()) {
        const bg = slinger.kleuren[i % slinger.kleuren.length];
        ctx.fillStyle = ['#ffffff', '#f2b632', '#c0c0c8', '#ff9a2e', '#d9b44a'].includes(bg) ? '#2b2018' : '#ffffff';
        ctx.font = `bold ${Math.round(Math.min(fw * 0.62, 30))}px "Comic Sans MS", "Chalkboard SE", sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(ch, xm + sway * 0.4, (ya + yb) / 2 + h * 0.45);
        ctx.textAlign = 'start';
      }
    });
  }

  // Alles wat op de "uil-laag" hoort (wordt mee verduisterd).
  function drawLayer(ctx, L, kal, owlCx, S, t, dark) {
    if (kal.slinger) drawBunting(ctx, L, kal.slinger, t);
    drawBeamProps(ctx, L, kal, owlCx, S, t, dark);
    if (kal.props.has('kerstlampjes')) drawLights(ctx, L, t);
  }

  // Gloed van lichtjes (na het verduisteren, met 'lighter').
  function drawGlows(ctx, L, kal, owlCx, S, t, dark) {
    if (dark < 0.15) return;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const fl = 0.85 + 0.15 * Math.sin(t * 9) * Math.sin(t * 4.1);
    for (const p of placements(kal, L.W, owlCx, S)) {
      const g = GLOW[p.name]; if (!g) continue;
      glowAt(ctx, p.x + g[0] * p.ps, L.beamY + 8 + g[1] * p.ps, g[2] * p.ps * fl, g[3], 0.45 * dark);
    }
    if (kal.props.has('kerstlampjes')) {
      for (const b of bulbs(L)) {
        const on = 0.55 + 0.45 * Math.sin(t * 1.7 + b.i * 2.4);
        const c = b.c, rgb = [1, 3, 5].map((k) => parseInt(c.slice(k, k + 2), 16)).join(',');
        glowAt(ctx, b.x, b.y + 13, 34, rgb, 0.35 * on * dark);
      }
    }
    ctx.restore();
  }

  // ---------- in het raam: vuurwerk en vleermuis ----------
  const hash = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  function drawWindowExtras(ctx, L, kal, t) {
    const win = L.win;
    if (kal.vuurwerk > 0) {
      for (let ch = 0; ch < 4; ch++) {
        const period = 2.1 + ch * 0.37, slot = Math.floor((t + ch * 0.9) / period);
        const seed = slot * 7 + ch * 1000;
        if (hash(seed) > kal.vuurwerk) continue;
        const prog = ((t + ch * 0.9) % period) / period;
        const x = win.x + win.w * (0.15 + 0.7 * hash(seed + 1)), y = win.y + win.h * (0.15 + 0.35 * hash(seed + 2));
        const hue = Math.floor(hash(seed + 3) * 360), base = win.y + win.h;
        if (prog < 0.25) { // opstijgende pijl
          const py = base - (base - y) * (prog / 0.25);
          ctx.fillStyle = `hsla(${hue},90%,80%,0.9)`; ctx.beginPath(); ctx.arc(x, py, 2.5, 0, TAU); ctx.fill();
        } else {
          const p = (prog - 0.25) / 0.75, r = 12 + 55 * (1 - Math.pow(1 - p, 3)), a = 1 - p;
          for (let i = 0; i < 18; i++) {
            const ang = (i / 18) * TAU;
            ctx.fillStyle = `hsla(${hue + (i % 3) * 20},95%,${65 + 15 * (i % 2)}%,${a})`;
            ctx.beginPath(); ctx.arc(x + Math.cos(ang) * r, y + Math.sin(ang) * r + p * p * 18, 2.6, 0, TAU); ctx.fill();
          }
          if (p < 0.15) { ctx.fillStyle = `rgba(255,255,230,${0.5 * (1 - p / 0.15)})`; ctx.beginPath(); ctx.arc(x, y, 30, 0, TAU); ctx.fill(); }
        }
      }
    }
    if (kal.vleermuis) {
      const span = win.w + 160, x = win.x - 80 + ((t * 45) % span), y = win.y + win.h * 0.35 + Math.sin(t * 2.2) * 25;
      const flap = Math.sin(t * 16);
      ctx.fillStyle = '#141018';
      ctx.beginPath(); ctx.ellipse(x, y, 7, 9, 0, 0, TAU); ctx.fill();
      for (const s of [-1, 1]) {
        ctx.beginPath(); ctx.moveTo(x, y - 2);
        ctx.quadraticCurveTo(x + s * 14, y - 12 - flap * 10, x + s * 26, y - 4 - flap * 12);
        ctx.quadraticCurveTo(x + s * 18, y + 2, x + s * 12, y + 4); ctx.quadraticCurveTo(x + s * 6, y + 2, x, y + 2); ctx.fill();
      }
      ctx.beginPath(); ctx.moveTo(x - 5, y - 7); ctx.lineTo(x - 3, y - 14); ctx.lineTo(x - 1, y - 8); ctx.fill();
      ctx.beginPath(); ctx.moveTo(x + 5, y - 7); ctx.lineTo(x + 3, y - 14); ctx.lineTo(x + 1, y - 8); ctx.fill();
    }
  }

  window.UilProps = { drawLayer, drawGlows, drawWindowExtras };
})();
