/* v10 · regressietests voor de professionaliseringsronde:
   mobiele lay-out, vensterstapel, persistentie na herladen, prestatiebudget, Video Studio, back-up heen en terug,
   feedbacklaag (geen browsermeldingen), duplicaten en de opbouw van de reisvideo. */
const {chromium}=require('playwright');const path=require('path'),fs=require('fs'),os=require('os');
(async()=>{const exe=process.env.CHROME_PATH;const b=await chromium.launch(exe?{executablePath:exe,args:['--headless=new','--allow-file-access-from-files']}:{args:['--allow-file-access-from-files']});
  const errs=[],ok=[];const ctx=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,acceptDownloads:true});await ctx.route(/^https?:/,r=>r.abort());
  const p=await ctx.newPage();p.on('pageerror',e=>errs.push('JS: '+e.message));let nativeDialogs=0;p.on('dialog',d=>{nativeDialogs++;d.dismiss()});
  const URL0='file://'+path.resolve(__dirname,'..','index.html');await p.goto(URL0);await p.waitForTimeout(700);
  const step=async(name,fn)=>{try{const r=await fn();if(r&&r.length){errs.push(...r.map(x=>name+': '+x))}else ok.push(name)}catch(e){errs.push(name+': '+e.message)}};

  /* 0. bestaande gebruikersdata (formaat v9.1, zonder lum/dh/label) blijft intact na de upgrade */
  await step('bestaande data intact',async()=>{await p.evaluate(async()=>{const cv=document.createElement('canvas');cv.width=1200;cv.height=800;const g=cv.getContext('2d');g.fillStyle='#486';g.fillRect(0,0,1200,800);g.fillStyle='#fff';g.fillRect(300,200,400,300);
      const bl=await new Promise(r=>cv.toBlob(r,'image/jpeg',.85));const N='Keel-billed toucan',R='La Fortuna';
      await v84Write(st=>{st.put({id:'old-p',sp:v43name(N),name:N,region:R,day:6,kind:'photo',t:'2026-10-01T10:00:00Z',taken:'',w:1200,h:800,sharp:500,blob:bl,fav:true});st.put({id:'old-m',sp:'',name:'',region:R,day:6,kind:'mood',t:'2026-10-01T10:00:00Z',taken:'',w:1200,h:800,blob:bl,fav:false})});
      v52Set(N,R,'seen',true);state.notes[3]='oude notitie';state.v9Video={title:'Onze reis',names:'K'};save()});
    await p.reload();await p.waitForTimeout(6500);
    const r=await p.evaluate(()=>({p:V84.list.find(x=>x.id==='old-p'),m:V84.moods.find(x=>x.id==='old-m'),obs:!!state.v43Observations[v43name('Keel-billed toucan')]?.places?.['La Fortuna']?.seen,note:state.notes[3],t:state.v9Video?.title}));
    const bad=[];if(!r.p||!r.m||!r.obs||r.note!=='oude notitie'||r.t!=='Onze reis')bad.push('data: '+JSON.stringify({p:!!r.p,m:!!r.m,obs:r.obs,note:r.note,t:r.t}));
    if(r.p&&!(r.p.lum>0&&r.p.dh))bad.push('helderheid/vingerafdruk niet aangevuld: '+JSON.stringify({lum:r.p.lum,dh:r.p.dh}));
    await p.evaluate(async()=>{await v84Write(st=>{st.delete('old-p');st.delete('old-m')});await v84Load();delete state.v43Observations[v43name('Keel-billed toucan')];delete state.notes[3];delete state.v9Video;save()});return bad});

  /* 1. mobiele lay-out: geen horizontale scroll; laatste inhoud niet onder zwevende knop of onderbalk */
  await step('mobiele lay-out',async()=>p.evaluate(async()=>{const bad=[];const views=[['home'],['days','overview',6],['days','wildlife',6],['days','activities',6],['days','stay',6],['days','map',6],['map'],['wildlife'],['bookings'],['settings']];
    for(const [t,sec,d] of views){tab=t;if(d){currentDay=d;daySection=sec}render();await new Promise(r=>setTimeout(r,60));
      const sw=document.documentElement.scrollWidth;if(sw>innerWidth+1)bad.push(`${t}/${sec||''} horizontaal ${sw}px`);
      scrollTo(0,document.documentElement.scrollHeight);await new Promise(r=>setTimeout(r,60));
      const app=document.getElementById('app'),last=[...app.querySelectorAll('button,a,input,p,h2,h3,li')].filter(e=>e.offsetParent&&e.getBoundingClientRect().height>0).pop();
      const nav=document.querySelector('.mobile-bottom'),fab=document.querySelector('.ds-fab'),lim=Math.min(nav?nav.getBoundingClientRect().top:innerHeight,fab&&getComputedStyle(fab).opacity!=='0'?fab.getBoundingClientRect().top:innerHeight);
      if(last&&last.getBoundingClientRect().bottom>lim+1)bad.push(`${t}/${sec||''}: laatste element onder knop/onderbalk (${Math.round(last.getBoundingClientRect().bottom)} > ${Math.round(lim)})`);scrollTo(0,0)}
    return bad}));

  /* 2. vensterstapel: elk venster boven het vorige; terugknop sluit het bovenste eerst */
  await step('vensterstapel',async()=>{const bad=[];await p.evaluate(()=>{tab='days';currentDay=6;daySection='overview';render()});
    await p.click('#v52open');await p.waitForSelector('#v52quick');await p.evaluate(()=>wl2Open('Keel-billed toucan','La Fortuna'));await p.waitForSelector('#wl2Sheet');
    await p.evaluate(()=>{v10Confirm({title:'Test',text:'x'})});await p.waitForSelector('#v10Dlg');
    const z=await p.evaluate(()=>['#v52quick','#wl2Sheet','#v10Dlg'].map(s=>+getComputedStyle(document.querySelector(s)).zIndex));if(!(z[0]<z[1]&&z[1]<z[2]))bad.push('volgorde lagen '+z);
    const top=await p.evaluate(()=>{const r=document.querySelector('#v10Dlg .v10-dlg-box').getBoundingClientRect();return !!document.elementFromPoint(r.left+r.width/2,r.top+20)?.closest('#v10Dlg')});if(!top)bad.push('bevestigen ligt niet bovenop');
    for(const [gone,stay] of [['#v10Dlg','#wl2Sheet'],['#wl2Sheet','#v52quick'],['#v52quick',null]]){await p.evaluate(()=>history.back());await p.waitForTimeout(350);
      const st=await p.evaluate(([g,s])=>({g:!!document.querySelector(g),s:s?!!document.querySelector(s):true}),[gone,stay]);if(st.g||!st.s)bad.push(`terugknop: ${gone} niet als eerste gesloten`)}
    return bad});

  /* 3. feedbacklaag: toast met Ongedaan maken bij verwijderen; geen browsermeldingen */
  await step('verwijderen met ongedaan maken',async()=>p.evaluate(async()=>{const bad=[];const cv=document.createElement('canvas');cv.width=900;cv.height=600;cv.getContext('2d').fillRect(0,0,9,9);
    const f=new File([await new Promise(r=>cv.toBlob(r,'image/jpeg'))],'x.jpg',{type:'image/jpeg'});await v84AddMood(6,[f]);const id=V84.moods.find(x=>x.day===6).id;
    tab='days';currentDay=6;daySection='overview';render();document.querySelector(`[data-v84-mdel="${id}"]`).click();await new Promise(r=>setTimeout(r,300));
    if(V84.moods.some(x=>x.id===id))bad.push('niet verwijderd');const t=document.getElementById('v10Toast');if(!t||!/Ongedaan/.test(t.textContent))bad.push('geen toast met Ongedaan maken');
    t?.querySelector('button')?.click();await new Promise(r=>setTimeout(r,300));if(!V84.moods.some(x=>x.id===id))bad.push('ongedaan maken zet niet terug');
    await v84Write(st=>st.delete(id));await v84Load();return bad}));
  await step('foutvertaler',async()=>p.evaluate(()=>{const bad=[];const q=v10Why({name:'QuotaExceededError',message:'The quota has been exceeded.'},'foto'),g=v10Why({code:1,message:'User denied Geolocation',PERMISSION_DENIED:1},'gps'),t=v10Why(new TypeError("Cannot read properties of undefined (reading 'x')"),'video'),own=v10Why(new Error('Deze video is te groot voor dit toestel (max. 60 MB). Kort hem eerst in.'),'video');
    if(!/opslag.*vol/i.test(q))bad.push('quota: '+q);if(!/Locatie staat uit/.test(g))bad.push('gps: '+g);if(/Cannot read|undefined/.test(t)||!/Probeer het opnieuw/.test(t))bad.push('technisch: '+t);if(!/te groot/.test(own))bad.push('eigen melding kwijt: '+own);return bad}));

  /* 4. prestatiebudget: Wildlife-dagwissel (gemiddelde van 6 dagen, ruim budget tegen wisselvallige CI) */
  await step('prestatie Wildlife-dag',async()=>p.evaluate(async()=>{const bad=[];tab='days';daySection='wildlife';const ms=[],nodes=[];for(const d of [2,6,8,11,14,17]){currentDay=d;const s=performance.now();render();ms.push(performance.now()-s);nodes.push(document.querySelectorAll('#app *').length);await new Promise(r=>setTimeout(r,0))}
    const avg=ms.reduce((a,b)=>a+b,0)/ms.length;if(avg>120)bad.push('gem. '+Math.round(avg)+' ms (budget 120)');if(Math.max(...nodes)>4000)bad.push('elementen '+Math.max(...nodes)+' (budget 4000)');
    /* Toon alle en zoeken bouwen de rest alsnog op */
    currentDay=6;render();const all=document.querySelector('.v75-all');all?.click();if(document.querySelectorAll('.v47-sp').length<200)bad.push('Toon alle bouwt niet alles op');
    V75_OPEN.delete(6);V10_HYD.delete(6);render();const q=document.getElementById('v50q');q.value='geelvleugel';q.dispatchEvent(new Event('input'));const vis=[...document.querySelectorAll('.v47-sp')].filter(c=>c.style.display!=='none');
    if(!vis.length)bad.push('zoeken vindt niets in verborgen soorten');v50Query='';V10_HYD.delete(6);render();return bad}));

  /* 5. persistentie: media en waarnemingen blijven na volledig herladen */
  await step('persistentie na herladen',async()=>{await p.evaluate(async()=>{const cv=document.createElement('canvas');cv.width=900;cv.height=600;cv.getContext('2d').fillRect(0,0,9,9);
    await v84Add('Keel-billed toucan','La Fortuna',[new File([await new Promise(r=>cv.toBlob(r,'image/jpeg'))],'t.jpg',{type:'image/jpeg'})],6);state.notes[6]='v10 test';save()});
    await p.reload();await p.waitForTimeout(900);const r=await p.evaluate(()=>({ph:V84.list.filter(x=>x.sp===v43name('Keel-billed toucan')&&x.day===6).length,obs:!!state.v43Observations[v43name('Keel-billed toucan')]?.days?.[6],note:state.notes[6]}));
    return r.ph===1&&r.obs&&r.note==='v10 test'?[]:['na herladen: '+JSON.stringify(r)]});

  /* 6. back-up: alles bewaren → wissen → terugzetten (zip met gegevens + media) */
  await step('back-up heen en terug',async()=>{const bad=[];await p.evaluate(()=>{tab='settings';dsMore='backup';render()});
    const [dl]=await Promise.all([p.waitForEvent('download'),p.click('#v10bk')]);const zp=path.join(os.tmpdir(),'cr27-v10.zip');await dl.saveAs(zp);
    const info=await p.evaluate(async()=>({last:!!state.v10FullBackup,photos:state.v10FullBackup?.photos}));if(!info.last||info.photos<1)bad.push('status niet bijgewerkt '+JSON.stringify(info));
    await p.evaluate(async()=>{await v84Write(st=>V84.list.concat(V84.vids,V84.moods,V84.stays).forEach(x=>st.delete(x.id)));await v84Load();delete state.v43Observations[v43name('Keel-billed toucan')];state.notes[6]='';save()});
    await p.setInputFiles('#v10rs',zp);await p.waitForSelector('#v10Dlg [data-d="yes"]');await Promise.all([p.waitForEvent('load',{timeout:20000}),p.click('#v10Dlg [data-d="yes"]')]);await p.waitForTimeout(900);
    const r=await p.evaluate(()=>({ph:V84.list.length,obs:!!state.v43Observations[v43name('Keel-billed toucan')]?.days?.[6],note:state.notes[6],toast:document.getElementById('v10Toast')?.textContent||''}));
    if(r.ph<1||!r.obs||r.note!=='v10 test')bad.push('herstel: '+JSON.stringify(r));if(!/teruggezet/i.test(r.toast))bad.push('geen melding na herstel');
    /* ongeldige back-up: duidelijke melding, niets veranderd */
    const before=await p.evaluate(()=>localStorage.getItem('CR27_V2'));const junk=path.join(os.tmpdir(),'cr27-junk.zip');fs.writeFileSync(junk,'dit is geen zip');
    await p.evaluate(()=>{tab='settings';dsMore='backup';render()});await p.setInputFiles('#v10rs',junk);await p.waitForTimeout(400);
    const m=await p.evaluate(()=>document.querySelector('.v10-bkmsg')?.textContent||'');if(!/geen back-up van deze app/i.test(m))bad.push('ongeldige back-up: '+m);
    if(await p.evaluate(()=>localStorage.getItem('CR27_V2'))!==before)bad.push('ongeldige back-up wijzigde gegevens');return bad});

  /* 7. Video Studio: inhoud, controle, titel, voorbeeld, maken, resultaat */
  await step('Video Studio',async()=>{const bad=[];await p.evaluate(()=>{tab='home';render()});await p.click('#v89go');await p.waitForTimeout(200);
    const s=await p.evaluate(()=>({page:dsMore,secs:[...document.querySelectorAll('.v10-st .v10-sth b')].map(x=>x.textContent),dots:document.querySelectorAll('.v10-strip .v10-dot').length}));
    if(s.page!=='studio'||s.secs.join('|')!=='Inhoud|Controle|Titel en namen|Voorbeeld|Maken|Resultaat'||s.dots!==23)bad.push('studio: '+JSON.stringify(s));
    await p.fill('[data-v9v="names"]','Kevin & Sam');if(await p.evaluate(()=>state.v9Video?.names)!=='Kevin & Sam')bad.push('namen niet bewaard');
    await p.click('#v10prevOpen');await p.waitForSelector('#v9Prev canvas');await p.waitForTimeout(1200);
    const lit=await p.evaluate(()=>{const c=document.querySelector('#v9Prev canvas'),d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let n=0;for(let i=0;i<d.length;i+=4000)if(d[i]+d[i+1]+d[i+2]>60)n++;return n});if(lit<20)bad.push('voorbeeld opening toont niets');
    await p.evaluate(()=>v9PrevClose());await p.click('[data-v10f="port"]');await p.click('[data-v10o="short"]');
    await p.evaluate(()=>{V85.SCALE=.05});await p.click('#v10make');await p.waitForSelector('#v85Gen .v85-vid',{timeout:60000});
    const res=await p.evaluate(()=>({dl:[...document.querySelectorAll('#v85Gen a[download]')].map(a=>a.download),job:!!state.v10VideoJob}));if(!res.dl.length||!/staand/.test(res.dl[0])||!/kort/.test(res.dl[0])||res.job)bad.push('maken: '+JSON.stringify(res));
    await p.evaluate(()=>{V85.SCALE=1;v85Close();v10OpenStudio()});const r2=await p.evaluate(()=>({w:!!document.getElementById('v10watch'),s:!!document.getElementById('v10share')}));if(!r2.w||!r2.s)bad.push('resultaat: '+JSON.stringify(r2));
    /* onderbroken video: melding in de studio */
    await p.evaluate(()=>{state.v10VideoJob={at:new Date().toISOString(),opt:{}};save();render()});if(!await p.evaluate(()=>/niet afgemaakt/.test(document.getElementById('app').textContent)))bad.push('geen melding onderbroken video');
    await p.evaluate(()=>{delete state.v10VideoJob;save()});return bad});

  /* 8. duplicaten en opbouw van de reisvideo */
  await step('duplicaten en verhaal',async()=>p.evaluate(async()=>{const bad=[];const mk=async(seed,shift)=>{const cv=document.createElement('canvas');cv.width=800;cv.height=500;const g=cv.getContext('2d');
      for(let i=0;i<40;i++){g.fillStyle=`hsl(${(seed*37+i*29)%360},60%,${30+(i*7)%40}%)`;g.fillRect(((i*97+seed*13)%800)+shift,(i*53)%500,120,90)}return new Blob([await new Promise(r=>cv.toBlob(r,'image/jpeg',.9))],{type:'image/jpeg'})};
    const R=v47Region(S[7]),recs=[],a=await mk(1,0),a2=await mk(1,2),c=await mk(5,0),w=await mk(9,0);
    [[a,'Rivier',900],[a2,'Rivier',400],[c,'',800],[w,'Wij',700]].forEach(([bl,l,sh],i)=>recs.push({id:'t10d'+i,sp:'',name:'',region:R,day:8,kind:'mood',label:l,t:'x',taken:`2027-02-15T0${i+7}:00:00`,w:800,h:500,sharp:sh,lum:.4,blob:bl}));
    const names=(V47_PLACES[R]||[]).map(x=>x[0]).slice(0,6);names.forEach((n,i)=>{recs.push({id:'t10a'+i,sp:v43name(n),name:n,region:R,day:8,kind:'photo',t:'x',taken:`2027-02-15T1${i}:00:00`,w:800,h:500,sharp:500,lum:.4,blob:c});v52Set(n,R,'seen',true)});
    await v84Write(st=>recs.forEach(r=>st.put(r)));await v84Load();await v10DhFill();
    const g=v10DupGroups().filter(x=>x.items[0].day===8&&x.kind==='mood');if(g.length!==1||g[0].items.length!==2||g[0].best.id!=='t10d0')bad.push('duplicaatgroep: '+JSON.stringify(g.map(x=>x.items.map(i=>i.id))));
    let plan=v85Plan(),pd=plan.days.find(d=>d.day===8);if(pd.moods.length!==3)bad.push('video gebruikt dubbele foto: '+pd.moods.length);
    state.v10DupAll={[g[0]?.key]:1};plan=v85Plan();pd=plan.days.find(d=>d.day===8);if(pd.moods.length!==4)bad.push('"toch allemaal" werkt niet');delete state.v10DupAll;
    if(V84.moods.filter(x=>x.day===8).length!==4)bad.push('duplicaat verwijderd!');
    const segs=v85Segments(v85Plan(),false),i8=segs.findIndex(x=>x.k==='day'&&x.day===8),j8=segs.findIndex((x,i)=>i>i8&&['day','best','end'].includes(x.k)),d8=segs.slice(i8,j8);
    if(d8[1]?.k!=='mood'||!d8[1].estab)bad.push('establishing ontbreekt: '+d8.map(x=>x.k).join(','));
    const last=d8[d8.length-1];if(!(last.k==='mood'&&/Wij|Persoonlijk/.test(last.label+last.title)))bad.push('persoonlijk moment niet als slot: '+d8.map(x=>x.k+':'+(x.label||'')).join(','));
    const hlI=d8.findIndex(x=>x.hl),lastSp=d8.map(x=>x.k==='sp'||x.k==='pair').lastIndexOf(true);if(hlI<0||hlI!==lastSp)bad.push('hoogtepunt niet als laatste dier');
    await v84Write(st=>recs.forEach(r=>st.delete(r.id)));await v84Load();names.forEach(n=>delete state.v43Observations[v43name(n)]);save();return bad}));

  /* 8b. v10.1 · raster van 4 en ritme: rustige dieren samen, ster/hoogtepunt los, nooit twee groepsbeelden achter elkaar, korter */
  await step('raster en ritme',async()=>p.evaluate(async()=>{const bad=[];const cv=document.createElement('canvas');cv.width=800;cv.height=533;cv.getContext('2d').fillRect(0,0,9,9);const bl=await new Promise(r=>cv.toBlob(r,'image/jpeg'));
    const R=v47Region(S[9]),names=(V47_PLACES[R]||[]).map(x=>x[0]).slice(0,12),recs=[],starN=names.slice(-5);
    names.forEach((n,i)=>{recs.push({id:'t11a'+i,sp:v43name(n),name:n,region:R,day:10,kind:'photo',t:'x',taken:`2027-02-17T${String(6+i).padStart(2,'0')}:00:00`,w:800,h:533,sharp:100+i,lum:.4,blob:bl,favUser:starN.includes(n)});v52Set(n,R,'seen',true)});
    for(let i=0;i<12;i++)recs.push({id:'t11m'+String(i).padStart(2,'0'),sp:'',name:'',region:R,day:10,kind:'mood',label:i<6?'Rivier':'',t:'x',taken:`2027-02-17T${String(6+i).padStart(2,'0')}:30:00`,w:800,h:533,lum:.4,blob:bl});
    await v84Write(st=>recs.forEach(r=>st.put(r)));await v84Load();
    const day=segs=>{const i=segs.findIndex(x=>x.k==='day'&&x.day===10),j=segs.findIndex((x,q)=>q>i&&['day','best','end'].includes(x.k));return segs.slice(i+1,j<0?segs.length:j)};
    /* sterren (5, meer dan er los blijven) komen nooit in een raster */
    const g0=day(v85Segments(v85Plan(),false)).filter(x=>x.k==='grid');if(g0.some(g=>g.sps.some(sp=>starN.map(v43name).includes(sp))))bad.push('dier met ster in raster');
    {const s0=day(v85Segments(v85Plan(),false)),stars=starN.map(n=>v47Info(n).nl),duo=s0.filter(x=>x.k==='pair'&&x.panels.every(q=>stars.includes(q.title)));
      const loose=s0.filter(x=>x.k==='sp'&&!x.hl&&stars.includes(x.title));if(!duo.length||loose.length>1)bad.push(`sterren niet per twee samen: ${duo.length} duo's, ${loose.length} los`);
      if(!duo.every(x=>x.panels.every(q=>/^Favoriet/.test(q.label))))bad.push('label Favoriet ontbreekt')}
    await v84Write(st=>recs.filter(r=>r.favUser).forEach(r=>st.put({...r,favUser:false})));await v84Load();
    const plan=v85Plan(),it=plan.days.find(d=>d.day===10).items,on=day(v85Segments(plan,false));
    V85_GRID.on=false;const off=day(v85Segments(v85Plan(),false));V85_GRID.on=true;
    const grids=on.filter(x=>x.k==='grid');if(!grids.length)bad.push('geen raster op een volle dag');
    const hl=it.find(i=>i.hl);
    if(hl&&grids.some(g=>g.sps.includes(hl.sp)))bad.push('hoogtepunt in raster');
    const shown=on.flatMap(x=>x.k==='sp'?[x.sp]:x.k==='pair'?x.panels.filter(q=>!q.mood).map(q=>q.title):x.k==='grid'?x.sps:[]);
    const nm=on.reduce((n,x)=>n+(x.k==='mood'?1:x.k==='collage'?x.srcs.length:x.k==='pair'?x.panels.filter(q=>q.mood).length:0),0);
    if(new Set(shown).size!==it.length||shown.length!==it.length)bad.push(`dieren niet precies één keer: ${shown.length}/${it.length}`);if(nm!==12)bad.push('sfeerfoto\'s in video: '+nm);
    const multi=x=>x.k==='grid'||(x.k==='collage'&&x.srcs.length>=3);for(let i=1;i<on.length;i++)if(multi(on[i])&&multi(on[i-1]))bad.push(`twee groepsbeelden achter elkaar: ${on[i-1].k}+${on[i].k}`);
    const sOn=v85Seconds(on),sOff=v85Seconds(off);if(sOn>sOff*.85)bad.push(`niet korter: ${sOn}s tegen ${sOff}s`);
    if(on.findIndex(x=>x.hl)<on.map(x=>['sp','pair','grid'].includes(x.k)).lastIndexOf(true))bad.push('hoogtepunt niet als laatste dier');
    await v84Write(st=>recs.forEach(r=>st.delete(r.id)));await v84Load();names.forEach(n=>delete state.v43Observations[v43name(n)]);save();return bad}));

  /* 9. geen browsermeldingen in deze hele run */
  if(nativeDialogs)errs.push('browsermelding(en) gezien: '+nativeDialogs);else ok.push('geen browsermeldingen');
  await b.close();
  console.log('v10 geslaagd: '+ok.join(' · '));if(errs.length){console.error('MISLUKT (v10):\n'+errs.join('\n'));process.exit(1)}})();
