import React from 'react'
import { X } from 'lucide-react'

interface SimpleModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function SimpleModal({ open, onClose, title, children }: SimpleModalProps) {
  if (!open) return null

  const handleClose = () => {
    console.log('SimpleModal handleClose called')
    alert('MODAL CHIUSO!')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-lg shadow-lg max-w-6xl max-h-[90vh] overflow-y-auto w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={handleClose}
            className="rounded-sm opacity-70 hover:opacity-100 p-1 text-red-600 hover:bg-red-50"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {children}
        </div>

        {/* Footer */}
        <div className="flex justify-between p-6 border-t bg-gray-50">
          <button
            onClick={handleClose}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            Annulla
          </button>
        </div>
      </div>
    </div>
  )
}
