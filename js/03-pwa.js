if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) { window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(console.warn)); }
// v4.5: voeg geverifieerde dagcontext toe aan het kaartscherm.
const v45PriorDayContent=dayContent;
dayContent=function(d){const html=v45PriorDayContent(d);return daySection==='map'?html+v45TripInfo(d):html};
// Vaste, thematische fotografische thumbnails (online), met lokale SVG-fallback voor offline.
const V45_PHOTO_LIBRARY={
forest:'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=240&q=78&fit=crop',
waterfall:'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=240&q=78&fit=crop',
coast:'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=240&q=78&fit=crop',
mountain:'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=240&q=78&fit=crop',
water:'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=240&q=78&fit=crop',
trail:'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=240&q=78&fit=crop'};
function v45ActivityPhoto(title){const t=title.toLowerCase();if(/waterval|waterfall|catarata/.test(t))return V45_PHOTO_LIBRARY.waterfall;if(/strand|beach|snorkel|walvis|whale|isla del caño|boot|cano|kano|sierpe/.test(t))return V45_PHOTO_LIBRARY.coast;if(/vulkaan|arenal|rincon|rincón|berg|quetzal|dota/.test(t))return V45_PHOTO_LIBRARY.mountain;if(/warmwater|hotspring|hot spring|tabacón|rivier/.test(t))return V45_PHOTO_LIBRARY.water;if(/wandeling|trail|hike|walking/.test(t))return V45_PHOTO_LIBRARY.trail;return V45_PHOTO_LIBRARY.forest}
const v45PreviousVisualActivity=visualActivity;
visualActivity=function(a){const markup=v45PreviousVisualActivity(a),fallback=(V44_ACTIVITY_ART[a.title]||'photos/hero-home.jpg');return markup.replace(/<img class="act-thumb"[^>]*>/,`<img class="act-thumb" src="${v45ActivityPhoto(a.title)}" data-fallback="${fallback}" onerror="this.onerror=null;this.src='./${fallback}'" alt="Thematische foto bij ${esc(a.title)}" loading="lazy">`).replace(/<small class="v44-art-label">Activiteitillustratie<\/small>/g,'')};
