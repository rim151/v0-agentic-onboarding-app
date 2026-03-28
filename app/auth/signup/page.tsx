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
import { useState } from 'react'
import SplashScreen from '@/components/splash-screen'
import { DEMO_CREDENTIALS, setDemoAuth } from '@/lib/demo-auth'
import { AlertCircle } from 'lucide-react'

export default function Page() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showSplash, setShowSplash] = useState(true)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    if (password !== repeatPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (password.length < 4) {
      setError('Password must be at least 4 characters')
      setIsLoading(false)
      return
    }

    try {
      // Allow demo credentials signup
      if (email === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password) {
        setDemoAuth(email, password)
        setSuccess('Account created successfully!')
        setTimeout(() => {
          router.push('/dashboard')
        }, 1000)
        return
      }

      // Try to create account via Supabase
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
            `${window.location.origin}/protected`,
        },
      })
      
      if (error) {
        // If Supabase fails, suggest demo account
        if (error.message.includes('already registered')) {
          setError(`Email already registered. Try demo: ${DEMO_CREDENTIALS.email}`)
        } else {
          setError(`Try demo credentials: ${DEMO_CREDENTIALS.email} / ${DEMO_CREDENTIALS.password}`)
        }
        return
      }
      
      router.push('/auth/signup-success')
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'An error occurred'
      setError(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  const useDemoCredentials = () => {
    setEmail(DEMO_CREDENTIALS.email)
    setPassword(DEMO_CREDENTIALS.password)
    setRepeatPassword(DEMO_CREDENTIALS.password)
    setError(null)
    setSuccess(null)
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

          {/* Signup Card */}
          <Card className="shadow-lg border-0">
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl">Create Account</CardTitle>
              <CardDescription className="text-base">
                Set up your onboarding system account
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Demo Info Box */}
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-green-900 mb-2">Quick Start</p>
                    <p className="text-green-800 text-xs mb-3">
                      Use demo credentials to explore immediately:
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={useDemoCredentials}
                      className="w-full border-green-600 text-green-700 hover:bg-green-50"
                    >
                      Use Demo: admin@company.com / 12345
                    </Button>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSignUp} className="space-y-6">
                <div className="flex flex-col gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700 font-medium">Email Address</Label>
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
                    <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
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
                  <div className="space-y-2">
                    <Label htmlFor="repeat-password" className="text-gray-700 font-medium">Confirm Password</Label>
                    <Input
                      id="repeat-password"
                      type="password"
                      placeholder="••••••••"
                      required
                      value={repeatPassword}
                      onChange={(e) => setRepeatPassword(e.target.value)}
                      className="h-11 border-gray-200"
                    />
                  </div>
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}
                  {success && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-700">{success}</p>
                    </div>
                  )}
                  <Button 
                    type="submit" 
                    className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </div>
              </form>

              {/* Footer */}
              <div className="mt-6 text-center space-y-3 border-t border-gray-200 pt-6">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link
                    href="/auth/login"
                    className="font-semibold text-blue-600 hover:text-blue-700 underline underline-offset-2 transition-colors"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
      )}
    </>
  )
}
