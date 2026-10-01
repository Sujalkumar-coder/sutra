import{n as e}from"./supabase-C1pZBt_5.js";import{i as t,n,r,t as i}from"./header-DLW4Rrdw.js";import{i as a,n as o,r as s,t as c}from"./scroll-reveal-DNUHvAKR.js";import{r as l,t as u}from"./clients-BnZIS6bf.js";import{a as d,c as f,d as p,i as m,n as h,o as g,r as _,s as v,t as y,u as b}from"./video-65I5EbRW.js";var x={owner_name:`Sujal Kumar`,email:`hello@sutra.studio`,phone:``,location:``,instagram_url:``,facebook_url:``,x_url:``,linkedin_url:``,copyright_text:`© 2026 Sujal Kumar. All rights reserved.`,footer_tagline:`MOTION · VIDEO · STORY`,hero_eyebrow:`SUTRA STUDIO / MOTION · VIDEO · STORY`,hero_title_line_1:`We make ideas`,hero_title_line_2:`impossible to ignore.`,intro_video_url:``,intro_video_type:``,intro_video_title:`INTRO / REEL`,intro_video_meta:`00:00 — 00:30`,intro_published:!0,intro_autoplay:!0,intro_muted:!0},S={...x};async function C(){if(!e)return S={...x},S;let{data:t,error:n}=await e.from(`site_settings`).select(`*`).order(`updated_at`,{ascending:!1}).limit(1).maybeSingle();return n?(console.error(`[sutra] Failed to load site settings:`,n),S={...x},S):t?(t.id,S={...x,...t},S):(S={...x},S)}var w=`sutra-global-muted-v1`,T=`sutra-paused-media-v1`,E=`sutra-work-auto-locked-v1`,D=!1,O=!0,k={},A=!1;function j(e,t){try{return sessionStorage.getItem(e)??t}catch{return t}}function M(){try{return sessionStorage.getItem(E)===`1`}catch{return!1}}function ee(){try{let e=sessionStorage.getItem(T);return e&&JSON.parse(e)||{}}catch{return{}}}function N(e=!0){if(D)return;let t=j(w,null);O=t==null?!!e:t===`1`,k=ee(),A=M(),D=!0}function te(e=!0){return N(e),{muted:O}}function ne(e=!0){return N(e),O}function P(e,t=``){N(e),O=!!e;try{sessionStorage.setItem(w,O?`1`:`0`)}catch{}return window.dispatchEvent(new CustomEvent(`sutra:global-mute`,{detail:{muted:O,source:t}})),O}function F(e){if(typeof e!=`function`)return()=>{};let t=t=>e(!!t.detail?.muted,t.detail?.source||``);return window.addEventListener(`sutra:global-mute`,t),()=>window.removeEventListener(`sutra:global-mute`,t)}function I(e,t=``){return`${e}:${t||`default`}`}function L(e){return N(),!!k[e]}function R(e,t){N(),t?k[e]=!0:delete k[e];try{sessionStorage.setItem(T,JSON.stringify(k))}catch{}}function z(){return N(),A}function B(e){N(),A=!!e;try{sessionStorage.setItem(E,A?`1`:`0`)}catch{}}var V=e=>String(e+1).padStart(2,`0`),re=[`visual-a`,`visual-b`,`visual-c`,`visual-d`,`visual-e`,`visual-f`],H=`sutra-work-manual-pause-v2`;function ie(e){e.querySelectorAll(`[data-sutra-video], .project-media-controls`).forEach(e=>{e.tagName===`VIDEO`&&(e.pause(),e.removeAttribute(`src`),e.load()),e.remove()})}function U(){try{return sessionStorage.getItem(H)||``}catch{return``}}function ae(e){try{e?sessionStorage.setItem(H,e):sessionStorage.removeItem(H)}catch{}}function oe(e){return e.image||e.poster||f(e.video||``)||``}function se(e,t){let n=oe(t);e.dataset.src=n,e.style.backgroundImage=n?`url("${n}")`:``,e.classList.toggle(`has-media`,!!n)}function ce(e,t,n,r,i){let a=document.createElement(`div`);a.className=`project-media-controls`,a.innerHTML=`
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
  `;let o=a.querySelector(`[data-media-play]`),s=a.querySelector(`[data-media-mute]`),c=t.dataset.sutraPlaying===`1`,l=r(),u=()=>{o.innerHTML=`
      <span class="media-pause-icon ${c?``:`is-play`}"></span>
    `,o.setAttribute(`aria-label`,c?`Pause video`:`Play video`),s.innerHTML=`
      <span class="media-sound-icon ${l?`is-muted`:``}"></span>
    `,s.setAttribute(`aria-label`,l?`Unmute video`:`Mute video`)};o.addEventListener(`click`,e=>{e.preventDefault(),e.stopPropagation(),c=t.dataset.sutraPlaying===`1`,c?(d(t),c=!1,t.dataset.sutraPlaying=`0`,R(n,!0),ae(n),B(!0),i?.(!0)):(g(t),c=!0,t.dataset.sutraPlaying=`1`,R(n,!1),U()===n&&ae(``),B(!1),i?.(!1)),u()}),s.addEventListener(`click`,e=>{e.preventDefault(),e.stopPropagation(),P(!r(),`work`)}),t.tagName===`VIDEO`&&(t.addEventListener(`play`,()=>{c=!0,u()}),t.addEventListener(`pause`,()=>{c=!1,u()})),e.appendChild(a),u()}function le(){let e=document.getElementById(`workStage`);if(!e)return;let t=[...e.querySelectorAll(`.project-card`)],n=[`far-left`,`prev`,`active`,`next`,`far-right`],r=a.length;if(!r||t.length!==n.length){e.classList.add(`is-empty`);return}te(!0);let i=1150,o=Math.min(2,r-1),s=matchMedia(`(prefers-reduced-motion: reduce)`).matches,c=document.getElementById(`projectCategory`),l=document.getElementById(`projectTitleLink`),u=document.getElementById(`projectDescription`),p=document.getElementById(`projectCurrent`),y=document.getElementById(`projectTotal`),b=e=>(e%r+r)%r,x=0,S=!1,C=null,w=0,T=0,E=!1,D=!1,O=ne(!0),k=[...t],A=new Map,j=document.createElement(`div`);j.className=`video-warm-cache`,j.setAttribute(`aria-hidden`,`true`),Object.assign(j.style,{position:`fixed`,left:`-1800px`,top:`0`,width:`640px`,height:`360px`,overflow:`hidden`,opacity:`0.001`,pointerEvents:`none`,contain:`strict`}),document.body.appendChild(j),y.textContent=V(r-1);let M=()=>I(`work`,a[x]?.id||a[x]?.slug||x);function ee(e,t){let n=b(t),r=a[n],i=e.querySelector(`.project-visual`);if(!i||!r)return;ie(i),i.className=`project-visual ${re[n%re.length]}`;let o=document.createElement(`span`);if(o.textContent=V(n),i.appendChild(o),se(i,r),!r.video)return;let s=r.id||`local-${n}`,c=A.get(s);c?(A.delete(s),c.dataset.warm=`false`):c=h({url:r.video,type:_(r.video,r.videoType),title:r.title||`Project video`,autoplay:!1,muted:!0,loop:!0,controls:!1,poster:r.poster||r.image||f(r.video),priority:`high`,className:`project-media`}),c&&(c.dataset.sutraVideo=`true`,c.dataset.projectIndex=String(n),c.dataset.sutraPlaying=`0`,i.appendChild(c),ce(i,c,I(`work`,r.id||r.slug||n),()=>O,e=>{if(n===x){if(D=e,q=!0,K(),e)ae(I(`work`,r.id||r.slug||n)),B(!0);else{let e=I(`work`,r.id||r.slug||n);U()===e&&ae(``),B(!1)}}}))}function N(e){let t=b(e),n=a[t];if(!n?.video)return;let r=n.id||`local-${t}`;if(A.has(r)||k.some(e=>e.querySelector(`[data-project-index="${t}"]`)))return;let i=h({url:n.video,type:_(n.video,n.videoType),title:n.title||`Project video`,autoplay:!1,muted:!0,loop:!0,controls:!1,poster:n.poster||n.image||f(n.video),priority:`high`,className:`project-media`});i&&(i.dataset.warm=`true`,i.dataset.projectIndex=String(t),i.dataset.sutraPlaying=`0`,j.appendChild(i),A.set(r,i))}function P(){let e=new Set([b(x+3),b(x+4),b(x-3),b(x-4)]);for(let[t,n]of A)e.has(Number(n.dataset.projectIndex))||(n.remove(),A.delete(t))}function R(){P(),N(x+3),N(x+4),N(x-3)}function H(){O=ne(!0),k.forEach(e=>{let t=e.querySelector(`[data-sutra-video]`);if(!t)return;O?m(t):e.classList.contains(`project-active`)?v(t):m(t);let n=e.querySelector(`[data-media-mute]`);n&&(n.querySelector(`.media-sound-icon`)?.classList.toggle(`is-muted`,O),n.setAttribute(`aria-label`,O?`Unmute video`:`Mute video`))})}function oe(){k.forEach((e,t)=>{e.className=`project-card project-${n[t]}`}),k.forEach((e,t)=>{let n=e.querySelector(`[data-sutra-video]`);if(!n||n.tagName!==`IFRAME`)return;let r=t===2||t===1||t===3?`high`:`auto`;n.setAttribute(`fetchpriority`,r),n.fetchPriority=r})}function le(t,n){c&&(c.textContent=t.category||``),u&&(u.textContent=t.desc||``),p&&(p.textContent=V(n)),e.style.setProperty(`--p`,(n+1)/r);let i=t.slug?`./project.html?slug=${encodeURIComponent(t.slug)}`:``;l&&(l.textContent=t.title||``,l.href=i||`#`,l.setAttribute(`aria-disabled`,i?`false`:`true`))}function W(e,t){let n=[c,l,u].filter(Boolean);n.forEach((e,t)=>{e.animate([{opacity:1,transform:`translateY(0)`},{opacity:0,transform:`translateY(${t===1?12:7}px)`}],{duration:180,easing:`cubic-bezier(.7,0,1,1)`,fill:`forwards`})}),setTimeout(()=>{le(e,t),n.forEach((e,t)=>{e.animate([{opacity:0,transform:`translateY(${t===1?-12:-7}px)`},{opacity:1,transform:`translateY(0)`}],{duration:600,delay:t*45,easing:`cubic-bezier(.16,1,.3,1)`,fill:`forwards`})})},190)}function G(){let e=M();D=L(e)||U()===e;let t=z();k.forEach((e,n)=>{let r=e.querySelector(`[data-sutra-video]`);if(!r)return;let i=n===2&&E&&!document.hidden&&!S&&!D&&!t;i?(O?m(r):v(r),g(r),r.dataset.sutraPlaying=`1`):(d(r),m(r),r.dataset.sutraPlaying=`0`);let a=e.querySelector(`[data-media-play]`);a&&(a.innerHTML=`
          <span class="media-pause-icon ${i?``:`is-play`}"></span>
        `,a.setAttribute(`aria-label`,i?`Pause video`:`Play video`))})}function K(){clearTimeout(T),T=0}function ue(e,t=!1){if(r<2)return;if(S){C={dir:e,auto:t};return}let n=M();if(t&&(D||L(n)||U()===n||z())){K();return}S=!0,G();let o=e>0?k.shift():k.pop();o.style.transition=`none`,ee(o,e>0?x+3:x-3),e>0?k.push(o):k.unshift(o),o.className=`project-card project-${e>0?`far-right`:`far-left`}`,o.offsetWidth,o.style.transition=``,x=b(x+e),D=L(M())||U()===M(),oe(),R(),H(),W(a[x],x),setTimeout(()=>{if(S=!1,D=L(M())||U()===M(),C){let e=C;if(C=null,e.auto&&(D||L(M())||U()===M()||z())){K(),G();return}ue(e.dir,e.auto);return}G(),!D&&!z()&&!s&&E&&!q&&J()},i)}let q=s||r<2;function J(){K(),!(q||z()||!E||document.hidden||D)&&(T=setTimeout(()=>{let e=M();if(document.hidden||!E||S||L(e)||U()===e||z()){K();return}if(ue(1,!0),w+=1,w>=o){q=!0;return}J()},3e3))}function Y(e){q=!0,K(),B(!1),ue(e,!1)}k.forEach((e,t)=>{ee(e,x+t-2)}),oe(),R(),le(a[0],0),D=L(M())||U()===M(),B(D),document.getElementById(`prevProject`)?.addEventListener(`click`,()=>Y(-1)),document.getElementById(`nextProject`)?.addEventListener(`click`,()=>Y(1)),e.tabIndex=0,e.addEventListener(`keydown`,e=>{e.key===`ArrowRight`&&(e.preventDefault(),Y(1)),e.key===`ArrowLeft`&&(e.preventDefault(),Y(-1))});let de=!1;e.addEventListener(`wheel`,t=>{if(Math.abs(t.deltaY)<10||de||S)return;let n=e.getBoundingClientRect();n.top<innerHeight*.8&&n.bottom>innerHeight*.2&&(t.preventDefault(),de=!0,Y(t.deltaY>0?1:-1),setTimeout(()=>de=!1,i))},{passive:!1});let fe=F(e=>{O=e,H(),G()}),X=new IntersectionObserver(([e])=>{if(E=e.isIntersecting&&e.intersectionRatio>=.45,!E){K(),k.forEach(e=>{let t=e.querySelector(`[data-sutra-video]`);t&&(d(t),m(t),t.dataset.sutraPlaying=`0`)});return}D=L(M())||U()===M(),B(!!D),H(),G(),D||J()},{threshold:[0,.45,.75]});X.observe(e),document.addEventListener(`visibilitychange`,()=>{document.hidden?(K(),k.forEach(e=>{let t=e.querySelector(`[data-sutra-video]`);t&&(d(t),m(t),t.dataset.sutraPlaying=`0`)})):E&&(D=L(M())||U()===M(),B(!!D),H(),G(),D||J())}),H(),e._sutraMediaCleanup=()=>{fe(),X.disconnect(),j.remove()}}var W=e=>String(e+1).padStart(2,`0`),G=(e=``)=>String(e).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e]),K=e=>String(e||``).trim().charAt(0).toUpperCase();function ue(){let e=document.getElementById(`clientsApp`);if(!e)return;if(!u.length){e.innerHTML=`<div class="cms-empty-public">No published clients yet.</div>`;return}let t=u.map(e=>e.name.toUpperCase()),n=Array.from({length:Math.max(2,Math.ceil(14/t.length))},()=>t).flat();e.innerHTML=`
    <div class="cl-stage">
      <div class="cl-list" role="tablist" aria-label="Clients">
        ${u.map((e,t)=>`<button type="button" class="cl-item" role="tab" data-i="${t}" aria-selected="false"><span>${W(t)}</span><strong>${G(e.name)}</strong></button>`).join(``)}
      </div>
      <div class="cl-gallery-panel">
        <div class="cl-gallery" data-gallery>
          <div class="cl-gallery-frame" data-gallery-frame>
            <div class="cl-gallery-image" data-gallery-image></div>
            <div class="cl-gallery-overlay">
              <div class="cl-gallery-top"><span data-gallery-index>01</span><span class="cl-gallery-status">CLIENT / GALLERY</span></div>
              <div class="cl-gallery-copy"><h3 data-name></h3><p data-desc></p></div>
              <div class="cl-gallery-bottom"><div class="cl-gallery-count"><span data-gallery-cur>01</span><i></i><span data-gallery-total>01</span></div><div class="cl-gallery-arrows"><button type="button" data-gallery-step="-1" aria-label="Previous client gallery image">←</button><button type="button" data-gallery-step="1" aria-label="Next client gallery image">→</button></div></div>
            </div>
          </div>
        </div>
      </div>
      <div class="cl-portrait-panel">
        <div class="cl-portrait-frame" data-portrait>
          <div class="cl-portrait-watermark" data-mono></div>
          <img data-portrait-img alt="">
          <div class="cl-portrait-label"><span>CLIENT PHOTO</span><span data-portrait-meta></span></div>
        </div>
      </div>
    </div>
    <div class="cl-marquee" aria-hidden="true"><div class="cl-marquee-track">${[...n,...n].map(e=>`<span>${G(e)}</span><i></i>`).join(``)}</div></div>`;let r=[...e.querySelectorAll(`.cl-item`)],i=e.querySelector(`[data-gallery-image]`),a=e.querySelector(`[data-name]`),o=e.querySelector(`[data-desc]`),s=e.querySelector(`[data-gallery-cur]`),c=e.querySelector(`[data-gallery-total]`),l=e.querySelector(`[data-gallery-index]`),d=e.querySelector(`[data-portrait]`),f=e.querySelector(`[data-portrait-img]`),p=e.querySelector(`[data-mono]`),m=e.querySelector(`[data-portrait-meta]`),h=0,g=0;function _(e){return[...e.gallery||[]].filter(Boolean).length?[...e.gallery||[]].filter(Boolean):[e.primary_image_url||e.image||``].filter(Boolean)}function v(e,t=!0){let n=_(e);if(!n.length){i.style.backgroundImage=``,c.textContent=`01`,s.textContent=`01`;return}g=(g+n.length)%n.length;let r=n[g];i.style.backgroundImage=r?`url("${r}")`:``,s.textContent=W(g),c.textContent=W(n.length-1),l.textContent=W(g),t&&(i.classList.remove(`gallery-swap`),i.offsetWidth,i.classList.add(`gallery-swap`))}function y(e){h=(e+u.length)%u.length;let t=u[h];g=0,r.forEach((e,t)=>{e.classList.toggle(`active`,t===h),e.setAttribute(`aria-selected`,t===h?`true`:`false`)}),a.textContent=t.name||``,o.textContent=t.description||``,p.textContent=K(t.name),m.textContent=[t.year,t.url?`VIEW ↗`:``].filter(Boolean).join(` · `),t.image?(d.style.setProperty(`--portrait-bg`,`url("${t.image}")`),f.src=t.image,f.alt=t.name||`Client`,d.classList.add(`has-image`)):(d.style.removeProperty(`--portrait-bg`),f.removeAttribute(`src`),f.alt=``,d.classList.remove(`has-image`)),v(t,!1)}e.addEventListener(`click`,e=>{let t=e.target.closest(`.cl-item`),n=e.target.closest(`[data-gallery-step]`);if(t)y(+t.dataset.i),r[+t.dataset.i]?.scrollIntoView({block:`nearest`,inline:`nearest`});else if(n){let e=_(u[h]);if(!e.length)return;g=(g+ +n.dataset.galleryStep+e.length)%e.length,v(u[h],!0)}}),e.querySelector(`.cl-list`).addEventListener(`keydown`,e=>{let t={ArrowDown:1,ArrowRight:1,ArrowUp:-1,ArrowLeft:-1}[e.key];t&&(e.preventDefault(),y(h+t),r[h].focus())}),r.forEach(e=>e.addEventListener(`pointerenter`,t=>{t.pointerType===`mouse`&&y(+e.dataset.i)})),y(0)}var q=e=>String(e+1).padStart(2,`0`),J=(e=``)=>String(e).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e]);function Y(){let e=document.getElementById(`serviceList`),t=document.getElementById(`serviceArt`),n=document.getElementById(`serviceVisualTitle`),r=document.getElementById(`serviceIndex`);if(!e||!t)return;if(!p.length){e.innerHTML=`<div class="cms-empty-public">No published services yet.</div>`;return}e.innerHTML=p.map((e,t)=>`
    <a class="service-item" href="./service.html?slug=${encodeURIComponent(e.slug)}" data-i="${t}" style="--sv:${J(e.accent||`#c8dcff`)};--sv-start:${J(e.gradientStart||e.accent||`#c8dcff`)};--sv-end:${J(e.gradientEnd||`#111111`)};--sv-angle:${Number.isFinite(Number(e.gradientAngle))?Number(e.gradientAngle):135}deg">
      <span class="service-no">${q(t)}</span>
      <strong>${J(e.title)}</strong>
      <em class="service-go" aria-hidden="true">→</em>
      <small>${J(e.description||(e.tags||[]).join(` · `))}</small>
    </a>`).join(``);let i=[...e.children],a=-1,o=0;function s(e){if(e=(e+p.length)%p.length,e===a)return;a=e;let s=p[e];i.forEach((t,n)=>t.classList.toggle(`active`,n===e)),t.dataset.mode=s.art??e%6,t.style.setProperty(`--service-accent`,s.accent||`#c8dcff`),t.style.setProperty(`--service-gradient-start`,s.gradientStart||s.accent||`#c8dcff`),t.style.setProperty(`--service-gradient-end`,s.gradientEnd||`#111111`),t.style.setProperty(`--service-gradient`,`linear-gradient(${Number.isFinite(Number(s.gradientAngle))?Number(s.gradientAngle):135}deg, ${s.gradientStart||s.accent||`#c8dcff`}, ${s.gradientEnd||`#111111`})`),n.textContent=s.title.toUpperCase(),r.textContent=q(e),t.classList.remove(`service-changing`),t.offsetWidth,t.classList.add(`service-changing`),clearTimeout(o),o=setTimeout(()=>t.classList.remove(`service-changing`),260)}e.addEventListener(`pointerover`,e=>{if(e.pointerType===`touch`)return;let t=e.target.closest(`.service-item`);t&&s(+t.dataset.i)}),e.addEventListener(`focusin`,e=>{let t=e.target.closest(`.service-item`);t&&s(+t.dataset.i)}),e.addEventListener(`keydown`,e=>{if(e.key!==`ArrowDown`&&e.key!==`ArrowUp`)return;e.preventDefault();let t=(a+(e.key===`ArrowDown`?1:-1)+i.length)%i.length;i[t].focus()}),s(0)}var de=(e,t)=>{e&&(e.classList.toggle(`is-play`,!t),e.setAttribute(`aria-label`,t?`Pause intro video`:`Play intro video`))};function fe(){let e=document.getElementById(`heroStage`),t=document.getElementById(`heroMedia`);if(!e||!t)return;te(S.intro_muted!==!1);let n=document.getElementById(`heroVideoTitle`),r=document.getElementById(`heroVideoMeta`),i=document.getElementById(`heroPlay`),a=document.getElementById(`heroVideoMute`),o=S.intro_published?String(S.intro_video_url||``).trim():``,s=_(o,S.intro_video_type||``),c=S.intro_autoplay!==!1,l=S.intro_video_title||`intro video`,u=I(`intro`,`hero`);if(n&&(n.textContent=S.intro_video_title||`SUTRA / INTRO`),r&&(r.textContent=S.intro_video_meta||``),s===`youtube`){let e=f(o);e&&(t.style.backgroundImage=`url("${e}")`)}if(!o){e.classList.add(`has-placeholder`),i?.remove(),a?.remove();return}let p=y(t,{url:o,type:s,title:l,autoplay:c,muted:ne(S.intro_muted!==!1),loop:!0,controls:!1,poster:s===`youtube`?f(o):``,priority:`high`,className:`hero-media-element`});if(!p){e.classList.add(`has-placeholder`),i?.remove(),a?.remove();return}e.classList.add(`has-video`);let h=!1,b=!1,x=L(u),C=ne(S.intro_muted!==!1),w=()=>{C?m(p):v(p),a?.classList.toggle(`is-muted`,C),a?.setAttribute(`aria-label`,C?`Unmute intro video`:`Mute intro video`)},T=()=>{de(i,h),a?.classList.toggle(`is-muted`,C),a?.setAttribute(`aria-label`,C?`Unmute intro video`:`Mute intro video`)},E=({fromUser:e=!1}={})=>{e&&(x=!1,R(u,!1)),!x&&c&&b&&!document.hidden&&(g(p),h=!0,T())},D=({fromUser:e=!1,hard:t=!1}={})=>{e&&(x=!0,R(u,!0)),d(p),h=!1,t&&!document.hidden&&w(),T()};i?.addEventListener(`click`,e=>{e.preventDefault(),e.stopPropagation(),h?D({fromUser:!0}):E({fromUser:!0})}),a?.addEventListener(`click`,e=>{e.preventDefault(),e.stopPropagation(),P(!C,`hero`)}),p.tagName===`VIDEO`&&(p.addEventListener(`play`,()=>{h=!0,T()}),p.addEventListener(`pause`,()=>{h=!1,T()})),p.addEventListener(`sutra:video-ready`,()=>{w(),!x&&c&&b&&!document.hidden&&E()});let O=F(e=>{C=e,w(),T()}),k=new IntersectionObserver(([e])=>{if(b=e.isIntersecting&&e.intersectionRatio>=.45,!b){h&&D(),m(p);return}!x&&c?(w(),E()):w()},{threshold:[0,.45,.75]});k.observe(e),document.addEventListener(`visibilitychange`,()=>{if(document.hidden){h&&D(),m(p);return}b&&(!x&&c?(w(),E()):w())}),requestAnimationFrame(()=>{let t=e.getBoundingClientRect();b=t.top<innerHeight*.75&&t.bottom>innerHeight*.25,!x&&c&&b?(w(),E()):w()}),[250,900].forEach(e=>setTimeout(()=>{!document.hidden&&b&&!x&&c&&E()},e)),T(),e._sutraMediaCleanup=()=>{O(),k.disconnect()}}var X=(e=``)=>String(e).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e]);function pe(){let e=document.getElementById(`footerDetails`);if(!e)return;let t=[[`Instagram`,S.instagram_url],[`Facebook`,S.facebook_url],[`X`,S.x_url],[`LinkedIn`,S.linkedin_url]].filter(([,e])=>e),n=document.querySelectorAll(`.footer-meta span`);n[1]&&(n[1].textContent=S.footer_tagline||`MOTION · VIDEO · STORY`),n[2]&&(n[2].textContent=S.copyright_text||`© 2026 Sujal Kumar. All rights reserved.`);let r=S.email?`<a href="mailto:${X(S.email)}">${X(S.email)}</a>`:``,i=S.phone?`<a href="tel:${X(S.phone.replace(/[^+\d]/g,``))}">${X(S.phone)}</a>`:``,a=S.location?`<span>${X(S.location)}</span>`:``;e.innerHTML=`
    <div class="footer-details-grid">
      <div class="footer-details-identity">
        <span class="footer-eyebrow">CONTACT</span>
        <strong>${X(S.owner_name||``)}</strong>
        <div class="footer-contact-lines">${r}${i}${a}</div>
      </div>
      <div class="footer-details-social">
        <span class="footer-eyebrow">SOCIAL</span>
        <div class="footer-social-links">
          ${t.length?t.map(([e,t])=>`<a href="${X(t)}" target="_blank" rel="noopener noreferrer">${X(e)} <span>↗</span></a>`).join(``):`<span class="footer-muted">Add social links in Admin.</span>`}
        </div>
      </div>
      <div class="footer-details-meta">
        <span>${X(S.footer_tagline||`MOTION · VIDEO · STORY`)}</span>
        <small>${X(S.copyright_text||`© 2026 Sujal Kumar. All rights reserved.`)}</small>
      </div>
    </div>`}var me=(e,t)=>{let n=document.querySelector(e);n&&(n.textContent=t||``)};function he(){me(`.hero .eyebrow`,S.hero_eyebrow);let e=document.querySelector(`.hero h1`);e&&(e.innerHTML=`${ge(S.hero_title_line_1)}<br><em>${ge(S.hero_title_line_2)}</em>`);let t=S.email||`hello@sutra.studio`;document.querySelectorAll(`[data-site-email]`).forEach(e=>{e.textContent=t,e.href=`mailto:${t}`}),document.querySelectorAll(`[data-book]`).forEach(e=>{e.href=`mailto:${t}`})}function ge(e=``){return String(e).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e])}var Z=240,_e=460,ve={target:.14,cap:.32,min:.05},Q={velRes:.3,dyeRes:.85,pressureIters:22,pressureKeep:.8,vorticity:22,velDamping:1.3,dyeFade:1.6,dyeFadeLinear:.35,dyeMax:2.5,drag:15,dyeRate:4.5,radius:.56,rest:2.2,shine:.35},ye=`
attribute vec2 a_pos;
varying vec2 vUv;
void main(){ vUv = a_pos * 0.5 + 0.5; gl_Position = vec4(a_pos, 0.0, 1.0); }
`,be=e=>`
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
`,xe=`
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
`,Se=`
uniform sampler2D uTex; uniform float uValue;
void main(){ gl_FragColor = uValue * texture2D(uTex, vUv); }
`,Ce=`
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
`,we=`
uniform sampler2D uTarget; uniform sampler2D uSolid;
uniform vec2 uPoint; uniform float uAmount; uniform float uRadius; uniform float uAspect; uniform float uMax;
void main(){
  vec2 d = vUv - uPoint; d.x *= uAspect;
  float g = exp(-dot(d, d) / uRadius);
  float fl = step(0.04, texture2D(uSolid, vUv).a);
  float v = min(texture2D(uTarget, vUv).x + uAmount * g * fl, uMax);
  gl_FragColor = vec4(v, 0.0, 0.0, 1.0);
}
`,Te=`
uniform sampler2D uVelocity; uniform vec2 uTexel;
void main(){
  float L = texture2D(uVelocity, vUv - vec2(uTexel.x, 0.0)).y;
  float R = texture2D(uVelocity, vUv + vec2(uTexel.x, 0.0)).y;
  float T = texture2D(uVelocity, vUv + vec2(0.0, uTexel.y)).x;
  float B = texture2D(uVelocity, vUv - vec2(0.0, uTexel.y)).x;
  gl_FragColor = vec4(0.5 * (R - L - T + B), 0.0, 0.0, 1.0);
}
`,Ee=`
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
`,De=`
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
`,Oe=`
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
`,ke=`
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
`,Ae=`
uniform sampler2D uVelocity; uniform sampler2D uSolid; uniform vec2 uTexel; uniform float uDt; uniform float uDecay;
void main(){
  vec2 vel = bilerp(uVelocity, vUv, uTexel).xy;
  vec2 p = vUv - uDt * vel * uTexel;
  vec2 v = bilerp(uVelocity, p, uTexel).xy * uDecay;
  float fl = step(0.5, texture2D(uSolid, vUv).a);
  gl_FragColor = vec4(v * fl, 0.0, 1.0);
}
`,je=`
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
`;function Me(){let e=document.getElementById(`footerWordWrap`),t=document.getElementById(`footerWord`);if(!e||!t)return;let n=[...t.textContent.trim()];if(!n.length)return;let r=matchMedia(`(prefers-reduced-motion: reduce)`),i=getComputedStyle(t),a=i.fontFamily,o=i.fontWeight,s=document.createElement(`canvas`);s.className=`footer-canvas`,s.setAttribute(`aria-hidden`,`true`),e.appendChild(s);let c=document.createElement(`canvas`),l=c.getContext(`2d`),u=document.createElement(`canvas`),d=u.getContext(`2d`),f=null,p=null,m=null,h=null,g=null,_=null,v=null,y=0,b=0,x=1,S=0,C=0,w=1e9,T=!1,E={inside:!1,x:0,y:0,px:0,py:0,tx:0,ty:0},D=[.95,.94,.93],O=D,k=D,A=1,j=[.98,.27,0];function M(e,t,n=document.body){let r=getComputedStyle(n).getPropertyValue(e).trim()||t;l.fillStyle=`#000`,l.fillStyle=r;let i=l.fillStyle;if(i[0]===`#`)return[1,3,5].map(e=>parseInt(i.slice(e,e+2),16)/255);let a=i.match(/[\d.]+/g);return a?a.slice(0,3).map(e=>e/255):[.95,.94,.93]}let ee=()=>M(`--fg`,`#f3f1ed`),N=()=>M(`--accent`,`#fa4500`);function te(){let e=document.createElement(`canvas`),t=e.getContext(`2d`,{willReadFrequently:!0}),r=`${o} ${Z}px ${a}`;t.font=r;let i=0,s=0,c=0;n.forEach(e=>{let n=t.measureText(e);i=Math.max(i,n.actualBoundingBoxAscent),s=Math.max(s,n.actualBoundingBoxDescent),c=Math.max(c,n.width)});let l=Math.ceil(i)+2;e.width=Math.ceil(c+48),e.height=l+Math.ceil(s)+2,t.font=r,t.textBaseline=`alphabetic`,t.textAlign=`left`,t.fillStyle=`#000`;let u=n.map(n=>{t.clearRect(0,0,e.width,e.height),t.fillText(n,24,l);let{data:r}=t.getImageData(0,0,e.width,e.height),i=new Float32Array(e.height).fill(NaN),a=new Float32Array(e.height).fill(NaN),o=1/0,s=-1/0;for(let t=0;t<e.height;t++){let n=-1,c=-1;for(let i=0;i<e.width;i++)r[(t*e.width+i)*4+3]>100&&(n<0&&(n=i),c=i);n>=0&&(i[t]=n-24,a[t]=c+1-24,o=Math.min(o,i[t]),s=Math.max(s,a[t]))}return{L:i,R:a,minL:o,maxR:s}}),d=[0];for(let e=0;e<u.length-1;e++){let t=u[e],n=u[e+1],r=[];for(let e=0;e<t.L.length;e++)!Number.isNaN(t.R[e])&&!Number.isNaN(n.L[e])&&r.push(n.L[e]-t.R[e]);let i=e=>r.reduce((t,n)=>t+Math.min(ve.cap*Z,n+e),0)/r.length,a=ve.min*Z-Math.min(...r);if(i(a)<ve.target*Z){let e=a,t=a+Z;for(let n=0;n<32;n++){let n=(e+t)/2;i(n)<ve.target*Z?e=n:t=n}a=t}d.push(d[e]+a)}let f=d[0]+u[0].minL;return{pens:d,left:f,extent:d[d.length-1]+u[u.length-1].maxR-f,maxAsc:i,maxDesc:s}}function ne(e,t){let n=f.createShader(e);if(f.shaderSource(n,t),f.compileShader(n),!f.getShaderParameter(n,f.COMPILE_STATUS))throw Error(f.getShaderInfoLog(n)||`shader compile failed`);return n}function P(e,t){let n=f.createProgram();if(f.attachShader(n,e),f.attachShader(n,ne(f.FRAGMENT_SHADER,t)),f.bindAttribLocation(n,0,`a_pos`),f.linkProgram(n),!f.getProgramParameter(n,f.LINK_STATUS))throw Error(f.getProgramInfoLog(n)||`link failed`);return{pr:n,u:{}}}function F(e,t){let n=e.u[t];return n===void 0&&(n=f.getUniformLocation(e.pr,t),e.u[t]=n),n}function I(e,t){f.activeTexture(f.TEXTURE0+e),f.bindTexture(f.TEXTURE_2D,t)}function L(e){f.useProgram(e.pr)}function R(e){e?(f.bindFramebuffer(f.FRAMEBUFFER,e.f),f.viewport(0,0,e.w,e.h)):(f.bindFramebuffer(f.FRAMEBUFFER,null),f.viewport(0,0,s.width,s.height)),f.drawArrays(f.TRIANGLES,0,3)}function z(e){let t=f.createTexture();f.bindTexture(f.TEXTURE_2D,t),f.texParameteri(f.TEXTURE_2D,f.TEXTURE_MIN_FILTER,f.NEAREST),f.texParameteri(f.TEXTURE_2D,f.TEXTURE_MAG_FILTER,f.NEAREST),f.texImage2D(f.TEXTURE_2D,0,f.RGBA,4,4,0,f.RGBA,e,null);let n=f.createFramebuffer();f.bindFramebuffer(f.FRAMEBUFFER,n),f.framebufferTexture2D(f.FRAMEBUFFER,f.COLOR_ATTACHMENT0,f.TEXTURE_2D,t,0);let r=f.checkFramebufferStatus(f.FRAMEBUFFER)===f.FRAMEBUFFER_COMPLETE;return f.bindFramebuffer(f.FRAMEBUFFER,null),f.deleteFramebuffer(n),f.deleteTexture(t),r}function B(){let e=[],t=f.getExtension(`OES_texture_half_float`);return t&&(f.getExtension(`EXT_color_buffer_half_float`),e.push({type:t.HALF_FLOAT_OES,linear:!!f.getExtension(`OES_texture_half_float_linear`)})),f.getExtension(`OES_texture_float`)&&(f.getExtension(`WEBGL_color_buffer_float`),e.push({type:f.FLOAT,linear:!!f.getExtension(`OES_texture_float_linear`)})),e.find(e=>z(e.type))||null}function V(e,t,n){let r=f.createTexture();f.bindTexture(f.TEXTURE_2D,r),f.texParameteri(f.TEXTURE_2D,f.TEXTURE_MIN_FILTER,n),f.texParameteri(f.TEXTURE_2D,f.TEXTURE_MAG_FILTER,n),f.texParameteri(f.TEXTURE_2D,f.TEXTURE_WRAP_S,f.CLAMP_TO_EDGE),f.texParameteri(f.TEXTURE_2D,f.TEXTURE_WRAP_T,f.CLAMP_TO_EDGE),f.texImage2D(f.TEXTURE_2D,0,f.RGBA,e,t,0,f.RGBA,g.type,null);let i=f.createFramebuffer();return f.bindFramebuffer(f.FRAMEBUFFER,i),f.framebufferTexture2D(f.FRAMEBUFFER,f.COLOR_ATTACHMENT0,f.TEXTURE_2D,r,0),f.viewport(0,0,e,t),f.clearColor(0,0,0,1),f.clear(f.COLOR_BUFFER_BIT),f.bindFramebuffer(f.FRAMEBUFFER,null),{tex:r,f:i,w:e,h:t}}function re(e,t,n){let r=V(e,t,n),i=V(e,t,n);return{get read(){return r},get write(){return i},swap(){let e=r;r=i,i=e},all(){return[r,i]}}}function H(e){e&&(f.deleteTexture(e.tex),f.deleteFramebuffer(e.f))}function ie(){if(f=s.getContext(`webgl`,{alpha:!0,antialias:!1,premultipliedAlpha:!0,powerPreference:`low-power`}),!f)return!1;h=null,g=null,_=null;try{let e=f.createBuffer();f.bindBuffer(f.ARRAY_BUFFER,e),f.bufferData(f.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),f.STATIC_DRAW),f.enableVertexAttribArray(0),f.vertexAttribPointer(0,2,f.FLOAT,!1,0,0),g=B();let t=ne(f.VERTEX_SHADER,ye),n=be(!!g&&!g.linear);if(h={display:P(t,n+xe)},g)try{h.clear=P(t,n+Se),h.drag=P(t,n+Ce),h.splat=P(t,n+we),h.curl=P(t,n+Te),h.vort=P(t,n+Ee),h.div=P(t,n+De),h.press=P(t,n+Oe),h.grad=P(t,n+ke),h.advVel=P(t,n+Ae),h.advDye=P(t,n+je)}catch(e){console.warn(`[footer] liquid unavailable, showing the static wordmark.`,e),g=null}}catch(e){return console.warn(`[footer] wordmark shader unavailable, using plain text.`,e),!1}return p=f.createTexture(),f.bindTexture(f.TEXTURE_2D,p),f.texParameteri(f.TEXTURE_2D,f.TEXTURE_MIN_FILTER,f.LINEAR),f.texParameteri(f.TEXTURE_2D,f.TEXTURE_MAG_FILTER,f.LINEAR),f.texParameteri(f.TEXTURE_2D,f.TEXTURE_WRAP_S,f.CLAMP_TO_EDGE),f.texParameteri(f.TEXTURE_2D,f.TEXTURE_WRAP_T,f.CLAMP_TO_EDGE),m=f.createTexture(),f.bindTexture(f.TEXTURE_2D,m),f.texParameteri(f.TEXTURE_2D,f.TEXTURE_MIN_FILTER,f.NEAREST),f.texParameteri(f.TEXTURE_2D,f.TEXTURE_MAG_FILTER,f.NEAREST),f.texImage2D(f.TEXTURE_2D,0,f.RGBA,1,1,0,f.RGBA,f.UNSIGNED_BYTE,new Uint8Array(4)),!0}function U(){_&&=([..._.vel.all(),..._.dye.all(),..._.press.all(),_.curl,_.div].forEach(H),f.deleteTexture(_.solid),null)}function ae(){if(U(),!g||!h.drag)return;let e=Math.min(720,Math.max(64,Math.round(y*Q.velRes))),t=Math.max(24,Math.round(b*Q.velRes)),n=Math.min(1600,Math.max(128,Math.round(y*Q.dyeRes))),r=Math.max(48,Math.round(b*Q.dyeRes)),i=g.linear?f.LINEAR:f.NEAREST;u.width=e,u.height=t,d.clearRect(0,0,e,t),d.imageSmoothingEnabled=!0,d.imageSmoothingQuality=`high`,d.drawImage(c,0,0,e,t);let a=f.createTexture();f.bindTexture(f.TEXTURE_2D,a),f.texParameteri(f.TEXTURE_2D,f.TEXTURE_MIN_FILTER,f.LINEAR),f.texParameteri(f.TEXTURE_2D,f.TEXTURE_MAG_FILTER,f.LINEAR),f.texParameteri(f.TEXTURE_2D,f.TEXTURE_WRAP_S,f.CLAMP_TO_EDGE),f.texParameteri(f.TEXTURE_2D,f.TEXTURE_WRAP_T,f.CLAMP_TO_EDGE),f.pixelStorei(f.UNPACK_FLIP_Y_WEBGL,!0),f.texImage2D(f.TEXTURE_2D,0,f.RGBA,f.RGBA,f.UNSIGNED_BYTE,u),f.pixelStorei(f.UNPACK_FLIP_Y_WEBGL,!1),_={vw:e,vh:t,dw:n,dh:r,solid:a,vel:re(e,t,i),dye:re(n,r,i),curl:V(e,t,f.NEAREST),div:V(e,t,f.NEAREST),press:re(e,t,f.NEAREST)},T=!1}function oe(){_&&(f.clearColor(0,0,0,1),[..._.vel.all(),..._.dye.all(),..._.press.all()].forEach(e=>{f.bindFramebuffer(f.FRAMEBUFFER,e.f),f.viewport(0,0,e.w,e.h),f.clear(f.COLOR_BUFFER_BIT)}),f.bindFramebuffer(f.FRAMEBUFFER,null))}function se(){if(!f||!v)return;let t=Math.floor(e.clientWidth);if(t<40)return;y=t;let r=Math.min(_e,y*Z/v.extent),i=r/Z;b=Math.ceil((v.maxAsc+v.maxDesc)*i+4);let u=f.getParameter(f.MAX_TEXTURE_SIZE)||4096;x=Math.min(window.devicePixelRatio||1,2,u/y);let d=Math.ceil(y*x),m=Math.ceil(b*x);s.width=d,s.height=m,s.style.width=`${y}px`,s.style.height=`${b}px`,c.width=d,c.height=m,l.setTransform(x,0,0,x,0,0),l.clearRect(0,0,y,b),l.font=`${o} ${r}px ${a}`,l.textBaseline=`alphabetic`,l.textAlign=`left`,l.fillStyle=`#fff`;let h=(y-v.extent*i)/2,g=2+v.maxAsc*i;n.forEach((e,t)=>l.fillText(e,h+(v.pens[t]-v.left)*i,g)),I(0,p),f.texImage2D(f.TEXTURE_2D,0,f.RGBA,f.RGBA,f.UNSIGNED_BYTE,c),ae(),ce(),e.classList.add(`has-canvas`)}function ce(){if(!f||f.isContextLost()||!y)return;let e=h.display;L(e),I(0,p),I(1,_?_.dye.read.tex:m),f.uniform1i(F(e,`u_mask`),0),f.uniform1i(F(e,`u_dye`),1),f.uniform2f(F(e,`u_px`),s.width,s.height),f.uniform2f(F(e,`u_dyeTexel`),_?1/_.dw:1,_?1/_.dh:1),f.uniform3f(F(e,`u_ink`),D[0],D[1],D[2]),f.uniform3f(F(e,`u_accent`),j[0],j[1],j[2]),f.uniform1f(F(e,`u_shine`),Q.shine),f.disable(f.BLEND),f.clearColor(0,0,0,0),f.bindFramebuffer(f.FRAMEBUFFER,null),f.viewport(0,0,s.width,s.height),f.clear(f.COLOR_BUFFER_BIT),R(null)}let le=()=>{let e=Math.max(22,Math.min(250,b*Q.radius))/b;return e*e};function W(e,t,n,r,i){let a=h.drag;L(a),I(0,_.vel.read.tex),I(1,_.solid),f.uniform1i(F(a,`uTarget`),0),f.uniform1i(F(a,`uSolid`),1),f.uniform2f(F(a,`uPoint`),e,t),f.uniform2f(F(a,`uPv`),n,r),f.uniform1f(F(a,`uCoupling`),i),f.uniform1f(F(a,`uRadius`),le()),f.uniform1f(F(a,`uAspect`),y/b),R(_.vel.write),_.vel.swap()}function G(e,t,n){let r=h.splat;L(r),I(0,_.dye.read.tex),I(1,_.solid),f.uniform1i(F(r,`uTarget`),0),f.uniform1i(F(r,`uSolid`),1),f.uniform2f(F(r,`uPoint`),e,t),f.uniform1f(F(r,`uAmount`),n),f.uniform1f(F(r,`uMax`),Q.dyeMax),f.uniform1f(F(r,`uRadius`),le()*.8),f.uniform1f(F(r,`uAspect`),y/b),R(_.dye.write),_.dye.swap()}function K(e){if(!E.inside)return!1;let t=1-Math.exp(-e*32);E.px=E.x,E.py=E.y,E.x+=(E.tx-E.x)*t,E.y+=(E.ty-E.y)*t;let n=Math.max(e,1/120),r=E.x-E.px,i=E.y-E.py,a=Math.hypot(r,i),o=a/n;if(a<.15||o<14)return!1;let s=Math.max(22,Math.min(250,b*Q.radius)),c=Math.min(10,Math.max(1,Math.ceil(a/(s*.5)))),l=1-(1-(1-Math.exp(-Q.drag*n)))**(1/c),u=r/n*Q.velRes,d=-i/n*Q.velRes,f=Math.hypot(u,d);f>900&&(u*=900/f,d*=900/f);let p=Q.dyeRate*n*(.18+.82*Math.min(1,o/900))/c;for(let e=1;e<=c;e++){let t=e/c,n=(E.px+r*t)/y,a=1-(E.py+i*t)/b;W(n,a,u,d,l),G(n,a,p)}return T=!0,w=0,!0}function ue(e){let t=_,n=[1/t.vw,1/t.vh],r=[1/t.dw,1/t.dh],i;f.disable(f.BLEND),i=h.curl,L(i),I(0,t.vel.read.tex),f.uniform1i(F(i,`uVelocity`),0),f.uniform2f(F(i,`uTexel`),n[0],n[1]),R(t.curl),i=h.vort,L(i),I(0,t.vel.read.tex),I(1,t.curl.tex),I(2,t.solid),f.uniform1i(F(i,`uVelocity`),0),f.uniform1i(F(i,`uCurl`),1),f.uniform1i(F(i,`uSolid`),2),f.uniform2f(F(i,`uTexel`),n[0],n[1]),f.uniform1f(F(i,`uStrength`),Q.vorticity),f.uniform1f(F(i,`uDt`),e),R(t.vel.write),t.vel.swap(),i=h.div,L(i),I(0,t.vel.read.tex),I(1,t.solid),f.uniform1i(F(i,`uVelocity`),0),f.uniform1i(F(i,`uSolid`),1),f.uniform2f(F(i,`uTexel`),n[0],n[1]),R(t.div),i=h.clear,L(i),I(0,t.press.read.tex),f.uniform1i(F(i,`uTex`),0),f.uniform1f(F(i,`uValue`),Q.pressureKeep),R(t.press.write),t.press.swap(),i=h.press,L(i),I(1,t.div.tex),I(2,t.solid),f.uniform1i(F(i,`uPressure`),0),f.uniform1i(F(i,`uDivergence`),1),f.uniform1i(F(i,`uSolid`),2),f.uniform2f(F(i,`uTexel`),n[0],n[1]);for(let e=0;e<Q.pressureIters;e++)I(0,t.press.read.tex),R(t.press.write),t.press.swap();i=h.grad,L(i),I(0,t.press.read.tex),I(1,t.vel.read.tex),I(2,t.solid),f.uniform1i(F(i,`uPressure`),0),f.uniform1i(F(i,`uVelocity`),1),f.uniform1i(F(i,`uSolid`),2),f.uniform2f(F(i,`uTexel`),n[0],n[1]),R(t.vel.write),t.vel.swap(),i=h.advVel,L(i),I(0,t.vel.read.tex),I(1,t.solid),f.uniform1i(F(i,`uVelocity`),0),f.uniform1i(F(i,`uSolid`),1),f.uniform2f(F(i,`uTexel`),n[0],n[1]),f.uniform1f(F(i,`uDt`),e),f.uniform1f(F(i,`uDecay`),Math.exp(-Q.velDamping*e)),R(t.vel.write),t.vel.swap(),i=h.advDye,L(i),I(0,t.vel.read.tex),I(1,t.dye.read.tex),I(2,t.solid),f.uniform1i(F(i,`uVelocity`),0),f.uniform1i(F(i,`uDye`),1),f.uniform1i(F(i,`uSolid`),2),f.uniform2f(F(i,`uVelTexel`),n[0],n[1]),f.uniform2f(F(i,`uDyeTexel`),r[0],r[1]),f.uniform1f(F(i,`uDt`),e),f.uniform1f(F(i,`uDecay`),Math.exp(-Q.dyeFade*e)),f.uniform1f(F(i,`uSub`),Q.dyeFadeLinear*e),R(t.dye.write),t.dye.swap()}function q(){S=0;let e=performance.now(),t=Math.max(0,(e-C)/1e3),n=Math.min(t,.033);if(C=e,A<1){A=Math.min(1,A+n/.4);let e=A*A*(3-2*A);D=O.map((t,n)=>t+(k[n]-t)*e)}let r=!1;_&&(K(Math.min(t,.1))||(w+=n),w<Q.rest?(ue(Math.max(n,1/240)),r=!0):T&&=(oe(),!1)),ce();let i=E.inside&&(Math.abs(E.tx-E.x)>.2||Math.abs(E.ty-E.y)>.2);(r||i||A<1)&&J()}function J(){S||=requestAnimationFrame(q)}function Y(){S||(C=performance.now()),J()}function de(e){let t=s.getBoundingClientRect();return[e.clientX-t.left,e.clientY-t.top]}let fe=e=>e.pointerType!==`touch`&&!r.matches&&!!_;s.addEventListener(`pointerenter`,e=>{if(!fe(e))return;let[t,n]=de(e);E.inside=!0,E.x=E.px=E.tx=t,E.y=E.py=E.ty=n,Y()}),s.addEventListener(`pointermove`,e=>{if(!fe(e))return;let[t,n]=de(e);E.inside||(E.inside=!0,E.x=E.px=t,E.y=E.py=n),E.tx=t,E.ty=n,Y()}),s.addEventListener(`pointerleave`,()=>{E.inside=!1,Y()});let X=0;function pe(){v=te(),X=0,se()}s.addEventListener(`webglcontextlost`,t=>{t.preventDefault(),_=null,e.classList.remove(`has-canvas`)}),s.addEventListener(`webglcontextrestored`,()=>{ie()&&(D=ee(),O=k=D,j=N(),se())}),new ResizeObserver(()=>{let t=Math.floor(e.clientWidth);t!==X&&(X=t,se())}).observe(e),new MutationObserver(()=>{O=D,k=ee(),A=0,Y()}).observe(document.body,{attributes:!0,attributeFilter:[`class`]});function me(){if(!ie()){s.remove();return}D=O=k=ee(),j=N(),pe()}document.fonts&&document.fonts.ready?(document.fonts.ready.then(me),document.fonts.addEventListener?.(`loadingdone`,()=>{f&&pe()})):me()}var $=(e,t)=>{try{t()}catch(t){console.error(`[sutra] ${e} failed to start`,t)}};async function Ne(){$(`theme`,n),$(`header`,i),$(`cursor`,t),$(`magnetic`,r),await Promise.all([s(),l(),b(),C()]),$(`site-content`,he),$(`hero`,fe),$(`work`,le),$(`clients`,ue),$(`services`,Y),$(`footer-wordmark`,Me),$(`site-footer`,pe),$(`booking`,o),$(`reveal`,c),location.hash===`#services`&&requestAnimationFrame(()=>{setTimeout(()=>{let e=document.getElementById(`services`);e&&e.scrollIntoView({block:`center`,behavior:`smooth`})},120)})}Ne().catch(e=>console.error(`[sutra] Failed to boot site`,e));