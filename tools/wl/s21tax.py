"""Wildlife 2.1: taxonomie-referenties, taxonstatus bestaande soorten, en gegevens + kandidaatfoto's voor nieuwe en te vervangen soorten."""
import json,os,re,sys,urllib.parse
sys.path.insert(0,os.path.join(os.path.dirname(__file__),'w21'))
from net import fetch
O='wl_out';os.makedirs(O+'/img',exist_ok=True);os.makedirs(O+'/ref',exist_ok=True)
I='https://api.inaturalist.org/v1/';P=1.25
OK={'cc0','cc-by','cc-by-sa','cc-by-nc','cc-by-nc-sa'}
# 1. referentielijsten
for name,url in [('ebird_taxonomy.csv','https://api.ebird.org/v2/ref/taxonomy/ebird?fmt=csv'),
                 ('ioc_multiling_15.2.xlsx','https://worldbirdnames.org/Multiling%20IOC%2015.2.xlsx'),
                 ('ioc_15.2_vs_other_lists.xlsx','https://www.worldbirdnames.org/IOC_15.2_vs_other_lists.xlsx')]:
    d=fetch(url,raw=True)
    if d:open(f'{O}/ref/{name}','wb').write(d);print('ref',name,len(d),flush=True)
# 2. taxonstatus van alle bestaande soorten
src=open('js/30-wildlife-data.js').read();ids=sorted(set(int(x) for x in re.findall(r'"i":(\d+)',src)))
status={}
for loc in ['en','nl']:
    for i in range(0,len(ids),30):
        r=fetch(I+'taxa/'+','.join(map(str,ids[i:i+30])),{'locale':loc},pace=P)
        for t in (r or {}).get('results',[]):
            s=status.setdefault(t['id'],{'id':t['id'],'name':t['name'],'rank':t.get('rank'),'active':t.get('is_active'),'syn':t.get('current_synonymous_taxon_ids'),'obs':t.get('observations_count')})
            s['common_'+loc]=t.get('preferred_common_name')
print('status',len(status),flush=True)
json.dump(status,open(O+'/taxon_status.json','w'),ensure_ascii=False)
# 3. doelsoorten
T=json.load(open('tools/wl/w21/targets.json'))
def sections(txt):
    parts=re.split(r'\n(={2,4})\s*(.+?)\s*\1\n',txt);sec={'lead':parts[0].strip()}
    for j in range(1,len(parts)-2,3):sec[parts[j+1].strip()]=parts[j+2].strip()
    return sec
KEEP=re.compile(r'descr|ident|appear|voice|vocal|call|song|sound|habitat|distrib|ecolog|behav|diet|feed|breed|reprod|taxon|venom|toxic',re.I)
def resolve(sci):
    r=fetch(I+'taxa',{'q':sci,'per_page':10,'is_active':'any'},pace=P)
    res=(r or {}).get('results',[])
    ex=[t for t in res if t['name'].lower()==sci.lower()]
    t=(ex or res or [None])[0]
    return t,[{'id':x['id'],'name':x['name'],'rank':x.get('rank'),'active':x.get('is_active')} for x in res[:6]]
out={}
for kind in ['add','photo']:
    for row in T[kind]:
        en,sci=row[0],row[1];t,alts=resolve(sci)
        rec={'kind':kind,'en_req':en,'sci_req':sci,'alts':alts}
        if not t:out[en]=rec;print('GEEN TAXON',sci,flush=True);continue
        full=(fetch(I+'taxa/'+str(t['id']),{'locale':'en'},pace=P) or {}).get('results',[{}])[0]
        nl=(fetch(I+'taxa/'+str(t['id']),{'locale':'nl'},pace=P) or {}).get('results',[{}])[0].get('preferred_common_name')
        anc={a.get('rank'):a.get('name') for a in full.get('ancestors',[])}
        rec.update({'id':t['id'],'sci':full.get('name'),'rank':full.get('rank'),'active':full.get('is_active'),'syn':full.get('current_synonymous_taxon_ids'),
            'en':full.get('preferred_common_name'),'nl':nl,'iconic':full.get('iconic_taxon_name'),'class':anc.get('class'),'order':anc.get('order'),'family':anc.get('family'),
            'wiki':full.get('wikipedia_url'),'obs':full.get('observations_count'),'cons':(full.get('conservation_status') or {}).get('status')})
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
        cands=cands[:11];rec['cands']=cands
        for p in cands:
            if not p.get('url'):continue
            d=fetch(p['url'].replace('square','medium'),raw=True,pace=0.3)
            if d:open(f"{O}/img/{p['id']}_m.jpg",'wb').write(d)
        if rec['wiki']:
            title=urllib.parse.unquote(rec['wiki'].rsplit('/',1)[-1])
            w=fetch('https://en.wikipedia.org/w/api.php',{'action':'query','prop':'extracts','explaintext':1,'titles':title,'format':'json','redirects':1})
            try:
                pg=list(w['query']['pages'].values())[0];sec=sections(pg.get('extract',''))
                rec['wtitle']=pg.get('title');rec['wsec']={k:v[:4000] for k,v in sec.items() if k=='lead' or KEEP.search(k)}
            except Exception as e:print('wiki fail',title,e)
        out[en]=rec;print(kind,en,'->',rec.get('sci'),rec.get('obs_cr'),len(cands),flush=True)
json.dump(out,open(O+'/targets.json','w'),ensure_ascii=False)
# 4. soorten per geslacht in Costa Rica
gen={}
for g in T['genus_cr']:
    r=fetch(I+'taxa',{'q':g,'rank':'genus','per_page':5},pace=P);gt=[t for t in (r or {}).get('results',[]) if t['name']==g]
    if not gt:continue
    sc=fetch(I+'observations/species_counts',{'taxon_id':gt[0]['id'],'place_id':6924,'verifiable':'true','per_page':50},pace=P)
    gen[g]=[{'id':x['taxon']['id'],'name':x['taxon']['name'],'en':x['taxon'].get('preferred_common_name'),'n':x['count']} for x in (sc or {}).get('results',[])]
json.dump(gen,open(O+'/genus_cr.json','w'),ensure_ascii=False)
print('klaar')
