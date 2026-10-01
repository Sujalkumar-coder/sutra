/* Header: the SUTRA wordmark is a real link (href="#top" works without JS) that scrolls back to the top. */
export function initHeader() {
  const logo = document.querySelector('.header .logo');
  if (!logo) return;

  logo.addEventListener('click', (e) => {
    // leave ctrl/cmd/shift/middle-click alone so "open in new tab" keeps working
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();

    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });

    // keep the address bar clean (no "#top" / stale "#contact" left behind)
    if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  });
}
