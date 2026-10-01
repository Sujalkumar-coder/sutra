import { loginAdmin, getCurrentAdmin } from './auth.js'

const form = document.getElementById('login-form')
const button = document.getElementById('login-button')
const errorBox = document.getElementById('login-error')

async function initializeLogin() {
  const existingUser = await getCurrentAdmin()

  if (existingUser) {
    window.location.href = './dashboard.html'
    return
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault()

    errorBox.style.display = 'none'
    button.disabled = true
    button.textContent = 'Signing in...'

    try {
      await loginAdmin(
        document.getElementById('email').value.trim(),
        document.getElementById('password').value
      )
      window.location.href = './dashboard.html'
    } catch (error) {
      console.error('Login error:', error)
      errorBox.textContent = error.message || 'Unable to sign in.'
      errorBox.style.display = 'block'
      button.disabled = false
      button.textContent = 'Sign in'
    }
  })
}

initializeLogin().catch((error) => {
  console.error('Auth initialization error:', error)
})
