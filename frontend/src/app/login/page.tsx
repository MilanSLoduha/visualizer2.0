'use client';

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation';
 
export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
 
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
 
    const formData = new FormData(event.currentTarget)
    const username = formData.get('username')
    const password = formData.get('password')
 
    try {
      // Priamy volanie NestJS backendu
      const response = await fetch('http://localhost:8081/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
 
      if (response.ok) {
        const data = await response.json()
        
        if (data.access_token) {
          localStorage.setItem('access_token', data.access_token)
          window.alert('Prihlásenie úspešné!')
          router.push('/profile')
        } else {
          window.alert('Nie ste prihlásený - chýba token!')
        }
      } else {
        window.alert('Nie ste prihlásený - neplatné údaje!')
      }
    } catch (error) {
      console.error('Login error:', error)
      window.alert('Nie ste prihlásený - chyba servera!')
    } finally {
      setIsLoading(false)
    }
  }
 
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Prihlásenie</h1>
          <p className="mt-2 text-sm text-gray-600">
            Prihláste sa do svojho účtu
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Používateľské meno
              </label>
              <input 
                id="username"
                type="text" 
                name="username" 
                placeholder="Zadajte používateľské meno" 
                required 
                className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-gray-900 placeholder-gray-500 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Heslo
              </label>
              <input 
                id="password"
                type="password" 
                name="password" 
                placeholder="Zadajte heslo" 
                required 
                className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-gray-900 placeholder-gray-500 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className={`group relative flex w-full justify-center rounded-lg border border-transparent px-4 py-3 text-sm font-medium text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isLoading 
                ? 'cursor-not-allowed bg-gray-400' 
                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
            }`}
          >
            {isLoading ? (
              <>
                <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Prihlasuje sa...
              </>
            ) : (
              'Prihlásiť sa'
            )}
          </button>
        </form>
        
        <div className="rounded-lg bg-blue-50 p-4">
          <div className="text-center">
            <p className="text-sm font-medium text-blue-800">Testovacie účty:</p>
            <div className="mt-2 space-y-1">
              <p className="text-xs text-blue-600">
                <span className="font-mono bg-blue-100 px-2 py-1 rounded">tester123</span>
                {' / '}
                <span className="font-mono bg-blue-100 px-2 py-1 rounded">mojeheslo123</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}