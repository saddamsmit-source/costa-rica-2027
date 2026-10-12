import json
T1=json.load(open('/tmp/wl/s21tax/targets.json'));T2=json.load(open('/tmp/wl/s21img/targets2.json'))
TG={**T1,**T2}
txt=json.load(open('new_texts.json'));pc=json.load(open('photo_choice.json'))
add={e:c for e,s,c in json.load(open('/tmp/repo/tools/wl/w21/targets.json'))['add']}
CAT={'Aves':'Vogels','Mammalia':'Zoogdieren','Reptilia':'Reptielen','Amphibia':'Amfibieën','Actinopterygii':'Zeeleven','Elasmobranchii':'Zeeleven'}
def digits(mo):
    v=[(mo or {}).get(str(i),0) for i in range(1,13)];m=max(v) or 1
    return ''.join(str(min(9,round(9*x/m))) for x in v),v
def season(v):
    w=sum(v[i] for i in [10,11,0,1,2])/5;s=sum(v[i] for i in [4,5,6,7])/4
    return 'Wintergast: vooral oktober–april in Costa Rica' if w>20 and s<.08*w else ''
new={}
WINTER={'Belted kingfisher','Townsend\'s warbler','Black-bellied plover','Ruddy turnstone','Lesser yellowlegs','Western sandpiper','Peregrine falcon'}
for k,t in txt.items():
    r=TG[k];md,mv=digits(r.get('months'))
    c=add.get(k) or CAT.get(r.get('class'),'Zeeleven')
    if r.get('class') in('Actinopterygii','Elasmobranchii'):c='Zeeleven'
    if r.get('family')=='Delphinidae':c='Zoogdieren'
    rec={'s':r['sci'],'nl':t['nl'],'c':c,'f':r.get('family'),'o':r.get('order'),'i':r['id'],'m':t.get('m','d'),'w':r.get('wiki') or '',
         'h':t['h'],'l':t['l'],'v':t.get('v',''),'mo':md,'se':'Wintergast: vooral oktober–april in Costa Rica' if k in WINTER else season(mv)}
    for x in ('en','ak','sf','lk','ft','tp','au','vw','fm'):
        if t.get(x):rec[x]=t[x]
    new[k]=rec
json.dump(new,open('/tmp/repo/tools/wl/w21/new_species.json','w'),ensure_ascii=False,indent=0)
ph={}
for k,c in pc.items():
    r=TG[k];p=r['cands'][c['j']]
    ph[k]={'id':p['id'],'lic':p['lic'],'attr':p['attr'],'src':p['src'],'obs':p.get('obs'),'place':p.get('place'),'why':c['why'],'lvl':c.get('lvl','ok')}
json.dump(ph,open('/tmp/repo/tools/wl/w21/photos.json','w'),ensure_ascii=False,indent=0)
print('nieuw',len(new),'foto',len(ph))
import collections;print(collections.Counter(r['c'] for r in new.values()))
print({k:(r['c'],r['se']) for k,r in new.items() if r['se']})
