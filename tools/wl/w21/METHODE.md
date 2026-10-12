# Wildlife 2.1 – trefkansmethode

De kans per soort per regio is een kwalitatieve inschatting voor **jullie excursie in februari**, geen garantie.
Schaal: **4 Zeer kansrijk** (meestal gezien), **3 Kansrijk** (vaak), **2 Mogelijk** (met wat geluk of een goede gids),
**1 Zeldzaam / uitzonderlijk** (alleen met veel geluk). Kans 1 staat alleen in het soortvenster, niet in de regiolijst.

## Bronnen
| Groep | Bron | Maat |
|---|---|---|
| Vogels | eBird Observation Dataset via GBIF (jan–apr 2015–2025) | aandeel waarnemers in de regiocirkel dat de soort meldde |
| Zoogdieren, reptielen, amfibieën | iNaturalist (jan–apr, wild, verifieerbaar) | aandeel waarnemers binnen dezelfde diergroep in de regiocirkel |
| Zeeleven, zeezoogdieren, zeeschildpadden | handmatig per excursie (walvistocht Uvita, boot Sierpe/Drake, snorkelen Isla del Caño) | zie `chance_overrides.json` |

Regiocirkels staan in `tools/wl/regions.json`. Per regio telt de cirkel met de hoogste waarde; cirkels met te weinig
waarnemers tellen niet mee (eBird < 150, iNaturalist < 100 per diergroep).

Voor soorten die de GBIF-backbone niet of samengevoegd kent (recente splitsingen en nieuwe geslachtsnamen) is op de exacte
eBird-naam gezocht (`verbatimScientificName`, stap `s21img`). eBird publiceert geen locaties van gevoelige soorten
(o.a. Great green macaw, Yellow-naped amazon); die zijn voorzichtig handmatig ingeschat en zo gemarkeerd.

## Drempels
| Kans | Vogels (eBird) | Overige (iNaturalist) |
|---|---|---|
| 4 | ≥ 50% | ≥ 35% |
| 3 | 20–50% | 15–35% |
| 2 | 5–20% | 4–15% |
| 1 | 0,2–5% (minimaal 3 waarnemers) | elke waarneming |

## Correcties (factoren)
- **Vindbaarheid**: schuwe grondvogels (tinamoes, mierlijsters, mierpitta's, boskwartels) −1.
- **Activiteitstijd**: nachtvogels max 2, met geplande nachtwandeling (Tortuguero, Monteverde) max 3.
  Nachtactieve zoogdieren max 1, met nachtwandeling max 3 (luiaards en vleermuizen met vaste dagrustplaats uitgezonderd).
  Nachtactieve kikkers max 2, met nachtwandeling max 3.
- **Katachtigen** altijd max 1. **Slangen** max 2 (uitzondering: wimperlanspuntslang in Cahuita NP, waar gidsen vaste plekken kennen).
- **San José** (aankomst/vertrek, stad): niet-vogels max 1.
- **Gevangenschap**: als ≥ 25% van de iNaturalist-meldingen als gevangen/gekweekt is gemarkeerd max 2, bij ≥ 50% max 1
  (opvangcentra, kikkertuinen).
- **Seizoen**: als februari in de maandverdeling van Costa Rica (iNaturalist) nauwelijks voorkomt, max 1 of 2.
- **Vormen**: Caribische en Pacifische vorm van de roodrugtangare en de oranjebuikvorm van de gekraagde trogon alleen in hun eigen
  leefgebied.
- **Handmatig**: alleen met reden in `chance_overrides.json` (o.a. tapir Corcovado 2 met nadruk op Sirena, quetzal Monteverde
  max 3, zeeleven per excursie).
- Soorten zonder bruikbare gegevens houden hun vorige regio's als kans 1 met de toelichting "Weinig gegevens".

De onderbouwing per soort en regio staat in `chance_basis.json` (bron, aantallen, toegepaste correcties).

## Opnieuw berekenen
```
python3 tools/wl/w21/chances.py <map met s21ebird, s21img, s21inat, base.json, new.json>
python3 tools/wl/build.py /tmp/wl
```
