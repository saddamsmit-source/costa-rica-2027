import json,csv,collections
F=json.load(open('/tmp/w21/wl21_final.json'));B=json.load(open('/tmp/w21/wl2_base.json'))
ph=json.load(open('/tmp/repo/tools/wl/w21/photos.json'));pv=json.load(open('/tmp/w21/photo_verdicts.json'))
basis=json.load(open('/tmp/repo/tools/wl/w21/chance_basis.json'));ov=json.load(open('/tmp/repo/tools/wl/w21/chance_overrides.json'))
aud={r['soort-ID']:r for r in csv.DictReader(open('/tmp/audit/out/wildlife-audit-soorten.csv',encoding='utf-8-sig'),delimiter=';')}
REG=['San José','Cahuita','Tortuguero','La Fortuna','Rincón de la Vieja','Monteverde','San Gerardo de Dota','Uvita','Corcovado','Esterillos','Manuel Antonio','Tárcoles']
LAB={4:'Zeer kansrijk',3:'Kansrijk',2:'Mogelijk',1:'Zeldzaam'}
V={'ok':'gecontroleerd: soort herkenbaar','plaus':'gecontroleerd: plausibel, kenmerken niet volledig zichtbaar','replace':'vervangen','check':'gecontroleerd: plausibel'}
def fotocheck(k,r):
    if k in ph:return ('nieuw' if k not in B else 'vervangen')+f" – {ph[k]['why']}"+(' (soort op foto niet sluitend te bevestigen)' if ph[k].get('lvl')=='plaus' else '')
    a=aud.get(k)
    if a and a['nr'] in pv:return f"{V[pv[a['nr']][0]]} – {pv[a['nr']][1]}"
    if not r.get('p'):return 'geen eigen foto (oude app-foto)'
    return 'gecontroleerd: visueel consistent'
hdr=['nr','soort-ID','Nederlands','Engels (weergave)','Wetenschappelijk','Diergroep','Status 2.1','Audit 2.0','Foto','Fotomaker','Licentie','Fotocontrole','Taxonomie','Locatie/leefgebied','Kansen (regio: kans)','Zeldzaam / uitzonderlijk','Kansbron','Veiligheid','Wijzigingen 2.1','Bronnen']
rows=[]
for i,(k,r) in enumerate(sorted(F.items(),key=lambda x:(x[1]['c'],x[0])),1):
    b=B.get(k);ch=[]
    if not b:status='NIEUW'
    else:
        for f,lab in [('nl','NL-naam'),('en','EN-naam'),('h','herkenning'),('l','leefgebied'),('v','geluid'),('se','seizoen'),('sf','veiligheid'),('lk','lijkt op'),('tp','tip'),('fm','vorm'),('gen','niet op soort'),('vw','zichtbaarheid zee'),('au','vaak eerst gehoord'),('ak','oude namen')]:
            if (r.get(f) or '')!=(b.get(f) or ''):ch.append(lab)
        if r.get('p')!=b.get('p'):ch.append('foto')
        if r.get('r')!=b.get('r') or (r.get('r1') or [])!=(b.get('r1') or []):ch.append('kansen')
        status='GECORRIGEERD' if ch else 'ONGEWIJZIGD'
    src=set()
    for g,x in basis.get(k,{}).items():
        w=x['why'];src.add('eBird' if w.startswith('eBird') else 'iNaturalist' if w.startswith('iNat') else 'handmatig' if 'handmatig' in w else 'vorige versie' if 'vorige regio' in w else '')
    if ov.get(k,{}).get('marine'):src={'handmatig (zeeleven per excursie)'}
    tax=('eBird/Clements 2025' if r['c']=='Vogels' else 'iNaturalist')+(f" – weergavenaam {r['en']}" if r.get('en') else '')+(f" – {r['fm']}" if r.get('fm') else '')+(' – niet op soort' if r.get('gen') else '')
    rows.append([i,k,r['nl'],r.get('en',k),r['s'],r['c'],status,aud.get(k,{}).get('Status','') if b else 'ADD',r.get('p',''),r.get('cr',''),r.get('li',''),fotocheck(k,r),tax,
      'herberekend op 12 regiocirkels' if r.get('r') or r.get('r1') else 'niet op de route verwacht (geen waarnemingen in de regiocirkels)',
      '; '.join(f"{g}: {LAB[r['r'][g]]}" for g in REG if g in r.get('r',{})),', '.join(r.get('r1',[])),', '.join(sorted(s for s in src if s)),r.get('sf',''),', '.join(ch),f"{r.get('u','')} {r.get('w','')}".strip()])
with open('/tmp/w21/out/wildlife-21-soorten.csv','w',encoding='utf-8-sig',newline='') as f:
    w=csv.writer(f,delimiter=';');w.writerow(hdr);w.writerows(rows)
print(len(rows),collections.Counter(x[6] for x in rows))
