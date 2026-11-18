// Sterrenkunde: stand van zon en maan, maanfase, zonsopkomst/-ondergang.
// Gebaseerd op de standaardformules uit "Astronomical Algorithms" (Meeus),
// vereenvoudigd tot de nauwkeurigheid die nodig is voor een raam op zolder.
(function () {
  const PI = Math.PI, rad = PI / 180;
  const dayMs = 86400000, J1970 = 2440588, J2000 = 2451545;
  const e = rad * 23.4397; // scheefstand aardas

  const toDays = (date) => date.valueOf() / dayMs - 0.5 + J1970 - J2000;
  const rightAscension = (l, b) =>
    Math.atan2(Math.sin(l) * Math.cos(e) - Math.tan(b) * Math.sin(e), Math.cos(l));
  const declination = (l, b) =>
    Math.asin(Math.sin(b) * Math.cos(e) + Math.cos(b) * Math.sin(e) * Math.sin(l));
  const azimuth = (H, phi, dec) =>
    Math.atan2(Math.sin(H), Math.cos(H) * Math.sin(phi) - Math.tan(dec) * Math.cos(phi));
  const altitude = (H, phi, dec) =>
    Math.asin(Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(H));
  const siderealTime = (d, lw) => rad * (280.16 + 360.9856235 * d) - lw;

  function sunCoords(d) {
    const M = rad * (357.5291 + 0.98560028 * d);
    const C = rad * (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M));
    const L = M + C + rad * 102.9372 + PI;
    return { dec: declination(L, 0), ra: rightAscension(L, 0) };
  }

  function moonCoords(d) {
    const L = rad * (218.316 + 13.176396 * d);
    const M = rad * (134.963 + 13.064993 * d);
    const F = rad * (93.272 + 13.22935 * d);
    const l = L + rad * 6.289 * Math.sin(M);
    const b = rad * 5.128 * Math.sin(F);
    return { ra: rightAscension(l, b), dec: declination(l, b), dist: 385001 - 20905 * Math.cos(M) };
  }

  // Hoogte (graden boven horizon) en azimut (graden vanaf het zuiden, west = positief).
  function sunPosition(date, lat, lon) {
    const lw = rad * -lon, phi = rad * lat, d = toDays(date);
    const c = sunCoords(d);
    const H = siderealTime(d, lw) - c.ra;
    return { alt: altitude(H, phi, c.dec) / rad, az: azimuth(H, phi, c.dec) / rad };
  }

  function moonPosition(date, lat, lon) {
    const lw = rad * -lon, phi = rad * lat, d = toDays(date);
    const c = moonCoords(d);
    const H = siderealTime(d, lw) - c.ra;
    return { alt: altitude(H, phi, c.dec) / rad, az: azimuth(H, phi, c.dec) / rad };
  }

  // fraction: verlicht deel (0..1); phase: 0 = nieuwe maan, 0.25 eerste kwartier,
  // 0.5 volle maan, 0.75 laatste kwartier.
  function moonIllumination(date) {
    const d = toDays(date);
    const s = sunCoords(d), m = moonCoords(d), sdist = 149598000;
    const phi = Math.acos(
      Math.sin(s.dec) * Math.sin(m.dec) + Math.cos(s.dec) * Math.cos(m.dec) * Math.cos(s.ra - m.ra));
    const inc = Math.atan2(sdist * Math.sin(phi), m.dist - sdist * Math.cos(phi));
    const angle = Math.atan2(
      Math.cos(s.dec) * Math.sin(s.ra - m.ra),
      Math.sin(s.dec) * Math.cos(m.dec) - Math.cos(s.dec) * Math.sin(m.dec) * Math.cos(s.ra - m.ra));
    return {
      fraction: (1 + Math.cos(inc)) / 2,
      phase: 0.5 + (0.5 * inc * (angle < 0 ? -1 : 1)) / PI,
    };
  }

  // Zonsopkomst en -ondergang voor de (lokale) dag van `date`, gevonden door
  // de zonshoogte in stapjes van 2 minuten af te lopen.
  function sunTimes(date, lat, lon) {
    const start = new Date(date); start.setHours(0, 0, 0, 0);
    const h0 = -0.833, step = 2 * 60000;
    let prev = sunPosition(start, lat, lon).alt - h0, rise = null, set = null;
    for (let t = start.valueOf() + step; t <= start.valueOf() + dayMs; t += step) {
      const cur = sunPosition(new Date(t), lat, lon).alt - h0;
      if (prev < 0 && cur >= 0 && !rise) rise = new Date(t - step * cur / (cur - prev));
      if (prev >= 0 && cur < 0 && !set) set = new Date(t - step * cur / (cur - prev));
      prev = cur;
    }
    return { sunrise: rise, sunset: set };
  }

  function phaseName(p) {
    if (p < 0.03 || p > 0.97) return 'nieuwe maan';
    if (p < 0.22) return 'wassende sikkel';
    if (p < 0.28) return 'eerste kwartier';
    if (p < 0.47) return 'wassende maan';
    if (p < 0.53) return 'volle maan';
    if (p < 0.72) return 'afnemende maan';
    if (p < 0.78) return 'laatste kwartier';
    return 'afnemende sikkel';
  }

  window.Astro = { sunPosition, moonPosition, moonIllumination, sunTimes, phaseName };
})();
