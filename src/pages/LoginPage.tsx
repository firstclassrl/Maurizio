import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Logo } from '../components/ui/Logo'
import { LogIn, Eye, EyeOff, UserPlus, CheckCircle } from 'lucide-react'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      let error
      
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        })
        error = signUpError
        if (!error) {
          setMessage('Account creato con successo! Ora puoi effettuare il login.')
          setIsSuccess(true)
          setIsSignUp(false)
          setPassword('')
          setLoading(false)
          return
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        error = signInError
      }

      if (error) {
        setMessage(error.message === 'Invalid login credentials' 
          ? 'Email o password non corretti' 
          : error.message)
        setIsSuccess(false)
      } else {
        setMessage(isSignUp ? 'Account creato con successo!' : 'Login effettuato!')
        setIsSuccess(true)
      }
    } catch (error) {
      setMessage('Si è verificato un errore. Riprova.')
      setIsSuccess(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Glassmorphism login card */}
      <div className="relative w-full max-w-md">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8">
          {/* Logo and header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30 shadow-lg">
                <Logo size={60} />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">LadyBoy Planner</h1>
            <p className="text-white/70 text-sm">Sistema di gestione pratiche legali</p>
          </div>

          {/* Form */}
          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/90 text-sm font-medium">
                Email
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="tua@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="bg-white/10 backdrop-blur-sm border-white/30 text-white placeholder-white/50 focus:border-white/50 focus:ring-white/20"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/90 text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="La tua password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  minLength={6}
                  className="bg-white/10 backdrop-blur-sm border-white/30 text-white placeholder-white/50 focus:border-white/50 focus:ring-white/20 pr-12"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-white/10 text-white/70"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105" 
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {isSignUp ? 'Creazione account...' : 'Accesso in corso...'}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {isSignUp ? (
                    <><UserPlus className="h-4 w-4" />Crea Account</>
                  ) : (
                    <><LogIn className="h-4 w-4" />Accedi</>
                  )}
                </div>
              )}
            </Button>
          </form>

          {/* Message */}
          {message && (
            <div className={`mt-6 p-4 rounded-xl backdrop-blur-sm border flex items-center gap-3 ${
              isSuccess 
                ? 'bg-green-500/20 text-green-100 border-green-400/30' 
                : 'bg-red-500/20 text-red-100 border-red-400/30'
            }`}>
              {isSuccess && <CheckCircle className="h-5 w-5" />}
              <span className="text-sm">{message}</span>
            </div>
          )}

          {/* Toggle signup */}
          <div className="mt-6 text-center">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setMessage('')
                setPassword('')
              }}
              disabled={loading}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              {isSignUp 
                ? 'Hai già un account? Accedi' 
                : ''}
            </Button>
          </div>
        </div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/30 rounded-full animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-white/40 rounded-full animate-pulse animation-delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-1.5 h-1.5 bg-white/20 rounded-full animate-pulse animation-delay-2000"></div>
      </div>
    </div>
  )
}