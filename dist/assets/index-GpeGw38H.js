(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=[{title:`Project One`,category:`VIDEO EDITING · MOTION`,desc:`A fast editorial system built around rhythm, pacing and a strong opening hook.`},{title:`Project Two`,category:`SAAS · MOTION GRAPHICS`,desc:`A cinematic motion system for a digital product, built around clarity and controlled attention.`},{title:`Project Three`,category:`SOCIAL · VIDEO EDITING`,desc:`Short-form storytelling designed to make the first seconds impossible to scroll past.`},{title:`Project Four`,category:`EXPLAINER · MOTION`,desc:`Complex product logic translated into a visual language that feels simple and alive.`},{title:`Project Five`,category:`PRODUCT LAUNCH · MOTION`,desc:`A launch film built around reveal, contrast and deliberate momentum.`},{title:`Project Six`,category:`SOCIAL · MOTION`,desc:`A visual campaign system connecting typography, movement and sound-driven pacing.`}],t=e=>String(e+1).padStart(2,`0`),n=[`visual-a`,`visual-b`,`visual-c`,`visual-d`,`visual-e`,`visual-f`];function r(){let r=document.getElementById(`workStage`),i=[...r.querySelectorAll(`.project-card`)],a=[`far-left`,`prev`,`active`,`next`,`far-right`],o=e.length;if(!o)return;let s=1150,c=Math.min(2,o-1),l=matchMedia(`(prefers-reduced-motion: reduce)`).matches,u=document.getElementById(`projectCategory`),d=document.getElementById(`projectTitle`),f=document.getElementById(`projectDescription`),p=document.getElementById(`projectCurrent`);document.getElementById(`projectTotal`).textContent=t(o-1);let m=e=>(e%o+o)%o,h=0,g=!1,_=0,v=0,y=0,b=l||o<2,x=!1,S=document.createElement(`video`);S.className=`project-media`,S.muted=!0,S.playsInline=!0,S.preload=`metadata`,S.setAttribute(`aria-hidden`,`true`);let C=null;function w(){let t=e[h],n=E[2].querySelector(`.project-visual`);if(!t.video){T();return}C!==h&&(T(),S.poster=t.poster||t.image||``,S.src=t.video,n.appendChild(S),C=h),x&&b&&!document.hidden&&!g?S.play().catch(()=>{}):S.pause()}function T(){C!==null&&(S.pause(),S.removeAttribute(`src`),S.load(),S.remove(),C=null)}S.addEventListener(`ended`,()=>{x&&j(1)});let E=[...i];function D(r,i){let a=m(i),o=e[a],s=r.querySelector(`.project-visual`);s.className=`project-visual `+n[a%n.length];let c=s.querySelector(`:scope > span`);c&&(c.textContent=t(a));let l=o.image||o.poster||``;if(s.dataset.src=l,s.style.backgroundImage=``,l){let e=new Image;e.onload=()=>{s.dataset.src===l&&(s.style.backgroundImage=`url("${l}")`,s.classList.add(`has-media`))},e.src=l}}function O(){E.forEach((e,t)=>{e.className=`project-card project-`+a[t]})}function k(e,n){u.textContent=e.category||``,d.textContent=e.title||``,f.textContent=e.desc||``,p.textContent=t(n),r.style.setProperty(`--p`,(n+1)/o)}function A(e,t){let n=[u,d,f];n.forEach((e,t)=>e.animate([{opacity:1,transform:`translateY(0)`},{opacity:0,transform:`translateY(${t===1?12:7}px)`}],{duration:180,easing:`cubic-bezier(.7,0,1,1)`,fill:`forwards`})),setTimeout(()=>{k(e,t),n.forEach((e,t)=>e.animate([{opacity:0,transform:`translateY(${t===1?-12:-7}px)`},{opacity:1,transform:`translateY(0)`}],{duration:600,delay:t*45,easing:`cubic-bezier(.16,1,.3,1)`,fill:`forwards`}))},190)}function j(t){if(o<2)return;if(g){_=t;return}g=!0,T();let n=t>0?E.shift():E.pop();n.style.transition=`none`,D(n,t>0?h+3:h-3),t>0?E.push(n):E.unshift(n),n.className=`project-card project-`+(t>0?`far-right`:`far-left`),n.offsetWidth,n.style.transition=``,h=m(h+t),O(),A(e[h],h),setTimeout(()=>{if(g=!1,_){let e=_;_=0,j(e)}else w()},s)}function M(){clearTimeout(y),y=0}function N(){M(),!b&&x&&(y=setTimeout(()=>{if(document.hidden||g)return N();if(j(1),++v>=c){b=!0;return}N()},3e3))}function P(e){b=!0,M(),j(e)}E.forEach((e,t)=>D(e,h+t-2)),O(),k(e[0],0),document.getElementById(`prevProject`).onclick=()=>P(-1),document.getElementById(`nextProject`).onclick=()=>P(1),r.tabIndex=0,r.addEventListener(`keydown`,e=>{e.key===`ArrowRight`&&(e.preventDefault(),P(1)),e.key===`ArrowLeft`&&(e.preventDefault(),P(-1))});let F=!1;r.addEventListener(`wheel`,e=>{if(Math.abs(e.deltaY)<10||F||g)return;let t=r.getBoundingClientRect();t.top<innerHeight*.8&&t.bottom>innerHeight*.2&&(e.preventDefault(),F=!0,P(e.deltaY>0?1:-1),setTimeout(()=>F=!1,s))},{passive:!1}),new IntersectionObserver(([e])=>{x=e.isIntersecting,x?(N(),w()):(M(),S.pause())},{threshold:.3}).observe(r),document.addEventListener(`visibilitychange`,()=>{document.hidden?(M(),S.pause()):x&&(N(),w())})}var i=[{name:`Roosthaven`,description:`Property, hospitality and digital storytelling.`,tags:[`Video`,`Motion`],year:`2026`,image:``,gallery:[]},{name:`Elite Club`,description:`Premium lifestyle and an exclusive member network.`,tags:[`Social`,`Launch`],year:`2026`,image:``,gallery:[]}],a=e=>String(e+1).padStart(2,`0`),o=(e=``)=>String(e).replace(/[&<>"]/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`})[e]),s=e=>e.split(/\s+/).map(e=>e[0]).join(``).slice(0,2).toUpperCase();function c(e,t,n){if(!e)return;let r=new Image;r.alt=t,r.decoding=`async`,r.loading=`lazy`,r.onload=()=>{n.classList.add(`has-img`),n.prepend(r)},r.onerror=()=>r.remove(),r.src=e}function l(){let e=document.getElementById(`clientsApp`),t=i;if(!e||!t.length)return;let n=t.map(e=>e.name.toUpperCase()),r=Array.from({length:Math.max(2,Math.ceil(14/n.length))},()=>n).flat(),l=[...r,...r].map(e=>`<span>${o(e)}</span><i></i>`).join(``);e.innerHTML=`
    <div class="cl-stage">
      <div class="cl-list" role="tablist" aria-label="Clients">
        ${t.map((e,t)=>`<button type="button" class="cl-item" role="tab" data-i="${t}"><span>${a(t)}</span><strong>${o(e.name)}</strong></button>`).join(``)}
      </div>
      <div class="cl-feature">
        <div class="cl-topline">
          <span class="cl-count"><b data-cur></b><i></i><span data-total></span></span>
          <span class="cl-nav"><button type="button" data-step="-1" aria-label="Previous client">←</button><button type="button" data-step="1" aria-label="Next client">→</button></span>
        </div>
        <div class="cl-body">
          <h3 class="cl-name" data-name></h3>
          <p class="cl-desc" data-desc></p>
          <div class="cl-meta" data-meta></div>
        </div>
      </div>
      <div class="cl-media">
        <div class="cl-frame" data-frame><div class="cl-ph"><span>PHOTO</span><b data-mono></b></div></div>
        <div class="cl-thumbs" data-thumbs></div>
      </div>
    </div>
    <div class="cl-marquee" aria-hidden="true"><div class="cl-marquee-track">${l}</div></div>`;let u=t=>e.querySelector(t),d=[...e.querySelectorAll(`.cl-item`)],f=u(`[data-frame]`),p=u(`[data-thumbs]`),m=[u(`.cl-name`),u(`.cl-desc`),u(`.cl-meta`)];u(`[data-total]`).textContent=a(t.length-1);let h=-1;function g(e,t){f.classList.remove(`has-img`),f.querySelectorAll(`img`).forEach(e=>e.remove()),u(`[data-mono]`).textContent=s(t.name),c(e,t.name,f)}function _(e,{scroll:n=!0}={}){if(e=(e+t.length)%t.length,e===h)return;h=e;let r=t[e];d.forEach((t,n)=>{t.classList.toggle(`active`,n===e),t.setAttribute(`aria-selected`,n===e)}),u(`[data-cur]`).textContent=a(e);let i=u(`[data-name]`);i.innerHTML=r.logo?`<img src="${o(r.logo)}" alt="${o(r.name)}" onerror="this.replaceWith(document.createTextNode('${o(r.name).replace(/'/g,`\\'`)}'))">`:o(r.name),u(`[data-desc]`).textContent=r.description||``,u(`[data-meta]`).innerHTML=[r.year&&`<span>${o(r.year)}</span>`,...(r.tags||[]).map(e=>`<span>${o(e)}</span>`),r.url&&`<a href="${o(r.url)}" target="_blank" rel="noopener">View project <span class="arrow">↗</span></a>`].filter(Boolean).join(``);let s=[r.image,...r.gallery||[]].filter(Boolean);g(s[0],r),p.innerHTML=s.length>1?s.slice(0,5).map((e,t)=>`<button type="button" data-src="${o(e)}" class="${t?``:`on`}"></button>`).join(``):``,p.querySelectorAll(`button`).forEach(e=>{e.style.backgroundImage=`url("${e.dataset.src}")`}),m.forEach(e=>{e.classList.remove(`cl-in`),e.offsetWidth,e.classList.add(`cl-in`)}),f.classList.remove(`cl-in`),f.offsetWidth,f.classList.add(`cl-in`),n&&d[e].scrollIntoView({block:`nearest`,inline:`nearest`})}e.addEventListener(`click`,e=>{let n=e.target.closest(`.cl-item`),r=e.target.closest(`[data-step]`),i=e.target.closest(`.cl-thumbs button`);n?_(+n.dataset.i):r?_(h+ +r.dataset.step):i&&(p.querySelectorAll(`button`).forEach(e=>e.classList.toggle(`on`,e===i)),g(i.dataset.src,t[h]))}),e.querySelector(`.cl-list`).addEventListener(`keydown`,e=>{let t={ArrowDown:1,ArrowRight:1,ArrowUp:-1,ArrowLeft:-1}[e.key];t&&(e.preventDefault(),_(h+t),d[h].focus())}),d.forEach(e=>e.addEventListener(`pointerenter`,t=>{t.pointerType===`mouse`&&_(+e.dataset.i,{scroll:!1})})),_(0,{scroll:!1})}var u=[{title:`Video Editing`,tags:`Rhythm · story · retention`,accent:`#c8dcff`,art:0},{title:`Motion Graphics`,tags:`Systems · type · movement`,accent:`#d7c8ff`,art:1},{title:`Social`,tags:`Hooks · pace · attention`,accent:`#ffc9dc`,art:2},{title:`Explainers`,tags:`Clarity · structure · visual logic`,accent:`#bdebe3`,art:3},{title:`Product Launches`,tags:`Impact · reveal · momentum`,accent:`#ffd5b8`,art:4},{title:`SaaS Animations`,tags:`Interface · product · motion`,accent:`#c8d9ff`,art:5}],d=e=>String(e+1).padStart(2,`0`);function f(){let e=document.getElementById(`serviceList`),t=document.getElementById(`serviceArt`),n=document.getElementById(`serviceVisualTitle`),r=document.getElementById(`serviceIndex`);if(!e||!t)return;e.innerHTML=u.map((e,t)=>`
    <button class="service-item" type="button" data-i="${t}" style="--sv:${e.accent||`#c8dcff`}">
      <span class="service-no">${d(t)}</span>
      <strong>${e.title}</strong>
      <em class="service-go" aria-hidden="true">→</em>
      <small>${e.tags||``}</small>
    </button>`).join(``);let i=[...e.children],a=-1,o=0;function s(e){if(e===a)return;a=e;let s=u[e];i.forEach((t,n)=>t.classList.toggle(`active`,n===e)),t.dataset.mode=s.art??e%6,t.style.setProperty(`--service-accent`,s.accent||`#c8dcff`),n.textContent=s.title.toUpperCase(),r.textContent=d(e),t.classList.remove(`service-changing`),t.offsetWidth,t.classList.add(`service-changing`),clearTimeout(o),o=setTimeout(()=>t.classList.remove(`service-changing`),260)}e.addEventListener(`pointerover`,e=>{if(e.pointerType===`touch`)return;let t=e.target.closest(`.service-item`);t&&s(+t.dataset.i)}),e.addEventListener(`click`,e=>{let t=e.target.closest(`.service-item`);t&&s(+t.dataset.i)}),e.addEventListener(`focusin`,e=>{let t=e.target.closest(`.service-item`);t&&s(+t.dataset.i)}),e.addEventListener(`keydown`,e=>{if(e.key!==`ArrowDown`&&e.key!==`ArrowUp`)return;e.preventDefault();let t=(a+(e.key===`ArrowDown`?1:-1)+i.length)%i.length;i[t].focus()}),s(0)}function p(){let e=document.querySelector(`.cursor-dot`),t=document.getElementById(`cursorTrail`),n=t.getContext(`2d`),r=innerWidth/2,i=innerHeight/2,a=r,o=i,s=!1,c=performance.now(),l=r,u=i,d=[];function f(){let e=devicePixelRatio||1;t.width=innerWidth*e,t.height=innerHeight*e,t.style.width=innerWidth+`px`,t.style.height=innerHeight+`px`,n.setTransform(e,0,0,e,0,0)}addEventListener(`resize`,f),f();function p(){s=!1,t.style.opacity=`0`,e.style.opacity=`0`,d.length=0,n.clearRect(0,0,innerWidth,innerHeight)}addEventListener(`pointerenter`,n=>{s=!0,r=a=n.clientX,i=o=n.clientY,l=r,u=i,d.length=0,t.style.opacity=`1`,e.style.opacity=`1`}),addEventListener(`pointermove`,n=>{r=n.clientX,i=n.clientY,e.style.left=r+`px`,e.style.top=i+`px`,s||(s=!0,t.style.opacity=`1`,e.style.opacity=`1`)}),addEventListener(`pointerleave`,p),addEventListener(`mouseleave`,p),addEventListener(`blur`,p);function m(e){let t=Math.min((e-c)/16.67,2);c=e;let f=r-l,p=i-u;l=r,u=i,a+=(r-a)*Math.min(.24*t,1),o+=(i-o)*Math.min(.24*t,1);let h=Math.min(1,Math.hypot(f,p)/38);if(s&&(d.unshift({x:a,y:o,w:1.4+h*2.1}),d.length>14&&d.pop()),n.clearRect(0,0,innerWidth,innerHeight),s&&d.length>2){let e=d[0],t=d[d.length-1],r=n.createLinearGradient(t.x,t.y,e.x,e.y);r.addColorStop(0,`rgba(250,69,0,0)`),r.addColorStop(.42,`rgba(250,69,0,.10)`),r.addColorStop(.78,`rgba(255,105,45,.34)`),r.addColorStop(1,`rgba(255,190,145,.88)`),n.beginPath(),n.moveTo(t.x,t.y);for(let e=d.length-2;e>=0;e--){let t=d[e],r=d[Math.min(e+1,d.length-1)];n.quadraticCurveTo(r.x,r.y,(r.x+t.x)/2,(r.y+t.y)/2)}n.lineTo(e.x,e.y),n.strokeStyle=r,n.lineCap=`round`,n.lineJoin=`round`,n.lineWidth=e.w,n.shadowBlur=12+h*10,n.shadowColor=`rgba(250,69,0,.30)`,n.stroke(),n.shadowBlur=0}requestAnimationFrame(m)}requestAnimationFrame(m)}function m(){document.querySelectorAll(`.magnetic`).forEach(e=>{e.addEventListener(`pointermove`,t=>{let n=e.getBoundingClientRect();e.style.setProperty(`--mx`,`${(t.clientX-(n.left+n.width/2))*.08}px`),e.style.setProperty(`--my`,`${(t.clientY-(n.top+n.height/2))*.08}px`)}),e.addEventListener(`pointerleave`,()=>{e.style.setProperty(`--mx`,`0px`),e.style.setProperty(`--my`,`0px`)})})}var h=240,g=520,_={target:.14,cap:.32,min:.05},v={velRes:.3,dyeRes:.85,pressureIters:22,pressureKeep:.8,vorticity:22,velDamping:1.3,dyeFade:1.6,dyeFadeLinear:.35,dyeMax:2.5,drag:15,dyeRate:4.5,radius:.17,rest:2.2,shine:.35},y=`
attribute vec2 a_pos;
varying vec2 vUv;
void main(){ vUv = a_pos * 0.5 + 0.5; gl_Position = vec4(a_pos, 0.0, 1.0); }
`,b=e=>`
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
precision highp sampler2D;
#else
precision mediump float;
precision mediump sampler2D;
#endif
${e?`#define MANUAL_FILTERING`:``}
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
`,x=`
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
`,S=`
uniform sampler2D uTex; uniform float uValue;
void main(){ gl_FragColor = uValue * texture2D(uTex, vUv); }
`,C=`
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
`,w=`
uniform sampler2D uTarget; uniform sampler2D uSolid;
uniform vec2 uPoint; uniform float uAmount; uniform float uRadius; uniform float uAspect; uniform float uMax;
void main(){
  vec2 d = vUv - uPoint; d.x *= uAspect;
  float g = exp(-dot(d, d) / uRadius);
  float fl = step(0.04, texture2D(uSolid, vUv).a);
  float v = min(texture2D(uTarget, vUv).x + uAmount * g * fl, uMax);
  gl_FragColor = vec4(v, 0.0, 0.0, 1.0);
}
`,T=`
uniform sampler2D uVelocity; uniform vec2 uTexel;
void main(){
  float L = texture2D(uVelocity, vUv - vec2(uTexel.x, 0.0)).y;
  float R = texture2D(uVelocity, vUv + vec2(uTexel.x, 0.0)).y;
  float T = texture2D(uVelocity, vUv + vec2(0.0, uTexel.y)).x;
  float B = texture2D(uVelocity, vUv - vec2(0.0, uTexel.y)).x;
  gl_FragColor = vec4(0.5 * (R - L - T + B), 0.0, 0.0, 1.0);
}
`,E=`
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
`,D=`
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
`,O=`
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
`,k=`
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
`,A=`
uniform sampler2D uVelocity; uniform sampler2D uSolid; uniform vec2 uTexel; uniform float uDt; uniform float uDecay;
void main(){
  vec2 vel = bilerp(uVelocity, vUv, uTexel).xy;
  vec2 p = vUv - uDt * vel * uTexel;
  vec2 v = bilerp(uVelocity, p, uTexel).xy * uDecay;
  float fl = step(0.5, texture2D(uSolid, vUv).a);
  gl_FragColor = vec4(v * fl, 0.0, 1.0);
}
`,j=`
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
`;function M(){let e=document.getElementById(`footerWordWrap`),t=document.getElementById(`footerWord`);if(!e||!t)return;let n=[...t.textContent.trim()];if(!n.length)return;let r=matchMedia(`(prefers-reduced-motion: reduce)`),i=getComputedStyle(t),a=i.fontFamily,o=i.fontWeight,s=document.createElement(`canvas`);s.className=`footer-canvas`,s.setAttribute(`aria-hidden`,`true`),e.appendChild(s);let c=document.createElement(`canvas`),l=c.getContext(`2d`),u=document.createElement(`canvas`),d=u.getContext(`2d`),f=null,p=null,m=null,M=null,N=null,P=null,F=null,I=0,L=0,R=1,z=0,ee=0,B=1e9,V=!1,H={inside:!1,x:0,y:0,px:0,py:0,tx:0,ty:0},U=[.95,.94,.93],W=U,G=U,K=1,q=[.98,.27,0];function te(e,t,n=document.body){let r=getComputedStyle(n).getPropertyValue(e).trim()||t;l.fillStyle=`#000`,l.fillStyle=r;let i=l.fillStyle;if(i[0]===`#`)return[1,3,5].map(e=>parseInt(i.slice(e,e+2),16)/255);let a=i.match(/[\d.]+/g);return a?a.slice(0,3).map(e=>e/255):[.95,.94,.93]}let ne=()=>te(`--fg`,`#f3f1ed`),re=()=>te(`--accent`,`#fa4500`);function ie(){let e=document.createElement(`canvas`),t=e.getContext(`2d`,{willReadFrequently:!0}),r=`${o} ${h}px ${a}`;t.font=r;let i=0,s=0,c=0;n.forEach(e=>{let n=t.measureText(e);i=Math.max(i,n.actualBoundingBoxAscent),s=Math.max(s,n.actualBoundingBoxDescent),c=Math.max(c,n.width)});let l=Math.ceil(i)+2;e.width=Math.ceil(c+48),e.height=l+Math.ceil(s)+2,t.font=r,t.textBaseline=`alphabetic`,t.textAlign=`left`,t.fillStyle=`#000`;let u=n.map(n=>{t.clearRect(0,0,e.width,e.height),t.fillText(n,24,l);let{data:r}=t.getImageData(0,0,e.width,e.height),i=new Float32Array(e.height).fill(NaN),a=new Float32Array(e.height).fill(NaN),o=1/0,s=-1/0;for(let t=0;t<e.height;t++){let n=-1,c=-1;for(let i=0;i<e.width;i++)r[(t*e.width+i)*4+3]>100&&(n<0&&(n=i),c=i);n>=0&&(i[t]=n-24,a[t]=c+1-24,o=Math.min(o,i[t]),s=Math.max(s,a[t]))}return{L:i,R:a,minL:o,maxR:s}}),d=[0];for(let e=0;e<u.length-1;e++){let t=u[e],n=u[e+1],r=[];for(let e=0;e<t.L.length;e++)!Number.isNaN(t.R[e])&&!Number.isNaN(n.L[e])&&r.push(n.L[e]-t.R[e]);let i=e=>r.reduce((t,n)=>t+Math.min(_.cap*h,n+e),0)/r.length,a=_.min*h-Math.min(...r);if(i(a)<_.target*h){let e=a,t=a+h;for(let n=0;n<32;n++){let n=(e+t)/2;i(n)<_.target*h?e=n:t=n}a=t}d.push(d[e]+a)}let f=d[0]+u[0].minL;return{pens:d,left:f,extent:d[d.length-1]+u[u.length-1].maxR-f,maxAsc:i,maxDesc:s}}function ae(e,t){let n=f.createShader(e);if(f.shaderSource(n,t),f.compileShader(n),!f.getShaderParameter(n,f.COMPILE_STATUS))throw Error(f.getShaderInfoLog(n)||`shader compile failed`);return n}function J(e,t){let n=f.createProgram();if(f.attachShader(n,e),f.attachShader(n,ae(f.FRAGMENT_SHADER,t)),f.bindAttribLocation(n,0,`a_pos`),f.linkProgram(n),!f.getProgramParameter(n,f.LINK_STATUS))throw Error(f.getProgramInfoLog(n)||`link failed`);return{pr:n,u:{}}}function Y(e,t){let n=e.u[t];return n===void 0&&(n=f.getUniformLocation(e.pr,t),e.u[t]=n),n}function X(e,t){f.activeTexture(f.TEXTURE0+e),f.bindTexture(f.TEXTURE_2D,t)}function Z(e){f.useProgram(e.pr)}function Q(e){e?(f.bindFramebuffer(f.FRAMEBUFFER,e.f),f.viewport(0,0,e.w,e.h)):(f.bindFramebuffer(f.FRAMEBUFFER,null),f.viewport(0,0,s.width,s.height)),f.drawArrays(f.TRIANGLES,0,3)}function oe(e){let t=f.createTexture();f.bindTexture(f.TEXTURE_2D,t),f.texParameteri(f.TEXTURE_2D,f.TEXTURE_MIN_FILTER,f.NEAREST),f.texParameteri(f.TEXTURE_2D,f.TEXTURE_MAG_FILTER,f.NEAREST),f.texImage2D(f.TEXTURE_2D,0,f.RGBA,4,4,0,f.RGBA,e,null);let n=f.createFramebuffer();f.bindFramebuffer(f.FRAMEBUFFER,n),f.framebufferTexture2D(f.FRAMEBUFFER,f.COLOR_ATTACHMENT0,f.TEXTURE_2D,t,0);let r=f.checkFramebufferStatus(f.FRAMEBUFFER)===f.FRAMEBUFFER_COMPLETE;return f.bindFramebuffer(f.FRAMEBUFFER,null),f.deleteFramebuffer(n),f.deleteTexture(t),r}function se(){let e=[],t=f.getExtension(`OES_texture_half_float`);return t&&(f.getExtension(`EXT_color_buffer_half_float`),e.push({type:t.HALF_FLOAT_OES,linear:!!f.getExtension(`OES_texture_half_float_linear`)})),f.getExtension(`OES_texture_float`)&&(f.getExtension(`WEBGL_color_buffer_float`),e.push({type:f.FLOAT,linear:!!f.getExtension(`OES_texture_float_linear`)})),e.find(e=>oe(e.type))||null}function $(e,t,n){let r=f.createTexture();f.bindTexture(f.TEXTURE_2D,r),f.texParameteri(f.TEXTURE_2D,f.TEXTURE_MIN_FILTER,n),f.texParameteri(f.TEXTURE_2D,f.TEXTURE_MAG_FILTER,n),f.texParameteri(f.TEXTURE_2D,f.TEXTURE_WRAP_S,f.CLAMP_TO_EDGE),f.texParameteri(f.TEXTURE_2D,f.TEXTURE_WRAP_T,f.CLAMP_TO_EDGE),f.texImage2D(f.TEXTURE_2D,0,f.RGBA,e,t,0,f.RGBA,N.type,null);let i=f.createFramebuffer();return f.bindFramebuffer(f.FRAMEBUFFER,i),f.framebufferTexture2D(f.FRAMEBUFFER,f.COLOR_ATTACHMENT0,f.TEXTURE_2D,r,0),f.viewport(0,0,e,t),f.clearColor(0,0,0,1),f.clear(f.COLOR_BUFFER_BIT),f.bindFramebuffer(f.FRAMEBUFFER,null),{tex:r,f:i,w:e,h:t}}function ce(e,t,n){let r=$(e,t,n),i=$(e,t,n);return{get read(){return r},get write(){return i},swap(){let e=r;r=i,i=e},all(){return[r,i]}}}function le(e){e&&(f.deleteTexture(e.tex),f.deleteFramebuffer(e.f))}function ue(){if(f=s.getContext(`webgl`,{alpha:!0,antialias:!1,premultipliedAlpha:!0,powerPreference:`low-power`}),!f)return!1;M=null,N=null,P=null;try{let e=f.createBuffer();f.bindBuffer(f.ARRAY_BUFFER,e),f.bufferData(f.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),f.STATIC_DRAW),f.enableVertexAttribArray(0),f.vertexAttribPointer(0,2,f.FLOAT,!1,0,0),N=se();let t=ae(f.VERTEX_SHADER,y),n=b(!!N&&!N.linear);if(M={display:J(t,n+x)},N)try{M.clear=J(t,n+S),M.drag=J(t,n+C),M.splat=J(t,n+w),M.curl=J(t,n+T),M.vort=J(t,n+E),M.div=J(t,n+D),M.press=J(t,n+O),M.grad=J(t,n+k),M.advVel=J(t,n+A),M.advDye=J(t,n+j)}catch(e){console.warn(`[footer] liquid unavailable, showing the static wordmark.`,e),N=null}}catch(e){return console.warn(`[footer] wordmark shader unavailable, using plain text.`,e),!1}return p=f.createTexture(),f.bindTexture(f.TEXTURE_2D,p),f.texParameteri(f.TEXTURE_2D,f.TEXTURE_MIN_FILTER,f.LINEAR),f.texParameteri(f.TEXTURE_2D,f.TEXTURE_MAG_FILTER,f.LINEAR),f.texParameteri(f.TEXTURE_2D,f.TEXTURE_WRAP_S,f.CLAMP_TO_EDGE),f.texParameteri(f.TEXTURE_2D,f.TEXTURE_WRAP_T,f.CLAMP_TO_EDGE),m=f.createTexture(),f.bindTexture(f.TEXTURE_2D,m),f.texParameteri(f.TEXTURE_2D,f.TEXTURE_MIN_FILTER,f.NEAREST),f.texParameteri(f.TEXTURE_2D,f.TEXTURE_MAG_FILTER,f.NEAREST),f.texImage2D(f.TEXTURE_2D,0,f.RGBA,1,1,0,f.RGBA,f.UNSIGNED_BYTE,new Uint8Array(4)),!0}function de(){P&&=([...P.vel.all(),...P.dye.all(),...P.press.all(),P.curl,P.div].forEach(le),f.deleteTexture(P.solid),null)}function fe(){if(de(),!N||!M.drag)return;let e=Math.min(720,Math.max(64,Math.round(I*v.velRes))),t=Math.max(24,Math.round(L*v.velRes)),n=Math.min(1600,Math.max(128,Math.round(I*v.dyeRes))),r=Math.max(48,Math.round(L*v.dyeRes)),i=N.linear?f.LINEAR:f.NEAREST;u.width=e,u.height=t,d.clearRect(0,0,e,t),d.imageSmoothingEnabled=!0,d.imageSmoothingQuality=`high`,d.drawImage(c,0,0,e,t);let a=f.createTexture();f.bindTexture(f.TEXTURE_2D,a),f.texParameteri(f.TEXTURE_2D,f.TEXTURE_MIN_FILTER,f.LINEAR),f.texParameteri(f.TEXTURE_2D,f.TEXTURE_MAG_FILTER,f.LINEAR),f.texParameteri(f.TEXTURE_2D,f.TEXTURE_WRAP_S,f.CLAMP_TO_EDGE),f.texParameteri(f.TEXTURE_2D,f.TEXTURE_WRAP_T,f.CLAMP_TO_EDGE),f.pixelStorei(f.UNPACK_FLIP_Y_WEBGL,!0),f.texImage2D(f.TEXTURE_2D,0,f.RGBA,f.RGBA,f.UNSIGNED_BYTE,u),f.pixelStorei(f.UNPACK_FLIP_Y_WEBGL,!1),P={vw:e,vh:t,dw:n,dh:r,solid:a,vel:ce(e,t,i),dye:ce(n,r,i),curl:$(e,t,f.NEAREST),div:$(e,t,f.NEAREST),press:ce(e,t,f.NEAREST)},V=!1}function pe(){P&&(f.clearColor(0,0,0,1),[...P.vel.all(),...P.dye.all(),...P.press.all()].forEach(e=>{f.bindFramebuffer(f.FRAMEBUFFER,e.f),f.viewport(0,0,e.w,e.h),f.clear(f.COLOR_BUFFER_BIT)}),f.bindFramebuffer(f.FRAMEBUFFER,null))}function me(){if(!f||!F)return;let t=Math.floor(e.clientWidth);if(t<40)return;I=t;let r=Math.min(g,I*h/F.extent),i=r/h;L=Math.ceil((F.maxAsc+F.maxDesc)*i+4);let u=f.getParameter(f.MAX_TEXTURE_SIZE)||4096;R=Math.min(window.devicePixelRatio||1,2,u/I);let d=Math.ceil(I*R),m=Math.ceil(L*R);s.width=d,s.height=m,s.style.width=`${I}px`,s.style.height=`${L}px`,c.width=d,c.height=m,l.setTransform(R,0,0,R,0,0),l.clearRect(0,0,I,L),l.font=`${o} ${r}px ${a}`,l.textBaseline=`alphabetic`,l.textAlign=`left`,l.fillStyle=`#fff`;let _=(I-F.extent*i)/2,v=2+F.maxAsc*i;n.forEach((e,t)=>l.fillText(e,_+(F.pens[t]-F.left)*i,v)),X(0,p),f.texImage2D(f.TEXTURE_2D,0,f.RGBA,f.RGBA,f.UNSIGNED_BYTE,c),fe(),he(),e.classList.add(`has-canvas`)}function he(){if(!f||f.isContextLost()||!I)return;let e=M.display;Z(e),X(0,p),X(1,P?P.dye.read.tex:m),f.uniform1i(Y(e,`u_mask`),0),f.uniform1i(Y(e,`u_dye`),1),f.uniform2f(Y(e,`u_px`),s.width,s.height),f.uniform2f(Y(e,`u_dyeTexel`),P?1/P.dw:1,P?1/P.dh:1),f.uniform3f(Y(e,`u_ink`),U[0],U[1],U[2]),f.uniform3f(Y(e,`u_accent`),q[0],q[1],q[2]),f.uniform1f(Y(e,`u_shine`),v.shine),f.disable(f.BLEND),f.clearColor(0,0,0,0),f.bindFramebuffer(f.FRAMEBUFFER,null),f.viewport(0,0,s.width,s.height),f.clear(f.COLOR_BUFFER_BIT),Q(null)}let ge=()=>{let e=Math.max(22,Math.min(64,L*v.radius))/L;return e*e};function _e(e,t,n,r,i){let a=M.drag;Z(a),X(0,P.vel.read.tex),X(1,P.solid),f.uniform1i(Y(a,`uTarget`),0),f.uniform1i(Y(a,`uSolid`),1),f.uniform2f(Y(a,`uPoint`),e,t),f.uniform2f(Y(a,`uPv`),n,r),f.uniform1f(Y(a,`uCoupling`),i),f.uniform1f(Y(a,`uRadius`),ge()),f.uniform1f(Y(a,`uAspect`),I/L),Q(P.vel.write),P.vel.swap()}function ve(e,t,n){let r=M.splat;Z(r),X(0,P.dye.read.tex),X(1,P.solid),f.uniform1i(Y(r,`uTarget`),0),f.uniform1i(Y(r,`uSolid`),1),f.uniform2f(Y(r,`uPoint`),e,t),f.uniform1f(Y(r,`uAmount`),n),f.uniform1f(Y(r,`uMax`),v.dyeMax),f.uniform1f(Y(r,`uRadius`),ge()*.8),f.uniform1f(Y(r,`uAspect`),I/L),Q(P.dye.write),P.dye.swap()}function ye(e){if(!H.inside)return!1;let t=1-Math.exp(-e*32);H.px=H.x,H.py=H.y,H.x+=(H.tx-H.x)*t,H.y+=(H.ty-H.y)*t;let n=Math.max(e,1/120),r=H.x-H.px,i=H.y-H.py,a=Math.hypot(r,i),o=a/n;if(a<.15||o<14)return!1;let s=Math.max(22,Math.min(64,L*v.radius)),c=Math.min(10,Math.max(1,Math.ceil(a/(s*.5)))),l=1-(1-(1-Math.exp(-v.drag*n)))**(1/c),u=r/n*v.velRes,d=-i/n*v.velRes,f=Math.hypot(u,d);f>900&&(u*=900/f,d*=900/f);let p=v.dyeRate*n*(.18+.82*Math.min(1,o/900))/c;for(let e=1;e<=c;e++){let t=e/c,n=(H.px+r*t)/I,a=1-(H.py+i*t)/L;_e(n,a,u,d,l),ve(n,a,p)}return V=!0,B=0,!0}function be(e){let t=P,n=[1/t.vw,1/t.vh],r=[1/t.dw,1/t.dh],i;f.disable(f.BLEND),i=M.curl,Z(i),X(0,t.vel.read.tex),f.uniform1i(Y(i,`uVelocity`),0),f.uniform2f(Y(i,`uTexel`),n[0],n[1]),Q(t.curl),i=M.vort,Z(i),X(0,t.vel.read.tex),X(1,t.curl.tex),X(2,t.solid),f.uniform1i(Y(i,`uVelocity`),0),f.uniform1i(Y(i,`uCurl`),1),f.uniform1i(Y(i,`uSolid`),2),f.uniform2f(Y(i,`uTexel`),n[0],n[1]),f.uniform1f(Y(i,`uStrength`),v.vorticity),f.uniform1f(Y(i,`uDt`),e),Q(t.vel.write),t.vel.swap(),i=M.div,Z(i),X(0,t.vel.read.tex),X(1,t.solid),f.uniform1i(Y(i,`uVelocity`),0),f.uniform1i(Y(i,`uSolid`),1),f.uniform2f(Y(i,`uTexel`),n[0],n[1]),Q(t.div),i=M.clear,Z(i),X(0,t.press.read.tex),f.uniform1i(Y(i,`uTex`),0),f.uniform1f(Y(i,`uValue`),v.pressureKeep),Q(t.press.write),t.press.swap(),i=M.press,Z(i),X(1,t.div.tex),X(2,t.solid),f.uniform1i(Y(i,`uPressure`),0),f.uniform1i(Y(i,`uDivergence`),1),f.uniform1i(Y(i,`uSolid`),2),f.uniform2f(Y(i,`uTexel`),n[0],n[1]);for(let e=0;e<v.pressureIters;e++)X(0,t.press.read.tex),Q(t.press.write),t.press.swap();i=M.grad,Z(i),X(0,t.press.read.tex),X(1,t.vel.read.tex),X(2,t.solid),f.uniform1i(Y(i,`uPressure`),0),f.uniform1i(Y(i,`uVelocity`),1),f.uniform1i(Y(i,`uSolid`),2),f.uniform2f(Y(i,`uTexel`),n[0],n[1]),Q(t.vel.write),t.vel.swap(),i=M.advVel,Z(i),X(0,t.vel.read.tex),X(1,t.solid),f.uniform1i(Y(i,`uVelocity`),0),f.uniform1i(Y(i,`uSolid`),1),f.uniform2f(Y(i,`uTexel`),n[0],n[1]),f.uniform1f(Y(i,`uDt`),e),f.uniform1f(Y(i,`uDecay`),Math.exp(-v.velDamping*e)),Q(t.vel.write),t.vel.swap(),i=M.advDye,Z(i),X(0,t.vel.read.tex),X(1,t.dye.read.tex),X(2,t.solid),f.uniform1i(Y(i,`uVelocity`),0),f.uniform1i(Y(i,`uDye`),1),f.uniform1i(Y(i,`uSolid`),2),f.uniform2f(Y(i,`uVelTexel`),n[0],n[1]),f.uniform2f(Y(i,`uDyeTexel`),r[0],r[1]),f.uniform1f(Y(i,`uDt`),e),f.uniform1f(Y(i,`uDecay`),Math.exp(-v.dyeFade*e)),f.uniform1f(Y(i,`uSub`),v.dyeFadeLinear*e),Q(t.dye.write),t.dye.swap()}function xe(){z=0;let e=performance.now(),t=Math.max(0,(e-ee)/1e3),n=Math.min(t,.033);if(ee=e,K<1){K=Math.min(1,K+n/.4);let e=K*K*(3-2*K);U=W.map((t,n)=>t+(G[n]-t)*e)}let r=!1;P&&(ye(Math.min(t,.1))||(B+=n),B<v.rest?(be(Math.max(n,1/240)),r=!0):V&&=(pe(),!1)),he();let i=H.inside&&(Math.abs(H.tx-H.x)>.2||Math.abs(H.ty-H.y)>.2);(r||i||K<1)&&Se()}function Se(){z||=requestAnimationFrame(xe)}function Ce(){z||(ee=performance.now()),Se()}function we(e){let t=s.getBoundingClientRect();return[e.clientX-t.left,e.clientY-t.top]}let Te=e=>e.pointerType!==`touch`&&!r.matches&&!!P;s.addEventListener(`pointerenter`,e=>{if(!Te(e))return;let[t,n]=we(e);H.inside=!0,H.x=H.px=H.tx=t,H.y=H.py=H.ty=n,Ce()}),s.addEventListener(`pointermove`,e=>{if(!Te(e))return;let[t,n]=we(e);H.inside||(H.inside=!0,H.x=H.px=t,H.y=H.py=n),H.tx=t,H.ty=n,Ce()}),s.addEventListener(`pointerleave`,()=>{H.inside=!1,Ce()});let Ee=0;function De(){F=ie(),Ee=0,me()}s.addEventListener(`webglcontextlost`,t=>{t.preventDefault(),P=null,e.classList.remove(`has-canvas`)}),s.addEventListener(`webglcontextrestored`,()=>{ue()&&(U=ne(),W=G=U,q=re(),me())}),new ResizeObserver(()=>{let t=Math.floor(e.clientWidth);t!==Ee&&(Ee=t,me())}).observe(e),new MutationObserver(()=>{W=U,G=ne(),K=0,Ce()}).observe(document.body,{attributes:!0,attributeFilter:[`class`]});function Oe(){if(!ue()){s.remove();return}U=W=G=ne(),q=re(),De()}document.fonts&&document.fonts.ready?(document.fonts.ready.then(Oe),document.fonts.addEventListener?.(`loadingdone`,()=>{f&&De()})):Oe()}var N=640,P=520,F=90,I=6,L=e=>e<.5?2*e*e:1-(-2*e+2)**2/2,R=(e,t)=>{let n=Math.imul(e,374761393)+Math.imul(t,668265263)|0;return n=Math.imul(n^n>>>13,1274126177),((n^n>>>16)>>>0)/4294967296};function z(){ee();let e=document.querySelector(`.contact-button`),t=e&&e.querySelector(`.btn-fill`);if(!e||!t)return;let n=t.getContext(`2d`);if(!n)return;let r=matchMedia(`(prefers-reduced-motion: reduce)`).matches,i=r?1:N,a=r?1:P,o=e.querySelector(`.btn-mark`),s=e.querySelector(`.btn-text`),c=e.querySelector(`.btn-arrow-area`),l=getComputedStyle(document.documentElement).getPropertyValue(`--accent`).trim()||`#fa4500`,u=s.textContent.trim();s.textContent=``;let d=document.createElement(`span`);d.className=`btn-label`;let f=[...u].map(e=>{let t=document.createElement(`span`);return t.className=`ch`,t.textContent=e,d.appendChild(t),t});s.appendChild(d);let p=1,m=6,h=0,g=0,_=new Float32Array,v=[],y=Array(9).fill(!1);function b(e,t){let n=Math.max(0,Math.floor((e.left-t.x)*p/m)),r=Math.min(h-1,Math.floor(((e.right-t.x)*p-.01)/m)),i=Math.max(0,Math.floor((e.top-t.y)*p/m)),a=Math.min(g-1,Math.floor(((e.bottom-t.y)*p-.01)/m)),o=[];for(let e=i;e<=a;e++)for(let t=n;t<=r;t++)o.push(e*h+t);return o}function x(){let n=e.getBoundingClientRect(),r=e.clientLeft,i=e.clientTop,a=n.width-r*2,s=n.height-i*2;if(a<10||s<10)return;p=Math.min(window.devicePixelRatio||1,2),t.width=Math.round(a*p),t.height=Math.round(s*p),m=Math.max(2,Math.round(I*p)),h=Math.ceil(t.width/m),g=Math.ceil(t.height/m),_=new Float32Array(h*g);for(let e=0;e<g;e++)for(let n=0;n<h;n++){let r=Math.min(1,(n+.5)*m/t.width),i=Math.min(1,(e+.5)*m/t.height);_[e*h+n]=r*.76+i*.08+R(n,e)*.16}let l={x:n.left+r,y:n.top+i};v=[];let u=o.getBoundingClientRect();for(let e=0;e<3;e++)for(let t=0;t<3;t++){let n={left:u.left+t*8,top:u.top+e*8,right:u.left+t*8+5,bottom:u.top+e*8+5};v.push({cells:b(n,l),on:!1,apply:n=>{y[e*3+t]=n,C()}})}f.forEach(e=>{v.push({cells:b(e.getBoundingClientRect(),l),on:!1,apply:t=>e.classList.toggle(`is-on`,t)})});let d=c.getBoundingClientRect(),x=d.left+d.width/2;v.push({cells:b({left:x-10,right:x+10,top:d.top+d.height/2-8,bottom:d.top+d.height/2+8},l),on:!1,apply:e=>c.classList.toggle(`is-arrow-on`,e)}),v.push({cells:b({left:d.left-1,right:d.left+2,top:d.top+d.height*.3,bottom:d.top+d.height*.7},l),on:!1,apply:e=>c.classList.toggle(`is-sep-on`,e)}),w()}let S=new Set([2,4,6]);function C(){if(!y.some(Boolean)){o.style.boxShadow=``;return}o.style.boxShadow=y.map((e,t)=>{let n=t%3,r=t/3|0,i=e?S.has(t)?`var(--on)`:`var(--on-dim)`:S.has(t)?`var(--m1)`:`var(--m0)`;return`${n*8}px ${r*8}px 0 0 ${i}`}).join(`,`)}function w(){let r=L(T);n.clearRect(0,0,t.width,t.height);let i=r>=1;if(r>0){n.fillStyle=l;for(let e=0;e<g;e++){let t=-1;for(let a=0;a<=h;a++){let o=a<h&&(i||_[e*h+a]<r);o&&t<0?t=a:!o&&t>=0&&(n.fillRect(t*m,e*m,(a-t)*m,m),t=-1)}}}v.forEach(e=>{let t=r>0&&e.cells.length>0&&e.cells.every(e=>i||_[e]<r);t!==e.on&&(e.on=t,e.apply(t))}),e.classList.toggle(`is-lit`,T>.001)}let T=0,E=0,D=!1,O=!1,k=!1,A=0,j=0,M=0;function z(e){A=0;let t=Math.max(0,Math.min(e-j,50));j=e,E!==0&&(T+=E*t/(E>0?i:a),E>0&&T>=1?(T=1,E=0,H()):E<0&&T<=0&&(T=0,E=0)),w(),E!==0&&(A=requestAnimationFrame(z))}function B(t){E=t,e.classList.toggle(`is-hot`,t>0),A||=(j=performance.now(),requestAnimationFrame(z))}function V(e){clearTimeout(M),M=setTimeout(()=>{!D&&T>0&&E===0&&B(-1)},e)}function H(){D||V(F)}function U(e){D!==e&&(D=e,D?(clearTimeout(M),(E<0||E===0&&T<1)&&B(1)):E===0&&T>0&&V(0))}let W=()=>U(O||k);e.addEventListener(`pointerenter`,e=>{e.pointerType!==`touch`&&(O=!0,W())}),e.addEventListener(`pointerleave`,e=>{e.pointerType!==`touch`&&(O=!1,W())}),e.addEventListener(`focus`,()=>{k=e.matches(`:focus-visible`),W()}),e.addEventListener(`blur`,()=>{k=!1,W()});let G=``;new ResizeObserver(()=>{let t=e.getBoundingClientRect(),n=`${Math.round(t.width*10)}x${Math.round(t.height*10)}@${window.devicePixelRatio}`;n!==G&&(G=n,x())}).observe(e),document.fonts?.ready.then(()=>{G=``,x()}),x()}function ee(){document.querySelectorAll(`[data-book]`).forEach(e=>{e.addEventListener(`click`,()=>{let e=document.getElementById(`bookingToast`);e&&(e.classList.remove(`show`),e.offsetWidth,e.classList.add(`show`))})})}var B={get(){try{return localStorage.getItem(`sutra-theme`)}catch{return null}},set(e){try{localStorage.setItem(`sutra-theme`,e)}catch{}}};function V(){let e=document.getElementById(`themeToggle`);e&&(B.get()===`light`&&document.body.classList.add(`light-mode`),e.textContent=document.body.classList.contains(`light-mode`)?`DARK`:`LIGHT`,e.addEventListener(`click`,()=>{document.body.classList.toggle(`light-mode`);let t=document.body.classList.contains(`light-mode`);e.textContent=t?`DARK`:`LIGHT`,B.set(t?`light`:`dark`)}))}function H(){let e=document.querySelector(`.header .logo`);e&&e.addEventListener(`click`,e=>{if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;e.preventDefault();let t=matchMedia(`(prefers-reduced-motion: reduce)`).matches;window.scrollTo({top:0,behavior:t?`auto`:`smooth`}),location.hash&&history.replaceState(null,``,location.pathname+location.search)})}function U(e){let t=[[]];[...e.childNodes].forEach(e=>{e.nodeName===`BR`?t.push([]):t[t.length-1].push(e)}),e.innerHTML=``,t.forEach((t,n)=>{if(!t.length)return;let r=document.createElement(`div`);r.className=`reveal-line`;let i=document.createElement(`div`);i.className=`reveal-line-inner`,i.style.setProperty(`--d`,`${.18+n*.14}s`),t.forEach(e=>i.appendChild(e)),r.appendChild(i),e.appendChild(r)})}function W(){let e=[...document.querySelectorAll(`.reveal-trigger`)];if(!e.length)return;e.forEach(e=>{let t=e.querySelector(`h2.reveal-item`);t&&!t.querySelector(`.reveal-line`)&&(U(t),t.classList.remove(`reveal-item`));let n=0;e.querySelectorAll(`.reveal-item`).forEach(e=>{let t=.1+n++*.12;e.classList.contains(`about-index`)?t=0:e.classList.contains(`about-kicker`)?t=.08:e.tagName===`P`&&e.closest(`.about-side`)?t=.7:e.classList.contains(`about-tags`)&&(t=.85),e.style.setProperty(`--d`,`${t}s`)}),e.querySelectorAll(`.about-tags span`).forEach((e,t)=>{e.style.setProperty(`--i`,t)})});let t=new IntersectionObserver(e=>{e.forEach(e=>{e.target.classList.toggle(`is-visible`,e.isIntersecting)})},{threshold:.18,rootMargin:`-5% 0px -5% 0px`});e.forEach(e=>t.observe(e)),document.querySelectorAll(`.about-rule`).forEach(e=>t.observe(e))}var G=(e,t)=>{try{t()}catch(t){console.error(`[sutra] ${e} failed to start`,t)}};G(`theme`,V),G(`header`,H),G(`cursor`,p),G(`magnetic`,m),G(`work`,r),G(`clients`,l),G(`services`,f),G(`footer`,M),G(`booking`,z),G(`reveal`,W);