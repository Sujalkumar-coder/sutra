import { loginAdmin, requestPasswordReset, getCurrentAdmin } from './auth.js'

const form = document.getElementById('login-form')
const button = document.getElementById('login-button')
const forgotButton = document.getElementById('forgot-password')
const errorBox = document.getElementById('login-error')

function showMessage(message, tone = 'error') {
  errorBox.textContent = message
  errorBox.style.display = 'block'
  errorBox.style.borderColor = tone === 'success' ? '#263d2d' : '#3b1b1b'
  errorBox.style.background = tone === 'success' ? '#0e1a12' : '#211010'
  errorBox.style.color = tone === 'success' ? '#a7d7b4' : '#ff8d8d'
}

async function handleForgotPassword() {
  const email = document.getElementById('email').value.trim()

  if (!email) {
    document.getElementById('email').focus()
    showMessage('Enter your admin email first.')
    return
  }

  forgotButton.disabled = true
  forgotButton.textContent = 'Sending reset link…'
  errorBox.style.display = 'none'

  try {
    await requestPasswordReset(email)
    showMessage('If that email belongs to an admin account, a password reset link has been sent.', 'success')
  } catch (error) {
    console.error('Password reset request error:', error)
    showMessage(error.message || 'Unable to send the reset link.')
  } finally {
    forgotButton.disabled = false
    forgotButton.textContent = 'Forgot password?'
  }
}

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
    forgotButton.disabled = true
    button.textContent = 'Signing in…'

    try {
      await loginAdmin(
        document.getElementById('email').value.trim(),
        document.getElementById('password').value
      )
      window.location.href = './dashboard.html'
    } catch (error) {
      console.error('Login error:', error)
      showMessage(error.message || 'Unable to sign in.')
      button.disabled = false
      forgotButton.disabled = false
      button.textContent = 'Sign in'
    }
  })

  forgotButton.addEventListener('click', handleForgotPassword)
}

initializeLogin().catch((error) => {
  console.error('Auth initialization error:', error)
})
