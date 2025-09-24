import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Plus, ArrowRight, FileText, Calendar, Users } from 'lucide-react'
import { Practice, PracticeFormData, Activity, ActivityFormData, ProcedureType } from '../../types/practice'
import { Client } from '../../types/client'
import { PracticeForm } from './PracticeForm'
import { ActivityForm } from './ActivityForm'
import { useMobile } from '../../hooks/useMobile'

interface NewActivityWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clients: Client[]
  onActivityCreated: (activity: Activity) => void
  isLoading?: boolean
}

export function NewActivityWizard({ open, onOpenChange, clients, onActivityCreated, isLoading = false }: NewActivityWizardProps) {
  const isMobile = useMobile()
  const [step, setStep] = useState<'practice' | 'activity'>('practice')
  const [currentPractice, setCurrentPractice] = useState<Practice | null>(null)
  const [isCreatingPractice, setIsCreatingPractice] = useState(false)
  const [isCreatingActivity, setIsCreatingActivity] = useState(false)

  useEffect(() => {
    if (open) {
      setStep('practice')
      setCurrentPractice(null)
    }
  }, [open])

  const handlePracticeSave = async (practiceData: Practice) => {
    setIsCreatingPractice(true)
    try {
      // Qui dovresti chiamare l'API per salvare la pratica
      // Per ora simuliamo il salvataggio
      const savedPractice = {
        ...practiceData,
        id: `practice_${Date.now()}`,
        user_id: 'current_user_id'
      }
      
      setCurrentPractice(savedPractice)
      setStep('activity')
    } catch (error) {
      console.error('Error saving practice:', error)
    } finally {
      setIsCreatingPractice(false)
    }
  }

  const handleActivitySave = async (activityData: Activity) => {
    setIsCreatingActivity(true)
    try {
      // Qui dovresti chiamare l'API per salvare l'attività
      // Per ora simuliamo il salvataggio
      const savedActivity = {
        ...activityData,
        id: `activity_${Date.now()}`,
        user_id: 'current_user_id'
      }
      
      onActivityCreated(savedActivity)
      onOpenChange(false)
    } catch (error) {
      console.error('Error saving activity:', error)
    } finally {
      setIsCreatingActivity(false)
    }
  }

  const goBackToPractice = () => {
    setStep('practice')
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-6">
      <div className="flex items-center space-x-4">
        <div className={`flex items-center space-x-2 ${step === 'practice' ? 'text-blue-600' : 'text-green-600'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step === 'practice' ? 'bg-blue-100' : 'bg-green-100'
          }`}>
            <FileText className="w-4 h-4" />
          </div>
          <span className="text-sm font-medium">1. Pratica</span>
        </div>
        
        <ArrowRight className="w-4 h-4 text-gray-400" />
        
        <div className={`flex items-center space-x-2 ${step === 'activity' ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step === 'activity' ? 'bg-blue-100' : 'bg-gray-100'
          }`}>
            <Calendar className="w-4 h-4" />
          </div>
          <span className="text-sm font-medium">2. Attività</span>
        </div>
      </div>
    </div>
  )

  const renderPracticeStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Crea Nuova Pratica</h2>
        <p className="text-gray-600">Inizia creando una nuova pratica con cliente e controparti</p>
      </div>
      
      <Card className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Informazioni Pratica</h3>
            <p className="text-sm text-gray-600">Numero pratica, tipo procedura, cliente e controparti</p>
          </div>
        </div>
      </Card>

      <PracticeForm
        open={true}
        onOpenChange={() => {}}
        practice={null}
        onSave={handlePracticeSave}
        clients={clients}
        isLoading={isCreatingPractice}
      />
    </div>
  )

  const renderActivityStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Aggiungi Attività</h2>
        <p className="text-gray-600">Ora aggiungi la prima attività per questa pratica</p>
      </div>
      
      <Card className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <Calendar className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Dettagli Attività</h3>
            <p className="text-sm text-gray-600">
              Categoria, descrizione, data, ora e campi specifici per {currentPractice?.tipo_procedura}
            </p>
          </div>
        </div>
      </Card>

      {currentPractice && (
        <ActivityForm
          open={true}
          onOpenChange={() => {}}
          activity={null}
          practice={currentPractice}
          onSave={handleActivitySave}
          isLoading={isCreatingActivity}
        />
      )}
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-6xl max-h-[90vh] overflow-y-auto ${isMobile ? 'mx-2' : ''}`}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Nuova Attività
          </DialogTitle>
        </DialogHeader>

        {renderStepIndicator()}

        {step === 'practice' ? renderPracticeStep() : renderActivityStep()}

        {/* Pulsanti di navigazione */}
        <div className="flex justify-between pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isCreatingPractice || isCreatingActivity}
          >
            Annulla
          </Button>
          
          {step === 'activity' && (
            <Button
              type="button"
              variant="outline"
              onClick={goBackToPractice}
              disabled={isCreatingPractice || isCreatingActivity}
            >
              Indietro
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
