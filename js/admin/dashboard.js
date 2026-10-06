import { supabase, hasSupabaseConfig } from '../lib/supabase.js'
import { getCurrentAdmin, logoutAdmin } from './auth.js'
import { fallbackClients } from '../data/clients.js'
import { fallbackServices } from '../data/services.js'
import { createVideoElement } from '../lib/video.js'

const root = document.getElementById('admin-panel')
const userEl = document.getElementById('user')
const esc = (value = '') => String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
const slugify = (value = '') => String(value).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

let currentUser = null
let state = { projects: [], clients: [], services: [], settings: null }

async function requireAuth() {
  currentUser = await getCurrentAdmin()
  if (!currentUser) {
    window.location.href = './index.html'
    throw new Error('Not authenticated')
  }
  userEl.textContent = currentUser.email || ''
}

async function countRows(table) {
  if (!supabase) return 0
  const { count, error } = await supabase.from(table).select('id', { count: 'exact', head: true })
  if (error) throw error
  return count || 0
}

async function ensureStarterContent() {
  if (!supabase) return
  const seedKey = 'sutra-cms-starter-seeded-v1'
  if (localStorage.getItem(seedKey)) return
  const [{ count: clientCount }, { count: serviceCount }] = await Promise.all([
    supabase.from('clients').select('id', { count: 'exact', head: true }),
    supabase.from('services').select('id', { count: 'exact', head: true })
  ])
  if (!clientCount) {
    const payload = fallbackClients.map((c, i) => ({ name: c.name, slug: c.slug, description: c.description, year: c.year, published: true, featured: c.featured, sort_order: i }))
    const { error } = await supabase.from('clients').upsert(payload, { onConflict: 'slug' })
    if (error) throw error
  }
  if (!serviceCount) {
    const payload = fallbackServices.map((s, i) => ({ title: s.title, slug: s.slug, description: s.description, tags: s.tags, accent: s.accent, gradient_start: s.gradientStart || s.accent, gradient_end: s.gradientEnd || '#111111', gradient_angle: s.gradientAngle ?? 135, published: true, sort_order: i }))
    const { error } = await supabase.from('services').upsert(payload, { onConflict: 'slug' })
    if (error) throw error
  }
  if (!clientCount || !serviceCount) localStorage.setItem(seedKey, '1')
}

async function loadState() {
  if (!supabase) return
  const [{ data: projects }, { data: clients }, { data: services }, { data: settings }] = await Promise.all([
    supabase.from('projects').select('*').order('sort_order', { ascending: true }).order('created_at', { ascending: false }),
    supabase.from('clients').select('*').order('sort_order', { ascending: true }).order('created_at', { ascending: false }),
    supabase.from('services').select('*').order('sort_order', { ascending: true }).order('created_at', { ascending: false }),
    supabase.from('site_settings').select('*').order('updated_at', { ascending: false }).limit(1).maybeSingle()
  ])
  state = { projects: projects || [], clients: clients || [], services: services || [], settings: settings || null }
}

function navButton(panel) {
  document.querySelectorAll('.admin-nav button[data-panel]').forEach((button) => button.classList.toggle('active', button.dataset.panel === panel))
}

function setPanel(panel) {
  navButton(panel)
  location.hash = panel
  const renderers = { overview: renderOverview, projects: renderProjects, clients: renderClients, services: renderServices, 'manage-site': renderManageSite, intro: renderIntro, settings: renderSettings }
  ;(renderers[panel] || renderOverview)()
}

function formatDate(value) {
  if (!value) return '—'
  try { return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) } catch { return '—' }
}

function renderShell(title, eyebrow, description = '') {
  root.innerHTML = `
    <div class="admin-page-head">
      <div>
        <p class="eyebrow">${esc(eyebrow)}</p>
        <h1>${esc(title)}</h1>
        ${description ? `<p class="admin-page-description">${esc(description)}</p>` : ''}
      </div>
      <div class="admin-page-actions" id="page-actions"></div>
    </div>
    <div id="panel-body"></div>`
  return document.getElementById('panel-body')
}

function renderOverview() {
  const body = renderShell('Dashboard', 'SUTRA ADMIN', 'A quiet overview of the site. Detailed controls live in their own sections.')
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  body.innerHTML = `
    <section class="dashboard-hero panel dashboard-hero-minimal">
      <div class="dashboard-hero-copy">
        <span class="eyebrow">COMMAND CENTER</span>
        <h2>${greeting}, Sujal.</h2>
        <p>Everything is connected. Use the left navigation when you want to edit something.</p>
      </div>
      <div class="dashboard-hero-status"><span class="status-dot ${hasSupabaseConfig ? 'is-ok' : ''}"></span>${hasSupabaseConfig ? 'Supabase connected' : 'Configuration required'}</div>
    </section>

    <section class="admin-stat-grid admin-stat-grid-premium">
      <div class="stat-card"><span>PROJECTS</span><strong>${state.projects.length}</strong><small>${state.projects.filter((p) => p.published).length} published · ${state.projects.filter((p) => p.featured).length} featured</small></div>
      <div class="stat-card"><span>CLIENTS</span><strong>${state.clients.length}</strong><small>${state.clients.filter((c) => c.published).length} published</small></div>
      <div class="stat-card"><span>SERVICES</span><strong>${state.services.length}</strong><small>${state.services.filter((s) => s.published).length} published</small></div>
      <div class="stat-card status-card"><span>SITE STATUS</span><strong>${state.settings ? 'READY' : 'SETUP'}</strong><small>${state.settings ? 'Site settings available' : 'Site settings missing'}</small></div>
    </section>

    <section class="panel dashboard-health dashboard-health-clean">
      <div class="panel-head"><div><h2>System health</h2><p>The few things that matter before publishing.</p></div></div>
      <div class="checklist">
        ${check('Supabase connected', hasSupabaseConfig)}
        ${check('Admin authentication', Boolean(currentUser))}
        ${check('Projects available', state.projects.length > 0)}
        ${check('Clients available', state.clients.length > 0)}
        ${check('Services available', state.services.length > 0)}
        ${check('Site settings available', Boolean(state.settings))}
      </div>
    </section>`
}

function check(label, ok) {
  return `<div class="check-item"><span class="check-dot ${ok ? 'ok' : ''}"></span><span>${esc(label)}</span><b>${ok ? 'Ready' : 'Pending'}</b></div>`
}

async function seedStarterContent() {
  if (!supabase) return
  const button = document.querySelector('[data-seed]')
  if (button) { button.disabled = true; button.textContent = 'Importing…' }
  try {
    if (!state.clients.length) {
      const payload = fallbackClients.map((c, i) => ({ name: c.name, slug: c.slug, description: c.description, year: c.year, published: true, featured: c.featured, sort_order: i }))
      await supabase.from('clients').upsert(payload, { onConflict: 'slug' })
    }
    if (!state.services.length) {
      const payload = fallbackServices.map((s, i) => ({ title: s.title, slug: s.slug, description: s.description, tags: s.tags, accent: s.accent, gradient_start: s.gradientStart || s.accent, gradient_end: s.gradientEnd || '#111111', gradient_angle: s.gradientAngle ?? 135, published: true, sort_order: i }))
      await supabase.from('services').upsert(payload, { onConflict: 'slug' })
    }
    await loadState()
    setPanel('overview')
  } catch (error) {
    window.alert(error.message)
    if (button) { button.disabled = false; button.textContent = 'Import current starter Clients + Services' }
  }
}

function renderManageSite() {
  const body = renderShell('Manage Site', 'SITE MANAGEMENT', 'Control the homepage intro, contact details, social links and footer from one place.')
  const s = state.settings || {}
  body.innerHTML = `
    <div class="manage-site-grid">
      <section class="panel"><div class="panel-head"><div><h2>Intro / Hero</h2><p>${esc(s.intro_video_url || 'No intro video configured yet.')}</p></div><button class="outline-btn" data-manage="intro">Edit intro</button></div><div class="manage-summary"><div><span>Headline</span><strong>${esc(s.hero_title_line_1 || '—')}</strong><strong>${esc(s.hero_title_line_2 || '')}</strong></div><div><span>Video</span><strong>${s.intro_published === false ? 'Hidden' : (s.intro_video_url ? 'Configured' : 'Placeholder')}</strong></div></div></section>
      <section class="panel"><div class="panel-head"><div><h2>Contact &amp; Footer</h2><p>${esc(s.email || 'No email configured.')} · ${esc(s.location || 'No location configured.')}</p></div><button class="outline-btn" data-manage="settings">Edit details</button></div><div class="manage-summary"><div><span>Owner</span><strong>${esc(s.owner_name || '—')}</strong></div><div><span>Footer</span><strong>${esc(s.copyright_text || '—')}</strong></div></div></section>
    </div>
    <section class="panel manage-site-note"><div class="panel-head"><div><h2>How it works</h2><p>Save here once; the public homepage reads the same values on every load. Videos remain externally hosted, images can be uploaded through the content editors.</p></div></div></section>`
  body.querySelectorAll('[data-manage]').forEach((b) => b.addEventListener('click', () => setPanel(b.dataset.manage)))
}

function renderProjects() {
  const body = renderShell('Selected Work', 'CONTENT MANAGEMENT', 'Projects shown in the homepage carousel and available on project detail pages.')
  document.getElementById('page-actions').innerHTML = '<button class="solid-btn" data-new-project>New project</button>'
  body.innerHTML = `<div class="cms-list">${state.projects.map((p) => `
    <article class="cms-row">
      <div class="cms-row-main"><div class="cms-thumb" style="background-image:url('${esc(p.thumbnail_url || p.poster_url || '')}')"></div><div><strong>${esc(p.title)}</strong><span>${esc(p.category || 'No category')} · ${p.published ? 'Published' : 'Draft'}${p.video_url ? ' · Video linked' : ''}</span></div></div>
      <div class="cms-row-actions"><button class="mini-btn" data-edit-project="${p.id}">Edit</button><button class="mini-btn danger" data-delete-project="${p.id}">Delete</button></div>
    </article>`).join('') || '<div class="empty-state">No projects yet. Add your first project.</div>'}</div><div id="entity-editor"></div>`
  document.querySelector('[data-new-project]').addEventListener('click', () => openProjectEditor())
  body.querySelectorAll('[data-edit-project]').forEach((b) => b.addEventListener('click', () => openProjectEditor(state.projects.find((p) => p.id === b.dataset.editProject))))
  body.querySelectorAll('[data-delete-project]').forEach((b) => b.addEventListener('click', () => deleteEntity('projects', b.dataset.deleteProject)))
}

function openProjectEditor(project = null) {
  const editor = document.getElementById('entity-editor')
  editor.innerHTML = `
    <div class="editor-drawer">
      <div class="drawer-head"><div><p class="eyebrow">${project ? 'EDIT PROJECT' : 'NEW PROJECT'}</p><h2>${project ? esc(project.title) : 'Add project'}</h2></div><div class="editor-header-actions"><button class="reset-btn" type="button" data-reset-form title="Reset unsaved changes"><span class="reset-icon">↺</span><span>Reset</span></button><button class="ghost-btn" data-close>Close</button></div></div>
      <form id="project-form" class="cms-form">
        <input type="hidden" name="id" value="${esc(project?.id || '')}">
        <div class="form-grid two">
          ${field('Title', 'title', project?.title || '', true)}
          ${field('Slug', 'slug', project?.slug || '')}
          ${field('Category', 'category', project?.category || '', false, 'VIDEO EDITING · MOTION')}
          ${workTypeField(project?.work_type || '')}
          ${field('Client', 'client_name', project?.client_name || '')}
          ${field('Year', 'year', project?.year || '', false, '', 'number')}
          ${field('Sort order', 'sort_order', project?.sort_order ?? 0, false, '', 'number')}
        </div>
        ${textarea('Description', 'description', project?.description || '', 4)}
        <div class="media-grid two">
          ${mediaField('Thumbnail', 'thumbnail_url', project?.thumbnail_url || '', 'project-thumbnail-file')}
          ${mediaField('Poster', 'poster_url', project?.poster_url || '', 'project-poster-file')}
        </div>
        <div class="form-grid two">
          ${field('External video URL', 'video_url', project?.video_url || '', false, 'https://youtu.be/... or https://vimeo.com/...', 'url')}
          <label>Video type<select name="video_type"><option value="" ${!project?.video_type ? 'selected' : ''}>Auto detect</option><option value="youtube" ${project?.video_type === 'youtube' ? 'selected' : ''}>YouTube</option><option value="vimeo" ${project?.video_type === 'vimeo' ? 'selected' : ''}>Vimeo</option><option value="external" ${project?.video_type === 'external' ? 'selected' : ''}>Direct MP4</option></select></label>
          ${field('Project URL', 'project_url', project?.project_url || '', false, 'Optional external link', 'url')}
        </div>
        <div class="form-section"><span class="form-section-title">Services</span><div class="service-check-grid">${state.services.map((s) => `<label class="check-chip"><input type="checkbox" name="service_ids" value="${s.id}" data-service-check="${s.slug}"><span>${esc(s.title)}</span></label>`).join('') || '<div class="form-note">Add services first to assign this project.</div>'}</div></div>
        <div class="form-grid three"><label class="check-row"><input type="checkbox" name="featured" ${project?.featured ? 'checked' : ''}> Featured</label><label class="check-row"><input type="checkbox" name="published" ${project?.published !== false ? 'checked' : ''}> Published</label><div></div></div>
        <div class="form-error" id="editor-error" hidden></div>
        <div class="form-actions"><button type="button" class="ghost-btn" data-close>Cancel</button><button type="submit" class="solid-btn">${project ? 'Save changes' : 'Create project'}</button></div>
      </form>
    </div>`

  editor.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', () => editor.innerHTML = ''))
  loadExistingServiceChecks(editor, project?.id)
  editor.querySelector('#project-form').addEventListener('submit', async (event) => {
    event.preventDefault()
    await saveProject(event, project?.id || '')
  })
  editor.querySelector('[data-reset-form]')?.addEventListener('click', () => editor.querySelector('#project-form')?.reset())
  editor.querySelector('input[name="title"]').addEventListener('blur', (e) => {
    const slugInput = editor.querySelector('input[name="slug"]')
    if (!slugInput.value.trim()) slugInput.value = slugify(e.target.value)
  })
}

async function loadExistingServiceChecks(editor, projectId) {
  if (!supabase || !projectId) return
  const { data, error } = await supabase.from('project_services').select('service_id').eq('project_id', projectId)
  if (error) return
  const ids = new Set((data || []).map((row) => row.service_id))
  editor.querySelectorAll('input[name="service_ids"]').forEach((input) => { input.checked = ids.has(input.value) })
}

async function uploadIfPresent(fileInput, folder, slug) {
  const file = fileInput?.files?.[0]
  if (!file || !supabase) return ''
  const cleanName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, '-')
  const path = `${folder}/${slug}-${Date.now()}-${cleanName}`
  const { error } = await supabase.storage.from('site-media').upload(path, file, { cacheControl: '31536000', upsert: false, contentType: file.type || undefined })
  if (error) throw error
  return supabase.storage.from('site-media').getPublicUrl(path).data.publicUrl
}

async function saveProject(event, existingId) {
  const form = event.currentTarget
  const data = new FormData(form)
  const errorEl = form.querySelector('#editor-error')
  errorEl.hidden = true
  const title = String(data.get('title') || '').trim()
  const slug = slugify(String(data.get('slug') || title))
  if (!title || !slug) { errorEl.textContent = 'Title and slug are required.'; errorEl.hidden = false; return }

  const finishSave = beginSaveFeedback()
  try {
    const thumbUpload = await uploadIfPresent(form.querySelector('#project-thumbnail-file'), 'projects/thumbnails', slug)
    const posterUpload = await uploadIfPresent(form.querySelector('#project-poster-file'), 'projects/posters', slug)
    const payload = {
      title,
      slug,
      description: String(data.get('description') || '').trim() || null,
      category: String(data.get('category') || '').trim() || null,
      work_type: String(data.get('work_type') || '').trim() || null,
      client_name: String(data.get('client_name') || '').trim() || null,
      year: data.get('year') ? Number(data.get('year')) : null,
      thumbnail_url: thumbUpload || String(data.get('thumbnail_url') || '').trim() || null,
      poster_url: posterUpload || String(data.get('poster_url') || '').trim() || null,
      video_url: String(data.get('video_url') || '').trim() || null,
      video_type: String(data.get('video_type') || '').trim() || null,
      project_url: String(data.get('project_url') || '').trim() || null,
      featured: data.get('featured') === 'on',
      published: data.get('published') === 'on',
      sort_order: Number(data.get('sort_order') || 0)
    }

    let savedId = existingId
    if (existingId) {
      const { error } = await supabase.from('projects').update(payload).eq('id', existingId)
      if (error) throw error
    } else {
      const { data: created, error } = await supabase.from('projects').insert(payload).select('id').single()
      if (error) throw error
      savedId = created.id
    }

    await supabase.from('project_services').delete().eq('project_id', savedId)
    const serviceIds = [...form.querySelectorAll('input[name="service_ids"]:checked')].map((input) => input.value)
    if (serviceIds.length) {
      const { error } = await supabase.from('project_services').insert(serviceIds.map((service_id) => ({ project_id: savedId, service_id })))
      if (error) throw error
    }

    await loadState()
    finishSave()
    renderProjects()
  } catch (error) {
    failSaveFeedback()
    errorEl.textContent = error.message || 'Unable to save project.'
    errorEl.hidden = false
  }
}

function clientPositionValue(client, key, fallback) {
  const value = Number(client?.[key])
  return Number.isFinite(value) ? value : fallback
}

async function persistClientOrder() {
  const updates = state.clients.map((client, index) =>
    supabase.from('clients').update({ sort_order: index }).eq('id', client.id)
  )
  const results = await Promise.all(updates)
  const failed = results.find((result) => result.error)
  if (failed) throw failed.error
  state.clients = state.clients.map((client, index) => ({ ...client, sort_order: index }))
}

function bindClientOrdering(body) {
  let draggedId = ''
  const list = body.querySelector('[data-client-order-list]')
  if (!list) return

  const move = async (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= state.clients.length || fromIndex === toIndex) return
    const [moved] = state.clients.splice(fromIndex, 1)
    state.clients.splice(toIndex, 0, moved)
    try {
      await persistClientOrder()
      renderClients()
    } catch (error) {
      window.alert(error.message || 'Unable to save client order.')
      await loadState()
      renderClients()
    }
  }

  body.querySelectorAll('[data-client-order-row]').forEach((row) => {
    row.addEventListener('dragstart', () => {
      draggedId = row.dataset.clientOrderRow
      row.classList.add('is-dragging')
    })
    row.addEventListener('dragend', () => {
      draggedId = ''
      row.classList.remove('is-dragging')
      body.querySelectorAll('[data-client-order-row]').forEach((item) => item.classList.remove('is-drag-over'))
    })
    row.addEventListener('dragover', (event) => {
      event.preventDefault()
      if (draggedId && draggedId !== row.dataset.clientOrderRow) row.classList.add('is-drag-over')
    })
    row.addEventListener('dragleave', () => row.classList.remove('is-drag-over'))
    row.addEventListener('drop', async (event) => {
      event.preventDefault()
      row.classList.remove('is-drag-over')
      if (!draggedId || draggedId === row.dataset.clientOrderRow) return
      const fromIndex = state.clients.findIndex((c) => c.id === draggedId)
      const toIndex = state.clients.findIndex((c) => c.id === row.dataset.clientOrderRow)
      await move(fromIndex, toIndex)
    })
  })
}

function renderClients() {
  const body = renderShell('Clients', 'CONTENT MANAGEMENT', 'Arrange clients in the exact public order and control the focal point of each client image.')
  document.getElementById('page-actions').innerHTML = '<button class="solid-btn" data-new-client>New client</button>'
  const sorted = [...state.clients].sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0))
  state.clients = sorted

  body.innerHTML = `
    <section class="panel client-order-panel">
      <div class="panel-head">
        <div><h2>Selected Clients order</h2><p>Drag a client to a new position. The order is saved to Supabase immediately.</p></div>
        <span class="status-pill is-live">LIVE ORDER</span>
      </div>
      <div class="client-order-list" data-client-order-list>
        ${state.clients.map((c, index) => `
          <article class="client-order-row" data-client-order-row="${esc(c.id)}" draggable="true">
            <div class="client-order-handle" title="Drag to reorder">⠿</div>
            <div class="client-order-index">${String(index + 1).padStart(2, '0')}</div>
            <div class="cms-thumb" style="background-image:url('${esc(c.logo_url || c.primary_image_url || '')}')"></div>
            <div class="client-order-main">
              <strong>${esc(c.name)}</strong>
              <span>${esc(c.description || 'No description')} · ${c.published ? 'Published' : 'Draft'}</span>
            </div>
            <div class="client-order-actions">
              <button class="mini-btn" data-edit-client="${esc(c.id)}">Edit</button>
              <button class="mini-btn danger" data-delete-client="${esc(c.id)}">Delete</button>
            </div>
          </article>
        `).join('') || '<div class="empty-state">No clients yet.</div>'}
      </div>
    </section>
    <div id="entity-editor"></div>
  `
  document.getElementById('page-actions')?.querySelector('[data-new-client]')?.addEventListener('click', () => openClientEditor())
  body.querySelectorAll('[data-edit-client]').forEach((b) => b.addEventListener('click', () => openClientEditor(state.clients.find((c) => c.id === b.dataset.editClient))))
  body.querySelectorAll('[data-delete-client]').forEach((b) => b.addEventListener('click', () => deleteEntity('clients', b.dataset.deleteClient)))
  bindClientOrdering(body)
}

function openClientEditor(client = null, options = {}) {
  const editor = document.getElementById('entity-editor')
  const x = clientPositionValue(client, 'image_position_x', 50)
  const y = clientPositionValue(client, 'image_position_y', 50)
  const scale = clientPositionValue(client, 'image_scale', 1)

  editor.innerHTML = `<div class="editor-drawer"><div class="drawer-head"><div><p class="eyebrow">${client ? 'EDIT CLIENT' : 'NEW CLIENT'}</p><h2>${client ? esc(client.name) : 'Add client'}</h2></div><div class="editor-header-actions"><button class="reset-btn" type="button" data-reset-form title="Reset unsaved changes"><span class="reset-icon">↺</span><span>Reset</span></button><button class="ghost-btn" data-close>Close</button></div></div>
  <form id="client-form" class="cms-form">
    <input type="hidden" name="id" value="${esc(client?.id || '')}">
    <div class="form-grid two">${field('Name', 'name', client?.name || '', true)}${field('Slug', 'slug', client?.slug || '')}${field('Year', 'year', client?.year || '', false, '', 'number')}${field('Website URL', 'website_url', client?.website_url || '', false, '', 'url')}</div>
    ${textarea('Description', 'description', client?.description || '', 4)}
    <div class="media-grid two">${mediaField('Logo', 'logo_url', client?.logo_url || '', 'client-logo-file')}${mediaField('Primary image', 'primary_image_url', client?.primary_image_url || '', 'client-primary-file')}</div>

    <div class="client-image-position-editor">
      <div class="form-section-title">Primary image framing</div>
      <p class="form-note">Move the focal point and zoom the public client portrait without editing the source image.</p>
      <div class="client-position-preview" data-position-canvas tabindex="0" aria-label="Drag image to choose the visible focal point">
        <div class="client-position-empty" ${client?.primary_image_url ? 'hidden' : ''}>Upload a primary image to frame it here.</div>
        <img src="${esc(client?.primary_image_url || '')}" alt="" data-position-preview ${client?.primary_image_url ? '' : 'hidden'}>
        <span class="client-position-crosshair" aria-hidden="true"></span>
      </div>
      <div class="form-grid three">
        <label>Horizontal <input type="range" name="image_position_x" min="0" max="100" step="1" value="${x}"><output data-position-x>${x}%</output></label>
        <label>Vertical <input type="range" name="image_position_y" min="0" max="100" step="1" value="${y}"><output data-position-y>${y}%</output></label>
        <label>Scale <input type="range" name="image_scale" min="1" max="1.8" step="0.01" value="${scale}"><output data-position-scale>${scale.toFixed(2)}×</output></label>
      </div>
    </div>

    <label>Gallery URLs <textarea name="gallery_urls" rows="4" placeholder="One URL per line">${esc((client?.gallery || []).join('\n'))}</textarea></label>
    <label>Upload gallery images <input id="client-gallery-files" type="file" accept="image/*" multiple></label>
    <div class="form-grid two"><label class="check-row"><input type="checkbox" name="featured" ${client?.featured ? 'checked' : ''}> Featured</label><label class="check-row"><input type="checkbox" name="published" ${client?.published !== false ? 'checked' : ''}> Published</label></div>
    <div class="form-error" id="editor-error" hidden></div><div class="form-actions"><button type="button" class="ghost-btn" data-close>Cancel</button><button type="submit" class="solid-btn">${client ? 'Save changes' : 'Create client'}</button></div>
  </form></div>`

  const form = editor.querySelector('#client-form')
  const preview = form.querySelector('[data-position-preview]')
  const previewCanvas = form.querySelector('[data-position-canvas]')
  const emptyState = form.querySelector('.client-position-empty')
  const updatePreview = () => {
    const px = Number(form.elements.image_position_x.value)
    const py = Number(form.elements.image_position_y.value)
    const ps = Number(form.elements.image_scale.value)
    if (preview) {
      const rect = previewCanvas?.getBoundingClientRect()
      const maxX = rect ? Math.max(0, (ps - 1) * rect.width * 0.5) : 0
      const maxY = rect ? Math.max(0, (ps - 1) * rect.height * 0.5) : 0
      const tx = ((50 - px) / 50) * maxX
      const ty = ((50 - py) / 50) * maxY
      preview.style.objectPosition = '50% 50%'
      preview.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${ps})`
      preview.hidden = !preview.getAttribute('src')
    }
    if (emptyState) emptyState.hidden = Boolean(preview?.getAttribute('src'))
    form.querySelector('[data-position-x]').textContent = `${px}%`
    form.querySelector('[data-position-y]').textContent = `${py}%`
    form.querySelector('[data-position-scale]').textContent = `${ps.toFixed(2)}×`
  }
  form.querySelectorAll('input[type="range"]').forEach((input) => input.addEventListener('input', updatePreview))

  // Direct manipulation: drag the image inside the crop window. This writes to
  // the same persisted X/Y controls, so the sliders and drag gesture stay synced.
  let drag = null
  previewCanvas?.addEventListener('pointerdown', (event) => {
    if (!preview || preview.hidden) return
    previewCanvas.setPointerCapture?.(event.pointerId)
    drag = { x: event.clientX, y: event.clientY, px: Number(form.elements.image_position_x.value), py: Number(form.elements.image_position_y.value) }
    previewCanvas.classList.add('is-dragging')
  })
  previewCanvas?.addEventListener('pointermove', (event) => {
    if (!drag) return
    const rect = previewCanvas.getBoundingClientRect()
    const scale = Number(form.elements.image_scale.value)
    const sensitivity = 100 / Math.max(120, Math.min(rect.width, rect.height)) / Math.max(1, scale * .82)
    form.elements.image_position_x.value = Math.round(Math.max(0, Math.min(100, drag.px - (event.clientX - drag.x) * sensitivity)))
    form.elements.image_position_y.value = Math.round(Math.max(0, Math.min(100, drag.py - (event.clientY - drag.y) * sensitivity)))
    updatePreview()
  })
  const stopDrag = () => { drag = null; previewCanvas?.classList.remove('is-dragging') }
  previewCanvas?.addEventListener('pointerup', stopDrag)
  previewCanvas?.addEventListener('pointercancel', stopDrag)

  // If an image is uploaded through the file input, show it immediately in the crop editor.
  form.querySelector('#client-primary-file')?.addEventListener('change', (event) => {
    const file = event.target.files?.[0]
    if (!file || !preview) return
    const url = URL.createObjectURL(file)
    preview.src = url
    preview.hidden = false
    if (emptyState) emptyState.hidden = true
    updatePreview()
  })

  updatePreview()
  if (options.focusFrame) requestAnimationFrame(() => form.querySelector('.client-image-position-editor')?.scrollIntoView({ behavior: 'smooth', block: 'center' }))

  editor.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', () => editor.innerHTML = ''))
  form.addEventListener('submit', (event) => saveClient(event, client?.id || ''))
  editor.querySelector('[data-reset-form]')?.addEventListener('click', () => { form.reset(); updatePreview() })
  form.querySelector('input[name="name"]').addEventListener('blur', (e) => { const slug = form.querySelector('input[name="slug"]'); if (!slug.value.trim()) slug.value = slugify(e.target.value) })
}

async function saveClient(event, existingId) {
  event.preventDefault()
  const form = event.currentTarget
  const errorEl = form.querySelector('#editor-error')
  errorEl.hidden = true
  const data = new FormData(form)
  const name = String(data.get('name') || '').trim()
  const slug = slugify(String(data.get('slug') || name))
  if (!name || !slug) { errorEl.textContent = 'Name and slug are required.'; errorEl.hidden = false; return }
  const finishSave = beginSaveFeedback()
  try {
    const logoUpload = await uploadIfPresent(form.querySelector('#client-logo-file'), 'clients/logos', slug)
    const imageUpload = await uploadIfPresent(form.querySelector('#client-primary-file'), 'clients/images', slug)
    const galleryUrls = String(data.get('gallery_urls') || '').split('\n').map((v) => v.trim()).filter(Boolean)
    const galleryFiles = [...(form.querySelector('#client-gallery-files')?.files || [])]
    for (let i = 0; i < galleryFiles.length; i++) {
      const input = document.createElement('input'); input.type = 'file'; input.files = (() => { const dt = new DataTransfer(); dt.items.add(galleryFiles[i]); return dt.files })()
      galleryUrls.push(await uploadIfPresent(input, 'clients/gallery', `${slug}-${i + 1}`))
    }
    const payload = {
      name,
      slug,
      description: String(data.get('description') || '').trim() || null,
      logo_url: logoUpload || String(data.get('logo_url') || '').trim() || null,
      primary_image_url: imageUpload || String(data.get('primary_image_url') || '').trim() || null,
      gallery: galleryUrls,
      website_url: String(data.get('website_url') || '').trim() || null,
      year: data.get('year') ? Number(data.get('year')) : null,
      featured: data.get('featured') === 'on',
      published: data.get('published') === 'on',
      image_position_x: Number(data.get('image_position_x') || 50),
      image_position_y: Number(data.get('image_position_y') || 50),
      image_scale: Number(data.get('image_scale') || 1)
    }
    const query = existingId ? supabase.from('clients').update(payload).eq('id', existingId) : supabase.from('clients').insert(payload)
    const { error } = await query
    if (error) throw error
    await loadState(); finishSave(); renderClients()
  } catch (error) { failSaveFeedback(); errorEl.textContent = error.message; errorEl.hidden = false }
}

function renderServices() {
  const body = renderShell('Services', 'CONTENT MANAGEMENT', 'Manage service names, gradients, artwork and the projects assigned to each service.')
  document.getElementById('page-actions').innerHTML = '<button class="solid-btn" data-new-service>New service</button>'

  body.innerHTML = `<div class="cms-list">${state.services.map((s) => {
    const angle = Number.isFinite(Number(s.gradient_angle)) ? Number(s.gradient_angle) : 135
    const start = s.gradient_start || s.accent || '#c8dcff'
    const end = s.gradient_end || '#111111'
    const assigned = state.projects.filter((p) => p.published).length ? '' : ''
    return `<article class="cms-row">
      <div class="cms-row-main">
        <div class="cms-color" style="--swatch:linear-gradient(${angle}deg, ${esc(start)}, ${esc(end)})"></div>
        <div><strong>${esc(s.title)}</strong><span>${esc(s.description || (s.tags || []).join(' · '))} · ${s.published ? 'Published' : 'Draft'}</span></div>
      </div>
      <div class="cms-row-actions">
        <button class="mini-btn" data-edit-service="${s.id}">Edit</button>
        <button class="mini-btn danger" data-delete-service="${s.id}">Delete</button>
      </div>
    </article>`
  }).join('') || '<div class="empty-state">No services yet. Add your first service.</div>'}</div><div id="entity-editor"></div>`

  document.getElementById('page-actions')?.querySelector('[data-new-service]')?.addEventListener('click', () => openServiceEditor())
  body.querySelectorAll('[data-edit-service]').forEach((button) => {
    button.addEventListener('click', () => {
      const service = state.services.find((item) => item.id === button.dataset.editService)
      if (service) openServiceEditor(service)
    })
  })
  body.querySelectorAll('[data-delete-service]').forEach((button) => {
    button.addEventListener('click', () => deleteEntity('services', button.dataset.deleteService))
  })
}

async function loadExistingProjectChecksForService(editor, serviceId) {
  if (!supabase || !serviceId) return
  const { data, error } = await supabase.from('project_services').select('project_id').eq('service_id', serviceId)
  if (error) return
  const ids = new Set((data || []).map((row) => row.project_id))
  editor.querySelectorAll('input[name="service_project_ids"]').forEach((input) => { input.checked = ids.has(input.value) })
}

function openServiceEditor(service = null) {
  const editor = document.getElementById('entity-editor')
  const assignedProjects = state.projects.filter((project) => project.published)
  editor.innerHTML = `<div class="editor-drawer">
    <div class="drawer-head">
      <div><p class="eyebrow">${service ? 'EDIT SERVICE' : 'NEW SERVICE'}</p><h2>${service ? esc(service.title) : 'Add service'}</h2></div>
      <div class="editor-header-actions"><button class="reset-btn" type="button" data-reset-form title="Reset unsaved changes"><span class="reset-icon">↺</span><span>Reset</span></button><button class="ghost-btn" type="button" data-close>Close</button></div>
    </div>
    <form id="service-form" class="cms-form">
      <input type="hidden" name="id" value="${esc(service?.id || '')}">
      <div class="form-grid two">${field('Title', 'title', service?.title || '', true)}${field('Slug', 'slug', service?.slug || '')}</div>
      ${textarea('Description', 'description', service?.description || '', 3)}
      <label>Tags <input name="tags" value="${esc((service?.tags || []).join(', '))}" placeholder="Systems, type, movement"></label>

      <div class="gradient-editor">
        <div class="gradient-editor-head">
          <div><span class="form-section-title">Visual gradient</span><p>These values control the service row accent and the service artwork background on the public site.</p></div>
          <div class="gradient-preview" id="service-gradient-preview"></div>
        </div>
        <div class="form-grid three">
          ${colorField('Primary colour', 'accent', service?.accent || service?.gradient_start || '#c8dcff')}
          ${colorField('Gradient end', 'gradient_end', service?.gradient_end || service?.gradientEnd || '#111111')}
          ${numberField('Angle (°)', 'gradient_angle', service?.gradient_angle ?? service?.gradientAngle ?? 135)}
        </div>
        <div class="preset-row">
          ${[
            ['#c8dcff','#111827','135','Ice'],
            ['#d7c8ff','#1b1530','145','Violet'],
            ['#ffc9dc','#2a111c','125','Rose'],
            ['#bdebe3','#102522','155','Mint'],
            ['#ffd5b8','#2d1c10','135','Amber'],
            ['#c8f0ff','#11252c','165','Aqua']
          ].map(([a,b,ang,name]) => `<button type="button" class="preset-chip" data-gradient-preset data-start="${a}" data-end="${b}" data-angle="${ang}">${name}</button>`).join('')}
        </div>
      </div>

      ${mediaField('Artwork image (optional)', 'artwork', service?.artwork || '', 'service-artwork-file')}

      <section class="assign-projects">
        <div class="assign-projects-head"><div><span class="form-section-title">Assigned projects</span><p>Select which published work appears on this service page.</p></div><span class="assign-count" id="assigned-project-count">0 selected</span></div>
        <div class="service-project-grid">
          ${assignedProjects.map((project) => `<label class="assign-project-card"><input type="checkbox" name="service_project_ids" value="${project.id}"><span class="assign-project-thumb" style="background-image:url('${esc(project.thumbnail_url || project.poster_url || '')}')"></span><span class="assign-project-copy"><strong>${esc(project.title)}</strong><small>${esc(project.category || 'Project')}</small></span></label>`).join('') || '<div class="form-note">Create and publish a project first.</div>'}
        </div>
      </section>

      <div class="form-grid two">${numberField('Sort order', 'sort_order', service?.sort_order ?? 0)}<label class="check-row"><input type="checkbox" name="published" ${service?.published !== false ? 'checked' : ''}> Published</label></div>
      <div class="form-error" id="editor-error" hidden></div>
      <div class="form-actions"><button type="button" class="ghost-btn" data-close>Cancel</button><button type="submit" class="solid-btn">${service ? 'Save changes' : 'Create service'}</button></div>
    </form>
  </div>`

  editor.querySelectorAll('[data-close]').forEach((button) => button.addEventListener('click', () => { editor.innerHTML = '' }))
  editor.querySelector('#service-form').addEventListener('submit', (event) => saveService(event, service?.id || ''))
  editor.querySelector('[data-reset-form]')?.addEventListener('click', () => {
    const form = editor.querySelector('#service-form')
    form?.reset()
    const fallback = fallbackServices.find((item) => item.slug === service?.slug) || fallbackServices[0]
    if (!service && fallback) {
      const accent = editor.querySelector('[name=\"accent\"]')
      const mirror = editor.querySelector('[data-color-text=\"accent\"]')
      const end = editor.querySelector('[name=\"gradient_end\"]')
      const endMirror = editor.querySelector('[data-color-text=\"gradient_end\"]')
      const angle = editor.querySelector('[name=\"gradient_angle\"]')
      if (accent) accent.value = fallback.gradientStart || fallback.accent
      if (mirror) mirror.value = fallback.gradientStart || fallback.accent
      if (end) end.value = fallback.gradientEnd || '#111111'
      if (endMirror) endMirror.value = fallback.gradientEnd || '#111111'
      if (angle) angle.value = fallback.gradientAngle || 135
    }
    syncColorMirror(editor, 'accent')
    syncColorMirror(editor, 'gradient_end')
    syncGradientPreview()
  })
  editor.querySelector('input[name="title"]')?.addEventListener('blur', (event) => {
    const slug = editor.querySelector('input[name="slug"]')
    if (slug && !slug.value.trim()) slug.value = slugify(event.target.value)
  })

  const preview = editor.querySelector('#service-gradient-preview')
  const updateProjectCount = () => {
    const count = editor.querySelectorAll('input[name="service_project_ids"]:checked').length
    const target = editor.querySelector('#assigned-project-count')
    if (target) target.textContent = `${count} selected`
  }
  const syncGradientPreview = () => {
    const start = editor.querySelector('[name="accent"]')?.value || '#c8dcff'
    const end = editor.querySelector('[name="gradient_end"]')?.value || '#111111'
    const angle = Math.max(0, Math.min(360, Number(editor.querySelector('[name="gradient_angle"]')?.value || 135)))
    if (preview) preview.style.background = `linear-gradient(${angle}deg, ${start}, ${end})`
  }

  editor.querySelectorAll('[name="accent"],[name="gradient_end"],[name="gradient_angle"]').forEach((input) => {
    input.addEventListener('input', () => { syncColorMirror(editor, input.name); syncGradientPreview() })
  })
  editor.querySelectorAll('[data-color-text]').forEach((input) => input.addEventListener('input', () => {
    const color = editor.querySelector(`[name="${input.dataset.colorText}"]`)
    if (/^#[0-9a-fA-F]{6}$/.test(input.value) && color) color.value = input.value
    syncGradientPreview()
  }))
  editor.querySelectorAll('[data-gradient-preset]').forEach((button) => button.addEventListener('click', () => {
    editor.querySelector('[name="accent"]').value = button.dataset.start
    editor.querySelector('[data-color-text="accent"]').value = button.dataset.start
    editor.querySelector('[name="gradient_end"]').value = button.dataset.end
    editor.querySelector('[data-color-text="gradient_end"]').value = button.dataset.end
    editor.querySelector('[name="gradient_angle"]').value = button.dataset.angle
    syncGradientPreview()
  }))
  editor.querySelectorAll('input[name="service_project_ids"]').forEach((input) => input.addEventListener('change', updateProjectCount))

  loadExistingProjectChecksForService(editor, service?.id).finally(() => { updateProjectCount(); syncGradientPreview() })
}

async function saveService(event, existingId) {
  event.preventDefault()
  const form = event.currentTarget
  const errorEl = form.querySelector('#editor-error')
  errorEl.hidden = true
  const data = new FormData(form)
  const title = String(data.get('title') || '').trim()
  const slug = slugify(String(data.get('slug') || title))
  if (!title || !slug) { errorEl.textContent = 'Title and slug are required.'; errorEl.hidden = false; return }

  const finishSave = beginSaveFeedback()
  try {
    const artworkUpload = await uploadIfPresent(form.querySelector('#service-artwork-file'), 'services/artwork', slug)
    const payload = {
      title,
      slug,
      description: String(data.get('description') || '').trim() || null,
      tags: String(data.get('tags') || '').split(',').map((v) => v.trim()).filter(Boolean),
      accent: String(data.get('accent') || '').trim() || '#c8dcff',
      gradient_start: String(data.get('accent') || '').trim() || '#c8dcff',
      gradient_end: String(data.get('gradient_end') || '').trim() || '#111111',
      gradient_angle: Math.max(0, Math.min(360, Number(data.get('gradient_angle') || 135))),
      artwork: artworkUpload || String(data.get('artwork') || '').trim() || null,
      published: data.get('published') === 'on',
      sort_order: Number(data.get('sort_order') || 0)
    }

    let savedId = existingId
    if (existingId) {
      const { error } = await supabase.from('services').update(payload).eq('id', existingId)
      if (error) throw error
    } else {
      const { data: created, error } = await supabase.from('services').insert(payload).select('id').single()
      if (error) throw error
      savedId = created.id
    }

    // The relation is managed from both the Project editor and Service editor.
    const { error: relationDeleteError } = await supabase.from('project_services').delete().eq('service_id', savedId)
    if (relationDeleteError) throw relationDeleteError

    const projectIds = [...form.querySelectorAll('input[name="service_project_ids"]:checked')].map((input) => input.value)
    if (projectIds.length) {
      const { error: relationInsertError } = await supabase.from('project_services').insert(projectIds.map((project_id) => ({ project_id, service_id: savedId })))
      if (relationInsertError) throw relationInsertError
    }

    await loadState()
    finishSave()
    renderServices()
  } catch (error) {
    failSaveFeedback()
    const message = String(error?.message || error || 'Unable to save service.')
    if (/gradient_angle.*schema cache|column .*gradient_angle.*does not exist/i.test(message)) {
      errorEl.innerHTML = 'The Supabase service gradient columns are missing. Run <strong>supabase/004_service_gradients.sql</strong> once in Supabase SQL Editor, then reload Admin.'
    } else {
      errorEl.textContent = message
    }
    errorEl.hidden = false
  }
}

function renderIntro() {
  const body = renderShell('Intro / Hero', 'SITE MANAGEMENT', 'Edit the homepage message and control the intro reel from one focused workspace.')
  const s = state.settings || {}
  body.innerHTML = `<form id="intro-form" class="cms-form panel-inner">
    <div class="intro-form-fields">
      <section class="panel form-panel">
        <div class="panel-head"><div><h2>Hero copy</h2><p>Only the visible headline and eyebrow are managed here.</p></div></div>
        <div class="cms-form">
          <div class="form-grid two">
            ${field('Eyebrow', 'hero_eyebrow', s.hero_eyebrow || '')}
            ${field('Headline line 1', 'hero_title_line_1', s.hero_title_line_1 || '')}
            ${field('Headline line 2', 'hero_title_line_2', s.hero_title_line_2 || '')}
          </div>
        </div>
      </section>

      <section class="panel form-panel">
        <div class="panel-head"><div><h2>Intro video</h2><p>Use a YouTube, Vimeo or direct MP4 URL. The public intro uses a minimal Sutra control layer; provider controls stay off.</p></div></div>
        <div class="cms-form">
          ${field('Video URL', 'intro_video_url', s.intro_video_url || '', false, 'https://youtube.com/watch?v=…', 'url')}
          <div class="form-grid two">
            <label>Video type
              <select name="intro_video_type">
                <option value="" ${!s.intro_video_type ? 'selected' : ''}>Auto detect</option>
                <option value="youtube" ${s.intro_video_type === 'youtube' ? 'selected' : ''}>YouTube</option>
                <option value="vimeo" ${s.intro_video_type === 'vimeo' ? 'selected' : ''}>Vimeo</option>
                <option value="external" ${s.intro_video_type === 'external' ? 'selected' : ''}>Direct MP4</option>
              </select>
            </label>
            ${field('Video title', 'intro_video_title', s.intro_video_title || 'INTRO / REEL')}
            ${field('Meta / duration', 'intro_video_meta', s.intro_video_meta || '00:00 — 00:30')}
          </div>
          <div class="form-grid three">
            <label class="check-row"><input type="checkbox" name="intro_published" ${s.intro_published !== false ? 'checked' : ''}> Published</label>
            <label class="check-row"><input type="checkbox" name="intro_autoplay" ${s.intro_autoplay !== false ? 'checked' : ''}> Autoplay</label>
            <label class="check-row"><input type="checkbox" name="intro_muted" ${s.intro_muted !== false ? 'checked' : ''}> Start muted</label>
          </div>
        </div>
      </section>

      <div class="form-actions"><button class="reset-btn" type="button" data-reset-form title="Reset unsaved changes"><span class="reset-icon">↺</span><span>Reset</span></button><button class="solid-btn" type="submit">Save intro / hero</button></div>
      <div class="form-error" id="editor-error" hidden></div>
    </div>

    <aside class="intro-preview-column">
      <div class="intro-preview-label"><span>LIVE PREVIEW</span><span>16 : 9</span></div>
      <div class="admin-media-preview" id="intro-preview">
        <span>VIDEO PREVIEW</span>
        <div class="intro-preview-caption"><span id="preview-title">${esc(s.intro_video_title || 'INTRO / REEL')}</span><span id="preview-meta">${esc(s.intro_video_meta || '')}</span></div>
      </div>
      <div class="intro-preview-help">The public intro uses a custom Sutra control layer. YouTube/Vimeo provider controls are hidden; the visual treatment stays consistent with the site.</div>
    </aside>
  </form>`

  const introForm = body.querySelector('#intro-form')
  introForm.addEventListener('submit', saveSiteSettings)
  introForm.querySelector('[data-reset-form]')?.addEventListener('click', () => { introForm.reset(); updatePreview() })

  const preview = body.querySelector('#intro-preview')
  const updatePreview = () => {
    preview.querySelectorAll('iframe,video').forEach((node) => {
      if (node.tagName === 'VIDEO') {
        node.pause()
        node.removeAttribute('src')
        node.load()
      }
      node.remove()
    })
    const url = introForm.querySelector('[name="intro_video_url"]').value.trim()
    body.querySelector('#preview-title').textContent = introForm.querySelector('[name="intro_video_title"]').value || 'INTRO / REEL'
    body.querySelector('#preview-meta').textContent = introForm.querySelector('[name="intro_video_meta"]').value || ''
    if (!url) return
    const type = introForm.querySelector('[name="intro_video_type"]').value
    const node = createVideoElement({ url, type, title: 'Intro preview', autoplay: true, muted: true, loop: true, controls: true, className: 'admin-preview-video' })
    if (node) preview.prepend(node)
  }

  introForm.querySelector('[name="intro_video_url"]').addEventListener('input', updatePreview)
  introForm.querySelector('[name="intro_video_type"]').addEventListener('change', updatePreview)
  introForm.querySelector('[name="intro_video_title"]').addEventListener('input', () => body.querySelector('#preview-title').textContent = introForm.querySelector('[name="intro_video_title"]').value || 'INTRO / REEL')
  introForm.querySelector('[name="intro_video_meta"]').addEventListener('input', () => body.querySelector('#preview-meta').textContent = introForm.querySelector('[name="intro_video_meta"]').value || '')
  updatePreview()
}
function renderSettings() {
  const body = renderShell('Site Settings', 'SITE MANAGEMENT', 'Manage contact details, social links and the footer content.')
  const s = state.settings || {}
  body.innerHTML = `<form id="settings-form" class="cms-form panel-inner">
    <div class="form-section"><span class="form-section-title">Contact</span><div class="form-grid two">${field('Owner name', 'owner_name', s.owner_name || '')}${field('Email', 'email', s.email || '', false, '', 'email')}${field('Phone', 'phone', s.phone || '')}${field('Location', 'location', s.location || '')}</div></div>
    <div class="form-section"><span class="form-section-title">Social links</span><div class="form-grid two">${field('Instagram', 'instagram_url', s.instagram_url || '', false, '', 'url')}${field('Facebook', 'facebook_url', s.facebook_url || '', false, '', 'url')}${field('X', 'x_url', s.x_url || '', false, '', 'url')}${field('LinkedIn', 'linkedin_url', s.linkedin_url || '', false, '', 'url')}</div></div>
    <div class="form-section"><span class="form-section-title">Footer</span><div class="form-grid two">${field('Footer tagline', 'footer_tagline', s.footer_tagline || 'MOTION · VIDEO · STORY')}${field('Copyright', 'copyright_text', s.copyright_text || '© 2026 Sujal Kumar. All rights reserved.')}</div></div>
    <div class="form-actions"><button class="reset-btn" type="button" data-reset-form title="Reset unsaved changes"><span class="reset-icon">↺</span><span>Reset</span></button><button class="solid-btn" type="submit">Save site settings</button></div><div class="form-error" id="editor-error" hidden></div>
  </form>`
  body.querySelector('#settings-form').addEventListener('submit', saveSiteSettings)
  body.querySelector('#settings-form').querySelector('[data-reset-form]')?.addEventListener('click', () => body.querySelector('#settings-form')?.reset())
}

async function saveSiteSettings(event) {
  event.preventDefault()
  const form = event.currentTarget
  const errorEl = form.querySelector('#editor-error')
  errorEl.hidden = true
  const data = new FormData(form)
  const payload = Object.fromEntries(data.entries())
  ;['intro_published','intro_autoplay','intro_muted'].forEach((key) => { if (form.querySelector(`[name="${key}"]`)) payload[key] = form.querySelector(`[name="${key}"]`).checked })
  ;['year'].forEach((key) => { if (payload[key] === '') payload[key] = null })
  delete payload.id
  const finishSave = beginSaveFeedback()
  try {
    if (state.settings?.id) {
      const { error } = await supabase.from('site_settings').update(payload).eq('id', state.settings.id)
      if (error) throw error
    } else {
      const { error } = await supabase.from('site_settings').insert(payload)
      if (error) throw error
    }
    await loadState()
    finishSave()
  } catch (error) { failSaveFeedback(); errorEl.textContent = error.message; errorEl.hidden = false }
}

async function deleteEntity(table, id) {
  const item = state[table].find((entry) => entry.id === id)
  if (!item) return
  const label = item.title || item.name || 'this item'
  if (!window.confirm(`Delete “${label}”? This cannot be undone.`)) return
  try {
    if (table === 'services') {
      const { error } = await supabase.from('project_services').delete().eq('service_id', id)
      if (error) throw error
    }
    if (table === 'projects') {
      const { error } = await supabase.from('project_services').delete().eq('project_id', id)
      if (error) throw error
    }
    const { error } = await supabase.from(table).delete().eq('id', id)
    if (error) throw error
    await loadState()
    showToast(`${label} deleted`)
    setPanel(table === 'projects' ? 'projects' : table === 'clients' ? 'clients' : 'services')
  } catch (error) {
    window.alert(error.message || `Unable to delete ${label}.`)
  }
}

function field(label, name, value = '', required = false, placeholder = '', type = 'text') {
  return `<label>${esc(label)}<input name="${esc(name)}" type="${type}" value="${esc(value)}" placeholder="${esc(placeholder)}" ${required ? 'required' : ''}></label>`
}
function numberField(label, name, value = 0) { return field(label, name, value, false, '', 'number') }

function workTypeField(value = '') {
  const options = [
    ['short-form', 'Short Form'],
    ['long-form', 'Long Form'],
    ['commercial', 'Commercial'],
    ['social-reel', 'Social / Reel'],
    ['explainer', 'Explainer'],
    ['product-launch', 'Product / Launch'],
    ['brand-film', 'Brand Film'],
    ['other', 'Other']
  ]
  return `<label>Work type<select name="work_type"><option value="" ${!value ? 'selected' : ''}>Select work type</option>${options.map(([v, label]) => `<option value="${v}" ${value === v ? 'selected' : ''}>${label}</option>`).join('')}</select></label>`
}
function textarea(label, name, value = '', rows = 4) { return `<label>${esc(label)}<textarea name="${esc(name)}" rows="${rows}">${esc(value)}</textarea></label>` }
function mediaField(label, urlName, value = '', fileId = '') { return `<div class="media-input"><label>${esc(label)} URL<input name="${esc(urlName)}" value="${esc(value)}" placeholder="https://..."></label><label>Upload image<input id="${esc(fileId)}" type="file" accept="image/*"></label></div>` }

function colorField(label, name, value = '#c8dcff') {
  return `<label class="color-field">${esc(label)}<span class="color-input-wrap"><input type="color" name="${esc(name)}" value="${esc(value)}"><input type="text" data-color-text="${esc(name)}" value="${esc(value)}" pattern="^#[0-9a-fA-F]{6}$"></span></label>`
}

function syncColorMirror(editor, name) {
  const color = editor.querySelector(`[name="${name}"]`)
  const mirror = editor.querySelector(`[data-color-text="${name}"]`)
  if (color && mirror) mirror.value = color.value
}

function getToast() {
  let toast = document.getElementById('admin-toast')
  if (!toast) {
    toast = document.createElement('div')
    toast.id = 'admin-toast'
    toast.className = 'admin-toast'
    toast.innerHTML = '<span class="admin-toast-spinner" aria-hidden="true"></span><span class="admin-toast-label"></span>'
    document.body.appendChild(toast)
  }
  return toast
}

function showToast(message, kind = 'saved', duration = 1800) {
  const toast = getToast()
  const label = toast.querySelector('.admin-toast-label')
  label.textContent = message
  toast.classList.remove('is-saving', 'is-error')
  if (kind === 'saving') toast.classList.add('is-saving')
  if (kind === 'error') toast.classList.add('is-error')
  toast.classList.add('show')
  clearTimeout(showToast.timer)
  if (duration > 0) showToast.timer = setTimeout(() => toast.classList.remove('show'), duration)
}

function beginSaveFeedback(message = 'Saving changes…') {
  showToast(message, 'saving', 0)
  return () => showToast('Saved', 'saved', 1500)
}

function failSaveFeedback() {
  showToast('Could not save changes', 'error', 2200)
}

async function initialize() {
  await requireAuth()
  if (!supabase || !hasSupabaseConfig) {
    renderShell('Configuration required', 'ADMIN')
    document.getElementById('panel-body').innerHTML = '<div class="empty-state">Supabase is not configured. Put the existing VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY values into .env.local.</div>'
    return
  }
  try { await ensureStarterContent(); await loadState() } catch (error) { console.error(error); window.alert(`Could not load CMS data: ${error.message}`) }
  const panel = location.hash.replace('#', '') || 'overview'
  setPanel(panel)
}

document.querySelectorAll('.admin-nav button[data-panel]').forEach((button) => button.addEventListener('click', () => setPanel(button.dataset.panel)))
document.getElementById('logout').addEventListener('click', async () => { await logoutAdmin(); location.href = './index.html' })
initialize().catch((error) => { if (error.message !== 'Not authenticated') console.error('[sutra] Admin initialization failed', error) })
