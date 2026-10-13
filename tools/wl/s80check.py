"""v8.0: eindcontrole hotelfoto's: bereikbaar met Referer github.io en zonder, afmetingen, miniatuur."""
import json,os,io,urllib.request
from PIL import Image
O='wl_out';os.makedirs(O+'/th',exist_ok=True)
U={"Atlantida Lodge": ["https://web.atlantidalodge.com/images/piscina-atlantida.webp", "https://web.atlantidalodge.com/images/estandar.webp", "https://web.atlantidalodge.com/images/salon-atlantida.webp"], "Cañon de la Vieja Lodge": ["https://www.thecanyonlodge.com/wp-content/uploads/2023/11/2.png", "https://www.thecanyonlodge.com/wp-content/uploads/2023/11/18.png", "https://www.thecanyonlodge.com/wp-content/uploads/2023/11/20.png"], "Hotel Los Cipreses": ["https://cipresescr.com/wp-content/uploads/2020/04/slider-home-cipreses.jpg", "https://cipresescr.com/wp-content/uploads/2020/04/hotel-cipreses-picture-19.jpg", "https://cipresescr.com/wp-content/uploads/2014/12/familiy-room-3-2048x2048.jpg"], "Sueños del Bosque": ["https://www.bosquesangerardo.com/images/sbVista-desde-lago-01.jpg", "https://www.bosquesangerardo.com/images/sbBungalow-Standard-Vista-Frontal-01.jpg", "https://www.bosquesangerardo.com/images/sbBungalow-con-chimenea-03.jpg"], "Hotel Playa Bejuco": ["https://www.hotelplayabejuco.com/wp-content/uploads/2024/10/Piscina-principal-2.jpg", "https://www.hotelplayabejuco.com/wp-content/uploads/2024/11/lobby-hotel-playa-bejuco.jpg", "https://www.hotelplayabejuco.com/wp-content/uploads/2024/09/Superior-doble-4.jpg"], "Cabinas Las Palmeras": ["https://webbox.imgix.net/images/uvsiukahjteqyhcr/74f45606-e951-4059-8d89-0afde11a1fcb.jpg?auto=format,compress&w=1600", "https://webbox.imgix.net/images/uvsiukahjteqyhcr/2f9865ce-ed8a-449c-b14e-cca01bde7801.jpg?auto=format,compress&w=1600", "https://webbox.imgix.net/images/uvsiukahjteqyhcr/39fb88c6-7ada-47e1-8138-0a1a198fe967.jpg?auto=format,compress&w=1600"], "Rio Tico Safari Lodge": ["https://riotico.com/wp-content/uploads/2018/10/gallery-tents.jpg", "https://riotico.com/wp-content/uploads/2016/10/02-Interior-of-a-Safari-Tent.jpg", "https://riotico.com/wp-content/uploads/2018/10/gallery-terras.jpg"], "Catarata Ecolodge": ["https://storage.googleapis.com/gpt-engineer-file-uploads/jBp0XFE1OfR5B6ohu0vL40OqeUK2/social-images/social-1771833610107-aerialcel.webp"]}
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
json.dump(res,open(O+'/check.json','w'),indent=0)
