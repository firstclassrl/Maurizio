import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog'
import { Button } from './button'
import { AudioNotificationSettings } from '../notifications/AudioNotificationSettings'
import { PushNotificationSettings } from '../notifications/PushNotificationSettings'
import { GoogleCalendarSync } from '../google-calendar/GoogleCalendarSync'
import { Settings, Bell, Volume2, Calendar, Archive } from 'lucide-react'

interface OptionsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User
  onNavigateToStorage?: () => void
  onNavigateToPracticeStorage?: () => void
}

export function OptionsModal({ open, onOpenChange, user, onNavigateToStorage, onNavigateToPracticeStorage }: OptionsModalProps) {
  const [activeTab, setActiveTab] = useState<'audio' | 'push' | 'calendar' | 'storage'>('audio')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Opzioni
          </DialogTitle>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
          <Button
            variant={activeTab === 'audio' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('audio')}
            className="flex-1"
          >
            <Volume2 className="h-4 w-4 mr-2" />
            Audio
          </Button>
          <Button
            variant={activeTab === 'push' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('push')}
            className="flex-1"
          >
            <Bell className="h-4 w-4 mr-2" />
            Push
          </Button>
          <Button
            variant={activeTab === 'calendar' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('calendar')}
            className="flex-1"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Calendar
          </Button>
          <Button
            variant={activeTab === 'storage' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('storage')}
            className="flex-1"
          >
            <Archive className="h-4 w-4 mr-2" />
            Storage
          </Button>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'audio' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Notifiche Audio</h3>
              <AudioNotificationSettings userId={user.id} />
            </div>
          )}

          {activeTab === 'push' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Notifiche Push</h3>
              <PushNotificationSettings />
            </div>
          )}

          {activeTab === 'calendar' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Sincronizzazione Google Calendar</h3>
              <GoogleCalendarSync user={user} />
            </div>
          )}

          {activeTab === 'storage' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Storage</h3>
              <div className="space-y-3">
                <div className="p-3 border rounded-md">
                  <p className="text-gray-700 mb-3">Attività evase</p>
                  {onNavigateToStorage && (
                    <Button
                      onClick={() => {
                        onNavigateToStorage()
                        onOpenChange(false)
                      }}
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      <Archive className="h-4 w-4 mr-2" />
                      Apri Storage Attività
                    </Button>
                  )}
                </div>

                <div className="p-3 border rounded-md">
                  <p className="text-gray-700 mb-3">Pratiche archiviate</p>
                  {onNavigateToPracticeStorage && (
                    <Button
                      onClick={() => {
                        onNavigateToPracticeStorage()
                        onOpenChange(false)
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <Archive className="h-4 w-4 mr-2" />
                      Apri Storage Pratiche
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
