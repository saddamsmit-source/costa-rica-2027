"""v8.2: Booking.com-pagina's van de accommodaties vinden en foto-URL's (cf.bstatic.com) verzamelen, met titel ter controle."""
import json,os,re,io,urllib.request,time,html
from PIL import Image
O='wl_out';os.makedirs(O+'/th',exist_ok=True);os.makedirs(O+'/html',exist_ok=True)
UA='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'
def get(u):
    h={'User-Agent':UA,'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8','Accept-Language':'en-GB,en;q=0.9'}
    try:
        with urllib.request.urlopen(urllib.request.Request(u,headers=h),timeout=40) as r:return r.status,r.read(),r.geturl()
    except Exception as e:return getattr(e,'code',0) or 0,b'',u
C={'Fleur de Lys':['fleur-de-lys'],'Atlantida Lodge':['atlantida-lodge-cahuita','atlantida-lodge'],'Lapa Verde Lodge':['caribbean-paradise-eco-lodge','lapa-verde-caribbean-paradise','caribbean-paradise','lapa-verde-lodge-tortuguero'],
 'Catarata Ecolodge':['albergue-la-catarata'],'Cañon de la Vieja Lodge':['canon-de-la-vieja-lodge','canon-de-la-vieja','canon-de-la-vieja-adventure-lodge'],'Hotel Los Cipreses':['cipreses','hotel-cipreses'],
 'Sueños del Bosque':['suenos-del-bosque','suenos-del-bosque-lodge','suenos-del-bosque-posada'],'Rio Tico Safari Lodge':['rio-tico-safari-lodge','rio-tico'],'Cabinas Las Palmeras':['poor-man-s-paradise-lodge'],'Hotel Playa Bejuco':['playa-bejuco','hotel-playa-bejuco']}
CITY=['tortuguero','curubande','liberia','santa-elena','monteverde-costa-rica','san-gerardo-de-dota','punta-mala','uvita','bejuco-cr','bejuco','la-fortuna','cahuita','drake','san-jose']
res={'log':[],'cities':{}}
for c in CITY:
    st,b,fin=get(f'https://www.booking.com/city/cr/{c}.en-gb.html');t=b.decode('utf-8','ignore')
    res['cities'][c]={'st':st,'len':len(t),'links':sorted(set(re.findall(r'/hotel/cr/([a-z0-9\-]+)\.',t)))[:200]};time.sleep(1.5)
    print(c,st,len(t),len(res['cities'][c]['links']),flush=True)
for h,slugs in C.items():
    for s in slugs:
        u=f'https://www.booking.com/hotel/cr/{s}.en-gb.html';st,b,fin=get(u);t=b.decode('utf-8','ignore');time.sleep(2)
        title=html.unescape((re.search(r'<title>(.*?)</title>',t,re.S) or [None,''])[1]).strip()[:150]
        imgs=[]
        for m in re.findall(r'https://cf\.bstatic\.com/xdata/images/hotel/[^"\'\s\\]+?\.jpg[^"\'\s\\]*',t):
            k=re.search(r'/(\d+)\.jpg',m)
            if k and k.group(1) not in [x[0] for x in imgs]:imgs.append((k.group(1),m))
        addr=html.unescape((re.search(r'"streetAddress"\s*:\s*"([^"]+)"',t) or [None,''])[1])
        lat=(re.search(r'data-atlas-latlng="([^"]+)"',t) or [None,''])[1]
        res['log'].append({'hotel':h,'slug':s,'st':st,'final':fin,'title':title,'addr':addr,'latlng':lat,'n':len(imgs),'imgs':[i[0] for i in imgs][:40]})
        open(f"{O}/html/{s}.html",'w').write(t[:3000000])
        print(h,s,st,title[:70],len(imgs),addr,lat,flush=True)
        if imgs:
            for i,(pid,m) in enumerate(imgs[:30]):
                for size in ['max1280x900','max1024x768']:
                    uu=f'https://cf.bstatic.com/xdata/images/hotel/{size}/{pid}.jpg'
                    st2,b2,_=get(uu)
                    if st2==200 and b2:
                        try:
                            im=Image.open(io.BytesIO(b2));w,hh=im.size;im=im.convert('RGB');im.thumbnail((420,420));th=f"{s}_{i}.jpg";im.save(f'{O}/th/{th}',quality=78)
                            res.setdefault('imgs',{}).setdefault(h,[]).append({'pid':pid,'url':uu,'w':w,'h':hh,'kb':len(b2)//1024,'th':th,'slug':s});break
                        except Exception:pass
                time.sleep(0.4)
            break
json.dump(res,open(O+'/booking.json','w'),ensure_ascii=False,indent=0);print('klaar')
