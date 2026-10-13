/* =====================================================================
   v7.6 · Nederlandse namen: soorten waarvan de Nederlandse naam gelijk is
   aan de Engelse (gecontroleerd), en soorten zonder gangbare Nederlandse
   naam (Engelse naam getoond, met uitleg in het soortvenster).
   ===================================================================== */
/* Nederlandse naam is hetzelfde woord (Van Dale / Avibase: willet) */
const V76_NL_SAME=new Set(['Ocelot','Tayra','Jaguar','Margay','Jaguarundi','Coyote','Willet','Boa constrictor']);
/* geen gangbare Nederlandse naam gevonden */
const V76_NO_NL=new Set(['Black river turtle','Green parrot snake','Rufous-eyed brook frog','Dormilona','White-headed snake','Western red bat','Pacific chupare whipray']);
{const prev=wl2SheetHtml;wl2SheetHtml=function(name,region){const h=prev(name,region);
  return V76_NO_NL.has(name)?h.replace('<p class="wl2-names">','<p class="wl2-names"><span class="v76-nonl">Geen gangbare Nederlandse naam; Engelse naam getoond</span>'):h}}
