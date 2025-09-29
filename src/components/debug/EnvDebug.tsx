import React from 'react'

export function EnvDebug() {
  const envVars = (import.meta as any).env || {}
  const geoapifyKey = envVars.VITE_GEOAPIFY_API_KEY
  
  return (
    <div className="fixed bottom-4 left-4 bg-gray-900 text-white p-3 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">Debug Environment Variables</h3>
      <div className="space-y-1">
        <div>
          <strong>Geoapify API Key:</strong> {geoapifyKey ? '✅ Presente' : '❌ Mancante'}
        </div>
        {geoapifyKey && (
          <div>
            <strong>Valore:</strong> {geoapifyKey === 'your-geoapify-api-key-here' ? '⚠️ Placeholder' : '✅ Configurato'}
          </div>
        )}
        <div>
          <strong>Totale variabili:</strong> {Object.keys(envVars).length}
        </div>
        <div className="text-xs text-gray-300">
          Variabili: {Object.keys(envVars).join(', ')}
        </div>
      </div>
    </div>
  )
}
