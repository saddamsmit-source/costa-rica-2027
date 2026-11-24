# Untamed Atlas · visuele review v0.16

24 november 2026 · eigenaar Smittoe · concept-PR #2.

## Gebouwd

Ruimtelijk wereldbollogo met de bestaande Natural Earth-projectie, een uitnodigende homepage, vier fotografische reisthema’s en rustige poststempel-/routedetails in het reisverhaal. Beweging stopt na de introductie van acht seconden en respecteert pauze, minder beweging, databesparing en een verborgen pagina.

## Twee bronrepos

- De volledige hoofdappbaseline staat in Sites op 5c49174b8fb79681606a8c35ca7e38e937372272. De reviewbranch feat/untamed-world-atlas-review staat op 8e70ad19add733f142cc9a8618c8343643bfb425.
- Deze GitHub-repo bevat Costa Rica main op 9dee107cde666a6fbd83388a857944dd4632146b en de aparte Reisatelier-proef in concept-PR #1 op 3af1113e47a3f2be1b929fab7b4b947f0c213279.
- Deze map bewaart de volledige reviewdelta als atlas-review.patch, de nieuwe bronbestanden en tests plus source-manifest.json met bestandsintegriteit. Alle tien gewijzigde bestanden staan in de patch.
- Alle hoofdappbestanden en oorspronkelijke media zijn hiermee nog niet naar GitHub gesynchroniseerd. Persoonlijke browserdata en exports hebben hun eigen herstelroute.

## Herstellen en controleren

Open een checkout van de Sites-bronrepo en vergelijk de writerclaim en de actuele refs vóór wijzigingen. De patch geldt uitsluitend op de exacte hoofdappbaseline hierboven. Voer git apply --check atlas-review.patch uit op die baseline en pas haar vervolgens toe op een eigen featurebranch. Controleer de SHA-256-waarden uit source-manifest.json. Gebruik de GitHub-Costa Rica-root niet als atlasbaseline.

Voer alle tests/*.mjs met Node uit vanuit de hoofdappcheckout. Negen bestaande suites en de nieuwe wanderlust.mjs zijn uitgevoerd en slagen. Compatibility bevestigt 2.128 behouden Costa Rica-runtimebestanden. Tests blijven helper-/codebewijs.

Browserlayout en bediening BLOCKED in deze sessie door lokale previewtoegang. Fysieke Samsung, installatie en productie NOT TESTED. Branchbescherming UNKNOWN door HTTP 403. Onafhankelijke tweede-agentreview NOT TESTED.

## Ontwerpbestand

Untamed_Atlas_Ontwerppreview_v0.16.html is een zelfstandig HTML-bestand met ingesloten afbeeldingen, lettertypen en geografie, 7.606.814 bytes. SHA-256 9ea76d50fd340600ab7d55a7e71091fba08e1d939361e197bd00e55e71083d4f.

Het bestand toont het echte homepage- en Costa Rica-reisverhaaltemplate met voorbeeldinhoud en een illustratieve reiscollectie. De drie schermen zijn via de bovenbalk bereikbaar. Dit bestand ondersteunt visuele eigenaarreview. Het bewaart geen persoonlijke reisgegevens.

## Hervatten

Volgende actie. Visuele review op desktop en 390 px. Bedien daarna de hoofdappkernroute nieuwe reis → invoer → opslaan → heropenen, annuleren, terug en bewegingspauze. Houd lege, fout-, offline- en hersteluitkomsten per bewijslaag bij. Eigenaar beoordeelt uitstraling en beslist afzonderlijk over publicatie.

Bronnen. Index v3.14 FINAL, Projectinstructies v2.14 FINAL, Handbook v2.18 FINAL en de actuele hoofdapp-README. Lees de writerclaim in deze PR. L-068/L-069/L-078/L-079 blijven de bestaande learningverwijzingen.

EINDE-DOCUMENT · UNTAMED v0.16 REVIEW

## Downloadalternatief

De online ontwerppreview staat in deze map als Untamed_Atlas_Ontwerppreview_v0.16_Online.html. Download het bestand via GitHub en open het in een browser. Het bevat dezelfde drie ontwerpvlakken met publieke Costa Rica-foto’s die via internet laden en lokale systeemlettertypen als fallback. Grootte 428.621 bytes. SHA-256 dbd10854666764e0ef08b396a4a918620cae52428e75ea58b28e76688b428c19. Eindmarkering </html>.

De zelfstandige versie van 7.606.814 bytes is lokaal gegenereerd en gecontroleerd. Aflevering via Library is BLOCKED. De directe en voorbereide uploadroutes gaven een doelmap-/finalisatiefout. Download en volledig openen door de eigenaar staan op NOT TESTED.

EINDE-DOCUMENT · REVIEWOVERDRACHT v0.16
