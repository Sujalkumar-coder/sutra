import { supabase } from '../lib/supabase.js'

const fallbackServices = [
  { id: 'local-video-editing', title: 'Video Editing', slug: 'video-editing', description: 'Rhythm · story · retention', tags: ['Rhythm', 'story', 'retention'], accent: '#c8dcff', gradientStart: '#c8dcff', gradientEnd: '#111827', gradientAngle: 135, artwork: '', art: 0, sortOrder: 0 },
  { id: 'local-motion', title: 'Motion Graphics', slug: 'motion-graphics', description: 'Systems · type · movement', tags: ['Systems', 'type', 'movement'], accent: '#d7c8ff', gradientStart: '#d7c8ff', gradientEnd: '#1b1530', gradientAngle: 145, artwork: '', art: 1, sortOrder: 1 },
  { id: 'local-social', title: 'Social', slug: 'social', description: 'Hooks · pace · attention', tags: ['Hooks', 'pace', 'attention'], accent: '#ffc9dc', gradientStart: '#ffc9dc', gradientEnd: '#2a111c', gradientAngle: 125, artwork: '', art: 2, sortOrder: 2 },
  { id: 'local-explainers', title: 'Explainers', slug: 'explainers', description: 'Clarity · structure · visual logic', tags: ['Clarity', 'structure', 'visual logic'], accent: '#bdebe3', gradientStart: '#bdebe3', gradientEnd: '#102522', gradientAngle: 155, artwork: '', art: 3, sortOrder: 3 },
  { id: 'local-launches', title: 'Product Launches', slug: 'product-launches', description: 'Impact · reveal · momentum', tags: ['Impact', 'reveal', 'momentum'], accent: '#ffd5b8', gradientStart: '#ffd5b8', gradientEnd: '#2d1c10', gradientAngle: 135, artwork: '', art: 4, sortOrder: 4 },
  { id: 'local-saas', title: 'SaaS Animations', slug: 'saas-animations', description: 'Interface · product · motion', tags: ['Interface', 'product', 'motion'], accent: '#c8d9ff', gradientStart: '#c8d9ff', gradientEnd: '#111a2c', gradientAngle: 120, artwork: '', art: 5, sortOrder: 5 }
]

export let services = []

function mapService(service) {
  const tags = Array.isArray(service.tags) ? service.tags : []
  return {
    id: service.id,
    title: service.title || '',
    slug: service.slug || '',
    description: service.description || tags.join(' · '),
    tags,
    accent: service.accent || '#c8dcff',
    gradientStart: service.gradient_start || service.accent || '#c8dcff',
    gradientEnd: service.gradient_end || '#111111',
    gradientAngle: Number(service.gradient_angle ?? 135),
    artwork: service.artwork || '',
    art: Number.isFinite(Number(service.art)) ? Number(service.art) : (Number(service.sort_order || 0) % 6),
    sortOrder: Number(service.sort_order || 0)
  }
}

export async function loadServices() {
  if (!supabase) {
    services = [...fallbackServices]
    return services
  }

  const { data, error } = await supabase
    .from('services')
    .select('id,title,slug,description,tags,accent,gradient_start,gradient_end,gradient_angle,artwork,published,sort_order,created_at')
    .eq('published', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[sutra] Failed to load services:', error)
    services = [...fallbackServices]
    return services
  }

  if (!data?.length) {
    services = []
    return services
  }

  services = (data || []).map(mapService)
  return services
}

export { fallbackServices, mapService }
