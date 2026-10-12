/* =====================================================================
   v6 · Live weer per locatie (Open-Meteo, gratis, geen sleutel, CC BY 4.0)
   Actueel weer + komende uren + dagverwachting (tot 16 dagen vooruit).
   Laatste resultaat blijft offline beschikbaar (aparte opslag, geen back-updata).
   ===================================================================== */
const WX_STORE='CR27_WEATHER',WX_TTL=15*60*1000;
const WX_CODE={0:['Onbewolkt','sun'],1:['Overwegend helder','sun'],2:['Half bewolkt','partly'],3:['Bewolkt','cloud'],45:['Mist','fog'],48:['Mist met rijp','fog'],51:['Lichte motregen','drizzle'],53:['Motregen','drizzle'],55:['Dichte motregen','drizzle'],56:['IJzelmotregen','drizzle'],57:['IJzelmotregen','drizzle'],61:['Lichte regen','rain'],63:['Regen','rain'],65:['Zware regen','rain'],66:['IJzelregen','rain'],67:['IJzelregen','rain'],71:['Lichte sneeuw','cloud'],73:['Sneeuw','cloud'],75:['Zware sneeuw','cloud'],77:['Sneeuwkorrels','cloud'],80:['Lichte buien','shower'],81:['Buien','shower'],82:['Zware buien','shower'],85:['Sneeuwbuien','cloud'],86:['Sneeuwbuien','cloud'],95:['Onweer','storm'],96:['Onweer met hagel','storm'],99:['Zwaar onweer met hagel','storm']};
const WX_ICON={
 sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
 moon:'<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
 partly:'<path d="M8 3v1.5M3.5 8H5M4.8 4.8l1 1M12.2 4.8l-1 1"/><path d="M5.6 11.2A4 4 0 1 1 12 7"/><path d="M8 20h9a4 4 0 0 0 .5-7.97A5.5 5.5 0 0 0 7 13.5 3.25 3.25 0 0 0 8 20z"/>',
 cloud:'<path d="M7 19h10a4.5 4.5 0 0 0 .5-8.97A6 6 0 0 0 6 11.5 3.75 3.75 0 0 0 7 19z"/>',
 fog:'<path d="M7 13h10a4 4 0 0 0 .4-7.98A5.5 5.5 0 0 0 6.4 7.2 3 3 0 0 0 7 13z"/><path d="M4 17h16M6 21h12"/>',
 drizzle:'<path d="M7 14h10a4 4 0 0 0 .4-7.98A5.5 5.5 0 0 0 6.4 8.2 3 3 0 0 0 7 14z"/><path d="M8 18v1M12 18v1M16 18v1M10 21v1M14 21v1"/>',
 rain:'<path d="M7 14h10a4 4 0 0 0 .4-7.98A5.5 5.5 0 0 0 6.4 8.2 3 3 0 0 0 7 14z"/><path d="m8 17-1 3M12 17l-1 3M16 17l-1 3"/>',
 shower:'<path d="M9 3v1M4.5 7.5H6M5.6 4.6l.8.8"/><path d="M6.5 10.5A3.5 3.5 0 0 1 12.4 7"/><path d="M8 15h9a4 4 0 0 0 .4-7.98A5.5 5.5 0 0 0 7.4 9.2 3 3 0 0 0 8 15z"/><path d="m9 18-1 3M13 18l-1 3M17 18l-1 3"/>',
 storm:'<path d="M7 14h10a4 4 0 0 0 .4-7.98A5.5 5.5 0 0 0 6.4 8.2 3 3 0 0 0 7 14z"/><path d="m12 15-2 4h4l-2 4"/>'
};
function wxI(k,s){return `<svg viewBox="0 0 24 24" width="${s||22}" height="${s||22}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${WX_ICON[k]||WX_ICON.cloud}</svg>`}
function wxInfo(code,isDay){const c=WX_CODE[code]||['Onbekend','cloud'];return {label:c[0],icon:(c[1]==='sun'&&isDay===0)?'moon':c[1]}}
function wxLoc(d){const si=v51Day2Stop(d.id),stop=V51_STOPS[si][0],p=V51_PT[stop];return {lat:p[0],lon:p[1],name:p[2],key:p[0].toFixed(2)+','+p[1].toFixed(2)}}
function wxRead(){try{return JSON.parse(localStorage.getItem(WX_STORE))||{}}catch(e){return {}}}
function wxWrite(all){try{localStorage.setItem(WX_STORE,JSON.stringify(all))}catch(e){}}
function wxUrl(l){return 'https://api.open-meteo.com/v1/forecast?latitude='+l.lat+'&longitude='+l.lon+'&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,is_day&hourly=temperature_2m,precipitation_probability,weather_code,is_day&forecast_hours=12&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum&forecast_days=16&timezone=America%2FCosta_Rica'}
let wxBusy={};
async function wxFetch(l,force){const all=wxRead(),c=all[l.key];if(!force&&c&&Date.now()-c.at<WX_TTL)return c;if(!navigator.onLine)return c||null;if(wxBusy[l.key])return wxBusy[l.key];
  wxBusy[l.key]=(async()=>{try{const r=await fetch(wxUrl(l),{cache:'no-store'});if(!r.ok)throw new Error('HTTP '+r.status);const data=await r.json();if(!data.current)throw new Error('geen data');const rec={at:Date.now(),data};const a=wxRead();a[l.key]=rec;wxWrite(a);return rec}catch(e){return c?Object.assign({},c,{err:true}):{err:true}}finally{delete wxBusy[l.key]}})();
  return wxBusy[l.key]}
function wxHHMM(iso){return iso.slice(11,16)}
function wxBody(rec,d,l){
  if(!rec||!rec.data)return `<p class="ds-meta">${rec&&rec.err?(navigator.onLine?'Weer kon niet worden opgehaald. Probeer het later opnieuw.':'Geen internet en nog geen opgeslagen weer voor deze plek.'):'Weer wordt opgehaald…'}</p>`;
  const D=rec.data,c=D.current,inf=wxInfo(c.weather_code,c.is_day),age=Math.round((Date.now()-rec.at)/60000);
  const hrs=(D.hourly?.time||[]).slice(1,7).map((t,i)=>{const j=i+1,h=wxInfo(D.hourly.weather_code[j],D.hourly.is_day?.[j]);const pp=D.hourly.precipitation_probability?.[j];return `<div class="ds-wx-h"><small>${wxHHMM(t)}</small>${wxI(h.icon,22)}<b>${Math.round(D.hourly.temperature_2m[j])}°</b><em class="${pp>=50?'wet':''}">${pp==null?'–':pp+'%'}</em></div>`}).join('');
  const di=(D.daily?.time||[]).indexOf(d.date);
  const day=di>=0?(()=>{const dw=wxInfo(D.daily.weather_code[di],1);return `<div class="ds-wx-day">${wxI(dw.icon,20)}<span><b>Verwachting ${esc(fmt(d.date))}</b>${dw.label} · ${Math.round(D.daily.temperature_2m_min[di])}–${Math.round(D.daily.temperature_2m_max[di])} °C · regenkans ${D.daily.precipitation_probability_max[di]??'–'}%</span></div>`})():`<div class="ds-wx-day muted">${wxI('cloud',20)}<span>Een verwachting voor ${esc(fmt(d.date))} verschijnt vanaf 16 dagen vooraf.</span></div>`;
  return `<div class="ds-wx-now"><div class="ds-wx-big">${wxI(inf.icon,46)}<span class="ds-num">${Math.round(c.temperature_2m)}°</span></div><div class="ds-wx-meta"><b>${inf.label}</b><span>Voelt als ${Math.round(c.apparent_temperature)}° · vocht ${c.relative_humidity_2m}%</span><span>Wind ${Math.round(c.wind_speed_10m)} km/u · neerslag ${String(c.precipitation).replace(".",",")} mm</span></div></div>
    <div class="ds-label" style="margin:12px 0 6px">Komende uren · lokale tijd</div><div class="ds-wx-hours ds-num">${hrs}</div>${day}
    <div class="ds-wx-foot"><span>${rec.err?'Offline · ':''}Bijgewerkt ${age<1?'zojuist':age<60?age+' min geleden':Math.round(age/60)+' uur geleden'}</span><a href="https://open-meteo.com/" target="_blank" rel="noopener">Weerdata: Open-Meteo.com</a></div>`}
function dsWeatherCard(d){const l=wxLoc(d),c=wxRead()[l.key];
  return `<div class="ds-card ds-wx" id="dsWx" data-day="${d.id}"><div class="ds-wx-head"><h3 class="ds-title" style="font-size:18px">Weer nu in ${esc(l.name)}</h3><button class="ds-wx-refresh" id="dsWxRefresh" aria-label="Weer verversen"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/></svg></button></div><div id="dsWxBody">${wxBody(c,d,l)}</div></div>`}
async function wxLoad(force){const box=document.getElementById('dsWx');if(!box)return;const d=S[Number(box.dataset.day)-1],l=wxLoc(d);
  const rec=await wxFetch(l,force);const b=document.getElementById('dsWxBody');if(b&&document.getElementById('dsWx')?.dataset.day==String(d.id))b.innerHTML=wxBody(rec,d,l)}
let wxTimer=null;
const wxPrevDC=dayContent;
dayContent=function(d){const h=wxPrevDC(d);if(daySection!=='overview')return h;
  return h.replace('<button class="ds-stay"',dsWeatherCard(d)+'<button class="ds-stay"').replace(/(<div class="ds-know">)/,s=>h.includes('<button class="ds-stay"')?s:dsWeatherCard(d)+s)};
const wxPrevBind=bindExtras;
bindExtras=function(){wxPrevBind();if(document.getElementById('dsWx')){wxLoad(false);const r=document.getElementById('dsWxRefresh');if(r)r.onclick=()=>{r.classList.add('spin');wxLoad(true).then(()=>r.classList.remove('spin'))};
  clearInterval(wxTimer);wxTimer=setInterval(()=>{if(document.visibilityState==='visible')wxLoad(false)},WX_TTL)}else{clearInterval(wxTimer)}};
window.addEventListener('online',()=>wxLoad(true));
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')wxLoad(false)});
render();
