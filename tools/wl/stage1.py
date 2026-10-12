"""Wildlife 2.0 stage 1: koppel bestaande soorten aan iNaturalist en tel waarnemingen per regio."""
import json,time,urllib.request,urllib.parse,os,sys
UA={'User-Agent':'CostaRica2027-travelplanner/1.0 (github.com/saddamsmit-source/costa-rica-2027)'}
def get(url,params):
    q=url+'?'+urllib.parse.urlencode(params)
    for a in range(5):
        try:
            with urllib.request.urlopen(urllib.request.Request(q,headers=UA),timeout=60) as r:
                time.sleep(1.1);return json.load(r)
        except Exception as e:
            print('retry',a,e,q[:120],flush=True);time.sleep(5*(a+1))
    return None
API='https://api.inaturalist.org/v1/'
TAXA='3,40151,26036,20978,47273'  # vogels, zoogdieren, reptielen, amfibieën, haaien/roggen
out={'match':{},'regions':{}}
os.makedirs('wl_out',exist_ok=True)
ex=json.load(open('tools/wl/existing.json'))
for s in ex:
    r=get(API+'taxa/autocomplete',{'q':s['en'],'per_page':6,'locale':'en'})
    res=[]
    for t in (r or {}).get('results',[]):
        res.append({k:t.get(k) for k in ['id','name','rank','iconic_taxon_name','preferred_common_name','matched_term','observations_count']})
    out['match'][s['en']]=res
    print('match',s['en'],res[:1],flush=True)
reg=json.load(open('tools/wl/regions.json'))
for rname,pts in reg.items():
    out['regions'][rname]={}
    for season,months in [('janapr','1,2,3,4'),('year',None)]:
        agg={}
        for lat,lng,rad in pts:
            for page in range(1,6):
                p={'lat':lat,'lng':lng,'radius':rad,'taxon_id':TAXA,'quality_grade':'research','per_page':500,'page':page,'locale':'nl','preferred_place_id':6924}
                if months:p['month']=months
                r=get(API+'observations/species_counts',p)
                if not r:break
                for x in r['results']:
                    t=x['taxon'];k=str(t['id'])
                    if k not in agg:agg[k]={'id':t['id'],'sci':t['name'],'rank':t.get('rank'),'nl':t.get('preferred_common_name'),'iconic':t.get('iconic_taxon_name'),'n':0}
                    agg[k]['n']+=x['count']
                if page*500>=r['total_results']:break
        out['regions'][rname][season]=agg
        print('region',rname,season,len(agg),flush=True)
json.dump(out,open('wl_out/stage1.json','w'),ensure_ascii=False)
