import {getLand, projectPoint} from './globe.js';

// The small brand globe shares the atlas geography and spherical projection.
// Existing SVG marks stay visible if canvas or geography is unavailable.
export function mountWorldLogos() {
  const logos = [...document.querySelectorAll('.brand-jewel')].map(host => {
    const canvas = document.createElement('canvas');
    canvas.className = 'world-logo';
    canvas.width = 192;
    canvas.height = 192;
    canvas.setAttribute('aria-hidden', 'true');
    const context = canvas.getContext('2d');
    host.append(canvas);
    return {host, canvas, context};
  }).filter(logo => logo.context);
  if (!logos.length) return;

  let polygons = [];
  let longitude = 22;
  let frame = 0;
  let lastTime = 0;
  let rotationStarted = 0;
  const reduced = () => document.documentElement.dataset.motion !== 'full';

  function draw({context: g}) {
    const center = 96;
    const radius = 66;
    g.clearRect(0, 0, 192, 192);
    g.save();
    g.translate(center, center);
    g.rotate(-0.42);
    g.strokeStyle = '#d5b777';
    g.lineWidth = 2;
    g.beginPath();
    g.ellipse(0, 0, 83, 30, 0, 0, Math.PI * 2);
    g.stroke();
    g.restore();

    const sea = g.createRadialGradient(72, 67, 3, 100, 100, 72);
    sea.addColorStop(0, '#739d7c');
    sea.addColorStop(0.48, '#285d4b');
    sea.addColorStop(1, '#0c3029');
    g.fillStyle = sea;
    g.shadowColor = '#9be0be66';
    g.shadowBlur = 12;
    g.beginPath();
    g.arc(center, center, radius, 0, Math.PI * 2);
    g.fill();
    g.shadowBlur = 0;

    function line(coordinates, color, weight) {
      g.beginPath();
      let connected = false;
      for (const [lon, lat] of coordinates) {
        const point = projectPoint(lat, lon, longitude, 15);
        if (point.z <= 0) {
          connected = false;
          continue;
        }
        const x = center + point.x * radius;
        const y = center - point.y * radius;
        if (connected) g.lineTo(x, y);
        else g.moveTo(x, y);
        connected = true;
      }
      g.strokeStyle = color;
      g.lineWidth = weight;
      g.stroke();
    }

    for (let lon = -180; lon < 180; lon += 45) {
      const meridian = [];
      for (let lat = -90; lat <= 90; lat += 5) meridian.push([lon, lat]);
      line(meridian, '#d4edcc38', 0.7);
    }
    for (const polygon of polygons) {
      for (const ring of polygon) line(ring, '#f0d9a1', 1.35);
    }
    const sheen = g.createRadialGradient(70, 65, 0, 70, 65, 45);
    sheen.addColorStop(0, '#fff7db40');
    sheen.addColorStop(1, '#fff7db00');
    g.fillStyle = sheen;
    g.beginPath();
    g.arc(center, center, radius, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = '#dbecd1b3';
    g.lineWidth = 1.3;
    g.stroke();
  }

  function tick(time) {
    frame = 0;
    if (document.hidden || reduced()) return;
    if (!rotationStarted) rotationStarted = time;
    if (!lastTime || time - lastTime >= 50) {
      longitude += lastTime ? Math.min(time - lastTime, 100) * 0.003 : 0;
      lastTime = time;
      logos.forEach(draw);
    }
    // A short welcoming turn, then stillness until the next explicit resume.
    if (time - rotationStarted < 8000) frame = requestAnimationFrame(tick);
  }

  function refresh() {
    cancelAnimationFrame(frame);
    frame = 0;
    lastTime = 0;
    rotationStarted = 0;
    logos.forEach(draw);
    if (polygons.length && !document.hidden && !reduced()) {
      frame = requestAnimationFrame(tick);
    }
  }

  getLand().then(land => {
    polygons = land;
    logos.forEach(logo => logo.host.classList.add('world-logo-ready'));
    refresh();
  }).catch(() => {});
  document.addEventListener('untamed:motionchange', refresh);
  document.addEventListener('visibilitychange', refresh);
}

const facets = [
  ['mountains', 'Bergen & buitenlucht', 'Even helemaal ergens anders.', 'costa-rica/photos/dest-monteverde.jpg', '#trips'],
  ['culture', 'Straten & verhalen', 'Dwaal rond. Proef iets nieuws.', 'costa-rica/photos/dest-sanjose.jpg', '#trips'],
  ['ocean', 'Kust & vrijheid', 'Neem de tijd. Volg de horizon.', 'costa-rica/photos/dest-uvita.jpg', '#trips'],
  ['wild', 'Natuur & ontmoetingen', 'Blijf kijken. Blijf je verwonderen.', 'costa-rica/photos/dest-tortuguero.jpg', '#wildlife']
];

export function worldFacetsMarkup() {
  return `<section class="world-facets" aria-labelledby="world-facets-title">
    <div class="world-section-heading"><div><span class="eyebrow">VOLG JE NIEUWSGIERIGHEID</span>
    <h2 id="world-facets-title">Zoveel wereld. <em>Zoveel om te beleven.</em></h2></div>
    <span class="world-handnote">Waar wil jij verdwalen?</span></div>
    <div class="world-facets-grid">${facets.map(([kind, title, detail, image, href]) => `
      <a class="world-facet world-facet-${kind}" href="${href}">
        <img src="${image}" alt="" loading="lazy" decoding="async">
        <div><h3>${title}</h3><p>${detail}</p></div><span aria-hidden="true">↗</span>
      </a>`).join('')}</div>
    <p class="world-image-note">Een voorproefje van de wereld, met beelden uit de Costa Rica-collectie.</p>
  </section>`;
}

export function journeyKeepsakeMarkup() {
  return `<div class="journey-keepsake" aria-hidden="true">
    <span class="journey-postmark">EEN REIS OM<br>TE BEWAREN</span>
    <svg viewBox="0 0 210 45" fill="none"><path d="M2 30c28-44 48 27 78-1S135 7 155 20s28 14 52-8" stroke="currentColor" stroke-dasharray="3 6"/><circle cx="3" cy="30" r="2" fill="currentColor"/><path d="m195 11 12 1-5 11" stroke="currentColor"/></svg>
    <span class="journey-handnote">Neem de kleine momenten mee.</span>
  </div>`;
}
