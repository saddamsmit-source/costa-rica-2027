const mimeExtensions = {
  'image/jpeg':'jpg', 'image/png':'png', 'image/webp':'webp',
  'image/avif':'avif', 'image/gif':'gif',
};
const photoKinds = new Set(['photo','mood','stay']);
const millimetersToPoints = value => value * 72 / 25.4;
export const bookPage = {width:millimetersToPoints(297), height:millimetersToPoints(210)};
const margin = 36;
const gap = 12;

function safeTitle(title) {
  return String(title || '').replace(/\.[^.]+$/,'').normalize('NFKD')
    .replace(/[\u0300-\u036f]/g,'').replace(/[^A-Za-z0-9_-]+/g,'-')
    .replace(/^-+|-+$/g,'').slice(0,80) || 'foto';
}

function validDate(date) {
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const value = new Date(date + 'T00:00:00Z');
  return Number.isFinite(value.getTime()) && value.toISOString().slice(0,10) === date;
}

export function planPhotoBook(media, tripId, itinerary = []) {
  const byDate = new Map();
  const dayByDate = new Map(itinerary.map(day => [day.date,day]));
  const selected = media.filter(item => item.tripId === tripId && photoKinds.has(item.kind) &&
    Object.hasOwn(mimeExtensions,item.mime) && validDate(item.date));
  selected.sort((a,b) => a.date.localeCompare(b.date));
  const pages = [];
  const photos = [];
  for (const record of selected) {
    if (!byDate.has(record.date)) {
      byDate.set(record.date,[]);
    }
    const records = byDate.get(record.date);
    const order = String(records.length + 1).padStart(4,'0');
    const entry = {
      record,
      file: 'fotos/' + record.date + '/' + order + '-' + safeTitle(record.title) + '.' + mimeExtensions[record.mime],
    };
    records.push(entry);
    photos.push(entry);
  }
  for (const [date, records] of byDate) {
    const day = dayByDate.get(date);
    for (let start = 0; start < records.length; start += 3) {
      pages.push({date, day:day?.id, place:day?.place || '', photos:records.slice(start,start+3)});
    }
  }
  return {photos,pages,days:byDate.size};
}

export function splitOriginals(entries, byteTarget = 80 * 1024 ** 2) {
  const parts = [];
  let size = 0;
  let current = [];
  for (const entry of entries) {
    if (current.length && size + entry.record.size > byteTarget) {
      parts.push(current);
      current = [];
      size = 0;
    }
    current.push(entry);
    size += entry.record.size;
  }
  if (current.length) parts.push(current);
  return parts;
}

async function readOriginal(record, read, signal) {
  signal.throwIfAborted();
  const original = (await read(record.mediaKey))?.blob;
  signal.throwIfAborted();
  if (!original?.size || original.size !== record.size) {
    throw Error('Fotobestand ontbreekt of is onvolledig: ' + record.title);
  }
  return original;
}

export async function makeOriginalZip(entries, {read, pack, signal}) {
  if (entries.length === 0) throw Error('Er zijn geen foto’s om te bewaren.');
  const items = [];
  for (const {record,file} of entries) {
    items.push({name:file, blob:await readOriginal(record, read, signal)});
  }
  const archive = await pack(items);
  signal.throwIfAborted();
  return archive;
}

export function bookSlots(count) {
  const width = bookPage.width - margin * 2;
  const height = bookPage.height - 148;
  const base = {x:margin,y:55,width,height};
  if (count === 1) return [base];
  const left = (width - gap) * (count === 2 ? .5 : .60);
  const right = width - left - gap;
  const second = {x:margin + left + gap,y:base.y,width:right,height};
  if (count === 2) return [{...base,width:left},second];
  const half = (height - gap) / 2;
  return [{...base,width:left},{...second,y:base.y+half+gap,height:half},{...second,height:half}];
}

export function fitPhoto(slot,width,height) {
  const scale = Math.min(slot.width / width, slot.height / height);
  const x = width * scale, y = height * scale;
  return {x:slot.x+(slot.width-x)/2, y:slot.y+(slot.height-y)/2, width:x, height:y, dpi:72/scale};
}

const formatNumber = n => n.toFixed(3).replace(/\.?0+$/,'');
const winAnsi = value => Array.from(String(value || '')).map(character => {
  const code = character.charCodeAt(0);
  if (code >= 160 && code <= 255) return '\\' + code.toString(8);
  if (code < 32 || code > 126) return ' ';
  return '()\\'.includes(character) ? '\\'+character : character;
}).join('');
const labelDate = new Intl.DateTimeFormat('nl-NL',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'});

export class InteriorPdf {
  #encoder = new TextEncoder();
  #chunks = [];
  #offsets = [0];
  #pages = [];
  #size = 0;
  #nextId = 5;

  constructor() {
    this.#append('%PDF-1.4\n');
    this.#append(Uint8Array.of(37,226,227,207,211,10));
    this.#object(1, '<< /Type /Catalog /Pages 2 0 R >>');
    this.#object(3, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
    this.#object(4, '<< /Type /Font /Subtype /Type1 /BaseFont /Times-Roman /Encoding /WinAnsiEncoding >>');
  }

  #append(data) {
    const bytes = typeof data === 'string' ? this.#encoder.encode(data) : data;
    this.#chunks.push(bytes);
    this.#size += bytes.length;
  }

  #object(id, dictionary, stream) {
    this.#offsets[id] = this.#size;
    this.#append(id + ' 0 obj\n' + dictionary + '\n');
    if (stream) {
      this.#append('stream\n');
      this.#append(stream);
      this.#append('\nendstream\n');
    }
    this.#append('endobj\n');
  }

  addPage({title, day, date, place}, images) {
    const {width,height} = bookPage;
    const pageId = this.#nextId++;
    const contentId = this.#nextId++;
    const imageRefs = [];
    const draw = ['0.98 0.95 0.90 rg 0 0 ' + formatNumber(width) + ' ' + formatNumber(height) + ' re f'];
    const printText = (text,x,y,font,size,color) => {
      draw.push('BT /' + font + ' ' + size + ' Tf ' + color + ' rg 1 0 0 1 ' +
        formatNumber(x) + ' ' + formatNumber(y) + ' Tm (' + winAnsi(text) + ') Tj ET');
    };
    const dateText = labelDate.format(new Date(date+'T00:00:00Z'));
    printText(title.slice(0,65),margin,height-34,'F1',11,'0.13 0.30 0.25');
    const pageTitle = (place || dateText).slice(0,65);
    const titleSize = Math.min(27,Math.floor((width - margin * 2) / Math.max(1,pageTitle.length)));
    printText(pageTitle,margin,height-71,'F2',titleSize,'0.07 0.23 0.18');
    printText(day ? 'Dag ' + day + '  /  ' + dateText : dateText,margin,36,'F1',10,'0.38 0.25 0.18');
    printText(String(this.#pages.length+1),width-margin-16,36,'F1',10,'0.38 0.25 0.18');

    for (const [index,image] of images.entries()) {
      const id = this.#nextId++;
      const resource = 'Im' + (index + 1);
      imageRefs.push('/' + resource + ' ' + id + ' 0 R');
      this.#object(id,'<< /Type /XObject /Subtype /Image /Width ' + image.width + ' /Height ' + image.height +
        ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + image.bytes.length + ' >>', image.bytes);
      const box = image.box;
      draw.push('q ' + [box.width,0,0,box.height,box.x,box.y].map(formatNumber).join(' ') + ' cm /' + resource + ' Do Q');
    }
    const commands = this.#encoder.encode(draw.join('\n') + '\n');
    this.#object(contentId,'<< /Length ' + commands.length + ' >>',commands);
    this.#object(pageId,'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + formatNumber(width) + ' ' + formatNumber(height) +
      '] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> /XObject << ' + imageRefs.join(' ') +
      ' >> >> /Contents ' + contentId + ' 0 R >>');
    this.#pages.push(pageId);
  }

  finish() {
    if (this.#pages.length === 0) throw Error('Er zijn geen fotopagina’s om te bewaren.');
    this.#object(2,'<< /Type /Pages /Count ' + this.#pages.length + ' /Kids [' +
      this.#pages.map(id => id+' 0 R').join(' ') + '] >>');
    const start = this.#size;
    this.#append('xref\n0 ' + this.#offsets.length + '\n0000000000 65535 f \n');
    this.#append(this.#offsets.slice(1).map(offset => String(offset).padStart(10,'0') + ' 00000 n \n').join(''));
    this.#append('trailer\n<< /Size ' + this.#offsets.length + ' /Root 1 0 R >>\nstartxref\n' + start + '\n%%EOF\n');
    return new Blob(this.#chunks,{type:'application/pdf'});
  }
}

export async function makeInterior(plan, trip, {read, toJpeg, signal, onProgress = () => {}}) {
  const pdf = new InteriorPdf();
  let lowResolution = 0;
  for (const [pageIndex,page] of plan.pages.entries()) {
    const slots = bookSlots(page.photos.length);
    const images = [];
    for (const [index,entry] of page.photos.entries()) {
      const original = await readOriginal(entry.record,read,signal);
      let image;
      try {
        image = await toJpeg(original,slots[index]);
      } catch {
        throw Error('Foto kan niet in het binnenwerk worden geplaatst: ' + entry.record.title);
      }
      signal.throwIfAborted();
      if (image.box.dpi < 200) lowResolution++;
      images.push(image);
    }
    pdf.addPage({title:trip.name,...page},images);
    onProgress(pageIndex+1,plan.pages.length);
  }
  return {pdf:pdf.finish(),lowResolution};
}
