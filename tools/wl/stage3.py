"""Wildlife 2.0 stage 3: alternatieve foto's, foto's uit waarnemingen en ontbrekende taxa."""
import json,os,runpy,urllib.request,urllib.parse,time
UA={'User-Agent':'CostaRica2027-travelplanner/1.0 (github.com/saddamsmit-source/costa-rica-2027)'}
def fetch(q,raw=False):
    for a in range(5):
        try:
            with urllib.request.urlopen(urllib.request.Request(q,headers=UA),timeout=90) as r:
                d=r.read();time.sleep(1.05);return d if raw else json.loads(d)
        except Exception as e:print('retry',a,e,q[:140],flush=True);time.sleep(5*(a+1))
cfg=json.load(open('tools/wl/stage3.json'))
os.makedirs('wl_out/img',exist_ok=True)
for key,a in cfg.get('alt',{}).items():
    for size in ['medium','large']:
        d=fetch(a['url'].replace('square',size),raw=True)
        if d:open(f"wl_out/img/{a['id']}_{a['idx']}_{size[0]}.jpg",'wb').write(d)
over={}
OK='cc0,cc-by,cc-by-sa,cc-by-nc,cc-by-nc-sa'
for key,tid in cfg.get('obsphoto',{}).items():
    r=fetch('https://api.inaturalist.org/v1/observations?'+urllib.parse.urlencode({'taxon_id':tid,'photo_license':OK,'quality_grade':'research','order_by':'votes','per_page':6,'photos':'true'}))
    cands=[]
    for o in (r or {}).get('results',[]):
        for p in o.get('photos',[]):
            if p.get('license_code') in OK.split(','):cands.append({'id':p['id'],'lic':p['license_code'],'attr':p.get('attribution'),'url':p.get('url')})
    over[key]=cands[:4]
    for k,p in enumerate(cands[:4]):
        d=fetch(p['url'].replace('square','small'),raw=True)
        if d:open(f"wl_out/img/{tid}_{10+k}_s.jpg",'wb').write(d)
        for size in ['medium','large']:
            d=fetch(p['url'].replace('square',size),raw=True)
            if d:open(f"wl_out/img/{tid}_{10+k}_{size[0]}.jpg",'wb').write(d)
    print('obs',key,len(cands),flush=True)
json.dump(over,open('wl_out/photo_override.json','w'))
if cfg.get('fetch'):
    json.dump(cfg['fetch'],open('/tmp/sel3.json','w'));os.environ['WL_SEL']='/tmp/sel3.json'
    runpy.run_path('tools/wl/stage2.py')
