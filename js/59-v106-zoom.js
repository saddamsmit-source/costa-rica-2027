/* =====================================================================
   v10.6.1 · Zoomen alleen op de kaart
   - De pagina zelf is niet meer te zoomen (viewport, touch-action, gesturestart).
   - De kaart zoomt en pant zelf: twee vingers knijpen, één vinger slepen (als ingezoomd), muiswiel, en +/− knoppen.
   - Werkt door het viewBox van de kaart-SVG te wijzigen; elke hertekening van de kaart (bijvoorbeeld door live volgen)
     krijgt dezelfde uitsnede terug, zolang het hetzelfde kaartbeeld is.
   ===================================================================== */
const Z106={vb:null,base:null,moved:false,ptr:new Map(),last:null,min:1/6};
const z106Svg=()=>document.querySelector('.ds-mapbox svg.v51-svg');
function z106Set(svg,v){const b=svg._b;let w=Math.min(b[2],Math.max(b[2]*Z106.min,v[2])),h=w*b[3]/b[2],x=Math.min(b[0]+b[2]-w,Math.max(b[0],v[0])),y=Math.min(b[1]+b[3]-h,Math.max(b[1],v[1]));
  const nv=[x,y,w,h];svg.setAttribute('viewBox',nv.map(n=>n.toFixed(2)).join(' '));Z106.vb=nv;Z106.base=b;svg.classList.toggle('zoomed',w<b[2]-.5);
  document.querySelectorAll('.v106-zoom [data-z="out"]').forEach(x=>x.disabled=w>=b[2]-.5);document.querySelectorAll('.v106-zoom [data-z="in"]').forEach(x=>x.disabled=w<=b[2]*Z106.min+.01)}
function z106Pt(svg,cx,cy){const m=svg.getScreenCTM();if(!m)return null;const p=svg.createSVGPoint();p.x=cx;p.y=cy;const q=p.matrixTransform(m.inverse());return [q.x,q.y]}
function z106At(svg,factor,cx,cy){const v=(svg.getAttribute('viewBox')||'').split(/\s+/).map(Number),c=z106Pt(svg,cx,cy);if(!c)return;
  const nw=v[2]/factor,k=nw/v[2];z106Set(svg,[c[0]-(c[0]-v[0])*k,c[1]-(c[1]-v[1])*k,nw,v[3]*k])}
function z106Center(factor){const svg=z106Svg();if(!svg||!svg._b)return;const r=svg.getBoundingClientRect();z106At(svg,factor,r.left+r.width/2,r.top+r.height/2)}
function z106Init(){const svg=z106Svg();if(!svg){Z106.vb=null;return}if(svg.dataset.zi)return;svg.dataset.zi='1';
  const b=svg.getAttribute('viewBox').split(/\s+/).map(Number);svg._b=b;
  const box=svg.closest('.ds-mapbox');if(box&&!box.querySelector('.v106-zoom'))box.insertAdjacentHTML('beforeend','<div class="v106-zoom"><button type="button" data-z="in" aria-label="Inzoomen">+</button><button type="button" data-z="out" aria-label="Uitzoomen">−</button></div>');
  if(Z106.vb&&Z106.base&&Z106.base.join()===b.join())z106Set(svg,Z106.vb);else{Z106.vb=null;Z106.base=b;z106Set(svg,b)}}
let z106Raf=0;new MutationObserver(()=>{if(z106Raf)return;z106Raf=1;queueMicrotask(()=>{z106Raf=0;z106Init()})}).observe(document.body,{childList:true,subtree:true});z106Init();

/* ---------- gebaren ---------- */
const z106Dist=()=>{const [a,b]=[...Z106.ptr.values()];return Math.hypot(a.x-b.x,a.y-b.y)},z106Mid=()=>{const [a,b]=[...Z106.ptr.values()];return [(a.x+b.x)/2,(a.y+b.y)/2]};
document.addEventListener('pointerdown',e=>{const svg=e.target.closest&&e.target.closest('.ds-mapbox svg.v51-svg');if(!svg||!svg._b)return;Z106.ptr.set(e.pointerId,{x:e.clientX,y:e.clientY,x0:e.clientX,y0:e.clientY});Z106.moved=false;if(Z106.ptr.size===2){Z106.last={d:z106Dist(),m:z106Mid()}}},true);
document.addEventListener('pointermove',e=>{const p=Z106.ptr.get(e.pointerId);if(!p)return;const svg=z106Svg();if(!svg||!svg._b){Z106.ptr.clear();return}
  const dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;
  if(Math.hypot(p.x-p.x0,p.y-p.y0)>6)Z106.moved=true;
  if(Z106.ptr.size===2&&Z106.last){const d=z106Dist(),m=z106Mid(),f=d/Z106.last.d;Z106.moved=true;
    const r=svg.getBoundingClientRect(),v=Z106.vb||svg._b,k=v[2]/r.width;z106At(svg,f,m[0],m[1]);
    const v2=Z106.vb;z106Set(svg,[v2[0]-(m[0]-Z106.last.m[0])*k/f,v2[1]-(m[1]-Z106.last.m[1])*k/f,v2[2],v2[3]]);Z106.last={d,m};return}
  if(Z106.ptr.size===1&&Z106.vb&&Z106.vb[2]<svg._b[2]-.5&&Z106.moved){const r=svg.getBoundingClientRect(),k=Z106.vb[2]/r.width;z106Set(svg,[Z106.vb[0]-dx*k,Z106.vb[1]-dy*k,Z106.vb[2],Z106.vb[3]])}},true);
const z106Up=e=>{Z106.ptr.delete(e.pointerId);if(Z106.ptr.size<2)Z106.last=null};
document.addEventListener('pointerup',z106Up,true);document.addEventListener('pointercancel',z106Up,true);
/* na slepen of knijpen geen "tik" op een marker */
addEventListener('click',e=>{if(Z106.moved&&e.target.closest&&e.target.closest('.ds-mapbox svg')){e.stopPropagation();e.preventDefault()}Z106.moved=false;
  const b=e.target.closest&&e.target.closest('.v106-zoom [data-z]');if(b){e.preventDefault();e.stopPropagation();z106Center(b.dataset.z==='in'?1.6:1/1.6)}},true);
document.addEventListener('wheel',e=>{const svg=e.target.closest&&e.target.closest('.ds-mapbox svg.v51-svg');if(!svg||!svg._b)return;e.preventDefault();z106At(svg,e.deltaY<0?1.2:1/1.2,e.clientX,e.clientY)},{passive:false});
/* de pagina zelf niet laten zoomen (iOS kent het viewport-verbod niet altijd) */
['gesturestart','gesturechange','gestureend'].forEach(n=>document.addEventListener(n,e=>e.preventDefault(),{passive:false}));
