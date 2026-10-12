"""Wildlife 2.1 – inhoudelijke correcties bovenop de Wildlife 2.0-opbouw.

Wordt aangeroepen door tools/wl/build.py. Leest uitsluitend bestanden in deze map:
  curation.json     tekst-, naam- en veiligheidscorrecties per soort-ID (sleutel)
  chances.json      herberekende trefkansen per soort-ID (zie METHODE.md)
  photos.json       vervangen of nieuwe foto's (gecontroleerd op soortniveau)
  new_species.json  nieuwe soorten (volledige records zonder foto)
Soort-ID's (sleutels) worden nooit gewijzigd of verwijderd; waarnemingen in de app
hangen aan die sleutels en blijven daardoor bewaard.
"""
import json,os
FIELDS=('en','nl','s','h','l','v','se','sf','lk','ft','tp','au','fm','sp','ak','gen','vw','m','f','o','i','w')
def _load(T,name,default):
    p=T('tools/wl/w21/'+name)
    return json.load(open(p,encoding='utf-8')) if os.path.exists(p) else default
def _src(ctx,pid):
    for d in ('s21img','s21tax','s21img2'):
        for suf in ('_l.jpg','_m.jpg'):
            p=f"{ctx['SRC']}/{d}/img/{pid}{suf}"
            if os.path.exists(p):return p
    return None
def apply(out,ctx):
    T=ctx['T'];cur=_load(T,'curation.json',{});ch=_load(T,'chances.json',{});ph=_load(T,'photos.json',{});new=_load(T,'new_species.json',{})
    log={'tekst':0,'kans':0,'foto':0,'nieuw':0}
    before=set(out)
    for k,rec in new.items():
        if k in out:raise SystemExit('Nieuwe soort heeft bestaande sleutel: '+k)
        out[k]=dict(rec);out[k]['nw']=1;log['nieuw']+=1
    for k,f in cur.items():
        if k not in out:raise SystemExit('Curatie voor onbekende sleutel: '+k)
        for x,v in f.items():
            if x not in FIELDS:continue
            if v in ('',None,[]):out[k].pop(x,None)
            else:out[k][x]=v
        log['tekst']+=1
    for k,c in ch.items():
        if k not in out:raise SystemExit('Kans voor onbekende sleutel: '+k)
        out[k]['r']=dict(c.get('r',{}))
        for x in ('r1','rn'):
            if c.get(x):out[k][x]=c[x]
            else:out[k].pop(x,None)
        log['kans']+=1
    used_before={r['p'] for r in out.values() if r.get('p')}
    for k,p in ph.items():
        if k not in out:raise SystemExit('Foto voor onbekende sleutel: '+k)
        if p.get('none'):
            for x in ('p','hd','cr','li','u'):out[k].pop(x,None)
            continue
        src=_src(ctx,p['id'])
        if not src:raise SystemExit(f"Fotobestand ontbreekt voor {k}: {p['id']}")
        f,_=ctx['save_photo'](p,src);out[k].update(f);log['foto']+=1
    # niet meer gebruikte fotobestanden opruimen (alleen in de repository; caches op telefoons blijven ongemoeid)
    # fotomakers: alleen de naam tonen (iNaturalist levert soms een anderstalige of CC0-attributie)
    import re as _re
    for r in out.values():
        cr=(r.get('cr') or '').replace('\n',' ').strip()
        m=_re.match(r'no rights reserved(?:, uploaded by (.+))?$',cr)
        if m:cr=m.group(1) or 'iNaturalist-gebruiker (CC0)'
        elif _re.search(r'rights|oikeuk|\(CC',cr):cr=cr.split(',')[0].strip()
        if r.get('cr') and cr!=r['cr']:r['cr']=cr;log['tekst']+=0
    used={r['p'] for r in out.values() if r.get('p')}
    for pid in used_before-used:
        for sub in ('','t/','hd/'):
            fp=T(f'photos/wl/{sub}{pid}.jpg')
            if os.path.exists(fp):os.remove(fp)
    hd=sum(os.path.getsize(T(f"photos/wl/hd/{r['p']}.jpg")) for r in out.values() if r.get('p') and os.path.exists(T(f"photos/wl/hd/{r['p']}.jpg")))
    missing=[k for k,r in out.items() if not r.get('p')]
    print('Wildlife 2.1:',log,'nieuw:',len(set(out)-before),'zonder foto:',missing)
    return out,hd,missing,{'v':'2.1','built':'okt 2026','source':'iNaturalist, eBird (via GBIF), Wikipedia en vakliteratuur; trefkansen volgens tools/wl/w21/METHODE.md'}
