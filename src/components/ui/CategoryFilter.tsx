import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { STRAGIUDIZIALE_CATEGORIES, GIUDIZIALE_CATEGORIES } from '../../types/practice';

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  className?: string;
}

// Combina tutte le categorie disponibili
const ALL_CATEGORIES = [
  { value: 'all', label: 'Tutte le categorie' },
  ...STRAGIUDIZIALE_CATEGORIES,
  ...GIUDIZIALE_CATEGORIES
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
        <SelectTrigger id="category-filter" className="min-w-[140px] max-w-[160px]">
          <SelectValue placeholder="Seleziona categoria" />
        </SelectTrigger>
        <SelectContent>
          {ALL_CATEGORIES.map((category) => (
            <SelectItem key={category.value} value={category.value}>
              {category.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
