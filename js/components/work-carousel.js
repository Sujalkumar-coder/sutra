import { projects } from '../data/projects.js'
import {
  createVideoElement,
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
  mediaPauseKey,
  isWorkAutoLocked,
  setWorkAutoLocked
} from '../lib/media-state.js'

const pad = (n) => String(n + 1).padStart(2, '0')
const VISUALS = ['visual-a', 'visual-b', 'visual-c', 'visual-d', 'visual-e', 'visual-f']

const WORK_MANUAL_PAUSE_KEY = 'sutra-work-manual-pause-v2'

function cleanHost(host) {
  host.querySelectorAll('[data-sutra-video], .project-media-controls').forEach((el) => {
    if (el.tagName === 'VIDEO') {
      el.pause()
      el.removeAttribute('src')
      el.load()
    }
    el.remove()
  })
}

/*
 * Explicitly remembers which Work project the user manually paused.
 * This is separate from the generic media pause map so the carousel
 * cannot confuse "section temporarily left viewport" with "user paused."
 */
function getManualWorkPauseKey() {
  try {
    return sessionStorage.getItem(WORK_MANUAL_PAUSE_KEY) || ''
  } catch {
    return ''
  }
}

function setManualWorkPauseKey(key) {
  try {
    if (key) {
      sessionStorage.setItem(WORK_MANUAL_PAUSE_KEY, key)
    } else {
      sessionStorage.removeItem(WORK_MANUAL_PAUSE_KEY)
    }
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

function addActiveControls(
  visual,
  element,
  projectKey,
  getGlobalMuted,
  onUserPauseChange
) {
  const controls = document.createElement('div')

  controls.className = 'project-media-controls'

  controls.innerHTML = `
    <button
      type="button"
      class="project-media-btn"
      data-media-play
      aria-label="Pause video"
      title="Play / pause"
    >
      <span class="media-pause-icon"></span>
    </button>

    <button
      type="button"
      class="project-media-btn"
      data-media-mute
      aria-label="Unmute video"
      title="Sound"
    >
      <span class="media-sound-icon"></span>
    </button>
  `

  const playButton = controls.querySelector('[data-media-play]')
  const muteButton = controls.querySelector('[data-media-mute]')

  let playing = element.dataset.sutraPlaying === '1'
  let muted = getGlobalMuted()

  const refresh = () => {
    playButton.innerHTML = `
      <span class="media-pause-icon ${playing ? '' : 'is-play'}"></span>
    `

    playButton.setAttribute(
      'aria-label',
      playing ? 'Pause video' : 'Play video'
    )

    muteButton.innerHTML = `
      <span class="media-sound-icon ${muted ? 'is-muted' : ''}"></span>
    `

    muteButton.setAttribute(
      'aria-label',
      muted ? 'Unmute video' : 'Mute video'
    )
  }

  playButton.addEventListener('click', (event) => {
    event.preventDefault()
    event.stopPropagation()

    playing = element.dataset.sutraPlaying === '1'

    if (playing) {
      /*
       * USER INTENTION:
       * This is a real manual pause.
       * It survives scrolling away and returning.
       */
      pauseVideo(element)

      playing = false
      element.dataset.sutraPlaying = '0'

      setMediaPaused(projectKey, true)
      setManualWorkPauseKey(projectKey)
      setWorkAutoLocked(true)

      onUserPauseChange?.(true)
    } else {
      /*
       * USER INTENTION:
       * Explicit play releases the manual pause lock.
       */
      playVideo(element)

      playing = true
      element.dataset.sutraPlaying = '1'

      setMediaPaused(projectKey, false)

      if (getManualWorkPauseKey() === projectKey) {
        setManualWorkPauseKey('')
      }

      setWorkAutoLocked(false)

      onUserPauseChange?.(false)
    }

    refresh()
  })

  muteButton.addEventListener('click', (event) => {
    event.preventDefault()
    event.stopPropagation()

    setGlobalMuted(!getGlobalMuted(), 'work')
  })

  if (element.tagName === 'VIDEO') {
    element.addEventListener('play', () => {
      playing = true
      refresh()
    })

    element.addEventListener('pause', () => {
      playing = false
      refresh()
    })
  }

  visual.appendChild(controls)

  refresh()
}

export function initWorkCarousel() {
  const stage = document.getElementById('workStage')

  if (!stage) return

  const cards = [...stage.querySelectorAll('.project-card')]
  const positions = ['far-left', 'prev', 'active', 'next', 'far-right']

  const N = projects.length

  if (!N || cards.length !== positions.length) {
    stage.classList.add('is-empty')
    return
  }

  initMediaState(true)

  const DURATION = 1150
  const AUTO_DELAY = 3000
  const INTRO_MOVES = Math.min(2, N - 1)

  const reduceMotion = matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches

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

  const order = [...cards]

  /*
   * Background cache.
   * These videos are warmed but never autoplay.
   */
  const warmCache = new Map()

  const warmHost = document.createElement('div')

  warmHost.className = 'video-warm-cache'
  warmHost.setAttribute('aria-hidden', 'true')

  Object.assign(warmHost.style, {
    position: 'fixed',
    left: '-1800px',
    top: '0',
    width: '640px',
    height: '360px',
    overflow: 'hidden',
    opacity: '0.001',
    pointerEvents: 'none',
    contain: 'strict'
  })

  document.body.appendChild(warmHost)

  total.textContent = pad(N - 1)

  const currentProjectKey = () =>
    mediaPauseKey(
      'work',
      projects[activeIndex]?.id ||
        projects[activeIndex]?.slug ||
        activeIndex
    )

  /*
   * Fill one carousel slot.
   */
  function fill(card, index) {
    const i = mod(index)
    const project = projects[i]
    const visual = card.querySelector('.project-visual')

    if (!visual || !project) return

    cleanHost(visual)

    visual.className =
      `project-visual ${VISUALS[i % VISUALS.length]}`

    const label = document.createElement('span')
    label.textContent = pad(i)

    visual.appendChild(label)

    addPosterBackground(visual, project)

    if (!project.video) return

    const key = project.id || `local-${i}`

    let element = warmCache.get(key)

    if (element) {
      warmCache.delete(key)
      element.dataset.warm = 'false'
    } else {
      element = createVideoElement({
        url: project.video,
        type: detectVideoType(
          project.video,
          project.videoType
        ),
        title: project.title || 'Project video',
        autoplay: false,
        muted: true,
        loop: true,
        controls: false,
        poster:
          project.poster ||
          project.image ||
          youtubePoster(project.video),
        priority: 'high',
        className: 'project-media'
      })
    }

    if (!element) return

    element.dataset.sutraVideo = 'true'
    element.dataset.projectIndex = String(i)
    element.dataset.sutraPlaying = '0'

    visual.appendChild(element)

    addActiveControls(
      visual,
      element,
      mediaPauseKey(
        'work',
        project.id || project.slug || i
      ),
      () => globalMuted,
      (paused) => {
        if (i !== activeIndex) return

        activeUserPaused = paused

        /*
         * Once the user has manually interacted with playback,
         * the introductory timer must never take over.
         */
        introDoneState = true
        stopAuto()

        if (paused) {
          setManualWorkPauseKey(
            mediaPauseKey(
              'work',
              project.id || project.slug || i
            )
          )

          setWorkAutoLocked(true)
        } else {
          const key = mediaPauseKey(
            'work',
            project.id || project.slug || i
          )

          if (getManualWorkPauseKey() === key) {
            setManualWorkPauseKey('')
          }

          setWorkAutoLocked(false)
        }
      }
    )
  }

  /*
   * Pre-warm projects that are not already visible.
   */
  function warmProject(index) {
    const i = mod(index)
    const project = projects[i]

    if (!project?.video) return

    const key = project.id || `local-${i}`

    if (warmCache.has(key)) return

    if (
      order.some(
        (card) =>
          card.querySelector(
            `[data-project-index="${i}"]`
          )
      )
    ) {
      return
    }

    const element = createVideoElement({
      url: project.video,
      type: detectVideoType(
        project.video,
        project.videoType
      ),
      title: project.title || 'Project video',
      autoplay: false,
      muted: true,
      loop: true,
      controls: false,
      poster:
        project.poster ||
        project.image ||
        youtubePoster(project.video),
      priority: 'high',
      className: 'project-media'
    })

    if (!element) return

    element.dataset.warm = 'true'
    element.dataset.projectIndex = String(i)
    element.dataset.sutraPlaying = '0'

    warmHost.appendChild(element)

    warmCache.set(key, element)
  }

  function trimWarmCache() {
    const wanted = new Set([
      mod(activeIndex + 3),
      mod(activeIndex + 4),
      mod(activeIndex - 3),
      mod(activeIndex - 4)
    ])

    for (const [key, element] of warmCache) {
      if (
        !wanted.has(
          Number(element.dataset.projectIndex)
        )
      ) {
        element.remove()
        warmCache.delete(key)
      }
    }
  }

  function warmUpcoming() {
    trimWarmCache()

    warmProject(activeIndex + 3)
    warmProject(activeIndex + 4)
    warmProject(activeIndex - 3)
  }

  /*
   * Sync global mute without ever starting playback.
   */
  function syncGlobalMute() {
    globalMuted = isGloballyMuted(true)

    order.forEach((card) => {
      const element = card.querySelector(
        '[data-sutra-video]'
      )

      if (!element) return

      if (globalMuted) {
        muteVideo(element)
      } else if (
        card.classList.contains('project-active')
      ) {
        unmuteVideo(element)
      } else {
        /*
         * Background cards are always muted.
         */
        muteVideo(element)
      }

      const button = card.querySelector(
        '[data-media-mute]'
      )

      if (button) {
        const icon = button.querySelector(
          '.media-sound-icon'
        )

        icon?.classList.toggle(
          'is-muted',
          globalMuted
        )

        button.setAttribute(
          'aria-label',
          globalMuted
            ? 'Unmute video'
            : 'Mute video'
        )
      }
    })
  }

  function assign() {
    order.forEach((card, slot) => {
      card.className =
        `project-card project-${positions[slot]}`
    })

    /*
     * Give the three useful visible positions
     * highest network priority.
     */
    order.forEach((card, slot) => {
      const el = card.querySelector(
        '[data-sutra-video]'
      )

      if (!el || el.tagName !== 'IFRAME') return

      const priority =
        slot === 2 ||
        slot === 1 ||
        slot === 3
          ? 'high'
          : 'auto'

      el.setAttribute(
        'fetchpriority',
        priority
      )

      el.fetchPriority = priority
    })
  }

  function setInfo(project, index) {
    if (cat) {
      cat.textContent = project.category || ''
    }

    if (desc) {
      desc.textContent = project.desc || ''
    }

    if (cur) {
      cur.textContent = pad(index)
    }

    stage.style.setProperty(
      '--p',
      (index + 1) / N
    )

    const href = project.slug
      ? `./project.html?slug=${encodeURIComponent(
          project.slug
        )}`
      : ''

    if (titleLink) {
      titleLink.textContent =
        project.title || ''

      titleLink.href = href || '#'

      titleLink.setAttribute(
        'aria-disabled',
        href ? 'false' : 'true'
      )
    }
  }

  function updateInfo(project, index) {
    const els = [
      cat,
      titleLink,
      desc
    ].filter(Boolean)

    els.forEach((el, k) => {
      el.animate(
        [
          {
            opacity: 1,
            transform: 'translateY(0)'
          },
          {
            opacity: 0,
            transform:
              `translateY(${
                k === 1 ? 12 : 7
              }px)`
          }
        ],
        {
          duration: 180,
          easing:
            'cubic-bezier(.7,0,1,1)',
          fill: 'forwards'
        }
      )
    })

    setTimeout(() => {
      setInfo(project, index)

      els.forEach((el, k) => {
        el.animate(
          [
            {
              opacity: 0,
              transform:
                `translateY(${
                  k === 1 ? -12 : -7
                }px)`
            },
            {
              opacity: 1,
              transform: 'translateY(0)'
            }
          ],
          {
            duration: 600,
            delay: k * 45,
            easing:
              'cubic-bezier(.16,1,.3,1)',
            fill: 'forwards'
          }
        )
      })
    }, 190)
  }

  /*
   * This is the ONLY function allowed to decide
   * whether the active project should play.
   */
  function syncPlayback() {
    const activeKey = currentProjectKey()

    activeUserPaused =
      isMediaPaused(activeKey) ||
      getManualWorkPauseKey() === activeKey

    const globalWorkPause =
      isWorkAutoLocked()

    order.forEach((card, slot) => {
      const element = card.querySelector(
        '[data-sutra-video]'
      )

      if (!element) return

      const isActive = slot === 2

      /*
       * An active project may play only when ALL
       * conditions are satisfied.
       */
      const playAllowed =
        isActive &&
        inView &&
        !document.hidden &&
        !busy &&
        !activeUserPaused &&
        !globalWorkPause

      if (!playAllowed) {
        pauseVideo(element)
        muteVideo(element)
        element.dataset.sutraPlaying = '0'
      } else {
        if (globalMuted) {
          muteVideo(element)
        } else {
          unmuteVideo(element)
        }

        playVideo(element)

        element.dataset.sutraPlaying = '1'
      }

      const playButton = card.querySelector(
        '[data-media-play]'
      )

      if (playButton) {
        playButton.innerHTML = `
          <span class="media-pause-icon ${
            playAllowed ? '' : 'is-play'
          }"></span>
        `

        playButton.setAttribute(
          'aria-label',
          playAllowed
            ? 'Pause video'
            : 'Play video'
        )
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

    /*
     * NEVER perform an automatic movement while
     * the current project is manually paused.
     */
    const activeKey = currentProjectKey()

    if (
      auto &&
      (
        activeUserPaused ||
        isMediaPaused(activeKey) ||
        getManualWorkPauseKey() === activeKey ||
        isWorkAutoLocked()
      )
    ) {
      stopAuto()
      return
    }

    busy = true

    /*
     * Immediately silence current media while
     * the carousel is physically moving.
     */
    syncPlayback()

    const recycled =
      dir > 0
        ? order.shift()
        : order.pop()

    recycled.style.transition = 'none'

    fill(
      recycled,
      dir > 0
        ? activeIndex + 3
        : activeIndex - 3
    )

    if (dir > 0) {
      order.push(recycled)
    } else {
      order.unshift(recycled)
    }

    recycled.className =
      `project-card project-${
        dir > 0
          ? 'far-right'
          : 'far-left'
      }`

    void recycled.offsetWidth

    recycled.style.transition = ''

    activeIndex = mod(
      activeIndex + dir
    )

    /*
     * Re-read state for the NEW active project.
     */
    activeUserPaused =
      isMediaPaused(
        currentProjectKey()
      ) ||
      getManualWorkPauseKey() ===
        currentProjectKey()

    assign()

    warmUpcoming()

    syncGlobalMute()

    updateInfo(
      projects[activeIndex],
      activeIndex
    )

    setTimeout(() => {
      busy = false

      activeUserPaused =
        isMediaPaused(
          currentProjectKey()
        ) ||
        getManualWorkPauseKey() ===
          currentProjectKey()

      /*
       * A queued automatic movement is checked again
       * against the latest manual pause state.
       */
      if (queued) {
        const next = queued
        queued = null

        if (
          next.auto &&
          (
            activeUserPaused ||
            isMediaPaused(
              currentProjectKey()
            ) ||
            getManualWorkPauseKey() ===
              currentProjectKey() ||
            isWorkAutoLocked()
          )
        ) {
          stopAuto()
          syncPlayback()
          return
        }

        step(next.dir, next.auto)
        return
      }

      syncPlayback()

      if (
        !activeUserPaused &&
        !isWorkAutoLocked() &&
        !reduceMotion &&
        inView &&
        !introDoneState
      ) {
        scheduleIntro()
      }
    }, DURATION)
  }

  /*
   * Intro movement is only an initial presentation.
   * The moment the visitor manually controls playback/navigation,
   * this sequence is permanently finished for the session.
   */
  let introDoneState =
    reduceMotion || N < 2

  function scheduleIntro() {
    stopAuto()

    if (
      introDoneState ||
      isWorkAutoLocked() ||
      !inView ||
      document.hidden ||
      activeUserPaused
    ) {
      return
    }

    introTimer = setTimeout(() => {
      const key = currentProjectKey()

      if (
        document.hidden ||
        !inView ||
        busy ||
        isMediaPaused(key) ||
        getManualWorkPauseKey() === key ||
        isWorkAutoLocked()
      ) {
        stopAuto()
        return
      }

      step(1, true)

      introMoves += 1

      if (introMoves >= INTRO_MOVES) {
        introDoneState = true
        return
      }

      scheduleIntro()
    }, AUTO_DELAY)
  }

  /*
   * Manual navigation explicitly releases the archive-wide
   * auto lock. The project that was manually paused still
   * retains its own pause key, so returning to it remains paused.
   */
  function manual(dir) {
    introDoneState = true
    stopAuto()

    setWorkAutoLocked(false)

    step(dir, false)
  }

  /*
   * Initial population.
   */
  order.forEach((card, slot) => {
    fill(
      card,
      activeIndex + slot - 2
    )
  })

  assign()
  warmUpcoming()
  setInfo(projects[0], 0)

  /*
   * Rehydrate the exact manual pause state after page
   * initialization. This is what prevents a paused project
   * from starting when the user scrolls away and returns.
   */
  activeUserPaused =
    isMediaPaused(
      currentProjectKey()
    ) ||
    getManualWorkPauseKey() ===
      currentProjectKey()

  setWorkAutoLocked(
    activeUserPaused
  )

  document
    .getElementById('prevProject')
    ?.addEventListener(
      'click',
      () => manual(-1)
    )

  document
    .getElementById('nextProject')
    ?.addEventListener(
      'click',
      () => manual(1)
    )

  stage.tabIndex = 0

  stage.addEventListener(
    'keydown',
    (e) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        manual(1)
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        manual(-1)
      }
    }
  )

  /*
   * Mouse-wheel navigation is MANUAL navigation.
   * Therefore it may release the archive auto-lock,
   * but it will never count as an automatic advance.
   */
  let wheelLock = false

  stage.addEventListener(
    'wheel',
    (e) => {
      if (
        Math.abs(e.deltaY) < 10 ||
        wheelLock ||
        busy
      ) {
        return
      }

      const r =
        stage.getBoundingClientRect()

      if (
        r.top <
          innerHeight * 0.8 &&
        r.bottom >
          innerHeight * 0.2
      ) {
        e.preventDefault()

        wheelLock = true

        manual(
          e.deltaY > 0
            ? 1
            : -1
        )

        setTimeout(
          () =>
            (wheelLock = false),
          DURATION
        )
      }
    },
    { passive: false }
  )

  /*
   * Global mute state.
   */
  const unsubMute =
    subscribeGlobalMute(
      (muted) => {
        globalMuted = muted

        syncGlobalMute()
        syncPlayback()
      }
    )

  /*
   * Visibility observer.
   *
   * Leaving the section does NOT erase the user's
   * pause state. It only pauses/mutes the media temporarily.
   */
  const observer =
    new IntersectionObserver(
      ([entry]) => {
        inView =
          entry.isIntersecting &&
          entry.intersectionRatio >= 0.45

        if (!inView) {
          stopAuto()

          order.forEach((card) => {
            const element =
              card.querySelector(
                '[data-sutra-video]'
              )

            if (element) {
              pauseVideo(element)
              muteVideo(element)
              element.dataset.sutraPlaying =
                '0'
            }
          })

          return
        }

        /*
         * Rehydrate manual state on return.
         */
        activeUserPaused =
          isMediaPaused(
            currentProjectKey()
          ) ||
          getManualWorkPauseKey() ===
            currentProjectKey()

        if (activeUserPaused) {
          setWorkAutoLocked(true)
        } else {
          setWorkAutoLocked(false)
        }

        syncGlobalMute()
        syncPlayback()

        /*
         * Only schedule the intro timer when
         * the current project was NOT manually paused.
         */
        if (!activeUserPaused) {
          scheduleIntro()
        }
      },
      {
        threshold: [0, 0.45, 0.75]
      }
    )

  observer.observe(stage)

  /*
   * Browser tab visibility.
   *
   * Again, leaving the tab never destroys manual pause state.
   */
  document.addEventListener(
    'visibilitychange',
    () => {
      if (document.hidden) {
        stopAuto()

        order.forEach((card) => {
          const element =
            card.querySelector(
              '[data-sutra-video]'
            )

          if (element) {
            pauseVideo(element)
            muteVideo(element)
            element.dataset.sutraPlaying =
              '0'
          }
        })
      } else if (inView) {
        activeUserPaused =
          isMediaPaused(
            currentProjectKey()
          ) ||
          getManualWorkPauseKey() ===
            currentProjectKey()

        if (activeUserPaused) {
          setWorkAutoLocked(true)
        } else {
          setWorkAutoLocked(false)
        }

        syncGlobalMute()
        syncPlayback()

        if (!activeUserPaused) {
          scheduleIntro()
        }
      }
    }
  )

  syncGlobalMute()

  stage._sutraMediaCleanup =
    () => {
      unsubMute()
      observer.disconnect()
      warmHost.remove()
    }
}