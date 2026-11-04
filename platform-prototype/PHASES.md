# UNTAMED — dynamische reisomgeving / faseplan

Datum: 4 november 2026. Eigenaar: Smittoe. Status: fase 1 ontwikkelproef; geen vervanging van de Costa Rica-pilot.

## Bevestigde opdracht

Eén hoofdapp maakt een reisruimte voor georganiseerd, zelfstandig of gemengd reizen. Een gebruiker hoeft vertrek, thuiskomst, duur en vervolgbestemmingen nog niet te kennen. De route kan onderweg wijzigen. Het product moet uiteindelijk alle relevante Costa Rica-functies herbruikbaar aanbieden, met zelf toe te voegen hotels per dag, activiteiten/cultuur, wildlife, vervoer, boekingen, budget, praktisch, paklijst, eigen media, dagverslagen en reisfilms. De gebruiker kiest passende onderdelen. Een reis is data/configuratie, geen nieuwe softwarekopie per bestemming.

Na de reis: expliciete afrondingscontrole, filmkeuze, overdracht aan de hoofdapp, geverifieerde ontvangst en pas daarna lokale opruimactie. Een vinkje of geslaagde netwerkrequest is geen bewijs van complete overdracht. De eigenaar test met de Costa Rica-pilot en later de wereldreis in2027. Wij bouwen dit zelf; geen externe ontwikkelaar. Account- en centrale opslagkoppeling is akkoord als latere fase, niet als al gerealiseerde capability.

## Repository en isolatie

Sites bronproject appgprj_6ae602feb1e88191a6d0c96261d0f161, uitgangspunt2c0bdebdcdf2753cf92776af2d843b7bb9548981(v0.14). Ontwikkelbranch feature/dynamic-travel-foundation. Bronruntime dist/costa-rica blijft byte-identiek. Geen wijzigingen aan de originele GitHub main of Pages-publicatie. GitHub voorbereiding op een afzonderlijke branch feature/dynamic-travel-foundation van saddamsmit-source/costa-rica-2027; alleen nieuwe map platform-prototype. Die map is de overdraagbare fase1-proef, niet een tweede canonieke kopie van de volledige Sites-atlas. Toekomstige wijzigingen aan die map vanuit de Sites-bron synchroniseren en SHA vastleggen.

Preview-entry dist/trip-builder/index.html. De hoofdapp biedt bij Nieuwe reis een expliciete ingang naar de ontwikkelproef. Bestaande reisaanmaak blijft beschikbaar. Fase1-reizen verschijnen nog niet in atlas-KPI's of filmcollecties; die adapter volgt in fase2.

Geen credentials, persoonlijke reisdata of browseropslag in Git. GitHub bevat uitsluitend code, documentatie en bestaande publieke planningsgegevens van Costa Rica. Repository is publiek; het gebruikersarchief blijft privé in de browser.

## Fases en acceptatie

| Fase | Concrete bouw | Vereist bewijs vóór gereed |
|---|---|---|
| 1 — nu | Flexibel reismodel en werkende route-/dagitem-editor, open datums, route wijzigen, herindelen en inkorten, bronplanning als kopie, lokale opslag/back-up, afronding geblokkeerd | Singapore3/Maleisië10/Thailand10; verlengen, schuiven, verwijderen zonder herinneringsverlies; quota en importfouten houden data; geen veilige-overdrachtclaim |
| 2 | Volledige functie-inventaris uitvoeren: gestructureerde boekingen/verblijven/vervoer, kaart/locaties, media en bestaande Video Studio aanpassen naar tripId; koppeling met atlasverhaal/KPI's | Costa Rica-pariteit per functie, stabiele media-/dagreferenties, geen dubbele bestanden, lokale video-eindproducten kunnen terug naar de atlas; roundtrip inclusief binaire bestanden |
| 3 | Installeerbare reisidentiteit, downloadbaar geselecteerd reispakket, lokale database/queued wijzigingen, offline openen/vastleggen | Samsung-vliegtuigstand, herstart/onderbreking, geen onverwachte landing op andere reis, downloadvolledigheid en quotafouten zichtbaar; iOS apart verifiëren |
| 4 | Accountrechten, servermetadata en mediaopslag, idempotente hervatbare uploads, conflicten, manifest/ontvangstbewijs, afronden/heropenen | Afgebroken upload hervat; serverherlezing en hashes kloppen; verschillende apparaten zien dezelfde afgeronde reis; kwaadwillende client kan geen ontvangstbevestiging fabriceren |
| 5 | Veilige lokale opruimactie en praktijktest hele keten, migratie/recoverydocumentatie | Alle bestanden gecontroleerd, lokale kopie pas na bevestiging verwijderen, opnieuw downloaden/herstellen, verlies netwerk/telefoon/browserquota testen; owner-vakantiefeedback verwerkt |

Fase1 voltooit fase2–5 niet. De planningskopie is geen migratie van eigen pilotmedia, persoonlijke notities, paklijst-vinkjes, boekingsbevestigingen of budgethistorie. Geen automatische accountkoppeling of AI-bestemmingsverrijking.

## Functie-inventaris Costa Rica → herbruikbaar

| Bestaande functie / bron | Fase1 | Vervolg |
|---|---|---|
| Reisdagen en activiteiten — js/01-basis.js,04-v46-dagoverzicht.js | 23 bronplanningsdagen, plaatsen, activiteiten/status en tips als zelfstandige kopie | Dagblokken en activiteitvelden zonder vaste reiscode |
| Routekaart — js/24-kaart-extra.js,37-v74-kaart.js | Tussenstops en volgorde, nog geen kaart | Optionele coördinaten, geografie en eerlijke routegeometrie; offline kaartlicenties apart |
| Verblijven — js/44-v80-hotel.js | Eigen verblijf per dag, details/bedrag/status | Meerdaagse verblijven, adres/contact, boekingen en foto's |
| Boekingen en vervoer — basis/fase-modules | Handmatige tekstitems en bevestigingsstatus | Gestructureerde reserveringen, aankomst/vertrek en vouchers |
| Budget — bestaande budgetmodule | Handmatige budgetitems, bedragen per valuta apart | Valutakoersen met bron/tijd, geen dubbeltelling, uitgaven/raming onderscheiden |
| Praktisch/nood — basis/fase-modules | Handmatige gegevens per dag/hele reis | Per land relevante praktische inhoud en offline noodkaart |
| Paklijst — js/45-v81-paklijst.js | Eigen items afvinken | Groepen, aantallen, bestemmingscontext; geen stil overnemen van Costa Rica-specifieke medische/visumadviezen |
| Wildlife — js/30-wildlife-data.js,43-v80-kans.js,48-v86-dagwaarneming.js | Eigen soort/ontmoeting, datum en onderwerp | Centrale soortenbibliotheek, waarneming/locatie/media; informatie per bestemming en seizoen; geen verzonnen trefkansen |
| Weer/klimaat — js/34-luchtvochtigheid.js en weerbron | Niet gekoppeld | Actuele bron vs klimaatindicatie duidelijk; offline status en freshness |
| Eigen foto's/clips — js/46-v84-eigenfoto.js,51-v815-sfeer-verblijf.js | Nog niet ingevoerd | Stabiele media-ID, originelen/afgeleiden, observatie/verblijf/dag/highlight-relaties |
| Video Studio — js/47-v85-video.js,50-v89-reisvideo-home.js,52-v91-dagvoorbeeld.js,55-v10-studio.js,56-v10-duplicaten.js | Nog niet gekoppeld | Parameteriseer reisdagen/plaatsen, preview, selectie/duplicaten, eindfilm, echte encodingtest op Samsung; verwerking en opslag apart |
| Dagnotities/Polarsteps | Eigen dagverslag met optionele vaste registratiedatum | Atlasverhaal, import/kopie; geen onbevestigde live Polarsteps-API |
| Back-up — js/54-v10-backup.js, atlas travel-archive.js | Eigen tekst/planning-JSON, samenvoegen behoudt bestaande conflicten | Binaire media + manifests, versiecompatibiliteit en onafhankelijke hersteltest |
| PWA/offline — originele sw.js/js/03-pwa.js | Geen nieuwe installatiefunctie | Reis-specifieke manifestidentiteit en cacheafbakening; root/child service workers en private login testen |

## Fase1 datacontract

model.js is DOM-vrij en testbaar. Bestandformat untamed-dynamic-trips, schemaVersion1, opslag untamed-dynamic-trips-v1. Trip: stabiel id, naam, type, optionele vertrek-/thuiskomstdatum, status, revisie, gekozen modules, tussenstops, dagen en items. Tussenstop heeft stabiel id en voorlopige duur. Dag-ID blijft gelijk wanneer vorige stops langer worden of de volgorde verandert. Datums in de planning zijn afgeleid van vertrek+volgorde. Werkelijk geregistreerde datum in een herinnering is een apart veld en schuift niet mee.

Verwijderde/ingekorte routedagen blijven als inactieve dagen bestaan. Items verdwijnen niet; ze zijn bereikbaar als bewaard buiten de route en te verplaatsen. Opnieuw verlengen activeert dezelfde dagen. Het verbergen van een module verwijdert geen items. Budgettotalen tellen alleen budgetitems per valuta; geen koersgok of dubbel tellen van prijzen bij hotels/boekingen.

Writes valideren vóór localStorage.setItem; mislukte write laat de voorgaande toestand staan. Revisiecontrole wijst een inmiddels gewijzigde andere-tab-versie af. Dit is nog geen serverconflictoplossing of bewezen volledige gelijktijdige multiwriter-lock. JSON-import voegt uitsluitend ontbrekende reizen toe; afwijkende bestaande ID's worden behouden en gemeld. Veiligheidskopie vóór import. Laatste verwijderde ontwikkelreis is terug te zetten via Back-up, ook na herladen. Deze tijdelijke herstelkopie vervangt geen externe back-up.

Fase1-statussen: planning, traveling, completion_review. Er bestaat bewust geen archived/safe_to_remove-status. completionStatus.ready blijft false zolang de echte overdrachtsservice ontbreekt. Geen losse cliëntvinkjes gebruiken om later de centrale ontvangstcontrole te omzeilen.

## Definitieve overdracht — ontwerp voor fase4/5

1. Stop de reis niet direct na bevestiging: maak een bevroren snapshot met tripId, schema-/content-revisie en manifest van teksten plus elk bron- en eindbestand (mediaId, bytes, MIME, SHA-256). Een actieve wijziging maakt dit manifest verouderd en vereist een nieuwe controle.
2. Upload met stabiele idempotencykeys en herstartbare delen; per bestand voortgang/foutreden. Geen onbeperkte afhankelijkheid van achtergrondwerk bij gesloten telefoon; bied expliciet 'verder overzetten' tijdens openen/online.
3. Server controleert eigenaarschap, bytes en inhoudhash; schrijft metadata en ontvangen objectversies duurzaam. Dagboek-/foto-/filmselectie moet expliciet zijn; de eindfilm vervangt nooit stilzwijgend gekozen bronbestanden.
4. Herlees centrale metadata en controleer ALLE manifestbestanden. Ontvangstbewijs verwijst naar exact manifest/revisie. Alleen serverbevestigde volledige ontvangst kan de reis als gearchiveerd markeren.
5. Toon aantallen/bytes en melding 'Bestanden gecontroleerd overgezet' met datum. Bij gedeeltelijke upload/fout/nieuwere lokale revisie blijft verwijderen geblokkeerd. Bied een externe archiefdownload voor herstel.
6. Lokale opruimactie per tripId; laat gedeelde bronbestanden en andere reizen ongemoeid. Geen clear-all-site-data of gedeelde database verwijderen. Een telefoon kan verwijdering van een pictogram anders behandelen dan het wissen van browserdata; dit per platform testen, niet veronderstellen.
7. Heropenen maakt een nieuwe revisie zonder definitief archief te overschrijven; verwijderingen en conflicten krijgen expliciete historie/herstelbeleid. Account-/retentiebeleid eerst vastleggen.

## Eerstvolgende werkpakket

Fase2A: huidig atelier verbinden met de atlas via een expliciete, gevalideerde adapter met ondersteuning voor open datums in dashboard/filters. Daarna media-ID's en lokale opslag hergebruiken; alle Costa Rica-functies één voor één onder de functiematrix verifiëren. Geen massale rewrite of vervangen van de pilot vóór pariteitsbewijs. Fase2B: Video Studio trip-onafhankelijk maken en werkelijke MP4-output op het doelapparaat testen.
