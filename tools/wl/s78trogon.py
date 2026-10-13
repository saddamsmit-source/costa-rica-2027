"""v7.8: hogeresolutie-foto's (iNaturalist research grade, Costa Rica, vrije licentie) voor diashowdieren waarvan de huidige foto te klein is."""
import json,os,sys,io
sys.path.insert(0,os.path.join(os.path.dirname(__file__),'w21'))
from net import fetch
from PIL import Image
O='wl_out';os.makedirs(O+'/trogon',exist_ok=True)
SP={'Orange-bellied trogon':'Trogon aurantiiventris|Trogon collaris aurantiiventris'}
out={}
for en,scis in SP.items():
  for sci in scis.split('|'):
    r=fetch('https://api.inaturalist.org/v1/observations',{'taxon_name':sci,'quality_grade':'research','photo_license':'cc-by,cc-by-nc,cc0,cc-by-sa,cc-by-nc-sa','place_id':6924,'order_by':'votes','per_page':30},pace=1.2)
    L=[]
    if not (r or {}).get('results'):continue
    for o in (r or {}).get('results',[]):
        ph=(o.get('photos') or [{}])[0];dims=ph.get('original_dimensions') or {}
        if min(dims.get('width',0),dims.get('height',0))<1000:continue
        pid=ph.get('id');rec={'obs':o.get('id'),'pid':pid,'dims':dims,'lic':ph.get('license_code'),'attr':ph.get('attribution'),'place':o.get('place_guess'),'ids':o.get('identifications_count'),'taxon':(o.get('taxon') or {}).get('name'),'user':(o.get('user') or {}).get('name') or (o.get('user') or {}).get('login')}
        u=(ph.get('url') or '').replace('square','original');b=fetch(u,raw=True,pace=1.0,tries=1) if u else None
        if b:
            try:
                im=Image.open(io.BytesIO(b)).convert('RGB');s=min(1,2400/max(im.size))
                if s<1:im=im.resize((round(im.width*s),round(im.height*s)),Image.LANCZOS)
                im.save(f'{O}/trogon/{pid}.jpg',quality=88);rec['file']=f'{pid}.jpg';rec['size']=im.size
            except Exception as e:rec['err']=str(e)
        L.append(rec)
        if len(L)>=8:break
    out[en]=L;print(en,len(L),flush=True);break
json.dump(out,open(O+'/trogon.json','w'),indent=0);print('klaar')
