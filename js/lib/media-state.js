const MUTE_KEY = 'sutra-global-muted-v1'
const PAUSE_KEY = 'sutra-paused-media-v1'
const WORK_AUTO_KEY = 'sutra-work-auto-locked-v1'

let initialized = false
let globalMuted = true
let pausedMap = {}
let workAutoLocked = false

function readStorage(key, fallback) {
  try {
    const value = sessionStorage.getItem(key)
    return value == null ? fallback : value
  } catch {
    return fallback
  }
}

function readWorkAutoLocked() {
  try { return sessionStorage.getItem(WORK_AUTO_KEY) === '1' } catch { return false }
}

function readPaused() {
  try {
    const raw = sessionStorage.getItem(PAUSE_KEY)
    return raw ? JSON.parse(raw) || {} : {}
  } catch {
    return {}
  }
}

function ensure(defaultMuted = true) {
  if (initialized) return
  const storedMuted = readStorage(MUTE_KEY, null)
  globalMuted = storedMuted == null ? Boolean(defaultMuted) : storedMuted === '1'
  pausedMap = readPaused()
  workAutoLocked = readWorkAutoLocked()
  initialized = true
}

export function initMediaState(defaultMuted = true) {
  ensure(defaultMuted)
  return { muted: globalMuted }
}

export function isGloballyMuted(defaultMuted = true) {
  ensure(defaultMuted)
  return globalMuted
}

export function setGlobalMuted(muted, source = '') {
  ensure(muted)
  globalMuted = Boolean(muted)
  try { sessionStorage.setItem(MUTE_KEY, globalMuted ? '1' : '0') } catch {}
  window.dispatchEvent(new CustomEvent('sutra:global-mute', {
    detail: { muted: globalMuted, source }
  }))
  return globalMuted
}

export function subscribeGlobalMute(handler) {
  if (typeof handler !== 'function') return () => {}
  const listener = (event) => handler(Boolean(event.detail?.muted), event.detail?.source || '')
  window.addEventListener('sutra:global-mute', listener)
  return () => window.removeEventListener('sutra:global-mute', listener)
}

export function mediaPauseKey(scope, id = '') {
  return `${scope}:${id || 'default'}`
}

export function isMediaPaused(key) {
  ensure()
  return Boolean(pausedMap[key])
}

export function setMediaPaused(key, paused) {
  ensure()
  if (paused) pausedMap[key] = true
  else delete pausedMap[key]
  try { sessionStorage.setItem(PAUSE_KEY, JSON.stringify(pausedMap)) } catch {}
}

export function clearMediaPause(key) {
  setMediaPaused(key, false)
}

export function isWorkAutoLocked() {
  ensure()
  return workAutoLocked
}

export function setWorkAutoLocked(locked) {
  ensure()
  workAutoLocked = Boolean(locked)
  try { sessionStorage.setItem(WORK_AUTO_KEY, workAutoLocked ? '1' : '0') } catch {}
}
