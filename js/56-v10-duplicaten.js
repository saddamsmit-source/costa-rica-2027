/* =====================================================================
   v10 · Duplicaatdetectie (alleen melden, nooit verwijderen)
   - Per foto een beeldvingerafdruk (dHash, 64 bits op 9×8 grijswaarden), op de achtergrond berekend en bewaard (veld dh).
   - Twee foto's van dezelfde dag en soort (sfeer, verblijf of hetzelfde dier) met ≤ 6 van 64 verschillende bits
     = "lijken sterk op elkaar" (burst-opnames). Drempel bewust streng: liever een gemiste dan een onterechte melding.
   - Reisvideo: per groep standaard alleen de beste sfeer-/verblijffoto (ster > geen kwaliteitslabel > scherpste);
     "Toch allemaal in de video" in de Video Studio zet dat per groep uit (state.v10DupAll[sleutel]).
   ===================================================================== */
const V10_DH_MAX=6;
function v10DHash(src){try{const c=document.createElement('canvas');c.width=9;c.height=8;const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(src,0,0,9,8);const d=x.getImageData(0,0,9,8).data;
  let hi=0,lo=0;for(let y=0;y<8;y++)for(let i=0;i<8;i++){const a=(y*9+i)*4,b=a+4,g1=.299*d[a]+.587*d[a+1]+.114*d[a+2],g2=.299*d[b]+.587*d[b+1]+.114*d[b+2],bit=g1<g2?1:0,k=y*8+i;
    if(k<32)hi=(hi|(bit<<k))>>>0;else lo=(lo|(bit<<(k-32)))>>>0}
  return hi.toString(16).padStart(8,'0')+lo.toString(16).padStart(8,'0')}catch(e){return ''}}
const v10Pop=n=>{n=n-((n>>>1)&0x55555555);n=(n&0x33333333)+((n>>>2)&0x33333333);return (((n+(n>>>4))&0x0F0F0F0F)*0x01010101)>>>24};
function v10Ham(a,b){if(!a||!b||a.length!==16||b.length!==16)return 99;return v10Pop((parseInt(a.slice(0,8),16)^parseInt(b.slice(0,8),16))>>>0)+v10Pop((parseInt(a.slice(8),16)^parseInt(b.slice(8),16))>>>0)}
/* vingerafdrukken aanvullen op de achtergrond (na laden en na toevoegen) */
let v10DhBusy=false;
async function v10DhFill(){if(v10DhBusy)return;v10DhBusy=true;try{for(const p of [...V84.list,...V84.moods,...V84.stays].filter(p=>p.dh==null&&p.blob)){
    try{const b=await createImageBitmap(p.blob,{resizeWidth:64,resizeQuality:'medium'}).catch(()=>createImageBitmap(p.blob));const dh=v10DHash(b);b.close&&b.close();p.dh=dh;await v84Write(st=>st.put({...p,dh}))}catch(e){p.dh=''}
    await new Promise(r=>setTimeout(r,0))}}finally{v10DhBusy=false}}
{const prev=v84Load;v84Load=async function(){const r=await prev();setTimeout(v10DhFill,1500);return r}}
const v10Best=list=>[...list].sort((a,b)=>(!!b.favUser-!!a.favUser)||(v84Qual(a).length-v84Qual(b).length)||((b.sharp||0)-(a.sharp||0))||(a.taken||a.t||'').localeCompare(b.taken||b.t||''))[0];
/* groepen bijna-gelijke foto's binnen dezelfde dag en hetzelfde onderwerp */
function v10DupGroups(){const buckets={};[...V84.list,...V84.moods,...V84.stays].forEach(p=>{if(!p.dh)return;const k=`${p.day}|${p.kind||'photo'}|${p.kind==='photo'||!p.kind?p.sp:''}`;(buckets[k]??=[]).push(p)});
  const out=[];for(const list of Object.values(buckets)){if(list.length<2)continue;const parent=list.map((_,i)=>i),find=i=>parent[i]===i?i:(parent[i]=find(parent[i]));
    for(let i=0;i<list.length;i++)for(let j=i+1;j<list.length;j++)if(v10Ham(list[i].dh,list[j].dh)<=V10_DH_MAX)parent[find(i)]=find(j);
    const g={};list.forEach((p,i)=>(g[find(i)]??=[]).push(p));
    Object.values(g).filter(x=>x.length>1).forEach(items=>{const best=v10Best(items),key=items.map(p=>p.id).sort()[0];out.push({key,items,best,all:!!(state.v10DupAll||{})[key],kind:items[0].kind||'photo'})})}
  return out.sort((a,b)=>a.items[0].day-b.items[0].day)}
/* reisvideo: van een groep sfeer-/verblijffoto's standaard alleen de beste (dieren krijgen al 1 foto per dag) */
function v10DupHidden(){const h=new Set();v10DupGroups().forEach(g=>{if(g.all||g.kind==='photo')return;g.items.forEach(p=>{if(p.id!==g.best.id)h.add(p.id)})});return h}
{const prev=v85Plan;v85Plan=function(){const hid=v10DupHidden();if(!hid.size)return prev();const m=V84.moods,s=V84.stays;V84.moods=m.filter(p=>!hid.has(p.id));V84.stays=s.filter(p=>!hid.has(p.id));
  try{return prev()}finally{V84.moods=m;V84.stays=s}}}
/* ook na het eerste laden van de app (dat gebeurt vóór dit bestand) */
setTimeout(v10DhFill,2500);
