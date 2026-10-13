"""v8.0: welke vrij bruikbare foto's bestaan er van de accommodaties zelf? Commons (op coördinaten + naam) en Openverse (o.a. Flickr CC)."""
import json,os,sys,re,io
sys.path.insert(0,os.path.join(os.path.dirname(__file__),'w21'))
from net import fetch
from PIL import Image
O='wl_out';os.makedirs(O+'/th',exist_ok=True)
H={'Fleur de Lys':('San José',[9.93176,-84.07272],['Hotel Fleur de Lys San José']),
 'Atlantida Lodge':('Cahuita',[9.74025,-82.84938],['Atlantida Lodge Cahuita']),
 'Lapa Verde Lodge':('Tortuguero',[10.56272,-83.51977],['Lapa Verde Lodge Tortuguero','Lapa Verde Tortuguero']),
 'Catarata Ecolodge':('La Fortuna',[10.45419,-84.66165],['Catarata Eco Lodge Fortuna','Catarata Ecolodge']),
 'Faro Arenal':('La Fortuna',None,['Faro Arenal']),
 'Eco Arenal':('La Fortuna',[10.48366,-84.63294],['Eco Arenal Fortuna']),
 'Cañon de la Vieja Lodge':('Rincón de la Vieja',[10.67796,-85.4563],['Cañon de la Vieja Lodge','Canon de la Vieja Lodge']),
 'Rinconcito Lodge':('Rincón de la Vieja',[10.73286,-85.30103],['Rinconcito Lodge']),
 'Hotel Los Cipreses':('Monteverde',[10.32215,-84.82373],['Hotel Los Cipreses Monteverde']),
 'Claro de Luna':('Monteverde',[10.31636,-84.82715],['Claro de Luna Monteverde']),
 'Sueños del Bosque':('San Gerardo de Dota',[9.54836,-83.80909],['Sueños del Bosque San Gerardo','Suenos del Bosque']),
 'Rio Tico Safari Lodge':('Uvita',[9.08149,-83.61971],['Rio Tico Safari Lodge']),
 'Villas Rio Mar':('Dominical',[9.26346,-83.86028],['Villas Rio Mar Dominical']),
 'Hotel Vista Ballena':('Uvita',None,['Vista Ballena Uvita']),
 'Cabinas Las Palmeras':('Corcovado',[8.65726,-83.71165],['Cabinas Las Palmeras Osa','Poor Man\'s Paradise Osa','Poor Mans Paradise Corcovado']),
 'Hotel Playa Bejuco':('Esterillos',[9.5195,-84.43499],['Hotel Playa Bejuco']),
 'Hotel Costa Pacifica':('Esterillos',None,['Hotel Costa Pacifica Esterillos'])}
API='https://commons.wikimedia.org/w/api.php'
def info(titles):
    out={}
    for i in range(0,len(titles),40):
        r=fetch(API,{'action':'query','format':'json','titles':'|'.join(titles[i:i+40]),'prop':'imageinfo|coordinates','iiprop':'url|size|extmetadata','iiurlwidth':640},pace=1.0) or {}
        for p in (r.get('query') or {}).get('pages',{}).values():
            ii=(p.get('imageinfo') or [{}])[0];em=ii.get('extmetadata',{});g=lambda x:re.sub('<[^>]+>','',(em.get(x) or {}).get('value','')).strip()
            out[p['title']]={'thumb':ii.get('thumburl'),'w':ii.get('width'),'h':ii.get('height'),'page':ii.get('descriptionurl'),'lic':g('LicenseShortName'),'artist':' '.join(g('Artist').split())[:100],'desc':' '.join(g('ImageDescription').split())[:300],'cats':g('Categories')[:300],'co':p.get('coordinates')}
    return out
res={}
for h,(pl,ll,qs) in H.items():
    c=set()
    if ll:
        r=fetch(API,{'action':'query','format':'json','list':'geosearch','gscoord':f'{ll[0]}|{ll[1]}','gsradius':300,'gsnamespace':6,'gslimit':50},pace=1.0) or {}
        for x in (r.get('query') or {}).get('geosearch',[]):c.add(x['title'])
    for q in qs:
        r=fetch(API,{'action':'query','format':'json','list':'search','srsearch':q,'srnamespace':6,'srlimit':20},pace=1.0) or {}
        for x in (r.get('query') or {}).get('search',[]):c.add(x['title'])
    com=info(sorted(c)) if c else {}
    ov=[]
    for q in qs:
        r=fetch('https://api.openverse.org/v1/images/',{'q':q,'page_size':20},pace=2.0) or {}
        for x in r.get('results',[]):ov.append({k:x.get(k) for k in ['title','creator','license','license_version','source','foreign_landing_url','url','thumbnail','width','height','tags']})
    res[h]={'place':pl,'ll':ll,'commons':com,'openverse':ov}
    # thumbnails voor visuele controle
    n=0
    for t,m in com.items():
        if m.get('thumb') and n<12:
            b=fetch(m['thumb'],raw=True,pace=1.0,tries=2)
            if b:
                try:Image.open(io.BytesIO(b)).convert('RGB').save(f"{O}/th/{re.sub('[^A-Za-z]','',h)}_c{n}.jpg",quality=80);m['th']=f"{re.sub('[^A-Za-z]','',h)}_c{n}.jpg";n+=1
                except Exception:pass
    n=0
    for m in ov[:12]:
        u=m.get('thumbnail') or m.get('url')
        b=fetch(u,raw=True,pace=1.0,tries=2) if u else None
        if b:
            try:im=Image.open(io.BytesIO(b)).convert('RGB');im.thumbnail((640,640));im.save(f"{O}/th/{re.sub('[^A-Za-z]','',h)}_o{n}.jpg",quality=80);m['th']=f"{re.sub('[^A-Za-z]','',h)}_o{n}.jpg";n+=1
            except Exception:pass
    print(h,len(com),len(ov),flush=True)
json.dump(res,open(O+'/hotels.json','w'),ensure_ascii=False,indent=0);print('klaar')
