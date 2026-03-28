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
      if (email === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password) {
        setDemoAuth(email, password)
        setSuccess('Account created successfully!')
        setTimeout(() => {
          router.push('/dashboard')
        }, 1000)
        return
      }

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

              {/* Card */}
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="text-2xl">Create Account</CardTitle>
                  <CardDescription>
                    Set up your onboarding system account
                  </CardDescription>
                </CardHeader>

                <CardContent>

                  {/* Demo Box */}
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex gap-3">
                      <AlertCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-green-900 mb-2">Quick Start</p>
                        <p className="text-green-800 text-xs mb-3">
                          Use demo credentials:
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={useDemoCredentials}
                          className="w-full"
                        >
                          Use Demo: admin@company.com / 12345
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* FORM */}
                  <form onSubmit={handleSignUp} className="space-y-6">

                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Password</Label>
                      <Input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Confirm Password</Label>
                      <Input
                        type="password"
                        required
                        value={repeatPassword}
                        onChange={(e) => setRepeatPassword(e.target.value)}
                      />
                    </div>

                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    {success && <p className="text-green-500 text-sm">{success}</p>}

                    <Button type="submit" disabled={isLoading} className="w-full">
                      {isLoading ? 'Creating...' : 'Create Account'}
                    </Button>

                  </form>

                  {/* Footer */}
                  <div className="mt-6 text-center border-t pt-6">
                    <p className="text-sm">
                      Already have an account?
                      <Link href="/auth/login" className="text-blue-600 underline">
                        Sign in
                      </Link>
                    </p>
                  </div>

                </CardContent>
              </Card>

            </div>
          </div>
        </div>
      )}
    </>
  )
}