"""Wildlife 2.1 verkenning: welke databronnen zijn bruikbaar (GBIF/eBird, eBird-taxonomie, IOC-namen, iNat captive)."""
import json,time,urllib.request,urllib.parse,os
UA={'User-Agent':'CostaRica2027-travelplanner/1.0 (github.com/saddamsmit-source/costa-rica-2027)'}
def fetch(q,raw=False,tries=3):
    for a in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(q,headers=UA),timeout=90) as r:
                d=r.read();time.sleep(1);return d if raw else json.loads(d)
        except Exception as e:
            print('retry',a,e,q[:160],flush=True);time.sleep(4)
    return None
os.makedirs('wl_out',exist_ok=True);out={}
EB='4fa7b334-ce0d-4e88-aaae-2e0c138d049e'
G='https://api.gbif.org/v1/occurrence/search?'
p={'datasetKey':EB,'geoDistance':'10.305,-84.81,8km','month':'1,4','limit':2}
r=fetch(G+urllib.parse.urlencode(p));out['gbif_sample']=r
p2={'datasetKey':EB,'geoDistance':'10.305,-84.81,8km','month':'1,4','limit':0,'facet':'eventId','facetLimit':5}
out['gbif_facet_event']=fetch(G+urllib.parse.urlencode(p2))
p3={'datasetKey':EB,'geoDistance':'10.305,-84.81,8km','month':'1,4','limit':0,'facet':'speciesKey','facetLimit':3000}
r3=fetch(G+urllib.parse.urlencode(p3));out['gbif_species_n']=len(r3['facets'][0]['counts']) if r3 and r3.get('facets') else r3
out['gbif_total']=r3.get('count') if r3 else None
p4={'datasetKey':EB,'geoDistance':'10.305,-84.81,8km','month':'1,4','limit':0,'facet':'eventId','facetLimit':100000}
r4=fetch(G+urllib.parse.urlencode(p4));out['gbif_event_n']=len(r4['facets'][0]['counts']) if r4 and r4.get('facets') else str(r4)[:300]
out['ebird_tax']=str(fetch('https://api.ebird.org/v2/ref/taxonomy/ebird?fmt=json&species=belkin1,cocboo1,spbbob1'))[:1500]
for u in ['https://www.worldbirdnames.org/new/ioc-lists/master-list-2/','https://www.worldbirdnames.org/new/']:
    d=fetch(u,raw=True);out['ioc_'+u[-12:]]=d.decode('utf8','ignore')[:200] if d else None
    if d:
        import re;out['ioc_links_'+u[-12:]]=sorted(set(re.findall(r'href="([^"]+\.(?:xlsx|csv|xml))"',d.decode('utf8','ignore'))))[:40]
I='https://api.inaturalist.org/v1/'
for q in [{'taxon_id':24259,'lat':10.305,'lng':-84.81,'radius':8,'month':'1,2,3,4','captive':'true'},{'taxon_id':24259,'lat':10.305,'lng':-84.81,'radius':8,'month':'1,2,3,4','quality_grade':'research'},{'taxon_id':24259,'lat':10.305,'lng':-84.81,'radius':8,'month':'1,2,3,4','captive':'false'}]:
    r=fetch(I+'observations?'+urllib.parse.urlencode({**q,'per_page':0}));out['inat_'+json.dumps(q)]=r and r.get('total_results')
json.dump(out,open('wl_out/probe.json','w'),ensure_ascii=False,indent=1)
print(json.dumps(out,ensure_ascii=False)[:3000])
