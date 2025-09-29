import { useEffect, useRef, useState } from 'react'

export interface GeoapifySuggestion {
  label: string
  via: string
  civico: string
  cap: string
  citta: string
  provincia: string
  nazione: string
}

export function useGeoapifyAutocomplete(initialQuery = '') {
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<GeoapifySuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const cacheRef = useRef<Map<string, GeoapifySuggestion[]>>(new Map())
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const trimmed = query.trim()
    if (!trimmed || trimmed.length < 3) {
      setResults([])
      return
    }

    const key = `it:${trimmed.toLowerCase()}`
    if (cacheRef.current.has(key)) {
      setResults(cacheRef.current.get(key)!)
      return
    }

    setLoading(true)
    const t = setTimeout(async () => {
      try {
        if (abortRef.current) abortRef.current.abort()
        abortRef.current = new AbortController()

        const apiKey = (import.meta as any).env?.VITE_GEOAPIFY_API_KEY
        if (!apiKey) {
          setLoading(false)
          return
        }
        const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(trimmed)}&filter=countrycode:it&limit=8&apiKey=${apiKey}`
        const r = await fetch(url, { signal: abortRef.current.signal })
        const data = await r.json()
        const items: GeoapifySuggestion[] = (data?.features || []).map((f: any) => {
          const p = f.properties || {}
          return {
            label: `${p.street || ''} ${p.housenumber || ''}, ${p.postcode || ''} ${p.city || p.town || p.village || ''}`.trim(),
            via: p.street || '',
            civico: p.housenumber || '',
            cap: p.postcode || '',
            citta: p.city || p.town || p.village || '',
            provincia: p.state || '',
            nazione: p.country || 'Italia'
          }
        })
        cacheRef.current.set(key, items)
        setResults(items)
      } catch (_) {
        // ignore aborts
      } finally {
        setLoading(false)
      }
    }, 350)

    return () => clearTimeout(t)
  }, [query])

  return { query, setQuery, results, loading }
}


