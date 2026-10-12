"""Wildlife 2.0 stage 2: details, foto's, seizoen en Wikipedia-teksten voor de geselecteerde soorten."""
import json,time,urllib.request,urllib.parse,os,re
UA={'User-Agent':'CostaRica2027-travelplanner/1.0 (github.com/saddamsmit-source/costa-rica-2027)'}
def fetch(q,raw=False):
    for a in range(5):
        try:
            with urllib.request.urlopen(urllib.request.Request(q,headers=UA),timeout=90) as r:
                d=r.read();time.sleep(1.05);return d if raw else json.loads(d)
        except Exception as e:
            print('retry',a,e,q[:140],flush=True);time.sleep(5*(a+1))
    return None
def get(url,params):return fetch(url+'?'+urllib.parse.urlencode(params))
API='https://api.inaturalist.org/v1/'
OK={'cc0','cc-by','cc-by-sa','cc-by-nc','cc-by-nc-sa'}
sel=json.load(open(os.environ.get('WL_SEL','tools/wl/select.json')))
os.makedirs('wl_out/img',exist_ok=True)
out={}
ids=sorted(set(s['id'] for s in sel))
nl={};en={}
for i in range(0,len(ids),30):
    chunk=','.join(map(str,ids[i:i+30]))
    for loc,store in [('nl',nl),('en',en)]:
        r=get(API+'taxa/'+chunk,{'locale':loc})
        for t in (r or {}).get('results',[]):store[t['id']]=t.get('preferred_common_name')
def sections(txt):
    parts=re.split(r'\n(={2,4})\s*(.+?)\s*\1\n',txt)
    sec={'lead':parts[0].strip()}
    for j in range(1,len(parts)-2,3):sec[parts[j+1].strip()]=parts[j+2].strip()
    return sec
KEEP=re.compile(r'descr|ident|appear|voice|vocal|call|song|sound|habitat|distrib|ecolog|behav|diet|feed|breed|reprod|taxon',re.I)
for n,s in enumerate(sel):
    tid=s['id'];r=get(API+'taxa/'+str(tid),{'locale':'en'})
    t=(r or {}).get('results',[{}])[0]
    anc={a.get('rank'):a.get('name') for a in t.get('ancestors',[])}
    ancn={a.get('rank'):a.get('preferred_common_name') for a in t.get('ancestors',[])}
    photos=[]
    for tp in t.get('taxon_photos',[]):
        p=tp.get('photo',{})
        if p.get('license_code') in OK:photos.append({'id':p['id'],'lic':p['license_code'],'attr':p.get('attribution'),'url':p.get('url'),'dim':p.get('original_dimensions')})
    rec={'key':s['key'],'id':tid,'sci':t.get('name'),'en':en.get(tid) or t.get('preferred_common_name'),'nl':nl.get(tid),'iconic':t.get('iconic_taxon_name'),
         'order':anc.get('order'),'family':anc.get('family'),'family_en':ancn.get('family'),'wiki':t.get('wikipedia_url'),'summary':t.get('wikipedia_summary'),'photos':photos[:4],'obs':t.get('observations_count')}
    h=get(API+'observations/histogram',{'taxon_id':tid,'place_id':6924,'interval':'month_of_year','quality_grade':'research'})
    rec['months']=(h or {}).get('results',{}).get('month_of_year')
    for k,p in enumerate(photos[:3]):
        if not p['url']:continue
        u=p['url'].replace('square','small')
        d=fetch(u,raw=True)
        if d:open(f"wl_out/img/{tid}_{k}_s.jpg",'wb').write(d)
    if photos and photos[0]['url']:
        for size in ['medium','large']:
            d=fetch(photos[0]['url'].replace('square',size),raw=True)
            if d:open(f"wl_out/img/{tid}_0_{size[0]}.jpg",'wb').write(d)
    if rec['wiki']:
        title=urllib.parse.unquote(rec['wiki'].rsplit('/',1)[-1])
        w=get('https://en.wikipedia.org/w/api.php',{'action':'query','prop':'extracts','explaintext':1,'titles':title,'format':'json','redirects':1})
        try:
            pg=list(w['query']['pages'].values())[0];sec=sections(pg.get('extract',''))
            rec['wtitle']=pg.get('title');rec['wsec']={k:v[:3500] for k,v in sec.items() if k=='lead' or KEEP.search(k)}
        except Exception as e:print('wiki fail',title,e)
    out[s['key'] or str(tid)]=rec
    print(n,tid,rec['sci'],rec['nl'],len(photos),flush=True)
json.dump(out,open('wl_out/stage2.json','w'),ensure_ascii=False)
