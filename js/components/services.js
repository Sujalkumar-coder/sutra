import { services } from '../data/services.js'

const pad = (n) => String(n + 1).padStart(2, '0')
const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

export function initServices() {
  const list = document.getElementById('serviceList')
  const art = document.getElementById('serviceArt')
  const caption = document.getElementById('serviceVisualTitle')
  const index = document.getElementById('serviceIndex')
  if (!list || !art) return
  if (!services.length) {
    list.innerHTML = '<div class="cms-empty-public">No published services yet.</div>'
    return
  }

  list.innerHTML = services.map((s, i) => `
    <a class="service-item" href="./service.html?slug=${encodeURIComponent(s.slug)}" data-i="${i}" style="--sv:${esc(s.accent || '#c8dcff')};--sv-start:${esc(s.gradientStart || s.accent || '#c8dcff')};--sv-end:${esc(s.gradientEnd || '#111111')};--sv-angle:${Number.isFinite(Number(s.gradientAngle)) ? Number(s.gradientAngle) : 135}deg">
      <span class="service-no">${pad(i)}</span>
      <strong>${esc(s.title)}</strong>
      <em class="service-go" aria-hidden="true">→</em>
      <small>${esc(s.description || (s.tags || []).join(' · '))}</small>
    </a>`).join('')

  const items = [...list.children]
  let current = -1
  let swapTimer = 0

  function select(i) {
    i = (i + services.length) % services.length
    if (i === current) return
    current = i
    const service = services[i]
    items.forEach((el, n) => el.classList.toggle('active', n === i))
    art.dataset.mode = service.art ?? i % 6
    art.style.setProperty('--service-accent', service.accent || '#c8dcff')
    art.style.setProperty('--service-gradient-start', service.gradientStart || service.accent || '#c8dcff')
    art.style.setProperty('--service-gradient-end', service.gradientEnd || '#111111')
    art.style.setProperty('--service-gradient', `linear-gradient(${Number.isFinite(Number(service.gradientAngle)) ? Number(service.gradientAngle) : 135}deg, ${service.gradientStart || service.accent || '#c8dcff'}, ${service.gradientEnd || '#111111'})`)
    caption.textContent = service.title.toUpperCase()
    index.textContent = pad(i)
    art.classList.remove('service-changing')
    void art.offsetWidth
    art.classList.add('service-changing')
    clearTimeout(swapTimer)
    swapTimer = setTimeout(() => art.classList.remove('service-changing'), 260)
  }

  list.addEventListener('pointerover', (e) => {
    if (e.pointerType === 'touch') return
    const item = e.target.closest('.service-item')
    if (item) select(+item.dataset.i)
  })
  list.addEventListener('focusin', (e) => {
    const item = e.target.closest('.service-item')
    if (item) select(+item.dataset.i)
  })
  list.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
    e.preventDefault()
    const next = (current + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length
    items[next].focus()
  })
  select(0)
}
