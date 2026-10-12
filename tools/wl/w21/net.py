"""Gedeelde netwerkhulp voor de Wildlife 2.1-stappen (alleen GitHub Actions)."""
import json,time,urllib.request,urllib.parse,threading
UA={'User-Agent':'CostaRica2027-travelplanner/1.0 (github.com/saddamsmit-source/costa-rica-2027)'}
_lock=threading.Lock();_last=[0.0]
def fetch(url,params=None,raw=False,tries=5,pace=0.0,timeout=120):
    q=url+('?'+urllib.parse.urlencode(params) if params else '')
    for a in range(tries):
        if pace:
            with _lock:
                w=_last[0]+pace-time.time()
                if w>0:time.sleep(w)
                _last[0]=time.time()
        try:
            with urllib.request.urlopen(urllib.request.Request(q,headers=UA),timeout=timeout) as r:
                d=r.read();return d if raw else json.loads(d)
        except Exception as e:
            code=getattr(e,'code',None)
            print('retry',a,code,str(e)[:80],q[:150],flush=True)
            if code==404:return None
            time.sleep(6*(a+1)+(30 if code==429 else 0))
    return None
