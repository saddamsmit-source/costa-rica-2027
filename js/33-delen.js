/* =====================================================================
   v7.1 · Deel deze app (Meer → Deel deze app)
   Deelt alleen de publieke URL en een vaste tekst. Geen gegevens uit de
   opslag, geen back-up, geen notities. Opslag wordt niet aangeraakt.
   ===================================================================== */
const SHARE_URL='https://saddamsmit-source.github.io/costa-rica-2027/';
const SHARE_TITLE='Costa Rica 2027 — Reisapp';
const SHARE_TEXT='Bekijk onze Costa Rica 2027-reisapp met route, activiteiten, wildlife en praktische reisinformatie! 🌴🦜';
const SHARE_ICON='<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/>';
function shI(p,s){return `<svg viewBox="0 0 24 24" width="${s||20}" height="${s||20}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`}
function shPayload(){return {title:SHARE_TITLE,text:SHARE_TEXT,url:SHARE_URL}}
function shCanNative(){return typeof navigator.share==='function'}
DSD_MORE.share=()=>{const t=encodeURIComponent(SHARE_TEXT+' '+SHARE_URL);
  return dsdSub('Deel deze app',`<div class="ds-card sh-card">
    <p class="ds-meta" style="margin:0 0 12px">Stuur de link naar familie, vrienden of medereizigers. Alleen de link en deze tekst worden gedeeld.</p>
    <div class="sh-preview"><b>${esc(SHARE_TITLE)}</b><span>${esc(SHARE_TEXT)}</span><small>${esc(SHARE_URL)}</small></div>
    <div class="sh-btns">${shCanNative()?`<button class="ds-btn primary" id="shNative">${shI(SHARE_ICON,18)}Delen</button>`:''}<button class="ds-btn ${shCanNative()?'secondary':'primary'}" id="shCopy">${shI('<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',18)}Kopieer link</button></div>
    <p class="sh-ok" id="shOk" role="status" aria-live="polite"></p>
    <div class="sh-alt"><a href="https://wa.me/?text=${t}" target="_blank" rel="noopener">WhatsApp</a><a href="mailto:?subject=${encodeURIComponent(SHARE_TITLE)}&body=${t}">E-mail</a></div></div>
  <div class="ds-card sh-card"><span class="ds-label">Installeren als app</span>
    <div class="sh-step"><b>Android</b><span>Open de link in Chrome en kies in het menu ‘App installeren’ of ‘Toevoegen aan startscherm’.</span></div>
    <div class="sh-step"><b>iPhone</b><span>Open de link in Safari, tik op het deelmenu en kies ‘Zet op beginscherm’.</span></div></div>
  <div class="ds-card sh-card"><span class="ds-label">Privacy</span><p class="ds-meta" style="margin:6px 0 0">Iedereen heeft zijn eigen app: waarnemingen, afvinklijsten, notities en kosten blijven op het eigen toestel en worden niet gedeeld of gesynchroniseerd.</p></div>`)};
async function shCopy(){let ok=false;try{await navigator.clipboard.writeText(SHARE_URL);ok=true}catch(e){const t=document.createElement('textarea');t.value=SHARE_URL;t.setAttribute('readonly','');t.style.position='fixed';t.style.opacity='0';document.body.append(t);t.select();try{ok=document.execCommand('copy')}catch(_){}t.remove()}
  const s=document.getElementById('shOk');if(s){s.textContent=ok?'Link gekopieerd':'Kopiëren lukte niet. Houd de link hierboven ingedrukt om te kopiëren.';s.className='sh-ok '+(ok?'good':'bad')}return ok}
async function shNative(){try{await navigator.share(shPayload())}catch(e){if(e&&e.name==='AbortError')return;await shCopy()}}
const shPrevSettings=renderSettings;
renderSettings=function(){const h=shPrevSettings();if(dsMore)return h;
  return h.replace('<div class="ds-label ds-menulbl">Gegevens en uitleg</div><div class="ds-card ds-menu">',`<div class="ds-label ds-menulbl">Gegevens en uitleg</div><div class="ds-card ds-menu">${dsdMenuRow(shI(SHARE_ICON,20),'Deel deze app','Link sturen via WhatsApp, e-mail of kopiëren','data-ds-more="share"')}`)};
const shPrevBind=bindExtras;
bindExtras=function(){shPrevBind();const n=document.getElementById('shNative');if(n)n.onclick=shNative;const c=document.getElementById('shCopy');if(c)c.onclick=shCopy};
render();
