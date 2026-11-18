// ============================================================
//  Instellingen voor De uil op zolder
//  Pas dit bestand aan; de rest hoef je niet aan te raken.
// ============================================================
window.UIL_CONFIG = {
  // Locatie: voor zonsopkomst/-ondergang en de stand van de maan.
  locatie: { naam: 'Utrecht', lat: 52.09, lon: 5.12 },

  // Helderheid van het scherm (0..1). 's Nachts gedimd zodat de
  // buren niet in een lichtbak kijken; overdag zo fel mogelijk.
  helderheid: { dag: 1.0, nacht: 0.45 },

  // Laat het hele beeld heel langzaam een paar pixels verschuiven,
  // tegen inbranden van het scherm.
  inbrandBescherming: true,

  // Maximaal aantal beelden per seconde (lager = zuiniger op de Pi).
  maxFps: 30,

  // Scherpte: 1 is genoeg voor de Pi. Op een Mac-retina mag 2.
  maxPixelRatio: 1.5,

  // Hoe groot de uil is, als deel van de schermhoogte.
  uilGrootte: 0.46,

  // Kans op een zeldzame verrassing (muisje dat langs rent),
  // gemiddeld eens per zoveel minuten.
  muisjeElkeMinuten: 40,
};
