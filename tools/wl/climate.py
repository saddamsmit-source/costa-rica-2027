"""Klimaatindicatie luchtvochtigheid per reislocatie (Open-Meteo historisch archief, ERA5).
Methode: uurwaarden relative_humidity_2m 2015-2024, lokale tijd (America/Costa_Rica).
Per dag: gemiddelde, minimum en maximum van de 24 uurwaarden. Per maand: gemiddelde
van die dagwaarden over alle jaren. Uitvoer: wl_out/climate.json
Daarnaast een controle of de voorspellings-API daggemiddelde luchtvochtigheid levert."""
import json,os,time,urllib.request,statistics as st
P=json.load(open('tools/wx/points.json'))['points']
os.makedirs('wl_out',exist_ok=True)
def get(url):
    for i in range(5):
        try:
            with urllib.request.urlopen(url,timeout=120) as r:return json.load(r)
        except Exception as e:
            print('retry',i,e);time.sleep(10*(i+1))
    raise SystemExit('mislukt: '+url)
out={'source':'Open-Meteo Historical Weather API (ERA5/ERA5-Land), CC BY 4.0','period':'2015-2024','method':'daggemiddelde = gemiddelde van 24 uurwaarden (lokale tijd); maandwaarde = gemiddelde van alle dagen van die maand over 10 jaar','points':{}}
for key,p in P.items():
    url=(f"https://archive-api.open-meteo.com/v1/archive?latitude={p['lat']}&longitude={p['lon']}"
         "&start_date=2015-01-01&end_date=2024-12-31&hourly=relative_humidity_2m&timezone=America%2FCosta_Rica")
    d=get(url);t=d['hourly']['time'];v=d['hourly']['relative_humidity_2m']
    days={}
    for ti,vi in zip(t,v):
        if vi is None:continue
        days.setdefault(ti[:10],[]).append(vi)
    res={'name':p['name'],'grid':[d.get('latitude'),d.get('longitude')],'elev':d.get('elevation')}
    for m in ('02','03'):
        dd=[x for k,x in days.items() if k[5:7]==m and len(x)>=20]
        if len(dd)<200:res[m]=None;continue
        res[m]={'mean':round(st.mean(st.mean(x) for x in dd)),'min':round(st.mean(min(x) for x in dd)),'max':round(st.mean(max(x) for x in dd)),'n':len(dd)}
    out['points'][key]=res;print(key,res);time.sleep(3)
fc=get('https://api.open-meteo.com/v1/forecast?latitude=9.93&longitude=-84.08&daily=relative_humidity_2m_mean,relative_humidity_2m_min,relative_humidity_2m_max&hourly=relative_humidity_2m&forecast_days=16&timezone=America%2FCosta_Rica')
out['forecast_check']={'daily_units':fc.get('daily_units'),'daily_sample':{k:(v[:3] if isinstance(v,list) else v) for k,v in (fc.get('daily') or {}).items()},'hourly_len':len((fc.get('hourly') or {}).get('time',[])),'error':fc.get('reason')}
json.dump(out,open('wl_out/climate.json','w'),ensure_ascii=False,indent=1)
print(json.dumps(out['forecast_check']))
