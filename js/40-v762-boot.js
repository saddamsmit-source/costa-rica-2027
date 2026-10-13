/* =====================================================================
   v7.6.2 · Bootroute Sierpe ↔ Corcovado-lodge
   Sawadee: per boot vanaf Sierpe naar de lodge. De gestippelde lijn volgt nu de
   Río Sierpe naar zee en daarna de kust langs Drake naar Playa Rincón.
   Rivier: OpenStreetMap (Río Sierpe, way 136924994 + 622457177, vereenvoudigd);
   zeedeel: punten 0,3–1,5 km uit de kust (OSM-kustlijn), gecontroleerd tegen de kaartomtrek.
   De stop Corcovado-lodge staat nu op de lodge zelf (Cabinas Las Palmeras, zie v7.4).
   ===================================================================== */
V51_PT['Corcovado']=[8.65726,-83.71165,'Corcovado-lodge'];
const V762_BOAT=[[8.861, -83.471], [8.85781, -83.47432], [8.8676, -83.47429], [8.87071, -83.477], [8.87144, -83.4834], [8.86449, -83.49126], [8.86162, -83.4865], [8.85723, -83.48598], [8.85784, -83.48967], [8.85522, -83.49358], [8.85809, -83.49824], [8.85778, -83.50772], [8.84884, -83.51263], [8.84874, -83.51916], [8.84121, -83.53206], [8.82773, -83.53273], [8.82468, -83.53662], [8.81782, -83.535], [8.81451, -83.53694], [8.81155, -83.56303], [8.80134, -83.55725], [8.79625, -83.55772], [8.79384, -83.56115], [8.7933, -83.56672], [8.80083, -83.56901], [8.80546, -83.57407], [8.79837, -83.58027], [8.79742, -83.58489], [8.80081, -83.61141], [8.79971, -83.61591], [8.78829, -83.61857], [8.78033, -83.62531], [8.77714, -83.63702], [8.772, -83.652], [8.745, -83.656], [8.715, -83.658], [8.7, -83.668], [8.693, -83.7], [8.69, -83.718], [8.676, -83.727], [8.662, -83.724], [8.65726, -83.71165]];
function v762LegPts(i){const[a,b]=V51_LEGS[i],P=n=>v51XY(V51_PT[n][0],V51_PT[n][1]);
  const path=V762_BOAT.map(([la,lo])=>v51XY(la,lo));
  if(a==='Sierpe'&&b==='Corcovado')return path;if(a==='Corcovado'&&b==='Sierpe')return path.slice().reverse();return [P(a),P(b)]}
/* tekenen: rechte bootlijn vervangen door de route */
{const prev=dsMapSvg;dsMapSvg=function(fd,zoom){let h=prev(fd,zoom);const f=v=>v.toFixed(1),P=n=>v51XY(V51_PT[n][0],V51_PT[n][1]);
  const line=(a,b)=>{const[x1,y1]=P(a),[x2,y2]=P(b);return `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" class="dsm-boat" vector-effect="non-scaling-stroke"/>`};
  const poly=`<polyline points="${V762_BOAT.map(([la,lo])=>v51XY(la,lo).map(f).join(',')).join(' ')}" class="dsm-boat v762-boat" fill="none" vector-effect="non-scaling-stroke"/>`;
  return h.replace(line('Sierpe','Corcovado'),poly).replace(line('Corcovado','Sierpe'),'')}}
/* reistijdlabel op het midden van de echte route */
v74TimePos=function(o,fr){const pts=o.legs.flatMap((i,k)=>{const p=v762LegPts(i);return k?p.slice(1):p});
  const len=[];let tot=0;for(let i=1;i<pts.length;i++){const d=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);len.push(d);tot+=d}
  let at=tot*fr;for(let i=0;i<len.length;i++){if(at<=len[i]){const[p,q]=[pts[i],pts[i+1]],t=len[i]?at/len[i]:0;return [p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t,tot]}at-=len[i]}
  return [...pts[pts.length-1],tot]};
/* dagkaart Corcovado (dag 16–18): hele bootroute vanaf Sierpe in beeld */
{const prev=dsdBox;dsdBox=function(fd){const b=prev(fd);if(V51_STOPS[v51Day2Stop(fd)][0]!=='Corcovado')return b;const M=V51_MAP;
  const pts=V762_BOAT.map(([la,lo])=>v51XY(la,lo));let x0=b[0],y0=b[1],x1=b[0]+b[2],y1=b[1]+b[3];const m=Math.max(b[2],b[3])*.08;
  pts.forEach(([x,y])=>{x0=Math.min(x0,x-m);y0=Math.min(y0,y-m);x1=Math.max(x1,x+m);y1=Math.max(y1,y+m)});
  const AR=b[2]/b[3];let w=x1-x0,h=y1-y0;if(w/h<AR)w=h*AR;else h=w/AR;w=Math.min(w,M.W);h=Math.min(h,M.H);
  const cx=(x0+x1)/2,cy=(y0+y1)/2;return [Math.max(0,Math.min(M.W-w,cx-w/2)),Math.max(0,Math.min(M.H-h,cy-h/2)),w,h]}}
/* eerste scherm opnieuw opbouwen nu alle lagen (v7.4–v7.6.2) geladen zijn */
render();
