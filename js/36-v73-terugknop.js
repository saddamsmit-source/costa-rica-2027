/* =====================================================================
   v7.3 · Terugknop (Android/browser)
   Elke schermwissel (tab, dag, dagtab, Meer-subpagina) en elk geopend venster
   (soortvenster, fotozoom, activiteit, waarneming, noodkaart) krijgt een
   history-stap. De terugknop sluit eerst het bovenste venster, gaat daarna
   terug naar het vorige scherm en sluit pas op het beginscherm de app.
   Raakt geen opslag (CR27_V2) aan.
   ===================================================================== */
(function(){
  if(!window.history||typeof history.pushState!=='function')return;
  /* bovenste venster eerst: [selector, sluitfunctie] */
  const OV=[
    ['.wl2-zoom',el=>el.remove()],
    ['#detailOverlay',el=>el.remove()],
    ['#dseEm',el=>el.remove()],
    ['#v84Play',()=>v84Close()],
    ['#v85Gen',()=>v85Close()],
    ['#v84Trim',()=>v84TrimClose()],
    ['#v815Lbl',()=>v815LblClose()],
    ['#v84Vid',()=>v84VidClose()],
    ['#wl2Sheet',()=>wl2Close()],
    ['#v52quick',el=>{el.remove();render()}]];
  const SEL=OV.map(o=>o[0]).join(',');
  const more=()=>typeof dsMore!=='undefined'?dsMore:'';
  const nav=()=>({tab,day:currentDay,sec:daySection,more:more()});
  const key=n=>[n.tab,n.tab==='days'?n.day:0,n.tab==='days'?n.sec:'',n.tab==='settings'?n.more:''].join('|');
  let restoring=false,skip=0,lastPush=0;
  const push=st=>{const now=Date.now();
    /* snelle reeksen (geen gebruikersactie) vervangen de stap in plaats van er veel te stapelen */
    if(now-lastPush<250&&history.state&&history.state.cr&&!history.state.ov&&!st.ov)history.replaceState(st,'');else history.pushState(st,'');
    lastPush=now};
  /* v7.4: na verversen (naar beneden vegen) blijft de app op hetzelfde scherm en dezelfde scrollpositie.
     history.state overleeft een herlaadactie in hetzelfde tabblad; een nieuwe start van de app begint op Home. */
  const saved=history.state&&history.state.cr&&history.state.nav?history.state:null;
  const reloaded=(performance.getEntriesByType&&performance.getEntriesByType('navigation')[0]||{}).type==='reload';
  if(saved&&reloaded){const n=saved.nav;
    try{tab=n.tab;currentDay=n.day;daySection=n.sec;if(typeof dsMore!=='undefined')dsMore=n.more||'';render();
      const y=+sessionStorage.getItem('cr27-scroll-'+key(n))||0;if(y)requestAnimationFrame(()=>scrollTo({top:y,behavior:'instant'}))}catch(e){}}
  history.replaceState({cr:1,nav:nav()},'');
  addEventListener('pagehide',()=>{try{sessionStorage.setItem('cr27-scroll-'+key(nav()),String(Math.round(scrollY)))}catch(e){}});
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')try{sessionStorage.setItem('cr27-scroll-'+key(nav()),String(Math.round(scrollY)))}catch(e){}});

  /* schermwissel → stap */
  const prevRender=render;
  render=function(){const r=prevRender.apply(this,arguments);
    if(!restoring){const st=history.state,cur=nav();
      if(!st||!st.cr||!st.nav||key(st.nav)!==key(cur))push({cr:1,nav:cur})}
    return r};

  /* venster open → stap; venster dicht via ×/achtergrond → eigen stap terugnemen */
  new MutationObserver(list=>{for(const m of list){
    for(const n of m.addedNodes)if(n.nodeType===1&&n.matches&&n.matches(SEL))push({cr:1,nav:nav(),ov:OV.find(o=>n.matches(o[0]))[0]});
    for(const n of m.removedNodes)if(n.nodeType===1&&n.matches&&n.matches(SEL)&&!n.dataset.v73pop){
      const st=history.state;if(st&&st.ov&&n.matches(st.ov)){skip++;history.back()}}}}).observe(document.body,{childList:true});

  const top=()=>{for(const [sel,close] of OV){const el=document.querySelector(sel);if(el)return [el,close]}return null};
  addEventListener('popstate',e=>{
    if(skip){skip--;return}
    const open=top();
    if(open){const [el,close]=open;el.dataset.v73pop='1';close(el);return}
    const st=e.state;if(!st||!st.cr||!st.nav)return;
    restoring=true;
    try{tab=st.nav.tab;currentDay=st.nav.day;daySection=st.nav.sec;if(typeof dsMore!=='undefined')dsMore=st.nav.more;render();scrollTo({top:0,behavior:'instant'})}
    finally{restoring=false}});
})();
