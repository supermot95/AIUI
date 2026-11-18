# 🦉 De uil op zolder — fase 1

Een uil die op een houten balk op zolder zit, in je zolderraam. Hij heeft een
eigen leven: onzichtbare behoeftes (energie, honger, verveling, nieuwsgierigheid)
en een echt dag/nachtritme, berekend voor jouw locatie.

## Bekijken op je Mac

Dubbelklik op `index.html`. Hij opent in je browser, zonder installatie of internet.

Of start een mini-webserver, wat handig is voor later op de Pi:

```bash
cd zolderuil
python3 -m http.server 8080
# open http://localhost:8080
```

### Testen zonder een hele dag te wachten

Je kunt opties achter de URL zetten:

| Voorbeeld | Wat het doet |
|---|---|
| `index.html?tijd=22:00` | Doen alsof het 22:00 is |
| `index.html?datum=2026-12-24&tijd=17:00` | Andere dag en tijd (handig voor de maanfase) |
| `index.html?snel=120` | De klok loopt 120x zo snel; zie de schemering voorbijkomen |
| `index.html?debug` | Debugscherm direct aan |
| `index.html?staand` | Toon als staand 9:16-scherm (portrait), ook in een liggend venster |

Toetsen (vooral voor het testen):

| Toets | Actie | Toets | Actie |
|---|---|---|---|
| `d` | debugscherm aan/uit | `m` | muisje rent langs |
| `1` | rondkijken | `2` | kop 270° draaien |
| `3` | veren poetsen | `4` | vleugels rekken |
| `5` | oehoe | `6` | op jacht (komt terug met een muis) |
| `7` | veren schudden | `8` | gapen |
| `9` | bijna van de balk vallen | `0` | kopje scheef |
| `h` | hupjes opzij | `z` | inslapen |
| `t` / `T` | een uur vooruit / terug | `[` `]` | klok trager / sneller |

## Wat zit er in fase 1

- **Uil van losse onderdelen**: lijf, kop, ogen, oogleden, pupillen, vleugels, snavel,
  keel en pootjes, die allemaal in code bewegen. Hij knippert, kijkt rond, draait zijn kop
  zo ver dat je zijn achterhoofd ziet, poetst, rekt, schudt, roept oehoe, gaapt en hupt opzij.
- **Brein**: elke paar seconden kiest hij met een gewogen loting wat hij gaat doen, op basis
  van zijn behoeftes en wat hij net gedaan heeft. Daardoor is het nooit twee keer hetzelfde.
  Als hij 's nachts honger krijgt, vliegt hij weg om te jagen. Meestal komt hij terug met een muis.
- **Dagritme**: overdag slaapt hij (met zzz en een snurkbelletje) en doet hij soms één oog open
  of dommelt hij even. Zo'n 20 minuten na zonsondergang wordt hij wakker: gapen, rekken,
  schudden. Bij zonsopkomst gaat hij weer slapen.
- **Lucht in het raampje**: kleur volgens de echte zonnestand, zon, **echte maanfase en
  maanpositie**, sterren, verlichte raampjes in de huizen 's avonds.
- **Lantaarntje** dat 's avonds aangaat en zacht flakkert.
- **Scherm**: 's nachts gedimd (instelbaar). Het beeld verschuift heel langzaam een paar
  pixels en de uil hupt af en toe naar een andere plek, allebei tegen inbranden.
- **Zeldzame verrassing**: een muisje dat over de balk rent (gemiddeld eens per 40 minuten).

## Staand of liggend scherm

De indeling past zich vanzelf aan de beeldverhouding aan:

- **Staand (portrait)**: de uil is groot en zit laag op de balk, met een raampje rechtsboven
  achter zijn kop. Zijn grootte stel je in met `uilGrootteStaand` in `config.js`
  (standaard 0.6 van de schermhoogte).
- **Liggend**: de uil zit in het midden en het raam staat ernaast (`uilGrootte`).

Op je Mac kun je staand testen met `?staand`, of door je browservenster smal te maken.
Op de Pi draai je het beeld via het besturingssysteem, zodat de browser gewoon een staand
scherm ziet. Op Raspberry Pi OS (Bookworm) kan dat via *Screen Configuration* →
*Orientation*, of met `wlr-randr --output HDMI-A-1 --transform 90`. In fase 3 zet ik dat
automatisch goed.

## Instellingen

Alles staat in [`config.js`](config.js): locatie, helderheid dag/nacht, maximale fps,
grootte van de uil en hoe vaak het muisje langskomt.

## Bestanden

```
zolderuil/
  index.html      pagina
  config.js       jouw instellingen
  js/astro.js     zon, maan, maanfase, zonsopkomst/-ondergang
  js/scene.js     zolder, balk, raam, lucht, lantaarn
  js/owl.js       de uil: onderdelen en tekenwerk
  js/brain.js     behoeftes, dagritme en alle acties
  js/main.js      klok, hoofdlus, dimmen, debug
```

## Aannames (nog te bevestigen)

- **Pi**: ik ga uit van een Pi 4 of 5. Bij een Zero 2 W zet je `maxFps` op 20 en
  `maxPixelRatio` op 1. Als dat te zwaar blijkt, maak ik een lichtere versie.
- **Richting**: het scherm kijkt naar buiten, vandaar het dimmen 's nachts. Het hangt staand.
- **Stijl**: warm prentenboek.

## Volgende fases

1. ~~Uil, idle-animaties, slapen/wakker, dag/nacht, lucht en maan~~ ✅
2. Weer (Open-Meteo), feestdagen, outfits en verjaardagen
3. Pi: kiosk-modus, autostart, herstart bij een crash, updates via `git pull`
