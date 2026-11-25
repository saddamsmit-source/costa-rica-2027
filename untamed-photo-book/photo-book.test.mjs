import assert from 'node:assert/strict';
import {bookPage, bookSlots, fitPhoto, makeInterior, makeOriginalZip, planPhotoBook, splitOriginals} from '../dist/photo-book-core.js';

const trip = {id:'cr',name:'Costa Rica (2027)'};
const make = (id,date,extra={}) => ({id,date,kind:'photo',title:'../Café.jpg',mime:'image/jpeg',tripId:trip.id,mediaKey:id,size:3,...extra});
const day1 = '2027-02-18', day2 = '2027-02-19';
const items = [
  make('b',day2), make('a1',day1), make('a2',day1), make('a3',day1), make('a4',day1),
  make('clip',day1,{kind:'clip',mime:'video/mp4'}), make('other',day1,{tripId:'different'}),
  make('invalid','2027-02-30'), make('invalid-mime',day1,{mime:'text/plain'}),
];
const plan = planPhotoBook(items,trip.id,[{date:day1,id:11,place:'Monteverde'}]);
assert.deepEqual(plan.photos.map(entry=>entry.record.id),['a1','a2','a3','a4','b']);
assert.deepEqual(plan.pages.map(page=>[page.date,page.photos.length]),[[day1,3],[day1,1],[day2,1]]);
assert.deepEqual(plan.photos.map(entry=>entry.file),[
  'fotos/2027-02-18/0001-Cafe.jpg','fotos/2027-02-18/0002-Cafe.jpg',
  'fotos/2027-02-18/0003-Cafe.jpg','fotos/2027-02-18/0004-Cafe.jpg','fotos/2027-02-19/0001-Cafe.jpg',
]);
assert.deepEqual(splitOriginals(plan.photos,6).map(part=>part.length),[2,2,1]);
assert.equal(plan.days,2);
for (const count of [1,2,3]) {
  const slots = bookSlots(count);
  assert.equal(slots.length,count);
  for (const slot of slots) {
    assert(slot.x>=0 && slot.y>=0 && slot.x+slot.width<=bookPage.width && slot.y+slot.height<=bookPage.height);
    const box = fitPhoto(slot,2400,1000);
    assert(Math.abs(box.width/box.height - 2.4) < .001);
  }
}

const signal = new AbortController().signal;
const original = new Blob([Uint8Array.of(255,216,217)],{type:'image/jpeg'});
const read = async key => key === 'missing' ? undefined : {blob:original};
const zipInputs = await makeOriginalZip(plan.photos,{read,signal,pack: async prepared => prepared});
assert.equal(zipInputs.length,5);
assert(zipInputs.every(input=>input.blob === original));
await assert.rejects(makeOriginalZip([{file:'safe.jpg',record:make('missing',day1)}],{read,signal,pack:async()=>{assert.fail('Missing photo reached ZIP writer');}}),/ontbreekt/);
await assert.rejects(makeOriginalZip([],{read,signal,pack:async()=>{}}),/geen foto/);

const jpeg = async (_blob,slot) => ({width:2400,height:1000,box:fitPhoto(slot,2400,1000),bytes:Uint8Array.of(255,216,217)});
const {pdf} = await makeInterior(plan,trip,{read,signal,toJpeg:jpeg});
const raw = String.fromCharCode(...new Uint8Array(await pdf.arrayBuffer()));
assert.equal(pdf.type,'application/pdf');
assert.match(raw,/\/Count 3\b/);
assert.match(raw,/\/MediaBox \[0 0 841\.89 595\.276\]/);
assert.match(raw,/Monteverde/);
assert.match(raw,/Costa Rica \\\(2027\\\)/);
const start = Number(/startxref\n(\d+)\n%%EOF/.exec(raw)[1]);
assert.equal(raw.slice(start,start+4),'xref');
const xrefs = raw.slice(start).split('\n');
for(let index=3; index<xrefs.length && /^\d{10}/.test(xrefs[index]); index++) {
  const offset=Number(xrefs[index].slice(0,10));
  assert(raw.slice(offset).startsWith((index-2) + ' 0 obj'));
}
assert.equal((raw.match(/\/Subtype \/Image/g)||[]).length,5);
await assert.rejects(makeInterior({pages:[]},trip,{read,signal,toJpeg:jpeg}),/geen fotopagina/);
console.log('PASS: photo-only sorting, safe ZIP paths, exact original bytes, A4 geometry and PDF object offsets.');
