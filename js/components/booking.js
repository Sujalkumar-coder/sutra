/*
 * "Book a call" button
 * --------------------
 * The orange fill is ONE <canvas> that is the button's own background. It paints integer-aligned
 * pixel cells (merged into row runs, so there are no seams and no visible grid). Each cell has a
 * fixed threshold, and a single progress value `p` decides which cells are orange:
 *
 *     dark  --(p: 0 -> 1, cells light up left to right, dithered front)-->  solid orange
 *     solid --(p: 1 -> 0, exactly the same cells go dark again in reverse)-->  dark
 *
 * The 3x3 mark, each letter of the label, the arrow and the dashed separator are switched to their
 * "on orange" colour at the moment the cells behind them are lit, so nothing changes after the fact.
 *
 * Rules implemented:
 *  - leaving during the fill never reverses it: the fill completes, then retracts
 *  - entering during a retract resumes the fill from where it is (continuous, no snapping)
 *  - nothing runs while idle: requestAnimationFrame only lives during a transition
 */

const FILL_MS = 640;
const RETRACT_MS = 520;
const HOLD_MS = 90;          // brief beat at full orange when the cursor already left
const CELL = 6;              // css px per pixel-cell

const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);   // in-out quad: responds immediately, lands softly
const hash = (i, j) => {
  let h = (Math.imul(i, 374761393) + Math.imul(j, 668265263)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

export function initBooking() {
  initToast();

  const btn = document.querySelector('.contact-button');
  const canvas = btn && btn.querySelector('.btn-fill');
  if (!btn || !canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fillMs = reduced ? 1 : FILL_MS;
  const retractMs = reduced ? 1 : RETRACT_MS;

  const mark = btn.querySelector('.btn-mark');
  const label = btn.querySelector('.btn-text');
  const arrowArea = btn.querySelector('.btn-arrow-area');
  const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#fa4500';

  // Wrap each letter so it can flip colour on its own. The link keeps aria-label="Book a call".
  const text = label.textContent.trim();
  label.textContent = '';
  const wrapper = document.createElement('span');
  wrapper.className = 'btn-label';
  const letters = [...text].map((ch) => {
    const span = document.createElement('span');
    span.className = 'ch';
    span.textContent = ch;
    wrapper.appendChild(span);
    return span;
  });
  label.appendChild(wrapper);

  // ---------------------------------------------------------------- geometry
  let dpr = 1, cell = 6, cols = 0, rows = 0, th = new Float32Array(0);
  let items = [];            // things that recolour when the fill passes them
  const markOn = new Array(9).fill(false);

  function cellsFor(rect, origin) {
    const x0 = Math.max(0, Math.floor((rect.left - origin.x) * dpr / cell));
    const x1 = Math.min(cols - 1, Math.floor(((rect.right - origin.x) * dpr - 0.01) / cell));
    const y0 = Math.max(0, Math.floor((rect.top - origin.y) * dpr / cell));
    const y1 = Math.min(rows - 1, Math.floor(((rect.bottom - origin.y) * dpr - 0.01) / cell));
    const out = [];
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) out.push(y * cols + x);
    return out;
  }

  function build() {
    const box = btn.getBoundingClientRect();
    const bw = btn.clientLeft, bh = btn.clientTop;                    // border widths
    const w = box.width - bw * 2, h = box.height - bh * 2;
    if (w < 10 || h < 10) return;

    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    cell = Math.max(2, Math.round(CELL * dpr));
    cols = Math.ceil(canvas.width / cell);
    rows = Math.ceil(canvas.height / cell);

    th = new Float32Array(cols * rows);
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const xn = Math.min(1, ((i + 0.5) * cell) / canvas.width);
        const yn = Math.min(1, ((j + 0.5) * cell) / canvas.height);
        th[j * cols + i] = xn * 0.76 + yn * 0.08 + hash(i, j) * 0.16;   // always < 1
      }
    }

    // Map every recolourable element to the cells behind it.
    const origin = { x: box.left + bw, y: box.top + bh };
    items = [];

    const m = mark.getBoundingClientRect();
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const sq = { left: m.left + c * 8, top: m.top + r * 8, right: m.left + c * 8 + 5, bottom: m.top + r * 8 + 5 };
        items.push({ cells: cellsFor(sq, origin), on: false, apply: (on) => { markOn[r * 3 + c] = on; paintMark(); } });
      }
    }
    letters.forEach((el) => {
      items.push({ cells: cellsFor(el.getBoundingClientRect(), origin), on: false, apply: (on) => el.classList.toggle('is-on', on) });
    });
    const a = arrowArea.getBoundingClientRect();
    const cx = a.left + a.width / 2;
    items.push({ cells: cellsFor({ left: cx - 10, right: cx + 10, top: a.top + a.height / 2 - 8, bottom: a.top + a.height / 2 + 8 }, origin), on: false, apply: (on) => arrowArea.classList.toggle('is-arrow-on', on) });
    items.push({ cells: cellsFor({ left: a.left - 1, right: a.left + 2, top: a.top + a.height * 0.3, bottom: a.top + a.height * 0.7 }, origin), on: false, apply: (on) => arrowArea.classList.toggle('is-sep-on', on) });

    render();
  }

  // ---------------------------------------------------------------- painting
  const ACCENT_SQUARES = new Set([2, 4, 6]);    // (2,0) (1,1) (0,2): the orange squares of the mark
  function paintMark() {
    if (!markOn.some(Boolean)) { mark.style.boxShadow = ''; return; }   // back to the pure-CSS rest state
    mark.style.boxShadow = markOn.map((on, k) => {
      const c = k % 3, r = (k / 3) | 0;
      const color = on ? (ACCENT_SQUARES.has(k) ? 'var(--on)' : 'var(--on-dim)') : (ACCENT_SQUARES.has(k) ? 'var(--m1)' : 'var(--m0)');
      return `${c * 8}px ${r * 8}px 0 0 ${color}`;
    }).join(',');
  }

  function render() {
    const e = ease(p);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const full = e >= 1;
    if (e > 0) {
      ctx.fillStyle = accent;
      for (let j = 0; j < rows; j++) {
        let run = -1;
        for (let i = 0; i <= cols; i++) {
          const lit = i < cols && (full || th[j * cols + i] < e);
          if (lit && run < 0) run = i;
          else if (!lit && run >= 0) { ctx.fillRect(run * cell, j * cell, (i - run) * cell, cell); run = -1; }
        }
      }
    }
    // An element flips only when EVERY cell behind it is orange, so it never sits dark-on-dark.
    items.forEach((it) => {
      const on = e > 0 && it.cells.length > 0 && it.cells.every((idx) => full || th[idx] < e);
      if (on !== it.on) { it.on = on; it.apply(on); }
    });
    btn.classList.toggle('is-lit', p > 0.001);
  }

  // ---------------------------------------------------------------- state machine
  let p = 0;                 // fill progress, 0..1 (linear in time; easing is applied when painting)
  let dir = 0;               // +1 filling, -1 retracting, 0 idle
  let engaged = false;
  let hoverIn = false, focusIn = false;
  let raf = 0, last = 0, holdTimer = 0;

  function tick(now) {
    raf = 0;
    const dt = Math.max(0, Math.min(now - last, 50));   // rAF time can precede performance.now()
    last = now;
    if (dir !== 0) {
      p += (dir * dt) / (dir > 0 ? fillMs : retractMs);
      if (dir > 0 && p >= 1) { p = 1; dir = 0; onFilled(); }
      else if (dir < 0 && p <= 0) { p = 0; dir = 0; }
    }
    render();
    if (dir !== 0) raf = requestAnimationFrame(tick);
  }
  function run(d) {
    dir = d;
    btn.classList.toggle('is-hot', d > 0);
    if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); }
  }
  function scheduleRetract(ms) {
    clearTimeout(holdTimer);
    holdTimer = setTimeout(() => { if (!engaged && p > 0 && dir === 0) run(-1); }, ms);
  }
  function onFilled() { if (!engaged) scheduleRetract(HOLD_MS); }

  function setEngaged(next) {
    if (engaged === next) return;
    engaged = next;
    if (engaged) {
      clearTimeout(holdTimer);
      if (dir < 0 || (dir === 0 && p < 1)) run(1);    // starts, or resumes from wherever the retract was
    } else if (dir === 0 && p > 0) {
      scheduleRetract(0);                             // full & idle -> retract now
    }
    // leaving mid-fill: do nothing here. onFilled() retracts once the fill has finished.
  }
  const sync = () => setEngaged(hoverIn || focusIn);

  btn.addEventListener('pointerenter', (e) => { if (e.pointerType === 'touch') return; hoverIn = true; sync(); });
  btn.addEventListener('pointerleave', (e) => { if (e.pointerType === 'touch') return; hoverIn = false; sync(); });
  btn.addEventListener('focus', () => { focusIn = btn.matches(':focus-visible'); sync(); });
  btn.addEventListener('blur', () => { focusIn = false; sync(); });

  // ---------------------------------------------------------------- lifecycle
  let lastKey = '';
  new ResizeObserver(() => {
    const r = btn.getBoundingClientRect();
    const key = `${Math.round(r.width * 10)}x${Math.round(r.height * 10)}@${window.devicePixelRatio}`;
    if (key === lastKey) return;
    lastKey = key;
    build();
  }).observe(btn);
  document.fonts?.ready.then(() => { lastKey = ''; build(); });
  build();
}

function initToast() {
  document.querySelectorAll('[data-book]').forEach((el) => {
    el.addEventListener('click', () => {
      const toast = document.getElementById('bookingToast');
      if (!toast) return;
      toast.classList.remove('show');
      void toast.offsetWidth;
      toast.classList.add('show');
    });
  });
}
