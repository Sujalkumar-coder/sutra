import { supabase } from '../lib/supabase.js'

const fallbackClients = [
  { id: 'local-roosthaven', name: 'Roosthaven', slug: 'roosthaven', description: 'Property, hospitality and digital storytelling.', logo: '', image: '', gallery: [], url: '', year: 2026, featured: true, sortOrder: 0 },
  { id: 'local-elite-club', name: 'Elite Club', slug: 'elite-club', description: 'Premium lifestyle and an exclusive member network.', logo: '', image: '', gallery: [], url: '', year: 2026, featured: true, sortOrder: 1 }
]

export let clients = []

function mapClient(client) {
  return {
    id: client.id,
    name: client.name || '',
    slug: client.slug || '',
    description: client.description || '',
    logo: client.logo_url || '',
    image: client.primary_image_url || '',
    gallery: Array.isArray(client.gallery) ? client.gallery : [],
    url: client.website_url || '',
    year: client.year || '',
    featured: Boolean(client.featured),
    sortOrder: Number(client.sort_order || 0)
  }
}

export async function loadClients() {
  if (!supabase) {
    clients = [...fallbackClients]
    return clients
  }

  const { data, error } = await supabase
    .from('clients')
    .select('id,name,slug,description,logo_url,primary_image_url,gallery,website_url,year,published,featured,sort_order,created_at')
    .eq('published', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[sutra] Failed to load clients:', error)
    clients = [...fallbackClients]
    return clients
  }

  if (!data?.length) {
    clients = []
    return clients
  }

  clients = (data || []).map(mapClient)
  return clients
}

export { fallbackClients, mapClient }
