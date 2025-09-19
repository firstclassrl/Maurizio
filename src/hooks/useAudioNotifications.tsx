import { useState, useEffect, useRef } from 'react'

export function useAudioNotifications() {
  const [isEnabled, setIsEnabled] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Check if audio notifications are supported
  useEffect(() => {
    // Check if user has granted notification permission
    if ('Notification' in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          setIsEnabled(true)
        }
      })
    }
  }, [])

  // Create audio element for notifications
  useEffect(() => {
    // Create a simple beep sound using Web Audio API
    const createBeepSound = () => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime) // 800Hz beep
      oscillator.type = 'sine'
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)
    }

    // Store the function for later use
    audioRef.current = {
      play: createBeepSound
    } as any
  }, [])

  const playNotificationSound = () => {
    if (audioRef.current && isEnabled) {
      try {
        setIsPlaying(true)
        audioRef.current.play()
        
        // Reset playing state after sound completes
        setTimeout(() => {
          setIsPlaying(false)
        }, 500)
      } catch (error) {
        console.error('Error playing notification sound:', error)
        setIsPlaying(false)
      }
    }
  }

  const requestPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      setIsEnabled(permission === 'granted')
      return permission === 'granted'
    }
    return false
  }

  const showBrowserNotification = (title: string, message: string, icon?: string) => {
    if (isEnabled && 'Notification' in window) {
      new Notification(title, {
        body: message,
        icon: icon || '/favicon.png',
        badge: '/favicon.png',
        tag: 'lexagenda-notification'
      })
    }
  }

  const playUrgentNotification = () => {
    if (audioRef.current && isEnabled) {
      try {
        setIsPlaying(true)
        
        // Play urgent sound pattern (3 quick beeps)
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        
        for (let i = 0; i < 3; i++) {
          setTimeout(() => {
            const oscillator = audioContext.createOscillator()
            const gainNode = audioContext.createGain()
            
            oscillator.connect(gainNode)
            gainNode.connect(audioContext.destination)
            
            oscillator.frequency.setValueAtTime(1000, audioContext.currentTime) // Higher frequency for urgency
            oscillator.type = 'sine'
            
            gainNode.gain.setValueAtTime(0.4, audioContext.currentTime)
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)
            
            oscillator.start(audioContext.currentTime)
            oscillator.stop(audioContext.currentTime + 0.2)
          }, i * 250)
        }
        
        // Reset playing state
        setTimeout(() => {
          setIsPlaying(false)
        }, 1000)
      } catch (error) {
        console.error('Error playing urgent notification sound:', error)
        setIsPlaying(false)
      }
    }
  }

  return {
    isEnabled,
    isPlaying,
    playNotificationSound,
    playUrgentNotification,
    showBrowserNotification,
    requestPermission
  }
}
