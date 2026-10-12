/* =====================================================================
   v7.1 · Relatieve luchtvochtigheid in de bestaande weerkaart
   Nu: actuele waarde van Open-Meteo (zelfde bron en aanroep als temperatuur).
   Reisdatum binnen 16 dagen: daggemiddelde uit Open-Meteo (gemiddelde van de
   uurwaarden van die dag, lokale tijd) naast min/max-temperatuur.
   Verder vooruit: klimaatindicatie per locatie en maand uit WX_CLIM
   (ERA5-archief 2015–2024, zie tools/wl/climate.py), duidelijk als indicatie.
   Geen betrouwbare waarde: "Niet beschikbaar". Opslag: bestaand CR27_WEATHER.
   ===================================================================== */
const WX_CLIM={"source":"Open-Meteo Historical Weather API (ERA5/ERA5-Land), CC BY 4.0","period":"2015–2024","points":{"9.93,-84.08":{"name":"San José","02":{"mean":68,"min":46,"max":84},"03":{"mean":68,"min":43,"max":85}},"9.74,-82.84":{"name":"Cahuita","02":{"mean":88,"min":73,"max":98},"03":{"mean":88,"min":72,"max":98}},"10.54,-83.50":{"name":"Tortuguero","02":{"mean":87,"min":72,"max":99},"03":{"mean":86,"min":71,"max":98}},"10.47,-84.64":{"name":"La Fortuna","02":{"mean":86,"min":70,"max":97},"03":{"mean":84,"min":66,"max":97}},"10.77,-85.35":{"name":"Rincón de la Vieja","02":{"mean":79,"min":61,"max":93},"03":{"mean":76,"min":55,"max":92}},"10.31,-84.83":{"name":"Monteverde","02":{"mean":84,"min":68,"max":95},"03":{"mean":82,"min":64,"max":95}},"9.55,-83.81":{"name":"San Gerardo","02":{"mean":79,"min":61,"max":94},"03":{"mean":81,"min":64,"max":96}},"9.03,-83.60":{"name":"Vergel de Punta Mala","02":{"mean":85,"min":71,"max":96},"03":{"mean":85,"min":70,"max":96}},"8.69,-83.66":{"name":"Corcovado-lodge","02":{"mean":83,"min":68,"max":95},"03":{"mean":84,"min":67,"max":95}},"9.52,-84.48":{"name":"Esterillos","02":{"mean":77,"min":62,"max":92},"03":{"mean":76,"min":61,"max":91}}}};
const WX_DROP='<path d="M12 3s6 6.6 6 11a6 6 0 0 1-12 0c0-4.4 6-11 6-11z"/>';
const WX_MONTH={'02':'februari','03':'maart'};
function wxRhOk(v){return typeof v==='number'&&isFinite(v)&&v>=0&&v<=100}
const wxPrevUrl=wxUrl;
wxUrl=function(l){return wxPrevUrl(l).replace('&daily=weather_code,','&daily=weather_code,relative_humidity_2m_mean,')};
function wxClim(d){const l=wxLoc(d),p=(typeof WX_CLIM!=='undefined'&&WX_CLIM.points[l.key])||null,m=d.date.slice(5,7),c=p&&p[m];
  return c&&wxRhOk(c.mean)?{...c,month:WX_MONTH[m]||m}:null}
function wxClimLine(d){const c=wxClim(d);
  return `<div class="ds-wx-day clim">${wxI('cloud',20).replace(WX_ICON.cloud,WX_DROP)}<span><b>Klimaatindicatie ${c?esc(c.month):''}</b>${c?`Luchtvochtigheid gemiddeld <span class="ds-num">${c.mean}%</span> · over de dag meestal ${c.min}–${c.max}%`:'Luchtvochtigheid: niet beschikbaar'}<small>Gemiddelde over ${typeof WX_CLIM!=='undefined'?esc(WX_CLIM.period):'eerdere jaren'}, geen voorspelling.</small></span></div>`}
const wxPrevBody=wxBody;
wxBody=function(rec,d,l){let h=wxPrevBody(rec,d,l);
  if(rec&&rec.data){const D=rec.data,c=D.current||{},rh=c.relative_humidity_2m;
    h=h.replace(/ · vocht [^<]*<\/span>/,'</span>').replace(/(<div class="ds-wx-meta"><b>[^<]*<\/b><span>[^<]*<\/span>)/,`$1<span class="wx-rh">${wxI('cloud',16).replace(WX_ICON.cloud,WX_DROP)}${wxRhOk(rh)?`<b class="ds-num">${Math.round(rh)}%</b>`:'<b>Niet beschikbaar</b>'} luchtvochtigheid</span>`);
    const di=(D.daily?.time||[]).indexOf(d.date);
    if(di>=0){const v=D.daily.relative_humidity_2m_mean?.[di];
      h=h.replace(/(regenkans [^<]*)(<\/span><\/div>)/,`$1 · <span class="wx-rhd">luchtvochtigheid ${wxRhOk(v)?Math.round(v)+'%':'niet beschikbaar'}</span>$2`)}
    else h=h.replace(/(<div class="ds-wx-day muted">[\s\S]*?<\/div>)/,`$1${wxClimLine(d)}`)}
  else{if(!rec&&!navigator.onLine)h=h.replace('Weer wordt opgehaald…','Geen internet en nog geen opgeslagen weer voor deze plek.');h+=wxClimLine(d)}
  return h};
render();
