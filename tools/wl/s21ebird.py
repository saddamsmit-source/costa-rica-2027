"""Wildlife 2.1: eBird-waarnemerspercentages per regiocirkel (via GBIF, eBird Observation Dataset), jan–apr 2015–2025."""
import json,os,sys
from concurrent.futures import ThreadPoolExecutor
sys.path.insert(0,os.path.join(os.path.dirname(__file__),'w21'))
from net import fetch
O='wl_out';os.makedirs(O,exist_ok=True)
G='https://api.gbif.org/v1/occurrence/search';EB='4fa7b334-ce0d-4e88-aaae-2e0c138d049e'
reg=json.load(open('tools/wl/regions.json'))
def base(lat,lng,rad):return {'datasetKey':EB,'geoDistance':f'{lat},{lng},{rad}km','month':'1,4','year':'2015,2025','limit':0}
def nobs(p):
    r=fetch(G,{**p,'facet':'recordedBy','facetLimit':60000},timeout=180)
    return (len(r['facets'][0]['counts']) if r and r.get('facets') else None),(r or {}).get('count')
out={'circles':{},'names':{}}
for rn,circles in reg.items():
    for ci,(lat,lng,rad) in enumerate(circles):
        b=base(lat,lng,rad);tot_obs,tot_rec=nobs(b)
        r=fetch(G,{**b,'facet':'speciesKey','facetLimit':5000},timeout=180)
        sp={c['name']:{'rec':c['count']} for c in (r['facets'][0]['counts'] if r and r.get('facets') else [])}
        todo=[k for k,v in sp.items() if v['rec']>15]
        def job(k):return k,nobs({**b,'speciesKey':k})[0]
        with ThreadPoolExecutor(6) as ex:
            for k,n in ex.map(job,todo):sp[k]['obs']=n
        for k,v in sp.items():
            if 'obs' not in v:v['obs']=v['rec']
        out['circles'][f'{rn}#{ci}']={'region':rn,'lat':lat,'lng':lng,'rad':rad,'observers':tot_obs,'records':tot_rec,'species':sp}
        print(rn,ci,'waarnemers',tot_obs,'records',tot_rec,'soorten',len(sp),'opgevraagd',len(todo),flush=True)
        json.dump(out,open(O+'/ebird_rates.json','w'))
keys=sorted({k for c in out['circles'].values() for k in c['species']})
def nm(k):
    r=fetch('https://api.gbif.org/v1/species/'+k);return k,(r and {'sci':r.get('canonicalName') or r.get('species'),'en':r.get('vernacularName'),'family':r.get('family'),'order':r.get('order')})
with ThreadPoolExecutor(6) as ex:
    for k,v in ex.map(nm,keys):out['names'][k]=v
json.dump(out,open(O+'/ebird_rates.json','w'))
print('klaar',len(keys))
