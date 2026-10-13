"""v7.7: kandidaat-sfeerfoto's per bestemming van Wikimedia Commons (vrije licentie, met coördinaten waar beschikbaar)."""
import json,os,sys,re,urllib.parse
sys.path.insert(0,os.path.join(os.path.dirname(__file__),'w21'))
from net import fetch
O='wl_out';os.makedirs(O+'/dia',exist_ok=True)
API='https://commons.wikimedia.org/w/api.php'
Q_ALL={'sanjose':['Teatro Nacional de Costa Rica','Catedral Metropolitana San José Costa Rica','Avenida Central San José Costa Rica','Barrio Amón San José'],
 'cahuita':['Cahuita National Park beach','Playa Negra Cahuita','Cahuita Costa Rica coast','Punta Cahuita'],
 'tortuguero':['Tortuguero canal','Tortuguero National Park canal','Tortuguero village','Tortuguero beach'],
 'fortuna':['Arenal Volcano','Volcán Arenal','Lake Arenal volcano','La Fortuna waterfall'],
 'rincon':['Rincón de la Vieja National Park','Las Pailas Rincón de la Vieja','Rincon de la Vieja volcano','Rincón de la Vieja waterfall'],
 'monteverde':['Monteverde cloud forest','Monteverde Cloud Forest Reserve','Monteverde hanging bridge','Santa Elena Cloud Forest Reserve'],
 'sangerardo':['San Gerardo de Dota','Savegre River','Los Quetzales National Park','Savegre valley'],
 'uvita':['Marino Ballena National Park','Punta Uvita','Playa Uvita','Bahía Ballena Costa Rica'],
 'corcovado':['Corcovado National Park','Drake Bay Costa Rica','Sirena Corcovado','Corcovado beach'],
 'esterillos':['Playa Esterillos','Esterillos Oeste','Playa Bejuco Parrita','Esterillos Costa Rica'],
 'manuel':['Manuel Antonio National Park beach','Playa Manuel Antonio','Manuel Antonio National Park','Playa Espadilla'],
 'tarcoles':['Tárcoles River','Rio Tarcoles','Carara National Park','Tárcoles crocodiles bridge']}
Q={'mv2':['Santa Elena Monteverde Costa Rica','Monteverde Costa Rica landscape view','Curi-Cancha Monteverde','Monteverde Reserve trail','Monteverde Gulf of Nicoya view']} if os.environ.get('DIA2','1')=='1' else Q_ALL
OK=re.compile(r'^(CC0|CC BY(-SA)? [0-9.]+|CC BY(-SA)?|Public domain|PD.*)$',re.I)
meta={}
for reg,qs in Q.items():
    seen=set();cands=[]
    for q in qs:
        r=fetch(API,{'action':'query','format':'json','generator':'search','gsrsearch':q+' filetype:bitmap','gsrnamespace':6,'gsrlimit':12,
            'prop':'imageinfo|coordinates','iiprop':'url|size|extmetadata|mime','iiurlwidth':1280},pace=1.0)
        for p in sorted(((r or {}).get('query') or {}).get('pages',{}).values(),key=lambda p:p.get('index',99)):
            t=p['title']
            if t in seen:continue
            seen.add(t);ii=(p.get('imageinfo') or [{}])[0];em=ii.get('extmetadata',{})
            lic=(em.get('LicenseShortName') or {}).get('value','')
            if ii.get('mime')!='image/jpeg' or not OK.match(lic.strip()):continue
            if ii.get('width',0)<1200 or ii.get('width',0)<ii.get('height',1):continue
            c=(p.get('coordinates') or [{}])[0]
            cands.append({'title':t,'q':q,'w':ii['width'],'h':ii['height'],'thumb':ii.get('thumburl'),'page':ii.get('descriptionurl'),
              'lic':lic,'artist':re.sub('<[^>]+>','',(em.get('Artist') or {}).get('value',''))[:120],
              'desc':re.sub('<[^>]+>','',(em.get('ImageDescription') or {}).get('value',''))[:300],
              'lat':c.get('lat'),'lon':c.get('lon')})
    cands=cands[:8]
    for i,c in enumerate(cands):
        b=fetch(c['thumb'],raw=True,pace=1.0,tries=2)
        if b:open(f"{O}/dia/{reg}-{i:02d}.jpg",'wb').write(b);c['file']=f"{reg}-{i:02d}.jpg"
    meta[reg]=cands;print(reg,len(cands),flush=True)
json.dump(meta,open(O+'/dia2.json','w'),ensure_ascii=False,indent=1);print('klaar')
