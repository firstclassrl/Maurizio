import React, { useState } from 'react';
import { Input } from './input';
import { Label } from './label';
import { Clock } from 'lucide-react';

interface TimeInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
  placeholder?: string;
  required?: boolean;
}

export function TimeInput({ 
  id, 
  value, 
  onChange, 
  label, 
  className = "", 
  placeholder = "hh:mm",
  required = false 
}: TimeInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  // Converte da formato 24h (HH:MM) a formato visualizzato
  const formatTime = (timeValue: string): string => {
    if (!timeValue) return '';
    return timeValue;
  };

  // Valida e formatta l'input dell'utente
  const formatInputTime = (inputValue: string): string => {
    // Rimuove caratteri non numerici tranne :
    const cleanTime = inputValue.replace(/[^\d:]/g, '');
    
    // Se ha il formato HH:MM
    if (cleanTime.includes(':') && cleanTime.length >= 3) {
      const [hours, minutes] = cleanTime.split(':');
      if (hours && minutes) {
        const h = parseInt(hours);
        const m = parseInt(minutes);
        
        // Valida ore (0-23) e minuti (0-59)
        if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
          return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        }
      }
    }
    
    // Se ha solo numeri, prova a formattare
    if (/^\d{1,4}$/.test(cleanTime)) {
      if (cleanTime.length <= 2) {
        // Solo ore
        const h = parseInt(cleanTime);
        if (h >= 0 && h <= 23) {
          return `${h.toString().padStart(2, '0')}:00`;
        }
      } else if (cleanTime.length === 3) {
        // HMM
        const h = parseInt(cleanTime.substring(0, 1));
        const m = parseInt(cleanTime.substring(1, 3));
        if (h >= 0 && h <= 9 && m >= 0 && m <= 59) {
          return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        }
      } else if (cleanTime.length === 4) {
        // HHMM
        const h = parseInt(cleanTime.substring(0, 2));
        const m = parseInt(cleanTime.substring(2, 4));
        if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
          return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        }
      }
    }
    
    return cleanTime;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const formattedTime = formatInputTime(inputValue);
    onChange(formattedTime);
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
          value={formatTime(value)}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`pr-10 ${className} ${isFocused ? 'ring-2 ring-blue-500 border-blue-500' : ''}`}
          required={required}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <Clock className={`h-4 w-4 ${isFocused ? 'text-blue-500' : 'text-gray-400'}`} />
        </div>
      </div>
    </div>
  );
}
