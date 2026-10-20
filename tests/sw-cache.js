/* v10 · service worker: offline na eerste bezoek, en een nieuwe release downloadt de foto's niet opnieuw.
   Draait de app via een lokale http-server (service workers werken niet op file://). */
const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
const ROOT=path.resolve(__dirname,'..');let swVersion=null;
const TYPES={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webmanifest':'application/manifest+json','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2'};
let srvPhotos=0;const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]);if(/^\/photos\/[^/]+\.jpg$/.test(u))srvPhotos++;let f=path.join(ROOT,u==='/'?'index.html':u);if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);r.end();return}
  let body=fs.readFileSync(f);if(u==='/sw.js'&&swVersion)body=Buffer.from(body.toString().replace(/const CACHE = '[^']*'/,`const CACHE = '${swVersion}'`));
  r.writeHead(200,{'Content-Type':TYPES[path.extname(f)]||'application/octet-stream','Cache-Control':'no-store'});r.end(body)});
(async()=>{await new Promise(res=>srv.listen(0,res));const base=`http://localhost:${srv.address().port}/`;const errs=[];
  const exe=process.env.CHROME_PATH;const b=await chromium.launch(exe?{executablePath:exe,args:['--headless=new']}:{});const ctx=await b.newContext();
  await ctx.route(/^https?:\/\/(?!localhost)/,r=>r.abort());
    const p=await ctx.newPage();p.on('pageerror',e=>errs.push('JS: '+e.message));
  await p.goto(base);await p.evaluate(()=>navigator.serviceWorker.ready);
  const waitMedia=async()=>{for(let i=0;i<120;i++){const n=await p.evaluate(async()=>{const c=await caches.open('cr27-media-1');return (await c.keys()).length});if(n>=90)return n;await p.waitForTimeout(500)}return -1};
  const n1=await waitMedia();if(n1<90)errs.push('mediacache niet gevuld: '+n1);
  const first=srvPhotos;
  /* offline: app start en toont een foto uit de cache */
  await ctx.setOffline(true);await p.reload();await p.waitForSelector('#app *',{timeout:10000}).catch(()=>errs.push('offline: app start niet'));
  const off=await p.evaluate(async()=>{const r=await fetch('./photos/hero-home.jpg').catch(()=>null);return !!r&&r.ok});if(!off)errs.push('offline: foto niet uit cache');
  await ctx.setOffline(false);
  /* nieuwe release: andere cachenaam; foto's mogen niet opnieuw van het netwerk komen */
  srvPhotos=0;swVersion='costa-rica-2027-test-nieuw';
  await p.evaluate(async()=>{const r=await navigator.serviceWorker.getRegistration();await r.update()});
  for(let i=0;i<60;i++){const k=await p.evaluate(async()=>(await caches.keys()).join(','));if(k.includes('test-nieuw')&&!/costa-rica-2027-v/.test(k))break;await p.waitForTimeout(500)}
  const keys=await p.evaluate(async()=>(await caches.keys()));
  if(!keys.includes('costa-rica-2027-test-nieuw'))errs.push('nieuwe versiecache ontbreekt: '+keys);
  if(!keys.includes('cr27-media-1'))errs.push('mediacache verdwenen na release');
  if(first<60)errs.push('eerste installatie haalde te weinig foto\'s: '+first);if(srvPhotos>2)errs.push(`release downloadt foto's opnieuw: ${srvPhotos} (eerste keer ${first})`);
  await b.close();srv.close();
  if(errs.length){console.error('MISLUKT (service worker):\n'+errs.join('\n'));process.exit(1)}
  console.log(`OK service worker: ${n1} media in vaste cache, offline start, nieuwe release ${srvPhotos} foto-downloads (eerste keer ${first})`)})();
