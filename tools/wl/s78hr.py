"""v7.8: originelen ophalen (Commons + iNaturalist) en verkleinen tot max. 2400 px lange zijde; kandidaten purperkeeljuweelkolibrie (iNat research grade)."""
import json,os,sys,io,re
sys.path.insert(0,os.path.join(os.path.dirname(__file__),'w21'))
from net import fetch
from PIL import Image
O='wl_out';os.makedirs(O+'/hr',exist_ok=True);os.makedirs(O+'/inat',exist_ok=True);os.makedirs(O+'/gem',exist_ok=True)
IN=json.load(open(os.path.join(os.path.dirname(__file__),'s78','input2.json')))
API='https://commons.wikimedia.org/w/api.php'
def save(b,path):
    im=Image.open(io.BytesIO(b));im=im.convert('RGB');w,h=im.size;s=min(1,2400/max(w,h))
    if s<1:im=im.resize((round(w*s),round(h*s)),Image.LANCZOS)
    im.save(path,quality=88);return im.size
meta={};titles=list(IN['titles'].items())
for i in range(0,len(titles),40):
    ch=titles[i:i+40];r=fetch(API,{'action':'query','format':'json','titles':'|'.join(t for _,t in ch),'prop':'imageinfo','iiprop':'url|size|extmetadata'},pace=1.0)
    r2={}
    pages={p['title']:p for p in ((r or {}).get('query') or {}).get('pages',{}).values()}
    norm={n['from']:n['to'] for n in ((r or {}).get('query') or {}).get('normalized',[])}
    for k,t in ch:
        p=pages.get(norm.get(t,t),{});ii=(p.get('imageinfo') or [{}])[0];em=ii.get('extmetadata',{});g=lambda x:re.sub('<[^>]+>','',(em.get(x) or {}).get('value','')).strip()
        meta[k]={'title':t,'url':ii.get('url'),'w':ii.get('width'),'h':ii.get('height'),'page':ii.get('descriptionurl'),'lic':g('LicenseShortName'),'artist':' '.join(g('Artist').split())[:120]}
def thumb(u,w):
    import urllib.parse
    a,b=u.split('/wikipedia/commons/');n=b.split('/')[-1];return a+'/wikipedia/commons/thumb/'+b+'/'+str(w)+'px-'+n
for k,m in meta.items():
    if not m['url']:continue
    W=m.get('w') or 0;tw=1920 if W>1920 else (1280 if W>1280 else 960)
    m['tw']=tw;b=fetch(thumb(m['url'],tw),raw=True,pace=1.0,tries=2)
    if b:
        try:m['size']=save(b,f'{O}/hr/{k}.jpg');m['file']=k+'.jpg'
        except Exception as e:m['err']=str(e)
    print(k,m.get('size'),flush=True)
json.dump(meta,open(O+'/hr.json','w'),ensure_ascii=False,indent=0)
inat={}
for pid in IN['inat']:
    got=None
    for u in [f'https://inaturalist-open-data.s3.amazonaws.com/photos/{pid}/original.jpg',f'https://inaturalist-open-data.s3.amazonaws.com/photos/{pid}/original.jpeg',f'https://static.inaturalist.org/photos/{pid}/original.jpg',f'https://inaturalist-open-data.s3.amazonaws.com/photos/{pid}/large.jpg']:
        b=fetch(u,raw=True,pace=1.0,tries=1)
        if b and len(b)>20000:
            try:sz=save(b,f'{O}/inat/{pid}.jpg');got={'url':u,'size':sz};break
            except Exception:pass
    inat[pid]=got;print('inat',pid,got,flush=True)
json.dump(inat,open(O+'/inat.json','w'),indent=0)
r=fetch('https://api.inaturalist.org/v1/observations',{'taxon_name':'Lampornis calolaemus','quality_grade':'research','photo_license':'cc-by,cc-by-nc,cc0,cc-by-sa,cc-by-nc-sa','place_id':6924,'order_by':'votes','per_page':12},pace=1.0)
gem=[]
for o in (r or {}).get('results',[]):
    ph=(o.get('photos') or [{}])[0];pid=ph.get('id');u=(ph.get('url') or '').replace('square','large')
    rec={'obs':o.get('id'),'pid':pid,'user':(o.get('user') or {}).get('login'),'lic':ph.get('license_code'),'attr':ph.get('attribution'),'place':o.get('place_guess'),'grade':o.get('quality_grade'),'ids':o.get('identifications_count'),'taxon':(o.get('taxon') or {}).get('name')}
    b=fetch(u,raw=True,pace=1.0,tries=1) if u else None
    if b:open(f'{O}/gem/{pid}.jpg','wb').write(b);rec['file']=f'{pid}.jpg'
    gem.append(rec)
json.dump(gem,open(O+'/gem.json','w'),indent=0);print('klaar',flush=True)
