import { projects } from '../data/projects.js'
import {
  createVideoElement,
  detectVideoType,
  playVideo,
  pauseVideo,
  muteVideo,
  unmuteVideo,
  youtubePoster,
  destroyVideo
} from '../lib/video.js'
import {
  initMediaState,
  isGloballyMuted,
  setGlobalMuted,
  subscribeGlobalMute,
  isMediaPaused,
  setMediaPaused,
  mediaPauseKey,
  isWorkAutoLocked,
  setWorkAutoLocked
} from '../lib/media-state.js'

const pad = (n) => String(n + 1).padStart(2, '0')
const VISUALS = ['visual-a', 'visual-b', 'visual-c', 'visual-d', 'visual-e', 'visual-f']
const WORK_MANUAL_PAUSE_KEY = 'sutra-work-manual-pause-v3'

function cleanHost(host) {
  host.querySelectorAll('[data-sutra-video], .project-media-controls').forEach((el) => {
    destroyVideo(el)
    el.remove()
  })
}

function getManualWorkPauseKey() {
  try { return sessionStorage.getItem(WORK_MANUAL_PAUSE_KEY) || '' } catch { return '' }
}
function setManualWorkPauseKey(key) {
  try {
    if (key) sessionStorage.setItem(WORK_MANUAL_PAUSE_KEY, key)
    else sessionStorage.removeItem(WORK_MANUAL_PAUSE_KEY)
  } catch {}
}

function getPoster(project) {
  return project.image || project.poster || youtubePoster(project.video || '') || ''
}

function addPosterBackground(visual, project) {
  const src = getPoster(project)
  visual.dataset.src = src
  visual.style.backgroundImage = src ? `url("${src}")` : ''
  visual.classList.toggle('has-media', Boolean(src))
}

function addActiveControls(visual, element, projectKey, getGlobalMuted, onUserPauseChange) {
  const controls = document.createElement('div')
  controls.className = 'project-media-controls'
  controls.innerHTML = `
    <button type="button" class="project-media-btn" data-media-play aria-label="Pause video" title="Play / pause">
      <svg class="media-icon media-play-svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.2v13.6c0 .8.9 1.3 1.6.8l10-6.8a1 1 0 0 0 0-1.6l-10-6.8C8.9 4 8 4.4 8 5.2Z"/></svg>
      <svg class="media-icon media-pause-svg" viewBox="0 0 24 24" aria-hidden="true"><rect x="6.5" y="5" width="4" height="14" rx="1"/><rect x="13.5" y="5" width="4" height="14" rx="1"/></svg>
    </button>
    <button type="button" class="project-media-btn" data-media-mute aria-label="Unmute video" title="Sound">
      <svg class="media-icon media-volume-svg" viewBox="0 0 24 24" aria-hidden="true"><path class="speaker" d="M4 9.5h4l5-4v13l-5-4H4z"/><path class="wave wave-1" d="M16 9a4 4 0 0 1 0 6"/><path class="wave wave-2" d="M18.5 6.8a7 7 0 0 1 0 10.4"/><path class="mute-x" d="M16.5 8.5l5 7M21.5 8.5l-5 7"/></svg>
    </button>
  `
  const playButton = controls.querySelector('[data-media-play]')
  const muteButton = controls.querySelector('[data-media-mute]')
  let playing = false

  const refresh = () => {
    playButton.classList.toggle('is-playing', playing)
    playButton.setAttribute('aria-label', playing ? 'Pause video' : 'Play video')
    const muted = getGlobalMuted()
    muteButton.classList.toggle('is-muted', muted)
    muteButton.setAttribute('aria-label', muted ? 'Unmute video' : 'Mute video')
  }

  playButton.addEventListener('click', (event) => {
    event.preventDefault()
    event.stopPropagation()
    if (playing) {
      pauseVideo(element)
      playing = false
      element.dataset.sutraPlaying = '0'
      setMediaPaused(projectKey, true)
      setManualWorkPauseKey(projectKey)
      setWorkAutoLocked(true)
      onUserPauseChange?.(true)
    } else {
      setMediaPaused(projectKey, false)
      if (getManualWorkPauseKey() === projectKey) setManualWorkPauseKey('')
      setWorkAutoLocked(false)
      onUserPauseChange?.(false)
      playVideo(element)
      playing = true
      element.dataset.sutraPlaying = '1'
    }
    refresh()
  })

  muteButton.addEventListener('click', (event) => {
    event.preventDefault()
    event.stopPropagation()
    setGlobalMuted(!getGlobalMuted(), 'work')
  })

  element.addEventListener('sutra:video-play', () => {
    playing = true
    element.dataset.sutraPlaying = '1'
    refresh()
  })
  element.addEventListener('sutra:video-pause', () => {
    playing = false
    element.dataset.sutraPlaying = '0'
    refresh()
  })

  visual.appendChild(controls)

  // The embedded player is intentionally non-interactive so the carousel can
  // own its controls. Replace the surface handler on every recycle so handlers
  // never accumulate on the same physical card.
  visual._sutraSurfaceHandler && visual.removeEventListener('click', visual._sutraSurfaceHandler)
  visual._sutraSurfaceHandler = (event) => {
    if (event.target.closest('.project-media-controls') || !visual.closest('.project-active')) return
    const paused = !playing
    if (paused) {
      setMediaPaused(projectKey, false)
      if (getManualWorkPauseKey() === projectKey) setManualWorkPauseKey('')
      setWorkAutoLocked(false)
      onUserPauseChange?.(false)
      playVideo(element)
    } else {
      pauseVideo(element)
      setMediaPaused(projectKey, true)
      setManualWorkPauseKey(projectKey)
      setWorkAutoLocked(true)
      onUserPauseChange?.(true)
    }
  }
  visual.addEventListener('click', visual._sutraSurfaceHandler)

  refresh()
}

export function initWorkCarousel() {
  const stage = document.getElementById('workStage')
  if (!stage) return

  const cards = [...stage.querySelectorAll('.project-card')]
  const positions = ['gone-left', 'far-left', 'prev', 'active', 'next', 'far-right', 'gone-right']
  const N = projects.length

  if (!N || cards.length !== positions.length) {
    stage.classList.add('is-empty')
    return
  }

  initMediaState(true)

  // Shorter travel, but enough time for a deliberate premium transition.
  const DURATION = 620
  const AUTO_DELAY = 3600
  const INTRO_MOVES = Math.min(2, N - 1)
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches

  const cat = document.getElementById('projectCategory')
  const titleLink = document.getElementById('projectTitleLink')
  const desc = document.getElementById('projectDescription')
  const cur = document.getElementById('projectCurrent')
  const total = document.getElementById('projectTotal')
  const mod = (i) => ((i % N) + N) % N

  let activeIndex = 0
  let busy = false
  let queued = null
  let introMoves = 0
  let introTimer = 0
  let inView = false
  let activeUserPaused = false
  let globalMuted = isGloballyMuted(true)
  let infoVersion = 0

  const order = [...cards]

  const currentProjectKey = () => mediaPauseKey('work', projects[activeIndex]?.id || projects[activeIndex]?.slug || activeIndex)

  function fill(card, index, live = true) {
    const i = mod(index)
    const project = projects[i]
    const visual = card.querySelector('.project-visual')
    if (!visual || !project) return

    cleanHost(visual)
    visual.className = `project-visual ${VISUALS[i % VISUALS.length]}`
    const label = document.createElement('span')
    label.textContent = pad(i)
    visual.appendChild(label)
    addPosterBackground(visual, project)

    if (!project.video || !live) return

    const element = createVideoElement({
      url: project.video,
      type: detectVideoType(project.video, project.videoType),
      title: project.title || 'Project video',
      autoplay: false,
      muted: true,
      loop: true,
      controls: false,
      poster: project.poster || project.image || youtubePoster(project.video),
      priority: 'high',
      className: 'project-media'
    })
    if (!element) return

    element.dataset.sutraVideo = 'true'
    element.dataset.projectIndex = String(i)
    element.dataset.sutraPlaying = '0'
    visual.appendChild(element)

    addActiveControls(
      visual,
      element,
      mediaPauseKey('work', project.id || project.slug || i),
      () => globalMuted,
      (paused) => {
        if (i !== activeIndex) return
        activeUserPaused = paused
        introDoneState = true
        stopAuto()
        if (paused) {
          setManualWorkPauseKey(mediaPauseKey('work', project.id || project.slug || i))
          setWorkAutoLocked(true)
        } else {
          const key = mediaPauseKey('work', project.id || project.slug || i)
          if (getManualWorkPauseKey() === key) setManualWorkPauseKey('')
          setWorkAutoLocked(false)
        }
      }
    )
  }

  function syncGlobalMute() {
    globalMuted = isGloballyMuted(true)
    order.forEach((card) => {
      const element = card.querySelector('[data-sutra-video]')
      if (!element) return
      if (globalMuted || !card.classList.contains('project-active')) muteVideo(element)
      else unmuteVideo(element)

      const button = card.querySelector('[data-media-mute]')
      button?.classList.toggle('is-muted', globalMuted)
      button?.setAttribute('aria-label', globalMuted ? 'Unmute video' : 'Mute video')
    })
  }

  function assign() {
    order.forEach((card, slot) => {
      const position = positions[slot]
      card.className = `project-card project-${position}`
      card.dataset.carouselPosition = position
    })
  }

  function reconcileMedia() {
    order.forEach((card, slot) => {
      const position = positions[slot]
      const shouldLive = position === 'prev' || position === 'active' || position === 'next' || position === 'far-right'
      const current = card.querySelector('[data-sutra-video]')
      const projectIndex = Number(current?.dataset.projectIndex)
      if (!shouldLive) {
        if (current) cleanHost(card.querySelector('.project-visual'))
        return
      }
      const expected = mod(activeIndex + slot - 3)
      if (!Number.isFinite(projectIndex) || projectIndex !== expected || !current) {
        fill(card, expected, true)
      }
    })
  }

  function setInfo(project, index, animate = false) {
    if (!project) return
    if (cat) cat.textContent = project.category || ''
    if (desc) desc.textContent = project.desc || ''
    if (cur) cur.textContent = pad(index)
    stage.style.setProperty('--p', (index + 1) / N)

    const href = project.slug ? `./project.html?slug=${encodeURIComponent(project.slug)}` : ''
    if (titleLink) {
      titleLink.textContent = project.title || ''
      titleLink.href = href || '#'
      titleLink.setAttribute('aria-disabled', href ? 'false' : 'true')
    }

    if (animate) {
      const els = [cat, titleLink, desc].filter(Boolean)
      els.forEach((el) => {
        el.getAnimations?.().forEach((a) => a.cancel())
        el.animate(
          [{ opacity: .45, transform: 'translateY(3px)' }, { opacity: 1, transform: 'translateY(0)' }],
          { duration: 260, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'both' }
        )
      })
    }
  }

  function syncInfoFromActiveCard(animate = false) {
    setInfo(projects[activeIndex], activeIndex, animate)
  }

  function syncPlayback() {
    const activeKey = currentProjectKey()
    activeUserPaused = isMediaPaused(activeKey) || getManualWorkPauseKey() === activeKey
    const globallyLocked = isWorkAutoLocked()

    order.forEach((card) => {
      const element = card.querySelector('[data-sutra-video]')
      if (!element) return
      const isActive = card.classList.contains('project-active')
      const allowed = isActive && inView && !document.hidden && !busy && !activeUserPaused && !globallyLocked

      if (!allowed) {
        pauseVideo(element)
        muteVideo(element)
        element.dataset.sutraPlaying = '0'
      } else {
        globalMuted ? muteVideo(element) : unmuteVideo(element)
        playVideo(element)
        element.dataset.sutraPlaying = '1'
      }

      const playButton = card.querySelector('[data-media-play]')
      if (playButton) {
        playButton.classList.toggle('is-playing', allowed && !activeUserPaused)
        playButton.setAttribute('aria-label', allowed && !activeUserPaused ? 'Pause video' : 'Play video')
      }
    })
  }

  function stopAuto() {
    clearTimeout(introTimer)
    introTimer = 0
  }

  function step(dir, auto = false) {
    if (N < 2) return
    if (busy) {
      queued = { dir, auto }
      return
    }

    const activeKey = currentProjectKey()
    if (auto && (activeUserPaused || isMediaPaused(activeKey) || getManualWorkPauseKey() === activeKey || isWorkAutoLocked())) {
      stopAuto()
      return
    }

    busy = true
    stopAuto()
    syncPlayback()

    // Recycle one physical DOM card. The logical index and the card order are updated together.
    const recycled = dir > 0 ? order.shift() : order.pop()
    recycled.style.transition = 'none'

    const newIndex = mod(activeIndex + dir)
    const recycledIndex = dir > 0 ? activeIndex + 4 : activeIndex - 4
    fill(recycled, recycledIndex, false)

    if (dir > 0) order.push(recycled)
    else order.unshift(recycled)

    recycled.className = `project-card project-${dir > 0 ? 'gone-right' : 'gone-left'}`
    void recycled.offsetWidth
    recycled.style.transition = ''

    activeIndex = newIndex
    assign()
    reconcileMedia()

    activeUserPaused = isMediaPaused(currentProjectKey()) || getManualWorkPauseKey() === currentProjectKey()
    syncInfoFromActiveCard(true)
    syncGlobalMute()

    // The new active card is already the previous "next" card, so its player has had time to load.
    requestAnimationFrame(() => syncPlayback())

    setTimeout(() => {
      busy = false
      activeUserPaused = isMediaPaused(currentProjectKey()) || getManualWorkPauseKey() === currentProjectKey()
      syncGlobalMute()
      syncPlayback()

      if (queued) {
        const next = queued
        queued = null
        if (!(next.auto && (activeUserPaused || isMediaPaused(currentProjectKey()) || getManualWorkPauseKey() === currentProjectKey() || isWorkAutoLocked()))) {
          step(next.dir, next.auto)
          return
        }
        stopAuto()
      }

      if (!activeUserPaused && !isWorkAutoLocked() && !reduceMotion && inView && !introDoneState) scheduleIntro()
    }, DURATION + 30)
  }

  let introDoneState = reduceMotion || N < 2

  function scheduleIntro() {
    stopAuto()
    if (introDoneState || isWorkAutoLocked() || !inView || document.hidden || activeUserPaused) return
    introTimer = setTimeout(() => {
      if (!document.hidden && inView && !busy && !isMediaPaused(currentProjectKey()) && getManualWorkPauseKey() !== currentProjectKey() && !isWorkAutoLocked()) {
        step(1, true)
        introMoves += 1
        if (introMoves >= INTRO_MOVES) introDoneState = true
        else scheduleIntro()
      }
    }, AUTO_DELAY)
  }

  function manual(dir) {
    introDoneState = true
    stopAuto()
    setWorkAutoLocked(false)
    step(dir, false)
  }

  order.forEach((card, slot) => fill(card, activeIndex + slot - 3, slot >= 2 && slot <= 5))
  assign()
  reconcileMedia()
  syncInfoFromActiveCard(false)

  activeUserPaused = isMediaPaused(currentProjectKey()) || getManualWorkPauseKey() === currentProjectKey()
  setWorkAutoLocked(activeUserPaused)

  document.getElementById('prevProject')?.addEventListener('click', () => manual(-1))
  document.getElementById('nextProject')?.addEventListener('click', () => manual(1))

  stage.tabIndex = 0
  stage.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); manual(1) }
    if (e.key === 'ArrowLeft') { e.preventDefault(); manual(-1) }
  })

  let wheelLock = false
  stage.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaY) < 10 || wheelLock || busy) return
    const r = stage.getBoundingClientRect()
    if (r.top < innerHeight * .82 && r.bottom > innerHeight * .18) {
      e.preventDefault()
      wheelLock = true
      manual(e.deltaY > 0 ? 1 : -1)
      setTimeout(() => { wheelLock = false }, DURATION)
    }
  }, { passive: false })

  const unsubMute = subscribeGlobalMute((muted) => {
    globalMuted = muted
    syncGlobalMute()
    syncPlayback()
  })

  const observer = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting && entry.intersectionRatio >= .4
    if (!inView) {
      stopAuto()
      order.forEach((card) => {
        const element = card.querySelector('[data-sutra-video]')
        if (element) {
          pauseVideo(element)
          muteVideo(element)
          element.dataset.sutraPlaying = '0'
        }
      })
      return
    }

    activeUserPaused = isMediaPaused(currentProjectKey()) || getManualWorkPauseKey() === currentProjectKey()
    setWorkAutoLocked(activeUserPaused)
    syncGlobalMute()
    syncPlayback()
    if (!activeUserPaused) scheduleIntro()
  }, { threshold: [0, .4, .7] })
  observer.observe(stage)

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAuto()
      order.forEach((card) => {
        const element = card.querySelector('[data-sutra-video]')
        if (element) { pauseVideo(element); muteVideo(element); element.dataset.sutraPlaying = '0' }
      })
    } else if (inView) {
      activeUserPaused = isMediaPaused(currentProjectKey()) || getManualWorkPauseKey() === currentProjectKey()
      setWorkAutoLocked(activeUserPaused)
      syncGlobalMute()
      syncPlayback()
      if (!activeUserPaused) scheduleIntro()
    }
  })

  // Give the observer an initial chance even when the section was already visible.
  requestAnimationFrame(() => {
    const r = stage.getBoundingClientRect()
    inView = r.top < innerHeight * .8 && r.bottom > innerHeight * .2
    if (inView) {
      syncGlobalMute()
      syncPlayback()
      if (!activeUserPaused) scheduleIntro()
    }
  })

  syncGlobalMute()

  stage._sutraMediaCleanup = () => {
    unsubMute()
    observer.disconnect()
    stopAuto()
  }
}
