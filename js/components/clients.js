import { clients } from '../data/clients.js'

const pad = (n) => String(n + 1).padStart(2, '0')
const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]))
const mono = (name) => String(name || '').trim().charAt(0).toUpperCase()

export function initClients() {
  const root = document.getElementById('clientsApp')
  if (!root) return
  if (!clients.length) { root.innerHTML = '<div class="cms-empty-public">No published clients yet.</div>'; return }

  const names = clients.map((c) => c.name.toUpperCase())
  const loop = Array.from({length:Math.max(2,Math.ceil(14/names.length))},()=>names).flat()
  root.innerHTML = `
    <div class="cl-stage">
      <div class="cl-list" role="tablist" aria-label="Clients">
        ${clients.map((c,i)=>`<button type="button" class="cl-item" role="tab" data-i="${i}" aria-selected="false"><span>${pad(i)}</span><strong>${esc(c.name)}</strong></button>`).join('')}
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
    <div class="cl-marquee" aria-hidden="true"><div class="cl-marquee-track">${[...loop,...loop].map((n)=>`<span>${esc(n)}</span><i></i>`).join('')}</div></div>`

  const items = [...root.querySelectorAll('.cl-item')]
  const galleryImage = root.querySelector('[data-gallery-image]')
  const galleryName = root.querySelector('[data-name]')
  const galleryDesc = root.querySelector('[data-desc]')
  const galleryCur = root.querySelector('[data-gallery-cur]')
  const galleryTotal = root.querySelector('[data-gallery-total]')
  const galleryIndex = root.querySelector('[data-gallery-index]')
  const portrait = root.querySelector('[data-portrait]')
  const portraitImg = root.querySelector('[data-portrait-img]')
  const portraitMono = root.querySelector('[data-mono]')
  const portraitMeta = root.querySelector('[data-portrait-meta]')
  let current = 0
  let galleryIndexValue = 0

  function galleryFor(c){ return [ ...(c.gallery || []) ].filter(Boolean).length ? [...(c.gallery || [])].filter(Boolean) : [c.primary_image_url || c.image || ''].filter(Boolean) }
  function updateGallery(c, animate=true){
    const media = galleryFor(c)
    if(!media.length){ galleryImage.style.backgroundImage=''; galleryTotal.textContent='01'; galleryCur.textContent='01'; return }
    galleryIndexValue = (galleryIndexValue + media.length) % media.length
    const src = media[galleryIndexValue]
    galleryImage.style.backgroundImage = src ? `url("${src}")` : ''
    galleryCur.textContent = pad(galleryIndexValue)
    galleryTotal.textContent = pad(media.length-1)
    galleryIndex.textContent = pad(galleryIndexValue)
    if(animate){ galleryImage.classList.remove('gallery-swap'); void galleryImage.offsetWidth; galleryImage.classList.add('gallery-swap') }
  }
  function selectClient(i){
    current=(i+clients.length)%clients.length
    const c=clients[current]
    galleryIndexValue=0
    items.forEach((el,n)=>{el.classList.toggle('active',n===current);el.setAttribute('aria-selected',n===current?'true':'false')})
    galleryName.textContent=c.name || ''
    galleryDesc.textContent=c.description || ''
    portraitMono.textContent=mono(c.name)
    portraitMeta.textContent=[c.year,c.url?'VIEW ↗':''].filter(Boolean).join(' · ')
    if(c.image){
      portrait.style.setProperty('--portrait-bg', `url("${c.image}")`)
      portraitImg.src=c.image
      portraitImg.alt=c.name||'Client'
      portrait.classList.add('has-image')
    } else {
      portrait.style.removeProperty('--portrait-bg')
      portraitImg.removeAttribute('src')
      portraitImg.alt=''
      portrait.classList.remove('has-image')
    }
    updateGallery(c,false)
  }

  root.addEventListener('click',(e)=>{
    const item=e.target.closest('.cl-item'); const step=e.target.closest('[data-gallery-step]')
    if(item){selectClient(+item.dataset.i);items[+item.dataset.i]?.scrollIntoView({block:'nearest',inline:'nearest'})}
    else if(step){const media=galleryFor(clients[current]);if(!media.length)return;galleryIndexValue=(galleryIndexValue+(+step.dataset.galleryStep)+media.length)%media.length;updateGallery(clients[current],true)}
  })
  root.querySelector('.cl-list').addEventListener('keydown',(e)=>{const d={ArrowDown:1,ArrowRight:1,ArrowUp:-1,ArrowLeft:-1}[e.key];if(!d)return;e.preventDefault();selectClient(current+d);items[current].focus()})
  items.forEach(el=>el.addEventListener('pointerenter',(e)=>{if(e.pointerType==='mouse')selectClient(+el.dataset.i)}))
  selectClient(0)
}
