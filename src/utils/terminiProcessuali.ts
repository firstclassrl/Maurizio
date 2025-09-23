/**
 * Calcolatore Termini Processuali Civili Italiani
 * Implementa le regole del Codice di Procedura Civile italiano
 * per il calcolo di termini ex numeratio dierum e ex nominatione dierum
 */

export interface RisultatoCalcolo {
  dataCalcolata: Date;
  dataFinale: Date;
  giorniSospensione: number;
  note: string[];
  tipoCalcolo: 'giorni' | 'mesi' | 'anni';
  valoreOriginale: number;
  dataInizio: Date;
}

export interface Festivita {
  nome: string;
  data: Date;
  fisso: boolean; // true se la data è fissa ogni anno
}

// Festività nazionali italiane (fisse e mobili)
const FESTIVITA_NAZIONALI: Festivita[] = [
  { nome: 'Capodanno', data: new Date(2024, 0, 1), fisso: true },
  { nome: 'Epifania', data: new Date(2024, 0, 6), fisso: true },
  { nome: 'Liberazione', data: new Date(2024, 3, 25), fisso: true },
  { nome: 'Festa del Lavoro', data: new Date(2024, 4, 1), fisso: true },
  { nome: 'Festa della Repubblica', data: new Date(2024, 5, 2), fisso: true },
  { nome: 'Ferragosto', data: new Date(2024, 7, 15), fisso: true },
  { nome: 'Ognissanti', data: new Date(2024, 10, 1), fisso: true },
  { nome: 'Immacolata', data: new Date(2024, 11, 8), fisso: true },
  { nome: 'Natale', data: new Date(2024, 11, 25), fisso: true },
  { nome: 'Santo Stefano', data: new Date(2024, 11, 26), fisso: true }
];

/**
 * Calcola le festività per un anno specifico
 */
function getFestivitaAnno(anno: number): Date[] {
  const festivita: Date[] = [];
  
  // Festività fisse
  FESTIVITA_NAZIONALI.forEach(fest => {
    if (fest.fisso) {
      festivita.push(new Date(anno, fest.data.getMonth(), fest.data.getDate()));
    }
  });
  
  // Calcolo Pasqua (algoritmo di Gauss)
  const pasqua = calcolaPasqua(anno);
  festivita.push(pasqua);
  
  // Lunedì dell'Angelo (Pasquetta)
  const pasquetta = new Date(pasqua);
  pasquetta.setDate(pasqua.getDate() + 1);
  festivita.push(pasquetta);
  
  return festivita;
}

/**
 * Algoritmo di Gauss per calcolare la data di Pasqua
 */
function calcolaPasqua(anno: number): Date {
  const a = anno % 19;
  const b = Math.floor(anno / 100);
  const c = anno % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const n = Math.floor((h + l - 7 * m + 114) / 31);
  const p = (h + l - 7 * m + 114) % 31;
  
  return new Date(anno, n - 1, p + 1);
}

/**
 * Verifica se una data è festiva
 */
function isFestivo(data: Date): boolean {
  const anno = data.getFullYear();
  const festivita = getFestivitaAnno(anno);
  
  return festivita.some(fest => 
    fest.getDate() === data.getDate() && 
    fest.getMonth() === data.getMonth()
  ) || data.getDay() === 0; // Domenica
}

/**
 * Verifica se una data è sabato
 */
function isSabato(data: Date): boolean {
  return data.getDay() === 6;
}


/**
 * Calcola i giorni di sospensione per agosto
 */
function calcolaGiorniSospensioneAgosto(dataInizio: Date, dataFine: Date): number {
  const annoInizio = dataInizio.getFullYear();
  const annoFine = dataFine.getFullYear();
  
  let giorniSospensione = 0;
  
  // Controlla tutti gli anni nel range
  for (let anno = annoInizio; anno <= annoFine; anno++) {
    const inizioAgosto = new Date(anno, 7, 1); // 1 agosto
    const fineAgosto = new Date(anno, 7, 31); // 31 agosto
    
    // Se il periodo attraversa agosto
    if (dataInizio <= fineAgosto && dataFine >= inizioAgosto) {
      const inizioSospensione = new Date(Math.max(dataInizio.getTime(), inizioAgosto.getTime()));
      const fineSospensione = new Date(Math.min(dataFine.getTime(), fineAgosto.getTime()));
      
      // Conta i giorni di agosto nel periodo
      let dataCorrente = new Date(inizioSospensione);
      while (dataCorrente <= fineSospensione) {
        if (!isFestivo(dataCorrente)) {
          giorniSospensione++;
        }
        dataCorrente.setDate(dataCorrente.getDate() + 1);
      }
    }
  }
  
  return giorniSospensione;
}

/**
 * Trova il primo giorno lavorativo successivo a una data
 */
function getProssimoGiornoLavorativo(data: Date): Date {
  let dataCorrente = new Date(data);
  dataCorrente.setDate(dataCorrente.getDate() + 1);
  
  while (isFestivo(dataCorrente)) {
    dataCorrente.setDate(dataCorrente.getDate() + 1);
  }
  
  return dataCorrente;
}

/**
 * Applica la regola del comma 5 art. 155 c.p.c. per i sabati
 */
function applicaRegolaSabato(data: Date, aRitroso: boolean = false): Date {
  if (!isSabato(data)) {
    return data;
  }
  
  if (aRitroso) {
    // Calcolo prudenziale: anticipa al venerdì precedente
    const venerdi = new Date(data);
    venerdi.setDate(data.getDate() - 1);
    return venerdi;
  } else {
    // Posticipa al lunedì successivo
    return getProssimoGiornoLavorativo(data);
  }
}

/**
 * Calcola termine ex numeratio dierum (art. 155 c.p.c.)
 */
export function calcolaTermineGiorni(
  dataInizio: Date,
  giorni: number,
  conSospensione: boolean = true,
  termineLibero: boolean = false,
  aRitroso: boolean = false
): RisultatoCalcolo {
  const note: string[] = [];
  let dataCalcolata: Date;
  
  if (aRitroso) {
    // Calcolo a ritroso
    dataCalcolata = new Date(dataInizio);
    dataCalcolata.setDate(dataInizio.getDate() - giorni);
  } else {
    // Calcolo normale
    dataCalcolata = new Date(dataInizio);
    dataCalcolata.setDate(dataInizio.getDate() + giorni);
  }
  
  let giorniSospensione = 0;
  
  // Applica sospensione feriale se richiesta
  if (conSospensione && !termineLibero) {
    giorniSospensione = calcolaGiorniSospensioneAgosto(dataInizio, dataCalcolata);
    
    if (giorniSospensione > 0) {
      if (aRitroso) {
        dataCalcolata.setDate(dataCalcolata.getDate() - giorniSospensione);
      } else {
        dataCalcolata.setDate(dataCalcolata.getDate() + giorniSospensione);
      }
      note.push(`Applicata sospensione feriale: ${giorniSospensione} giorni`);
    }
  }
  
  // Applica regola sabato se necessario
  const dataConSabato = applicaRegolaSabato(dataCalcolata, aRitroso);
  if (dataConSabato.getTime() !== dataCalcolata.getTime()) {
    dataCalcolata = dataConSabato;
    note.push('Applicata regola comma 5 art. 155 c.p.c. per sabato');
  }
  
  // Verifica se la data finale è festiva
  let dataFinale = new Date(dataCalcolata);
  if (isFestivo(dataFinale) && !termineLibero) {
    dataFinale = getProssimoGiornoLavorativo(dataFinale);
    note.push('Data finale posticipata per festività');
  }
  
  // Aggiungi note informative
  if (isFestivo(dataFinale)) {
    note.push('⚠️ ATTENZIONE: La scadenza cade in un giorno festivo');
  }
  
  if (isSabato(dataFinale)) {
    note.push('⚠️ ATTENZIONE: La scadenza cade di sabato');
  }
  
  return {
    dataCalcolata,
    dataFinale,
    giorniSospensione,
    note,
    tipoCalcolo: 'giorni',
    valoreOriginale: giorni,
    dataInizio
  };
}

/**
 * Calcola termine ex nominatione dierum (art. 155 c.p.c.)
 */
export function calcolaTermineMesi(
  dataInizio: Date,
  mesi: number,
  conSospensione: boolean = true,
  aRitroso: boolean = false
): RisultatoCalcolo {
  const note: string[] = [];
  let dataCalcolata: Date;
  
  if (aRitroso) {
    // Calcolo a ritroso
    dataCalcolata = new Date(dataInizio);
    dataCalcolata.setMonth(dataInizio.getMonth() - mesi);
  } else {
    // Calcolo normale
    dataCalcolata = new Date(dataInizio);
    dataCalcolata.setMonth(dataInizio.getMonth() + mesi);
  }
  
  // Gestione del caso "31 gennaio + 1 mese = 28/29 febbraio"
  if (dataInizio.getDate() > dataCalcolata.getDate()) {
    dataCalcolata.setDate(0); // Ultimo giorno del mese precedente
    note.push('Data aggiustata per mese con meno giorni');
  }
  
  let giorniSospensione = 0;
  
  // Applica sospensione feriale se richiesta
  if (conSospensione) {
    giorniSospensione = calcolaGiorniSospensioneAgosto(dataInizio, dataCalcolata);
    
    if (giorniSospensione > 0) {
      if (aRitroso) {
        dataCalcolata.setDate(dataCalcolata.getDate() - giorniSospensione);
      } else {
        dataCalcolata.setDate(dataCalcolata.getDate() + giorniSospensione);
      }
      note.push(`Applicata sospensione feriale: ${giorniSospensione} giorni`);
    }
  }
  
  // Verifica se la data finale è festiva
  let dataFinale = new Date(dataCalcolata);
  if (isFestivo(dataFinale)) {
    dataFinale = getProssimoGiornoLavorativo(dataFinale);
    note.push('Data finale posticipata per festività');
  }
  
  // Aggiungi note informative
  if (isFestivo(dataFinale)) {
    note.push('⚠️ ATTENZIONE: La scadenza cade in un giorno festivo');
  }
  
  if (isSabato(dataFinale)) {
    note.push('⚠️ ATTENZIONE: La scadenza cade di sabato');
  }
  
  return {
    dataCalcolata,
    dataFinale,
    giorniSospensione,
    note,
    tipoCalcolo: 'mesi',
    valoreOriginale: mesi,
    dataInizio
  };
}

/**
 * Calcola termine in anni (estensione del calcolo mesi)
 */
export function calcolaTermineAnni(
  dataInizio: Date,
  anni: number,
  conSospensione: boolean = true,
  aRitroso: boolean = false
): RisultatoCalcolo {
  return calcolaTermineMesi(dataInizio, anni * 12, conSospensione, aRitroso);
}

/**
 * Formatta una data in formato italiano
 */
export function formattaData(data: Date): string {
  return data.toLocaleDateString('it-IT', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Formatta una data in formato breve
 */
export function formattaDataBreve(data: Date): string {
  return data.toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

/**
 * Valida gli input del calcolatore
 */
export function validaInput(
  dataInizio: string,
  valore: string,
  tipo: 'giorni' | 'mesi' | 'anni'
): string | null {
  if (!dataInizio) {
    return 'Data di inizio obbligatoria';
  }
  
  const data = new Date(dataInizio);
  if (isNaN(data.getTime())) {
    return 'Data di inizio non valida';
  }
  
  if (!valore || isNaN(Number(valore))) {
    return 'Valore termine deve essere un numero';
  }
  
  const numValore = Number(valore);
  if (numValore <= 0) {
    return 'Valore termine deve essere positivo';
  }
  
  if (tipo === 'mesi' && numValore > 120) {
    return 'Termine troppo lungo (massimo 120 mesi)';
  }
  
  if (tipo === 'anni' && numValore > 10) {
    return 'Termine troppo lungo (massimo 10 anni)';
  }
  
  if (tipo === 'giorni' && numValore > 3650) {
    return 'Termine troppo lungo (massimo 3650 giorni)';
  }
  
  return null;
}

/**
 * Calcola la differenza in giorni tra due date
 */
export function differenzaGiorni(data1: Date, data2: Date): number {
  const diffTime = Math.abs(data2.getTime() - data1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
