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

type Mode = 'generic' | 'city' | 'cap' | 'province'

function normalizeProvinceNameToCode(name: string): string {
  const map: Record<string, string> = {
    'agrigento':'AG','alessandria':'AL','ancona':'AN','aosta':'AO','arezzo':'AR','ascoli piceno':'AP','asti':'AT','avellino':'AV',
    'bari':'BA','barletta-andria-trani':'BT','barletta andria trani':'BT','belluno':'BL','benevento':'BN','bergamo':'BG','biella':'BI','bologna':'BO','bolzano':'BZ','brescia':'BS','brindisi':'BR',
    'cagliari':'CA','caltanissetta':'CL','campobasso':'CB','carbonia-iglesias':'CI','caserta':'CE','catania':'CT','catanzaro':'CZ','chieti':'CH','como':'CO','cosenza':'CS','cremona':'CR','crotone':'KR','cuneo':'CN',
    'enna':'EN','fermo':'FM','ferrara':'FE','firenze':'FI','foggia':'FG','forlì-cesena':'FC','forli-cesena':'FC','forlì cesena':'FC','forli cesena':'FC','frosinone':'FR',
    'genova':'GE','gorizia':'GO','grosseto':'GR','imperia':'IM','isernia':'IS','la spezia':'SP','laquila':'AQ','l aquila':'AQ','l’aquila':'AQ','latina':'LT','lecce':'LE','lecco':'LC','livorno':'LI','lodi':'LO','lucca':'LU',
    'macerata':'MC','mantova':'MN','massa-carrara':'MS','massa carrara':'MS','matera':'MT','messina':'ME','milano':'MI','modena':'MO','monza e della brianza':'MB','monza e brianza':'MB','mb':'MB',
    'napoli':'NA','novara':'NO','nuoro':'NU','ogliastra':'OG','olbia-tempio':'OT','olbia tempio':'OT','oristano':'OR',
    'padova':'PD','palermo':'PA','parma':'PR','pavia':'PV','perugia':'PG','pescara':'PE','piacenza':'PC','pisa':'PI','pistoia':'PT','pordenone':'PN','potenza':'PZ','prato':'PO',
    'ragusa':'RG','ravenna':'RA','ragusa':'RG','reggio calabria':'RC','reggio emilia':'RE','rieti':'RI','rimini':'RN','roma':'RM','rovigo':'RO','salerno':'SA','sassari':'SS','savona':'SV','siena':'SI',
    'siracusa':'SR','sondrio':'SO','sud sardegna':'SU','taranto':'TA','tempio pausania-olbia':'OT','terni':'TR','torino':'TO','trapani':'TP','trento':'TN','treviso':'TV','trieste':'TS','udine':'UD',
    'varese':'VA','venezia':'VE','verbania':'VB','verbano-cusio-ossola':'VB','vercelli':'VC','verona':'VR','vibo valentia':'VV','vicenza':'VI','viterbo':'VT'
  }
  const key = (name || '').toLowerCase().trim()
  return map[key] || name?.toUpperCase() || ''
}

export function useGeoapifyAutocomplete(initialQuery = '', mode: Mode = 'generic') {
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
        let typeParam = ''
        if (mode === 'city') typeParam = '&type=city'
        if (mode === 'cap') typeParam = '&type=postcode'
        if (mode === 'province') typeParam = '&type=county'
        const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(trimmed)}&filter=countrycode:it${typeParam}&limit=8&apiKey=${apiKey}`
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
            provincia: normalizeProvinceNameToCode(p.county || p.state || ''),
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


