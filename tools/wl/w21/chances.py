"""Wildlife 2.1 – trefkansmodel. Zie METHODE.md voor de uitleg.

Invoer (stage-data van de wildlife-data-branch, uitgepakt in SRC):
  s21ebird/ebird_rates.json      eBird via GBIF: waarnemers per soort per regiocirkel (backbone-naam)
  s21img/ebird_verbatim.json     idem op exacte eBird-naam (voor soorten die GBIF niet of samengevoegd kent)
  s21inat/inat_rates.json        iNaturalist: waarnemers per soort per klasse per regiocirkel (+ captive-tellingen)
  base.json                      huidige Wildlife-records (sleutel -> s, c, f, i, m, mo)
  new.json                       nieuwe soorten (zelfde velden)
Uitvoer: chances.json (per sleutel r / r1 / rn) en chance_basis.json (onderbouwing per soort en regio).
Gebruik: python3 chances.py SRC
"""
import json,os,sys
SRC=sys.argv[1];HERE=os.path.dirname(os.path.abspath(__file__))
L=lambda p:json.load(open(os.path.join(SRC,p),encoding='utf-8'))
EB=L('s21ebird/ebird_rates.json');VB=L('s21img/ebird_verbatim.json') if os.path.exists(os.path.join(SRC,'s21img/ebird_verbatim.json')) else {}
IN=L('s21inat/inat_rates.json');BASE=L('base.json');NEW=L('new.json') if os.path.exists(os.path.join(SRC,'new.json')) else {}
OV=json.load(open(os.path.join(HERE,'chance_overrides.json'),encoding='utf-8'))
REGIONS=['San José','Cahuita','Tortuguero','La Fortuna','Rincón de la Vieja','Monteverde','San Gerardo de Dota','Uvita','Corcovado','Esterillos','Manuel Antonio','Tárcoles']
NIGHTWALK={'Tortuguero','Monteverde'}          # geplande nachtwandelingen (dag 4–5 en dag 11)
MIN_EB=150;MIN_IN=100                            # minimum aantal waarnemers in een cirkel
TB=[(0.50,4),(0.20,3),(0.05,2),(0.002,1)]       # vogels: aandeel eBird-waarnemers
TN=[(0.35,4),(0.15,3),(0.04,2),(0.0,1)]        # overige: aandeel iNaturalist-waarnemers binnen de klasse
SKULK={'Tinamidae','Formicariidae','Grallariidae','Odontophoridae','Scleruridae'}
NIGHTB={'Strigidae','Tytonidae','Nyctibiidae','Caprimulgidae'}
BATS={'Emballonuridae','Phyllostomidae','Thyropteridae','Vespertilionidae','Noctilionidae','Molossidae'}
SLOTH={'Bradypodidae','Choloepodidae'}
SNAKE={'Viperidae','Colubridae','Dipsadidae','Boidae','Elapidae','Natricidae','Leptotyphlopidae','Typhlopidae','Loxocemidae','Tropidophiidae'}
def tier(x,T,nmin,need=1):
    if nmin<need:return 0
    for th,t in T:
        if x>=th:return t
    return 0
# ---- vogels: index op naam ----
bysci={}
for k,v in EB['names'].items():
    if v and v.get('sci'):bysci.setdefault(v['sci'],k)
def bird_rates(sci,alts=()):
    out={}
    for ck,c in EB['circles'].items():
        reg=c['region'];T=c['observers'] or 0
        if T<MIN_EB:continue
        cand=(sci,*alts);vb=next((s for s in cand if any(s in v for v in VB.values())),None)
        if vb:
            o=VB.get(ck,{}).get(vb,{}).get('obs',0)
        else:
            key=next((bysci[s] for s in cand if s in bysci),None)
            if key is None:return None
            o=c['species'].get(key,{}).get('obs',0)
        r=o/T
        if r>out.get(reg,(0,))[0]:out[reg]=(r,o,T,ck)
    return out
CLASS={'Zoogdieren':['Mammalia'],'Reptielen':['Reptilia'],'Amfibieën':['Amphibia'],'Zeeleven':['Actinopterygii','Elasmobranchii','Reptilia','Mammalia']}
def inat_rates(rec):
    out={};cap=0;n=0
    for ck,c in IN.items():
        reg=c['region']
        for cn in CLASS.get(rec['c'],[]):
            v=c['classes'].get(cn);T=(v or {}).get('observers') or 0
            if not v:continue
            sp=v['species'].get(str(rec.get('i'))) or next((x for x in v['species'].values() if x['sci']==rec['s']),None)
            if not sp:continue
            cap+=sp.get('cap',0);n+=sp.get('n',0)
            if T<MIN_IN:continue
            r=(sp.get('obs') or 0)/T
            if r>out.get(reg,(0,))[0]:out[reg]=(r,sp.get('obs') or 0,T,ck)
    return out,cap,n
def season_cap(mo):
    if not mo or len(mo)!=12:return 4
    v=[int(x) for x in mo];feb=v[1]
    if feb==0 and max(v)>=5:return 1
    if feb<=2 and max(v)>=7:return 2
    return 4
res={};basis={}
for key,rec in {**BASE,**NEW}.items():
    o=OV.get(key,{})
    if o.get('skip'):continue
    t={};why={};note=dict(o.get('rn',{}))
    if rec['c']=='Vogels':
        rates=bird_rates(rec['s'],tuple(o.get('alt',[])))
        if rates is None:basis[key]={'bron':'geen eBird-gegevens'};rates={}
        for reg,(x,ob,T,ck) in rates.items():
            t[reg]=tier(x,TB,ob,3);why[reg]=f'eBird {ob}/{T} waarnemers ({x:.1%}, {ck})'
        fam=rec.get('f')
        for reg in list(t):
            if fam in SKULK and t[reg]>1:t[reg]-=1;why[reg]+='; schuw, vooral gehoord (−1)'
            if fam in NIGHTB:
                mx=3 if reg in NIGHTWALK else 2
                if t[reg]>mx:t[reg]=mx;why[reg]+=f'; nachtsoort (max {mx})'
    elif o.get('marine'):pass
    elif rec['c'] in CLASS:
        rates,cap,n=inat_rates(rec)
        for reg,(x,ob,T,ck) in rates.items():
            t[reg]=tier(x,TN,ob,1);why[reg]=f'iNaturalist {ob}/{T} waarnemers ({x:.1%}, {ck})'
        fam=rec.get('f');night=rec.get('m')=='n'
        capmax=1 if n and cap>=0.5*n else 2 if n and cap>=0.25*n else 4
        for reg in list(t):
            mx=4;r=[]
            if capmax<4:mx=min(mx,capmax);r.append(f'veel waarnemingen in gevangenschap ({cap}/{n})')
            if fam=='Felidae':mx=min(mx,1);r.append('katachtige')
            if rec['c']=='Zoogdieren' and night and fam not in BATS|SLOTH|{'Felidae'}:
                m2=3 if reg in NIGHTWALK else 1;mx=min(mx,m2);r.append('nachtactief zoogdier')
            if rec['c']=='Amfibieën' and night:
                m2=3 if reg in NIGHTWALK else 2;mx=min(mx,m2);r.append('nachtactieve kikker')
            if fam in SNAKE:mx=min(mx,2);r.append('slang')
            if reg=='San José' and rec['c']!='Vogels':mx=min(mx,1);r.append('stad, aankomst/vertrek')
            if t[reg]>mx:t[reg]=mx;why[reg]+=f'; max {mx}: '+', '.join(r)
    sc=season_cap(rec.get('mo'))
    for reg in list(t):
        if t[reg]>sc:t[reg]=sc;why[reg]+=f'; seizoen februari (max {sc})'
    if o.get('only'):
        for reg in [r for r in t if r not in o['only']]:t.pop(reg);why[reg]=f"niet in leefgebied van deze vorm: {o.get('why','')}"
    for reg,v in o.get('set',{}).items():
        why[reg]=(why[reg]+'; ' if why.get(reg) else '')+f"handmatig {v}: {o.get('why','')}".strip();t[reg]=v
    for reg,v in o.get('max',{}).items():
        if t.get(reg,0)>v:t[reg]=v;why[reg]=why.get(reg,'')+f"; handmatig max {v}: {o.get('why','')}"
    t={reg:v for reg,v in t.items() if v>0 and reg in REGIONS}
    if not t and not o.get('set') and not o.get('marine') and key in BASE:
        old=BASE[key];t={reg:1 for reg in list(old.get('r',{}))+list(old.get('r1',[])) if reg in REGIONS}
        for reg in t:why[reg]='weinig of geen recente waarnemingen in de regiocirkels; vorige regio behouden als zeldzaam';note.setdefault(reg,'Weinig gegevens: kans niet goed te schatten')
    r={reg:v for reg,v in t.items() if v>=2};r1=sorted([reg for reg,v in t.items() if v==1],key=REGIONS.index)
    res[key]={'r':dict(sorted(r.items(),key=lambda x:REGIONS.index(x[0]))),'r1':r1,'rn':{k:v for k,v in note.items() if k in t}}
    basis[key]={reg:{'t':t.get(reg,0),'why':why.get(reg,'')} for reg in why}
json.dump(res,open(os.path.join(HERE,'chances.json'),'w',encoding='utf-8'),ensure_ascii=False,indent=0)
json.dump(basis,open(os.path.join(HERE,'chance_basis.json'),'w',encoding='utf-8'),ensure_ascii=False,indent=0)
print('soorten',len(res),'met kans',sum(1 for v in res.values() if v['r'] or v['r1']))
