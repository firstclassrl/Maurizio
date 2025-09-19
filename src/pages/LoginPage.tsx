import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Label } from '../components/ui/label'
import { Scale, LogIn, Eye, EyeOff, UserPlus, CheckCircle } from 'lucide-react'

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Scale className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">LadyBoy Planner</CardTitle>
          <CardDescription>
            Sistema di gestione pratiche legali
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tua@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
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
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
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
              className="w-full" 
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

          {message && (
            <div className={`mt-4 p-3 rounded-md flex items-center gap-2 ${
              isSuccess 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {isSuccess && <CheckCircle className="h-4 w-4" />}
              <span className="text-sm">{message}</span>
            </div>
          )}

          <div className="mt-6 text-center">
            <Button
              type="button"
              variant="link"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setMessage('')
                setPassword('')
              }}
              disabled={loading}
            >
              {isSignUp 
                ? 'Hai già un account? Accedi' 
                : ''}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}