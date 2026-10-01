import { supabase } from '../lib/supabase.js'

const fallbackProjects = [
  {
    id: 'local-1',
    title: 'Project One',
    slug: 'project-one',
    category: 'VIDEO EDITING · MOTION',
    desc: 'A fast editorial system built around rhythm, pacing and a strong opening hook.',
    image: '',
    poster: '',
    video: '',
    videoType: '',
    client: '',
    year: '',
    projectUrl: '',
    featured: true,
    workType: 'Short Form'
  },
  {
    id: 'local-2',
    title: 'Project Two',
    slug: 'project-two',
    category: 'SAAS · MOTION GRAPHICS',
    desc: 'A cinematic motion system for a digital product, built around clarity and controlled attention.',
    image: '',
    poster: '',
    video: '',
    videoType: '',
    client: '',
    year: '',
    projectUrl: '',
    featured: true,
    workType: 'Short Form'
  },
  {
    id: 'local-3',
    title: 'Project Three',
    slug: 'project-three',
    category: 'SOCIAL · VIDEO EDITING',
    desc: 'Short-form storytelling designed to make the first seconds impossible to scroll past.',
    image: '',
    poster: '',
    video: '',
    videoType: '',
    client: '',
    year: '',
    projectUrl: '',
    featured: true,
    workType: 'Short Form'
  },
  {
    id: 'local-4',
    title: 'Project Four',
    slug: 'project-four',
    category: 'EXPLAINER · MOTION',
    desc: 'Complex product logic translated into a visual language that feels simple and alive.',
    image: '',
    poster: '',
    video: '',
    videoType: '',
    client: '',
    year: '',
    projectUrl: '',
    featured: false,
    workType: 'Explainer'
  },
  {
    id: 'local-5',
    title: 'Project Five',
    slug: 'project-five',
    category: 'PRODUCT LAUNCH · MOTION',
    desc: 'A launch film built around reveal, contrast and deliberate momentum.',
    image: '',
    poster: '',
    video: '',
    videoType: '',
    client: '',
    year: '',
    projectUrl: '',
    featured: false,
    workType: 'Product / Launch'
  },
  {
    id: 'local-6',
    title: 'Project Six',
    slug: 'project-six',
    category: 'SOCIAL · MOTION',
    desc: 'A visual campaign system connecting typography, movement and sound-driven pacing.',
    image: '',
    poster: '',
    video: '',
    videoType: '',
    client: '',
    year: '',
    projectUrl: '',
    featured: false,
    workType: 'Social / Reel'
  }
]

export let projects = [...fallbackProjects]

function mapProject(project) {
  return {
    id: project.id,
    title: project.title || '',
    slug: project.slug || '',
    category: project.category || '',
    desc: project.description || '',
    image: project.thumbnail_url || '',
    poster: project.poster_url || '',
    video: project.video_url || '',
    videoType: project.video_type || '',
    client: project.client_name || '',
    year: project.year || '',
    projectUrl: project.project_url || '',
    featured: Boolean(project.featured),
    workType: project.work_type || ''
  }
}

export async function loadProjects() {
  if (!supabase) {
    projects = [...fallbackProjects]
    return projects
  }

  const { data, error } = await supabase
    .from('projects')
    .select(`
      id,
      title,
      slug,
      description,
      category,
      client_name,
      year,
      thumbnail_url,
      poster_url,
      video_url,
      video_type,
      project_url,
      featured,
      work_type,
      published,
      sort_order,
      created_at
    `)
    .eq('published', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[sutra] Failed to load projects from Supabase:', error)
    projects = [...fallbackProjects]
    return projects
  }

  if (!data?.length) {
    projects = []
    return projects
  }

  projects = data.map(mapProject)
  console.info(`[sutra] Loaded ${projects.length} published project(s) from Supabase.`)
  return projects
}

export { fallbackProjects, mapProject }
