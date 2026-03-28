'use client'

// Demo credentials for testing
export const DEMO_CREDENTIALS = {
  email: 'admin@company.com',
  password: '12345'
}

// Store demo auth state in localStorage
export function setDemoAuth(email: string, password: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('demo_auth_email', email)
    localStorage.setItem('demo_auth_token', btoa(`${email}:${password}`))
  }
}

export function getDemoAuth() {
  if (typeof window === 'undefined') return null
  
  const email = localStorage.getItem('demo_auth_email')
  const token = localStorage.getItem('demo_auth_token')
  
  return email && token ? { email, token } : null
}

export function clearDemoAuth() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('demo_auth_email')
    localStorage.removeItem('demo_auth_token')
  }
}

export function isDemoAuthValid(email: string, password: string): boolean {
  return email === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password
}

export function isDemoLoggedIn(): boolean {
  return getDemoAuth() !== null
}
