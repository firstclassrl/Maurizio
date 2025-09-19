import { useState } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Volume2, VolumeX, Bell, BellRing, Settings } from 'lucide-react'
import { useAudioNotifications } from '../../hooks/useAudioNotifications'

interface AudioNotificationSettingsProps {
  userId: string
}

export function AudioNotificationSettings({ userId: _userId }: AudioNotificationSettingsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { 
    isEnabled, 
    isPlaying, 
    playNotificationSound, 
    playUrgentNotification, 
    requestPermission 
  } = useAudioNotifications()

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
                    {isEnabled ? (
                      <Volume2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <VolumeX className="h-4 w-4 text-red-600" />
                    )}
                    <span className="text-sm font-medium">
                      Notifiche Audio
                    </span>
                  </div>
                  <Badge className={isEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {isEnabled ? 'Attive' : 'Disattive'}
                  </Badge>
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
                {isEnabled && (
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
