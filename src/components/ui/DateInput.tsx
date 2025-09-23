import React, { useState } from 'react';
import { Input } from './input';
import { Label } from './label';
import { Calendar } from 'lucide-react';

interface DateInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
  placeholder?: string;
  required?: boolean;
}

export function DateInput({ 
  id, 
  value, 
  onChange, 
  label, 
  className = "", 
  placeholder = "gg/mm/aaaa",
  required = false 
}: DateInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  // Converte da formato ISO (YYYY-MM-DD) a formato italiano (DD/MM/YYYY)
  const formatToItalian = (isoDate: string): string => {
    if (!isoDate) return '';
    const [year, month, day] = isoDate.split('-');
    return `${day}/${month}/${year}`;
  };

  // Converte da formato italiano (DD/MM/YYYY) a formato ISO (YYYY-MM-DD)
  const formatToISO = (italianDate: string): string => {
    if (!italianDate) return '';
    
    // Rimuove spazi e caratteri non numerici tranne /
    const cleanDate = italianDate.replace(/[^\d/]/g, '');
    
    // Se ha il formato DD/MM/YYYY
    if (cleanDate.includes('/') && cleanDate.length >= 8) {
      const parts = cleanDate.split('/');
      if (parts.length === 3) {
        const [day, month, year] = parts;
        // Valida che siano numeri
        if (day && month && year && 
            day.length <= 2 && month.length <= 2 && year.length === 4) {
          return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
      }
    }
    
    return '';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const isoValue = formatToISO(inputValue);
    onChange(isoValue);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <div className="space-y-1">
      {label && (
        <Label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <div className="relative">
        <Input
          id={id}
          type="text"
          value={formatToItalian(value)}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`pr-10 ${className} ${isFocused ? 'ring-2 ring-blue-500 border-blue-500' : ''}`}
          required={required}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <Calendar className={`h-4 w-4 ${isFocused ? 'text-blue-500' : 'text-gray-400'}`} />
        </div>
      </div>
    </div>
  );
}
