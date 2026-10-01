import { supabase } from '../lib/supabase.js'
import { loadProjects } from '../data/projects.js'
import { loadServices } from '../data/services.js'
import { createVideoElement } from '../lib/video.js'
import { initThemeToggle } from '../components/theme-toggle.js'
import { initHeader } from '../components/header.js'
import { initCursor } from '../components/cursor-trail.js'
import { initMagnetic } from '../components/magnetic.js'
import { initMediaState, isGloballyMuted, setGlobalMuted, subscribeGlobalMute } from '../lib/media-state.js'
import { initBooking } from '../components/booking.js'
import { initScrollReveal } from '../components/scroll-reveal.js'

const slug = new URLSearchParams(location.search).get('slug') || ''
const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

async function getProjectServices(projectId) {
  if (!supabase || !projectId) return []
  const { data, error } = await supabase.from('project_services').select('service_id,services(*)').eq('project_id', projectId)
  if (error) throw error
  return (data || []).map((row) => row.services).filter(Boolean)
}

async function boot() {
  initThemeToggle(); initHeader(); initCursor(); initMagnetic(); initBooking(); initScrollReveal()
  await Promise.all([loadProjects(), loadServices()])

  const { projects } = await import('../data/projects.js')
  const project = projects.find((item) => item.slug === slug)
  if (!project) {
    document.getElementById('projectPage').innerHTML = '<div class="page-empty page-empty-full">Project not found.</div>'
    return
  }

  document.title = `${project.title} — Sutra Studio`
  document.getElementById('projectPageTitle').textContent = project.title
  document.getElementById('projectPageDescription').textContent = project.desc || ''
  document.getElementById('projectPageCategory').textContent = project.category || ''
  document.getElementById('projectPageClient').textContent = project.client || ''
  document.getElementById('projectPageYear').textContent = project.year || ''
  const workTypeEl = document.getElementById('projectPageWorkType')
  if (workTypeEl) { workTypeEl.textContent = project.workType || ''; workTypeEl.hidden = !project.workType }

  const mediaHost = document.getElementById('projectPageMedia')
  if (project.video) {
    const video = createVideoElement({ url: project.video, type: project.videoType, title: project.title, autoplay: true, muted: true, loop: true, controls: true, poster: project.poster || project.image, className: 'detail-hero-video' })
    if (video) mediaHost.appendChild(video)
  } else if (project.image || project.poster) {
    mediaHost.style.backgroundImage = `url("${project.image || project.poster}")`
    mediaHost.classList.add('has-image')
  }

  if (project.projectUrl) {
    const link = document.getElementById('projectExternalLink')
    link.hidden = false
    link.href = project.projectUrl
  }

  let services = []
  try {
    services = await getProjectServices(project.id)
  } catch (error) {
    console.error('[sutra] Project services failed:', error)
  }
  const { services: loadedServices } = await import('../data/services.js')
  const serviceList = services.length ? services : loadedServices.filter((s) => String(project.category || '').toLowerCase().includes(String(s.title).toLowerCase()))
  document.getElementById('projectPageServices').innerHTML = serviceList.map((s) => `<a href="./service.html?slug=${encodeURIComponent(s.slug)}">${esc(s.title)} ↗</a>`).join('')

  const related = loadedServices.length
  document.getElementById('projectRelated')
  if (!related) return
}

boot().catch((error) => console.error('[sutra] Project page failed:', error))
