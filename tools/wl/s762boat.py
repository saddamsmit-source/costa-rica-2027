"""v7.6.2: geometrie Río Sierpe en kustlijn Sierpe–Drake–Playa Rincón (OpenStreetMap) voor de bootroute op de kaart."""
import json,os,sys
sys.path.insert(0,os.path.join(os.path.dirname(__file__),'w21'))
from net import fetch
O='wl_out';os.makedirs(O,exist_ok=True)
out={}
Q={'river':'[out:json][timeout:120];(way["waterway"="river"]["name"~"Sierpe",i](8.70,-83.75,8.95,-83.40););out geom;',
   'coast':'[out:json][timeout:120];(way["natural"="coastline"](8.60,-83.80,8.85,-83.55););out geom;',
   'places':'[out:json][timeout:60];(node["place"](8.60,-83.80,8.95,-83.40);node["natural"~"beach|cape|bay"](8.60,-83.80,8.95,-83.40);way["natural"~"beach|bay"](8.60,-83.80,8.95,-83.40););out center tags;'}
for k,q in Q.items():
    r=fetch('https://overpass-api.de/api/interpreter',{'data':q},pace=3,timeout=180)
    out[k]=(r or {}).get('elements',[]);print(k,len(out[k]),flush=True)
json.dump(out,open(O+'/boat.json','w'),ensure_ascii=False)
print('klaar')
