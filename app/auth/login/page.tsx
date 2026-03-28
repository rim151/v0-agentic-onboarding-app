'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import SplashScreen from '@/components/splash-screen'
import { isDemoAuthValid, setDemoAuth } from '@/lib/demo-auth'
import { AlertCircle, Info } from 'lucide-react'

export default function Page() {
  const [email, setEmail] = useState('admin@company.com')
  const [password, setPassword] = useState('12345')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showSplash, setShowSplash] = useState(true)
  const [supabaseConnected, setSupabaseConnected] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if Supabase is accessible
    const checkSupabase = async () => {
      try {
        const supabase = createClient()
        const { data } = await supabase.auth.getSession()
        setSupabaseConnected(true)
      } catch {
        setSupabaseConnected(false)
      }
    }
    checkSupabase()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Check if it's demo credentials first
      if (isDemoAuthValid(email, password)) {
        setDemoAuth(email, password)
        router.push('/dashboard')
        return
      }

      // Try Supabase auth
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
            `${window.location.origin}/protected`,
        },
      })
      
      if (error) {
        // If Supabase fails and it's not a network error, suggest demo login
        if (!supabaseConnected || email === 'admin@company.com') {
          setError('Try demo login: Use admin@company.com / 12345')
          return
        }
        throw error
      }
      
      router.push('/dashboard')
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'An error occurred'
      if (errorMsg.includes('Invalid login credentials')) {
        setError('Invalid credentials. Demo: admin@company.com / 12345')
      } else {
        setError(errorMsg)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <SplashScreen onComplete={() => setShowSplash(false)} />
      {!showSplash && (
      <div className="flex min-h-svh w-full items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-teal-600 flex items-center justify-center">
                <span className="text-white font-bold text-xl">✓</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Employee Onboarding</h1>
            <p className="text-gray-600">Multi-Agent AI System</p>
          </div>

          {/* Login Card */}
          <Card className="shadow-lg border-0">
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl">Welcome Back</CardTitle>
              <CardDescription className="text-base">
                Sign in to your account to continue
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Demo Info Box */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex gap-3">
                <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900">Demo Credentials</p>
                  <p className="text-blue-800 mt-1">
                    Email: <code className="bg-white px-2 py-1 rounded font-mono">admin@company.com</code>
                  </p>
                  <p className="text-blue-800">
                    Password: <code className="bg-white px-2 py-1 rounded font-mono">12345</code>
                  </p>
                </div>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@company.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 border-gray-200"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700 font-medium">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 border-gray-200"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <Link
                href="/auth/sign-up"
                className="font-semibold text-blue-600 hover:text-blue-700 underline underline-offset-2 transition-colors"
              >
                Create account
              </Link>
            </p>
            <p className="text-xs text-gray-500">
              Protected by enterprise-grade security
            </p>
          </div>
        </div>
      </div>
    </div>
      )}
    </>
  )
}
