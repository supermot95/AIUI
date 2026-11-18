// Het brein van de uil: onzichtbare behoeftes + dagritme bepalen wat hij doet.
// Elke actie is een generator: `yield n` betekent "wacht n seconden".
(function () {
  const U = window.UilUtil;
  const { rand, pick, clamp } = U;

  // ---------- houdingen ----------
  const AWAKE = { eyeL: 1, eyeR: 1, headY: 0, fluff: 0, headTilt: 0, beak: 0, wingL: 0, wingR: 0, spreadL: 0, spreadR: 0, lean: 0, pupil: 1, brow: 0, throat: 0, y: 0 };
  const SLEEP = { eyeL: 0, eyeR: 0, headY: 18, fluff: 0.6, headTilt: 0.07, beak: 0, wingL: 0, wingR: 0, spreadL: 0, spreadR: 0, lean: 0, lookX: 0, lookY: 0.2, headAngle: 0, brow: 0, throat: 0, y: 0 };

  const A = {}; // alle acties

  // --- wakker, rustig ---
  A.stilzitten = function* (o) {
    o.autoLook = true; o.set(AWAKE, 2);
    yield rand(4, 14);
  };

  A.rondkijken = function* (o) {
    o.autoLook = false;
    const n = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < n; i++) {
      const ang = rand(-1.2, 1.2);
      o.set({ lookX: clamp(ang * 1.2, -1, 1), lookY: rand(-0.4, 0.4) }, 12); yield 0.15;
      o.set({ headAngle: ang, headTilt: rand(-0.12, 0.12) }, rand(3, 7));
      yield rand(0.8, 2.6);
    }
    o.set({ headAngle: 0, headTilt: 0, lookX: 0, lookY: 0 }, 4); yield 1;
    o.autoLook = true;
  };

  A.kopschuin = function* (o) { // nieuwsgierig kopje scheef
    o.autoLook = false;
    const d = pick([-1, 1]);
    o.set({ headTilt: d * 0.45, lookX: 0, lookY: 0, pupil: 1.25 }, 5); yield 1.3;
    o.set({ headTilt: -d * 0.4 }, 5); yield 1.2;
    if (Math.random() < 0.5) { o.set({ headTilt: d * 0.5 }, 6); yield 1; }
    o.set({ headTilt: 0, pupil: 1 }, 4); yield 0.8;
    o.autoLook = true;
  };

  A.kopdraai = function* (o, b) { // de beroemde 270°-draai
    o.autoLook = false;
    const d = pick([-1, 1]);
    o.set({ lookX: d, lookY: 0 }, 10); yield 0.2;
    o.set({ headAngle: d * 1.3 }, 3); yield 1.0;
    o.set({ headAngle: d * 4.0 }, 2.2); yield 2.4;   // je ziet zijn achterhoofd
    yield rand(1, 2.5);
    o.set({ headAngle: d * 1.3 }, 2.2); yield 1.8;
    o.set({ headAngle: 0, lookX: 0 }, 3); yield 1.2;
    o.autoLook = true;
  };

  A.poetsen = function* (o, b) {
    o.autoLook = false;
    const d = pick([-1, 1]);
    const wing = d < 0 ? 'wingL' : 'wingR';
    o.set({ headAngle: d * 0.95, headTilt: d * 0.5, headY: 16, lookX: d, lookY: 0.8, eyeL: 0.45, eyeR: 0.45 }, 4);
    o.set({ [wing]: 0.35, fluff: 0.3 }, 3);
    yield 0.9;
    for (let i = 0; i < 6 + Math.floor(Math.random() * 5); i++) {
      o.set({ beak: 0.5, headTilt: d * 0.55 + rand(-0.06, 0.06) }, 18); yield 0.13;
      o.set({ beak: 0, headY: 16 + rand(-3, 3) }, 18); yield rand(0.12, 0.3);
    }
    o.set({ ...AWAKE, headAngle: 0, lookX: 0, lookY: 0 }, 4); yield 0.8;
    if (Math.random() < 0.5) yield* A.schudden(o, b);
    o.autoLook = true;
  };

  A.rekken = function* (o) {
    o.autoLook = false;
    const kind = pick(['beide', 'links', 'rechts', 'beide']);
    o.set({ eyeL: 0.4, eyeR: 0.4, lookY: -0.3, fluff: 0.3 }, 3);
    if (kind === 'beide') o.set({ wingL: 1.95, wingR: 1.95, spreadL: 1, spreadR: 1, headY: -8 }, 1.8);
    else if (kind === 'links') o.set({ wingL: 1.3, spreadL: 1, lean: -0.12 }, 2);
    else o.set({ wingR: 1.3, spreadR: 1, lean: 0.12 }, 2);
    yield 2.2;
    o.set({ beak: 0.3 }, 3); yield 1.2;
    o.set({ wingL: 0, wingR: 0, spreadL: 0, spreadR: 0, lean: 0, headY: 0, beak: 0, fluff: 0 }, 2.8);
    yield 1.4;
    o.set({ eyeL: 1, eyeR: 1, lookY: 0 }, 4); yield 0.4;
    o.autoLook = true;
  };

  A.schudden = function* (o, b) {
    o.set({ fluff: 1 }, 10); yield 0.3;
    for (let i = 0; i < 10; i++) {
      o.set({ headAngle: (i % 2 ? 1 : -1) * 0.3, lean: (i % 2 ? -1 : 1) * 0.05 }, 35); yield 0.055;
    }
    b.emit('veertjes', 3 + Math.floor(Math.random() * 3));
    o.set({ headAngle: 0, lean: 0 }, 12); yield 0.2;
    o.set({ fluff: 0 }, 2.5); yield 1;
  };

  A.oehoe = function* (o, b) {
    o.autoLook = false;
    o.set({ lookX: 0, lookY: -0.1, headAngle: rand(-0.4, 0.4) }, 4); yield 0.5;
    const n = Math.random() < 0.3 ? 2 : 1;
    for (let i = 0; i < n; i++) {
      o.set({ throat: 1, lean: 0.06, headY: 5 }, 7); yield 0.35;
      b.say(pick(['Oehoe!', 'Oe-hoe!', 'Hoe-hoe-oehoe!']), 2.4);
      o.set({ beak: 0.3 }, 10); yield 0.35;
      o.set({ beak: 0 }, 10); yield 0.2;
      o.set({ beak: 0.35 }, 10); yield 0.45;
      o.set({ beak: 0, throat: 0, lean: 0, headY: 0 }, 5); yield 1.2;
    }
    o.set({ headAngle: 0 }, 3); yield 0.5;
    o.autoLook = true;
  };

  A.gapen = function* (o) {
    o.set({ eyeL: 0.1, eyeR: 0.1, headTilt: rand(-0.12, 0.12), headY: -8, beak: 1, fluff: 0.25 }, 3); yield 1.7;
    o.set({ beak: 0, headY: 0, fluff: 0 }, 4); yield 0.6;
    o.set({ eyeL: 0.7, eyeR: 0.7, headTilt: 0 }, 3); yield 0.5;
  };

  A.verschuiven = function* (o, b) { // een paar hupjes opzij (ook tegen inbranden)
    const lim = b.moveLimit;
    let dir = pick([-1, 1]);
    if (o.t.x > lim * 0.4) dir = -1; if (o.t.x < -lim * 0.4) dir = 1;
    const target = clamp(o.t.x + dir * rand(lim * 0.4, lim), -lim, lim);
    const hops = 2 + Math.floor(Math.random() * 3);
    const step = (target - o.t.x) / hops;
    o.autoLook = false; o.set({ lookX: dir * 0.8 }, 8);
    for (let i = 0; i < hops; i++) {
      o.set({ y: -26, x: o.t.x + step, lean: dir * 0.08, wingL: 0.25, wingR: 0.25 }, 13); yield 0.14;
      o.set({ y: 0, lean: 0, wingL: 0, wingR: 0 }, 14); yield rand(0.2, 0.35);
    }
    o.set({ lookX: 0 }, 4); yield 0.5;
    b.lastMove = b.clock;
    o.autoLook = true;
  };

  A.bijnaVallen = function* (o, b) {
    o.autoLook = false;
    const d = pick([-1, 1]);
    o.set({ lean: d * 0.35, pupil: 1.4, eyeL: 1, eyeR: 1, lookX: -d }, 5); yield 0.5;
    o.set({ lean: d * 0.55, brow: -1 }, 7); yield 0.3;
    o.flying = true; // wild klapperen
    for (let i = 0; i < 6; i++) { o.set({ lean: d * (0.5 - i * 0.08) + rand(-0.1, 0.1) }, 10); yield 0.15; }
    o.flying = false;
    o.set({ lean: -d * 0.08, wingL: 0.4, wingR: 0.4 }, 6); yield 0.4;
    o.set({ lean: 0, wingL: 0, wingR: 0, fluff: 0.8 }, 4); yield 0.6;
    b.say(pick(['Oeps!', 'Dat was op het nippertje.', 'Niemand gezien, toch?']), 2.5);
    o.set({ lookX: d * 0.8, headAngle: d * 0.6 }, 4); yield 1.4;
    o.set({ lookX: -d * 0.8, headAngle: -d * 0.6 }, 4); yield 1.4;
    o.set({ ...AWAKE, headAngle: 0, lookX: 0, pupil: 1 }, 3); yield 1;
    o.autoLook = true;
  };

  A.jagen = function* (o, b) {
    b.busy = true; o.autoLook = false;
    // speuren naar beneden, kopje deinen
    o.set({ lookY: 1, lookX: rand(-0.4, 0.4), headY: 6, pupil: 1.3 }, 5); yield 1;
    for (let i = 0; i < 3; i++) {
      o.set({ headTilt: -0.22, headAngle: 0.15 }, 7); yield 0.45;
      o.set({ headTilt: 0.25, headAngle: -0.15 }, 7); yield 0.45;
    }
    o.set({ headTilt: 0, headAngle: 0, y: 14, lean: 0.12, fluff: -0.2 }, 7); yield 0.6; // hurken
    // opstijgen en weg
    const dir = pick([-1, 1]);
    o.flying = true;
    o.set({ y: 0, flyX: dir * b.W * 0.75, flyY: -b.H * 0.85, lean: dir * 0.35 }, 0.9);
    yield 3.2;
    o.visible = false;
    o.snap({ flyX: 0, flyY: 0, y: 0, lean: 0 });
    yield rand(14, 40);
    // terug, meestal met een muis
    const success = Math.random() < 0.75;
    o.carrying = success;
    o.snap({ flyX: -dir * b.W * 0.7, flyY: -b.H * 0.7, lean: -dir * 0.3 });
    o.set(AWAKE, 3); o.snap({ eyeL: 1, eyeR: 1, lookY: 0.4, lookX: 0, headY: 0, pupil: 1 });
    o.visible = true;
    o.set({ flyX: 0, flyY: 0, lean: 0 }, 1.25); yield 3.0;
    o.set({ flyX: 0, flyY: 0 }, 8); yield 0.3;
    o.flying = false;
    o.set({ wingL: 0.8, wingR: 0.8, spreadL: 0.5, spreadR: 0.5, y: 8 }, 8); yield 0.35;
    o.set({ wingL: 0, wingR: 0, spreadL: 0, spreadR: 0, y: 0, lookY: 0 }, 4); yield 0.8;
    if (success) {
      yield 0.8;
      o.set({ headY: -14, headTilt: 0, beak: 0.5 }, 6); yield 0.5; // hap
      o.carrying = false;
      o.set({ beak: 0, throat: 0.9 }, 10); yield 0.35;
      o.set({ throat: 0, headY: 0, eyeL: 0.2, eyeR: 0.2 }, 5); yield 0.6; // slik
      o.set({ eyeL: 1, eyeR: 1 }, 5);
      b.say(pick(['Mjam!', 'Lekker hapje.', 'Muisje op!']), 2.2);
      b.needs.hunger = 0; b.needs.energy = Math.max(0, b.needs.energy - 0.05);
      yield 1.5;
    } else {
      o.set({ brow: 0.8, eyeL: 0.7, eyeR: 0.7 }, 4);
      b.say(pick(['Hmpf. Niks.', 'Ze waren te snel vannacht.']), 2.4);
      b.needs.hunger *= 0.7;
      yield 2;
      o.set({ brow: 0, eyeL: 1, eyeR: 1 }, 3); yield 0.5;
    }
    b.busy = false; o.autoLook = true;
  };

  // --- muisje rent over de balk (zeldzame verrassing) ---
  A.muisKijken = function* (o, b) {
    const m = b.mouse; if (!m) return;
    o.autoLook = false;
    const sleeping = b.mode === 'slaap';
    if (sleeping) { o.set({ eyeR: 0.55 }, 5); yield 0.4; }
    else o.set({ pupil: 1.35, brow: -0.6 }, 6);
    while (b.mouse) {
      const rel = (b.mouse.x - (b.owlX + o.p.x)) / 500;
      o.set({ lookX: clamp(rel * 1.5, -1, 1), lookY: 0.9 }, 12);
      if (!sleeping) o.set({ headAngle: clamp(rel, -1.1, 1.1), headY: 8 }, 5);
      yield 0.05;
    }
    if (!sleeping && b.needs.hunger > 0.3) b.say(pick(['Hé! Kom terug!', 'Volgende keer...']), 2.2);
    else if (!sleeping) b.say('Hmm?', 1.6);
    yield 0.6;
    if (sleeping) { o.set({ eyeR: 0 }, 2); yield 1; }
    else { o.set({ headAngle: 0, headY: 0, lookX: 0, lookY: 0, pupil: 1, brow: 0 }, 3); yield 1; }
    o.autoLook = true;
  };

  // --- slapen ---
  A.slapen = function* (o) {
    o.autoLook = false; o.set(SLEEP, 1.2);
    yield rand(25, 90);
  };

  A.eenOogOpen = function* (o) { // "hm? wat was dat?"
    o.autoLook = false;
    const eye = pick(['eyeL', 'eyeR']);
    o.set({ [eye]: 0.55, lookX: rand(-1, 1), lookY: rand(-0.3, 0.5) }, 5); yield rand(1.5, 3);
    if (Math.random() < 0.5) { o.set({ lookX: rand(-1, 1) }, 8); yield rand(1, 2); }
    o.set({ [eye]: 0 }, 2); yield 1;
  };

  A.dommelen = function* (o) { // overdag even half wakker
    o.autoLook = false;
    o.set({ eyeL: 0.3, eyeR: 0.3, headY: 10, fluff: 0.4, lookY: 0.1 }, 1.5); yield 2;
    for (let i = 0; i < 2; i++) {
      o.set({ headAngle: rand(-0.6, 0.6), lookX: rand(-0.6, 0.6) }, 1.5); yield rand(2, 4);
    }
    o.set({ ...SLEEP }, 1); yield 3;
  };

  A.dutje = function* (o, b) { // 's nachts even uitrusten
    yield* A.gapen(o, b);
    o.asleep = true;
    o.set(SLEEP, 1.5); yield rand(40, 120);
    o.asleep = false;
    o.set(AWAKE, 2); yield 1;
  };

  // --- overgangen ---
  A.wakkerWorden = function* (o, b) {
    b.busy = true; o.autoLook = false;
    o.set({ eyeR: 0.45, lookX: 0.3 }, 3); yield 1.5;
    o.set({ lookX: -0.5 }, 6); yield 1.2;
    o.set({ eyeR: 0 }, 4); yield 1.2;               // nog vijf minuutjes...
    o.set({ eyeL: 0.6, eyeR: 0.6, headY: 6, fluff: 0.3 }, 2); yield 1.2;
    yield* A.gapen(o, b);
    yield* A.rekken(o, b);
    yield* A.schudden(o, b);
    o.set(AWAKE, 3); yield 0.5;
    yield* A.rondkijken(o, b);
    b.busy = false; o.autoLook = true;
  };

  A.inslapen = function* (o, b) {
    b.busy = true;
    yield* A.gapen(o, b);
    o.autoLook = false;
    o.set({ eyeL: 0.5, eyeR: 0.5, fluff: 0.5, lookX: 0, lookY: 0 }, 2); yield 2;
    o.set({ eyeL: 0.15, eyeR: 0.15, headY: 10 }, 1); yield 3;
    o.set({ eyeL: 0.6, eyeR: 0.6, headY: 2 }, 6); yield 1;   // schrikt even op
    o.set(SLEEP, 0.8); yield 3;
    b.busy = false;
  };

  // ======================================================
  class Brain {
    constructor(rig) {
      this.o = rig;
      this.mode = null;          // 'slaap' | 'wakker'
      this.needs = { energy: 0.8, hunger: 0.2, boredom: 0.2, curiosity: 0.4 };
      this.current = null;
      this.busy = false;
      this.cooldown = {};
      this.clock = 0;            // echte seconden sinds start
      this.lastMove = 0;
      this.blinkTimer = 2; this.lookTimer = 1;
      this.bubble = null;        // tekstballon
      this.events = [];          // voor deeltjes enz.
      this.mouse = null;
      this.W = 1778; this.H = 1000; this.moveLimit = 120; this.owlX = 0;
      this.history = [];
    }

    say(text, dur) { this.bubble = { text, until: this.clock + dur, born: this.clock }; }
    emit(type, n) { this.events.push({ type, n }); }

    run(name) {
      this.current = { name, gen: A[name](this.o, this), wait: 0 };
      this.cooldown[name] = this.clock;
      this.history.unshift(name); this.history.length = Math.min(this.history.length, 6);
    }

    // Handmatig (debugtoetsen): onderbreekt wat hij aan het doen is.
    force(name) {
      if (!A[name]) return;
      this.o.flying = false; this.o.visible = true; this.o.carrying = false; this.busy = false;
      this.o.snap({ flyX: 0, flyY: 0 });
      if (name !== 'muisKijken' && this.mode === 'slaap' && !['eenOogOpen', 'dommelen', 'slapen'].includes(name)) {
        this.mode = 'wakker'; this.o.asleep = false; this.o.set(AWAKE, 3);
      }
      this.run(name);
    }

    // Wat wil de uil nu? Gewogen loting, zodat het nooit hetzelfde is.
    choose(env) {
      const n = this.needs, since = (k) => this.clock - (this.cooldown[k] ?? -1e9);
      const cool = (k, s) => (since(k) < s ? 0.1 : 1);
      if (this.mode === 'slaap') {
        if (env.sunAlt > 2 && Math.random() < 0.12 + n.curiosity * 0.15) return 'dommelen';
        if (Math.random() < 0.2 + n.curiosity * 0.2) return 'eenOogOpen';
        return 'slapen';
      }
      const night = env.nightness;
      const opts = {
        stilzitten: 1.0,
        rondkijken: (0.5 + n.curiosity) * cool('rondkijken', 20),
        kopschuin: (0.25 + n.curiosity * 0.6) * cool('kopschuin', 40),
        kopdraai: (0.1 + n.curiosity * 0.3) * cool('kopdraai', 120),
        poetsen: (0.2 + n.boredom * 0.5) * cool('poetsen', 90),
        rekken: (0.08 + (1 - n.energy) * 0.25) * cool('rekken', 180),
        schudden: 0.1 * cool('schudden', 90),
        oehoe: (0.1 + night * 0.25 + n.boredom * 0.25) * cool('oehoe', 60),
        gapen: (1 - n.energy) * 0.3 * cool('gapen', 60),
        verschuiven: (0.08 + Math.min(1, (this.clock - this.lastMove) / 600)) * cool('verschuiven', 45),
        jagen: n.hunger > 0.35 && n.energy > 0.25 && night > 0.6 ? n.hunger * 1.6 * cool('jagen', 240) : 0,
        dutje: n.energy < 0.3 ? (0.3 - n.energy) * 3 * cool('dutje', 600) : 0,
        bijnaVallen: 0.012 * cool('bijnaVallen', 1800),
      };
      let total = 0; for (const k in opts) total += opts[k];
      let r = Math.random() * total;
      for (const k in opts) { r -= opts[k]; if (r <= 0) return k; }
      return 'stilzitten';
    }

    // Dagritme met marge, zodat hij niet heen en weer springt rond de schemering.
    wantedMode(sunAlt) {
      if (this.mode === null) return sunAlt < -2 ? 'wakker' : 'slaap';
      if (this.mode === 'slaap' && sunAlt < -3) return 'wakker';
      if (this.mode === 'wakker' && sunAlt > -1) return 'slaap';
      return this.mode;
    }

    update(dt, simHours, env) {
      this.clock += dt;
      const o = this.o, n = this.needs;

      // Behoeftes
      if (this.mode === 'slaap' || o.asleep) n.energy += simHours * 0.12; else n.energy -= simHours * 0.07;
      n.hunger += simHours * (this.mode === 'slaap' ? 0.02 : 0.13);
      const idle = !this.current || this.current.name === 'stilzitten';
      n.boredom += dt * (idle ? 0.012 : -0.02);
      n.curiosity += (Math.random() - 0.5) * dt * 0.05 + (0.4 - n.curiosity) * dt * 0.003;
      for (const k in n) n[k] = clamp(n[k]);

      // Overgang slaap <-> wakker
      const want = this.wantedMode(env.sunAlt);
      if (this.mode === null) {
        this.mode = want;
        if (want === 'slaap') { o.snap(SLEEP); o.asleep = true; }
      } else if (want !== this.mode && !this.busy &&
                 (!this.current || ['stilzitten', 'slapen', 'dommelen', 'eenOogOpen'].includes(this.current.name))) {
        this.mode = want;
        o.asleep = want === 'slaap';
        this.run(want === 'wakker' ? 'wakkerWorden' : 'inslapen');
      }

      // Muisje
      if (this.mouse) {
        this.mouse.x += this.mouse.dir * this.mouse.speed * dt;
        if (this.mouse.x < -100 || this.mouse.x > this.W + 100) this.mouse = null;
      }

      // Actie afspelen
      if (!this.current) this.run(this.choose(env));
      const c = this.current;
      c.wait -= dt;
      while (this.current === c && c.wait <= 0) {
        const r = c.gen.next();
        if (r.done) { this.current = null; break; }
        c.wait += r.value || 0;
      }
      if (this.current && this.current.name !== 'stilzitten') n.boredom = Math.max(0, n.boredom - dt * 0.03);

      // Knipperen (alleen met open ogen)
      this.blinkTimer -= dt;
      if (this.blinkTimer <= 0 && o.p.eyeL > 0.5) {
        o.blink = 1; this.blinkTimer = rand(2.5, 7);
        if (Math.random() < 0.15) this.blinkTimer = 0.35; // dubbel knipperen
      }
      o.blink = Math.max(0, o.blink - dt * 7);

      // Rondkijken met alleen de ogen als hij stil zit
      if (o.autoLook && !this.busy) {
        this.lookTimer -= dt;
        if (this.lookTimer <= 0) {
          this.lookTimer = rand(0.8, 3.5);
          if (Math.random() < 0.35) o.set({ lookX: 0, lookY: 0 }, 10);
          else o.set({ lookX: rand(-0.9, 0.9), lookY: rand(-0.5, 0.6) }, 14);
          if (Math.random() < 0.25) o.set({ headAngle: rand(-0.35, 0.35), headTilt: rand(-0.08, 0.08) }, 3);
        }
      }

      if (this.bubble && this.clock > this.bubble.until) this.bubble = null;
    }

    spawnMouse() {
      if (this.mouse || this.busy) return;
      const dir = pick([-1, 1]);
      this.mouse = { x: dir > 0 ? -60 : this.W + 60, dir, speed: rand(240, 340) };
      this.needs.curiosity = 1;
      this.run('muisKijken');
    }
  }

  window.UilBrain = { Brain, ACTIONS: A };
})();
