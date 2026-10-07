/*
 * Sutra — media control auto-hide
 *
 * Surgical interaction layer only.
 * Does not change video playback, providers, carousel logic, or layout.
 * It simply fades Sutra's custom video controls after a short idle period,
 * then brings them back when the visitor interacts with the media.
 */

(() => {
  const HIDE_DELAY = 4000
  const timers = new WeakMap()
  const bound = new WeakSet()

  function clearTimer(target) {
    const timer = timers.get(target)
    if (timer) clearTimeout(timer)
    timers.delete(target)
  }

  function setVisible(elements) {
    elements.forEach((el) => {
      if (!el) return
      el.style.opacity = '1'
      el.style.pointerEvents = 'auto'
    })
  }

  function setHidden(elements) {
    elements.forEach((el) => {
      if (!el) return
      el.style.opacity = '0'
      el.style.pointerEvents = 'none'
    })
  }

  function scheduleHide(target, elements) {
    clearTimer(target)
    const timer = setTimeout(() => {
      setHidden(elements)
      timers.delete(target)
    }, HIDE_DELAY)
    timers.set(target, timer)
  }

  function reveal(target, elements, autoHide = true) {
    setVisible(elements)
    if (autoHide) scheduleHide(target, elements)
  }

  function bindHero(stage) {
    if (!stage || bound.has(stage)) return
    bound.add(stage)

    const controls = () => [
      stage.querySelector('#heroPlay'),
      stage.querySelector('.hero-brand'),
      stage.querySelector('.hero-video-actions')
    ].filter(Boolean)

    const wake = () => {
      if (!stage.classList.contains('has-video')) return
      reveal(stage, controls())
    }

    stage.addEventListener('pointermove', wake, { passive: true })
    stage.addEventListener('pointerdown', wake, { passive: true })

    const observer = new MutationObserver(() => {
      if (stage.classList.contains('has-video')) {
        // Give the controls a short introduction when the media appears,
        // then let them settle into the clean cinematic state.
        reveal(stage, controls())
      }
    })

    observer.observe(stage, {
      attributes: true,
      attributeFilter: ['class'],
      childList: true,
      subtree: true
    })

    // Catch the moment the existing hero play/mute logic changes state.
    stage.addEventListener('click', (event) => {
      if (!stage.classList.contains('has-video')) return
      if (event.target.closest('#heroPlay, #heroVideoMute')) {
        reveal(stage, controls())
      }
    }, true)
  }

  function bindWorkStage(stage) {
    if (!stage || bound.has(stage)) return
    bound.add(stage)

    const getActiveControls = () => {
      const card = stage.querySelector('.project-card.project-active')
      const controls = card?.querySelector('.project-media-controls')
      return { card, controls }
    }

    const wake = () => {
      const { card, controls } = getActiveControls()
      if (!card || !controls) return
      reveal(controls, [controls])
    }

    stage.addEventListener('pointermove', wake, { passive: true })
    stage.addEventListener('pointerdown', wake, { passive: true })

    stage.addEventListener('click', (event) => {
      if (event.target.closest('.project-media-controls')) wake()
    }, true)

    const observer = new MutationObserver((mutations) => {
      let relevant = false

      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          relevant = true
          break
        }
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'data-sutra-playing'
        ) {
          relevant = true
          break
        }
      }

      if (relevant) {
        const { card, controls } = getActiveControls()
        if (card && controls) {
          // New active media or a playback-state change gets a brief
          // control moment, just like a native video player.
          reveal(controls, [controls])
        }
      }
    })

    observer.observe(stage, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-sutra-playing']
    })
  }

  function init() {
    bindHero(document.getElementById('heroStage'))
    bindWorkStage(document.getElementById('workStage'))
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true })
  } else {
    init()
  }
})()
