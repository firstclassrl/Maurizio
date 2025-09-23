/**
 * Database dei Termini Processuali Civili Italiani
 * Aggiornato alla riforma Cartabia e successive modifiche
 */

export interface TermineProcessuale {
  id: string;
  nome: string;
  descrizione: string;
  giorni?: number;
  mesi?: number;
  anni?: number;
  tipo: 'giorni' | 'mesi' | 'anni';
  articolo: string;
  categoria: string;
  note?: string;
  urgente?: boolean;
  sospensione?: boolean; // se applica sospensione feriale
  termineLibero?: boolean; // se è termine libero (es. art. 183 c.p.c.)
}

export const TERMINI_PROCESSUALI: TermineProcessuale[] = [
  // TERMINI DI COMPARSA E DIFESA
  {
    id: 'comparsa_conclusionale',
    nome: 'Comparsa conclusionale',
    descrizione: 'Termine per depositare la comparsa conclusionale',
    giorni: 20,
    tipo: 'giorni',
    articolo: '183 c.p.c.',
    categoria: 'Comparsa e Difesa',
    termineLibero: true,
    sospensione: true
  },
  {
    id: 'comparsa_risposta',
    nome: 'Comparsa di risposta',
    descrizione: 'Termine per depositare la comparsa di risposta',
    giorni: 20,
    tipo: 'giorni',
    articolo: '167 c.p.c.',
    categoria: 'Comparsa e Difesa',
    sospensione: true
  },
  {
    id: 'comparsa_costituzione',
    nome: 'Comparsa di costituzione',
    descrizione: 'Termine per costituirsi in giudizio',
    giorni: 20,
    tipo: 'giorni',
    articolo: '166 c.p.c.',
    categoria: 'Comparsa e Difesa',
    sospensione: true
  },

  // TERMINI DI IMPUGNAZIONE
  {
    id: 'appello_civile',
    nome: 'Appello civile',
    descrizione: 'Termine per proporre appello',
    giorni: 30,
    tipo: 'giorni',
    articolo: '325 c.p.c.',
    categoria: 'Impugnazioni',
    sospensione: true,
    urgente: true
  },
  {
    id: 'ricorso_cassazione',
    nome: 'Ricorso per cassazione',
    descrizione: 'Termine per proporre ricorso per cassazione',
    giorni: 60,
    tipo: 'giorni',
    articolo: '366 c.p.c.',
    categoria: 'Impugnazioni',
    sospensione: true,
    urgente: true
  },
  {
    id: 'opposizione_decreto',
    nome: 'Opposizione a decreto ingiuntivo',
    descrizione: 'Termine per opporsi al decreto ingiuntivo',
    giorni: 40,
    tipo: 'giorni',
    articolo: '633 c.p.c.',
    categoria: 'Impugnazioni',
    sospensione: true,
    urgente: true
  },
  {
    id: 'opposizione_esecuzione',
    nome: 'Opposizione a precetto',
    descrizione: 'Termine per opporsi al precetto esecutivo',
    giorni: 10,
    tipo: 'giorni',
    articolo: '615 c.p.c.',
    categoria: 'Impugnazioni',
    sospensione: false,
    urgente: true
  },
  {
    id: 'opposizione_espropriazione',
    nome: 'Opposizione a pignoramento',
    descrizione: 'Termine per opporsi al pignoramento',
    giorni: 10,
    tipo: 'giorni',
    articolo: '615 c.p.c.',
    categoria: 'Impugnazioni',
    sospensione: false,
    urgente: true
  },

  // TERMINI DI ESECUZIONE
  {
    id: 'opposizione_terzi',
    nome: 'Opposizione di terzo',
    descrizione: 'Termine per proporre opposizione di terzo',
    giorni: 30,
    tipo: 'giorni',
    articolo: '615 c.p.c.',
    categoria: 'Esecuzione',
    sospensione: true
  },
  {
    id: 'opposizione_crediti',
    nome: 'Opposizione a distribuzione',
    descrizione: 'Termine per opporsi alla distribuzione del ricavato',
    giorni: 10,
    tipo: 'giorni',
    articolo: '615 c.p.c.',
    categoria: 'Esecuzione',
    sospensione: false,
    urgente: true
  },

  // TERMINI DI PROCEDIMENTO
  {
    id: 'ricorso_tribunale',
    nome: 'Ricorso al tribunale',
    descrizione: 'Termine per proporre ricorso al tribunale',
    giorni: 30,
    tipo: 'giorni',
    articolo: '702 c.p.c.',
    categoria: 'Procedimento',
    sospensione: true
  },
  {
    id: 'ricorso_giudice_pace',
    nome: 'Ricorso al giudice di pace',
    descrizione: 'Termine per proporre ricorso al giudice di pace',
    giorni: 30,
    tipo: 'giorni',
    articolo: '316 c.p.c.',
    categoria: 'Procedimento',
    sospensione: true
  },
  {
    id: 'ricorso_arbitrato',
    nome: 'Ricorso per arbitrato',
    descrizione: 'Termine per proporre ricorso per arbitrato',
    giorni: 30,
    tipo: 'giorni',
    articolo: '809 c.p.c.',
    categoria: 'Procedimento',
    sospensione: true
  },

  // TERMINI DI NOTIFICA
  {
    id: 'notifica_atti',
    nome: 'Notifica di atti',
    descrizione: 'Termine per notificare atti processuali',
    giorni: 5,
    tipo: 'giorni',
    articolo: '137 c.p.c.',
    categoria: 'Notifiche',
    sospensione: false
  },
  {
    id: 'notifica_sentenza',
    nome: 'Notifica di sentenza',
    descrizione: 'Termine per notificare sentenza',
    giorni: 5,
    tipo: 'giorni',
    articolo: '137 c.p.c.',
    categoria: 'Notifiche',
    sospensione: false
  },

  // TERMINI DI PROVA
  {
    id: 'prova_testimoniale',
    nome: 'Prova testimoniale',
    descrizione: 'Termine per proporre prova testimoniale',
    giorni: 10,
    tipo: 'giorni',
    articolo: '244 c.p.c.',
    categoria: 'Prova',
    sospensione: false
  },
  {
    id: 'prova_perizia',
    nome: 'Prova peritale',
    descrizione: 'Termine per proporre prova peritale',
    giorni: 10,
    tipo: 'giorni',
    articolo: '244 c.p.c.',
    categoria: 'Prova',
    sospensione: false
  },
  {
    id: 'prova_documentale',
    nome: 'Prova documentale',
    descrizione: 'Termine per produrre documenti',
    giorni: 10,
    tipo: 'giorni',
    articolo: '244 c.p.c.',
    categoria: 'Prova',
    sospensione: false
  },

  // TERMINI DI RECLAMO
  {
    id: 'reclamo_tribunale',
    nome: 'Reclamo al tribunale',
    descrizione: 'Termine per proporre reclamo al tribunale',
    giorni: 10,
    tipo: 'giorni',
    articolo: '702 c.p.c.',
    categoria: 'Reclami',
    sospensione: false,
    urgente: true
  },
  {
    id: 'reclamo_cassazione',
    nome: 'Reclamo per cassazione',
    descrizione: 'Termine per proporre reclamo per cassazione',
    giorni: 10,
    tipo: 'giorni',
    articolo: '366 c.p.c.',
    categoria: 'Reclami',
    sospensione: false,
    urgente: true
  },

  // TERMINI DI PRESCRIZIONE
  {
    id: 'prescrizione_breve',
    nome: 'Prescrizione breve',
    descrizione: 'Termine di prescrizione breve (5 anni)',
    anni: 5,
    tipo: 'anni',
    articolo: '2946 c.c.',
    categoria: 'Prescrizione',
    sospensione: false
  },
  {
    id: 'prescrizione_decennale',
    nome: 'Prescrizione decennale',
    descrizione: 'Termine di prescrizione decennale',
    anni: 10,
    tipo: 'anni',
    articolo: '2946 c.c.',
    categoria: 'Prescrizione',
    sospensione: false
  },

  // TERMINI DI DECADENZA
  {
    id: 'decadenza_contratto',
    nome: 'Decadenza da contratto',
    descrizione: 'Termine di decadenza da contratto',
    giorni: 30,
    tipo: 'giorni',
    articolo: '2964 c.c.',
    categoria: 'Decadenza',
    sospensione: true
  },
  {
    id: 'decadenza_garanzia',
    nome: 'Decadenza da garanzia',
    descrizione: 'Termine di decadenza da garanzia',
    giorni: 30,
    tipo: 'giorni',
    articolo: '2964 c.c.',
    categoria: 'Decadenza',
    sospensione: true
  },

  // TERMINI SPECIALI
  {
    id: 'ricorso_tar',
    nome: 'Ricorso al TAR',
    descrizione: 'Termine per proporre ricorso al TAR',
    giorni: 60,
    tipo: 'giorni',
    articolo: '21 L. 1034/1971',
    categoria: 'Giustizia Amministrativa',
    sospensione: true,
    urgente: true
  },
  {
    id: 'ricorso_consiglio_stato',
    nome: 'Ricorso al Consiglio di Stato',
    descrizione: 'Termine per proporre ricorso al Consiglio di Stato',
    giorni: 60,
    tipo: 'giorni',
    articolo: '21 L. 1034/1971',
    categoria: 'Giustizia Amministrativa',
    sospensione: true,
    urgente: true
  },
  {
    id: 'ricorso_corte_appello',
    nome: 'Ricorso alla Corte di Appello',
    descrizione: 'Termine per proporre ricorso alla Corte di Appello',
    giorni: 30,
    tipo: 'giorni',
    articolo: '325 c.p.c.',
    categoria: 'Giustizia Amministrativa',
    sospensione: true,
    urgente: true
  }
];

/**
 * Ottiene tutti i termini per categoria
 */
export function getTerminiPerCategoria(): Record<string, TermineProcessuale[]> {
  return TERMINI_PROCESSUALI.reduce((acc, termine) => {
    if (!acc[termine.categoria]) {
      acc[termine.categoria] = [];
    }
    acc[termine.categoria].push(termine);
    return acc;
  }, {} as Record<string, TermineProcessuale[]>);
}

/**
 * Cerca termini per nome o descrizione
 */
export function cercaTermini(query: string): TermineProcessuale[] {
  const queryLower = query.toLowerCase();
  return TERMINI_PROCESSUALI.filter(termine =>
    termine.nome.toLowerCase().includes(queryLower) ||
    termine.descrizione.toLowerCase().includes(queryLower) ||
    termine.articolo.toLowerCase().includes(queryLower)
  );
}

/**
 * Ottiene termini urgenti
 */
export function getTerminiUrgenti(): TermineProcessuale[] {
  return TERMINI_PROCESSUALI.filter(termine => termine.urgente);
}

/**
 * Ottiene un termine per ID
 */
export function getTermineById(id: string): TermineProcessuale | undefined {
  return TERMINI_PROCESSUALI.find(termine => termine.id === id);
}

/**
 * Ottiene le categorie disponibili
 */
export function getCategorie(): string[] {
  const categorie = new Set(TERMINI_PROCESSUALI.map(termine => termine.categoria));
  return Array.from(categorie).sort();
}
