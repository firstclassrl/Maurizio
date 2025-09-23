import React, { useState, useRef, useEffect } from 'react';
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
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

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

  // Inizializza la data selezionata
  useEffect(() => {
    if (value) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        setSelectedDate(date);
      }
    }
  }, [value]);

  // Chiude il calendario quando si clicca fuori
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    };

    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showCalendar]);

  // Gestisce il click sull'icona calendario
  const handleCalendarClick = () => {
    setShowCalendar(!showCalendar);
  };

  // Gestisce la selezione di una data dal calendario
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    const isoDate = date.toISOString().split('T')[0];
    onChange(isoDate);
    setShowCalendar(false);
  };

  // Genera i giorni del mese
  const generateCalendarDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Aggiungi giorni vuoti per allineare il primo giorno
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Aggiungi i giorni del mese
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  // Nomi dei mesi in italiano
  const monthNames = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
  ];

  // Nomi dei giorni in italiano
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];

  const currentDate = selectedDate || new Date();
  const calendarDays = generateCalendarDays(currentDate);

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
          type="text"
          value={formatToItalian(value)}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`pr-10 ${className} ${isFocused ? 'ring-2 ring-blue-500 border-blue-500' : ''}`}
          required={required}
        />
        <button
          type="button"
          onClick={handleCalendarClick}
          className="absolute inset-y-0 right-0 flex items-center pr-3 hover:bg-gray-50 rounded-r-md transition-colors"
        >
          <Calendar className={`h-4 w-4 ${isFocused || showCalendar ? 'text-blue-500' : 'text-gray-400'}`} />
        </button>
      </div>

      {/* Calendario Popup */}
      {showCalendar && (
        <div
          ref={calendarRef}
          className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 p-4 min-w-[280px]"
        >
          {/* Header del calendario */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  const newDate = new Date(currentDate);
                  newDate.setMonth(newDate.getMonth() - 1);
                  setSelectedDate(newDate);
                }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => {
                  const newDate = new Date(currentDate);
                  newDate.setMonth(newDate.getMonth() + 1);
                  setSelectedDate(newDate);
                }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                →
              </button>
            </div>
          </div>

          {/* Giorni della settimana */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map((day) => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Giorni del mese */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => (
              <button
                key={index}
                type="button"
                onClick={() => day && handleDateSelect(day)}
                disabled={!day}
                className={`
                  p-2 text-sm rounded-md transition-colors
                  ${!day ? 'invisible' : ''}
                  ${day && day.toDateString() === new Date().toDateString() 
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 font-semibold' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100'
                  }
                  ${day && selectedDate && day.toDateString() === selectedDate.toDateString()
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : ''
                  }
                `}
              >
                {day?.getDate()}
              </button>
            ))}
          </div>

          {/* Pulsanti azione */}
          <div className="flex justify-between mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => handleDateSelect(new Date())}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              Oggi
            </button>
            <button
              type="button"
              onClick={() => setShowCalendar(false)}
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
