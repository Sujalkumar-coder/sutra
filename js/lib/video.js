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
    if (host === 'youtu.be' || host.endsWith('.youtu.be')) {
      return parsed.pathname.split('/').filter(Boolean)[0] || ''
    }
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
    // Autoplaying media in modern browsers is reliably permitted when the player starts muted.
    // The state layer can unmute after the player has started when the visitor has requested sound.
    mute: autoplay ? '1' : (options.muted === false ? '0' : '1'),
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

  if (typeof location !== 'undefined' && /^https?:$/.test(location.protocol)) {
    params.origin = location.origin
  }

  return appendQuery(`https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}`, params)
}

export function vimeoEmbed(url, options = {}) {
  const id = getVimeoId(url)
  if (!id) return ''

  const autoplay = options.autoplay !== false
  const params = {
    autoplay: autoplay ? '1' : '0',
    muted: autoplay ? '1' : (options.muted === false ? '0' : '1'),
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

export function createVideoElement({
  url,
  type,
  title = 'Video',
  autoplay = true,
  muted = true,
  loop = true,
  controls = false,
  poster = '',
  className = 'project-media',
  priority = 'auto'
}) {
  if (!url) return null

  const videoType = detectVideoType(url, type)

  if (videoType === 'youtube' || videoType === 'vimeo') {
    const src = videoType === 'youtube'
      ? youtubeEmbed(url, { autoplay, muted, loop, controls })
      : vimeoEmbed(url, { autoplay, muted, loop, controls, background: controls === false })
    if (!src) return null

    const iframe = document.createElement('iframe')
    iframe.className = className
    iframe.src = src
    iframe.title = title
    iframe.loading = 'eager'
    iframe.setAttribute('fetchpriority', priority === 'high' ? 'high' : 'auto')
    iframe.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture; encrypted-media')
    iframe.setAttribute('allowfullscreen', '')
    iframe.setAttribute('frameborder', '0')
    iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin')
    iframe.dataset.videoProvider = videoType
    iframe.dataset.videoReady = 'false'
    iframe.dataset.command = ''
    iframe.addEventListener('load', () => {
      iframe.dataset.videoReady = 'true'
      iframe.classList.add('is-ready')
      const command = iframe.dataset.command
      if (command === 'play') setTimeout(() => playVideo(iframe), 0)
      else if (command === 'pause') setTimeout(() => pauseVideo(iframe), 0)
      else if (command === 'mute') setTimeout(() => muteVideo(iframe), 0)
      else if (command === 'unmute') setTimeout(() => unmuteVideo(iframe), 0)
      iframe.dispatchEvent(new CustomEvent('sutra:video-ready'))
    })
    if (priority === 'high') iframe.fetchPriority = 'high'
    return iframe
  }

  const video = document.createElement('video')
  video.className = className
  video.autoplay = autoplay
  video.muted = muted
  video.playsInline = true
  video.loop = loop
  video.controls = controls
  // Use auto so the small set of visible carousel videos can warm up before they become active.
  video.preload = 'auto'
  video.setAttribute('aria-label', title)
  if (poster) video.poster = poster
  video.src = url
  video.dataset.videoProvider = 'external'
  video.dataset.videoReady = 'true'
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

function postMessage(element, payload, intent = '', retries = 5) {
  if (!element || element.tagName !== 'IFRAME' || !element.contentWindow) return false
  if (intent) element.dataset.command = intent
  const send = () => {
    try { element.contentWindow.postMessage(JSON.stringify(payload), '*') } catch {}
  }
  if (element.dataset.videoReady === 'true') send()
  else {
    // The load handler will send the command once the provider is actually ready.
    send()
  }
  if (retries > 0) {
    ;[80, 180, 380, 760, 1400].slice(0, retries).forEach((delay) => setTimeout(() => {
      if (document.contains(element) && element.dataset.command !== 'pause') send()
    }, delay))
  }
  return true
}

export function playVideo(element) {
  if (!element) return false
  if (element.tagName === 'VIDEO') {
    element.play().catch(() => {})
    return true
  }
  if (element.dataset.videoProvider === 'youtube') return postMessage(element, { event: 'command', func: 'playVideo', args: [] }, 'play')
  if (element.dataset.videoProvider === 'vimeo') return postMessage(element, { method: 'play' }, 'play')
  return false
}

export function pauseVideo(element) {
  if (!element) return false
  if (element.tagName === 'VIDEO') {
    element.pause()
    return true
  }
  if (element.dataset.videoProvider === 'youtube') return postMessage(element, { event: 'command', func: 'pauseVideo', args: [] }, 'pause')
  if (element.dataset.videoProvider === 'vimeo') return postMessage(element, { method: 'pause' }, 'pause')
  return false
}

export function muteVideo(element) {
  if (!element) return false
  if (element.tagName === 'VIDEO') {
    element.muted = true
    return true
  }
  if (element.dataset.videoProvider === 'youtube') return postMessage(element, { event: 'command', func: 'mute', args: [] }, 'mute')
  if (element.dataset.videoProvider === 'vimeo') return postMessage(element, { method: 'setMuted', value: true }, 'mute')
  return false
}

export function unmuteVideo(element) {
  if (!element) return false
  if (element.tagName === 'VIDEO') {
    element.muted = false
    return true
  }
  if (element.dataset.videoProvider === 'youtube') return postMessage(element, { event: 'command', func: 'unMute', args: [] }, 'unmute')
  if (element.dataset.videoProvider === 'vimeo') return postMessage(element, { method: 'setMuted', value: false }, 'unmute')
  return false
}

export function setVideoMuted(element, muted) {
  return muted ? muteVideo(element) : unmuteVideo(element)
}
