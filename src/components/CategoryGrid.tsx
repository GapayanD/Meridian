import React from 'react';
import * as Icons from 'lucide-react';
import { categories } from '../data/mock';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

// Map of color strings to Tailwind classes for icon containers
const colorMap: Record<string, { bg: string; text: string; hover: string }> = {
  'bg-blue-50 text-blue-600':   { bg: 'bg-blue-50',   text: 'text-blue-600',   hover: 'group-hover:bg-blue-100 group-hover:shadow-blue-100' },
  'bg-pink-50 text-pink-600':   { bg: 'bg-pink-50',   text: 'text-pink-600',   hover: 'group-hover:bg-pink-100 group-hover:shadow-pink-100' },
  'bg-green-50 text-green-600': { bg: 'bg-green-50',  text: 'text-green-600',  hover: 'group-hover:bg-green-100 group-hover:shadow-green-100' },
  'bg-purple-50 text-purple-600': { bg: 'bg-purple-50', text: 'text-purple-600', hover: 'group-hover:bg-purple-100 group-hover:shadow-purple-100' },
  'bg-orange-50 text-orange-600': { bg: 'bg-orange-50', text: 'text-orange-600', hover: 'group-hover:bg-orange-100 group-hover:shadow-orange-100' },
  'bg-amber-50 text-amber-600': { bg: 'bg-amber-50',  text: 'text-amber-600',  hover: 'group-hover:bg-amber-100 group-hover:shadow-amber-100' },
  'bg-red-50 text-red-600':     { bg: 'bg-red-50',    text: 'text-red-600',    hover: 'group-hover:bg-red-100 group-hover:shadow-red-100' },
  'bg-indigo-50 text-indigo-600': { bg: 'bg-indigo-50', text: 'text-indigo-600', hover: 'group-hover:bg-indigo-100 group-hover:shadow-indigo-100' },
};

const defaultColors = { bg: 'bg-blue-50', text: 'text-blue-600', hover: 'group-hover:bg-blue-100 group-hover:shadow-blue-100' };

export const CategoryGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 md:gap-6">
      {categories.map((category) => {
        const Icon = (Icons as any)[category.icon];
        const colors = colorMap[category.color] || defaultColors;
        return (
          <Link
            key={category.id}
            to={`/category?type=${category.name.toLowerCase()}`}
            className="flex flex-col items-center group"
          >
            <div className={cn(
              "w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center transition-all duration-300 transform group-hover:-translate-y-1 shadow-sm",
              colors.bg,
              colors.text,
              colors.hover
            )}>
              {Icon && <Icon className="w-7 h-7 md:w-8 md:h-8" />}
            </div>
            <span className={cn(
              "mt-2 text-[10px] font-bold text-[#475569] text-center uppercase tracking-tight transition group-hover:text-opacity-100",
              `group-hover:${colors.text.replace('text-', 'text-')}`
            )}>
              {category.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
};
