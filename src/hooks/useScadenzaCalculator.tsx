import { useState, useCallback } from 'react'

export interface ScadenzaData {
  dataInizio: Date
  tipoScadenza: string
  giorniTermine: number
  dataScadenza: Date
  giorniRimanenti: number
  isUrgente: boolean
  categoria: string
}

export const useScadenzaCalculator = () => {
  const [scadenze, setScadenze] = useState<ScadenzaData[]>([])

  // Funzione per calcolare una scadenza
  const calculateScadenza = useCallback((
    dataInizio: Date,
    tipoScadenza: string,
    giorniTermine: number,
    categoria: string = 'Generico'
  ): ScadenzaData => {
    const dataScadenza = new Date(dataInizio)
    dataScadenza.setDate(dataScadenza.getDate() + giorniTermine)
    
    const oggi = new Date()
    const diffTime = dataScadenza.getTime() - oggi.getTime()
    const giorniRimanenti = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    const isUrgente = giorniRimanenti <= 7 && giorniRimanenti >= 0
    
    return {
      dataInizio,
      tipoScadenza,
      giorniTermine,
      dataScadenza,
      giorniRimanenti,
      isUrgente,
      categoria
    }
  }, [])

  // Funzione per aggiungere una scadenza
  const addScadenza = useCallback((scadenzaData: ScadenzaData) => {
    setScadenze(prev => [...prev, scadenzaData])
  }, [])

  // Funzione per rimuovere una scadenza
  const removeScadenza = useCallback((index: number) => {
    setScadenze(prev => prev.filter((_, i) => i !== index))
  }, [])

  // Funzione per ottenere scadenze urgenti
  const getScadenzeUrgenti = useCallback(() => {
    return scadenze.filter(scadenza => scadenza.isUrgente)
  }, [scadenze])

  // Funzione per ottenere scadenze per categoria
  const getScadenzeByCategoria = useCallback((categoria: string) => {
    return scadenze.filter(scadenza => scadenza.categoria === categoria)
  }, [scadenze])

  // Funzione per aggiornare una scadenza
  const updateScadenza = useCallback((index: number, updatedScadenza: Partial<ScadenzaData>) => {
    setScadenze(prev => prev.map((scadenza, i) => 
      i === index ? { ...scadenza, ...updatedScadenza } : scadenza
    ))
  }, [])

  // Funzione per calcolare giorni lavorativi (esclude weekend)
  const addWorkingDays = useCallback((date: Date, days: number): Date => {
    const result = new Date(date)
    let addedDays = 0
    
    while (addedDays < days) {
      result.setDate(result.getDate() + 1)
      // Controlla se è un giorno lavorativo (lunedì-venerdì)
      if (result.getDay() >= 1 && result.getDay() <= 5) {
        addedDays++
      }
    }
    
    return result
  }, [])

  // Funzione per calcolare giorni lavorativi rimanenti
  const calculateWorkingDaysRemaining = useCallback((dataScadenza: Date): number => {
    const oggi = new Date()
    let workingDays = 0
    const current = new Date(oggi)
    
    while (current < dataScadenza) {
      if (current.getDay() >= 1 && current.getDay() <= 5) {
        workingDays++
      }
      current.setDate(current.getDate() + 1)
    }
    
    return workingDays
  }, [])

  // Funzione per ottenere statistiche delle scadenze
  const getScadenzeStats = useCallback(() => {
    const total = scadenze.length
    const urgenti = scadenze.filter(s => s.isUrgente).length
    const scadute = scadenze.filter(s => s.giorniRimanenti < 0).length
    const inScadenza = scadenze.filter(s => s.giorniRimanenti >= 0 && s.giorniRimanenti <= 30).length
    
    return {
      total,
      urgenti,
      scadute,
      inScadenza,
      percentualeUrgenti: total > 0 ? Math.round((urgenti / total) * 100) : 0
    }
  }, [scadenze])

  return {
    scadenze,
    calculateScadenza,
    addScadenza,
    removeScadenza,
    updateScadenza,
    getScadenzeUrgenti,
    getScadenzeByCategoria,
    addWorkingDays,
    calculateWorkingDaysRemaining,
    getScadenzeStats
  }
}

export default useScadenzaCalculator
