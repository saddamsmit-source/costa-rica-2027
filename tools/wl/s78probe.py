"""probe: welke Commons-downloadroute werkt snel vanuit Actions (thumb-breedtes vs origineel)."""
import time,urllib.request,json,os
os.makedirs('wl_out',exist_ok=True)
UA={'User-Agent':'CostaRica2027-travelplanner/1.0 (github.com/saddamsmit-source/costa-rica-2027)'}
base='https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Arenal_Volcano_02.jpg/{w}px-Arenal_Volcano_02.jpg'
tests=[base.format(w=w) for w in (1280,1920,2560,3840)]+['https://upload.wikimedia.org/wikipedia/commons/6/64/Arenal_Volcano_02.jpg']
out=[]
for u in tests:
    t=time.time()
    try:
        with urllib.request.urlopen(urllib.request.Request(u,headers=UA),timeout=60) as r:b=r.read();out.append([u[-40:],r.status,len(b),round(time.time()-t,1)])
    except Exception as e:out.append([u[-40:],getattr(e,'code',str(e)[:60]),0,round(time.time()-t,1)])
print(json.dumps(out,indent=0));json.dump(out,open('wl_out/probe.json','w'))
