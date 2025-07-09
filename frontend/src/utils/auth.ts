export const authUtils = {
  // Uloženie tokenu
  setToken: (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token)
    }
  },

  // Získanie tokenu
  getToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token')
    }
    return null
  },

  // Odstránenie tokenu
  removeToken: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token')
    }
  },

  // Kontrola, či je používateľ prihlásený
  isAuthenticated: (): boolean => {
    return !!authUtils.getToken()
  },

  // Logout
  logout: () => {
    authUtils.removeToken()
    window.location.href = '/login'
  }
}