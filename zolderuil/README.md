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
| `b` | de Dom slaat het uur | `q` | kwartierdeuntje |
| `g` | gedachte (tekstballon) | `w` | droom (overdag) |
| `n` | niezen | `k` | de hik |
| `s` | spinnetje | `j` | dansje |
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

## 🔔 De Domtoren

De Dom staat links buiten beeld (instelbaar met `dom.kant` in `config.js`).

- **Elk heel uur** draait de uil zijn kop naar de Dom, wijst er met zijn vleugel naar en telt
  de slagen mee in een tekstballonnetje. Ondertussen komen grote **BONG**s van links het beeld in.
  Soms raakt hij de tel kwijt ("8... eh... hoeveel was het nou?").
- **Overdag** slaapt hij. Dan doet hij één chagrijnig oog open: *"Ja ja, ik hóór het, Dom."*
- **Elk kwartier** zweven er muzieknootjes van links binnen en deint hij mee op de beiaard.
- Wil je 's nachts geen slagen? Zet dan `dom.nachtStil: true`.

## 🎉 Feestdagen en grapjes

| Wanneer | Wat je ziet |
|---|---|
| Verjaardag (instelbaar) | Feestmuts, vlaggetjesslinger "HOERA NAAM!", felicitaties, dansjes |
| Sinterklaastijd (14 nov–5 dec) | Klomp met wortel op de balk; vanaf 1 dec een mijter |
| Sint Maarten (11 nov) | Lampion, "Sint Maarten, de koeien hebben staarten!" |
| Kerst (vanaf 7 dec) | Knipperende kerstlampjes langs de balk; 20–26 dec een kerstmuts |
| Oud & Nieuw | Oliebollen, feestmuts, slinger, vuurwerk in het raam; om 00:00 schrikt hij zich rot ("WAAH!") en daarna een dansje |
| Koningsdag | Oranje kroontje, rood-wit-blauw-oranje slinger, "Ik verkoop deze balk. Twee euro." |
| Oranje speelt (data in config) | Oranje sjaal, "Hup Holland hup!" |
| Pasen | Konijnenoren en een paasei in een nestje |
| Halloween | Heksenhoed, gloeiende pompoen, vleermuis in het raam |
| Valentijn | Zwevende hartjes, "Ik vind jou oehoe-leuk." |
| Eerste lentedag | Bloemetje bij zijn oor |
| Dierendag | Strikje, "Vandaag is het míjn dag." |
| Maandagochtend | Koffiemok "MAANDAG ☹" en chagrijnige gedachten |
| Vrijdagavond | "Weekend!" en vaker een dansje |

Daarnaast elke nacht:
- **Gedachten voor voorbijgangers** in een tekstballon: *"Ik zie je wel hoor."*,
  *"Ik ben niet dik. Ik ben donzig."*, *"Uilskuiken? Pardon?!"*, en na 1:00
  *"Waarom ben jij nog wakker?"*. Op feestdagen komen er passende gedachten bij.
- **Dromen** overdag in een denkwolkje: *"zzz... de Dom is van chocola..."*
- **Niezen** (*"HATSJOE!"*, met rondvliegende veertjes), **de hik**, en een **dansje**.
- **Spinnetje**: zakt aan een draadje voor zijn snavel. De uil kijkt scheel en blaast het weg.

Testen kan met bijvoorbeeld `?datum=2026-12-05&tijd=20:00` (pakjesavond) of
`?datum=2026-12-31&tijd=23:58` (wacht twee minuten op middernacht).

## Staand of liggend scherm

De indeling past zich vanzelf aan de beeldverhouding aan:

- **Staand (portrait)**: de uil vult bijna het hele scherm (`uilGrootteStaand`, standaard
  0.72 van de schermhoogte), met een raampje rechtsboven in de hoek. Omdat het scherm klein is,
  worden de gebaren versterkt (`gebaarSterkte`, standaard 1.4×): kop scheef houden, kantelen,
  hupjes, knikken en vleugelgebaren zijn groter. Tekstballonnen, BONGs, nootjes en zzz zijn ook groter.
- **Liggend**: de uil zit in het midden en het raam staat ernaast (`uilGrootte`).

Op je Mac kun je staand testen met `?staand`, of door je browservenster smal te maken.
Op de Pi draai je het beeld via het besturingssysteem, zodat de browser gewoon een staand
scherm ziet. Op Raspberry Pi OS (Bookworm) kan dat via *Screen Configuration* →
*Orientation*, of met `wlr-randr --output HDMI-A-1 --transform 90`. In fase 3 zet ik dat
automatisch goed.

## Instellingen

Alles staat in [`config.js`](config.js): locatie, helderheid dag/nacht, maximale fps,
grootte van de uil, hoe vaak het muisje langskomt, de Dom, **verjaardagen** en Oranje-wedstrijden.

## Bestanden

```
zolderuil/
  index.html      pagina
  config.js       jouw instellingen
  js/astro.js     zon, maan, maanfase, zonsopkomst/-ondergang
  js/scene.js     zolder, balk, raam, lucht, lantaarn
  js/owl.js       de uil: onderdelen en tekenwerk
  js/brain.js     behoeftes, dagritme en alle acties
  js/kalender.js  feestdagen, verjaardagen, gedachten
  js/props.js     spullen op de balk, slinger, lampjes, vuurwerk
  js/main.js      klok, hoofdlus, dimmen, debug
```

## Aannames (nog te bevestigen)

- **Pi**: ik ga uit van een Pi 4 of 5. Bij een Zero 2 W zet je `maxFps` op 20 en
  `maxPixelRatio` op 1. Als dat te zwaar blijkt, maak ik een lichtere versie.
- **Richting**: het scherm kijkt naar buiten, vandaar het dimmen 's nachts. Het hangt staand.
- **Stijl**: warm prentenboek.

## Volgende fases

1. ~~Uil, idle-animaties, slapen/wakker, dag/nacht, lucht en maan~~ ✅
2. ~~Feestdagen, outfits, verjaardagen, de Dom~~ ✅ — nog te doen: weer (Open-Meteo)
3. Pi: kiosk-modus, autostart, herstart bij een crash, updates via `git pull`
