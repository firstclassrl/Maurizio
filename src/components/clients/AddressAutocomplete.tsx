import { useGeoapifyAutocomplete, GeoapifySuggestion } from '../../hooks/useGeoapifyAutocomplete'
import { Input } from '../ui/input'
import React, { useState, useRef, useEffect } from 'react'

interface AddressAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onSelect: (s: GeoapifySuggestion) => void
  placeholder?: string
  showSuggestions?: boolean
}

export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({ 
  value, 
  onChange, 
  onSelect, 
  placeholder,
  showSuggestions = true 
}) => {
  const { query, setQuery, results, loading, error } = useGeoapifyAutocomplete(value)
  const [isFocused, setIsFocused] = useState(false)
  const [hasTyped, setHasTyped] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    setQuery(value)
  }, [value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setQuery(newValue)
    onChange(newValue)
    setHasTyped(true)
  }

  const handleFocus = () => {
    setIsFocused(true)
  }

  const handleBlur = () => {
    // Ritarda il blur per permettere il click sui suggerimenti
    setTimeout(() => {
      setIsFocused(false)
    }, 200)
  }

  const handleSelect = (item: GeoapifySuggestion) => {
    onSelect(item)
    setIsFocused(false)
    setHasTyped(false)
    if (inputRef.current) {
      inputRef.current.blur()
    }
  }

  // Mostra suggerimenti solo se:
  // 1. Il campo è in focus
  // 2. L'utente ha digitato qualcosa
  // 3. Ci sono risultati
  // 4. Non c'è errore
  // 5. showSuggestions è true
  const shouldShowSuggestions = showSuggestions && 
    isFocused && 
    hasTyped && 
    results.length > 0 && 
    !error && 
    query.length >= 3

  return (
    <div className="relative">
      <Input 
        ref={inputRef}
        value={query} 
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder || 'Via, Strada, Piazza…'} 
      />
      {loading && (
        <div className="absolute right-2 top-2 text-xs text-gray-400">…</div>
      )}
      {error && (
        <div className="absolute z-10 mt-1 w-full bg-red-50 border border-red-200 rounded-md shadow p-2">
          <div className="text-xs text-red-600">{error}</div>
        </div>
      )}
      {shouldShowSuggestions && (
        <div className="absolute z-20 mt-1 w-full bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
          {results.slice(0, 5).map((item, idx) => (
            <div 
              key={idx} 
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm border-b last:border-b-0" 
              onClick={() => handleSelect(item)}
            >
              <div className="font-medium">{item.label}</div>
              <div className="text-xs text-gray-500">
                {item.cap} {item.citta} ({item.provincia})
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


