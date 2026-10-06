const normalizeType = (type = '') => {
  const value = String(type).trim().toLowerCase()
  if (value === 'mp4' || value === 'video' || value === 'direct') return 'external'
  if (['youtube', 'vimeo', 'external'].includes(value)) return value
  return ''
}

export function detectVideoType(url = '', explicitType = '') {
  const explicit = normalizeType(explicitType)
  if (explicit) return explicit
  const value = String(url).trim().toLowerCase()
  if (value.includes('youtube.com') || value.includes('youtu.be')) return 'youtube'
  if (value.includes('vimeo.com')) return 'vimeo'
  return 'external'
}

function appendQuery(url, params) {
  const search = new URLSearchParams(params)
  return `${url}${url.includes('?') ? '&' : '?'}${search.toString()}`
}

function getYouTubeId(url) {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname.toLowerCase()
    if (host === 'youtu.be' || host.endsWith('.youtu.be')) return parsed.pathname.split('/').filter(Boolean)[0] || ''
    if (host.includes('youtube.com')) {
      const parts = parsed.pathname.split('/').filter(Boolean)
      if (parsed.pathname.startsWith('/embed/')) return parts[1] || ''
      if (parsed.pathname.startsWith('/shorts/')) return parts[1] || ''
      return parsed.searchParams.get('v') || ''
    }
  } catch {}
  return ''
}

function getVimeoId(url) {
  try {
    const parsed = new URL(url)
    if (!parsed.hostname.toLowerCase().includes('vimeo.com')) return ''
    const parts = parsed.pathname.split('/').filter(Boolean)
    return [...parts].reverse().find((part) => /^\d+$/.test(part)) || ''
  } catch {}
  return ''
}

export function youtubePoster(url = '') {
  const id = getYouTubeId(url)
  return id ? `https://i.ytimg.com/vi/${encodeURIComponent(id)}/hqdefault.jpg` : ''
}

export function youtubeEmbed(url, options = {}) {
  const id = getYouTubeId(url)
  if (!id) return ''
  const autoplay = options.autoplay !== false
  const params = {
    autoplay: autoplay ? '1' : '0',
    mute: '1',
    playsinline: '1',
    rel: '0',
    modestbranding: '1',
    controls: options.controls === false ? '0' : '1',
    fs: options.controls === false ? '0' : '1',
    iv_load_policy: '3',
    disablekb: options.controls === false ? '1' : '0',
    enablejsapi: '1'
  }
  if (options.loop) {
    params.loop = '1'
    params.playlist = id
  }
  if (typeof location !== 'undefined' && /^https?:$/.test(location.protocol)) params.origin = location.origin
  return appendQuery(`https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}`, params)
}

export function vimeoEmbed(url, options = {}) {
  const id = getVimeoId(url)
  if (!id) return ''
  const autoplay = options.autoplay !== false
  const params = {
    autoplay: autoplay ? '1' : '0',
    muted: '1',
    playsinline: '1',
    controls: options.controls === false ? '0' : '1',
    api: '1',
    title: '0',
    byline: '0',
    portrait: '0'
  }
  if (options.loop) params.loop = '1'
  if (options.background) params.background = '1'
  return appendQuery(`https://player.vimeo.com/video/${id}`, params)
}

/*
 * YouTube's iframe "load" event means the iframe document loaded, not that
 * the YouTube player is ready to receive commands.  The small adapter below
 * upgrades each iframe to a real YT.Player and queues commands until ready.
 */
let ytApiPromise = null
const ytPlayers = new WeakMap()
const ytQueues = new WeakMap()
const ytPending = new WeakSet()

function loadYouTubeApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT)
  if (ytApiPromise) return ytApiPromise

  ytApiPromise = new Promise((resolve) => {
    let settled = false
    const finish = () => {
      if (settled) return
      settled = true
      resolve(window.YT || null)
    }
    const previous = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      previous?.()
      finish()
    }
    const existing = document.querySelector('script[data-sutra-youtube-api]')
    if (!existing) {
      const script = document.createElement('script')
      script.src = 'https://www.youtube.com/iframe_api'
      script.async = true
      script.dataset.sutraYoutubeApi = 'true'
      document.head.appendChild(script)
    }
    // Never let a blocked API request stall the media lifecycle forever.
    setTimeout(finish, 7000)
  })
  return ytApiPromise
}

function flushYT(element, player) {
  const queue = ytQueues.get(element) || []
  ytQueues.delete(element)
  queue.forEach(({ action }) => {
    try { player[action]() } catch {}
  })
}

function upgradeYouTube(element) {
  if (!element || element.dataset.videoProvider !== 'youtube' || ytPlayers.has(element) || ytPending.has(element)) return
  ytPending.add(element)
  const queue = ytQueues.get(element) || []
  ytQueues.set(element, queue)

  loadYouTubeApi().then((YT) => {
    if (!YT?.Player) { ytPending.delete(element); return }
    if (!document.contains(element) || ytPlayers.has(element)) { ytPending.delete(element); return }
    try {
      const player = new YT.Player(element, {
        events: {
          onReady: () => {
            ytPlayers.set(element, player)
            element.dataset.videoReady = 'true'
            element.classList.add('is-ready')
            flushYT(element, player)
            element.dispatchEvent(new CustomEvent('sutra:video-ready'))
          },
          onStateChange: (event) => {
            if (event.data === 1) element.dispatchEvent(new CustomEvent('sutra:video-play'))
            if (event.data === 2 || event.data === 0 || event.data === 5) element.dispatchEvent(new CustomEvent('sutra:video-pause'))
          }
        }
      })
      // Commands remain queued until onReady.
    } catch {
      ytPending.delete(element)
      // Keep the postMessage fallback available if the API is unavailable.
    }
  }).catch(() => {})
}

export function createVideoElement({
  url, type, title = 'Video', autoplay = true, muted = true, loop = true,
  controls = false, poster = '', className = 'project-media', priority = 'auto'
}) {
  if (!url) return null
  const videoType = detectVideoType(url, type)

  if (videoType === 'youtube' || videoType === 'vimeo') {
    const src = videoType === 'youtube'
      ? youtubeEmbed(url, { autoplay, muted, loop, controls })
      : vimeoEmbed(url, { autoplay, muted, loop, controls, background: controls === false })
    if (!src) return null

    const iframe = document.createElement('iframe')
    iframe.className = `${className} project-video-iframe`
    iframe.src = src
    iframe.title = title
    iframe.loading = priority === 'high' ? 'eager' : 'lazy'
    iframe.setAttribute('fetchpriority', priority === 'high' ? 'high' : 'auto')
    iframe.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture; encrypted-media')
    iframe.setAttribute('allowfullscreen', '')
    iframe.setAttribute('frameborder', '0')
    iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin')
    iframe.dataset.videoProvider = videoType
    iframe.dataset.videoReady = 'false'
    iframe.dataset.command = ''
    iframe.addEventListener('load', () => {
      iframe.classList.add('is-loaded')
      if (videoType === 'youtube') {
        upgradeYouTube(iframe)
      } else {
        iframe.dataset.videoReady = 'true'
        iframe.classList.add('is-ready')
        iframe.dispatchEvent(new CustomEvent('sutra:video-ready'))
      }
    }, { once: true })
    if (poster) iframe.dataset.poster = poster
    return iframe
  }

  const video = document.createElement('video')
  video.className = className
  video.autoplay = autoplay
  video.muted = muted
  video.playsInline = true
  video.loop = loop
  video.controls = controls
  video.preload = 'auto'
  video.setAttribute('aria-label', title)
  if (poster) video.poster = poster
  video.src = url
  video.dataset.videoProvider = 'external'
  video.dataset.videoReady = 'false'
  video.addEventListener('loadeddata', () => {
    video.dataset.videoReady = 'true'
    video.classList.add('is-ready')
    video.dispatchEvent(new CustomEvent('sutra:video-ready'))
  }, { once: true })
  return video
}

export function attachVideo(host, options) {
  if (!host) return null
  host.querySelectorAll('[data-sutra-video]').forEach((node) => node.remove())
  const element = createVideoElement(options)
  if (!element) return null
  element.dataset.sutraVideo = 'true'
  host.appendChild(element)
  if (element.tagName === 'VIDEO' && options.autoplay !== false) element.play().catch(() => {})
  return element
}

function postMessage(element, payload, intent = '') {
  if (!element?.contentWindow) return false
  if (intent) element.dataset.command = intent
  try { element.contentWindow.postMessage(JSON.stringify(payload), '*') } catch {}
  return true
}

function queueYT(element, action) {
  const player = ytPlayers.get(element)
  if (player) {
    try { player[action]() } catch {}
    return true
  }
  const queue = ytQueues.get(element) || []
  const groups = {
    playVideo: ['playVideo', 'pauseVideo'],
    pauseVideo: ['playVideo', 'pauseVideo'],
    mute: ['mute', 'unMute'],
    unMute: ['mute', 'unMute']
  }
  const collapse = groups[action] || [action]
  for (let i = queue.length - 1; i >= 0; i--) {
    if (collapse.includes(queue[i].action)) queue.splice(i, 1)
  }
  queue.push({ action })
  ytQueues.set(element, queue)
  upgradeYouTube(element)
  return false
}

export function playVideo(element) {
  if (!element) return false
  if (element.tagName === 'VIDEO') {
    element.play().catch(() => {})
    return true
  }
  if (element.dataset.videoProvider === 'youtube') {
    const ready = queueYT(element, 'playVideo')
    postMessage(element, { event: 'command', func: 'playVideo', args: [] }, 'play')
    return ready || true
  }
  if (element.dataset.videoProvider === 'vimeo') return postMessage(element, { method: 'play' }, 'play')
  return false
}

export function pauseVideo(element) {
  if (!element) return false
  if (element.tagName === 'VIDEO') { element.pause(); return true }
  if (element.dataset.videoProvider === 'youtube') {
    const ready = queueYT(element, 'pauseVideo')
    postMessage(element, { event: 'command', func: 'pauseVideo', args: [] }, 'pause')
    return ready || true
  }
  if (element.dataset.videoProvider === 'vimeo') return postMessage(element, { method: 'pause' }, 'pause')
  return false
}

export function muteVideo(element) {
  if (!element) return false
  if (element.tagName === 'VIDEO') { element.muted = true; return true }
  if (element.dataset.videoProvider === 'youtube') {
    const player = ytPlayers.get(element)
    if (player) { try { player.mute() } catch {} }
    else queueYT(element, 'mute')
    postMessage(element, { event: 'command', func: 'mute', args: [] }, 'mute')
    return true
  }
  if (element.dataset.videoProvider === 'vimeo') return postMessage(element, { method: 'setMuted', value: true }, 'mute')
  return false
}

export function unmuteVideo(element) {
  if (!element) return false
  if (element.tagName === 'VIDEO') { element.muted = false; return true }
  if (element.dataset.videoProvider === 'youtube') {
    const player = ytPlayers.get(element)
    if (player) { try { player.unMute() } catch {} }
    else queueYT(element, 'unMute')
    postMessage(element, { event: 'command', func: 'unMute', args: [] }, 'unmute')
    return true
  }
  if (element.dataset.videoProvider === 'vimeo') return postMessage(element, { method: 'setMuted', value: false }, 'unmute')
  return false
}

export function setVideoMuted(element, muted) {
  return muted ? muteVideo(element) : unmuteVideo(element)
}


export function destroyVideo(element) {
  if (!element) return
  if (element.tagName === 'VIDEO') {
    try { element.pause() } catch {}
    element.removeAttribute('src')
    try { element.load() } catch {}
    return
  }
  if (element.dataset.videoProvider === 'youtube') {
    const player = ytPlayers.get(element)
    if (player) {
      try { player.destroy() } catch {}
      ytPlayers.delete(element)
    }
    ytQueues.delete(element)
    ytPending.delete(element)
  }
}
