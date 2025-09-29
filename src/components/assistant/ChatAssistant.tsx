import React, { useState, useRef, useEffect } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { Input } from '../ui/input'
import { Mic, MicOff, Send, Bot, User, Loader2 } from 'lucide-react'
import { QuestionParser } from '../../lib/assistant/QuestionParser'
import { SupabaseQueryEngine } from '../../lib/assistant/SupabaseQueryEngine'
import { ResponseFormatter } from '../../lib/assistant/ResponseFormatter'

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
}

export function ChatAssistant({ userId, initialQuery, onClose }: ChatAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: '👋 Ciao! Sono il tuo assistente legale. Puoi chiedermi informazioni su pratiche, udienze, clienti e scadenze. Prova a chiedere: "Quando è l\'udienza di Alfa Srl?" o "Quali pratiche scadono questa settimana?"',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeechSupported, setIsSpeechSupported] = useState(false)
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

  // Gestisci query iniziale
  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      setInputValue(initialQuery)
      // Chiama handleSendMessage direttamente senza dipendenze
      const processInitialQuery = async () => {
        const messageContent = initialQuery.trim()
        if (!messageContent || isLoading) return

        const userMessage: Message = {
          id: Date.now().toString(),
          type: 'user',
          content: messageContent,
          timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage])
        setIsLoading(true)

        try {
          // Parse the question
          const parser = new QuestionParser()
          const parsed = parser.parse(messageContent)
          console.log('ChatAssistant: Parsed question:', parsed)

          // Execute query
          const queryEngine = new SupabaseQueryEngine()
          const result = await queryEngine.execute(parsed, userId)
          console.log('ChatAssistant: Query result:', result)

          // Format response
          const formatter = new ResponseFormatter()
          const response = formatter.format(parsed.type, result, parsed.entities)

          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: 'assistant',
            content: response,
            timestamp: new Date()
          }

          setMessages(prev => [...prev, assistantMessage])
        } catch (error) {
          console.error('ChatAssistant: Error processing query:', error)
          const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: 'assistant',
            content: `❌ Errore durante l'esecuzione della query: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`,
            timestamp: new Date()
          }
          setMessages(prev => [...prev, errorMessage])
        } finally {
          setIsLoading(false)
        }
      }
      
      processInitialQuery()
    }
  }, [initialQuery, userId])

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
      // Parse the question
      const parser = new QuestionParser()
      const parsedQuestion = parser.parse(messageContent)
      console.log('ChatAssistant: Parsed question:', parsedQuestion)
      
      // Execute query
      const queryEngine = new SupabaseQueryEngine()
      const queryResult = await queryEngine.execute(parsedQuestion, userId)
      console.log('ChatAssistant: Query result:', queryResult)
      
      // Format response
      const formatter = new ResponseFormatter()
      const response = formatter.format(parsedQuestion.type, queryResult, parsedQuestion.entities)

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('ChatAssistant: Error processing message:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `❌ Errore durante l'esecuzione della query: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`,
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
        
        {/* Quick Actions */}
        <div className="mt-2 flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInputValue('Quando è l\'udienza di Alfa Srl?')}
            className="text-xs bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600"
          >
            📅 Udienze
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInputValue('Quali pratiche scadono questa settimana?')}
            className="text-xs bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600"
          >
            ⏰ Scadenze
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInputValue('Mostrami tutti i clienti')}
            className="text-xs bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600"
          >
            👥 Clienti
          </Button>
        </div>
      </div>
    </Card>
  )
}
