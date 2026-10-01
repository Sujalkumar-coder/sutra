import { services } from '../data/services.js';

const pad = (n) => String(n + 1).padStart(2, '0');

export function initServices() {
  const list = document.getElementById('serviceList');
  const art = document.getElementById('serviceArt');
  const caption = document.getElementById('serviceVisualTitle');
  const index = document.getElementById('serviceIndex');
  if (!list || !art) return;

  list.innerHTML = services.map((s, i) => `
    <button class="service-item" type="button" data-i="${i}" style="--sv:${s.accent || '#c8dcff'}">
      <span class="service-no">${pad(i)}</span>
      <strong>${s.title}</strong>
      <em class="service-go" aria-hidden="true">→</em>
      <small>${s.tags || ''}</small>
    </button>`).join('');
  const items = [...list.children];

  let current = -1, swapTimer = 0;
  function select(i) {
    if (i === current) return;
    current = i;
    const s = services[i];
    items.forEach((el, n) => el.classList.toggle('active', n === i));
    // the list reacts immediately; only the artwork gets a short crossfade
    art.dataset.mode = s.art ?? i % 6;
    art.style.setProperty('--service-accent', s.accent || '#c8dcff');
    caption.textContent = s.title.toUpperCase();
    index.textContent = pad(i);
    art.classList.remove('service-changing');
    void art.offsetWidth;
    art.classList.add('service-changing');
    clearTimeout(swapTimer);
    swapTimer = setTimeout(() => art.classList.remove('service-changing'), 260);
  }

  list.addEventListener('pointerover', (e) => {
    if (e.pointerType === 'touch') return;
    const el = e.target.closest('.service-item'); if (el) select(+el.dataset.i);
  });
  list.addEventListener('click', (e) => { const el = e.target.closest('.service-item'); if (el) select(+el.dataset.i); });
  list.addEventListener('focusin', (e) => { const el = e.target.closest('.service-item'); if (el) select(+el.dataset.i); });
  list.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const n = (current + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
    items[n].focus();
  });
  select(0);
}
