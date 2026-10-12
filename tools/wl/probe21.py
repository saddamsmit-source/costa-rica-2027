"""Wildlife 2.1 verkenning 2: waarnemerspercentage via GBIF/eBird, IOC-namenbestand, iNat captive."""
import json,time,urllib.request,urllib.parse,os,re
UA={'User-Agent':'CostaRica2027-travelplanner/1.0 (github.com/saddamsmit-source/costa-rica-2027)'}
def fetch(q,raw=False,tries=3):
    for a in range(tries):
        try:
            t=time.time()
            with urllib.request.urlopen(urllib.request.Request(q,headers=UA),timeout=120) as r:
                d=r.read();print('ok %.1fs'%(time.time()-t),q[:120],flush=True);return d if raw else json.loads(d)
        except Exception as e:
            print('retry',a,e,q[:160],flush=True);time.sleep(4)
    return None
os.makedirs('wl_out',exist_ok=True);out={}
EB='4fa7b334-ce0d-4e88-aaae-2e0c138d049e';G='https://api.gbif.org/v1/occurrence/search?'
base={'datasetKey':EB,'geoDistance':'9.551,-83.807,8km','month':'1,4','year':'2015,2025','limit':0}
for lim in [1000,20000,100000]:
    r=fetch(G+urllib.parse.urlencode({**base,'facet':'recordedBy','facetLimit':lim}))
    out['obs_total_lim%d'%lim]=len(r['facets'][0]['counts']) if r and r.get('facets') else str(r)[:200]
    out['count']=r and r.get('count')
q=fetch('https://api.gbif.org/v1/species/match?name=Pharomachrus%20mocinno');out['qmatch']=q and q.get('usageKey')
r=fetch(G+urllib.parse.urlencode({**base,'taxonKey':q['usageKey'],'facet':'recordedBy','facetLimit':20000}))
out['quetzal_obs']=len(r['facets'][0]['counts']) if r and r.get('facets') else None;out['quetzal_rec']=r and r.get('count')
r=fetch(G+urllib.parse.urlencode({**base,'facet':'speciesKey','facetLimit':3000}))
out['species_rec_top']=r['facets'][0]['counts'][:5] if r else None
for u in ['https://www.worldbirdnames.org/new/ioc-lists/master-list-2/','https://www.worldbirdnames.org/new/ioc-lists/multilingual/','https://www.worldbirdnames.org/new/downloads/']:
    d=fetch(u,raw=True)
    if d:out['links '+u]=sorted(set(re.findall(r'href="([^"]+\.(?:xlsx|csv|xml|zip))"',d.decode('utf8','ignore'))))
I='https://api.inaturalist.org/v1/'
for tid in [23702,22040,47067]:
    for extra in [{'captive':'true'},{'quality_grade':'research'}]:
        r=fetch(I+'observations?'+urllib.parse.urlencode({'taxon_id':tid,'lat':10.305,'lng':-84.81,'radius':8,'month':'1,2,3,4',**extra,'per_page':0}))
        out['inat %d %s'%(tid,extra)]=r and r.get('total_results')
json.dump(out,open('wl_out/probe.json','w'),ensure_ascii=False,indent=1)
print(json.dumps(out,ensure_ascii=False)[:4000])
