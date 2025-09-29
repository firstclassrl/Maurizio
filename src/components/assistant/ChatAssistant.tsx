import React, { useState, useRef, useEffect } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { Input } from '../ui/input'
import { Mic, MicOff, Send, Bot, User, Loader2, Zap } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatAssistantProps {
  userId: string
  initialQuery?: string
  onClose?: () => void
  onInitialQueryProcessed?: () => void
}

export function ChatAssistant({ userId, initialQuery, onClose, onInitialQueryProcessed }: ChatAssistantProps) {
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
  const [isSpeechSupported, setIsSpeechSupported] = useState(false)
  const [remainingQueries, setRemainingQueries] = useState<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)
  const hasProcessedInitialQueryRef = useRef(false)

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

  // Gestisci query iniziale con approccio più sicuro
  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      console.log('ChatAssistant: Initial query detected:', initialQuery)
      
      // Usa un timeout per evitare duplicazioni immediate
      const timeoutId = setTimeout(() => {
        if (!hasProcessedInitialQueryRef.current) {
          console.log('ChatAssistant: Processing initial query:', initialQuery)
          hasProcessedInitialQueryRef.current = true
          setInputValue(initialQuery)
          
          // Chiama handleSendMessage direttamente
          handleSendMessage(initialQuery)
          
          // Notifica che la query iniziale è stata processata
          if (onInitialQueryProcessed) {
            onInitialQueryProcessed()
          }
        }
      }, 100)

      return () => clearTimeout(timeoutId)
    }
  }, [initialQuery])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (query?: string) => {
    const messageContent = query || inputValue.trim()
    if (!messageContent || isLoading) return

    console.log('ChatAssistant: handleSendMessage called with:', messageContent)

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: messageContent,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      // Risposte immediate senza API per richieste di ora/data
      const timeNowRegex = /(che ore sono|che\s*ora(?:\s*(?:è|e')?)?)/i
      const dateTodayRegex = /(che\s*giorno\s*è|data\s*(?:di\s*)?oggi)/i
      if (timeNowRegex.test(messageContent)) {
        const now = new Date()
        const response = `⌚ Ora attuale: ${now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: response,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, assistantMessage])
        return
      }
      if (dateTodayRegex.test(messageContent)) {
        const today = new Date()
        const response = `📅 Oggi è ${today.toLocaleDateString('it-IT', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}`
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: response,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, assistantMessage])
        return
      }

      // Chiama la Edge Function Groq
      const { data, error } = await supabase.functions.invoke('ai-assistant-groq', {
        body: {
          question: messageContent,
          userId: userId,
          context: {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
          }
        }
      })

      if (error) {
        throw new Error(`Errore API: ${error.message}`)
      }

      if (data.error) {
        if (data.error === 'Daily limit reached') {
          const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: 'assistant',
            content: `⚠️ Hai raggiunto il limite giornaliero di 100 query. Riprova domani o contatta l'amministratore per aumentare il limite.`,
            timestamp: new Date()
          }
          setMessages(prev => [...prev, errorMessage])
          setRemainingQueries(0)
          return
        }
        throw new Error(data.error)
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.answer || 'Nessuna risposta ricevuta.',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
      setRemainingQueries(data.remaining || null)

    } catch (error) {
      console.error('ChatAssistant: Error processing message:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `❌ Errore durante l'elaborazione: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <Card className="w-full h-full max-w-4xl mx-auto flex flex-col bg-slate-900 border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800">
        <div className="flex items-center gap-2">
          <Bot className="h-6 w-6 text-blue-400" />
          <h2 className="text-lg font-semibold text-white">Assistente Legale AI</h2>
          {remainingQueries !== null && (
            <div className="flex items-center gap-1 ml-2 px-2 py-1 bg-slate-700 rounded-full">
              <Zap className="h-3 w-3 text-yellow-400" />
              <span className="text-xs text-slate-300">{remainingQueries} rimaste</span>
            </div>
          )}
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose} className="text-slate-300 hover:text-white hover:bg-slate-700">
            ✕
          </Button>
        )}
      </div>

      {/* Messages */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-200 border border-slate-600'
              }`}
            >
              <div className="flex items-start gap-2">
                {message.type === 'assistant' && (
                  <Bot className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-400" />
                )}
                {message.type === 'user' && (
                  <User className="h-4 w-4 mt-0.5 flex-shrink-0" />
                )}
                <div className="whitespace-pre-wrap text-sm">
                  {message.content}
                </div>
              </div>
              <div
                className={`text-xs mt-1 ${
                  message.type === 'user' ? 'text-blue-100' : 'text-slate-400'
                }`}
              >
                {message.timestamp.toLocaleTimeString('it-IT', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-700 rounded-lg px-4 py-2 border border-slate-600">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-blue-400" />
                <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                <span className="text-sm text-slate-300">🤖 Sta pensando...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </CardContent>

      {/* Input */}
      <div className="p-4 border-t border-slate-700 bg-slate-800">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Chiedi informazioni su pratiche, udienze, clienti..."
              className="pr-20 bg-slate-700 border-slate-600 text-slate-200 placeholder-slate-400 focus:bg-slate-600 focus:border-blue-500"
              disabled={isLoading}
            />
            {isSpeechSupported && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleVoiceInput}
                disabled={isLoading}
                className={`absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 ${
                  isListening ? 'text-red-400 hover:text-red-300' : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            )}
          </div>
          <Button
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() || isLoading}
            className="px-4 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Quick Actions rimossi */}
      </div>
    </Card>
  )
}
