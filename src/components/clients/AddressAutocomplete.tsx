import { useGeoapifyAutocomplete, GeoapifySuggestion } from '../../hooks/useGeoapifyAutocomplete'
import { Input } from '../ui/input'
import React from 'react'

interface AddressAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onSelect: (s: GeoapifySuggestion) => void
  placeholder?: string
}

export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({ value, onChange, onSelect, placeholder }) => {
  const { query, setQuery, results, loading, error } = useGeoapifyAutocomplete(value)

  React.useEffect(() => {
    setQuery(value)
  }, [value])

  return (
    <div className="relative">
      <Input value={query} onChange={(e)=>{ setQuery(e.target.value); onChange(e.target.value); }} placeholder={placeholder || 'Via, Strada, Piazza…'} />
      {loading && (
        <div className="absolute right-2 top-2 text-xs text-gray-400">…</div>
      )}
      {error && (
        <div className="absolute z-10 mt-1 w-full bg-red-50 border border-red-200 rounded-md shadow p-2">
          <div className="text-xs text-red-600">{error}</div>
        </div>
      )}
      {results.length > 0 && !error && (
        <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow">
          {results.map((item, idx) => (
            <div key={idx} className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm" onClick={()=> onSelect(item)}>
              {item.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


