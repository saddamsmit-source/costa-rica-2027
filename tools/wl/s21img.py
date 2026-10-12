"""Wildlife 2.1 stap 2: (a) eBird-waarnemerspercentages op eBird-naam (verbatimScientificName) voor soorten die de GBIF-backbone
niet of samengevoegd kent, (b) grote versies van de gekozen foto's, (c) gegevens + kandidaatfoto's voor extra doelsoorten."""
import json,os,re,sys,urllib.parse
from concurrent.futures import ThreadPoolExecutor
sys.path.insert(0,os.path.join(os.path.dirname(__file__),'w21'))
from net import fetch
O='wl_out';os.makedirs(O+'/img',exist_ok=True)
J=json.load(open('tools/wl/w21/stage2.json'))
# (a) eBird op verbatim naam
G='https://api.gbif.org/v1/occurrence/search';EB='4fa7b334-ce0d-4e88-aaae-2e0c138d049e'
reg=json.load(open('tools/wl/regions.json'))
def base(lat,lng,rad):return {'datasetKey':EB,'geoDistance':f'{lat},{lng},{rad}km','month':'1,4','year':'2015,2025','limit':0}
def nobs(p):
    r=fetch(G,{**p,'facet':'recordedBy','facetLimit':60000},timeout=180)
    return (len(r['facets'][0]['counts']) if r and r.get('facets') else 0),(r or {}).get('count')
eb={}
jobs=[(rn,ci,c,s) for rn,cs in reg.items() for ci,c in enumerate(cs) for s in J['verbatim']]
def job(x):
    rn,ci,(lat,lng,rad),s=x;o,n=nobs({**base(lat,lng,rad),'verbatimScientificName':s});return f'{rn}#{ci}',s,o,n
with ThreadPoolExecutor(6) as ex:
    for ck,s,o,n in ex.map(job,jobs):
        if n:eb.setdefault(ck,{})[s]={'obs':o,'rec':n}
json.dump(eb,open(O+'/ebird_verbatim.json','w'));print('verbatim klaar',sum(len(v) for v in eb.values()),flush=True)
# (b) grote foto's
def big(p):
    d=fetch(p['url'].replace('square','large').replace('medium','large'),raw=True,pace=0.3)
    if d:open(f"{O}/img/{p['id']}_l.jpg",'wb').write(d)
    return p['id'],bool(d)
with ThreadPoolExecutor(4) as ex:ok=list(ex.map(big,J['large']))
print('groot',sum(1 for _,b in ok if b),'/',len(ok),flush=True)
# (c) extra doelsoorten (zelfde opzet als s21tax)
I='https://api.inaturalist.org/v1/';P=1.25;OK={'cc0','cc-by','cc-by-sa','cc-by-nc','cc-by-nc-sa'}
def sections(txt):
    parts=re.split(r'\n(={2,4})\s*(.+?)\s*\1\n',txt);sec={'lead':parts[0].strip()}
    for j in range(1,len(parts)-2,3):sec[parts[j+1].strip()]=parts[j+2].strip()
    return sec
KEEP=re.compile(r'descr|ident|appear|voice|vocal|call|song|sound|habitat|distrib|ecolog|behav|diet|feed|breed|reprod|taxon|venom|toxic',re.I)
out={}
for en,sci in J['targets']:
    r=fetch(I+'taxa',{'q':sci,'per_page':10,'is_active':'any'},pace=P);res=(r or {}).get('results',[])
    t=([x for x in res if x['name'].lower()==sci.lower()] or res or [None])[0]
    rec={'kind':'add','en_req':en,'sci_req':sci,'alts':[{'id':x['id'],'name':x['name'],'rank':x.get('rank'),'active':x.get('is_active')} for x in res[:6]]}
    if not t:out[en]=rec;continue
    full=(fetch(I+'taxa/'+str(t['id']),{'locale':'en'},pace=P) or {}).get('results',[{}])[0]
    nl=(fetch(I+'taxa/'+str(t['id']),{'locale':'nl'},pace=P) or {}).get('results',[{}])[0].get('preferred_common_name')
    anc={a.get('rank'):a.get('name') for a in full.get('ancestors',[])}
    rec.update({'id':t['id'],'sci':full.get('name'),'rank':full.get('rank'),'active':full.get('is_active'),'en':full.get('preferred_common_name'),'nl':nl,
        'class':anc.get('class'),'order':anc.get('order'),'family':anc.get('family'),'wiki':full.get('wikipedia_url'),'obs':full.get('observations_count'),
        'cons':(full.get('conservation_status') or {}).get('status')})
    c=fetch(I+'observations',{'taxon_id':t['id'],'place_id':6924,'verifiable':'true','per_page':0},pace=P);rec['obs_cr']=c and c.get('total_results')
    h=fetch(I+'observations/histogram',{'taxon_id':t['id'],'place_id':6924,'interval':'month_of_year','verifiable':'true'},pace=P)
    rec['months']=(h or {}).get('results',{}).get('month_of_year')
    cands=[]
    for tp in full.get('taxon_photos',[])[:5]:
        p=tp.get('photo',{})
        if p.get('license_code') in OK:cands.append({'src':'taxon','id':p['id'],'lic':p['license_code'],'attr':p.get('attribution'),'url':p.get('url'),'dim':p.get('original_dimensions')})
    o=fetch(I+'observations',{'taxon_id':t['id'],'place_id':6924,'quality_grade':'research','photo_license':','.join(OK),'order_by':'votes','per_page':10,'photos':'true'},pace=P)
    for ob in (o or {}).get('results',[]):
        for p in ob.get('photos',[])[:1]:
            if p.get('license_code') in OK and not any(x['id']==p['id'] for x in cands):
                cands.append({'src':'obs','obs':ob['id'],'place':ob.get('place_guess'),'date':ob.get('observed_on'),'id':p['id'],'lic':p['license_code'],'attr':p.get('attribution'),'url':p.get('url'),'dim':p.get('original_dimensions')})
    cands=cands[:9];rec['cands']=cands
    for p in cands:
        if not p.get('url'):continue
        d=fetch(p['url'].replace('square','medium'),raw=True,pace=0.3)
        if d:open(f"{O}/img/{p['id']}_m.jpg",'wb').write(d)
        d=fetch(p['url'].replace('square','large'),raw=True,pace=0.3)
        if d:open(f"{O}/img/{p['id']}_l.jpg",'wb').write(d)
    if rec['wiki']:
        title=urllib.parse.unquote(rec['wiki'].rsplit('/',1)[-1])
        w=fetch('https://en.wikipedia.org/w/api.php',{'action':'query','prop':'extracts','explaintext':1,'titles':title,'format':'json','redirects':1})
        try:
            pg=list(w['query']['pages'].values())[0];sec=sections(pg.get('extract',''))
            rec['wtitle']=pg.get('title');rec['wsec']={k:v[:4000] for k,v in sec.items() if k=='lead' or KEEP.search(k)}
        except Exception as e:print('wiki fail',title,e)
    out[en]=rec;print('doel',en,'->',rec.get('sci'),rec.get('obs_cr'),len(cands),flush=True)
json.dump(out,open(O+'/targets2.json','w'),ensure_ascii=False)
print('klaar')
