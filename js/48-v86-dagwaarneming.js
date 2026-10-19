/* =====================================================================
   v8.6 · Waarnemingen per dag
   Naast de bestaande waarneming per bestemming (state.v43Observations[id].places[regio]) komt per soort
   een lijst per reisdag: o.days[dag] = {r: regio, t: tijd, photo: bool}.
   - In het Wildlife-tabblad van een dag gaat elk vinkje over díe dag. Dezelfde soort kan dus op dag 6 én dag 13
     gezien zijn, elk met een eigen tijd en eigen foto's/video.
   - places[regio] blijft bestaan en wordt afgeleid (gezien als er minstens één dag in die regio is); alle
     bestaande tellingen, kaart en logboek blijven zo ongewijzigd werken.
   - Buiten een dag (Wildlife-pagina, soortvenster daar) werkt een vinkje zoals voorheen per bestemming en krijgt
     het een dag: vandaag als dat een reisdag in die bestemming is, anders de dag van de tijdstempel, anders de
     eerste dag van die bestemming.
   - Migratie: bestaande vinkjes krijgen op dezelfde manier een dag; er wordt niets gewist. Vooraf een
     veiligheidskopie in localStorage (CR27_V86_PRE).
   ===================================================================== */
const V86_PRE='CR27_V86_PRE';
const v86DaysOf=region=>S.filter(d=>v47Region(d)===region).map(d=>d.id);
/* dag waarop een waarneming in een bestemming hoort */
function v86DayFor(region,t){const days=v86DaysOf(region);if(!days.length)return 0;const iso=v85LocalDate(t||new Date().toISOString());
  const d=S.find(x=>x.date===iso&&days.includes(x.id));return d?d.id:days[0]}
/* dag-context: alleen in het Wildlife-tabblad van een dag (en vensters die daarvandaan geopend zijn) */
const v86Ctx=region=>tab==='days'&&currentDay&&S[currentDay-1]&&v47Region(S[currentDay-1])===region?currentDay:0;
function v86Obs(name){const id=v43name(name);state.v43Observations[id]??={name,places:{}};const o=state.v43Observations[id];o.places??={};o.days??={};return o}
/* bestemming afleiden uit de dagen */
function v86Agg(o,region){const recs=Object.values(o.days||{}).filter(r=>r.r===region);o.places[region]??={seen:false,photo:false};const p=o.places[region];
  p.seen=recs.length>0;p.photo=recs.some(r=>r.photo);
  if(p.seen){const ts=recs.map(r=>r.t).filter(Boolean).sort();if(ts[0]&&!p.t)p.t=ts[0]}else{p.photo=false;delete p.t;delete p.loc}
  return p}
function v86SetDay(name,region,day,kind,force){const o=v86Obs(name),k=String(day);let r=o.days[k];
  if(kind==='photo'){const v=force??!(r&&r.photo);if(v){r=o.days[k]??={r:region,t:new Date().toISOString()};r.photo=true}else if(r)r.photo=false}
  else{const v=force??!r;if(v){if(!r)o.days[k]={r:region,t:new Date().toISOString()}}else delete o.days[k]}
  v86Agg(o,region);save();const d=o.days[k];return {seen:!!d,photo:!!d?.photo,t:d?.t}}
/* bestemming → dagen gelijktrekken (idempotent; voegt alleen toe of volgt een uitgezet vinkje) */
function v86Reconcile(o){o.days??={};o.places??={};let ch=false;
  for(const [R,p] of Object.entries(o.places)){const recs=Object.entries(o.days).filter(([,r])=>r.r===R);
    if(p.seen&&!recs.length){const d=v86DayFor(R,p.t);if(d){o.days[d]={r:R,t:p.t||'',photo:!!p.photo};ch=true}}
    else if(!p.seen&&recs.length){recs.forEach(([k])=>delete o.days[k]);ch=true}
    else if(p.seen){if(p.photo&&!recs.some(([,r])=>r.photo)){recs[0][1].photo=true;ch=true}else if(!p.photo&&recs.some(([,r])=>r.photo)){recs.forEach(([,r])=>r.photo=false);ch=true}}}
  for(const r of Object.values(o.days))if(!o.places[r.r]||!o.places[r.r].seen){v86Agg(o,r.r);ch=true}
  return ch}
function v86ReconcileAll(){let ch=false;for(const o of Object.values(state.v43Observations||{}))ch=v86Reconcile(o)||ch;if(ch)save();return ch}
/* eenmalige migratie met veiligheidskopie */
(function(){if(state.v86Days)return;const has=Object.keys(state.v43Observations||{}).length;
  if(has)try{localStorage.setItem(V86_PRE,JSON.stringify({at:new Date().toISOString(),state}))}catch(e){}
  v86ReconcileAll();state.v86Days=1;save()})();

/* alle bestaande schrijfroutes lopen via v52Set: in dag-context per dag, anders per bestemming + gelijktrekken */
{const prev=v52Set;v52Set=function(name,place,kind,force){const d=v86Ctx(place);
  if(d){const r=v86SetDay(name,place,d,kind,force);if(typeof dseTag==='function')dseTag(name,place);return r}
  const rec=prev(name,place,kind,force);const o=v86Obs(name);
  if(rec.seen&&!Object.values(o.days).some(r=>r.r===place)){const dd=v86DayFor(place,rec.t);if(dd)o.days[dd]={r:place,t:rec.t||new Date().toISOString(),photo:!!rec.photo}}
  v86Reconcile(o);save();return rec}}
/* de oude knopafhandeling (01-basis) zette de vlag rechtstreeks; nu via v52Set */
document.addEventListener('click',e=>{const b=e.target.closest('[data-v43-species]');if(!b)return;e.stopPropagation();e.preventDefault();
  const name=decodeURIComponent(b.dataset.v43Species),place=decodeURIComponent(b.dataset.v43Place);v52Set(name,place,b.dataset.v43Kind);
  if(typeof dseTag==='function')dseTag(name,place);render()},true);
/* weergave in dag-context: gezien/foto van díe dag; andere dagen als "ook gezien" */
{const prev=v47Obs;v47Obs=function(name,region){const res=prev(name,region),d=v86Ctx(region);if(!d)return res;
  const o=state.v43Observations[v43name(name)],r=o?.days?.[d];
  const other=Object.entries(o?.days||{}).filter(([k])=>+k!==d).sort((a,b)=>a[0]-b[0]).map(([k,x])=>`dag ${k} (${x.r})`);
  return {here:r?{...res.here,seen:true,photo:!!r.photo,t:r.t}:{},other}}}
{const prev=wl2SheetHtml;wl2SheetHtml=function(name,region){const h=prev(name,region),d=v86Ctx(region);
  return d?h.replace(`<div class="wl2-reg"><span class="ds-label">${esc(region)}</span>`,`<div class="wl2-reg"><span class="ds-label">${esc(region)} · dag ${d}</span>`):h}}
{const prev=render;render=function(){try{v86ReconcileAll()}catch(e){}return prev()}}
