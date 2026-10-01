import { siteSettings } from '../data/site.js'

const setText = (selector, value) => {
  const el = document.querySelector(selector)
  if (el) el.textContent = value || ''
}

function setHref(selector, href) {
  const el = document.querySelector(selector)
  if (!el || !href) return
  el.href = href
}

export function initSiteContent() {
  setText('.hero .eyebrow', siteSettings.hero_eyebrow)
  const heroTitle = document.querySelector('.hero h1')
  if (heroTitle) heroTitle.innerHTML = `${escapeHtml(siteSettings.hero_title_line_1)}<br><em>${escapeHtml(siteSettings.hero_title_line_2)}</em>`

  const contactEmail = siteSettings.email || 'hello@sutra.studio'
  document.querySelectorAll('[data-site-email]').forEach((el) => {
    el.textContent = contactEmail
    el.href = `mailto:${contactEmail}`
  })
  document.querySelectorAll('[data-book]').forEach((el) => {
    el.href = `mailto:${contactEmail}`
  })
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]))
}
