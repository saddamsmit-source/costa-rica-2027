"""v7.8: fotoverificatie. Haalt voor elke Commons-foto in de app de metadata (coördinaten, EXIF-GPS, beschrijving,
categorieën, originele resolutie) en een 1920px-versie op; iNaturalist-originelen voor de diashowdieren;
en zoekt op Commons naar foto's van de echte hotels en activiteitlocaties."""
import json,os,sys,re
sys.path.insert(0,os.path.join(os.path.dirname(__file__),'w21'))
from net import fetch
O='wl_out';os.makedirs(O+'/img',exist_ok=True);os.makedirs(O+'/inat',exist_ok=True);os.makedirs(O+'/zoek',exist_ok=True)
IN=json.load(open(os.path.join(os.path.dirname(__file__),'s78','input.json')))
API='https://commons.wikimedia.org/w/api.php'
def clean(x):return re.sub('<[^>]+>','',x or '').strip()
def info(titles):
    out={}
    for i in range(0,len(titles),40):
        r=fetch(API,{'action':'query','format':'json','titles':'|'.join(titles[i:i+40]),'prop':'imageinfo|coordinates|categories','cllimit':'max','clshow':'!hidden',
            'iiprop':'url|size|extmetadata|mime','iiurlwidth':1920},pace=1.0)
        for p in ((r or {}).get('query') or {}).get('pages',{}).values():
            ii=(p.get('imageinfo') or [{}])[0];em=ii.get('extmetadata',{});g=lambda k:clean((em.get(k) or {}).get('value',''))
            c=(p.get('coordinates') or [{}])[0]
            out[p['title']]={'w':ii.get('width'),'h':ii.get('height'),'thumb':ii.get('thumburl'),'tw':ii.get('thumbwidth'),'url':ii.get('url'),'page':ii.get('descriptionurl'),
              'lat':c.get('lat'),'lon':c.get('lon'),'gpslat':g('GPSLatitude'),'gpslon':g('GPSLongitude'),'desc':g('ImageDescription')[:600],'date':g('DateTimeOriginal'),
              'lic':g('LicenseShortName'),'artist':g('Artist')[:150],'cats':[x['title'][9:] for x in p.get('categories',[])],'missing':'missing' in p}
    return out
def dl(meta,dest):
    for t,m in meta.items():
        u=m.get('thumb') or m.get('url')
        if not u or m.get('missing'):continue
        fn=re.sub(r'[^A-Za-z0-9]+','_',t[5:])[:80]+'.jpg';b=fetch(u,raw=True,pace=1.0,tries=2)
        if b:open(f'{dest}/{fn}','wb').write(b);m['file']=fn
T=list(dict.fromkeys(IN['titles'].values()));M=info(T);print('app-fotos',len(M),flush=True)
json.dump({'map':IN['titles'],'meta':M},open(O+'/app.json','w'),ensure_ascii=False,indent=0)
# iNaturalist-originelen
inat={}
for pid in IN['inat']:
    j=fetch(f'https://api.inaturalist.org/v1/photos/{pid}',pace=1.0)
    r=((j or {}).get('results') or [{}])[0];u=(r.get('url') or '').replace('square','original')
    inat[pid]={'url':u,'dims':r.get('original_dimensions'),'lic':r.get('license_code'),'attr':r.get('attribution')}
print('inat',len(inat),flush=True);json.dump(inat,open(O+'/inat.json','w'),indent=0)
# zoeken naar echte locaties
Z={'h_fleurdelys':['Hotel Fleur de Lys San José','Fleur de Lys Costa Rica'],'h_atlantida':['Atlantida Lodge Cahuita'],'h_lapaverde':['Lapa Verde Tortuguero','Caribbean Paradise Tortuguero'],
 'h_catarata':['Catarata Eco Lodge','Albergue La Catarata Fortuna'],'h_canon':['Cañon de la Vieja Lodge','Canon de la Vieja'],'h_cipreses':['Hotel Cipreses Monteverde'],
 'h_suenos':['Sueños del Bosque San Gerardo','Savegre Sueños del Bosque'],'h_riotico':['Rio Tico Safari Lodge'],'h_palmeras':["Poor Man's Paradise Costa Rica",'Playa Rincón Osa'],
 'h_bejuco':['Hotel Playa Bejuco','Playa Bejuco Parrita'],
 'a_bribri':['Bribri cacao','Bribri Talamanca','Bribri indigenous Costa Rica'],'a_coffee':['Monteverde coffee','café Monteverde plantación','coffee tour Monteverde'],
 'a_oropendola':['Catarata Oropéndola','Oropendola waterfall Rincón de la Vieja'],'a_coconut':['coconut palm Uvita','Uvita coconut'],'a_pavona':['La Pavona Costa Rica','La Pavona boat Tortuguero'],
 'a_nightwalk':['Monteverde night walk','Monteverde night'],'a_zipline':['Monteverde zipline canopy','Selvatura zipline'],'a_tarcoles':['Tárcoles bridge crocodiles','Puente río Tárcoles']}
Zout={}
for k,qs in Z.items():
    seen=set();res=[]
    for q in qs:
        r=fetch(API,{'action':'query','format':'json','list':'search','srsearch':q+' filetype:bitmap','srnamespace':6,'srlimit':8},pace=1.0)
        for x in ((r or {}).get('query') or {}).get('search',[]):
            if x['title'] not in seen:seen.add(x['title']);res.append(x['title'])
    Zout[k]=res[:8]
alltz=list(dict.fromkeys(t for v in Zout.values() for t in v));ZM=info(alltz)
json.dump({'hits':Zout,'meta':ZM},open(O+'/zoek.json','w'),ensure_ascii=False,indent=0);print('klaar',flush=True)
