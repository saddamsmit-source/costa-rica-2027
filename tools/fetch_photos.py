import json, os, urllib.request, urllib.parse, re
UA={'User-Agent':'CostaRica2027TripPlanner/1.0 (personal travel app; github.com/saddamsmit-source/costa-rica-2027)'}
API='https://commons.wikimedia.org/w/api.php'
q=json.load(open('tools/photo_queries.json'))
os.makedirs('cand',exist_ok=True)
out={}
def get(url):
    return urllib.request.urlopen(urllib.request.Request(url,headers=UA),timeout=60).read()
def strip(s): return re.sub(r'<[^>]+>','',s or '').strip()
for key,queries in q.items():
    seen=set();cands=[]
    for qs in queries:
        p={'action':'query','generator':'search','gsrnamespace':6,'gsrsearch':qs+' filetype:bitmap','gsrlimit':12,
           'prop':'imageinfo','iiprop':'url|size|mime|extmetadata','iiurlwidth':900,
           'iiextmetadatafilter':'Artist|LicenseShortName|ImageDescription','format':'json'}
        try: d=json.loads(get(API+'?'+urllib.parse.urlencode(p)))
        except Exception as e: print(key,qs,e); continue
        pages=sorted(d.get('query',{}).get('pages',{}).values(),key=lambda x:x.get('index',99))
        for pg in pages:
            ii=(pg.get('imageinfo') or [{}])[0]
            if pg['title'] in seen or ii.get('mime')!='image/jpeg' or ii.get('width',0)<1000 or ii.get('width',0)<ii.get('height',0): continue
            seen.add(pg['title']);em=ii.get('extmetadata',{})
            cands.append({'title':pg['title'],'thumb':ii.get('thumburl'),'page':ii.get('descriptionurl'),
              'artist':strip(em.get('Artist',{}).get('value')),'license':strip(em.get('LicenseShortName',{}).get('value')),
              'desc':strip(em.get('ImageDescription',{}).get('value'))[:200]})
            if len(cands)>=6: break
        if len(cands)>=6: break
    for i,c in enumerate(cands):
        fn=f'cand/{key}_{i}.jpg'
        try: open(fn,'wb').write(get(c['thumb'])); c['file']=fn
        except Exception as e: print('dl',key,e)
    out[key]=cands
    print(key,len(cands))
json.dump(out,open('cand/candidates.json','w'),indent=1,ensure_ascii=False)
