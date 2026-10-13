/* =====================================================================
   v7.6 · Nederlandse namen: soorten waarvan de Nederlandse naam gelijk is
   aan de Engelse (gecontroleerd), en soorten zonder gangbare Nederlandse
   naam (Engelse naam getoond, met uitleg in het soortvenster).
   ===================================================================== */
/* Nederlandse naam is hetzelfde woord (Van Dale / Avibase: willet) */
const V76_NL_SAME=new Set(['Ocelot','Tayra','Jaguar','Margay','Jaguarundi','Coyote','Willet','Boa constrictor']);
/* geen gangbare Nederlandse naam gevonden */
const V76_NO_NL=new Set(['Black river turtle','Green parrot snake','Rufous-eyed brook frog','Dormilona','White-headed snake','Western red bat','Pacific chupare whipray']);
{const prev=wl2SheetHtml;wl2SheetHtml=function(name,region){const h=prev(name,region);
  return V76_NO_NL.has(name)?h.replace('<p class="wl2-names">','<p class="wl2-names"><span class="v76-nonl">Geen gangbare Nederlandse naam; Engelse naam getoond</span>'):h}}

/* ---------- v7.6.1 · back-upstatus ----------
   1. Downloaden registreert de back-up weer: de knop kreeg in bind() een nieuwe
      handler na bindExtras(), waardoor de registratie uit v5.1 werd overschreven.
   2. Een gecontroleerd, compleet back-upbestand telt als back-up (datum uit het
      bestand) en de status bovenaan wordt direct bijgewerkt. */
{const prev=bind;bind=function(){prev();const ex=document.getElementById('export');
  if(ex&&!ex.dataset.v761){ex.dataset.v761='1';const f=ex.onclick;ex.onclick=()=>{state.v51LastBackup=new Date().toISOString();save();f&&f.call(ex);setTimeout(render,300)}}}}
v52Verify=function(file){const out=document.getElementById('v52vres');const rd=new FileReader();
  rd.onload=()=>{let j;try{j=JSON.parse(rd.result)}catch(e){out.innerHTML='<p class="v52-bad">Dit is geen leesbaar JSON-bestand.</p>';return}
    if(!j||j.format!=='CR27_V2'||typeof j.state!=='object'||!j.state){out.innerHTML='<p class="v52-bad">Geen geldige Costa Rica 2027-back-up (formaat ontbreekt).</p>';return}
    const f=v52Count(j.state),c=v52Count(state),keys=[['notes','dagnotities'],['obs','soorten geregistreerd'],['logs','waarnemingsnotities'],['pack','paklijst afgevinkt'],['booked','geboekt'],['tracks','GPS-routes']];
    const rows=keys.map(([k,l])=>`<tr><td>${l}</td><td>${f[k]}</td><td>${c[k]}</td><td>${f[k]>=c[k]?'✓':'<b>ouder</b>'}</td></tr>`).join('');
    const ok=keys.every(([k])=>f[k]>=c[k]),made=j.exportedAt&&!isNaN(new Date(j.exportedAt))?new Date(j.exportedAt):null;
    const html=`<p class="${ok?'v52-good':'v52-bad'}">${ok?'Back-up is leesbaar en compleet ten opzichte van de app.':'Back-up is leesbaar, maar ouder dan je huidige gegevens. Download een nieuwe.'} Gemaakt: ${made?made.toLocaleString('nl-NL'):'onbekend'}.</p><table class="v52-tbl"><tr><th></th><th>Bestand</th><th>App</th><th></th></tr>${rows}</table><p class="hint">Er is niets overschreven.</p>`;
    state.v52Verified={at:new Date().toISOString(),summary:ok?'compleet':'ouder dan de app'};
    if(ok){const t=(made&&made<=new Date()?made:new Date()).toISOString();if(!state.v51LastBackup||new Date(state.v51LastBackup)<new Date(t))state.v51LastBackup=t}
    save();render();const box=document.getElementById('v52vres');if(box)box.innerHTML=html};
  rd.readAsText(file)};
/* 3. Klik op een Meer-subpagina zette dsMore terug naar '' omdat body zelf data-tab="settings"
      draagt (selector in 23-fase-d matchte body). Alleen echte navigatieknoppen resetten nog. */
{let before='';addEventListener('click',()=>{before=dsMore},true);
  document.addEventListener('click',e=>{const el=e.target.closest('[data-goto="settings"],[data-mobile="settings"],[data-tab="settings"]');if(el===document.body)dsMore=before},true)}
