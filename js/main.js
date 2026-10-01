import { initWorkCarousel } from './components/work-carousel.js';
import { initClients } from './components/clients.js';
import { initServices } from './components/services.js';
import { initCursor } from './components/cursor-trail.js';
import { initMagnetic } from './components/magnetic.js';
import { initFooter } from './components/footer-wordmark.js';
import { initBooking } from './components/booking.js';
import { initThemeToggle } from './components/theme-toggle.js';
import { initHeader } from './components/header.js';
import { initScrollReveal } from './components/scroll-reveal.js';

// Each component starts independently: if one fails (bad data, missing element, blocked API)
// it is logged and the rest of the site keeps working.
const start = (name, fn) => {
  try { fn(); } catch (err) { console.error(`[sutra] ${name} failed to start`, err); }
};

start('theme', initThemeToggle);     // first, so the saved theme applies immediately
start('header', initHeader);
start('cursor', initCursor);
start('magnetic', initMagnetic);
start('work', initWorkCarousel);
start('clients', initClients);
start('services', initServices);
start('footer', initFooter);
start('booking', initBooking);
start('reveal', initScrollReveal);
