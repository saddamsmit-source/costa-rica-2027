"""v8.0: controle Booking-foto's: bereikbaar met Referer github.io en zonder, afmetingen, miniatuur."""
import json,os,io,urllib.request
from PIL import Image
O='wl_out';os.makedirs(O+'/th',exist_ok=True)
U={"Atlantida Lodge": ["https://cf.bstatic.com/xdata/images/hotel/max1280x900/546122486.jpg?k=9975ab671236e48776b6025149f9ea525334c548f2a83e89c21cef750713e161", "https://cf.bstatic.com/xdata/images/hotel/max1280x900/546115902.jpg?k=55b668efd6b02853d13ba5560d21fd2bf9d1727ae4082fc56e0797fad6005468", "https://cf.bstatic.com/xdata/images/hotel/max1280x900/546126015.jpg?k=3e0c33caa99075d1cfd6fc75d5228a45968227c0e8d95ffb0645a88c1dfa1374"], "Cañon de la Vieja Lodge": ["https://cf.bstatic.com/xdata/images/hotel/max1280x900/17376391.jpg?k=f96c06bbdf558eef203304ec20fe17d8890227069ce93d87cb5458e39c69fa4c", "https://cf.bstatic.com/xdata/images/hotel/max1280x900/165131385.jpg?k=5db86736c5f664a432478623272bc5acefc6a0699870f3e2c0701a6725a43f03", "https://cf.bstatic.com/xdata/images/hotel/max1280x900/593417273.jpg?k=873eeecb25a8b5cdadb9bb2ec6ec33b64e1591324ee3a6bcb49dfd0a27f73324"], "Hotel Los Cipreses": ["https://cf.bstatic.com/xdata/images/hotel/max1280x900/67644880.jpg?k=0e4e2eb74bffe6fde77aa7f7df422d78d8c911edee12265bf233cec374af3587", "https://cf.bstatic.com/xdata/images/hotel/max1280x900/67644530.jpg?k=5fd2822a689e06e7af2ac77e32e8f173005356ecc3766849495500764fb0b10f", "https://cf.bstatic.com/xdata/images/hotel/max1280x900/67645146.jpg?k=892989a87a6f32c337e889f9ae7ad72ca7b9fe8b29ce07c2d16a7b163d8665ff"], "Hotel Playa Bejuco": ["https://cf.bstatic.com/xdata/images/hotel/max1280x900/599397856.jpg?k=086bf6a1dfd2d8bc7207ca3050f9d76c53be8e10fccd3d67b79bf6e91747996d", "https://cf.bstatic.com/xdata/images/hotel/max1280x900/599397841.jpg?k=faa7eea755f40819f642e055a6ba10add5a5cf788722aec687021babd342f9e3", "https://cf.bstatic.com/xdata/images/hotel/max1280x900/599397862.jpg?k=f053a2b17b4e3f994f47326ce55404d95ebc6ea3a57e0dc0be7f1ca3db4f8136"], "Cabinas Las Palmeras": ["https://cf.bstatic.com/xdata/images/hotel/max1280x900/920887438.jpg?k=4d9bb22fd629e1b524b8991236808f03cb39e90d322e0ca8ac5611d07c81c72c", "https://cf.bstatic.com/xdata/images/hotel/max1280x900/920888988.jpg?k=7c0efc8fa71052ecb21d1c148d547943b0b8920acf80838471032b7bd5290de5", "https://cf.bstatic.com/xdata/images/hotel/max1280x900/920887420.jpg?k=ad90683bb62267bbee1b6a5195609f12854b886cb8cbba3268936d03a74c9c27"], "Fleur de Lys": ["https://cf.bstatic.com/xdata/images/hotel/max1280x900/21754359.jpg?k=2fa2a238ab8e2d9f687fc9bd307d16236ca94b58cb8014590736a84925cda46f", "https://cf.bstatic.com/xdata/images/hotel/max1280x900/567031672.jpg?k=b681b88993897befc534aa68238ecf522d05dfff638ef73a42623125faa6c2f6", "https://cf.bstatic.com/xdata/images/hotel/max1280x900/275043088.jpg?k=cc9576622295fed9a0e13b98249492b039c37a37bcbeb7f5e70a12ededfd1887"]}
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
json.dump(res,open(O+'/check82.json','w'),indent=0)
