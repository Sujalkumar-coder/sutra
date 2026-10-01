import { clientsData } from '../data/clients.js';

const pad = (n) => String(n + 1).padStart(2, '0');
const esc = (s = '') => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const mono = (name) => name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();

// <img> that never shows broken-image UI: on error it removes itself and the placeholder stays
function safeImg(src, alt, host) {
  if (!src) return;
  const img = new Image();
  img.alt = alt; img.decoding = 'async'; img.loading = 'lazy';
  img.onload = () => { host.classList.add('has-img'); host.prepend(img); };
  img.onerror = () => img.remove();
  img.src = src;
}

export function initClients() {
  const root = document.getElementById('clientsApp');
  const clients = clientsData;
  if (!root || !clients.length) return;

  const names = clients.map((c) => c.name.toUpperCase());
  const loop = Array.from({ length: Math.max(2, Math.ceil(14 / names.length)) }, () => names).flat();
  const strip = [...loop, ...loop].map((n) => `<span>${esc(n)}</span><i></i>`).join('');

  root.innerHTML = `
    <div class="cl-stage">
      <div class="cl-list" role="tablist" aria-label="Clients">
        ${clients.map((c, i) => `<button type="button" class="cl-item" role="tab" data-i="${i}"><span>${pad(i)}</span><strong>${esc(c.name)}</strong></button>`).join('')}
      </div>
      <div class="cl-feature">
        <div class="cl-topline">
          <span class="cl-count"><b data-cur></b><i></i><span data-total></span></span>
          <span class="cl-nav"><button type="button" data-step="-1" aria-label="Previous client">←</button><button type="button" data-step="1" aria-label="Next client">→</button></span>
        </div>
        <div class="cl-body">
          <h3 class="cl-name" data-name></h3>
          <p class="cl-desc" data-desc></p>
          <div class="cl-meta" data-meta></div>
        </div>
      </div>
      <div class="cl-media">
        <div class="cl-frame" data-frame><div class="cl-ph"><span>PHOTO</span><b data-mono></b></div></div>
        <div class="cl-thumbs" data-thumbs></div>
      </div>
    </div>
    <div class="cl-marquee" aria-hidden="true"><div class="cl-marquee-track">${strip}</div></div>`;

  const $ = (s) => root.querySelector(s);
  const items = [...root.querySelectorAll('.cl-item')];
  const frame = $('[data-frame]'), thumbs = $('[data-thumbs]');
  const animated = [$('.cl-name'), $('.cl-desc'), $('.cl-meta')];
  $('[data-total]').textContent = pad(clients.length - 1);

  let current = -1;
  function showMedia(src, c) {
    frame.classList.remove('has-img');
    frame.querySelectorAll('img').forEach((i) => i.remove());
    $('[data-mono]').textContent = mono(c.name);
    safeImg(src, c.name, frame);
  }
  function select(i, { scroll = true } = {}) {
    i = (i + clients.length) % clients.length;
    if (i === current) return;
    current = i;
    const c = clients[i];
    items.forEach((el, n) => { el.classList.toggle('active', n === i); el.setAttribute('aria-selected', n === i); });
    $('[data-cur]').textContent = pad(i);
    const nameEl = $('[data-name]');
    nameEl.innerHTML = c.logo ? `<img src="${esc(c.logo)}" alt="${esc(c.name)}" onerror="this.replaceWith(document.createTextNode('${esc(c.name).replace(/'/g, "\\'")}'))">` : esc(c.name);
    $('[data-desc]').textContent = c.description || '';
    $('[data-meta]').innerHTML = [c.year && `<span>${esc(c.year)}</span>`, ...(c.tags || []).map((t) => `<span>${esc(t)}</span>`), c.url && `<a href="${esc(c.url)}" target="_blank" rel="noopener">View project <span class="arrow">↗</span></a>`].filter(Boolean).join('');
    const media = [c.image, ...(c.gallery || [])].filter(Boolean);
    showMedia(media[0], c);
    thumbs.innerHTML = media.length > 1 ? media.slice(0, 5).map((s, k) => `<button type="button" data-src="${esc(s)}" class="${k ? '' : 'on'}"></button>`).join('') : '';
    thumbs.querySelectorAll('button').forEach((b) => { b.style.backgroundImage = `url("${b.dataset.src}")`; });
    animated.forEach((el) => { el.classList.remove('cl-in'); void el.offsetWidth; el.classList.add('cl-in'); });
    frame.classList.remove('cl-in'); void frame.offsetWidth; frame.classList.add('cl-in');
    if (scroll) items[i].scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }

  root.addEventListener('click', (e) => {
    const item = e.target.closest('.cl-item'), step = e.target.closest('[data-step]'), th = e.target.closest('.cl-thumbs button');
    if (item) select(+item.dataset.i);
    else if (step) select(current + +step.dataset.step);
    else if (th) { thumbs.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b === th)); showMedia(th.dataset.src, clients[current]); }
  });
  root.querySelector('.cl-list').addEventListener('keydown', (e) => {
    const d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
    if (!d) return;
    e.preventDefault(); select(current + d); items[current].focus();
  });
  items.forEach((el) => el.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') select(+el.dataset.i, { scroll: false }); }));

  select(0, { scroll: false });
}
