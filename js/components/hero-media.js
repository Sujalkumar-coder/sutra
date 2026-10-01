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

export function initHeroMedia() {
  const stage = document.getElementById('heroStage')
  const media = document.getElementById('heroMedia')
  if (!stage || !media) return

  initMediaState(siteSettings.intro_muted !== false)

  const title = document.getElementById('heroVideoTitle')
  const meta = document.getElementById('heroVideoMeta')
  const playButton = document.getElementById('heroPlay')
  const muteButton = document.getElementById('heroVideoMute')

  const videoUrl = siteSettings.intro_published ? String(siteSettings.intro_video_url || '').trim() : ''
  const type = detectVideoType(videoUrl, siteSettings.intro_video_type || '')
  const autoplay = siteSettings.intro_autoplay !== false
  const label = siteSettings.intro_video_title || 'intro video'
  const pauseKey = mediaPauseKey('intro', 'hero')

  if (title) title.textContent = siteSettings.intro_video_title || 'SUTRA / INTRO'
  if (meta) meta.textContent = siteSettings.intro_video_meta || ''

  if (type === 'youtube') {
    const poster = youtubePoster(videoUrl)
    if (poster) media.style.backgroundImage = `url("${poster}")`
  }

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
    muted: isGloballyMuted(siteSettings.intro_muted !== false),
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

  stage.classList.add('has-video')
  let playing = false
  let inView = false
  let suspendedByVisibility = false
  let userPaused = isMediaPaused(pauseKey)
  let globalMuted = isGloballyMuted(siteSettings.intro_muted !== false)
  const applyMuteState = () => {
    globalMuted ? muteVideo(element) : unmuteVideo(element)
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
    if (userPaused || !autoplay || !inView || document.hidden) return
    playVideo(element)
    playing = true
    refresh()
  }

  const pause = ({ fromUser = false, hard = false } = {}) => {
    if (fromUser) {
      userPaused = true
      setMediaPaused(pauseKey, true)
    }
    pauseVideo(element)
    playing = false
    if (hard && !document.hidden) applyMuteState()
    refresh()
  }

  playButton?.addEventListener('click', (event) => {
    event.preventDefault(); event.stopPropagation()
    if (playing) pause({ fromUser: true })
    else play({ fromUser: true })
  })

  muteButton?.addEventListener('click', (event) => {
    event.preventDefault(); event.stopPropagation()
    setGlobalMuted(!globalMuted, 'hero')
  })

  if (element.tagName === 'VIDEO') {
    element.addEventListener('play', () => { playing = true; refresh() })
    element.addEventListener('pause', () => { playing = false; refresh() })
  }

  element.addEventListener('sutra:video-ready', () => {
    applyMuteState()
    if (!userPaused && autoplay && inView && !document.hidden) play()
  })

  const unsubMute = subscribeGlobalMute((muted) => {
    globalMuted = muted
    applyMuteState()
    refresh()
  })

  const observer = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting && entry.intersectionRatio >= 0.45
    if (!inView) {
      if (playing) pause()
      suspendedByVisibility = true
      muteVideo(element)
      return
    }
    suspendedByVisibility = false
    if (!userPaused && autoplay) {
      applyMuteState()
      play()
    } else {
      applyMuteState()
    }
  }, { threshold: [0, 0.45, 0.75] })
  observer.observe(stage)

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      suspendedByVisibility = true
      if (playing) pause()
      muteVideo(element)
      return
    }
    if (!inView) return
    if (!userPaused && autoplay) {
      applyMuteState()
      play()
    } else {
      applyMuteState()
    }
  })

  // Initial playback: the media can be created before IntersectionObserver emits its first entry.
  requestAnimationFrame(() => {
    const rect = stage.getBoundingClientRect()
    inView = rect.top < innerHeight * 0.75 && rect.bottom > innerHeight * 0.25
    if (!userPaused && autoplay && inView) {
      applyMuteState()
      play()
    } else {
      applyMuteState()
    }
  })

  // A small fallback for providers that take longer than the first iframe load event.
  ;[250, 900].forEach((delay) => setTimeout(() => {
    if (!document.hidden && inView && !userPaused && autoplay) play()
  }, delay))

  refresh()

  // Keep an explicit reference to avoid lint/GC surprises in browsers.
  stage._sutraMediaCleanup = () => { unsubMute(); observer.disconnect() }
  void suspendedByVisibility
}
