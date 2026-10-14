"""v8.0: controle Booking-foto's: bereikbaar met Referer github.io en zonder, afmetingen, miniatuur."""
import json,os,io,urllib.request
from PIL import Image
O='wl_out';os.makedirs(O+'/th',exist_ok=True)
U={"Cipres": ["https://cf.bstatic.com/xdata/images/hotel/max1280x900/67644880.jpg?k=0e4e2eb74bffe6fde77aa7f7df422d78d8c911edee12265bf233cec374af3587", "https://cf.bstatic.com/xdata/images/hotel/max1280x900/67644530.jpg?k=5fd2822a689e06e7af2ac77e32e8f173005356ecc3766849495500764fb0b10f", "https://cf.bstatic.com/xdata/images/hotel/max1280x900/67645146.jpg?k=892989a87a6f32c337e889f9ae7ad72ca7b9fe8b29ce07c2d16a7b163d8665ff"]}
UA='Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
res={}
for h,l in U.items():
    for i,u in enumerate(l):
        r={}
        for ref in ['https://saddamsmit-source.github.io/',None]:
            hd={'User-Agent':UA,'Accept':'image/webp,image/*,*/*'}
            if ref:hd['Referer']=ref
            try:
                with urllib.request.urlopen(urllib.request.Request(u,headers=hd),timeout=60) as x:b=x.read();r['ref' if ref else 'noref']=x.status;r['type']=x.headers.get('Content-Type')
            except Exception as e:r['ref' if ref else 'noref']=getattr(e,'code',0) or str(e)[:60];b=b''
        try:im=Image.open(io.BytesIO(b));r['size']=im.size;r['kb']=len(b)//1024;im=im.convert('RGB');im.thumbnail((600,600));im.save(f"{O}/th/{h[:6]}_{i}.jpg",quality=80)
        except Exception as e:r['err']=str(e)[:80]
        res[u]=r;print(h,i,r,flush=True)
json.dump(res,open(O+'/check82b.json','w'),indent=0)
