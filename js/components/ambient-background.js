const clamp = (n, a, b) => Math.max(a, Math.min(b, n))

export function initAmbientBackground() {
  if (document.getElementById('sutraAmbient')) return

  const canvas = document.createElement('canvas')
  canvas.id = 'sutraAmbient'
  canvas.setAttribute('aria-hidden', 'true')
  document.body.prepend(canvas)

  const ctx = canvas.getContext('2d', { alpha: true })
  if (!ctx) return

  let width = 0, height = 0, dpr = 1
  let stars = [], dust = [], sketches = [], shooters = []
  let nextShooterAt = 0, last = performance.now()
  let reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  const isLight = () => document.body.classList.contains('light-mode')

  const makeSketch = () => {
    const x = width * (.04 + Math.random() * .92)
    const y = height * (.10 + Math.random() * .80)
    const size = 40 + Math.random() * 115
    const kind = Math.floor(Math.random() * 4)
    return { x, y, size, rotation: -0.65 + Math.random() * 1.3, phase: Math.random() * Math.PI * 2, kind, alpha: .055 + Math.random() * .045 }
  }

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    width = window.innerWidth; height = window.innerHeight
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr)
    canvas.style.width = `${width}px`; canvas.style.height = `${height}px`
    const count = Math.round(clamp((width * height) / 52000, 26, 48))
    stars = Array.from({length: count}, (_, i) => ({
      x: Math.random() * width, y: Math.random() * height,
      r: i < 5 ? Math.random() * .55 + .35 : Math.random() * .35 + .09,
      a: i < 5 ? Math.random() * .10 + .10 : Math.random() * .065 + .028,
      phase: Math.random() * Math.PI * 2,
      speed: .0000015 + Math.random() * .0000026,
      twinkle: .92 + Math.random() * .62,
      drift: Math.random() * .7 + .3,
      harmonic: Math.random() * .35 + .15
    }))
    dust = Array.from({length: Math.round(clamp((width * height) / 110000, 10, 22))}, () => ({
      x: Math.random() * width, y: Math.random() * height, r: .2 + Math.random() * .8,
      a: .008 + Math.random() * .018, phase: Math.random() * Math.PI * 2, drift: .00008 + Math.random() * .00016
    }))
    sketches = Array.from({length: Math.round(clamp(width / 150, 7, 13))}, makeSketch)
    shooters = []
    nextShooterAt = performance.now() + 900 + Math.random() * 1300
  }

  const makeShooter = () => {
    const fromLeft = Math.random() < .5
    const angle = fromLeft
      ? (Math.PI * (.16 + Math.random() * .22))
      : (Math.PI * (.62 + Math.random() * .22))
    return {
      x: Math.random() * width,
      y: Math.random() * height * .34 + height * .015,
      length: 110 + Math.random() * 190, speed: 520 + Math.random() * 360,
      life: 0, maxLife: 650 + Math.random() * 520, angle, width: .65 + Math.random() * .7
    }
  }

  const maybeShoot = (now) => {
    if (reduced || isLight() || shooters.length >= 1 || now < nextShooterAt) return
    shooters.push(makeShooter())
    nextShooterAt = now + 1500 + Math.random() * 3200
  }

  const drawDark = (now) => {
    ctx.clearRect(0, 0, width * dpr, height * dpr); ctx.save(); ctx.scale(dpr, dpr)
    stars.forEach((s) => {
      // Slow, layered sinusoidal modulation creates a continuous atmospheric
      // shimmer rather than an on/off blink.
      const t = now * s.speed
      const slow = Math.sin(t + s.phase)
      const shimmer = Math.sin(t * 1.73 + s.phase * 1.37) * s.harmonic
      const pulse = (slow + shimmer) / (1 + s.harmonic)
      const alpha = clamp(s.a * (1 + pulse * s.twinkle), .018, .28)
      ctx.beginPath(); ctx.fillStyle = `rgba(255,255,255,${alpha})`; ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill()
    })
    dust.forEach((d) => {
      const x = d.x + Math.cos(now * d.drift + d.phase) * 4
      const y = d.y + Math.sin(now * d.drift + d.phase) * 4
      ctx.beginPath(); ctx.fillStyle = `rgba(255,255,255,${d.a})`; ctx.arc(x, y, d.r, 0, Math.PI * 2); ctx.fill()
    })
    maybeShoot(now)
    shooters = shooters.filter((s) => {
      s.life += now - last; const t = s.life / s.maxLife; if (t >= 1) return false
      const d = s.speed * s.life / 1000, dx = Math.cos(s.angle), dy = Math.sin(s.angle)
      const x = s.x + dx * d, y = s.y + dy * d, fade = Math.sin(Math.PI * t)
      const tail = s.length * (.7 + fade * .65), tx = x - dx * tail, ty = y - dy * tail
      const glow = ctx.createLinearGradient(tx, ty, x, y); glow.addColorStop(0,'rgba(255,255,255,0)'); glow.addColorStop(.65,`rgba(255,255,255,${.0224*fade})`); glow.addColorStop(1,`rgba(255,255,255,${.128*fade})`)
      ctx.strokeStyle = glow; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(tx,ty); ctx.lineTo(x,y); ctx.stroke()
      const core = ctx.createLinearGradient(tx, ty, x, y); core.addColorStop(0,'rgba(255,255,255,0)'); core.addColorStop(.7,`rgba(255,255,255,${.0768*fade})`); core.addColorStop(1,`rgba(255,255,255,${.5504*fade})`)
      ctx.strokeStyle = core; ctx.lineWidth = s.width; ctx.beginPath(); ctx.moveTo(tx,ty); ctx.lineTo(x,y); ctx.stroke()
      ctx.fillStyle = `rgba(255,255,255,${.576*fade})`; ctx.beginPath(); ctx.arc(x,y,1.2,0,Math.PI*2); ctx.fill()
      return true
    })
    ctx.restore()
  }

  const drawPencilSketch = (s, now) => {
    const drift = Math.sin(now * .00013 + s.phase) * 3
    ctx.save(); ctx.translate(s.x + drift, s.y); ctx.rotate(s.rotation)
    ctx.strokeStyle = `rgba(55,50,44,${s.alpha})`; ctx.lineWidth = .9; ctx.lineCap = 'round'; ctx.lineJoin = 'round'
    const q = s.size
    ctx.beginPath()
    if (s.kind === 0) {
      ctx.moveTo(-q*.55, q*.1); ctx.quadraticCurveTo(-q*.2,-q*.5,q*.2,-q*.05); ctx.quadraticCurveTo(q*.5,q*.35,q*.65,-q*.18)
      ctx.moveTo(-q*.45,q*.28); ctx.quadraticCurveTo(0,q*.5,q*.5,q*.28)
    } else if (s.kind === 1) {
      ctx.moveTo(-q*.45,-q*.3); ctx.lineTo(q*.38,q*.3); ctx.moveTo(-q*.32,q*.42); ctx.lineTo(q*.48,-q*.38)
      for(let i=-2;i<=2;i++){ ctx.moveTo(-q*.48+i*5,q*.48); ctx.lineTo(-q*.2+i*5,q*.18) }
    } else if (s.kind === 2) {
      ctx.arc(0,0,q*.32,0,Math.PI*1.65); ctx.moveTo(q*.05,-q*.42); ctx.lineTo(q*.48,-q*.22); ctx.lineTo(q*.15,-q*.05)
    } else {
      ctx.moveTo(-q*.58,0); ctx.quadraticCurveTo(-q*.2,-q*.34,q*.12,0); ctx.quadraticCurveTo(q*.38,q*.34,q*.58,0)
      ctx.moveTo(-q*.3,q*.2); ctx.quadraticCurveTo(0,q*.48,q*.34,q*.16)
    }
    ctx.stroke(); ctx.restore()
  }

  const drawLight = (now) => {
    ctx.clearRect(0,0,width*dpr,height*dpr); ctx.save(); ctx.scale(dpr,dpr)
    const wash = ctx.createRadialGradient(width*.2,height*.08,0,width*.2,height*.08,width*.7); wash.addColorStop(0,'rgba(255,255,255,.22)'); wash.addColorStop(1,'rgba(255,255,255,0)'); ctx.fillStyle=wash; ctx.fillRect(0,0,width,height)
    sketches.forEach((s) => drawPencilSketch(s, now))
    dust.forEach((d) => { const x=d.x+Math.cos(now*d.drift+d.phase)*5,y=d.y+Math.sin(now*d.drift+d.phase)*5; ctx.beginPath(); ctx.fillStyle=`rgba(55,50,43,${d.a})`; ctx.arc(x,y,d.r,0,Math.PI*2); ctx.fill() })
    ctx.restore()
  }

  const draw = (now) => { isLight() ? drawLight(now) : drawDark(now); last = now; requestAnimationFrame(draw) }
  resize(); window.addEventListener('resize',resize,{passive:true})
  document.addEventListener('visibilitychange',()=>{ if(!document.hidden){last=performance.now(); nextShooterAt=last+700+Math.random()*1200} })
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener?.('change',(e)=>{reduced=e.matches})
  requestAnimationFrame(draw)
}
