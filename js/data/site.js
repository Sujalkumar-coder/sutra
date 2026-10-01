import { supabase } from '../lib/supabase.js'

export const defaultSiteSettings = {
  owner_name: 'Sujal Kumar',
  email: 'hello@sutra.studio',
  phone: '',
  location: '',
  instagram_url: '',
  facebook_url: '',
  x_url: '',
  linkedin_url: '',
  copyright_text: '© 2026 Sujal Kumar. All rights reserved.',
  footer_tagline: 'MOTION · VIDEO · STORY',
  hero_eyebrow: 'SUTRA STUDIO / MOTION · VIDEO · STORY',
  hero_title_line_1: 'We make ideas',
  hero_title_line_2: 'impossible to ignore.',
  intro_video_url: '',
  intro_video_type: '',
  intro_video_title: 'INTRO / REEL',
  intro_video_meta: '00:00 — 00:30',
  intro_published: true,
  intro_autoplay: true,
  intro_muted: true
}

export let siteSettings = { ...defaultSiteSettings }
export let siteSettingsRecordId = null

export async function loadSiteSettings() {
  if (!supabase) {
    siteSettings = { ...defaultSiteSettings }
    return siteSettings
  }

  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('[sutra] Failed to load site settings:', error)
    siteSettings = { ...defaultSiteSettings }
    return siteSettings
  }

  if (!data) {
    siteSettings = { ...defaultSiteSettings }
    siteSettingsRecordId = null
    return siteSettings
  }

  siteSettingsRecordId = data.id
  siteSettings = { ...defaultSiteSettings, ...data }
  return siteSettings
}
