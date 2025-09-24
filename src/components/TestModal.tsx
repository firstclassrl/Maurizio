
interface TestModalProps {
  open: boolean
  onClose: () => void
}

export function TestModal({ open, onClose }: TestModalProps) {
  if (!open) return null

  const handleClose = () => {
    alert('Test modal closing!')
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
      <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Test Modal</h2>
          <button
            onClick={handleClose}
            className="text-red-600 hover:bg-red-50 p-1 rounded"
          >
            ✕
          </button>
        </div>
        
        <p className="mb-4">Questo è un modal di test per verificare la chiusura.</p>
        
        <div className="flex justify-end">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  )
}
