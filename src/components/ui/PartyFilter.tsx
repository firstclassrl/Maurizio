import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

interface PartyFilterProps {
  selectedParty: string;
  onPartyChange: (party: string) => void;
  className?: string;
  tasks: Array<{ parte?: string | null; controparte?: string | null }>;
}

export const PartyFilter: React.FC<PartyFilterProps> = ({
  selectedParty,
  onPartyChange,
  className = '',
  tasks
}) => {
  // Estrai tutte le parti e controparti uniche dai task
  const allParties = new Set<string>();
  const allControparties = new Set<string>();
  
  tasks.forEach(task => {
    if (task.parte) allParties.add(task.parte);
    if (task.controparte) allControparties.add(task.controparte);
  });

  const sortedParties = Array.from(allParties).sort();
  const sortedControparties = Array.from(allControparties).sort();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <label htmlFor="party-filter" className="text-sm font-medium text-gray-700">
        Filtra per parte/controparte:
      </label>
      <Select value={selectedParty} onValueChange={onPartyChange}>
        <SelectTrigger id="party-filter" className="w-64">
          <SelectValue placeholder="Seleziona parte/controparte" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tutte le parti/controparti</SelectItem>
          {sortedParties.length > 0 && (
            <>
              <div className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100">
                PARTI
              </div>
              {sortedParties.map((party) => (
                <SelectItem key={`parte-${party}`} value={`parte-${party}`}>
                  Parte: {party}
                </SelectItem>
              ))}
            </>
          )}
          {sortedControparties.length > 0 && (
            <>
              <div className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100">
                CONTRAPARTI
              </div>
              {sortedControparties.map((controparte) => (
                <SelectItem key={`controparte-${controparte}`} value={`controparte-${controparte}`}>
                  Controparte: {controparte}
                </SelectItem>
              ))}
            </>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};
