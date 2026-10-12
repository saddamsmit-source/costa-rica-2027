"""Wildlife 2.1: iNaturalist-waarnemerspercentages per regiocirkel voor zoogdieren, reptielen, amfibieën en zeeleven (jan–apr, wild, verifieerbaar) plus captive-tellingen."""
import json,os,sys
sys.path.insert(0,os.path.join(os.path.dirname(__file__),'w21'))
from net import fetch
O='wl_out';os.makedirs(O,exist_ok=True)
I='https://api.inaturalist.org/v1/';P=1.25
CL={'Mammalia':40151,'Reptilia':26036,'Amphibia':20978,'Actinopterygii':47178,'Elasmobranchii':47273}
reg=json.load(open('tools/wl/regions.json'));out={}
for rn,circles in reg.items():
    for ci,(lat,lng,rad) in enumerate(circles):
        geo={'lat':lat,'lng':lng,'radius':rad,'month':'1,2,3,4'};c={'region':rn,'classes':{}}
        for cn,cid in CL.items():
            w={**geo,'taxon_id':cid,'captive':'false','verifiable':'true'}
            to=fetch(I+'observations/observers',{**w,'per_page':1},pace=P)
            sc=fetch(I+'observations/species_counts',{**w,'per_page':500},pace=P)
            cap=fetch(I+'observations/species_counts',{**geo,'taxon_id':cid,'captive':'true','per_page':500},pace=P)
            sp={}
            for x in (sc or {}).get('results',[]):
                t=x['taxon'];sp[str(t['id'])]={'sci':t['name'],'en':t.get('preferred_common_name'),'n':x['count']}
            for x in (cap or {}).get('results',[]):
                t=x['taxon'];sp.setdefault(str(t['id']),{'sci':t['name'],'en':t.get('preferred_common_name'),'n':0})['cap']=x['count']
            for k,v in sp.items():
                if v['n']>3:
                    r=fetch(I+'observations/observers',{**w,'taxon_id':k,'per_page':1},pace=P);v['obs']=r and r.get('total_results')
                else:v['obs']=v['n']
            c['classes'][cn]={'observers':to and to.get('total_results'),'species':sp}
            print(rn,ci,cn,'waarnemers',to and to.get('total_results'),'soorten',len(sp),flush=True)
        out[f'{rn}#{ci}']=c;json.dump(out,open(O+'/inat_rates.json','w'),ensure_ascii=False)
print('klaar')
