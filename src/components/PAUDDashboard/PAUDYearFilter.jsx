import React from 'react';
import { ChevronDown, Calendar } from 'lucide-react';

const PAUDYearFilter = ({ 
  selectedYear, 
  onYearChange, 
  availableYears = [2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029],
  className = '',
  disabled = false 
}) => {
  const handleYearChange = (event) => {
    const year = event.target.value;
    onYearChange(year);
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex items-center gap-2 text-gray-700">
        <Calendar className="w-4 h-4" />
        <span className="text-sm font-medium">Tahun:</span>
      </div>
      
      <div className="relative">
        <select
          value={selectedYear}
          onChange={handleYearChange}
          disabled={disabled}
          className={`
            appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10
            text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 
            focus:ring-blue-500 focus:border-blue-500 transition-all duration-200
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400 cursor-pointer'}
          `}
        >
          <option value="all">Semua tahun</option>
          {availableYears.map(year => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
        
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
};

export default PAUDYearFilter; 