import { siteSettings } from '../data/site.js'

const esc = (value = '') => String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

export function initSiteFooter() {
  const root = document.getElementById('footerDetails')
  if (!root) return

  const socials = [
    ['Instagram', siteSettings.instagram_url],
    ['Facebook', siteSettings.facebook_url],
    ['X', siteSettings.x_url],
    ['LinkedIn', siteSettings.linkedin_url]
  ].filter(([, url]) => url)

  const meta = document.querySelectorAll('.footer-meta span')
  if (meta[1]) meta[1].textContent = siteSettings.footer_tagline || 'MOTION · VIDEO · STORY'
  if (meta[2]) meta[2].textContent = siteSettings.copyright_text || '© 2026 Sujal Kumar. All rights reserved.'

  const email = siteSettings.email ? `<a href="mailto:${esc(siteSettings.email)}">${esc(siteSettings.email)}</a>` : ''
  const phone = siteSettings.phone ? `<a href="tel:${esc(siteSettings.phone.replace(/[^+\d]/g, ''))}">${esc(siteSettings.phone)}</a>` : ''
  const location = siteSettings.location ? `<span>${esc(siteSettings.location)}</span>` : ''

  root.innerHTML = `
    <div class="footer-details-grid">
      <div class="footer-details-identity">
        <span class="footer-eyebrow">CONTACT</span>
        <strong>${esc(siteSettings.owner_name || '')}</strong>
        <div class="footer-contact-lines">${email}${phone}${location}</div>
      </div>
      <div class="footer-details-social">
        <span class="footer-eyebrow">SOCIAL</span>
        <div class="footer-social-links">
          ${socials.length ? socials.map(([name, url]) => `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(name)} <span>↗</span></a>`).join('') : '<span class="footer-muted">Add social links in Admin.</span>'}
        </div>
      </div>
      <div class="footer-details-meta">
        <span>${esc(siteSettings.footer_tagline || 'MOTION · VIDEO · STORY')}</span>
        <small>${esc(siteSettings.copyright_text || '© 2026 Sujal Kumar. All rights reserved.')}</small>
      </div>
    </div>`
}
