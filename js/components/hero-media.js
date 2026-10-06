import { siteSettings } from '../data/site.js'
import {
  attachVideo,
  detectVideoType,
  playVideo,
  pauseVideo,
  muteVideo,
  unmuteVideo,
  youtubePoster
} from '../lib/video.js'
import {
  initMediaState,
  isGloballyMuted,
  setGlobalMuted,
  subscribeGlobalMute,
  isMediaPaused,
  setMediaPaused,
  mediaPauseKey
} from '../lib/media-state.js'

const setPlayButtonState = (button, playing) => {
  if (!button) return
  button.classList.toggle('is-play', !playing)
  button.setAttribute('aria-label', playing ? 'Pause intro video' : 'Play intro video')
}

function installHeroIcons(playButton, muteButton) {
  if (playButton) {
    playButton.innerHTML = `
      <svg class="hero-control-icon hero-play-svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.2v13.6c0 .8.9 1.3 1.6.8l10-6.8a1 1 0 0 0 0-1.6l-10-6.8C8.9 4 8 4.4 8 5.2Z"/></svg>
      <svg class="hero-control-icon hero-pause-svg" viewBox="0 0 24 24" aria-hidden="true"><rect x="6.5" y="5" width="4" height="14" rx="1"/><rect x="13.5" y="5" width="4" height="14" rx="1"/></svg>`
  }
  if (muteButton) {
    muteButton.innerHTML = `<svg class="hero-volume-icon" viewBox="0 0 24 24" aria-hidden="true"><path class="speaker" d="M4 9.5h4l5-4v13l-5-4H4z"/><path class="wave wave-1" d="M16 9a4 4 0 0 1 0 6"/><path class="wave wave-2" d="M18.5 6.8a7 7 0 0 1 0 10.4"/><path class="mute-x" d="M16.5 8.5l5 7M21.5 8.5l-5 7"/></svg>`
  }
}

export function initHeroMedia() {
  const stage = document.getElementById('heroStage')
  const media = document.getElementById('heroMedia')
  if (!stage || !media) return

  initMediaState(siteSettings.intro_muted !== false)

  const title = document.getElementById('heroVideoTitle')
  const meta = document.getElementById('heroVideoMeta')
  const playButton = document.getElementById('heroPlay')
  const muteButton = document.getElementById('heroVideoMute')
  installHeroIcons(playButton, muteButton)

  const videoUrl = siteSettings.intro_published ? String(siteSettings.intro_video_url || '').trim() : ''
  const type = detectVideoType(videoUrl, siteSettings.intro_video_type || '')
  const autoplay = siteSettings.intro_autoplay !== false
  const label = siteSettings.intro_video_title || 'intro video'
  const pauseKey = mediaPauseKey('intro', 'hero')

  if (title) title.textContent = siteSettings.intro_video_title || 'SUTRA / INTRO'
  if (meta) meta.textContent = siteSettings.intro_video_meta || ''

  if (!videoUrl) {
    stage.classList.add('has-placeholder')
    playButton?.remove()
    muteButton?.remove()
    return
  }

  const element = attachVideo(media, {
    url: videoUrl,
    type,
    title: label,
    autoplay,
    muted: true,
    loop: true,
    controls: false,
    poster: type === 'youtube' ? youtubePoster(videoUrl) : '',
    priority: 'high',
    className: 'hero-media-element'
  })

  if (!element) {
    stage.classList.add('has-placeholder')
    playButton?.remove()
    muteButton?.remove()
    return
  }

  stage.classList.add('has-video', 'is-interactive-media')

  let playing = false
  let inView = false
  let userPaused = isMediaPaused(pauseKey)
  let globalMuted = isGloballyMuted(siteSettings.intro_muted !== false)

  const applyMuteState = () => {
    if (globalMuted) muteVideo(element)
    else unmuteVideo(element)
    muteButton?.classList.toggle('is-muted', globalMuted)
    muteButton?.setAttribute('aria-label', globalMuted ? 'Unmute intro video' : 'Mute intro video')
  }

  const refresh = () => {
    setPlayButtonState(playButton, playing)
    muteButton?.classList.toggle('is-muted', globalMuted)
    muteButton?.setAttribute('aria-label', globalMuted ? 'Unmute intro video' : 'Mute intro video')
  }

  const play = ({ fromUser = false } = {}) => {
    if (fromUser) {
      userPaused = false
      setMediaPaused(pauseKey, false)
    }
    // User clicks are allowed to start playback even when autoplay is disabled.
    if ((!fromUser && !autoplay) || !inView || document.hidden || userPaused) return false
    playVideo(element)
    if (fromUser) { playing = true; refresh() }
    return true
  }

  const pause = ({ fromUser = false } = {}) => {
    if (fromUser) {
      userPaused = true
      setMediaPaused(pauseKey, true)
    }
    pauseVideo(element)
    if (fromUser) { playing = false; refresh() }
    return true
  }

  playButton?.addEventListener('click', (event) => {
    event.preventDefault()
    event.stopPropagation()
    if (playing) pause({ fromUser: true })
    else play({ fromUser: true })
  })

  muteButton?.addEventListener('click', (event) => {
    event.preventDefault()
    event.stopPropagation()
    // The click itself is a trusted user gesture, so unmuting is allowed.
    setGlobalMuted(!globalMuted, 'hero')
  })

  // The video surface itself is the primary control. A click anywhere on the
  // image toggles play/pause; the dedicated buttons simply expose the same state.
  stage.addEventListener('click', (event) => {
    if (event.target.closest('#heroPlay, #heroVideoMute, .hero-brand, .hero-video-time')) return
    if (suppressNextClick) { suppressNextClick = false; return }
    if (playing) pause({ fromUser: true })
    else play({ fromUser: true })
  })

  // Some Chromium/embedded-player combinations can swallow a click after the
  // iframe has loaded. The iframe itself is non-interactive, so pointerup on
  // the stage is a reliable final fallback for the whole video surface.
  let suppressNextClick = false
  stage.addEventListener('pointerup', (event) => {
    if (event.target.closest('#heroPlay, #heroVideoMute, .hero-brand, .hero-video-time')) return
    suppressNextClick = true
    if (playing) pause({ fromUser: true })
    else play({ fromUser: true })
    setTimeout(() => { suppressNextClick = false }, 350)
  })

  element.addEventListener('sutra:video-play', () => {
    playing = true
    refresh()
  })
  element.addEventListener('sutra:video-pause', () => {
    playing = false
    refresh()
  })
  element.addEventListener('sutra:video-ready', () => {
    applyMuteState()
    if (!userPaused && autoplay && inView && !document.hidden) play()
  })

  if (element.tagName === 'VIDEO') {
    element.addEventListener('play', () => { playing = true; refresh() })
    element.addEventListener('pause', () => { playing = false; refresh() })
  }

  const unsubMute = subscribeGlobalMute((muted) => {
    globalMuted = muted
    applyMuteState()
    refresh()
  })

  const observer = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting && entry.intersectionRatio >= 0.4
    if (!inView) {
      pause()
      muteVideo(element)
      return
    }
    applyMuteState()
    if (!userPaused && autoplay) play()
  }, { threshold: [0, 0.4, 0.75] })

  observer.observe(stage)

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      pause()
      muteVideo(element)
      return
    }
    if (!inView) return
    applyMuteState()
    if (!userPaused && autoplay) play()
  })

  requestAnimationFrame(() => {
    const rect = stage.getBoundingClientRect()
    inView = rect.top < innerHeight * 0.8 && rect.bottom > innerHeight * 0.2
    applyMuteState()
    if (inView && !userPaused && autoplay) play()
  })

  refresh()
  stage._sutraMediaCleanup = () => { unsubMute(); observer.disconnect() }
}
