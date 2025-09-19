import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog'
import { Button } from './button'
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react'

interface MessageModalProps {
  open: boolean
  onClose: () => void
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
}

export function MessageModal({ open, onClose, type, title, message }: MessageModalProps) {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-600" />
      case 'error':
        return <XCircle className="h-6 w-6 text-red-600" />
      case 'warning':
        return <AlertCircle className="h-6 w-6 text-amber-600" />
      case 'info':
        return <Info className="h-6 w-6 text-blue-600" />
    }
  }

  const getColorClasses = () => {
    switch (type) {
      case 'success':
        return 'border-green-200 bg-green-50'
      case 'error':
        return 'border-red-200 bg-red-50'
      case 'warning':
        return 'border-amber-200 bg-amber-50'
      case 'info':
        return 'border-blue-200 bg-blue-50'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="sr-only">{title}</DialogTitle>
        </DialogHeader>
        <div className={`p-6 rounded-lg border ${getColorClasses()}`}>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              {getIcon()}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {title}
              </h3>
              <p className="text-gray-700 mb-4">
                {message}
              </p>
              <div className="flex justify-end">
                <Button onClick={onClose} variant="outline" size="sm">
                  Chiudi
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
