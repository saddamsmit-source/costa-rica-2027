"""v8.0: foto's van de officiële sites van de accommodaties inventariseren (alleen eigen domein), met afmetingen,
CORS-kop en hotlinkcontrole (Referer = github.io). Miniaturen voor visuele controle."""
import json,os,re,io,urllib.request,urllib.parse,html,time
from PIL import Image
O='wl_out';os.makedirs(O+'/th',exist_ok=True)
SITES={'Fleur de Lys':['http://www.hotelfleurdelys.com/'],
 'Atlantida Lodge':['https://web.atlantidalodge.com/','https://www.atlantidalodge.com/'],
 'Lapa Verde Lodge':['http://tortugueroecolodge.com/','http://tortugueroecolodge.com/tortuguero-lodge.html'],
 'Catarata Ecolodge':['https://catarataecolodge.com/','https://en.cataratalodge.com/','https://en.cataratalodge.com/habitaciones'],
 'Cañon de la Vieja Lodge':['https://www.thecanyonlodge.com/','https://www.thecanyonlodge.com/about-us/'],
 'Hotel Los Cipreses':['https://cipresescr.com/','https://cipresescr.com/about-us/'],
 'Sueños del Bosque':['https://www.bosquesangerardo.com/en/'],
 'Rio Tico Safari Lodge':['https://riotico.com/en/home/'],
 'Cabinas Las Palmeras':['https://www.poormansparadisecr.com/','https://www.poormansparadisecr.com/about-us.html'],
 'Hotel Playa Bejuco':['https://www.hotelplayabejuco.com/','https://www.hotelplayabejuco.com/rooms/']}
UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
def get(u,ref=None,head=False):
    h={'User-Agent':UA,'Accept':'*/*'}
    if ref:h['Referer']=ref
    req=urllib.request.Request(u,headers=h,method='HEAD' if head else 'GET')
    try:
        with urllib.request.urlopen(req,timeout=40) as r:return r.status,dict(r.headers),(b'' if head else r.read()),r.geturl()
    except Exception as e:return getattr(e,'code',0) or 0,{},b'',u
def base(u):return '.'.join(urllib.parse.urlparse(u).hostname.split('.')[-2:])
res={}
for h,starts in SITES.items():
    pages=list(starts);seen=set();imgs={};dom={base(u) for u in starts}
    i=0
    while i<len(pages) and len(seen)<10:
        u=pages[i];i+=1
        if u in seen:continue
        seen.add(u);st,hd,b,fin=get(u);time.sleep(0.5)
        if st!=200 or not b:print(h,'page',st,u,flush=True);continue
        dom.add(base(fin));t=b.decode('utf-8','ignore')
        for m in re.finditer(r'<a[^>]+href=["\']([^"\'#]+)',t):
            l=urllib.parse.urljoin(fin,html.unescape(m.group(1)))
            if base(l) in dom and re.search(r'room|habitac|suite|cabin|tent|gallery|galer|lodge|about|nosotros|facilit|accommod|bungalow|villa|hotel',l,re.I) and not re.search(r'\.(jpg|png|pdf|webp)',l,re.I) and len(pages)<25:pages.append(l)
        cand=set()
        for m in re.finditer(r'(?:src|data-src|data-lazy-src|href|content)=["\']([^"\']+\.(?:jpe?g|png|webp)(?:\?[^"\']*)?)["\']',t,re.I):cand.add(m.group(1))
        for m in re.finditer(r'srcset=["\']([^"\']+)["\']',t,re.I):
            for part in m.group(1).split(','):
                p=part.strip().split(' ')[0]
                if p:cand.add(p)
        for m in re.finditer(r'url\(["\']?([^"\')]+\.(?:jpe?g|png|webp)[^"\')]*)',t,re.I):cand.add(m.group(1))
        for m in re.finditer(r'(https?:\\?/\\?/[^"\'\s]+?\.(?:jpe?g|webp|png))',t,re.I):cand.add(m.group(1).replace('\\/','/'))
        for c in cand:
            full=urllib.parse.urljoin(fin,html.unescape(c))
            imgs.setdefault(full,set()).add(fin)
    out=[]
    for u,src in imgs.items():
        if re.search(r'logo|icon|favicon|sprite|flag|tripadvisor|booking|badge|award|payment|whatsapp|placeholder',u,re.I):continue
        st,hd,b,fin=get(u,ref='https://saddamsmit-source.github.io/');time.sleep(0.3)
        if st!=200 or len(b)<15000:continue
        try:im=Image.open(io.BytesIO(b));w,hh=im.size
        except Exception:continue
        if min(w,hh)<700:continue
        rec={'url':u,'final':fin,'w':w,'h':hh,'kb':len(b)//1024,'cors':hd.get('Access-Control-Allow-Origin') or hd.get('access-control-allow-origin'),'ctype':hd.get('Content-Type'),'pages':sorted(src)[:3],'host':urllib.parse.urlparse(fin).hostname}
        st2,_,b2,_=get(u);rec['noref']=st2
        th=f"{re.sub('[^A-Za-z]','',h)}_{len(out)}.jpg";im=im.convert('RGB');im.thumbnail((480,480));im.save(f'{O}/th/{th}',quality=78);rec['th']=th
        out.append(rec)
        if len(out)>=40:break
    res[h]={'pages':sorted(seen),'domains':sorted(dom),'imgs':out};print(h,len(seen),'pagina',len(imgs),'kandidaten',len(out),'bruikbaar',flush=True)
json.dump(res,open(O+'/sites.json','w'),ensure_ascii=False,indent=0);print('klaar')
