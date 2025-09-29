import React, { useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'

export function GeoapifyTest() {
  const [testQuery, setTestQuery] = useState('Roma')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testGeoapifyAPI = async () => {
    setLoading(true)
    setError(null)
    setResults([])

    try {
      const apiKey = (import.meta as any).env?.VITE_GEOAPIFY_API_KEY
      console.log('API Key per test:', apiKey)

      if (!apiKey || apiKey === 'your-geoapify-api-key-here') {
        setError('API Key non configurata o è ancora il placeholder')
        setLoading(false)
        return
      }

      const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(testQuery)}&filter=countrycode:it&limit=5&apiKey=${apiKey}`
      console.log('URL di test:', url)

      const response = await fetch(url)
      const data = await response.json()

      console.log('Risposta API:', data)

      if (data.features) {
        setResults(data.features.map((f: any) => ({
          label: `${f.properties.street || ''} ${f.properties.housenumber || ''}, ${f.properties.postcode || ''} ${f.properties.city || f.properties.town || f.properties.village || ''}`.trim(),
          ...f.properties
        })))
      } else {
        setError('Nessun risultato trovato o errore API')
      }
    } catch (err) {
      console.error('Errore nel test API:', err)
      setError(`Errore: ${err instanceof Error ? err.message : 'Sconosciuto'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-sm z-50">
      <h3 className="font-bold mb-2 text-sm">Test Geoapify API</h3>
      
      <div className="space-y-2">
        <Input
          value={testQuery}
          onChange={(e) => setTestQuery(e.target.value)}
          placeholder="Test query (es. Roma)"
          className="text-xs"
        />
        
        <Button
          onClick={testGeoapifyAPI}
          disabled={loading}
          size="sm"
          className="w-full text-xs"
        >
          {loading ? 'Testando...' : 'Test API'}
        </Button>

        {error && (
          <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}

        {results.length > 0 && (
          <div className="text-xs">
            <div className="font-semibold mb-1">Risultati ({results.length}):</div>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {results.map((result, idx) => (
                <div key={idx} className="bg-gray-50 p-1 rounded text-xs">
                  {result.label}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
