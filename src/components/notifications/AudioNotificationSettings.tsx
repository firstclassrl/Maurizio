import { useState } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Volume2, VolumeX, Bell, BellRing, Settings, ToggleLeft, ToggleRight } from 'lucide-react'
import { useAudioNotifications } from '../../hooks/useAudioNotifications'

interface AudioNotificationSettingsProps {
  userId: string
}

export function AudioNotificationSettings({ userId }: AudioNotificationSettingsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { 
    isEnabled, 
    isPlaying, 
    audioEnabled,
    playNotificationSound, 
    playUrgentNotification, 
    requestPermission 
  } = useAudioNotifications(userId)

  // Save audio settings to localStorage
  const toggleAudioNotifications = () => {
    const newValue = !audioEnabled
    localStorage.setItem(`audio-notifications-${userId}`, JSON.stringify(newValue))
    
    // Test sound if enabling
    if (newValue && isEnabled) {
      playNotificationSound()
    }
    
    // Close the settings panel after toggle
    setIsOpen(false)
  }

  const handleEnableNotifications = async () => {
    const granted = await requestPermission()
    if (granted) {
      // Test the notification sound
      playNotificationSound()
    }
  }

  const handleTestSound = () => {
    playNotificationSound()
  }

  const handleTestUrgentSound = () => {
    playUrgentNotification()
  }

  return (
    <div className="relative">
      {/* Settings Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 text-white"
      >
        <Settings className="h-5 w-5" />
        {!isEnabled && (
          <Badge className="absolute -top-1 -right-1 h-3 w-3 p-0 bg-red-500">
            !
          </Badge>
        )}
      </Button>

      {/* Settings Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <Card className="border-0 shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Bell className="h-5 w-5" />
                Impostazioni Notifiche
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                {/* Audio Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {audioEnabled && isEnabled ? (
                      <Volume2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <VolumeX className="h-4 w-4 text-red-600" />
                    )}
                    <span className="text-sm font-medium">
                      Notifiche Audio
                    </span>
                  </div>
                  <Badge className={audioEnabled && isEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {audioEnabled && isEnabled ? 'Attive' : 'Disattive'}
                  </Badge>
                </div>

                {/* Audio Toggle */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Attiva suoni notifiche
                    </span>
                  </div>
                  <button
                    onClick={toggleAudioNotifications}
                    disabled={!isEnabled}
                    className={`flex items-center gap-2 transition-colors ${
                      !isEnabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                  >
                    {audioEnabled ? (
                      <ToggleRight className="h-6 w-6 text-green-600" />
                    ) : (
                      <ToggleLeft className="h-6 w-6 text-gray-400" />
                    )}
                    <span className="text-xs text-gray-500">
                      {audioEnabled ? 'ON' : 'OFF'}
                    </span>
                  </button>
                </div>

                {/* Enable Button */}
                {!isEnabled && (
                  <Button
                    onClick={handleEnableNotifications}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    size="sm"
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    Abilita Notifiche Audio
                  </Button>
                )}

                {/* Test Sounds */}
                {isEnabled && audioEnabled && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-600">Test suoni:</p>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleTestSound}
                        disabled={isPlaying}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Bell className="h-4 w-4 mr-1" />
                        Normale
                      </Button>
                      <Button
                        onClick={handleTestUrgentSound}
                        disabled={isPlaying}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <BellRing className="h-4 w-4 mr-1" />
                        Urgente
                      </Button>
                    </div>
                  </div>
                )}

                {/* Disabled Message */}
                {isEnabled && !audioEnabled && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs text-yellow-800 text-center">
                      🔇 Suoni disattivati - Attiva il toggle per abilitare i test
                    </p>
                  </div>
                )}

                {/* Info */}
                <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium mb-1">Come funziona:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Suono normale: 1 giorno prima della scadenza</li>
                    <li>• Suono urgente: scadenze scadute</li>
                    <li>• Notifiche browser: scadenze imminenti</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
