"""v7.4: tweede OSM-ronde: alle accommodaties in de hotelgebieden (ter controle van hotels zonder directe naamtreffer)."""
import json,os,sys
sys.path.insert(0,os.path.join(os.path.dirname(__file__),'w21'))
from net import fetch
O='wl_out';os.makedirs(O,exist_ok=True)
AREAS={'Tortuguero':(10.50,-83.55,10.62,-83.48),'Monteverde':(10.29,-84.85,10.34,-84.79),'La Fortuna':(10.40,-84.80,10.55,-84.55),
 'Uvita':(9.05,-83.80,9.30,-83.65),'Osa':(8.40,-83.90,8.95,-83.40),'Parismina':(10.25,-83.40,10.35,-83.30)}
out={'areas':{},'nominatim':{}}
for a,(s,w,n,e) in AREAS.items():
    q=f'[out:json][timeout:90];(nwr["tourism"~"hotel|guest_house|chalet|hostel|camp_site|motel|apartment"]({s},{w},{n},{e}););out center tags;'
    r=fetch('https://overpass-api.de/api/interpreter',{'data':q},pace=3,timeout=150)
    els=[]
    for el in (r or {}).get('elements',[]):
        c=el.get('center') or {'lat':el.get('lat'),'lon':el.get('lon')}
        els.append({'type':el['type'],'id':el['id'],'lat':c['lat'],'lon':c['lon'],'tags':el.get('tags',{})})
    out['areas'][a]=els;print(a,len(els),flush=True)
for q in ['Caribbean Paradise Tortuguero','Lapa Verde Tortuguero','Hotel Cipreses Monteverde','Cipreses Santa Elena','Faro Arenal','Hotel Faro Arenal La Fortuna','Eco Arenal Hotel La Fortuna','Vista Ballena Uvita','Hotel Vista Ballena','Las Palmeras Sierpe','Las Palmeras Osa']:
    r=fetch('https://nominatim.openstreetmap.org/search',{'q':q,'format':'jsonv2','countrycodes':'cr','limit':8,'extratags':1},pace=1.3)
    out['nominatim'][q]=[{k:x.get(k) for k in ('osm_type','osm_id','lat','lon','display_name','category','type','extratags')} for x in r or []]
json.dump(out,open(O+'/hotels_osm2.json','w'),ensure_ascii=False,indent=1);print('klaar')
