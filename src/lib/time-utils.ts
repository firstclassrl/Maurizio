/**
 * Formatta un orario rimuovendo i secondi se presenti
 * @param timeString - Stringa dell'orario (es. "10:41:00" o "10:41")
 * @returns Stringa formattata con solo ore:minuti (es. "10:41")
 */
export function formatTimeWithoutSeconds(timeString: string | null | undefined): string {
  if (!timeString) return ''
  
  // Se l'orario contiene i secondi, rimuovili
  if (timeString.includes(':')) {
    const parts = timeString.split(':')
    if (parts.length >= 2) {
      return `${parts[0]}:${parts[1]}`
    }
  }
  
  return timeString
}

/**
 * Formatta un orario per il salvataggio nel database (solo ore:minuti)
 * @param timeString - Stringa dell'orario
 * @returns Stringa formattata per il database
 */
export function formatTimeForDatabase(timeString: string | null | undefined): string | null {
  const formatted = formatTimeWithoutSeconds(timeString)
  return formatted || null
}
