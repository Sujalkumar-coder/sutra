export function initHeader() {
  const logo = document.querySelector('.header .logo')
  if (!logo) return

  logo.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    const href = logo.getAttribute('href') || '#top'
    const onHome = /(?:^|\/)index\.html$/.test(location.pathname) || location.pathname === '/' || location.pathname.endsWith('/sutra/')

    if (!onHome && href.startsWith('#')) {
      return
    }

    if (onHome && href.startsWith('#')) {
      e.preventDefault()
      const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
      if (location.hash) history.replaceState(null, '', location.pathname + location.search)
    }
  })
}
