"""v7.6.3: geometrie Costanera (Ruta 34) en weg naar Sierpe (Ruta 223/2) uit OpenStreetMap, voor de busroute Sierpe → Esterillos."""
import json,os,sys
sys.path.insert(0,os.path.join(os.path.dirname(__file__),'w21'))
from net import fetch
O='wl_out';os.makedirs(O,exist_ok=True);out={}
Q={'r34':'[out:json][timeout:180];(way["highway"]["ref"~"(^|;)34($|;)"](8.85,-84.60,9.65,-83.40););out geom;',
   'r223':'[out:json][timeout:180];(way["highway"]["ref"~"(^|;)(223|2)($|;)"](8.85,-83.70,9.05,-83.40););out geom;'}
for k,q in Q.items():
    r=fetch('https://overpass-api.de/api/interpreter',{'data':q},pace=3,timeout=200)
    out[k]=(r or {}).get('elements',[]);print(k,len(out[k]),flush=True)
json.dump(out,open(O+'/road.json','w'),ensure_ascii=False);print('klaar')
