import { useState } from 'react'

interface Message {
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
}

export function useMessage() {
  const [message, setMessage] = useState<Message | null>(null)

  const showMessage = (type: Message['type'], title: string, message: string) => {
    setMessage({ type, title, message })
  }

  const showSuccess = (title: string, message: string) => {
    showMessage('success', title, message)
  }

  const showError = (title: string, message: string) => {
    showMessage('error', title, message)
  }

  const showWarning = (title: string, message: string) => {
    showMessage('warning', title, message)
  }

  const showInfo = (title: string, message: string) => {
    showMessage('info', title, message)
  }

  const hideMessage = () => {
    setMessage(null)
  }

  return {
    message,
    showMessage,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hideMessage
  }
}
