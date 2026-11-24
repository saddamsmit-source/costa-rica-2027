import assert from 'node:assert/strict';
import fs from 'node:fs';

const callbacks = new Map();
const listeners = new Map();
const hostClasses = new Set();
let sequence = 0;
let draws = 0;
let fetches = 0;
const context = {
  clearRect() { draws++; },
  save() {}, restore() {}, translate() {}, rotate() {},
  beginPath() {}, ellipse() {}, stroke() {}, arc() {}, fill() {},
  lineTo() {}, moveTo() {},
  createRadialGradient() { return {addColorStop() {}}; }
};
const host = {append() {}, classList: {add(name) {hostClasses.add(name);}}};
globalThis.document = {
  hidden: false,
  documentElement: {dataset: {motion: 'reduced'}},
  querySelectorAll() { return [host]; },
  createElement() {
    return {setAttribute() {}, getContext() {return context;}};
  },
  addEventListener(name, callback) { listeners.set(name, callback); }
};
globalThis.requestAnimationFrame = callback => {
  const id = ++sequence;
  callbacks.set(id, callback);
  return id;
};
globalThis.cancelAnimationFrame = id => callbacks.delete(id);
globalThis.fetch = async () => {
  fetches++;
  return {ok: true, json: async () => JSON.parse(fs.readFileSync('dist/brand/world-land.geojson'))};
};
const {mountWorldLogos, worldFacetsMarkup, journeyKeepsakeMarkup} = await import('../dist/wanderlust.js');
mountWorldLogos();
await new Promise(resolve => setImmediate(resolve));
assert(hostClasses.has('world-logo-ready'));
assert(draws > 0);
assert.equal(callbacks.size, 0, 'reduced motion renders a still globe');

document.documentElement.dataset.motion = 'full';
listeners.get('untamed:motionchange')();
assert.equal(callbacks.size, 1);
for (const time of [50, 8051]) {
  const [id, callback] = callbacks.entries().next().value;
  callbacks.delete(id);
  callback(time);
}
assert.equal(callbacks.size, 0, 'welcoming turn ends after eight seconds');
listeners.get('untamed:motionchange')();
document.hidden = true;
listeners.get('visibilitychange')();
assert.equal(callbacks.size, 0, 'hidden document stops frames');

const {getLand} = await import('../dist/globe.js');
await getLand();
assert.equal(fetches, 1, 'logo and atlas share one geography request');
const markup = worldFacetsMarkup();
for (const [, asset] of markup.matchAll(/src="([^"]+)"/g)) assert(fs.existsSync('dist/' + asset));
assert.equal((markup.match(/class="world-facet world-facet-/g) || []).length, 4);
assert(journeyKeepsakeMarkup().includes('aria-hidden="true"'));
const worker = fs.readFileSync('dist/sw.js', 'utf8');
assert(worker.includes("'wanderlust.css','wanderlust.js'"));
console.log('PASS: spherical logo, shared geography, finite animation, reduced motion, hidden-page pause, image references and offline shell entries.');
