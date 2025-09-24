import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  className?: string;
}

const CATEGORIES = [
  { value: 'all', label: 'Tutte le categorie' },
  { value: 'UDIENZA', label: 'Udienza' },
  { value: 'ATTIVITA\' PROCESSUALE', label: 'Attività Processuale' },
  { value: 'SCADENZA ATTO PROCESSUALE', label: 'Scadenza Atto Processuale' },
  { value: 'APPUNTAMENTO IN STUDIO', label: 'Appuntamento in Studio' }
];

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onCategoryChange,
  className = ''
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <label htmlFor="category-filter" className="text-sm font-medium text-gray-700">
        Filtra per categoria:
      </label>
      <Select value={selectedCategory} onValueChange={onCategoryChange}>
        <SelectTrigger id="category-filter" className="min-w-[140px] max-w-[180px]">
          <SelectValue placeholder="Seleziona categoria" />
        </SelectTrigger>
        <SelectContent>
          {CATEGORIES.map((category) => (
            <SelectItem key={category.value} value={category.value}>
              {category.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
