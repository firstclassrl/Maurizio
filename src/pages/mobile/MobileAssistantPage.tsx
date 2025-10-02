import React, { useState, useRef, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { MobileLayout } from '../../components/mobile/MobileLayout'
import { MobileHeader } from '../../components/mobile/MobileHeader'
import { AppView } from '../../App'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Mic, MicOff, Send, Bot, User as UserIcon, Loader2, Zap } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface MobileAssistantPageProps {
  user: User
  onNavigate: (view: AppView) => void
}

export function MobileAssistantPage({ user, onNavigate }: MobileAssistantPageProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: '👋 Ciao! Sono il tuo assistente legale AI. Puoi chiedermi informazioni su pratiche, udienze, clienti e scadenze. Prova a chiedere: "Quando è l\'udienza di Alfa Srl?" o "Quali pratiche scadono questa settimana?"',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const stopListenTimeoutRef = useRef<number | null>(null)
  const [isSpeechSupported, setIsSpeechSupported] = useState(false)
  const [remainingQueries, setRemainingQueries] = useState<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (SpeechRecognition) {
      setIsSpeechSupported(true)
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = 'it-IT'
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setInputValue(transcript)
        setIsListening(false)
      }
      
      recognitionRef.current.onerror = () => {
        setIsListening(false)
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isListening) {
      stopListenTimeoutRef.current = window.setTimeout(() => {
        setIsListening(false)
        if (recognitionRef.current) {
          recognitionRef.current.stop()
        }
      }, 10000) // 10 secondi di timeout
    } else {
      if (stopListenTimeoutRef.current) {
        clearTimeout(stopListenTimeoutRef.current)
      }
    }

    return () => {
      if (stopListenTimeoutRef.current) {
        clearTimeout(stopListenTimeoutRef.current)
      }
    }
  }, [isListening])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleVoiceInput = () => {
    if (!isSpeechSupported || !recognitionRef.current) return

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      // Chiamata alla funzione Edge per l'assistente AI
      const { data, error } = await supabase.functions.invoke('ai-assistant-groq', {
        body: {
          query: userMessage.content,
          userId: user.id
        }
      })

      if (error) throw error

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.response || 'Mi dispiace, non sono riuscito a processare la tua richiesta.',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
      setRemainingQueries(data.remainingQueries || null)
    } catch (error) {
      console.error('Error calling AI assistant:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Mi dispiace, si è verificato un errore. Riprova più tardi.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <MobileLayout
      header={
        <MobileHeader 
          title="Assistente AI" 
          showBack={true}
          onBack={() => onNavigate('dashboard')}
        />
      }
      currentView="assistant"
      onNavigate={onNavigate}
    >
      <div className="flex flex-col h-[calc(100vh-140px)]">
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] p-3 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <div className="flex items-start gap-2">
                  {message.type === 'assistant' && (
                    <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  )}
                  {message.type === 'user' && (
                    <UserIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString('it-IT', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-800 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Sto pensando...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Container */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 mobile-safe-area z-10">
          {/* Remaining Queries Counter */}
          {remainingQueries !== null && (
            <div className="mb-2 text-center">
              <span className="text-xs text-gray-500">
                <Zap className="inline h-3 w-3 mr-1" />
                Query rimanenti: {remainingQueries}
              </span>
            </div>
          )}
          
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Scrivi la tua domanda..."
                className="pr-12 text-base"
                disabled={isLoading}
              />
              {isSpeechSupported && (
                <button
                  onClick={handleVoiceInput}
                  disabled={isLoading}
                  className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded ${
                    isListening
                      ? 'text-red-600 bg-red-100'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {isListening ? (
                    <MicOff className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </button>
              )}
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="px-4"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </MobileLayout>
  )
}
