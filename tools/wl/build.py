"""Wildlife 2.0: bouw js/30-wildlife-data.js en de soortfoto's uit de opgehaalde gegevens.
Lokaal draaien: python3 tools/wl/build.py <map met stage1/stage2/stage3>
"""
import json,os,re,sys,io
from PIL import Image
SRC=sys.argv[1] if len(sys.argv)>1 else '/tmp/wl'
ROOT=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
T=lambda p:os.path.join(ROOT,p)
st1=json.load(open(f'{SRC}/stage1/stage1.json'))
st2=json.load(open(f'{SRC}/stage2/stage2.json'))
if os.path.exists(f'{SRC}/stage3/stage2.json'):st2.update(json.load(open(f'{SRC}/stage3/stage2.json')))
sel=json.load(open(T('tools/wl/select.json')))
existing={s['en']:s for s in json.load(open(T('tools/wl/existing_full.json')))['sp']}
cfg=json.load(open(T('tools/wl/config.json')))      # remap, drop, photo, names
texts={}
for f in sorted(os.listdir(T('tools/wl/texts'))):
    if f.endswith('.json'):texts.update(json.load(open(T('tools/wl/texts/'+f))))
LIC={'cc0':'CC0','cc-by':'CC BY','cc-by-sa':'CC BY-SA','cc-by-nc':'CC BY-NC','cc-by-nc-sa':'CC BY-NC-SA'}
CAT={'Aves':'Vogels','Mammalia':'Zoogdieren','Reptilia':'Reptielen','Amphibia':'Amfibieën','Animalia':'Zeeleven','Elasmobranchii':'Zeeleven'}
KEEP_CAP={'American','Central','Costa','Rican','Panama','Mexican','Caribbean','Pacific','Montezuma','Talamanca','Nicaraguan','Neotropic','Neotropical','Northern','Southern','Western','Eastern','Common','Great','Lesser'}
def key_from_en(en):
    w=en.split(' ');out=[w[0]]
    for x in w[1:]:
        if re.search(r"'s$",x) or x.split('-')[0] in {'American','Costa','Rican','Panama','Mexican','Caribbean','Pacific','Montezuma','Talamanca','Nicaraguan','Central','Neotropic','Neotropical','Baird','Cabanis','Cherrie','Hoffmann','Lesson','Geoffroy','Swainson','Wilson','Townsend','Allen','Salvin','Rothschild','Riefferi','Bonaparte','Lafresnaye','Spix','Sclater','Lawrence','Ridgway','Mangrove','Andean','Antillean','Amazon','Inca','Galápagos','Galapagos','Guianan'}:out.append(x)
        else:out.append(x.lower())
    return ' '.join(out)
def months_digits(mo):
    if not mo:return None
    v=[mo.get(str(i),0) for i in range(1,13)];m=max(v) or 1
    return ''.join(str(min(9,round(9*x/m))) for x in v),v
def season(v):
    if not v:return ''
    w=sum(v[i] for i in [10,11,0,1,2])/5;s=sum(v[i] for i in [4,5,6,7])/4
    if w>20 and s<.08*w:return 'Wintergast: vooral oktober–april in Costa Rica'
    return ''
def tier(ratio,n):
    t=4 if ratio>=.30 else 3 if ratio>=.10 else 2 if ratio>=.03 else 1
    if n<20:t=min(t,3)
    if n<8:t=min(t,2)
    if n<3:t=1
    return t
# kansen per regio (op taxon-id)
reg_t={}
for r,v in st1['regions'].items():
    ja=v['janapr'];byic={}
    for x in ja.values():byic.setdefault(x['iconic'],[]).append(x['n'])
    mx={k:(sorted(vs)[-3] if len(vs)>=3 else max(vs)) for k,vs in byic.items()}
    for x in ja.values():reg_t.setdefault(x['id'],{})[r]=tier(x['n']/mx[x['iconic']],x['n'])
curated={}
for r,l in json.load(open(T('tools/wl/existing_full.json')))['places'].items():
    for n,c in l:curated.setdefault(n,{})[r]=c
remap=cfg.get('remap',{})
override=json.load(open(f'{SRC}/stage3/photo_override.json')) if os.path.exists(f'{SRC}/stage3/photo_override.json') else {}
recs={}  # sleutel in de app -> stage2-record
byid={}
for k,v in st2.items():byid.setdefault(v['id'],[]).append(k)
for s in sel:
    k=s['key'] or str(s['id'])
    if k in cfg.get('drop',[]):continue
    if s['key'] and s['key'] in remap:
        nid=remap[s['key']];cand=[x for x in byid.get(nid,[])]
        if not cand:print('ONTBREEKT voor remap',s['key'],nid);continue
        recs[s['key']]=st2[cand[0]]
    else:
        if k not in st2:print('ontbreekt',k);continue
        recs[k]=st2[k]
for nk,src in cfg.get('clone',{}).items():
    if src in st2:recs[nk]=st2[src]
# nieuwe soorten die al als bestaande sleutel bestaan (zelfde taxon) weglaten
used={v['id'] for k,v in recs.items() if not k.isdigit()}
for k in [k for k in recs if k.isdigit()]:
    if recs[k]['id'] in used:del recs[k]
out={};os.makedirs(T('photos/wl/t'),exist_ok=True);os.makedirs(T('photos/wl/hd'),exist_ok=True)
hd_bytes=0;missing_photo=[]
for k,r in recs.items():
    key=k if not k.isdigit() else key_from_en(cfg.get('names',{}).get(k) or r.get('en') or r['sci'])
    if key in out:key=key+' ('+r['sci']+')'
    t=texts.get(k) or texts.get(key) or {}
    ex=existing.get(k)
    md,mv=months_digits(r.get('months')) or (None,None)
    cat=ex['cat'] if ex else CAT.get(r.get('iconic'),'Zeeleven')
    pick=cfg.get('photo',{}).get(k,0)
    rec={'s':r['sci'],'nl':(ex['nl'] if ex else (t.get('nl') or r.get('nl') or r.get('en') or r['sci'])),'c':cat,'f':r.get('family'),'o':r.get('order'),'i':r['id'],
         'm':(ex['moment'] if ex else t.get('m','d')),'w':r.get('wiki'),'h':t.get('h',''),'l':t.get('l',''),'v':t.get('v',''),'mo':md,'se':season(mv)}
    rr=dict(curated.get(k,{}));r1=[]
    for reg,tv in reg_t.get(r['id'],{}).items():
        if reg in rr:continue
        if tv>=2:rr[reg]=tv
        else:r1.append(reg)
    rec['r']=rr
    if r1:rec['r1']=r1
    # foto
    ph=None
    photos=r.get('photos') or []
    if k in override and override[k]:
        photos=override[k];pick=pick if isinstance(pick,int) and pick>=10 else 10
    if pick!='none' and photos:
        idx=pick if isinstance(pick,int) else 0;li=idx-10 if idx>=10 else idx
        if li<len(photos):
            p=photos[li];src=None
            for stg in ('3','2'):
                base=f"{SRC}/stage{stg}/img/{r['id']}_{idx}"
                for suf in ('_l.jpg','_m.jpg'):
                    if not src and os.path.exists(base+suf):src=base+suf
            if src:ph=(p,src)
    if ph:
        p,src=ph;pid=str(p['id']);im=Image.open(src).convert('RGB')
        hd=im.copy();hd.thumbnail((1280,1280));b=io.BytesIO();hd.save(b,'JPEG',quality=80,optimize=True,progressive=True);open(T(f'photos/wl/hd/{pid}.jpg'),'wb').write(b.getvalue());hd_bytes+=len(b.getvalue())
        mid=im.copy();mid.thumbnail((640,640));mid.save(T(f'photos/wl/{pid}.jpg'),'JPEG',quality=78,optimize=True,progressive=True)
        w,h=im.size;sq=min(w,h);top=int((h-sq)*.4) if h>w else 0;th=im.crop(((w-sq)//2,top,(w-sq)//2+sq,top+sq)).resize((160,160),Image.LANCZOS)
        th.save(T(f'photos/wl/t/{pid}.jpg'),'JPEG',quality=78,optimize=True,progressive=True)
        attr=p.get('attr') or '';m=re.match(r'\(c\)\s*(.*?),\s*(some|no) rights',attr);cr=m.group(1) if m else re.sub(r'^\(c\)\s*','',attr)
        rec.update({'p':pid,'hd':1,'cr':cr or 'onbekend','li':LIC.get(p['lic'],p['lic']),'u':f'https://www.inaturalist.org/photos/{pid}'})
    else:missing_photo.append(key)
    out[key]=rec
meta={'n':len(out),'hdMB':round(hd_bytes/1048576),'source':'iNaturalist (waarnemingen jan–apr, research grade) en Wikipedia','built':'okt 2026'}
js='/* Wildlife 2.0 – gegenereerd door tools/wl/build.py; niet met de hand aanpassen */\nconst WL2_META='+json.dumps(meta,ensure_ascii=False)+';\nconst WL2='+json.dumps(out,ensure_ascii=False,separators=(',',':'))+';\n'
open(T('js/30-wildlife-data.js'),'w').write(js)
from collections import Counter
print(len(out),Counter(v['c'] for v in out.values()),'zonder foto',len(missing_photo),missing_photo[:30],'hd MB',meta['hdMB'],'js kB',len(js)//1024)
