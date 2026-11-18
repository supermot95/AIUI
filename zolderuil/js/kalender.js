// Kalender: welke feestdag is het, wat trekt de uil aan, wat staat er op de balk,
// en welke grapjes horen erbij?
(function () {
  const pad = (n) => String(n).padStart(2, '0');
  const md = (d) => `${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  // Paaszondag (anonieme Gregoriaanse berekening)
  function easter(y) {
    const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4;
    const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31), day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(y, month - 1, day);
  }
  const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const between = (d, from, to) => { const k = md(d); return k >= from && k <= to; };

  // Algemene gedachten voor voorbijgangers, op elk moment van het jaar.
  const ALGEMEEN = [
    'Goedenavond, voorbijganger!', 'Ik zie je wel hoor.', 'Wie? Ik?', 'Ik ben niet dik. Ik ben donzig.',
    'Nachtdienst. Alweer.', 'Uilskuiken? Pardon?!', 'Het is best gezellig op zolder.',
    'Vannacht drie muizen gezien. Volgens mij steeds dezelfde.', 'Ik hoor alles. Ook dat.',
    'Wijs? Ik? Nou... een beetje.', 'Wat een prachtige nacht om te zitten.',
    'Eens kijken wat de Dom ervan vindt.', 'Ik zit hier heel professioneel te zitten.',
    'Mijn nek kan dit. Kan jouw nek dit?', 'Psst. Heb jij een muis bij je?',
    'Oehoe. Dat betekent hallo.', 'Fietsbel gehoord. Spannend.',
  ];

  function kalender(date, cfg) {
    const k = md(date), y = date.getFullYear(), h = date.getHours(), dow = date.getDay();
    const out = { naam: '', hoed: null, nek: null, props: new Set(), slinger: null, vuurwerk: 0,
      vleermuis: false, hartjes: false, gedachten: [], feest: false };
    const add = (...g) => out.gedachten.push(...g);

    // --- verjaardagen (hoogste voorrang) ---
    const jarig = (cfg.verjaardagen || []).filter((v) => v.datum === k);
    if (jarig.length) {
      const namen = jarig.map((v) => v.naam).join(' & ');
      out.naam = `verjaardag ${namen}`; out.hoed = 'feestmuts'; out.feest = true;
      out.slinger = { tekst: `HOERA ${namen.toUpperCase()}!`, kleuren: ['#e8433a', '#f2b632', '#3aa0e8', '#5cc25a', '#c45ce8'] };
      for (const v of jarig) add(`Gefeliciteerd, ${v.naam}!`, `Hiep hiep hoera voor ${v.naam}!`, `Is er taart? ${v.naam} is jarig!`);
      add('Er is er één jarig, hoera hoera!', 'Taart is ook een soort muis. Toch?');
    }

    // --- Oud & Nieuw ---
    const oudjaar = k === '12-31', nieuwjaarNacht = k === '01-01' && h < 3;
    if (oudjaar || nieuwjaarNacht) {
      out.naam ||= 'Oud & Nieuw';
      out.props.add('oliebol');
      if ((oudjaar && h >= 17) || nieuwjaarNacht) {
        out.hoed ||= 'feestmuts'; out.feest = true;
        const min = h * 60 + date.getMinutes();
        // vuurwerk: wat losse pijlen 's avonds, los rond middernacht
        out.vuurwerk = nieuwjaarNacht ? (min < 45 ? 1 : 0.5) : (min > 23 * 60 + 30 ? 0.8 : 0.25);
        out.slinger ||= { tekst: oudjaar ? 'OUDEJAARSAVOND' : 'GELUKKIG 20' + String(y).slice(2) + '!', kleuren: ['#d9b44a', '#c0c0c8', '#d9b44a', '#2b2b38'] };
      }
      add('Nog een oliebol? Nee? Meer voor mij.', 'Ik schrik écht niet van vuurwerk. Écht niet.', 'Goede voornemens: meer muizen.');
      if (nieuwjaarNacht) add('Gelukkig nieuwjaar!', 'Proost! Op een muizenrijk jaar!');
    }

    // --- Kerst ---
    if (between(date, '12-07', '12-27')) {
      out.naam ||= 'kerstsfeer'; out.props.add('kerstlampjes');
      add('Ik zit al de hele maand in de kerstsfeer.', 'Uil in de kerstboom? Liever niet.');
    }
    if (between(date, '12-20', '12-26')) {
      out.naam = out.naam === 'kerstsfeer' ? 'Kerst' : out.naam || 'Kerst';
      out.hoed ||= 'kerstmuts';
      add('Vrolijk kerstfeest!', 'Ik heb een wens: één muis. Of twee.', 'Fijne feestdagen!');
      if (k === '12-24' && h >= 18) add('Stille nacht... oehoe.');
    }

    // --- Sinterklaas ---
    if (between(date, '11-14', '12-05')) {
      out.naam ||= 'Sinterklaastijd'; out.props.add('schoen');
      add('Ik heb mijn klomp gezet. Met een wortel voor het paard.', 'Zou de Sint ook muizen brengen?',
        'Hoor wie klopt daar, kind\'ren?', 'Pepernoten! Waar? Waar?!', 'Ik ben braaf geweest. Meestal.');
    }
    if (between(date, '12-01', '12-05')) {
      out.naam = 'Sinterklaas'; out.hoed ||= 'mijter';
      if (k === '12-05') add('Pakjesavond!', 'Dag Sinterklaasje, daag daag!');
    }

    // --- Sint Maarten (11 november, beschermheilige van Utrecht!) ---
    if (k === '11-11' || (k === '11-10' && h >= 17)) {
      out.naam ||= 'Sint Maarten'; out.props.add('lampion');
      add('Elf november is de dag...', 'Sint Maarten, Sint Maarten, de koeien hebben staarten!', 'Snoep? Voor een uil? Liever een muis.');
    }

    // --- Koningsdag ---
    const koning = new Date(y, 3, 27); if (koning.getDay() === 0) koning.setDate(26);
    if (sameDay(date, koning) || (sameDay(new Date(y, koning.getMonth(), koning.getDate() - 1), date) && h >= 18)) {
      out.naam ||= 'Koningsdag'; out.hoed ||= 'kroontje'; out.feest = true;
      out.slinger ||= { tekst: 'LEVE DE KONING', kleuren: ['#ae1c28', '#ffffff', '#21468b', '#ff7f00'] };
      add('Lang leve de koning!', 'Ik verkoop deze balk. Twee euro.', 'Oranje staat me goed, hè?');
    }

    // --- Oranje speelt (data in config) ---
    if ((cfg.oranjeWedstrijden || []).includes(`${y}-${k}`)) {
      out.naam ||= 'Oranje speelt'; out.nek ||= 'sjaal'; out.feest = true;
      out.slinger ||= { tekst: 'HUP HOLLAND HUP', kleuren: ['#ff7f00', '#ff9a2e'] };
      add('Hup Holland hup!', 'Ik kijk mee. Ik kan mijn kop overal heen draaien.', 'Dat was buitenspel. Ik zag het.');
    }

    // --- Pasen ---
    const pasen = easter(y), paasMa = new Date(pasen); paasMa.setDate(pasen.getDate() + 1);
    if (sameDay(date, pasen) || sameDay(date, paasMa)) {
      out.naam ||= 'Pasen'; out.hoed ||= 'konijnenoren'; out.props.add('paasei');
      add('Vrolijk Pasen!', 'Dit ei is niet van mij. Echt niet.', 'Ik ben de Paasuil. Bestaat ook.');
    }

    // --- Halloween ---
    if (k === '10-31' || (k === '10-30' && h >= 18)) {
      out.naam ||= 'Halloween'; out.hoed ||= 'heksenhoed'; out.props.add('pompoen'); out.vleermuis = true;
      add('Boe! ...Oehoe!', 'Ik ben verkleed als uil. Overtuigend, hè?', 'Mijn vriend de vleermuis komt zo langs.');
    }

    // --- Valentijn ---
    if (k === '02-14') {
      out.naam ||= 'Valentijn'; out.hartjes = true;
      add('Ik vind jou oehoe-leuk.', 'Wil jij mijn muis zijn?', 'Uilen zijn trouw, hoor. Voor altijd.');
    }

    // --- Eerste lentedag ---
    if (k === '03-20' || k === '03-21') {
      out.naam ||= 'eerste lentedag'; out.hoed ||= 'bloem';
      add('Het is lente! Ik voel het in mijn veren.', 'Lente! De muizen zijn ook wakker.');
    }

    // --- Dierendag ---
    if (k === '10-04') {
      out.naam ||= 'Dierendag'; out.nek ||= 'strik';
      add('Vandaag is het míjn dag.', 'Een muis als cadeau mag ook.', 'Fijne Dierendag aan alle dieren!');
    }

    // --- weekritme ---
    if (dow === 1 && h >= 5 && h < 12) {
      out.props.add('koffie'); out.maandag = true;
      add('Maandag. Bah.', 'Eerst koffie.', 'Wie heeft de maandag uitgevonden?');
    }
    if (dow === 5 && h >= 17) {
      out.vrijdag = true; out.feest = out.feest || h >= 20;
      add('Weekend!', 'Vrijdagavond! Dansje?', 'Het is vrijdag. Ik doe vanavond extra oehoe.');
    }
    if (dow === 0 && h >= 18) add('Zondagavond. Morgen weer maandag. Oehoe.');

    // --- tijd van de nacht ---
    if (h >= 1 && h < 4) add('Waarom ben jij nog wakker?', 'Het is midden in de nacht, hoor.', 'Ga lekker slapen. Ik let wel op.');
    if (h >= 19 && h < 22) add('Goedenavond! Ik ben er weer.', 'Lekker uitgeslapen. Tijd voor actie.');

    out.algemeen = ALGEMEEN;
    return out;
  }

  window.UilKalender = { kalender, easter };
})();
