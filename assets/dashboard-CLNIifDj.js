import{n as e,t}from"./supabase-C1pZBt_5.js";import{n}from"./clients-BnZIS6bf.js";import{l as r,n as i}from"./video-65I5EbRW.js";import{r as a,t as o}from"./auth-xPYlYn5e.js";var s=document.getElementById(`admin-panel`),c=document.getElementById(`user`),l=(e=``)=>String(e).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e]),u=(e=``)=>String(e).trim().toLowerCase().replace(/[^a-z0-9]+/g,`-`).replace(/^-+|-+$/g,``),d=null,f={projects:[],clients:[],services:[],settings:null};async function p(){if(d=await o(),!d)throw window.location.href=`./index.html`,Error(`Not authenticated`);c.textContent=d.email||``}async function m(){if(!e)return;let t=`sutra-cms-starter-seeded-v1`;if(localStorage.getItem(t))return;let[{count:i},{count:a}]=await Promise.all([e.from(`clients`).select(`id`,{count:`exact`,head:!0}),e.from(`services`).select(`id`,{count:`exact`,head:!0})]);if(!i){let t=n.map((e,t)=>({name:e.name,slug:e.slug,description:e.description,year:e.year,published:!0,featured:e.featured,sort_order:t})),{error:r}=await e.from(`clients`).upsert(t,{onConflict:`slug`});if(r)throw r}if(!a){let t=r.map((e,t)=>({title:e.title,slug:e.slug,description:e.description,tags:e.tags,accent:e.accent,gradient_start:e.gradientStart||e.accent,gradient_end:e.gradientEnd||`#111111`,gradient_angle:e.gradientAngle??135,published:!0,sort_order:t})),{error:n}=await e.from(`services`).upsert(t,{onConflict:`slug`});if(n)throw n}(!i||!a)&&localStorage.setItem(t,`1`)}async function h(){if(!e)return;let[{data:t},{data:n},{data:r},{data:i}]=await Promise.all([e.from(`projects`).select(`*`).order(`sort_order`,{ascending:!0}).order(`created_at`,{ascending:!1}),e.from(`clients`).select(`*`).order(`sort_order`,{ascending:!0}).order(`created_at`,{ascending:!1}),e.from(`services`).select(`*`).order(`sort_order`,{ascending:!0}).order(`created_at`,{ascending:!1}),e.from(`site_settings`).select(`*`).order(`updated_at`,{ascending:!1}).limit(1).maybeSingle()]);f={projects:t||[],clients:n||[],services:r||[],settings:i||null}}function g(e){document.querySelectorAll(`.admin-nav button[data-panel]`).forEach(t=>t.classList.toggle(`active`,t.dataset.panel===e))}function _(e){g(e),location.hash=e,({overview:y,projects:S,clients:D,services:A,"manage-site":x,intro:P,settings:F}[e]||y)()}function v(e,t,n=``){return s.innerHTML=`
    <div class="admin-page-head">
      <div>
        <p class="eyebrow">${l(t)}</p>
        <h1>${l(e)}</h1>
        ${n?`<p class="admin-page-description">${l(n)}</p>`:``}
      </div>
      <div class="admin-page-actions" id="page-actions"></div>
    </div>
    <div id="panel-body"></div>`,document.getElementById(`panel-body`)}function y(){let e=v(`Dashboard`,`SUTRA ADMIN`,`A single control room for your portfolio content and site-wide settings.`),n=new Date().getHours();e.innerHTML=`
    <section class="dashboard-hero panel">
      <div class="dashboard-hero-copy">
        <span class="eyebrow">COMMAND CENTER</span>
        <h2>${n<12?`Good morning`:n<18?`Good afternoon`:`Good evening`}, Sujal.</h2>
        <p>Everything visitors see can be managed from this dashboard. Changes are saved directly to Supabase.</p>
      </div>
      <div class="dashboard-hero-actions">
        <button class="solid-btn" data-go="projects">+ Project</button>
        <button class="outline-btn" data-go="clients">+ Client</button>
        <button class="outline-btn" data-go="services">+ Service</button>
        <button class="ghost-btn" data-go="intro">Edit intro</button>
      </div>
    </section>

    <div class="admin-stat-grid admin-stat-grid-premium">
      <div class="stat-card">
        <span>PROJECTS</span>
        <strong>${f.projects.length}</strong>
        <small>${f.projects.filter(e=>e.published).length} published · ${f.projects.filter(e=>e.featured).length} featured</small>
      </div>
      <div class="stat-card">
        <span>CLIENTS</span>
        <strong>${f.clients.length}</strong>
        <small>${f.clients.filter(e=>e.published).length} published</small>
      </div>
      <div class="stat-card">
        <span>SERVICES</span>
        <strong>${f.services.length}</strong>
        <small>${f.services.filter(e=>e.published).length} published</small>
      </div>
      <div class="stat-card status-card">
        <span>SITE STATUS</span>
        <strong>${f.settings?`READY`:`SETUP`}</strong>
        <small>${t?`Supabase connected`:`Configuration required`}</small>
      </div>
    </div>

    <div class="admin-dashboard-grid admin-dashboard-grid-premium">
      <section class="panel dashboard-list-panel">
        <div class="panel-head">
          <div><h2>Recent work</h2><p>Your latest project entries.</p></div>
          <button class="outline-btn" data-go="projects">View all</button>
        </div>
        <div class="row-list">
          ${f.projects.slice(0,7).map(e=>`
            <div class="simple-row">
              <div class="simple-row-title">
                <span class="row-index">${String(e.sort_order??0).padStart(2,`0`)}</span>
                <div>
                  <strong>${l(e.title)}</strong>
                  <small>${l(e.category||`No category`)} · ${l(e.client_name||`Independent`)}</small>
                </div>
              </div>
              <span class="status-pill ${e.published?`is-live`:``}">${e.published?`Published`:`Draft`}</span>
            </div>`).join(``)||`<div class="empty-state">No projects yet. Create your first project.</div>`}
        </div>
      </section>

      <section class="panel dashboard-health">
        <div class="panel-head">
          <div><h2>System health</h2><p>A quick check before you publish more work.</p></div>
        </div>
        <div class="checklist">
          ${b(`Supabase connected`,t)}
          ${b(`Admin authentication`,!!d)}
          ${b(`Projects available`,f.projects.length>0)}
          ${b(`Clients available`,f.clients.length>0)}
          ${b(`Services available`,f.services.length>0)}
          ${b(`Site settings available`,!!f.settings)}
        </div>
      </section>
    </div>

    <div class="dashboard-quick-grid">
      <button class="quick-card" data-go="intro">
        <span>01</span><strong>Intro / Hero</strong>
        <small>Change the homepage reel and headline.</small><b>↗</b>
      </button>
      <button class="quick-card" data-go="settings">
        <span>02</span><strong>Contact &amp; Footer</strong>
        <small>Update your email, phone, location and socials.</small><b>↗</b>
      </button>
      <button class="quick-card" data-go="services">
        <span>03</span><strong>Service visuals</strong>
        <small>Adjust gradient colours, artwork and ordering.</small><b>↗</b>
      </button>
    </div>`,e.querySelectorAll(`[data-go]`).forEach(e=>{e.addEventListener(`click`,()=>_(e.dataset.go))})}function b(e,t){return`<div class="check-item"><span class="check-dot ${t?`ok`:``}"></span><span>${l(e)}</span><b>${t?`Ready`:`Pending`}</b></div>`}function x(){let e=v(`Manage Site`,`SITE MANAGEMENT`,`Control the homepage intro, contact details, social links and footer from one place.`),t=f.settings||{};e.innerHTML=`
    <div class="manage-site-grid">
      <section class="panel"><div class="panel-head"><div><h2>Intro / Hero</h2><p>${l(t.intro_video_url||`No intro video configured yet.`)}</p></div><button class="outline-btn" data-manage="intro">Edit intro</button></div><div class="manage-summary"><div><span>Headline</span><strong>${l(t.hero_title_line_1||`—`)}</strong><strong>${l(t.hero_title_line_2||``)}</strong></div><div><span>Video</span><strong>${t.intro_published===!1?`Hidden`:t.intro_video_url?`Configured`:`Placeholder`}</strong></div></div></section>
      <section class="panel"><div class="panel-head"><div><h2>Contact &amp; Footer</h2><p>${l(t.email||`No email configured.`)} · ${l(t.location||`No location configured.`)}</p></div><button class="outline-btn" data-manage="settings">Edit details</button></div><div class="manage-summary"><div><span>Owner</span><strong>${l(t.owner_name||`—`)}</strong></div><div><span>Footer</span><strong>${l(t.copyright_text||`—`)}</strong></div></div></section>
    </div>
    <section class="panel manage-site-note"><div class="panel-head"><div><h2>How it works</h2><p>Save here once; the public homepage reads the same values on every load. Videos remain externally hosted, images can be uploaded through the content editors.</p></div></div></section>`,e.querySelectorAll(`[data-manage]`).forEach(e=>e.addEventListener(`click`,()=>_(e.dataset.manage)))}function S(){let e=v(`Selected Work`,`CONTENT MANAGEMENT`,`Projects shown in the homepage carousel and available on project detail pages.`);document.getElementById(`page-actions`).innerHTML=`<button class="solid-btn" data-new-project>New project</button>`,e.innerHTML=`<div class="cms-list">${f.projects.map(e=>`
    <article class="cms-row">
      <div class="cms-row-main"><div class="cms-thumb" style="background-image:url('${l(e.thumbnail_url||e.poster_url||``)}')"></div><div><strong>${l(e.title)}</strong><span>${l(e.category||`No category`)} · ${e.published?`Published`:`Draft`}${e.video_url?` · Video linked`:``}</span></div></div>
      <div class="cms-row-actions"><button class="mini-btn" data-edit-project="${e.id}">Edit</button><button class="mini-btn danger" data-delete-project="${e.id}">Delete</button></div>
    </article>`).join(``)||`<div class="empty-state">No projects yet. Add your first project.</div>`}</div><div id="entity-editor"></div>`,document.querySelector(`[data-new-project]`).addEventListener(`click`,()=>C()),e.querySelectorAll(`[data-edit-project]`).forEach(e=>e.addEventListener(`click`,()=>C(f.projects.find(t=>t.id===e.dataset.editProject)))),e.querySelectorAll(`[data-delete-project]`).forEach(e=>e.addEventListener(`click`,()=>L(`projects`,e.dataset.deleteProject)))}function C(e=null){let t=document.getElementById(`entity-editor`);t.innerHTML=`
    <div class="editor-drawer">
      <div class="drawer-head"><div><p class="eyebrow">${e?`EDIT PROJECT`:`NEW PROJECT`}</p><h2>${e?l(e.title):`Add project`}</h2></div><div class="editor-header-actions"><button class="reset-btn" type="button" data-reset-form title="Reset unsaved changes"><span class="reset-icon">↺</span><span>Reset</span></button><button class="ghost-btn" data-close>Close</button></div></div>
      <form id="project-form" class="cms-form">
        <input type="hidden" name="id" value="${l(e?.id||``)}">
        <div class="form-grid two">
          ${R(`Title`,`title`,e?.title||``,!0)}
          ${R(`Slug`,`slug`,e?.slug||``)}
          ${R(`Category`,`category`,e?.category||``,!1,`VIDEO EDITING · MOTION`)}
          ${B(e?.work_type||``)}
          ${R(`Client`,`client_name`,e?.client_name||``)}
          ${R(`Year`,`year`,e?.year||``,!1,``,`number`)}
          ${R(`Sort order`,`sort_order`,e?.sort_order??0,!1,``,`number`)}
        </div>
        ${V(`Description`,`description`,e?.description||``,4)}
        <div class="media-grid two">
          ${H(`Thumbnail`,`thumbnail_url`,e?.thumbnail_url||``,`project-thumbnail-file`)}
          ${H(`Poster`,`poster_url`,e?.poster_url||``,`project-poster-file`)}
        </div>
        <div class="form-grid two">
          ${R(`External video URL`,`video_url`,e?.video_url||``,!1,`https://youtu.be/... or https://vimeo.com/...`,`url`)}
          <label>Video type<select name="video_type"><option value="" ${e?.video_type?``:`selected`}>Auto detect</option><option value="youtube" ${e?.video_type===`youtube`?`selected`:``}>YouTube</option><option value="vimeo" ${e?.video_type===`vimeo`?`selected`:``}>Vimeo</option><option value="external" ${e?.video_type===`external`?`selected`:``}>Direct MP4</option></select></label>
          ${R(`Project URL`,`project_url`,e?.project_url||``,!1,`Optional external link`,`url`)}
        </div>
        <div class="form-section"><span class="form-section-title">Services</span><div class="service-check-grid">${f.services.map(e=>`<label class="check-chip"><input type="checkbox" name="service_ids" value="${e.id}" data-service-check="${e.slug}"><span>${l(e.title)}</span></label>`).join(``)||`<div class="form-note">Add services first to assign this project.</div>`}</div></div>
        <div class="form-grid three"><label class="check-row"><input type="checkbox" name="featured" ${e?.featured?`checked`:``}> Featured</label><label class="check-row"><input type="checkbox" name="published" ${e?.published===!1?``:`checked`}> Published</label><div></div></div>
        <div class="form-error" id="editor-error" hidden></div>
        <div class="form-actions"><button type="button" class="ghost-btn" data-close>Cancel</button><button type="submit" class="solid-btn">${e?`Save changes`:`Create project`}</button></div>
      </form>
    </div>`,t.querySelectorAll(`[data-close]`).forEach(e=>e.addEventListener(`click`,()=>t.innerHTML=``)),w(t,e?.id),t.querySelector(`#project-form`).addEventListener(`submit`,async t=>{t.preventDefault(),await E(t,e?.id||``)}),t.querySelector(`[data-reset-form]`)?.addEventListener(`click`,()=>t.querySelector(`#project-form`)?.reset()),t.querySelector(`input[name="title"]`).addEventListener(`blur`,e=>{let n=t.querySelector(`input[name="slug"]`);n.value.trim()||(n.value=u(e.target.value))})}async function w(t,n){if(!e||!n)return;let{data:r,error:i}=await e.from(`project_services`).select(`service_id`).eq(`project_id`,n);if(i)return;let a=new Set((r||[]).map(e=>e.service_id));t.querySelectorAll(`input[name="service_ids"]`).forEach(e=>{e.checked=a.has(e.value)})}async function T(t,n,r){let i=t?.files?.[0];if(!i||!e)return``;let a=i.name.toLowerCase().replace(/[^a-z0-9.]+/g,`-`),o=`${n}/${r}-${Date.now()}-${a}`,{error:s}=await e.storage.from(`site-media`).upload(o,i,{cacheControl:`31536000`,upsert:!1,contentType:i.type||void 0});if(s)throw s;return e.storage.from(`site-media`).getPublicUrl(o).data.publicUrl}async function E(t,n){let r=t.currentTarget,i=new FormData(r),a=r.querySelector(`#editor-error`);a.hidden=!0;let o=String(i.get(`title`)||``).trim(),s=u(String(i.get(`slug`)||o));if(!o||!s){a.textContent=`Title and slug are required.`,a.hidden=!1;return}let c=q();try{let t=await T(r.querySelector(`#project-thumbnail-file`),`projects/thumbnails`,s),a=await T(r.querySelector(`#project-poster-file`),`projects/posters`,s),l={title:o,slug:s,description:String(i.get(`description`)||``).trim()||null,category:String(i.get(`category`)||``).trim()||null,work_type:String(i.get(`work_type`)||``).trim()||null,client_name:String(i.get(`client_name`)||``).trim()||null,year:i.get(`year`)?Number(i.get(`year`)):null,thumbnail_url:t||String(i.get(`thumbnail_url`)||``).trim()||null,poster_url:a||String(i.get(`poster_url`)||``).trim()||null,video_url:String(i.get(`video_url`)||``).trim()||null,video_type:String(i.get(`video_type`)||``).trim()||null,project_url:String(i.get(`project_url`)||``).trim()||null,featured:i.get(`featured`)===`on`,published:i.get(`published`)===`on`,sort_order:Number(i.get(`sort_order`)||0)},u=n;if(n){let{error:t}=await e.from(`projects`).update(l).eq(`id`,n);if(t)throw t}else{let{data:t,error:n}=await e.from(`projects`).insert(l).select(`id`).single();if(n)throw n;u=t.id}await e.from(`project_services`).delete().eq(`project_id`,u);let d=[...r.querySelectorAll(`input[name="service_ids"]:checked`)].map(e=>e.value);if(d.length){let{error:t}=await e.from(`project_services`).insert(d.map(e=>({project_id:u,service_id:e})));if(t)throw t}await h(),c(),S()}catch(e){J(),a.textContent=e.message||`Unable to save project.`,a.hidden=!1}}function D(){let e=v(`Clients`,`CONTENT MANAGEMENT`,`Manage logos, images, descriptions and external client links.`);document.getElementById(`page-actions`).innerHTML=`<button class="solid-btn" data-new-client>New client</button>`,e.innerHTML=`<div class="cms-list">${f.clients.map(e=>`<article class="cms-row"><div class="cms-row-main"><div class="cms-thumb" style="background-image:url('${l(e.logo_url||e.primary_image_url||``)}')"></div><div><strong>${l(e.name)}</strong><span>${l(e.description||`No description`)} · ${e.published?`Published`:`Draft`}</span></div></div><div class="cms-row-actions"><button class="mini-btn" data-edit-client="${e.id}">Edit</button><button class="mini-btn danger" data-delete-client="${e.id}">Delete</button></div></article>`).join(``)||`<div class="empty-state">No clients yet.</div>`}</div><div id="entity-editor"></div>`,document.getElementById(`page-actions`)?.querySelector(`[data-new-client]`)?.addEventListener(`click`,()=>O()),e.querySelectorAll(`[data-edit-client]`).forEach(e=>e.addEventListener(`click`,()=>O(f.clients.find(t=>t.id===e.dataset.editClient)))),e.querySelectorAll(`[data-delete-client]`).forEach(e=>e.addEventListener(`click`,()=>L(`clients`,e.dataset.deleteClient)))}function O(e=null){let t=document.getElementById(`entity-editor`);t.innerHTML=`<div class="editor-drawer"><div class="drawer-head"><div><p class="eyebrow">${e?`EDIT CLIENT`:`NEW CLIENT`}</p><h2>${e?l(e.name):`Add client`}</h2></div><div class="editor-header-actions"><button class="reset-btn" type="button" data-reset-form title="Reset unsaved changes"><span class="reset-icon">↺</span><span>Reset</span></button><button class="ghost-btn" data-close>Close</button></div></div>
  <form id="client-form" class="cms-form">
    <input type="hidden" name="id" value="${l(e?.id||``)}">
    <div class="form-grid two">${R(`Name`,`name`,e?.name||``,!0)}${R(`Slug`,`slug`,e?.slug||``)}${R(`Year`,`year`,e?.year||``,!1,``,`number`)}${R(`Website URL`,`website_url`,e?.website_url||``,!1,``,`url`)}</div>
    ${V(`Description`,`description`,e?.description||``,4)}
    <div class="media-grid two">${H(`Logo`,`logo_url`,e?.logo_url||``,`client-logo-file`)}${H(`Primary image`,`primary_image_url`,e?.primary_image_url||``,`client-primary-file`)}</div>
    <label>Gallery URLs <textarea name="gallery_urls" rows="4" placeholder="One URL per line">${l((e?.gallery||[]).join(`
`))}</textarea></label>
    <label>Upload gallery images <input id="client-gallery-files" type="file" accept="image/*" multiple></label>
    <div class="form-grid three"><label class="check-row"><input type="checkbox" name="featured" ${e?.featured?`checked`:``}> Featured</label><label class="check-row"><input type="checkbox" name="published" ${e?.published===!1?``:`checked`}> Published</label>${z(`Sort order`,`sort_order`,e?.sort_order??0)}</div>
    <div class="form-error" id="editor-error" hidden></div><div class="form-actions"><button type="button" class="ghost-btn" data-close>Cancel</button><button type="submit" class="solid-btn">${e?`Save changes`:`Create client`}</button></div>
  </form></div>`,t.querySelectorAll(`[data-close]`).forEach(e=>e.addEventListener(`click`,()=>t.innerHTML=``)),t.querySelector(`#client-form`).addEventListener(`submit`,t=>k(t,e?.id||``)),t.querySelector(`[data-reset-form]`)?.addEventListener(`click`,()=>t.querySelector(`#client-form`)?.reset()),t.querySelector(`input[name="name"]`).addEventListener(`blur`,e=>{let n=t.querySelector(`input[name="slug"]`);n.value.trim()||(n.value=u(e.target.value))})}async function k(t,n){t.preventDefault();let r=t.currentTarget,i=r.querySelector(`#editor-error`);i.hidden=!0;let a=new FormData(r),o=String(a.get(`name`)||``).trim(),s=u(String(a.get(`slug`)||o));if(!o||!s){i.textContent=`Name and slug are required.`,i.hidden=!1;return}let c=q();try{let t=await T(r.querySelector(`#client-logo-file`),`clients/logos`,s),i=await T(r.querySelector(`#client-primary-file`),`clients/images`,s),l=String(a.get(`gallery_urls`)||``).split(`
`).map(e=>e.trim()).filter(Boolean),u=[...r.querySelector(`#client-gallery-files`)?.files||[]];for(let e=0;e<u.length;e++){let t=document.createElement(`input`);t.type=`file`,t.files=(()=>{let t=new DataTransfer;return t.items.add(u[e]),t.files})(),l.push(await T(t,`clients/gallery`,`${s}-${e+1}`))}let d={name:o,slug:s,description:String(a.get(`description`)||``).trim()||null,logo_url:t||String(a.get(`logo_url`)||``).trim()||null,primary_image_url:i||String(a.get(`primary_image_url`)||``).trim()||null,gallery:l,website_url:String(a.get(`website_url`)||``).trim()||null,year:a.get(`year`)?Number(a.get(`year`)):null,featured:a.get(`featured`)===`on`,published:a.get(`published`)===`on`,sort_order:Number(a.get(`sort_order`)||0)},{error:f}=await(n?e.from(`clients`).update(d).eq(`id`,n):e.from(`clients`).insert(d));if(f)throw f;await h(),c(),D()}catch(e){J(),i.textContent=e.message,i.hidden=!1}}function A(){let e=v(`Services`,`CONTENT MANAGEMENT`,`Manage service names, gradients, artwork and the projects assigned to each service.`);document.getElementById(`page-actions`).innerHTML=`<button class="solid-btn" data-new-service>New service</button>`,e.innerHTML=`<div class="cms-list">${f.services.map(e=>{let t=Number.isFinite(Number(e.gradient_angle))?Number(e.gradient_angle):135,n=e.gradient_start||e.accent||`#c8dcff`,r=e.gradient_end||`#111111`;return f.projects.filter(e=>e.published).length,`<article class="cms-row">
      <div class="cms-row-main">
        <div class="cms-color" style="--swatch:linear-gradient(${t}deg, ${l(n)}, ${l(r)})"></div>
        <div><strong>${l(e.title)}</strong><span>${l(e.description||(e.tags||[]).join(` · `))} · ${e.published?`Published`:`Draft`}</span></div>
      </div>
      <div class="cms-row-actions">
        <button class="mini-btn" data-edit-service="${e.id}">Edit</button>
        <button class="mini-btn danger" data-delete-service="${e.id}">Delete</button>
      </div>
    </article>`}).join(``)||`<div class="empty-state">No services yet. Add your first service.</div>`}</div><div id="entity-editor"></div>`,document.getElementById(`page-actions`)?.querySelector(`[data-new-service]`)?.addEventListener(`click`,()=>M()),e.querySelectorAll(`[data-edit-service]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=f.services.find(t=>t.id===e.dataset.editService);t&&M(t)})}),e.querySelectorAll(`[data-delete-service]`).forEach(e=>{e.addEventListener(`click`,()=>L(`services`,e.dataset.deleteService))})}async function j(t,n){if(!e||!n)return;let{data:r,error:i}=await e.from(`project_services`).select(`project_id`).eq(`service_id`,n);if(i)return;let a=new Set((r||[]).map(e=>e.project_id));t.querySelectorAll(`input[name="service_project_ids"]`).forEach(e=>{e.checked=a.has(e.value)})}function M(e=null){let t=document.getElementById(`entity-editor`),n=f.projects.filter(e=>e.published);t.innerHTML=`<div class="editor-drawer">
    <div class="drawer-head">
      <div><p class="eyebrow">${e?`EDIT SERVICE`:`NEW SERVICE`}</p><h2>${e?l(e.title):`Add service`}</h2></div>
      <div class="editor-header-actions"><button class="reset-btn" type="button" data-reset-form title="Reset unsaved changes"><span class="reset-icon">↺</span><span>Reset</span></button><button class="ghost-btn" type="button" data-close>Close</button></div>
    </div>
    <form id="service-form" class="cms-form">
      <input type="hidden" name="id" value="${l(e?.id||``)}">
      <div class="form-grid two">${R(`Title`,`title`,e?.title||``,!0)}${R(`Slug`,`slug`,e?.slug||``)}</div>
      ${V(`Description`,`description`,e?.description||``,3)}
      <label>Tags <input name="tags" value="${l((e?.tags||[]).join(`, `))}" placeholder="Systems, type, movement"></label>

      <div class="gradient-editor">
        <div class="gradient-editor-head">
          <div><span class="form-section-title">Visual gradient</span><p>These values control the service row accent and the service artwork background on the public site.</p></div>
          <div class="gradient-preview" id="service-gradient-preview"></div>
        </div>
        <div class="form-grid three">
          ${U(`Primary colour`,`accent`,e?.accent||e?.gradient_start||`#c8dcff`)}
          ${U(`Gradient end`,`gradient_end`,e?.gradient_end||e?.gradientEnd||`#111111`)}
          ${z(`Angle (°)`,`gradient_angle`,e?.gradient_angle??e?.gradientAngle??135)}
        </div>
        <div class="preset-row">
          ${[[`#c8dcff`,`#111827`,`135`,`Ice`],[`#d7c8ff`,`#1b1530`,`145`,`Violet`],[`#ffc9dc`,`#2a111c`,`125`,`Rose`],[`#bdebe3`,`#102522`,`155`,`Mint`],[`#ffd5b8`,`#2d1c10`,`135`,`Amber`],[`#c8f0ff`,`#11252c`,`165`,`Aqua`]].map(([e,t,n,r])=>`<button type="button" class="preset-chip" data-gradient-preset data-start="${e}" data-end="${t}" data-angle="${n}">${r}</button>`).join(``)}
        </div>
      </div>

      ${H(`Artwork image (optional)`,`artwork`,e?.artwork||``,`service-artwork-file`)}

      <section class="assign-projects">
        <div class="assign-projects-head"><div><span class="form-section-title">Assigned projects</span><p>Select which published work appears on this service page.</p></div><span class="assign-count" id="assigned-project-count">0 selected</span></div>
        <div class="service-project-grid">
          ${n.map(e=>`<label class="assign-project-card"><input type="checkbox" name="service_project_ids" value="${e.id}"><span class="assign-project-thumb" style="background-image:url('${l(e.thumbnail_url||e.poster_url||``)}')"></span><span class="assign-project-copy"><strong>${l(e.title)}</strong><small>${l(e.category||`Project`)}</small></span></label>`).join(``)||`<div class="form-note">Create and publish a project first.</div>`}
        </div>
      </section>

      <div class="form-grid two">${z(`Sort order`,`sort_order`,e?.sort_order??0)}<label class="check-row"><input type="checkbox" name="published" ${e?.published===!1?``:`checked`}> Published</label></div>
      <div class="form-error" id="editor-error" hidden></div>
      <div class="form-actions"><button type="button" class="ghost-btn" data-close>Cancel</button><button type="submit" class="solid-btn">${e?`Save changes`:`Create service`}</button></div>
    </form>
  </div>`,t.querySelectorAll(`[data-close]`).forEach(e=>e.addEventListener(`click`,()=>{t.innerHTML=``})),t.querySelector(`#service-form`).addEventListener(`submit`,t=>N(t,e?.id||``)),t.querySelector(`[data-reset-form]`)?.addEventListener(`click`,()=>{t.querySelector(`#service-form`)?.reset();let n=r.find(t=>t.slug===e?.slug)||r[0];if(!e&&n){let e=t.querySelector(`[name="accent"]`),r=t.querySelector(`[data-color-text="accent"]`),i=t.querySelector(`[name="gradient_end"]`),a=t.querySelector(`[data-color-text="gradient_end"]`),o=t.querySelector(`[name="gradient_angle"]`);e&&(e.value=n.gradientStart||n.accent),r&&(r.value=n.gradientStart||n.accent),i&&(i.value=n.gradientEnd||`#111111`),a&&(a.value=n.gradientEnd||`#111111`),o&&(o.value=n.gradientAngle||135)}W(t,`accent`),W(t,`gradient_end`),o()}),t.querySelector(`input[name="title"]`)?.addEventListener(`blur`,e=>{let n=t.querySelector(`input[name="slug"]`);n&&!n.value.trim()&&(n.value=u(e.target.value))});let i=t.querySelector(`#service-gradient-preview`),a=()=>{let e=t.querySelectorAll(`input[name="service_project_ids"]:checked`).length,n=t.querySelector(`#assigned-project-count`);n&&(n.textContent=`${e} selected`)},o=()=>{let e=t.querySelector(`[name="accent"]`)?.value||`#c8dcff`,n=t.querySelector(`[name="gradient_end"]`)?.value||`#111111`,r=Math.max(0,Math.min(360,Number(t.querySelector(`[name="gradient_angle"]`)?.value||135)));i&&(i.style.background=`linear-gradient(${r}deg, ${e}, ${n})`)};t.querySelectorAll(`[name="accent"],[name="gradient_end"],[name="gradient_angle"]`).forEach(e=>{e.addEventListener(`input`,()=>{W(t,e.name),o()})}),t.querySelectorAll(`[data-color-text]`).forEach(e=>e.addEventListener(`input`,()=>{let n=t.querySelector(`[name="${e.dataset.colorText}"]`);/^#[0-9a-fA-F]{6}$/.test(e.value)&&n&&(n.value=e.value),o()})),t.querySelectorAll(`[data-gradient-preset]`).forEach(e=>e.addEventListener(`click`,()=>{t.querySelector(`[name="accent"]`).value=e.dataset.start,t.querySelector(`[data-color-text="accent"]`).value=e.dataset.start,t.querySelector(`[name="gradient_end"]`).value=e.dataset.end,t.querySelector(`[data-color-text="gradient_end"]`).value=e.dataset.end,t.querySelector(`[name="gradient_angle"]`).value=e.dataset.angle,o()})),t.querySelectorAll(`input[name="service_project_ids"]`).forEach(e=>e.addEventListener(`change`,a)),j(t,e?.id).finally(()=>{a(),o()})}async function N(t,n){t.preventDefault();let r=t.currentTarget,i=r.querySelector(`#editor-error`);i.hidden=!0;let a=new FormData(r),o=String(a.get(`title`)||``).trim(),s=u(String(a.get(`slug`)||o));if(!o||!s){i.textContent=`Title and slug are required.`,i.hidden=!1;return}let c=q();try{let t=await T(r.querySelector(`#service-artwork-file`),`services/artwork`,s),i={title:o,slug:s,description:String(a.get(`description`)||``).trim()||null,tags:String(a.get(`tags`)||``).split(`,`).map(e=>e.trim()).filter(Boolean),accent:String(a.get(`accent`)||``).trim()||`#c8dcff`,gradient_start:String(a.get(`accent`)||``).trim()||`#c8dcff`,gradient_end:String(a.get(`gradient_end`)||``).trim()||`#111111`,gradient_angle:Math.max(0,Math.min(360,Number(a.get(`gradient_angle`)||135))),artwork:t||String(a.get(`artwork`)||``).trim()||null,published:a.get(`published`)===`on`,sort_order:Number(a.get(`sort_order`)||0)},l=n;if(n){let{error:t}=await e.from(`services`).update(i).eq(`id`,n);if(t)throw t}else{let{data:t,error:n}=await e.from(`services`).insert(i).select(`id`).single();if(n)throw n;l=t.id}let{error:u}=await e.from(`project_services`).delete().eq(`service_id`,l);if(u)throw u;let d=[...r.querySelectorAll(`input[name="service_project_ids"]:checked`)].map(e=>e.value);if(d.length){let{error:t}=await e.from(`project_services`).insert(d.map(e=>({project_id:e,service_id:l})));if(t)throw t}await h(),c(),A()}catch(e){J();let t=String(e?.message||e||`Unable to save service.`);/gradient_angle.*schema cache|column .*gradient_angle.*does not exist/i.test(t)?i.innerHTML=`The Supabase service gradient columns are missing. Run <strong>supabase/004_service_gradients.sql</strong> once in Supabase SQL Editor, then reload Admin.`:i.textContent=t,i.hidden=!1}}function P(){let e=v(`Intro / Hero`,`SITE MANAGEMENT`,`Edit the homepage message and control the intro reel from one focused workspace.`),t=f.settings||{};e.innerHTML=`<form id="intro-form" class="cms-form panel-inner">
    <div class="intro-form-fields">
      <section class="panel form-panel">
        <div class="panel-head"><div><h2>Hero copy</h2><p>Only the visible headline and eyebrow are managed here.</p></div></div>
        <div class="cms-form">
          <div class="form-grid two">
            ${R(`Eyebrow`,`hero_eyebrow`,t.hero_eyebrow||``)}
            ${R(`Headline line 1`,`hero_title_line_1`,t.hero_title_line_1||``)}
            ${R(`Headline line 2`,`hero_title_line_2`,t.hero_title_line_2||``)}
          </div>
        </div>
      </section>

      <section class="panel form-panel">
        <div class="panel-head"><div><h2>Intro video</h2><p>Use a YouTube, Vimeo or direct MP4 URL. The public intro uses a minimal Sutra control layer; provider controls stay off.</p></div></div>
        <div class="cms-form">
          ${R(`Video URL`,`intro_video_url`,t.intro_video_url||``,!1,`https://youtube.com/watch?v=…`,`url`)}
          <div class="form-grid two">
            <label>Video type
              <select name="intro_video_type">
                <option value="" ${t.intro_video_type?``:`selected`}>Auto detect</option>
                <option value="youtube" ${t.intro_video_type===`youtube`?`selected`:``}>YouTube</option>
                <option value="vimeo" ${t.intro_video_type===`vimeo`?`selected`:``}>Vimeo</option>
                <option value="external" ${t.intro_video_type===`external`?`selected`:``}>Direct MP4</option>
              </select>
            </label>
            ${R(`Video title`,`intro_video_title`,t.intro_video_title||`INTRO / REEL`)}
            ${R(`Meta / duration`,`intro_video_meta`,t.intro_video_meta||`00:00 — 00:30`)}
          </div>
          <div class="form-grid three">
            <label class="check-row"><input type="checkbox" name="intro_published" ${t.intro_published===!1?``:`checked`}> Published</label>
            <label class="check-row"><input type="checkbox" name="intro_autoplay" ${t.intro_autoplay===!1?``:`checked`}> Autoplay</label>
            <label class="check-row"><input type="checkbox" name="intro_muted" ${t.intro_muted===!1?``:`checked`}> Start muted</label>
          </div>
        </div>
      </section>

      <div class="form-actions"><button class="reset-btn" type="button" data-reset-form title="Reset unsaved changes"><span class="reset-icon">↺</span><span>Reset</span></button><button class="solid-btn" type="submit">Save intro / hero</button></div>
      <div class="form-error" id="editor-error" hidden></div>
    </div>

    <aside class="intro-preview-column">
      <div class="intro-preview-label"><span>LIVE PREVIEW</span><span>16 : 9</span></div>
      <div class="admin-media-preview" id="intro-preview">
        <span>VIDEO PREVIEW</span>
        <div class="intro-preview-caption"><span id="preview-title">${l(t.intro_video_title||`INTRO / REEL`)}</span><span id="preview-meta">${l(t.intro_video_meta||``)}</span></div>
      </div>
      <div class="intro-preview-help">The public intro uses a custom Sutra control layer. YouTube/Vimeo provider controls are hidden; the visual treatment stays consistent with the site.</div>
    </aside>
  </form>`;let n=e.querySelector(`#intro-form`);n.addEventListener(`submit`,I),n.querySelector(`[data-reset-form]`)?.addEventListener(`click`,()=>{n.reset(),a()});let r=e.querySelector(`#intro-preview`),a=()=>{r.querySelectorAll(`iframe,video`).forEach(e=>{e.tagName===`VIDEO`&&(e.pause(),e.removeAttribute(`src`),e.load()),e.remove()});let t=n.querySelector(`[name="intro_video_url"]`).value.trim();if(e.querySelector(`#preview-title`).textContent=n.querySelector(`[name="intro_video_title"]`).value||`INTRO / REEL`,e.querySelector(`#preview-meta`).textContent=n.querySelector(`[name="intro_video_meta"]`).value||``,!t)return;let a=n.querySelector(`[name="intro_video_type"]`).value,o=i({url:t,type:a,title:`Intro preview`,autoplay:!0,muted:!0,loop:!0,controls:!0,className:`admin-preview-video`});o&&r.prepend(o)};n.querySelector(`[name="intro_video_url"]`).addEventListener(`input`,a),n.querySelector(`[name="intro_video_type"]`).addEventListener(`change`,a),n.querySelector(`[name="intro_video_title"]`).addEventListener(`input`,()=>e.querySelector(`#preview-title`).textContent=n.querySelector(`[name="intro_video_title"]`).value||`INTRO / REEL`),n.querySelector(`[name="intro_video_meta"]`).addEventListener(`input`,()=>e.querySelector(`#preview-meta`).textContent=n.querySelector(`[name="intro_video_meta"]`).value||``),a()}function F(){let e=v(`Site Settings`,`SITE MANAGEMENT`,`Manage contact details, social links and the footer content.`),t=f.settings||{};e.innerHTML=`<form id="settings-form" class="cms-form panel-inner">
    <div class="form-section"><span class="form-section-title">Contact</span><div class="form-grid two">${R(`Owner name`,`owner_name`,t.owner_name||``)}${R(`Email`,`email`,t.email||``,!1,``,`email`)}${R(`Phone`,`phone`,t.phone||``)}${R(`Location`,`location`,t.location||``)}</div></div>
    <div class="form-section"><span class="form-section-title">Social links</span><div class="form-grid two">${R(`Instagram`,`instagram_url`,t.instagram_url||``,!1,``,`url`)}${R(`Facebook`,`facebook_url`,t.facebook_url||``,!1,``,`url`)}${R(`X`,`x_url`,t.x_url||``,!1,``,`url`)}${R(`LinkedIn`,`linkedin_url`,t.linkedin_url||``,!1,``,`url`)}</div></div>
    <div class="form-section"><span class="form-section-title">Footer</span><div class="form-grid two">${R(`Footer tagline`,`footer_tagline`,t.footer_tagline||`MOTION · VIDEO · STORY`)}${R(`Copyright`,`copyright_text`,t.copyright_text||`© 2026 Sujal Kumar. All rights reserved.`)}</div></div>
    <div class="form-actions"><button class="reset-btn" type="button" data-reset-form title="Reset unsaved changes"><span class="reset-icon">↺</span><span>Reset</span></button><button class="solid-btn" type="submit">Save site settings</button></div><div class="form-error" id="editor-error" hidden></div>
  </form>`,e.querySelector(`#settings-form`).addEventListener(`submit`,I),e.querySelector(`#settings-form`).querySelector(`[data-reset-form]`)?.addEventListener(`click`,()=>e.querySelector(`#settings-form`)?.reset())}async function I(t){t.preventDefault();let n=t.currentTarget,r=n.querySelector(`#editor-error`);r.hidden=!0;let i=new FormData(n),a=Object.fromEntries(i.entries());[`intro_published`,`intro_autoplay`,`intro_muted`].forEach(e=>{n.querySelector(`[name="${e}"]`)&&(a[e]=n.querySelector(`[name="${e}"]`).checked)}),[`year`].forEach(e=>{a[e]===``&&(a[e]=null)}),delete a.id;let o=q();try{if(f.settings?.id){let{error:t}=await e.from(`site_settings`).update(a).eq(`id`,f.settings.id);if(t)throw t}else{let{error:t}=await e.from(`site_settings`).insert(a);if(t)throw t}await h(),o()}catch(e){J(),r.textContent=e.message,r.hidden=!1}}async function L(t,n){let r=f[t].find(e=>e.id===n);if(!r)return;let i=r.title||r.name||`this item`;if(window.confirm(`Delete “${i}”? This cannot be undone.`))try{if(t===`services`){let{error:t}=await e.from(`project_services`).delete().eq(`service_id`,n);if(t)throw t}if(t===`projects`){let{error:t}=await e.from(`project_services`).delete().eq(`project_id`,n);if(t)throw t}let{error:r}=await e.from(t).delete().eq(`id`,n);if(r)throw r;await h(),K(`${i} deleted`),_(t===`projects`?`projects`:t===`clients`?`clients`:`services`)}catch(e){window.alert(e.message||`Unable to delete ${i}.`)}}function R(e,t,n=``,r=!1,i=``,a=`text`){return`<label>${l(e)}<input name="${l(t)}" type="${a}" value="${l(n)}" placeholder="${l(i)}" ${r?`required`:``}></label>`}function z(e,t,n=0){return R(e,t,n,!1,``,`number`)}function B(e=``){return`<label>Work type<select name="work_type"><option value="" ${e?``:`selected`}>Select work type</option>${[[`short-form`,`Short Form`],[`long-form`,`Long Form`],[`commercial`,`Commercial`],[`social-reel`,`Social / Reel`],[`explainer`,`Explainer`],[`product-launch`,`Product / Launch`],[`brand-film`,`Brand Film`],[`other`,`Other`]].map(([t,n])=>`<option value="${t}" ${e===t?`selected`:``}>${n}</option>`).join(``)}</select></label>`}function V(e,t,n=``,r=4){return`<label>${l(e)}<textarea name="${l(t)}" rows="${r}">${l(n)}</textarea></label>`}function H(e,t,n=``,r=``){return`<div class="media-input"><label>${l(e)} URL<input name="${l(t)}" value="${l(n)}" placeholder="https://..."></label><label>Upload image<input id="${l(r)}" type="file" accept="image/*"></label></div>`}function U(e,t,n=`#c8dcff`){return`<label class="color-field">${l(e)}<span class="color-input-wrap"><input type="color" name="${l(t)}" value="${l(n)}"><input type="text" data-color-text="${l(t)}" value="${l(n)}" pattern="^#[0-9a-fA-F]{6}$"></span></label>`}function W(e,t){let n=e.querySelector(`[name="${t}"]`),r=e.querySelector(`[data-color-text="${t}"]`);n&&r&&(r.value=n.value)}function G(){let e=document.getElementById(`admin-toast`);return e||(e=document.createElement(`div`),e.id=`admin-toast`,e.className=`admin-toast`,e.innerHTML=`<span class="admin-toast-spinner" aria-hidden="true"></span><span class="admin-toast-label"></span>`,document.body.appendChild(e)),e}function K(e,t=`saved`,n=1800){let r=G(),i=r.querySelector(`.admin-toast-label`);i.textContent=e,r.classList.remove(`is-saving`,`is-error`),t===`saving`&&r.classList.add(`is-saving`),t===`error`&&r.classList.add(`is-error`),r.classList.add(`show`),clearTimeout(K.timer),n>0&&(K.timer=setTimeout(()=>r.classList.remove(`show`),n))}function q(e=`Saving changes…`){return K(e,`saving`,0),()=>K(`Saved`,`saved`,1500)}function J(){K(`Could not save changes`,`error`,2200)}async function Y(){if(await p(),!e||!t){v(`Configuration required`,`ADMIN`),document.getElementById(`panel-body`).innerHTML=`<div class="empty-state">Supabase is not configured. Put the existing VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY values into .env.local.</div>`;return}try{await m(),await h()}catch(e){console.error(e),window.alert(`Could not load CMS data: ${e.message}`)}_(location.hash.replace(`#`,``)||`overview`)}document.querySelectorAll(`.admin-nav button[data-panel]`).forEach(e=>e.addEventListener(`click`,()=>_(e.dataset.panel))),document.getElementById(`logout`).addEventListener(`click`,async()=>{await a(),location.href=`./index.html`}),Y().catch(e=>{e.message!==`Not authenticated`&&console.error(`[sutra] Admin initialization failed`,e)});