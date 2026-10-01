/*
 * Footer wordmark
 * ---------------
 * ONE "SUTRA", painted by WebGL from a static, device-resolution text mask.
 *
 *  TEXT  : unchanged. Letter shapes, optical spacing, ink colour and edge quality come from the
 *          high-res mask and are never touched by the liquid, so edges stay perfectly crisp.
 *  LIQUID: a real stable-fluids (Navier-Stokes) simulation lives *inside* the letters.
 *          - the glyphs are solid containers: liquid sloshes against the letter walls (free-slip
 *            boundaries in both the pressure solve and the velocity field), it never leaks out
 *          - the cursor is a paddle: it drags the liquid toward its own velocity (a coupling, not a
 *            raw impulse) so slow moves are gentle, fast moves swirl, and nothing ever blows up
 *          - vorticity confinement keeps small eddies alive, MacCormack advection keeps the dye sharp
 *          - the orange dye fades exponentially + linearly, so it reaches exactly zero and the word
 *            returns to the plain ink colour, pixel for pixel
 *  LOOP  : runs only while the liquid is moving. Idle = no requestAnimationFrame at all.
 *  FALLBACKS: no WebGL -> plain DOM text. No float render targets -> crisp static wordmark.
 *             Reduced motion / touch -> no interaction.
 */

const REF = 240;            // reference font size used to measure glyph silhouettes
const MAX_FONT = 520;       // px, same ceiling the old wordmark used
const SPACING = { target: 0.14, cap: 0.32, min: 0.05 };   // in em

// ---- liquid tuning (only these numbers control the feel) -------------------------------------
const LIQUID = {
  velRes: 0.30,          // velocity grid cells per css px
  dyeRes: 0.85,          // dye grid cells per css px (finer than velocity = crisper swirls)
  pressureIters: 22,
  pressureKeep: 0.8,     // pressure warm start between frames
  vorticity: 22,         // eddy strength
  velDamping: 1.3,       // 1/s  viscosity-like damping of the flow
  dyeFade: 1.6,          // 1/s  exponential fade of the dye
  dyeFadeLinear: 0.35,   // 1/s  constant fade: guarantees the dye reaches exactly zero in bounded time
  dyeMax: 2.5,           // dye density ceiling (keeps the fade time bounded)
  drag: 15,              // 1/s  how firmly the cursor grabs the liquid
  dyeRate: 4.5,          // dye added per second at full cursor speed
  radius: 0.17,          // cursor size, as a fraction of the wordmark height
  rest: 2.2,             // SIMULATED seconds after the last stir before the loop sleeps (dye is gone by ~1.6)
  shine: 0.35,           // wet-surface highlight on the dye (0 = flat colour)
};

// ---- shaders ----------------------------------------------------------------------------------
const VS = `
attribute vec2 a_pos;
varying vec2 vUv;
void main(){ vUv = a_pos * 0.5 + 0.5; gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const head = (manual) => `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
precision highp sampler2D;
#else
precision mediump float;
precision mediump sampler2D;
#endif
${manual ? '#define MANUAL_FILTERING' : ''}
varying vec2 vUv;
vec4 bilerp(sampler2D s, vec2 uv, vec2 texel){
#ifdef MANUAL_FILTERING
  vec2 st = uv / texel - 0.5;
  vec2 i = floor(st);
  vec2 f = st - i;
  vec4 a = texture2D(s, (i + vec2(0.5, 0.5)) * texel);
  vec4 b = texture2D(s, (i + vec2(1.5, 0.5)) * texel);
  vec4 c = texture2D(s, (i + vec2(0.5, 1.5)) * texel);
  vec4 d = texture2D(s, (i + vec2(1.5, 1.5)) * texel);
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
#else
  return texture2D(s, uv);
#endif
}
`;

// What you see. The letter coverage `a` comes from the crisp mask only.
const DISPLAY = `
uniform sampler2D u_mask;
uniform sampler2D u_dye;
uniform vec2  u_px;
uniform vec2  u_dyeTexel;
uniform vec3  u_ink;
uniform vec3  u_accent;
uniform float u_shine;

void main(){
  vec2 frag = vec2(gl_FragCoord.x, u_px.y - gl_FragCoord.y);
  float a = texture2D(u_mask, frag / u_px).a;
  if (a < 0.002){ gl_FragColor = vec4(0.0); return; }

  vec3 col = u_ink;
  vec2 uv = gl_FragCoord.xy / u_px;
  float d = max(bilerp(u_dye, uv, u_dyeTexel).x - 0.003, 0.0);

  if (d > 0.0){
    vec2 e = u_dyeTexel * 3.0;
    float gx = bilerp(u_dye, uv + vec2(e.x, 0.0), u_dyeTexel).x - bilerp(u_dye, uv - vec2(e.x, 0.0), u_dyeTexel).x;
    float gy = bilerp(u_dye, uv + vec2(0.0, e.y), u_dyeTexel).x - bilerp(u_dye, uv - vec2(0.0, e.y), u_dyeTexel).x;

    float dd = 1.0 - exp(-d * 3.4);                       // soft saturation: overlaps never blow out
    vec3 base = mix(u_ink, u_accent, dd);

    vec3 n = normalize(vec3(-vec2(gx, gy) * 2.2, 1.0));    // dye thickness acts as the liquid's surface
    vec3 L = normalize(vec3(-0.45, 0.65, 0.60));
    float s = clamp((dot(n, L) - L.z) * 1.6, -1.0, 1.0);
    float spec = smoothstep(0.90, 0.995, dot(n, normalize(L + vec3(0.0, 0.0, 1.0))));

    vec3 hi = mix(base, vec3(1.0), 0.55);
    vec3 lo = mix(base, vec3(0.0), 0.45);
    col = mix(base, lo, clamp(-s, 0.0, 1.0) * u_shine);
    col = mix(col, hi, (clamp(s, 0.0, 1.0) + spec * 0.8) * u_shine);
  }
  gl_FragColor = vec4(col * a, a);
}
`;

const CLEAR = `
uniform sampler2D uTex; uniform float uValue;
void main(){ gl_FragColor = uValue * texture2D(uTex, vUv); }
`;

// cursor = paddle: pulls the liquid toward the cursor velocity inside a soft disc (solid cells excluded)
const DRAG = `
uniform sampler2D uTarget; uniform sampler2D uSolid;
uniform vec2 uPoint; uniform vec2 uPv; uniform float uCoupling; uniform float uRadius; uniform float uAspect;
void main(){
  vec2 d = vUv - uPoint; d.x *= uAspect;
  float g = exp(-dot(d, d) / uRadius);
  float fl = step(0.5, texture2D(uSolid, vUv).a);
  vec2 v = texture2D(uTarget, vUv).xy;
  v += (uPv - v) * uCoupling * g * fl;
  gl_FragColor = vec4(v, 0.0, 1.0);
}
`;

const SPLAT = `
uniform sampler2D uTarget; uniform sampler2D uSolid;
uniform vec2 uPoint; uniform float uAmount; uniform float uRadius; uniform float uAspect; uniform float uMax;
void main(){
  vec2 d = vUv - uPoint; d.x *= uAspect;
  float g = exp(-dot(d, d) / uRadius);
  float fl = step(0.04, texture2D(uSolid, vUv).a);
  float v = min(texture2D(uTarget, vUv).x + uAmount * g * fl, uMax);
  gl_FragColor = vec4(v, 0.0, 0.0, 1.0);
}
`;

const CURL = `
uniform sampler2D uVelocity; uniform vec2 uTexel;
void main(){
  float L = texture2D(uVelocity, vUv - vec2(uTexel.x, 0.0)).y;
  float R = texture2D(uVelocity, vUv + vec2(uTexel.x, 0.0)).y;
  float T = texture2D(uVelocity, vUv + vec2(0.0, uTexel.y)).x;
  float B = texture2D(uVelocity, vUv - vec2(0.0, uTexel.y)).x;
  gl_FragColor = vec4(0.5 * (R - L - T + B), 0.0, 0.0, 1.0);
}
`;

const VORT = `
uniform sampler2D uVelocity; uniform sampler2D uCurl; uniform sampler2D uSolid;
uniform vec2 uTexel; uniform float uStrength; uniform float uDt;
void main(){
  float L = texture2D(uCurl, vUv - vec2(uTexel.x, 0.0)).x;
  float R = texture2D(uCurl, vUv + vec2(uTexel.x, 0.0)).x;
  float T = texture2D(uCurl, vUv + vec2(0.0, uTexel.y)).x;
  float B = texture2D(uCurl, vUv - vec2(0.0, uTexel.y)).x;
  float C = texture2D(uCurl, vUv).x;
  vec2 f = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
  f /= length(f) + 0.0001;
  f *= uStrength * C;
  f.y *= -1.0;
  float fl = step(0.5, texture2D(uSolid, vUv).a);
  vec2 v = (texture2D(uVelocity, vUv).xy + f * uDt) * fl;
  gl_FragColor = vec4(clamp(v, -1500.0, 1500.0), 0.0, 1.0);
}
`;

// helpers shared by the pressure passes: a solid neighbour behaves like a wall
const DIV = `
uniform sampler2D uVelocity; uniform sampler2D uSolid; uniform vec2 uTexel;
float solid(vec2 uv){ return step(texture2D(uSolid, uv).a, 0.5); }
void main(){
  vec2 vl = vUv - vec2(uTexel.x, 0.0), vr = vUv + vec2(uTexel.x, 0.0);
  vec2 vt = vUv + vec2(0.0, uTexel.y), vb = vUv - vec2(0.0, uTexel.y);
  vec2 C = texture2D(uVelocity, vUv).xy;
  float L = texture2D(uVelocity, vl).x;
  float R = texture2D(uVelocity, vr).x;
  float T = texture2D(uVelocity, vt).y;
  float B = texture2D(uVelocity, vb).y;
  if (solid(vl) > 0.5) L = -C.x;
  if (solid(vr) > 0.5) R = -C.x;
  if (solid(vt) > 0.5) T = -C.y;
  if (solid(vb) > 0.5) B = -C.y;
  float fl = 1.0 - solid(vUv);
  gl_FragColor = vec4(0.5 * (R - L + T - B) * fl, 0.0, 0.0, 1.0);
}
`;

const PRESS = `
uniform sampler2D uPressure; uniform sampler2D uDivergence; uniform sampler2D uSolid; uniform vec2 uTexel;
float solid(vec2 uv){ return step(texture2D(uSolid, uv).a, 0.5); }
void main(){
  vec2 vl = vUv - vec2(uTexel.x, 0.0), vr = vUv + vec2(uTexel.x, 0.0);
  vec2 vt = vUv + vec2(0.0, uTexel.y), vb = vUv - vec2(0.0, uTexel.y);
  float C = texture2D(uPressure, vUv).x;
  float L = texture2D(uPressure, vl).x;
  float R = texture2D(uPressure, vr).x;
  float T = texture2D(uPressure, vt).x;
  float B = texture2D(uPressure, vb).x;
  if (solid(vl) > 0.5) L = C;
  if (solid(vr) > 0.5) R = C;
  if (solid(vt) > 0.5) T = C;
  if (solid(vb) > 0.5) B = C;
  float div = texture2D(uDivergence, vUv).x;
  gl_FragColor = vec4((L + R + B + T - div) * 0.25, 0.0, 0.0, 1.0);
}
`;

const GRAD = `
uniform sampler2D uPressure; uniform sampler2D uVelocity; uniform sampler2D uSolid; uniform vec2 uTexel;
float solid(vec2 uv){ return step(texture2D(uSolid, uv).a, 0.5); }
void main(){
  vec2 vl = vUv - vec2(uTexel.x, 0.0), vr = vUv + vec2(uTexel.x, 0.0);
  vec2 vt = vUv + vec2(0.0, uTexel.y), vb = vUv - vec2(0.0, uTexel.y);
  float C = texture2D(uPressure, vUv).x;
  float L = texture2D(uPressure, vl).x;
  float R = texture2D(uPressure, vr).x;
  float T = texture2D(uPressure, vt).x;
  float B = texture2D(uPressure, vb).x;
  if (solid(vl) > 0.5) L = C;
  if (solid(vr) > 0.5) R = C;
  if (solid(vt) > 0.5) T = C;
  if (solid(vb) > 0.5) B = C;
  vec2 v = texture2D(uVelocity, vUv).xy - vec2(R - L, T - B);
  float fl = 1.0 - solid(vUv);
  gl_FragColor = vec4(v * fl, 0.0, 1.0);
}
`;

const ADVECT_VEL = `
uniform sampler2D uVelocity; uniform sampler2D uSolid; uniform vec2 uTexel; uniform float uDt; uniform float uDecay;
void main(){
  vec2 vel = bilerp(uVelocity, vUv, uTexel).xy;
  vec2 p = vUv - uDt * vel * uTexel;
  vec2 v = bilerp(uVelocity, p, uTexel).xy * uDecay;
  float fl = step(0.5, texture2D(uSolid, vUv).a);
  gl_FragColor = vec4(v * fl, 0.0, 1.0);
}
`;

// MacCormack advection with a min/max limiter: far less numerical blur than plain semi-Lagrangian
const ADVECT_DYE = `
uniform sampler2D uVelocity; uniform sampler2D uDye; uniform sampler2D uSolid;
uniform vec2 uVelTexel; uniform vec2 uDyeTexel; uniform float uDt; uniform float uDecay; uniform float uSub;
void main(){
  vec2 u0 = bilerp(uVelocity, vUv, uVelTexel).xy;
  vec2 p0 = vUv - uDt * u0 * uVelTexel;
  float a = bilerp(uDye, p0, uDyeTexel).x;
  vec2 p1 = vUv + uDt * u0 * uVelTexel;
  vec2 u1 = bilerp(uVelocity, p1, uVelTexel).xy;
  float b = bilerp(uDye, p1 - uDt * u1 * uVelTexel, uDyeTexel).x;
  float cur = texture2D(uDye, vUv).x;
  float r = a + 0.5 * (cur - b);

  vec2 q = p0 / uDyeTexel - 0.5;
  vec2 i = floor(q);
  float n0 = texture2D(uDye, (i + vec2(0.5, 0.5)) * uDyeTexel).x;
  float n1 = texture2D(uDye, (i + vec2(1.5, 0.5)) * uDyeTexel).x;
  float n2 = texture2D(uDye, (i + vec2(0.5, 1.5)) * uDyeTexel).x;
  float n3 = texture2D(uDye, (i + vec2(1.5, 1.5)) * uDyeTexel).x;
  r = clamp(r, min(min(n0, n1), min(n2, n3)), max(max(n0, n1), max(n2, n3)));

  r = max(r * uDecay - uSub, 0.0);
  float fl = step(0.04, texture2D(uSolid, vUv).a);   // dye reaches the wall; the crisp mask trims it
  gl_FragColor = vec4(r * fl, 0.0, 0.0, 1.0);
}
`;

export function initFooter() {
  const wrap = document.getElementById('footerWordWrap');
  const word = document.getElementById('footerWord');
  if (!wrap || !word) return;

  const chars = [...word.textContent.trim()];
  if (!chars.length) return;

  const reducedMQ = matchMedia('(prefers-reduced-motion: reduce)');
  const cs = getComputedStyle(word);
  const family = cs.fontFamily;
  const weight = cs.fontWeight;

  const canvas = document.createElement('canvas');
  canvas.className = 'footer-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  wrap.appendChild(canvas);

  const mask = document.createElement('canvas');
  const mctx = mask.getContext('2d');
  const solidCv = document.createElement('canvas');
  const sctx = solidCv.getContext('2d');

  let gl = null, tex = null, zeroTex = null, quad = null;
  let P = null, fmt = null, sim = null;
  let glyphs = null;                  // measured silhouettes (font dependent, size independent)
  let W = 0, H = 0, dpr = 1;
  let raf = 0, last = 0;
  let quiet = 1e9, simDirty = false;   // quiet = simulated seconds since the cursor last stirred

  const ptr = { inside: false, x: 0, y: 0, px: 0, py: 0, tx: 0, ty: 0 };
  let ink = [0.95, 0.94, 0.93];
  let inkFrom = ink, inkTo = ink, inkT = 1;
  let accent = [0.98, 0.27, 0];

  // ---------------------------------------------------------------- colour
  function readColor(prop, fallback, el = document.body) {
    const raw = getComputedStyle(el).getPropertyValue(prop).trim() || fallback;
    mctx.fillStyle = '#000';
    mctx.fillStyle = raw;
    const v = mctx.fillStyle;
    if (v[0] === '#') return [1, 3, 5].map((i) => parseInt(v.slice(i, i + 2), 16) / 255);
    const m = v.match(/[\d.]+/g);
    return m ? m.slice(0, 3).map((n) => +n / 255) : [0.95, 0.94, 0.93];
  }
  const readInk = () => readColor('--fg', '#f3f1ed');
  const readAccent = () => readColor('--accent', '#fa4500');

  // ---------------------------------------------------------------- optical spacing (unchanged)
  function measureGlyphs() {
    const c = document.createElement('canvas');
    const x = c.getContext('2d', { willReadFrequently: true });
    const font = `${weight} ${REF}px ${family}`;
    x.font = font;

    let maxAsc = 0, maxDesc = 0, maxAdv = 0;
    chars.forEach((ch) => {
      const m = x.measureText(ch);
      maxAsc = Math.max(maxAsc, m.actualBoundingBoxAscent);
      maxDesc = Math.max(maxDesc, m.actualBoundingBoxDescent);
      maxAdv = Math.max(maxAdv, m.width);
    });

    const PAD = 24;
    const base = Math.ceil(maxAsc) + 2;
    c.width = Math.ceil(maxAdv + PAD * 2);
    c.height = base + Math.ceil(maxDesc) + 2;
    x.font = font;
    x.textBaseline = 'alphabetic';
    x.textAlign = 'left';
    x.fillStyle = '#000';

    const list = chars.map((ch) => {
      x.clearRect(0, 0, c.width, c.height);
      x.fillText(ch, PAD, base);
      const { data } = x.getImageData(0, 0, c.width, c.height);
      const L = new Float32Array(c.height).fill(NaN);
      const Rr = new Float32Array(c.height).fill(NaN);
      let minL = Infinity, maxR = -Infinity;
      for (let row = 0; row < c.height; row++) {
        let first = -1, lastCol = -1;
        for (let col = 0; col < c.width; col++) {
          if (data[(row * c.width + col) * 4 + 3] > 100) { if (first < 0) first = col; lastCol = col; }
        }
        if (first >= 0) {
          L[row] = first - PAD;
          Rr[row] = lastCol + 1 - PAD;
          minL = Math.min(minL, L[row]);
          maxR = Math.max(maxR, Rr[row]);
        }
      }
      return { L, R: Rr, minL, maxR };
    });

    const pens = [0];
    for (let i = 0; i < list.length - 1; i++) {
      const A = list[i], B = list[i + 1];
      const diffs = [];
      for (let r = 0; r < A.L.length; r++) {
        if (!Number.isNaN(A.R[r]) && !Number.isNaN(B.L[r])) diffs.push(B.L[r] - A.R[r]);
      }
      const avg = (d) => diffs.reduce((sum, v) => sum + Math.min(SPACING.cap * REF, v + d), 0) / diffs.length;
      let d = SPACING.min * REF - Math.min(...diffs);
      if (avg(d) < SPACING.target * REF) {
        let lo = d, hi = d + REF;
        for (let k = 0; k < 32; k++) { const mid = (lo + hi) / 2; if (avg(mid) < SPACING.target * REF) lo = mid; else hi = mid; }
        d = hi;
      }
      pens.push(pens[i] + d);
    }

    const left = pens[0] + list[0].minL;
    const right = pens[pens.length - 1] + list[list.length - 1].maxR;
    return { pens, left, extent: right - left, maxAsc, maxDesc };
  }

  // ---------------------------------------------------------------- GL plumbing
  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || 'shader compile failed');
    return s;
  }
  function makeProgram(vs, fragSrc) {
    const pr = gl.createProgram();
    gl.attachShader(pr, vs);
    gl.attachShader(pr, compile(gl.FRAGMENT_SHADER, fragSrc));
    gl.bindAttribLocation(pr, 0, 'a_pos');
    gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(pr) || 'link failed');
    return { pr, u: {} };
  }
  function U(p, name) {
    let l = p.u[name];
    if (l === undefined) { l = gl.getUniformLocation(p.pr, name); p.u[name] = l; }
    return l;
  }
  function bind(unit, t) { gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t); }
  function use(p) { gl.useProgram(p.pr); }
  function blit(target) {
    if (target) { gl.bindFramebuffer(gl.FRAMEBUFFER, target.f); gl.viewport(0, 0, target.w, target.h); }
    else { gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, canvas.width, canvas.height); }
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function renderable(type) {
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 4, 4, 0, gl.RGBA, type, null);
    const f = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, f);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
    const ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.deleteFramebuffer(f);
    gl.deleteTexture(t);
    return ok;
  }
  function detectFormat() {
    const tries = [];
    const hf = gl.getExtension('OES_texture_half_float');
    if (hf) {
      gl.getExtension('EXT_color_buffer_half_float');
      tries.push({ type: hf.HALF_FLOAT_OES, linear: !!gl.getExtension('OES_texture_half_float_linear') });
    }
    if (gl.getExtension('OES_texture_float')) {
      gl.getExtension('WEBGL_color_buffer_float');
      tries.push({ type: gl.FLOAT, linear: !!gl.getExtension('OES_texture_float_linear') });
    }
    return tries.find((t) => renderable(t.type)) || null;
  }

  function target(w, h, filter) {
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, fmt.type, null);
    const f = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, f);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
    gl.viewport(0, 0, w, h);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return { tex: t, f, w, h };
  }
  function double(w, h, filter) {
    let a = target(w, h, filter), b = target(w, h, filter);
    return {
      get read() { return a; }, get write() { return b; },
      swap() { const t = a; a = b; b = t; },
      all() { return [a, b]; },
    };
  }
  function dispose(t) { if (t) { gl.deleteTexture(t.tex); gl.deleteFramebuffer(t.f); } }

  function setupGL() {
    gl = canvas.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: true, powerPreference: 'low-power' });
    if (!gl) return false;
    P = null; fmt = null; sim = null;
    try {
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

      fmt = detectFormat();
      const vs = compile(gl.VERTEX_SHADER, VS);
      const H0 = head(!!fmt && !fmt.linear);
      P = { display: makeProgram(vs, H0 + DISPLAY) };

      if (fmt) {
        try {
          P.clear = makeProgram(vs, H0 + CLEAR);
          P.drag = makeProgram(vs, H0 + DRAG);
          P.splat = makeProgram(vs, H0 + SPLAT);
          P.curl = makeProgram(vs, H0 + CURL);
          P.vort = makeProgram(vs, H0 + VORT);
          P.div = makeProgram(vs, H0 + DIV);
          P.press = makeProgram(vs, H0 + PRESS);
          P.grad = makeProgram(vs, H0 + GRAD);
          P.advVel = makeProgram(vs, H0 + ADVECT_VEL);
          P.advDye = makeProgram(vs, H0 + ADVECT_DYE);
        } catch (err) {
          console.warn('[footer] liquid unavailable, showing the static wordmark.', err);
          fmt = null;
        }
      }
    } catch (err) {
      console.warn('[footer] wordmark shader unavailable, using plain text.', err);
      return false;
    }

    tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    zeroTex = gl.createTexture();       // stands in for the dye when there is no simulation
    gl.bindTexture(gl.TEXTURE_2D, zeroTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));
    return true;
  }

  // ---------------------------------------------------------------- simulation resources
  function freeSim() {
    if (!sim) return;
    [...sim.vel.all(), ...sim.dye.all(), ...sim.press.all(), sim.curl, sim.div].forEach(dispose);
    gl.deleteTexture(sim.solid);
    sim = null;
  }

  function buildSim() {
    freeSim();
    if (!fmt || !P.drag) return;
    const vw = Math.min(720, Math.max(64, Math.round(W * LIQUID.velRes)));
    const vh = Math.max(24, Math.round(H * LIQUID.velRes));
    const dw = Math.min(1600, Math.max(128, Math.round(W * LIQUID.dyeRes)));
    const dh = Math.max(48, Math.round(H * LIQUID.dyeRes));
    const smooth = fmt.linear ? gl.LINEAR : gl.NEAREST;

    // Walls: the same glyph mask, shrunk to the velocity grid. Inside a letter = liquid, outside = wall.
    solidCv.width = vw; solidCv.height = vh;
    sctx.clearRect(0, 0, vw, vh);
    sctx.imageSmoothingEnabled = true;
    sctx.imageSmoothingQuality = 'high';
    sctx.drawImage(mask, 0, 0, vw, vh);
    const solid = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, solid);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, solidCv);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);

    sim = {
      vw, vh, dw, dh, solid,
      vel: double(vw, vh, smooth),
      dye: double(dw, dh, smooth),
      curl: target(vw, vh, gl.NEAREST),
      div: target(vw, vh, gl.NEAREST),
      press: double(vw, vh, gl.NEAREST),
    };
    simDirty = false;
  }

  function clearSim() {
    if (!sim) return;
    gl.clearColor(0, 0, 0, 1);
    [...sim.vel.all(), ...sim.dye.all(), ...sim.press.all()].forEach((t) => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, t.f);
      gl.viewport(0, 0, t.w, t.h);
      gl.clear(gl.COLOR_BUFFER_BIT);
    });
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  // ---------------------------------------------------------------- layout (text rendering: unchanged)
  function layout() {
    if (!gl || !glyphs) return;
    const cw = Math.floor(wrap.clientWidth);
    if (cw < 40) return;

    W = cw;
    const F = Math.min(MAX_FONT, (W * REF) / glyphs.extent);
    const s = F / REF;
    const padV = 2;
    H = Math.ceil((glyphs.maxAsc + glyphs.maxDesc) * s + padV * 2);

    const maxTex = gl.getParameter(gl.MAX_TEXTURE_SIZE) || 4096;
    dpr = Math.min(window.devicePixelRatio || 1, 2, maxTex / W);
    const pw = Math.ceil(W * dpr), ph = Math.ceil(H * dpr);

    canvas.width = pw; canvas.height = ph;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    mask.width = pw; mask.height = ph;

    mctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    mctx.clearRect(0, 0, W, H);
    mctx.font = `${weight} ${F}px ${family}`;
    mctx.textBaseline = 'alphabetic';
    mctx.textAlign = 'left';
    mctx.fillStyle = '#fff';
    const startX = (W - glyphs.extent * s) / 2;
    const baseY = padV + glyphs.maxAsc * s;
    chars.forEach((ch, i) => mctx.fillText(ch, startX + (glyphs.pens[i] - glyphs.left) * s, baseY));

    bind(0, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, mask);

    buildSim();
    draw();
    wrap.classList.add('has-canvas');
  }

  // ---------------------------------------------------------------- display
  function draw() {
    if (!gl || gl.isContextLost() || !W) return;
    const p = P.display;
    use(p);
    bind(0, tex);
    bind(1, sim ? sim.dye.read.tex : zeroTex);
    gl.uniform1i(U(p, 'u_mask'), 0);
    gl.uniform1i(U(p, 'u_dye'), 1);
    gl.uniform2f(U(p, 'u_px'), canvas.width, canvas.height);
    gl.uniform2f(U(p, 'u_dyeTexel'), sim ? 1 / sim.dw : 1, sim ? 1 / sim.dh : 1);
    gl.uniform3f(U(p, 'u_ink'), ink[0], ink[1], ink[2]);
    gl.uniform3f(U(p, 'u_accent'), accent[0], accent[1], accent[2]);
    gl.uniform1f(U(p, 'u_shine'), LIQUID.shine);
    gl.disable(gl.BLEND);
    gl.clearColor(0, 0, 0, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);
    blit(null);
  }

  // ---------------------------------------------------------------- liquid
  const radiusUv = () => {                       // gaussian "radius²" in height units (aspect corrected)
    const r = Math.max(22, Math.min(64, H * LIQUID.radius)) / H;
    return r * r;
  };

  function dragAt(u, v, vx, vy, coupling) {
    const p = P.drag;
    use(p);
    bind(0, sim.vel.read.tex);
    bind(1, sim.solid);
    gl.uniform1i(U(p, 'uTarget'), 0);
    gl.uniform1i(U(p, 'uSolid'), 1);
    gl.uniform2f(U(p, 'uPoint'), u, v);
    gl.uniform2f(U(p, 'uPv'), vx, vy);
    gl.uniform1f(U(p, 'uCoupling'), coupling);
    gl.uniform1f(U(p, 'uRadius'), radiusUv());
    gl.uniform1f(U(p, 'uAspect'), W / H);
    blit(sim.vel.write);
    sim.vel.swap();
  }

  function dyeAt(u, v, amount) {
    const p = P.splat;
    use(p);
    bind(0, sim.dye.read.tex);
    bind(1, sim.solid);
    gl.uniform1i(U(p, 'uTarget'), 0);
    gl.uniform1i(U(p, 'uSolid'), 1);
    gl.uniform2f(U(p, 'uPoint'), u, v);
    gl.uniform1f(U(p, 'uAmount'), amount);
    gl.uniform1f(U(p, 'uMax'), LIQUID.dyeMax);
    gl.uniform1f(U(p, 'uRadius'), radiusUv() * 0.8);
    gl.uniform1f(U(p, 'uAspect'), W / H);
    blit(sim.dye.write);
    sim.dye.swap();
  }

  // The cursor is a paddle moving through the liquid.
  function stir(dt) {
    if (!ptr.inside) return false;
    const k = 1 - Math.exp(-dt * 32);              // light smoothing: continuous paths, no jitter
    ptr.px = ptr.x; ptr.py = ptr.y;
    ptr.x += (ptr.tx - ptr.x) * k;
    ptr.y += (ptr.ty - ptr.y) * k;

    const dtS = Math.max(dt, 1 / 120);
    const dx = ptr.x - ptr.px, dy = ptr.y - ptr.py;
    const dist = Math.hypot(dx, dy);
    const speed = dist / dtS;                      // css px / s
    if (dist < 0.15 || speed < 14) return false;

    const R = Math.max(22, Math.min(64, H * LIQUID.radius));
    const steps = Math.min(10, Math.max(1, Math.ceil(dist / (R * 0.5))));
    const coupling = 1 - Math.exp(-LIQUID.drag * dtS);
    const cStep = 1 - Math.pow(1 - coupling, 1 / steps);

    let vx = (dx / dtS) * LIQUID.velRes, vy = (-dy / dtS) * LIQUID.velRes;   // grid cells / s, y up
    const mag = Math.hypot(vx, vy);
    if (mag > 900) { vx *= 900 / mag; vy *= 900 / mag; }

    const amount = (LIQUID.dyeRate * dtS * (0.18 + 0.82 * Math.min(1, speed / 900))) / steps;
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const u = (ptr.px + dx * t) / W, v = 1 - (ptr.py + dy * t) / H;
      dragAt(u, v, vx, vy, cStep);
      dyeAt(u, v, amount);
    }
    simDirty = true;
    quiet = 0;
    return true;
  }

  function stepSim(dt) {
    const s = sim;
    const vt = [1 / s.vw, 1 / s.vh], dtx = [1 / s.dw, 1 / s.dh];
    let p;
    gl.disable(gl.BLEND);

    p = P.curl; use(p);
    bind(0, s.vel.read.tex);
    gl.uniform1i(U(p, 'uVelocity'), 0);
    gl.uniform2f(U(p, 'uTexel'), vt[0], vt[1]);
    blit(s.curl);

    p = P.vort; use(p);
    bind(0, s.vel.read.tex); bind(1, s.curl.tex); bind(2, s.solid);
    gl.uniform1i(U(p, 'uVelocity'), 0); gl.uniform1i(U(p, 'uCurl'), 1); gl.uniform1i(U(p, 'uSolid'), 2);
    gl.uniform2f(U(p, 'uTexel'), vt[0], vt[1]);
    gl.uniform1f(U(p, 'uStrength'), LIQUID.vorticity);
    gl.uniform1f(U(p, 'uDt'), dt);
    blit(s.vel.write); s.vel.swap();

    p = P.div; use(p);
    bind(0, s.vel.read.tex); bind(1, s.solid);
    gl.uniform1i(U(p, 'uVelocity'), 0); gl.uniform1i(U(p, 'uSolid'), 1);
    gl.uniform2f(U(p, 'uTexel'), vt[0], vt[1]);
    blit(s.div);

    p = P.clear; use(p);
    bind(0, s.press.read.tex);
    gl.uniform1i(U(p, 'uTex'), 0);
    gl.uniform1f(U(p, 'uValue'), LIQUID.pressureKeep);
    blit(s.press.write); s.press.swap();

    p = P.press; use(p);
    bind(1, s.div.tex); bind(2, s.solid);
    gl.uniform1i(U(p, 'uPressure'), 0); gl.uniform1i(U(p, 'uDivergence'), 1); gl.uniform1i(U(p, 'uSolid'), 2);
    gl.uniform2f(U(p, 'uTexel'), vt[0], vt[1]);
    for (let i = 0; i < LIQUID.pressureIters; i++) {
      bind(0, s.press.read.tex);
      blit(s.press.write); s.press.swap();
    }

    p = P.grad; use(p);
    bind(0, s.press.read.tex); bind(1, s.vel.read.tex); bind(2, s.solid);
    gl.uniform1i(U(p, 'uPressure'), 0); gl.uniform1i(U(p, 'uVelocity'), 1); gl.uniform1i(U(p, 'uSolid'), 2);
    gl.uniform2f(U(p, 'uTexel'), vt[0], vt[1]);
    blit(s.vel.write); s.vel.swap();

    p = P.advVel; use(p);
    bind(0, s.vel.read.tex); bind(1, s.solid);
    gl.uniform1i(U(p, 'uVelocity'), 0); gl.uniform1i(U(p, 'uSolid'), 1);
    gl.uniform2f(U(p, 'uTexel'), vt[0], vt[1]);
    gl.uniform1f(U(p, 'uDt'), dt);
    gl.uniform1f(U(p, 'uDecay'), Math.exp(-LIQUID.velDamping * dt));
    blit(s.vel.write); s.vel.swap();

    p = P.advDye; use(p);
    bind(0, s.vel.read.tex); bind(1, s.dye.read.tex); bind(2, s.solid);
    gl.uniform1i(U(p, 'uVelocity'), 0); gl.uniform1i(U(p, 'uDye'), 1); gl.uniform1i(U(p, 'uSolid'), 2);
    gl.uniform2f(U(p, 'uVelTexel'), vt[0], vt[1]);
    gl.uniform2f(U(p, 'uDyeTexel'), dtx[0], dtx[1]);
    gl.uniform1f(U(p, 'uDt'), dt);
    gl.uniform1f(U(p, 'uDecay'), Math.exp(-LIQUID.dyeFade * dt));
    gl.uniform1f(U(p, 'uSub'), LIQUID.dyeFadeLinear * dt);
    blit(s.dye.write); s.dye.swap();
  }

  // ---------------------------------------------------------------- loop (on demand only)
  function frame() {
    raf = 0;
    const now = performance.now();                                  // one clock for everything (rAF's own timestamp can lag it)
    const raw = Math.max(0, (now - last) / 1000);
    const dt = Math.min(raw, 0.033);                                // simulation step (stability)
    last = now;

    if (inkT < 1) {
      inkT = Math.min(1, inkT + dt / 0.4);
      const t = inkT * inkT * (3 - 2 * inkT);
      ink = inkFrom.map((v, i) => v + (inkTo[i] - v) * t);
    }

    let live = false;
    if (sim) {
      const stirred = stir(Math.min(raw, 0.1));                       // cursor speed uses real time
      if (!stirred) quiet += dt;
      if (quiet < LIQUID.rest) { stepSim(Math.max(dt, 1 / 240)); live = true; }
      else if (simDirty) { clearSim(); simDirty = false; }          // fully settled: back to flat ink
    }

    draw();

    const chasing = ptr.inside && (Math.abs(ptr.tx - ptr.x) > 0.2 || Math.abs(ptr.ty - ptr.y) > 0.2);
    if (live || chasing || inkT < 1) kick();                         // otherwise: stop. Nothing runs at rest.
  }

  function kick() {
    if (raf) return;
    raf = requestAnimationFrame(frame);
  }
  // Pointer events fire many times per frame. They must NOT touch the clock while the loop is running,
  // otherwise elapsed time collapses to 0 and the cursor stops moving the liquid.
  function wake() { if (!raf) last = performance.now(); kick(); }

  // ---------------------------------------------------------------- pointer
  function local(e) {
    const r = canvas.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  }
  const usable = (e) => e.pointerType !== 'touch' && !reducedMQ.matches && !!sim;

  canvas.addEventListener('pointerenter', (e) => {
    if (!usable(e)) return;
    const [x, y] = local(e);
    ptr.inside = true;
    ptr.x = ptr.px = ptr.tx = x;
    ptr.y = ptr.py = ptr.ty = y;
    wake();
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!usable(e)) return;
    const [x, y] = local(e);
    if (!ptr.inside) { ptr.inside = true; ptr.x = ptr.px = x; ptr.y = ptr.py = y; }
    ptr.tx = x; ptr.ty = y;
    wake();
  });
  canvas.addEventListener('pointerleave', () => { ptr.inside = false; wake(); });

  // ---------------------------------------------------------------- lifecycle
  let lastW = 0;
  function rebuild() {
    glyphs = measureGlyphs();
    lastW = 0;
    layout();
  }

  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    sim = null;
    wrap.classList.remove('has-canvas');          // plain text takes over until the GPU context returns
  });
  canvas.addEventListener('webglcontextrestored', () => {
    if (setupGL()) { ink = readInk(); inkFrom = inkTo = ink; accent = readAccent(); layout(); }
  });

  new ResizeObserver(() => {
    const w = Math.floor(wrap.clientWidth);
    if (w === lastW) return;                       // height changes are ours; ignore them
    lastW = w;
    layout();
  }).observe(wrap);

  new MutationObserver(() => {
    inkFrom = ink; inkTo = readInk(); inkT = 0;    // follow the theme fade instead of snapping
    wake();
  }).observe(document.body, { attributes: true, attributeFilter: ['class'] });

  function start() {
    if (!setupGL()) { canvas.remove(); return; }   // no WebGL: the DOM text stays visible, once
    ink = inkFrom = inkTo = readInk();
    accent = readAccent();
    rebuild();
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(start);
    document.fonts.addEventListener?.('loadingdone', () => { if (gl) rebuild(); });
  } else {
    start();
  }
}