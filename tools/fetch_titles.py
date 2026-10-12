import json, os, urllib.request, urllib.parse, re, time
UA={'User-Agent':'CostaRica2027TripPlanner/1.0 (personal travel app; github.com/saddamsmit-source/costa-rica-2027)'}
API='https://commons.wikimedia.org/w/api.php'
def get(u):
    for i in range(6):
        try: time.sleep(1.2); return urllib.request.urlopen(urllib.request.Request(u,headers=UA),timeout=60).read()
        except Exception as e: print('retry',i,e); time.sleep(8*(i+1))
    raise Exception(u)
def strip(s): return re.sub(r'<[^>]+>','',s or '').strip()
cfg=json.load(open('tools/hero_titles.json'));os.makedirs('cand',exist_ok=True);out={}
for key,t in cfg['titles'].items():
    d=json.loads(get(API+'?'+urllib.parse.urlencode({'action':'query','titles':t,'prop':'imageinfo','iiprop':'url|size','iiurlwidth':1400,'format':'json'})))
    ii=list(d['query']['pages'].values())[0]['imageinfo'][0]
    open(f'cand/{key}.jpg','wb').write(get(ii['thumburl']));out[key]={'title':t,'file':f'cand/{key}.jpg'};print(key)
for key,qs in cfg['queries'].items():
    cands=[];seen=set()
    for q in qs:
        d=json.loads(get(API+'?'+urllib.parse.urlencode({'action':'query','generator':'search','gsrnamespace':6,'gsrsearch':q+' filetype:bitmap','gsrlimit':15,'prop':'imageinfo','iiprop':'url|size|mime|extmetadata','iiurlwidth':1400,'iiextmetadatafilter':'Artist|LicenseShortName|ImageDescription','format':'json'})))
        for pg in sorted(d.get('query',{}).get('pages',{}).values(),key=lambda x:x.get('index',99)):
            ii=(pg.get('imageinfo') or [{}])[0]
            if pg['title'] in seen or ii.get('mime')!='image/jpeg' or ii.get('width',0)<1600 or ii.get('width',0)<ii.get('height',0):continue
            seen.add(pg['title']);em=ii.get('extmetadata',{})
            cands.append({'title':pg['title'],'thumb':ii['thumburl'],'page':ii.get('descriptionurl'),'artist':strip(em.get('Artist',{}).get('value')),'license':strip(em.get('LicenseShortName',{}).get('value')),'desc':strip(em.get('ImageDescription',{}).get('value'))[:150]})
            if len(cands)>=6:break
        if len(cands)>=6:break
    for i,c in enumerate(cands):
        fn=f'cand/{key}_{i}.jpg';open(fn,'wb').write(get(c['thumb']));c['file']=fn
    out[key]=cands;print(key,len(cands))
json.dump(out,open('cand/candidates.json','w'),indent=1,ensure_ascii=False)
