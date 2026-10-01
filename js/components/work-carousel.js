import { projects } from '../data/projects.js';

const pad = (n) => String(n + 1).padStart(2, '0');
const VISUALS = ['visual-a', 'visual-b', 'visual-c', 'visual-d', 'visual-e', 'visual-f'];

export function initWorkCarousel() {
  const stage = document.getElementById('workStage');
  const cards = [...stage.querySelectorAll('.project-card')];          // 5 reusable slots, however many projects exist
  const positions = ['far-left', 'prev', 'active', 'next', 'far-right'];
  const N = projects.length;
  if (!N) return;

  const DURATION = 1150;        // slide animation (ms) — matches the CSS transition
  const AUTO_DELAY = 3000;      // existing intro rhythm
  const INTRO_MOVES = Math.min(2, N - 1);   // Project 1 → 2 → 3, then the timer stops for good
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const cat = document.getElementById('projectCategory');
  const ttl = document.getElementById('projectTitle');
  const desc = document.getElementById('projectDescription');
  const cur = document.getElementById('projectCurrent');
  document.getElementById('projectTotal').textContent = pad(N - 1);

  const mod = (i) => ((i % N) + N) % N;
  let activeIndex = 0, busy = false, queued = 0;
  let introMoves = 0, introTimer = 0, introDone = reduceMotion || N < 2;   // timer-based sequence
  let inView = false;

  // ---------- one shared <video>, moved into whichever card is active ----------
  const video = document.createElement('video');
  video.className = 'project-media';
  video.muted = true; video.playsInline = true; video.preload = 'metadata'; video.setAttribute('aria-hidden', 'true');
  let videoOwner = null;

  function syncVideo() {
    const p = projects[activeIndex];
    const host = order[2].querySelector('.project-visual');
    if (!p.video) { detachVideo(); return; }
    if (videoOwner !== activeIndex) {
      detachVideo();
      video.poster = p.poster || p.image || '';
      video.src = p.video;
      host.appendChild(video);
      videoOwner = activeIndex;
    }
    const shouldPlay = inView && introDone && !document.hidden && !busy;
    if (shouldPlay) video.play().catch(() => {}); else video.pause();
  }
  function detachVideo() {
    if (videoOwner === null) return;
    video.pause(); video.removeAttribute('src'); video.load(); video.remove(); videoOwner = null;
  }
  video.addEventListener('ended', () => { if (inView) step(1); });   // real end of the real video → next project

  // ---------- slots ----------
  const order = [...cards];   // order[slot] = card
  function fill(card, index) {
    const i = mod(index), p = projects[i];
    const v = card.querySelector('.project-visual');
    v.className = 'project-visual ' + VISUALS[i % VISUALS.length];
    const label = v.querySelector(':scope > span'); if (label) label.textContent = pad(i);
    const src = p.image || p.poster || '';
    v.dataset.src = src; v.style.backgroundImage = '';
    if (src) {
      const im = new Image();
      im.onload = () => { if (v.dataset.src === src) { v.style.backgroundImage = `url("${src}")`; v.classList.add('has-media'); } };
      im.src = src;                                   // a broken path simply keeps the gradient placeholder
    }
  }
  function assign() { order.forEach((c, s) => { c.className = 'project-card project-' + positions[s]; }); }

  function setInfo(p, i) { cat.textContent = p.category || ''; ttl.textContent = p.title || ''; desc.textContent = p.desc || ''; cur.textContent = pad(i); stage.style.setProperty('--p', (i + 1) / N); }
  function updateInfo(p, i) {
    const els = [cat, ttl, desc];
    els.forEach((el, k) => el.animate([{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: `translateY(${k === 1 ? 12 : 7}px)` }], { duration: 180, easing: 'cubic-bezier(.7,0,1,1)', fill: 'forwards' }));
    setTimeout(() => {
      setInfo(p, i);
      els.forEach((el, k) => el.animate([{ opacity: 0, transform: `translateY(${k === 1 ? -12 : -7}px)` }, { opacity: 1, transform: 'translateY(0)' }], { duration: 600, delay: k * 45, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'forwards' }));
    }, 190);
  }

  function step(dir) {
    if (N < 2) return;
    if (busy) { queued = dir; return; }
    busy = true;
    detachVideo();

    // the card leaving one edge is recycled (invisible jump) to the opposite far edge with the next project
    const recycled = dir > 0 ? order.shift() : order.pop();
    recycled.style.transition = 'none';
    fill(recycled, dir > 0 ? activeIndex + 3 : activeIndex - 3);
    if (dir > 0) order.push(recycled); else order.unshift(recycled);
    recycled.className = 'project-card project-' + (dir > 0 ? 'far-right' : 'far-left');
    void recycled.offsetWidth;
    recycled.style.transition = '';

    activeIndex = mod(activeIndex + dir);
    assign();
    updateInfo(projects[activeIndex], activeIndex);

    setTimeout(() => {
      busy = false;
      if (queued) { const d = queued; queued = 0; step(d); } else syncVideo();
    }, DURATION);
  }

  // ---------- intro: 1 → 2 → 3 on a timer, then never again ----------
  function stopIntro() { clearTimeout(introTimer); introTimer = 0; }
  function scheduleIntro() {
    stopIntro();
    if (introDone || !inView) return;
    introTimer = setTimeout(() => {
      if (document.hidden || busy) return scheduleIntro();
      step(1);
      if (++introMoves >= INTRO_MOVES) { introDone = true; return; }
      scheduleIntro();
    }, AUTO_DELAY);
  }
  function manual(dir) {           // the user is in control: no more timer-driven moves
    introDone = true; stopIntro();
    step(dir);
  }

  // ---------- init ----------
  order.forEach((c, s) => fill(c, activeIndex + s - 2));
  assign();
  setInfo(projects[0], 0);

  document.getElementById('prevProject').onclick = () => manual(-1);
  document.getElementById('nextProject').onclick = () => manual(1);
  stage.tabIndex = 0;
  stage.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); manual(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); manual(-1); }
  });

  let wheelLock = false;
  stage.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaY) < 10 || wheelLock || busy) return;
    const r = stage.getBoundingClientRect();
    if (r.top < innerHeight * .8 && r.bottom > innerHeight * .2) {
      e.preventDefault();
      wheelLock = true;
      manual(e.deltaY > 0 ? 1 : -1);
      setTimeout(() => (wheelLock = false), DURATION);
    }
  }, { passive: false });

  // leaving the section pauses everything (timer + video, state preserved); coming back resumes it
  new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    if (inView) { scheduleIntro(); syncVideo(); } else { stopIntro(); video.pause(); }
  }, { threshold: 0.3 }).observe(stage);
  document.addEventListener('visibilitychange', () => { if (document.hidden) { stopIntro(); video.pause(); } else if (inView) { scheduleIntro(); syncVideo(); } });
}
