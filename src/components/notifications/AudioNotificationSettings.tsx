import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Switch } from '../ui/switch'
import { Volume2, VolumeX, TestTube } from 'lucide-react'
import { useAudioNotifications } from '../../hooks/useAudioNotifications'

interface AudioNotificationSettingsProps {
  userId: string
}

export function AudioNotificationSettings({ userId }: AudioNotificationSettingsProps) {
  const { 
    isEnabled, 
    audioEnabled,
    toggleAudioEnabled,
    playNotificationSound
  } = useAudioNotifications(userId)

  const handleToggleAudioNotifications = () => {
    toggleAudioEnabled()
    
    // Test sound if enabling
    if (!audioEnabled && isEnabled) {
      playNotificationSound()
    }
  }

  const handleTestSound = () => {
    playNotificationSound()
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Notifiche Audio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Audio Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {audioEnabled ? (
                <Volume2 className="h-5 w-5 text-green-600" />
              ) : (
                <VolumeX className="h-5 w-5 text-gray-400" />
              )}
              <span className="font-medium">
                {audioEnabled ? 'Audio Attivo' : 'Audio Disattivo'}
              </span>
            </div>
            <Switch
              checked={audioEnabled}
              onCheckedChange={handleToggleAudioNotifications}
            />
          </div>

          {/* Test Button */}
          {audioEnabled && (
            <div className="pt-2">
              <Button
                onClick={handleTestSound}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <TestTube className="h-4 w-4 mr-2" />
                Testa Suono
              </Button>
            </div>
          )}

          {/* Status Info */}
          <div className="text-sm text-gray-600">
            {audioEnabled ? (
              <p>Le notifiche audio sono attive. Riceverai suoni per le scadenze e attività urgenti.</p>
            ) : (
              <p>Le notifiche audio sono disattivate. Attiva per ricevere suoni di notifica.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}