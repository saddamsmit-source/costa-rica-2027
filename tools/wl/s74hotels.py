"""v7.4: hotelcoördinaten ophalen uit OpenStreetMap (Nominatim + Overpass) ter controle van de hotellocaties op de kaart."""
import json,os,sys,time,urllib.parse
sys.path.insert(0,os.path.join(os.path.dirname(__file__),'w21'))
from net import fetch
O='wl_out';os.makedirs(O,exist_ok=True)
H=[ # naam, zoekvarianten, bbox (zuid,west,noord,oost) rond de bestemming
 ('Fleur de Lys',['Hotel Fleur de Lys','Fleur de Lys'],(9.88,-84.15,9.98,-84.0)),
 ('Atlantida Lodge',['Atlantida Lodge','Hotel Atlantida'],(9.70,-82.90,9.80,-82.78)),
 ('Lapa Verde Lodge',['Lapa Verde Lodge','Lapa Verde'],(10.45,-83.62,10.65,-83.45)),
 ('Catarata Ecolodge',['Catarata Eco-Lodge','Catarata Ecolodge','La Catarata'],(10.40,-84.75,10.52,-84.58)),
 ('Faro Arenal',['Faro Arenal','Hotel Faro Arenal'],(10.40,-84.80,10.55,-84.55)),
 ('Eco Arenal',['Eco Arenal','Hotel Eco Arenal'],(10.40,-84.80,10.55,-84.55)),
 ("Cañon de la Vieja Lodge",['Cañon de la Vieja','Canon de la Vieja Lodge'],(10.60,-85.55,10.85,-85.25)),
 ('Rinconcito Lodge',['Rinconcito Lodge','Rinconcito'],(10.60,-85.55,10.90,-85.20)),
 ('Hotel Los Cipreses',['Los Cipreses','Hotel Los Cipreses'],(10.25,-84.88,10.36,-84.76)),
 ('Claro de Luna',['Claro de Luna','Hotel Claro de Luna'],(10.25,-84.88,10.36,-84.76)),
 ('Sueños del Bosque',['Sueños del Bosque','Suenos del Bosque'],(9.50,-83.85,9.60,-83.75)),
 ('Rio Tico Safari Lodge',['Rio Tico Safari','Río Tico Safari Lodge','Rio Tico'],(9.0,-83.85,9.35,-83.5)),
 ('Villas Rio Mar',['Villas Rio Mar','Villas Río Mar'],(9.15,-83.90,9.35,-83.75)),
 ('Hotel Vista Ballena',['Vista Ballena','Hotel Vista Ballena'],(9.05,-83.80,9.25,-83.65)),
 ('Cabinas Las Palmeras',['Cabinas Las Palmeras','Las Palmeras'],(8.40,-83.80,8.95,-83.40)),
 ('Hotel Playa Bejuco',['Playa Bejuco','Hotel Playa Bejuco'],(9.40,-84.50,9.56,-84.35)),
 ('Hotel Costa Pacifica',['Costa Pacifica','Hotel Costa Pacífica'],(9.40,-84.55,9.56,-84.35))]
out={}
for name,vars_,bb in H:
    rec={'nominatim':[],'overpass':[]}
    for q in vars_:
        r=fetch('https://nominatim.openstreetmap.org/search',{'q':q,'format':'jsonv2','countrycodes':'cr','limit':8,'addressdetails':1,'extratags':1,'namedetails':1},pace=1.2)
        for x in r or []:
            if not any(y['osm_id']==x['osm_id'] for y in rec['nominatim']):
                rec['nominatim'].append({k:x.get(k) for k in ('osm_type','osm_id','lat','lon','display_name','category','type','extratags','address','namedetails')})
    s,w,n,e=bb
    rx='|'.join(v.replace('ñ','[ñn]').replace('í','[íi]').replace('ó','[óo]') for v in vars_)
    q=f'[out:json][timeout:60];(nwr["name"~"{rx}",i]({s},{w},{n},{e}););out center tags;'
    r=fetch('https://overpass-api.de/api/interpreter',{'data':q},pace=2,timeout=120)
    for el in (r or {}).get('elements',[]):
        c=el.get('center') or {'lat':el.get('lat'),'lon':el.get('lon')}
        rec['overpass'].append({'type':el['type'],'id':el['id'],'lat':c['lat'],'lon':c['lon'],'tags':el.get('tags',{})})
    out[name]=rec;print(name,len(rec['nominatim']),len(rec['overpass']),flush=True)
json.dump(out,open(O+'/hotels_osm.json','w'),ensure_ascii=False,indent=1)
print('klaar')
