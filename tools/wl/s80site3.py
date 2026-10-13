"""v8.0 ronde 3: Fleur de Lys (galerijpop-ups g*.htm, https-test) en Catarata Eco-Lodge (afbeeldingen uit de JS-bundel / Wix)."""
import json,os,re,io,urllib.request,urllib.parse,time
from PIL import Image
O='wl_out';os.makedirs(O+'/th',exist_ok=True)
UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
def get(u,ref=None):
    h={'User-Agent':UA,'Accept':'text/html,application/xhtml+xml,image/avif,image/webp,*/*','Accept-Language':'en-US,en;q=0.9'}
    if ref:h['Referer']=ref
    try:
        with urllib.request.urlopen(urllib.request.Request(u,headers=h),timeout=40) as r:return r.status,dict(r.headers),r.read(),r.geturl()
    except Exception as e:return getattr(e,'code',0) or 0,{'err':str(e)[:120]},b'',u
res={'log':[]}
def img(h,u,page):
    st,hd,b,fin=get(u,ref='https://saddamsmit-source.github.io/')
    if st!=200 or len(b)<8000:res['log'].append([h,'img',st,u,hd.get('err')]);return None
    try:im=Image.open(io.BytesIO(b));w,hh=im.size;im.load()
    except Exception:return None
    th=f"{re.sub('[^A-Za-z]','',h)}_{len(res.setdefault(h,[]))}.jpg";im=im.convert('RGB');im.thumbnail((480,480));im.save(f'{O}/th/{th}',quality=78)
    rec={'url':u,'w':w,'h':hh,'kb':len(b)//1024,'page':page,'th':th,'cors':hd.get('Access-Control-Allow-Origin')};res[h].append(rec);return rec
# Fleur de Lys
for i in range(1,31):
    for sch in ['https','http']:
        pu=f'{sch}://www.hotelfleurdelys.com/g{i}.htm';st,hd,b,fin=get(pu)
        res['log'].append(['Fleur',sch,i,st,hd.get('err')])
        if st==200:
            t=b.decode('utf-8','ignore')
            for m in set(re.findall(r'src=["\']([^"\']+\.(?:jpe?g|png))',t,re.I)):
                full=urllib.parse.urljoin(fin,m)
                r=img('Fleur de Lys',full,pu)
                if r and full.startswith('http:'):
                    s2,_,b2,_=get('https:'+full[5:]);r['https']=s2
            break
    time.sleep(0.3)
# Catarata: Lovable-site (JS-bundel) en Wix-site
for start in ['https://catarataecolodge.com/','https://en.cataratalodge.com/','https://www.cataratalodge.com/','https://cataratalodge.com/']:
    st,hd,b,fin=get(start);res['log'].append(['Catarata',start,st,hd.get('err')])
    if st!=200:continue
    t=b.decode('utf-8','ignore');srcs=[t]
    for js in re.findall(r'src=["\']([^"\']+\.js)["\']',t):
        s2,_,b2,_=get(urllib.parse.urljoin(fin,js));
        if s2==200:srcs.append(b2.decode('utf-8','ignore'))
    found=set()
    for s in srcs:
        for m in re.findall(r'(https?:\\?/\\?/[^"\'\s)\\]+?\.(?:jpe?g|png|webp))',s,re.I):found.add(m.replace('\\/','/'))
        for m in re.findall(r'["\'](/[^"\'\s]+?\.(?:jpe?g|png|webp))["\']',s,re.I):found.add(urllib.parse.urljoin(fin,m))
    res['log'].append(['Catarata found',start,len(found)])
    for u in sorted(found)[:80]:
        if re.search(r'logo|icon|favicon',u,re.I):continue
        if 'wixstatic' in u:u=re.sub(r'/v1/.*$','',u)
        img('Catarata Ecolodge',u,start)
json.dump(res,open(O+'/sites3.json','w'),ensure_ascii=False,indent=0);print('klaar')
