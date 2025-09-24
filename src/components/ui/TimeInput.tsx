import React, { useState, useRef, useEffect } from 'react';
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
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedHour, setSelectedHour] = useState(9);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const timePickerRef = useRef<HTMLDivElement>(null);

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
    // Per input type="time", il valore è già nel formato HH:MM
    if (inputValue && inputValue.includes(':')) {
      onChange(inputValue);
    } else {
      const formattedTime = formatInputTime(inputValue);
      onChange(formattedTime);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  // Inizializza l'orario selezionato
  useEffect(() => {
    if (value && value.includes(':')) {
      const [hours, minutes] = value.split(':');
      setSelectedHour(parseInt(hours) || 9);
      setSelectedMinute(parseInt(minutes) || 0);
    }
  }, [value]);

  // Chiude il time picker quando si clicca fuori
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (timePickerRef.current && !timePickerRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowTimePicker(false);
      }
    };

    if (showTimePicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showTimePicker]);

  // Gestisce il click sull'icona orologio
  const handleClockClick = () => {
    setShowTimePicker(!showTimePicker);
  };

  // Gestisce la selezione di un orario
  const handleTimeSelect = (hour: number, minute: number) => {
    setSelectedHour(hour);
    setSelectedMinute(minute);
    const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    onChange(timeString);
    setShowTimePicker(false);
  };

  // Genera le ore (0-23) - formato 24h
  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  // Genera i minuti (0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55) per più opzioni
  const minutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  return (
    <div className="space-y-1 relative">
      {label && (
        <Label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <div className="relative">
        <Input
          ref={inputRef}
          id={id}
          type="time"
          step="60"
          data-format="24"
          value={formatTime(value)}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`pr-10 ${className} ${isFocused ? 'ring-2 ring-blue-500 border-blue-500' : ''}`}
          required={required}
        />
        <button
          type="button"
          onClick={handleClockClick}
          className="absolute inset-y-0 right-0 flex items-center pr-3 hover:bg-gray-50 rounded-r-md transition-colors"
        >
          <Clock className={`h-4 w-4 ${isFocused || showTimePicker ? 'text-blue-500' : 'text-gray-400'}`} />
        </button>
      </div>

      {/* Time Picker Popup */}
      {showTimePicker && (
        <div
          ref={timePickerRef}
          className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 p-4 min-w-[200px]"
        >
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Seleziona Orario
          </h3>
          
          <div className="flex gap-4">
            {/* Selezione Ore */}
            <div className="flex-1">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Ore</div>
              <div className="max-h-32 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded">
                {hours.map((hour) => (
                  <button
                    key={hour}
                    type="button"
                    onClick={() => handleTimeSelect(hour, selectedMinute)}
                    className={`
                      w-full px-3 py-1 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
                      ${selectedHour === hour 
                        ? 'bg-blue-500 text-white hover:bg-blue-600' 
                        : 'text-gray-900 dark:text-gray-100'
                      }
                    `}
                  >
                    {hour.toString().padStart(2, '0')}
                  </button>
                ))}
              </div>
            </div>

            {/* Selezione Minuti */}
            <div className="flex-1">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Minuti</div>
              <div className="max-h-32 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded">
                {minutes.map((minute) => (
                  <button
                    key={minute}
                    type="button"
                    onClick={() => handleTimeSelect(selectedHour, minute)}
                    className={`
                      w-full px-3 py-1 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
                      ${selectedMinute === minute 
                        ? 'bg-blue-500 text-white hover:bg-blue-600' 
                        : 'text-gray-900 dark:text-gray-100'
                      }
                    `}
                  >
                    {minute.toString().padStart(2, '0')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Orario Selezionato */}
          <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-700 rounded text-center">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {selectedHour.toString().padStart(2, '0')}:{selectedMinute.toString().padStart(2, '0')}
            </div>
          </div>

          {/* Pulsanti azione */}
          <div className="flex justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                // Arrotonda ai minuti più vicini disponibili
                const availableMinutes = minutes;
                const currentMinute = now.getMinutes();
                const closestMinute = availableMinutes.reduce((prev, curr) => 
                  Math.abs(curr - currentMinute) < Math.abs(prev - currentMinute) ? curr : prev
                );
                handleTimeSelect(now.getHours(), closestMinute);
              }}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              Ora Attuale
            </button>
            <button
              type="button"
              onClick={() => setShowTimePicker(false)}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300"
            >
              Chiudi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
