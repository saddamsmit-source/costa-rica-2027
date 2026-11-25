import {getClip} from './media-db.js';
import {pack} from './media-archive.js';
import {fitPhoto, makeInterior, makeOriginalZip, planPhotoBook, splitOriginals} from './photo-book-core.js';

async function sizedJpeg(blob,slot) {
  const image = await createImageBitmap(blob);
  try {
    const box = fitPhoto(slot,image.width,image.height);
    const downscale = Math.min(1,300/box.dpi);
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1,Math.round(image.width*downscale));
    canvas.height = Math.max(1,Math.round(image.height*downscale));
    const context = canvas.getContext('2d',{alpha:false});
    if (!context) throw Error('Fotoweergave ontbreekt.');
    context.fillStyle = '#fff';
    context.fillRect(0,0,canvas.width,canvas.height);
    context.drawImage(image,0,0,canvas.width,canvas.height);
    const jpeg = await new Promise(resolve => canvas.toBlob(resolve,'image/jpeg',.92));
    if (!jpeg?.size || jpeg.type !== 'image/jpeg') throw Error('JPEG maken is mislukt.');
    return {width:canvas.width,height:canvas.height,box,bytes:new Uint8Array(await jpeg.arrayBuffer())};
  } finally {
    image.close();
  }
}

export function openPhotoBook({dialog,modal,trip,media,days}) {
  const plan = planPhotoBook(media,trip.id,days);
  if (!plan.photos.length) {
    modal('Fotoboek', '<p>Voeg foto’s toe bij deze reis om een fotoboek te maken.</p>' +
      '<button class="btn primary" data-archive-upload="' + encodeId(trip.id) + '">Foto’s toevoegen</button>');
    return;
  }
  const parts = splitOriginals(plan.photos);
  const counts = plan.photos.length + (plan.photos.length === 1 ? ' foto' : ' foto’s') +
    ' · ' + plan.days + (plan.days === 1 ? ' reisdag' : ' reisdagen') + ' · ' + plan.pages.length +
    (plan.pages.length === 1 ? ' pagina' : ' pagina’s');
  modal('Fotoboek',
    '<section class="photo-book"><p>' + counts + '</p><h3>Binnenwerk</h3>' +
    '<p>A4 liggend, met vaste marges en één tot drie foto’s per pagina.</p>' +
    '<div class="actions"><button class="btn primary" data-book-pdf>Maak proef-PDF</button></div>' +
    '<h3>Originele foto’s</h3><p>ZIP met een map per datum. De foto’s behouden hun oorspronkelijke kwaliteit en bestandsgegevens.</p>' +
    '<div class="actions">' +
    parts.map((_,index) => '<button class="btn" data-book-zip="' + index + '">' +
      (parts.length === 1 ? 'Maak foto-ZIP' : 'Maak ZIP-deel ' + (index+1)) + '</button>').join('') +
    '</div><p class="info">Kies het omslag en de aanleverspecificaties zodra je een drukker hebt gekozen.</p>' +
    '<p role="status" data-book-status></p><progress aria-label="Fotoboek maken" value="0" max="100" hidden></progress>' +
    '<div class="actions"><a class="btn primary" data-book-download hidden>Download</a>' +
    '<a class="btn" data-book-preview target="_blank" rel="noopener" hidden>Open PDF</a>' +
    '<button class="btn" data-book-stop hidden>Stoppen</button></div></section>');

  const panel = dialog.querySelector('.photo-book');
  const status = panel.querySelector('[data-book-status]');
  const download = panel.querySelector('[data-book-download]');
  const preview = panel.querySelector('[data-book-preview]');
  const progress = panel.querySelector('progress');
  const stop = panel.querySelector('[data-book-stop]');
  const controls = panel.querySelectorAll('[data-book-pdf],[data-book-zip]');
  const folder = 'untamed-fotoboek-' + trip.name.normalize('NFKD').replace(/[\u0300-\u036f]/g,'')
    .replace(/[^A-Za-z0-9]+/g,'-').replace(/^-+|-+$/g,'').toLowerCase().slice(0,55);
  let controller;
  let url;

  function clearDownload() {
    download.hidden = preview.hidden = true;
    download.removeAttribute('href');
    preview.removeAttribute('href');
    if (url) URL.revokeObjectURL(url);
    url = undefined;
  }
  function dispose() {
    controller?.abort();
    clearDownload();
    observer.disconnect();
    dialog.removeEventListener('close',dispose);
  }
  const observer = new MutationObserver(() => { if (!panel.isConnected) dispose(); });
  observer.observe(dialog,{subtree:true,childList:true});
  dialog.addEventListener('close',dispose,{once:true});
  stop.addEventListener('click',() => controller?.abort());
  panel.addEventListener('click',async event => {
    const button = event.target.closest('[data-book-pdf],[data-book-zip]');
    if (!button || controller) return;
    clearDownload();
    controller = new AbortController();
    const signal = controller.signal;
    const isPdf = button.hasAttribute('data-book-pdf');
    const index = Number(button.dataset.bookZip);
    for (const item of controls) item.disabled = true;
    stop.hidden = false;
    progress.hidden = false;
    progress.value = 0;
    status.textContent = isPdf ? 'Binnenwerk maken…' : 'Originele foto’s verpakken…';
    try {
      let file, name, lowResolution = 0;
      if (isPdf) {
        const result = await makeInterior(plan,trip,{read:getClip,toJpeg:sizedJpeg,signal,
          onProgress:(done,total) => { progress.value = done/total * 100; }});
        file = result.pdf;
        lowResolution = result.lowResolution;
        name = folder + '-binnenwerk-a4.pdf';
      } else {
        file = await makeOriginalZip(parts[index],{read:getClip,pack,signal});
        name = folder + '-fotos' + (parts.length === 1 ? '' : '-deel-' + (index+1)) + '.zip';
      }
      signal.throwIfAborted();
      url = URL.createObjectURL(file);
      download.href = url;
      download.download = name;
      download.textContent = isPdf ? 'Download proef-PDF' : 'Download foto-ZIP';
      download.hidden = false;
      if (isPdf) {
        preview.href = url;
        preview.hidden = false;
      }
      status.textContent = lowResolution ? 'Klaar. Controleer de scherpte van ' + lowResolution +
        (lowResolution === 1 ? ' foto' : ' foto’s') + ' op papier.' : 'Je bestand is klaar.';
      download.focus();
    } catch (error) {
      if (panel.isConnected) status.textContent = signal.aborted ? 'Gestopt. Je kunt opnieuw beginnen.' : error.message;
    } finally {
      controller = undefined;
      stop.hidden = progress.hidden = true;
      for (const item of controls) item.disabled = false;
    }
  });
}

function encodeId(id) {
  return String(id).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
