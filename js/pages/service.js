import { supabase } from '../lib/supabase.js'
import { loadServices } from '../data/services.js'
import { createVideoElement } from '../lib/video.js'
import { youtubePoster } from '../lib/video.js'
import { initThemeToggle } from '../components/theme-toggle.js'
import { initHeader } from '../components/header.js'
import { initCursor } from '../components/cursor-trail.js'
import { initMagnetic } from '../components/magnetic.js'

const slug = new URLSearchParams(location.search).get('slug') || ''
const esc = (s='') => String(s).replace(/[&<>"']/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))
const order = ['Short Form','Long Form','Commercial','Social / Reel','Explainer','Product / Launch','Brand Film','Other']

async function getRelatedProjects(serviceId){
  if(!supabase || !serviceId) return []
  const {data,error}=await supabase.from('project_services').select('project_id,projects(id,title,slug,description,category,client_name,year,thumbnail_url,poster_url,video_url,video_type,work_type,published,sort_order)').eq('service_id',serviceId)
  if(error) throw error
  return (data||[]).map(r=>r.projects).filter(p=>p?.published).sort((a,b)=>(a.sort_order||0)-(b.sort_order||0))
}

function poster(p){ return p.thumbnail_url || p.poster_url || youtubePoster(p.video_url||'') || '' }

function groupProjects(projects){
  const map=new Map()
  projects.forEach((p)=>{ const key=p.work_type || 'Other'; if(!map.has(key)) map.set(key,[]); map.get(key).push(p) })
  return [...map.entries()].sort((a,b)=>{
    const ai=order.indexOf(a[0]), bi=order.indexOf(b[0])
    if(ai===-1 && bi===-1) return a[0].localeCompare(b[0]);
    if(ai===-1) return 1; if(bi===-1) return -1; return ai-bi
  })
}

async function boot(){
  initThemeToggle(); initHeader(); initCursor(); initMagnetic()
  await loadServices()
  const {services}=await import('../data/services.js')
  const service=services.find(s=>s.slug===slug)
  if(!service){
    document.title='Service not found — Sutra Studio'
    document.getElementById('servicePageTitle').textContent='Service not found'
    document.getElementById('serviceProjects').innerHTML='<div class="service-empty"><span>404</span><strong>This service is not currently published.</strong><a href="./index.html#services">Back to Services ↗</a></div>'
    return
  }
  const idx=Math.max(0,services.findIndex(s=>s.id===service.id))
  document.title=`${service.title} — Sutra Studio`
  document.getElementById('servicePageTitle').textContent=service.title
  document.getElementById('servicePageIndex').textContent=String(idx+1).padStart(2,'0')

  let projects=[]
  try{ projects=await getRelatedProjects(service.id) }catch(error){ console.error('[sutra] Service projects failed:',error) }
  document.getElementById('serviceProjectCount').textContent=projects.length
  const host=document.getElementById('serviceProjects')
  if(!projects.length){host.innerHTML='<div class="service-empty"><span>NO ASSIGNED WORK</span><strong>No published projects yet.</strong><p>Assign projects in Admin → Services → Edit → Assigned projects.</p></div>';return}

  host.innerHTML=groupProjects(projects).map(([type,items])=>`
    <section class="service-work-group">
      <div class="service-work-group-head"><span>${esc(type.toUpperCase())}</span><i></i><b>${String(items.length).padStart(2,'0')}</b></div>
      <div class="service-work-list">${items.map((p,i)=>{
        const image=poster(p)
        const mediaStyle=image?`background-image:url(\"${esc(image)}\")`:'none'
        return `<a class="service-project-row" href="./project.html?slug=${encodeURIComponent(p.slug)}">
          <div class="service-project-thumb" style="${mediaStyle}"><span>${String(i+1).padStart(2,'0')}</span>${p.video_url?'<em>PLAY ↗</em>':''}</div>
          <div class="service-project-copy"><small>${esc(p.category||'')}</small><h2>${esc(p.title||'')}</h2><p>${esc(p.description||'')}</p></div>
          <div class="service-project-meta"><span>${esc(p.client_name||'')}</span><span>${p.year?esc(p.year):''}</span><b>↗</b></div>
        </a>`
      }).join('')}</div>
    </section>`).join('')
}
boot().catch((e)=>console.error('[sutra] Service page failed:',e))
