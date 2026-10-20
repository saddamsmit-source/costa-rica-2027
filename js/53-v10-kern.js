/* =====================================================================
   v10 · Professionaliseringsronde: kern
   A. Feedbacklaag: toast (met Ongedaan maken), bevestigingsvenster in app-stijl, foutvertaler.
      Vervangt de browsermeldingen (alert/confirm met "…github.io zegt").
   B. Lichte Wildlife-tab per dag: soorten die in de compacte weergave toch verborgen zijn, worden niet meer
      opgebouwd (eerst 259 kaarten, ~10.700 elementen op dag 6). Ze komen er pas bij "Toon alle", bij een filter
      of bij zoeken. Tellingen, filters, zoeken, Focus vandaag en waarnemingen werken zoals voorheen.
   C. Directe mediafeedback: na het kiezen van foto's staat er meteen een voorbeeld met laadteken.
   ===================================================================== */
/* ---------- A. feedbacklaag ---------- */
let v10ToastT=null;
function v10Toast(text,o={}){document.getElementById('v10Toast')?.remove();clearTimeout(v10ToastT);
  const t=document.createElement('div');t.id='v10Toast';t.className='v10-toast '+(o.kind||'ok');t.setAttribute('role',o.kind==='err'?'alert':'status');
  t.innerHTML=`<span>${esc(text)}</span>${o.action?`<button type="button">${esc(o.action)}</button>`:''}`;document.body.append(t);
  const close=()=>{t.classList.add('out');setTimeout(()=>t.remove(),180)};
  if(o.action)t.querySelector('button').onclick=()=>{close();try{o.onAction&&o.onAction()}catch(e){}};
  v10ToastT=setTimeout(close,o.ms||(o.action?6000:3500));return t}
/* bevestigen in app-stijl; geeft een Promise<boolean>. Terugknop of buiten tikken = annuleren */
function v10Confirm(o){if(typeof o==='string')o={text:o};return new Promise(res=>{document.getElementById('v10Dlg')?.remove();
  const el=document.createElement('div');el.id='v10Dlg';el.className='v10-dlg';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');el.setAttribute('aria-label',o.title||'Bevestigen');
  el.innerHTML=`<div class="v10-dlg-box">${o.title?`<h3>${esc(o.title)}</h3>`:''}${o.text?`<p>${esc(o.text).replace(/\n/g,'<br>')}</p>`:''}
    <div class="v10-dlg-btns"><button type="button" class="ds-btn secondary" data-d="no">${esc(o.cancel||'Annuleren')}</button><button type="button" class="ds-btn ${o.danger?'danger':'primary'}" data-d="yes">${esc(o.ok||'Doorgaan')}</button></div></div>`;
  const done=v=>{el.v10Done=null;el.classList.add('out');setTimeout(()=>el.remove(),150);res(v)};el.v10Done=()=>done(false);
  el.querySelector('[data-d="yes"]').onclick=()=>done(true);el.querySelector('[data-d="no"]').onclick=()=>done(false);el.onclick=e=>{if(e.target===el)done(false)};
  document.body.append(el);el.querySelector('[data-d="yes"]').focus()})}
function v10DlgClose(){const el=document.getElementById('v10Dlg');if(el&&el.v10Done)el.v10Done();else el?.remove()}
/* foutvertaler: wat ging mis → wat betekent het → wat kun je doen. Eigen Nederlandse meldingen blijven staan */
const V10_WHAT={foto:'De foto is niet toegevoegd.',video:'De video is niet bewaard.',gps:'Je positie is niet bepaald.',backup:'De back-up is niet ingelezen.',restore:'Terugzetten is niet gelukt.',
  download:'Downloaden is niet gelukt.',fotobackup:'De back-up is niet gemaakt.',reisvideo:'De reisvideo is niet gemaakt.',opslaan:'Opslaan is niet gelukt.'};
function v10Why(e,ctx){const what=V10_WHAT[ctx]||'Dat is niet gelukt.',m=String(e&&e.message||e||''),n=String(e&&e.name||'');
  if(/quota/i.test(n+m))return `${what} De opslag op deze telefoon is vol. Maak een back-up, verwijder oude foto's of video's en probeer het opnieuw.`;
  if(e&&typeof e.code==='number'&&'PERMISSION_DENIED' in e)return e.code===1?`${what} Locatie staat uit voor deze app. Zet locatie aan in Instellingen › Privacy › Locatievoorzieningen en probeer het opnieuw.`:e.code===3?`${what} Het duurde te lang. Probeer het opnieuw, liefst buiten.`:`${what} Er is nu geen GPS-signaal. Probeer het zo opnieuw, liefst buiten.`;
  if(/failed to fetch|load failed|networkerror|network/i.test(m))return `${what} Er is geen internetverbinding. Probeer het opnieuw zodra je online bent.`;
  if(/abort/i.test(n+m))return `${what} Het werd onderbroken. Probeer het opnieuw en houd de app open.`;
  if(/notsupported|encoding|decode|codec|media/i.test(n+m))return `${what} Dit bestand kan op dit toestel niet worden verwerkt. Probeer een ander bestand of een kortere video.`;
  const technical=!m||/\b(the|failed|not|error|denied|unable|invalid|cannot|undefined|null|unexpected|exception)\b/i.test(m)||!/[aeiou]/i.test(m);
  return technical?`${what} Er ging iets mis op dit toestel. Probeer het opnieuw; lukt het niet, sluit de app en open hem opnieuw.`:`${what} ${m}`}
function v10Fail(e,ctx){try{console.warn('['+ctx+']',e)}catch(x){}return v10Toast(v10Why(e,ctx),{kind:'err',ms:8000})}
/* vangnet: een vergeten alert wordt een toast in plaats van een browsermelding */
window.alert=m=>{v10Toast(String(m),{kind:'warn',ms:7000})};
/* melding die een herlaad overleeft (bijv. na import) */
function v10Flash(text){try{sessionStorage.setItem('v10Flash',text)}catch(e){}}
setTimeout(()=>{let t=null;try{t=sessionStorage.getItem('v10Flash');sessionStorage.removeItem('v10Flash')}catch(e){}if(t)v10Toast(t,{ms:6000})},400);
/* ongedaan maken van verwijderen: het record wordt in het geheugen bewaard en kan terug */
async function v10RemoveMedia(id,after){const all=[...V84.list,...V84.vids,...V84.moods,...V84.stays],rec=all.find(x=>x.id===id);if(!rec)return;
  const sibFav=rec.kind==='photo'&&rec.fav?V84.list.filter(x=>x.sp===rec.sp&&x.id!==id):[];
  await v84Remove(id);after&&after();
  v10Toast(rec.kind==='video'?'Video verwijderd':rec.kind==='mood'?'Sfeerfoto verwijderd':rec.kind==='stay'?'Foto van het verblijf verwijderd':'Foto verwijderd',{action:'Ongedaan maken',onAction:async()=>{
    await v84Write(st=>{st.put(rec);if(rec.fav)sibFav.forEach(x=>st.put({...x,fav:false}))});await v84Load();after&&after();v10Toast('Teruggezet')}})}
/* ---------- B. lichte Wildlife-tab per dag ---------- */
const V10_HYD=new Set();let V10_LAZY=null;
/* zelfde keuze als de compacte weergave (v7.5): per groep de 3 eerste, kans ≥3 tot 8, eigen soorten altijd */
{const prevSL=speciesList;speciesList=function(d){const lazy=tab==='days'&&daySection==='wildlife'&&!v50Query.trim()&&v47Filter==='Alle'&&!V75_OPEN.has(d.id)&&!V10_HYD.has(d.id);
  V10_LAZY=lazy?{keep:{},n:0}:null;try{return prevSL(d)}finally{V10_LAZY=null}}}
{const prevCard=v47Card;v47Card=function(name,region,focus){const L=V10_LAZY;if(!L||focus)return prevCard(name,region,focus);
  const cat=v47Info(name).cat,own=cat==='Zelf toegevoegd',ch=v47Chance(region,name)||0,k=L.keep[cat]||0;
  if(own||(ch>=3&&k<8)||k<3){L.keep[cat]=k+1;return prevCard(name,region,focus)}
  L.n++;return '<i class="v10-lazy" hidden></i>'}}
/* na de compacte weergave: telling en knop "Toon alle" ook als alles wat verborgen is nog niet is opgebouwd */
{const prev=v75Compact;v75Compact=function(){prev();if(tab!=='days'||daySection!=='wildlife')return;const sec=v75Sec();if(!sec)return;const lazy=sec.querySelectorAll('.v10-lazy').length;if(!lazy)return;
  const shown=sec.querySelectorAll('.v47-sp:not(.v75-x)').length,total=sec.querySelectorAll('.v47-sp').length+lazy;
  const sub=sec.querySelector('.ds-wild-sech small');if(sub)sub.textContent=`Makkelijkste eerst · ${shown} van ${total}`;
  let b=sec.querySelector('.v75-all');if(!b){b=document.createElement('button');b.className='ds-btn secondary v75-all';sec.append(b)}
  b.textContent=`Toon alle ${total} soorten in deze regio`;b.onclick=()=>{V75_OPEN.add(currentDay);const y=scrollY;render();scrollTo(0,y)}}}
/* zoeken op de dag: eerst alles opbouwen (één keer per dag), dan filteren; het zoekveld houdt focus en cursor */
function v10Hydrate(){if(!(tab==='days'&&daySection==='wildlife')||!document.querySelector('.v10-lazy'))return false;V10_HYD.add(currentDay);
  const q=document.getElementById('v50q'),focused=document.activeElement===q,pos=q?q.selectionStart:0,y=scrollY;render();scrollTo(0,y);
  const q2=document.getElementById('v50q');if(q2&&focused){q2.focus();try{q2.setSelectionRange(pos,pos)}catch(e){}}v50ApplyFilter();return true}
{const prev=v50ApplyFilter;v50ApplyFilter=function(){if(v50Query.trim()&&v10Hydrate())return;return prev()}}
/* ---------- C. directe mediafeedback ---------- */
/* foto's kiezen → meteen een voorbeeld met laadteken in het juiste raster; daarna gaat de verwerking gewoon door.
   Luistert in de capture-fase, dus vóór de bestaande verwerking van het invoerveld. */
document.addEventListener('change',e=>{const inp=e.target;if(!(inp instanceof HTMLInputElement)||inp.type!=='file'||!inp.files?.length)return;
  if(!inp.matches('[data-v84-add],[data-v84-madd],[data-v815-sadd],[data-v88-photo],#v88mood'))return;
  const imgs=[...inp.files].filter(f=>/^image\//.test(f.type)||!f.type);if(!imgs.length)return;
  const box=inp.closest('.v84-day,.v84-mood,.v815-stay');
  if(box){let grid=box.querySelector('.v84-grid');if(!grid){grid=document.createElement('div');grid.className='v84-grid';(inp.closest('.v84-adds')||inp.closest('label')).before(grid)}
    imgs.slice(0,15).forEach(f=>{const u=URL.createObjectURL(f),d=document.createElement('div');d.className='v84-ph v10-pending';d.setAttribute('aria-label','Foto wordt verwerkt');d.innerHTML=`<img src="${u}" alt="">`;grid.append(d);setTimeout(()=>URL.revokeObjectURL(u),60000)})}
  else v10Toast(imgs.length>1?`${imgs.length} foto's worden verwerkt…`:'Foto wordt verwerkt…',{ms:2500})},true);

/* ---------- zwevende knop: klapt in tot icoon bij naar beneden scrollen, komt terug bij omhoog ---------- */
{let lastY=scrollY;addEventListener('scroll',()=>{const f=document.querySelector('.ds-fab');if(!f)return;
  if(!f.querySelector('.v10-fl')){[...f.childNodes].forEach(n=>{if(n.nodeType===3&&n.textContent.trim()){const s=document.createElement('span');s.className='v10-fl';s.textContent=n.textContent;n.replaceWith(s)}})}
  const y=scrollY;if(Math.abs(y-lastY)<8)return;f.classList.toggle('v10-mini',y>lastY&&y>160);lastY=y},{passive:true})}

/* eerste gebruik: zolang er nog niets gezien is, krijgt het eerste oog-icoon het woord "Gezien" erbij */
{const prev=bind;bind=function(){prev();if(v43Stats().seen)return;const b=[...document.querySelectorAll('#app [data-v43-kind="seen"]')].find(x=>x.offsetParent);if(b)b.classList.add('v10-hint')}}
