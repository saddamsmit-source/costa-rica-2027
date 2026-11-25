import {execFileSync} from 'node:child_process';
import {mkdir, readFile, stat, writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';

const root = resolve(process.argv[2] || '.');
const sourceBase = '40419aeb0e98a17a14f49606f1dd2dd427204d13';
const git = (...arguments_) => execFileSync('git',['-C',root,...arguments_],{encoding:'utf8'}).trim();
if (git('rev-parse','HEAD') !== sourceBase || git('status','--porcelain')) {
  throw Error('Gebruik een schone eigen Sites-werkbranch op ' + sourceBase + '.');
}

const changes = {
  'dist/app.js': [
    ["import {openDayFilm} from './day-film.js';",
      "import {openDayFilm} from './day-film.js';\nimport {openPhotoBook} from './photo-book.js';"],
    ['function requestedTravelDay(date) {',
      "document.addEventListener('click', event => {\n" +
      "  const button = event.target.closest('[data-photo-book]');\n" +
      "  if (!button) return;\n" +
      "  const trip = trips().find(item => item.id === button.dataset.photoBook);\n" +
      "  if (trip) openPhotoBook({dialog, modal, trip, media:state.media,\n" +
      "    days:trip.id === COSTA.id ? data.days : []});\n" +
      "});\n" +
      'function requestedTravelDay(date) {'],
  ],
  'dist/trip-story.js': [
    ['<button class="text-link" data-story-settings="' + '$' + '{esc(t.id)}">Reisinstellingen</button>',
     '<button class="text-link" data-photo-book="' + '$' + '{esc(t.id)}">Fotoboek</button>' +
     '<button class="text-link" data-story-settings="' + '$' + '{esc(t.id)}">Reisinstellingen</button>'],
  ],
  'dist/sw.js': [
    ['personal-atlas-day-film-1','personal-atlas-photo-book-1'],
    ["'day-film-core.js',","'day-film-core.js','photo-book.js','photo-book-core.js',"],
  ],
};

const output = new Map();
for (const [name, edits] of Object.entries(changes)) {
  const target = resolve(root,name);
  let source = await readFile(target,'utf8');
  for (const [oldText,newText] of edits) {
    const match = source.indexOf(oldText);
    if (match < 0 || source.indexOf(oldText,match + oldText.length) >= 0) {
      throw Error('Geen unieke integratieplek in ' + name);
    }
    source = source.replace(oldText,() => newText);
  }
  output.set(target,source);
}

for (const [source,destination] of [
  ['photo-book-core.js','dist/photo-book-core.js'],
  ['photo-book.js','dist/photo-book.js'],
  ['photo-book.test.mjs','tests/photo-book.mjs'],
]) {
  const target = resolve(root,destination);
  try {
    await stat(target);
    throw Error('Doelbestand bestaat al: ' + destination);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  output.set(target,await readFile(new URL(source,import.meta.url),'utf8'));
}
await mkdir(resolve(root,'tests'),{recursive:true});
for (const [destination,source] of output) await writeFile(destination,source,'utf8');
console.log('Fotoboek toegepast. Inspecteer git diff en voer de bron-, browser- en PDF-tests uit.');
