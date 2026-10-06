import { supabase } from '../lib/supabase.js'

export async function loginAdmin(email, password) {
  if (!supabase) throw new Error('Supabase is not configured.')

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) throw error
  return data
}

export async function requestPasswordReset(email) {
  if (!supabase) throw new Error('Supabase is not configured.')

  const redirectTo = new URL('./reset-password.html', window.location.href).href
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })

  if (error) throw error
}

export async function updateAdminPassword(password) {
  if (!supabase) throw new Error('Supabase is not configured.')

  const { data, error } = await supabase.auth.updateUser({ password })

  if (error) throw error
  return data
}

export async function logoutAdmin() {
  if (!supabase) return

  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentAdmin() {
  if (!supabase) return null

  const {
    data: { user }
  } = await supabase.auth.getUser()

  return user
}
