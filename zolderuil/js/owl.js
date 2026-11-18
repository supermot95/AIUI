// De uil: een "rig" van losse onderdelen die soepel naar hun doelwaarde
// bewegen, plus de tekencode. Coördinaten zijn lokaal: (0,0) is waar de
// pootjes de balk raken, negatieve y is omhoog.
(function () {
  const U = window.UilUtil;
  const TAU = Math.PI * 2;

  const DEFAULTS = {
    x: 0, y: 0,            // verschuiving op de balk / hupje
    lean: 0,               // lijf kantelen (radialen)
    fluff: 0,              // veren opzetten (-0.3..1)
    headAngle: 0,          // kop draaien (radialen, 0 = naar je toe, π = achterkant)
    headTilt: 0,           // kop scheef houden
    headY: 0,              // kop zakken (slapen) of strekken
    eyeL: 1, eyeR: 1,      // ogen open (0..1)
    lookX: 0, lookY: 0,    // waar de pupillen kijken (-1..1)
    pupil: 1,              // pupilgrootte
    brow: 0,               // wenkbrauwen: + = boos/chagrijnig, - = verbaasd
    wingL: 0, wingR: 0,    // vleugel optillen (radialen)
    spreadL: 0, spreadR: 0,// vleugel uitstrekken (0..1)
    beak: 0,               // snavel open (0..1)
    throat: 0,             // keel opzetten (oehoe)
    cross: 0,              // scheel kijken (naar iets vlak voor zijn snavel)
    flyX: 0, flyY: 0,      // positie tijdens het vliegen
  };

  const AMP = new Set(['headTilt', 'lean', 'y', 'headY', 'throat']);

  class Rig {
    constructor() {
      this.p = { ...DEFAULTS }; this.t = { ...DEFAULTS }; this.k = {};
      for (const key in DEFAULTS) this.k[key] = 4;
      this.flying = false;
      this.visible = true;
      this.carrying = false;
      this.blink = 0;
      this.autoLook = true;
      this.asleep = false;
      this.hat = null;       // hoedje (feestdagen)
      this.neck = null;      // strik of sjaal
    }
    // Zet doelwaarden; speed = hoe snel (hoger = sneller).
    // Gebaren worden versterkt met `gesture` (groter op een klein scherm).
    set(obj, speed = 4) {
      const G = this.gesture || 1;
      for (const key in obj) {
        let v = obj[key];
        if (G !== 1) {
          if (AMP.has(key)) v *= G;
          else if ((key === 'wingL' || key === 'wingR') && v < 1.2) v = Math.min(v * G, 1.6);
          else if (key === 'headAngle' && Math.abs(v) < 1.3) v *= Math.min(G, 1.2);
        }
        this.t[key] = v; this.k[key] = speed;
      }
    }
    snap(obj) { for (const key in obj) { this.t[key] = obj[key]; this.p[key] = obj[key]; } }
    update(dt) {
      for (const key in this.p) {
        this.p[key] += (this.t[key] - this.p[key]) * (1 - Math.exp(-this.k[key] * dt));
      }
    }
  }

  // ---------- kleuren (warm prentenboek) ----------
  const C = {
    body: '#9a6a42', bodyDark: '#6f4728', bodyLight: '#b98a5c',
    belly: '#f0dfbe', chevron: '#8b5d38',
    wing: '#6b4426', wingLight: '#8c5f39', wingSpot: '#d9c19a',
    head: '#94653e', disc: '#ead3ab', discRim: '#5e3b20',
    iris: '#f6b21b', irisDark: '#d9730a', pupil: '#1a0f08',
    beak: '#e2a83f', beakDark: '#a8701f',
    feet: '#e6b04c', talon: '#3a2d22',
  };

  // Eivorm: smal boven, breed onder.
  function egg(ctx, cx, cy, w, h) {
    ctx.beginPath();
    ctx.moveTo(cx, cy - h);
    ctx.bezierCurveTo(cx + w * 0.78, cy - h, cx + w, cy - h * 0.15, cx + w, cy + h * 0.25);
    ctx.bezierCurveTo(cx + w, cy + h * 0.8, cx + w * 0.55, cy + h, cx, cy + h);
    ctx.bezierCurveTo(cx - w * 0.55, cy + h, cx - w, cy + h * 0.8, cx - w, cy + h * 0.25);
    ctx.bezierCurveTo(cx - w, cy - h * 0.15, cx - w * 0.78, cy - h, cx, cy - h);
    ctx.closePath();
  }

  function drawWing(ctx, side, raise, spread, flapping, time) {
    // side: -1 = links (kijker), +1 = rechts. Tekenen als linkervleugel, spiegelen voor rechts.
    ctx.save();
    ctx.translate(side * 78, -222);
    ctx.scale(-side, 1);
    let a = raise;
    if (flapping) a = 1.25 + Math.sin(time * 15) * 0.85;
    ctx.rotate(a);
    const len = 1 + 0.55 * Math.max(spread, flapping ? 1 : 0);
    ctx.scale(1 + 0.15 * spread, len);

    // slagpennen als vingertjes bij uitgestrekte vleugel
    const sp = flapping ? 1 : spread;
    if (sp > 0.05) {
      ctx.fillStyle = C.wing;
      for (let i = 0; i < 5; i++) {
        ctx.save();
        ctx.translate(2, 165);
        ctx.rotate((-0.5 + i * 0.22) * sp);
        ctx.beginPath(); ctx.ellipse(-6, 22 * sp, 9, 30 * sp + 4, 0, 0, TAU); ctx.fill();
        ctx.restore();
      }
    }

    const g = ctx.createLinearGradient(-45, 0, 35, 0);
    g.addColorStop(0, C.wing); g.addColorStop(1, C.wingLight);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(12, -12);
    ctx.bezierCurveTo(-42, 5, -52, 120, -6, 195);
    ctx.bezierCurveTo(10, 205, 30, 150, 34, 100);
    ctx.bezierCurveTo(40, 40, 32, -2, 12, -12);
    ctx.fill();
    ctx.strokeStyle = 'rgba(40,22,10,0.5)'; ctx.lineWidth = 2.5; ctx.stroke();

    // lichte vlekjes en bandering
    ctx.fillStyle = C.wingSpot;
    for (const [x, y, r] of [[-14, 45, 5], [4, 40, 4.5], [-20, 80, 5], [0, 78, 4.5], [-14, 118, 4.5], [6, 115, 4], [-4, 150, 4]]) {
      ctx.beginPath(); ctx.ellipse(x, y, r * 1.2, r * 0.75, -0.3, 0, TAU); ctx.fill();
    }
    ctx.strokeStyle = 'rgba(40,22,10,0.35)'; ctx.lineWidth = 2;
    for (const y of [135, 160, 180]) {
      ctx.beginPath(); ctx.moveTo(-30, y - 10); ctx.quadraticCurveTo(-5, y + 4, 25, y - 18); ctx.stroke();
    }
    ctx.restore();
  }

  function drawEye(ctx, x, y, r, sx, open, lookX, lookY, pupil, brow, side) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(Math.max(sx, 0.05), 1);
    // donkere rand
    ctx.fillStyle = '#2b1a0d';
    ctx.beginPath(); ctx.arc(0, 0, r + 4, 0, TAU); ctx.fill();
    ctx.save();
    ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.clip();
    if (open > 0.02) {
      const ig = ctx.createRadialGradient(0, 0, r * 0.2, 0, 0, r);
      ig.addColorStop(0, C.iris); ig.addColorStop(1, C.irisDark);
      ctx.fillStyle = ig; ctx.fillRect(-r, -r, r * 2, r * 2);
      const px = lookX * r * 0.38, py = lookY * r * 0.38;
      ctx.fillStyle = C.pupil;
      ctx.beginPath(); ctx.arc(px, py, r * 0.5 * pupil, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.92)';
      ctx.beginPath(); ctx.arc(px - r * 0.22, py - r * 0.25, r * 0.17, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.arc(px + r * 0.2, py + r * 0.18, r * 0.07, 0, TAU); ctx.fill();
    }
    // ooglid van boven naar beneden; schuin bij "brow" (chagrijnig)
    const edge = -r + 2 * r * (1 - open);
    const tilt = brow * r * 0.5 * side;
    ctx.fillStyle = C.disc;
    ctx.beginPath();
    ctx.moveTo(-r - 2, -r - 2); ctx.lineTo(r + 2, -r - 2);
    ctx.lineTo(r + 2, edge - tilt);
    ctx.quadraticCurveTo(0, edge + r * 0.3 * (1 - open) + 2, -r - 2, edge + tilt);
    ctx.closePath(); ctx.fill();
    ctx.restore();
    // ooglidlijn
    ctx.strokeStyle = '#3a2410'; ctx.lineWidth = 3.5; ctx.lineCap = 'round';
    if (open < 0.08) {
      ctx.beginPath(); ctx.moveTo(-r * 0.85, -2); ctx.quadraticCurveTo(0, r * 0.45, r * 0.85, -2); ctx.stroke();
    } else if (open < 0.98) {
      ctx.beginPath(); ctx.moveTo(-r, edge + tilt); ctx.quadraticCurveTo(0, edge + r * 0.3 * (1 - open) + 2, r, edge - tilt); ctx.stroke();
    }
    ctx.restore();
  }

  function drawHead(ctx, o, time, extras) {
    const p = o.p;
    const R = 100;
    const a = p.headAngle;
    const front = Math.cos(a);
    const sx = (az) => R * Math.sin(a + az);
    const vis = (az) => Math.cos(a + az);

    // oorpluimen (achter de kop)
    for (const az of [-0.85, 0.85]) {
      const tx = sx(az) * 0.95;
      ctx.fillStyle = C.bodyDark;
      ctx.beginPath();
      ctx.moveTo(tx - 24, -58);
      ctx.quadraticCurveTo(tx * 1.05, -95, tx * 1.28, -128);
      ctx.quadraticCurveTo(tx * 1.18 + (az < 0 ? 14 : -14), -85, tx + 24, -60);
      ctx.fill();
    }

    // kop
    const hg = ctx.createRadialGradient(-30, -40, 10, 0, 0, 120);
    hg.addColorStop(0, C.bodyLight); hg.addColorStop(1, C.head);
    ctx.fillStyle = hg;
    ctx.beginPath(); ctx.ellipse(0, 0, 108, 90, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(40,22,10,0.35)'; ctx.lineWidth = 2.5; ctx.stroke();

    // spikkels op de kruin
    ctx.fillStyle = 'rgba(60,35,15,0.35)';
    for (const [az, y] of [[-0.3, -70], [0.2, -76], [0.6, -62], [-0.7, -58], [1.2, -40], [-1.3, -35], [2.2, -30], [-2.3, -25], [2.8, -50], [-2.8, -55]]) {
      if (vis(az) > 0) { ctx.beginPath(); ctx.ellipse(sx(az) * 0.9, y, 4 * vis(az) + 1, 3, 0, 0, TAU); ctx.fill(); }
    }

    // achterkant van de kop (als hij ver omdraait)
    if (front < 0.3) {
      const alpha = U.clamp(0.3 - front);
      ctx.strokeStyle = `rgba(60,35,15,${0.6 * alpha})`; ctx.lineWidth = 3; ctx.lineCap = 'round';
      for (const d of [-0.35, 0, 0.35]) {
        if (vis(Math.PI + d) > 0) {
          const x = sx(Math.PI + d) * 0.85;
          ctx.beginPath(); ctx.moveTo(x, -55); ctx.quadraticCurveTo(x + 4, -10, x, 50); ctx.stroke();
        }
      }
    }

    if (front > 0) {
      const fa = U.clamp(front * 4);
      ctx.save();
      ctx.globalAlpha = fa;
      // gezichtssluier: twee schijven rond de ogen
      const eL = { x: sx(-0.42), v: vis(-0.42) }, eR = { x: sx(0.42), v: vis(0.42) };
      // eerst de rand van beide schijven, dan de vulling eroverheen: zo krijg je één hartvormige sluier
      ctx.strokeStyle = C.discRim; ctx.lineWidth = 6; ctx.fillStyle = C.disc;
      for (const pass of ['stroke', 'fill']) {
        for (const e of [eL, eR]) {
          if (e.v > 0) { ctx.beginPath(); ctx.ellipse(e.x, 2, 52 * e.v, 56, 0, 0, TAU); ctx[pass](); }
        }
      }
      // wenkbrauw-V
      const bx = sx(0);
      ctx.strokeStyle = 'rgba(111,71,40,0.85)'; ctx.lineWidth = 5; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(sx(-0.72), -50 + p.brow * 12);
      ctx.quadraticCurveTo(sx(-0.3), -54 - p.brow * 2, bx, -30 + p.brow * 10);
      ctx.quadraticCurveTo(sx(0.3), -54 - p.brow * 2, sx(0.72), -50 + p.brow * 12);
      ctx.stroke();

      const blinkMul = 1 - o.blink;
      if (eL.v > 0) drawEye(ctx, eL.x, -2, 30, eL.v, p.eyeL * blinkMul, U.clamp(p.lookX + p.cross * 0.95, -1, 1), p.lookY, p.pupil, p.brow, -1);
      if (eR.v > 0) drawEye(ctx, eR.x, -2, 30, eR.v, p.eyeR * blinkMul, U.clamp(p.lookX - p.cross * 0.95, -1, 1), p.lookY, p.pupil, p.brow, 1);

      // snavel
      const bv = vis(0);
      if (bv > 0) {
        ctx.save();
        ctx.translate(bx, 20);
        ctx.scale(Math.max(bv, 0.1), 1);
        const open = p.beak;
        if (open > 0.05) { // mondje
          ctx.fillStyle = '#5a1f18';
          ctx.beginPath(); ctx.ellipse(0, 12 + open * 6, 11, 4 + open * 14, 0, 0, TAU); ctx.fill();
        }
        ctx.fillStyle = C.beak; ctx.strokeStyle = C.beakDark; ctx.lineWidth = 2;
        // bovensnavel
        ctx.beginPath(); ctx.moveTo(-13, 0); ctx.quadraticCurveTo(0, -6, 13, 0);
        ctx.quadraticCurveTo(6, 22, 0, 30 - open * 4); ctx.quadraticCurveTo(-6, 22, -13, 0);
        ctx.fill(); ctx.stroke();
        // ondersnavel
        if (open > 0.05) {
          ctx.beginPath(); ctx.moveTo(-8, 16 + open * 8); ctx.quadraticCurveTo(0, 26 + open * 22, 8, 16 + open * 8); ctx.closePath();
          ctx.fill(); ctx.stroke();
        }
        ctx.restore();

        // snurkbelletje
        if (extras.snoreBubble > 0) {
          const r = extras.snoreBubble;
          ctx.fillStyle = 'rgba(200,230,255,0.35)'; ctx.strokeStyle = 'rgba(230,245,255,0.8)'; ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.arc(bx + 14 + r * 0.8, 36 + r * 0.4, r, 0, TAU); ctx.fill(); ctx.stroke();
          ctx.fillStyle = 'rgba(255,255,255,0.8)';
          ctx.beginPath(); ctx.arc(bx + 14 + r * 0.5, 36, r * 0.25, 0, TAU); ctx.fill();
        }

        // muis in de snavel
        if (o.carrying) {
          ctx.save();
          ctx.translate(bx, 48);
          drawMouseHanging(ctx, time);
          ctx.restore();
        }
      }
      ctx.restore();
    }
    if (o.hat) drawHat(ctx, o.hat, a, time);
  }

  // ---------- hoedjes (in kop-coördinaten; bovenkant kop is y = -90) ----------
  function drawHat(ctx, hat, a, t) {
    ctx.save();
    ctx.translate(Math.sin(a) * 30, -78);
    ctx.lineJoin = 'round';
    if (hat === 'mijter') {
      ctx.fillStyle = '#c4122f'; ctx.strokeStyle = '#e8b83a'; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(-46, 0); ctx.lineTo(-44, -60); ctx.quadraticCurveTo(-30, -115, 0, -140);
      ctx.quadraticCurveTo(30, -115, 44, -60); ctx.lineTo(46, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#e8b83a'; ctx.fillRect(-48, -14, 96, 14); ctx.fillRect(-5, -100, 10, 86);
      ctx.fillRect(-26, -72, 52, 10);
      ctx.fillStyle = '#fff3c0'; ctx.beginPath(); ctx.arc(0, -67, 6, 0, TAU); ctx.fill();
    } else if (hat === 'kerstmuts') {
      const sw = Math.sin(t * 1.5) * 4;
      ctx.fillStyle = '#d2232a';
      ctx.beginPath(); ctx.moveTo(-52, -8); ctx.quadraticCurveTo(-30, -100, 30, -110);
      ctx.quadraticCurveTo(80 + sw, -100, 92 + sw, -60); ctx.quadraticCurveTo(60, -80, 52, -8); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.beginPath(); ctx.moveTo(20, -10); ctx.quadraticCurveTo(40, -70, 60, -80); ctx.lineTo(52, -8); ctx.fill();
      ctx.fillStyle = '#fbfaf5';
      ctx.beginPath(); ctx.ellipse(0, -6, 62, 16, 0, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.arc(94 + sw, -54, 16, 0, TAU); ctx.fill();
    } else if (hat === 'feestmuts') {
      ctx.rotate(0.18);
      ctx.save();
      ctx.beginPath(); ctx.moveTo(-36, 0); ctx.lineTo(0, -120); ctx.lineTo(36, 0); ctx.closePath(); ctx.clip();
      ctx.fillStyle = '#3aa0e8'; ctx.fillRect(-40, -125, 80, 130);
      ctx.fillStyle = '#f2b632';
      for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(-60, -10 - i * 24); ctx.lineTo(60, -40 - i * 24); ctx.lineTo(60, -28 - i * 24); ctx.lineTo(-60, 2 - i * 24); ctx.fill(); }
      ctx.restore();
      ctx.fillStyle = '#e8433a';
      for (let i = 0; i < 8; i++) { ctx.beginPath(); ctx.arc(Math.cos(i * 0.8) * 9, -122 + Math.sin(i * 0.8) * 9, 8, 0, TAU); ctx.fill(); }
    } else if (hat === 'kroontje') {
      ctx.fillStyle = '#ff8a1c'; ctx.strokeStyle = '#c75f00'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(-44, 0); ctx.lineTo(-48, -50); ctx.lineTo(-24, -24); ctx.lineTo(0, -62);
      ctx.lineTo(24, -24); ctx.lineTo(48, -50); ctx.lineTo(44, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
      for (const [x, y, c] of [[-48, -52, '#fff'], [0, -64, '#fff'], [48, -52, '#fff'], [-20, -10, '#21468b'], [0, -10, '#ae1c28'], [20, -10, '#21468b']]) {
        ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, 5.5, 0, TAU); ctx.fill();
      }
    } else if (hat === 'heksenhoed') {
      ctx.fillStyle = '#2b1d3d';
      ctx.beginPath(); ctx.ellipse(0, -4, 86, 16, 0, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-44, -8); ctx.quadraticCurveTo(-20, -80, 10, -130); ctx.quadraticCurveTo(40, -150, 56, -126);
      ctx.quadraticCurveTo(30, -120, 26, -80); ctx.lineTo(44, -8); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#ff8a1c'; ctx.fillRect(-42, -26, 84, 12);
      ctx.fillStyle = '#f7d257'; ctx.fillRect(-8, -30, 16, 20);
    } else if (hat === 'konijnenoren') {
      for (const s of [-1, 1]) {
        ctx.save(); ctx.translate(s * 26, -4); ctx.rotate(s * 0.22 + Math.sin(t * 2 + s) * 0.04);
        ctx.fillStyle = '#f7f3ee'; ctx.beginPath(); ctx.ellipse(0, -62, 20, 64, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = '#f5b6c8'; ctx.beginPath(); ctx.ellipse(0, -60, 10, 50, 0, 0, TAU); ctx.fill();
        ctx.restore();
      }
      ctx.fillStyle = '#ddd'; ctx.fillRect(-50, -8, 100, 10);
    } else if (hat === 'bloem') {
      ctx.translate(-50, -6);
      ctx.fillStyle = '#ff7eb6';
      for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.ellipse(Math.cos(i * 1.05) * 14, Math.sin(i * 1.05) * 14, 11, 7, i * 1.05, 0, TAU); ctx.fill(); }
      ctx.fillStyle = '#ffd23d'; ctx.beginPath(); ctx.arc(0, 0, 9, 0, TAU); ctx.fill();
      ctx.fillStyle = '#5cb85c'; ctx.beginPath(); ctx.ellipse(20, 14, 14, 6, 0.6, 0, TAU); ctx.fill();
    }
    ctx.restore();
  }

  function drawNeck(ctx, neck, t) {
    if (neck === 'strik') {
      ctx.save(); ctx.translate(0, -182);
      ctx.fillStyle = '#d23b2f';
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-38, -18); ctx.lineTo(-38, 18); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(38, -18); ctx.lineTo(38, 18); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#fff'; for (const [x, y] of [[-24, -5], [-28, 8], [24, -5], [28, 8]]) { ctx.beginPath(); ctx.arc(x, y, 3.5, 0, TAU); ctx.fill(); }
      ctx.fillStyle = '#a82a20'; ctx.beginPath(); ctx.ellipse(0, 0, 10, 12, 0, 0, TAU); ctx.fill();
      ctx.restore();
    } else if (neck === 'sjaal') {
      ctx.save(); ctx.translate(0, -190);
      ctx.fillStyle = '#ff7f00';
      ctx.beginPath(); ctx.ellipse(0, 0, 92, 24, 0, 0, TAU); ctx.fill();
      const sw = Math.sin(t * 2) * 4;
      ctx.beginPath(); ctx.moveTo(30, 10); ctx.lineTo(60 + sw, 110); ctx.lineTo(28 + sw, 114); ctx.lineTo(10, 14); ctx.fill();
      ctx.fillStyle = '#ffffff';
      for (const y of [40, 70]) { ctx.save(); ctx.translate(0, 0); ctx.beginPath(); ctx.moveTo(18 + y * 0.32, y); ctx.lineTo(48 + y * 0.32 + sw * y / 110, y); ctx.lineTo(50 + y * 0.32 + sw * y / 110, y + 8); ctx.lineTo(20 + y * 0.32, y + 8); ctx.fill(); ctx.restore(); }
      ctx.strokeStyle = 'rgba(150,60,0,0.4)'; ctx.lineWidth = 2;
      for (let x = -70; x <= 70; x += 14) { ctx.beginPath(); ctx.moveTo(x, -18); ctx.lineTo(x + 6, 18); ctx.stroke(); }
      ctx.restore();
    }
  }

  function drawMouseHanging(ctx, time) {
    const sw = Math.sin(time * 3) * 0.15;
    ctx.rotate(sw);
    ctx.fillStyle = '#8d8790';
    ctx.beginPath(); ctx.ellipse(18, 6, 26, 13, 0.25, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.ellipse(40, 14, 7, 9, 0, 0, TAU); ctx.fill(); // oortje
    ctx.fillStyle = '#e4b8c0';
    ctx.beginPath(); ctx.ellipse(40, 14, 4, 5, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#c99aa2'; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-6, 2); ctx.quadraticCurveTo(-26, 10 + sw * 40, -20, 40); ctx.stroke();
    ctx.fillStyle = '#222';
    ctx.beginPath(); ctx.arc(34, 2, 2, 0, TAU); ctx.fill();
  }

  // Muisje dat over de balk rent (voor de zeldzame verrassing).
  function drawRunningMouse(ctx, x, y, dir, time) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(dir, 1);
    const step = Math.sin(time * 30);
    ctx.strokeStyle = '#c99aa2'; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-22, -8); ctx.quadraticCurveTo(-45, -20 + step * 4, -60, -6); ctx.stroke();
    ctx.fillStyle = '#8d8790';
    ctx.beginPath(); ctx.ellipse(0, -11 + Math.abs(step) * 2, 24, 12, 0, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.ellipse(22, -12, 12, 8, 0.2, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.ellipse(16, -22, 7, 8, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#e4b8c0';
    ctx.beginPath(); ctx.ellipse(16, -22, 4, 5, 0, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(34, -11, 3, 0, TAU); ctx.fill();
    ctx.fillStyle = '#222';
    ctx.beginPath(); ctx.arc(25, -15, 2, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#6d6770'; ctx.lineWidth = 3;
    for (const [lx, ph] of [[-10, 0], [10, Math.PI]]) {
      ctx.beginPath(); ctx.moveTo(lx, -4); ctx.lineTo(lx + Math.sin(time * 30 + ph) * 6, 0); ctx.stroke();
    }
    ctx.restore();
  }

  function drawFeet(ctx, flying) {
    for (const fx of [-36, 36]) {
      ctx.save();
      ctx.translate(fx, flying ? -10 : 0);
      // pluizige "broek"
      ctx.fillStyle = C.belly;
      ctx.beginPath(); ctx.ellipse(0, -10, 24, 14, 0, 0, TAU); ctx.fill();
      for (const tx of [-14, 0, 14]) {
        ctx.fillStyle = C.feet;
        ctx.beginPath(); ctx.ellipse(tx, 4, 6.5, 13, tx * 0.01, 0, TAU); ctx.fill();
        ctx.fillStyle = C.talon;
        ctx.beginPath(); ctx.moveTo(tx - 4, 14); ctx.quadraticCurveTo(tx, 26, tx + 3, 15); ctx.fill();
      }
      ctx.restore();
    }
  }

  // Hoofd-tekenfunctie. origin: wereldpositie van de pootjes; S: schaal.
  function drawOwl(ctx, o, origin, S, time, extras) {
    if (!o.visible) return;
    const p = o.p;
    ctx.save();
    ctx.translate(origin.x + p.x + p.flyX, origin.y + p.y + p.flyY);
    ctx.scale(S, S);

    // schaduw op de balk
    const lift = U.clamp(-(p.flyY + p.y) / 200);
    if (!o.flying || lift < 0.9) {
      ctx.fillStyle = `rgba(0,0,0,${0.3 * (1 - lift)})`;
      ctx.beginPath(); ctx.ellipse(-(p.flyX) / S, -(p.flyY + p.y) / S + 10, 110 * (1 - lift * 0.5), 14, 0, 0, TAU); ctx.fill();
    }

    // kantelen rond het midden van het lijf
    ctx.translate(0, -140); ctx.rotate(p.lean); ctx.translate(0, 140);

    const breathe = Math.sin(time * TAU / (o.asleep ? 4.2 : 3.0));
    const fl = 1 + 0.07 * p.fluff;
    const flapping = o.flying;

    // vleugels achter het lijf als ze omhoog staan
    const wingBehind = (r) => flapping || r > 0.6;
    if (wingBehind(p.wingL)) drawWing(ctx, -1, p.wingL, p.spreadL, flapping, time);
    if (wingBehind(p.wingR)) drawWing(ctx, 1, p.wingR, p.spreadR, flapping, time + 0.02);

    // lijf
    ctx.save();
    ctx.translate(0, -140);
    ctx.scale(fl * (1 + 0.008 * breathe), 1 + 0.014 * breathe);
    const bg = ctx.createRadialGradient(-40, -70, 20, 0, 0, 170);
    bg.addColorStop(0, C.bodyLight); bg.addColorStop(1, C.body);
    ctx.fillStyle = bg;
    egg(ctx, 0, 0, 112, 145); ctx.fill();
    ctx.strokeStyle = 'rgba(40,22,10,0.35)'; ctx.lineWidth = 2.5; ctx.stroke();
    // buik
    ctx.fillStyle = C.belly;
    egg(ctx, 0, 28, 72, 108); ctx.fill();
    // veerpatroon (chevrons)
    ctx.strokeStyle = C.chevron; ctx.lineWidth = 3; ctx.lineCap = 'round';
    for (let row = 0; row < 5; row++) {
      const y = -40 + row * 30, n = row % 2 ? 4 : 3, wdt = 42 + row * 6;
      for (let i = 0; i < n; i++) {
        const x = (n === 1 ? 0 : -wdt / 2 + (wdt / (n - 1)) * i);
        ctx.beginPath(); ctx.moveTo(x - 7, y); ctx.lineTo(x, y + 7); ctx.lineTo(x + 7, y); ctx.stroke();
      }
    }
    ctx.restore();

    // keel (oehoe)
    if (p.throat > 0.02) {
      ctx.fillStyle = C.belly;
      ctx.beginPath(); ctx.ellipse(0, -232, 30 + p.throat * 22, 16 + p.throat * 22, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = 'rgba(120,80,40,0.4)'; ctx.lineWidth = 2; ctx.stroke();
    }

    // opgevouwen vleugels over het lijf
    if (!wingBehind(p.wingL)) drawWing(ctx, -1, p.wingL, p.spreadL, false, time);
    if (!wingBehind(p.wingR)) drawWing(ctx, 1, p.wingR, p.spreadR, false, time);

    drawFeet(ctx, flapping);

    // kop
    ctx.save();
    ctx.translate(0, -218 + p.headY);
    ctx.rotate(p.headTilt);
    ctx.translate(0, -50);
    ctx.scale(fl * 0.5 + 0.5, 1);
    drawHead(ctx, o, time, extras);
    ctx.restore();
    if (o.neck) drawNeck(ctx, o.neck, time);

    ctx.restore();
  }

  // Spinnetje aan een draadje (van boven naar beneden).
  function drawSpider(ctx, x, y, topY, t, k = 1) {
    ctx.strokeStyle = 'rgba(235,235,235,0.75)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(x, topY); ctx.lineTo(x, y); ctx.stroke();
    ctx.save(); ctx.translate(x, y + 9 * k); ctx.scale(k, k);
    ctx.strokeStyle = '#2a211c'; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
    for (const s of [-1, 1]) for (let i = 0; i < 4; i++) {
      const wig = Math.sin(t * 8 + i) * 2;
      ctx.beginPath(); ctx.moveTo(0, -2 + i * 3); ctx.quadraticCurveTo(s * 12, -10 + i * 5 + wig, s * 17, 2 + i * 5); ctx.stroke();
    }
    ctx.fillStyle = '#4a3a30'; ctx.strokeStyle = '#1a120c'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.ellipse(0, 4, 8, 10, 0, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, -7, 5.5, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#c9a25a'; ctx.beginPath(); ctx.arc(0, 4, 3, 0, TAU); ctx.fill();
    ctx.fillStyle = '#fff'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(s * 2.4, -8, 2, 0, TAU); ctx.fill(); }
    ctx.fillStyle = '#000'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(s * 2.4, -7.6, 1, 0, TAU); ctx.fill(); }
    ctx.restore();
  }

  window.UilOwl = { Rig, drawOwl, drawRunningMouse, drawSpider };
})();
