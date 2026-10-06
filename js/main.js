import { loadProjects } from './data/projects.js'
import { loadClients } from './data/clients.js'
import { loadServices } from './data/services.js'
import { loadSiteSettings } from './data/site.js'
import { initWorkCarousel } from './components/work-carousel.js'
import { initClients } from './components/clients.js'
import { initServices } from './components/services.js'
import { initHeroMedia } from './components/hero-media.js'
import { initSiteFooter } from './components/site-footer.js'
import { initSiteContent } from './components/site-content.js'
import { initCursor } from './components/cursor-trail.js'
import { initMagnetic } from './components/magnetic.js'
import { initFooter } from './components/footer-wordmark.js'
import { initBooking } from './components/booking.js'
import { initThemeToggle } from './components/theme-toggle.js'
import { initHeader } from './components/header.js'
import { initScrollReveal } from './components/scroll-reveal.js'
import { initAmbientBackground } from './components/ambient-background.js'

const start = (name, fn) => {
  try { fn() }
  catch (err) { console.error(`[sutra] ${name} failed to start`, err) }
}

async function boot() {
  start('theme', initThemeToggle)
  start('header', initHeader)
  start('ambient', initAmbientBackground)
  start('cursor', initCursor)
  start('magnetic', initMagnetic)

  await Promise.all([
    loadProjects(),
    loadClients(),
    loadServices(),
    loadSiteSettings()
  ])

  start('site-content', initSiteContent)
  start('hero', initHeroMedia)
  start('work', initWorkCarousel)
  start('clients', initClients)
  start('services', initServices)
  start('footer-wordmark', initFooter)
  start('site-footer', initSiteFooter)
  start('booking', initBooking)
  start('reveal', initScrollReveal)

  // When an inner page sends the visitor back to #services, place the What We Do
  // section in the visual center rather than leaving it pinned to the viewport top.
  if (location.hash === '#services') {
    requestAnimationFrame(() => {
      setTimeout(() => {
        const target = document.getElementById('services')
        if (target) target.scrollIntoView({ block: 'center', behavior: 'smooth' })
      }, 120)
    })
  }
}

boot().catch((err) => console.error('[sutra] Failed to boot site', err))
