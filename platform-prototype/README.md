# UNTAMED Reisatelier — fase1 ontwikkelproef

Owner: Smittoe. Datum4 november2026. Doel: dynamische reisomgeving voorbereiden voor een georganiseerde reis of een wereldreis met onbekende datums/route. Dit is een geïsoleerde ontwikkelproef, geen vervanging van Costa Rica en geen gereed product voor veilig verwijderen na een reis.

## Openen

Sites: /trip-builder/index.html, of in de hoofdapp via Nieuwe reis → Open dynamisch Reisatelier. In de GitHub featurebranch staat dezelfde standalone proef onder platform-prototype/index.html. Serveer die map met een gewone statische HTTP-server; de browser moet ES-modules kunnen laden. Geen npm-installatie of API-sleutels nodig. De teruglink ../index.html opent op GitHub de oorspronkelijke Costa Rica-app; op Sites opent hij de hoofdapp.

Bestanden: index.html,style.css,app.js,model.js,costa-plan.json,mark.svg. PHASES.md bevat opdracht, functie-inventaris, fasen, data-/veiligheidscontract en hervatpunt. De testkopie onder platform-prototype/tests is direct uitvoerbaar met Node: node platform-prototype/tests/dynamic-trips.mjs.

## Werkt in fase1

Reis aanmaken/bewerken met optionele datums; zelfstandig/georganiseerd/gemengd; landen/tussenstops/duur/volgorde wijzigen; eigen verblijf/activiteit/vervoer/dagverslag/waarneming/budget/boeking/praktisch/paklijst-item per dag of hele reis; bedragen per valuta; items bewerken/verplaatsen; modules tonen/verbergen zonder gegevensverlies. Vervallen routedagen met inhoud blijven bereikbaar. Eigen registratiedatum blijft behouden bij routewijziging. Lokale JSON-back-up, samenvoegen met conflictenmelding, herstellen laatste verwijderde ontwikkelreis. Costa Rica als een bewerkbare kopie van het bestaande publieke23-daagse programma.

## Volgt nog

Media, kaart, volledige gestructureerde Costa Rica-pariteit, Video Studio, koppeling van deze nieuwe trips aan atlasverhaal/KPI's, per-reisinstallatie/offlinegarantie, accounts, centrale upload en geverifieerde archivering/opruimen. De checklist is een voorbereiding; voltooi-/overzetknop blijft geblokkeerd. Geen live API, geen fictief ontvangstbewijs, geen persoonsgegevens naar GitHub.

Alleen opslag in deze browser, sleutel untamed-dynamic-trips-v1. Gegevens van de atlas en pilot worden niet gemigreerd of gewijzigd. Geen productieclaims voor offlinegebruik, echte Samsung/iOS of serveroverdracht.
