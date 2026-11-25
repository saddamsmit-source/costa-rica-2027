# Fotoboekproef · overdracht

25 november 2026. Deze review levert de fotoboekmodule, integratie en tests op. Privépreview v7 is het laatste beschikbare proefadres.

- Broncheckpoint Sites `40419aeb0e98a17a14f49606f1dd2dd427204d13`.
- Privépreview v7 `e2748a99f04cd1ee27c2484e19715417931932c8`.
- GitHub-basis `94e60b3eb5f2f9372d78de6cd3564b7997afd06f` (PR #9, vrijgegeven).

## Uitvoer

De foto-ZIP bevat de oorspronkelijke fotobestanden onder `fotos/JJJJ-MM-DD/`, met een volgnummer zodat bestanden van dezelfde dag op volgorde blijven. GIF-bestanden blijven als origineel intact in de ZIP. De PDF gebruikt een stilstaand beeld. Video’s worden uitgefilterd. Bij grote volumes worden ZIP-delen afzonderlijk aangevraagd. De PDF is het A4-binnenwerk in liggende stand, met vaste marges en één, twee of drie foto's per pagina. De gekozen drukker bepaalt later omslag, rug, kleurprofiel en aanleverformaat.

## Testbewijs

- VERIFIED voor de geteste pure logica. 47 assertions in een JavaScript-isolaat met testdoubles voor Blob en TextEncoder. Onder meer foto’s per reis en datum, dubbele namen, uitsluiting van clips en andere reizen, originele Blob-identiteit, pagina-afmetingen, PDF-referenties en afhandeling van ontbrekende foto’s.
- PARTIALLY TESTED voor integratie. De installer leverde zes bedoelde wijzigingen op in een gesimuleerd bronbestandensysteem. De selectie van ankers in de echte checkout, IndexedDB, browserexport, echte ZIP, PDF-weergave, kleur, print en toestel zijn NOT TESTED.
- Browser en preview BLOCKED. De uitvoerverbinding viel weg tijdens de checkout en de omgeving werd als onbeschikbaar gemeld. Oorzaak UNKNOWN. GitHub Actions leverde geen PR-runs. Branchbescherming UNKNOWN.

## Hervatten

1. Verifieer remote Sites-branch, GitHub-base/head, open PR, CI en vrijgegeven writerclaim. Haal beide bronnen op in afzonderlijke locaties.
2. Gebruik een eigen schone Sites-werkbranch op het checkpoint hierboven. Voer vanuit de GitHub-checkout `node untamed-photo-book/apply-to-sites.mjs /pad/naar/sites-checkout` uit. Bekijk de diff voordat je een broncommit maakt.
3. Voer `node tests/photo-book.mjs` en de bestaande Node-tests uit. Test uit de volledige reis de lege staat, foto’s uit twee dagen, een clip op dezelfde dag, PDF maken en openen, originele ZIP uitpakken en bytevergelijking, stoppen, heropenen, offline precache en toetsenbord.
4. Controleer MediaBox met PDF-gereedschap en render alle fixturepagina’s. Controleer leesbaarheid, aspectverhouding en datums. Pak daarna de volledige testbuild voor de bestaande privépreview in volgens de Sites-werkwijze.
