import React from 'react';
import { KeyIndicatorData, DomainFilter } from '../../types';
import { ChevronUpIcon, ChevronDownIcon, MinusIcon } from '../icons/Icons';

interface KeyHealthIndicatorsProps {
  data: KeyIndicatorData[];
  domain: DomainFilter;
}

const KeyHealthIndicators: React.FC<KeyHealthIndicatorsProps> = ({ data, domain }) => {
  const visibleIndicators = data.filter(indicator => indicator.comparison || !indicator.trendUnavailable);
  const TrendIndicator: React.FC<{ change: number; type: 'increase' | 'decrease' | 'stable' }> = ({ change, type }) => {
    if (type === 'stable' || change === 0) {
      return (
        <div className="flex items-center text-xs font-bold text-slate-500">
          <MinusIcon />
          <span className="ml-1">Stabil vs bulan lalu</span>
        </div>
      );
    }
    
    const isPositiveChange = change > 0;
    const color = isPositiveChange ? 'text-emerald-500' : 'text-red-500';
    const icon = isPositiveChange ? <ChevronUpIcon /> : <ChevronDownIcon />;
    
    return (
      <div className={`flex items-center text-xs font-bold ${color}`}>
        {icon}
        <span className="ml-1">{Math.abs(change)}% vs bulan lalu</span>
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-bold text-slate-800 mb-4">Indikator Kunci - {domain}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleIndicators.map((indicator, index) => (
          <div key={index} className="bg-slate-50 p-4 rounded-lg">
            <p className="text-3xl font-bold text-indigo-600">{indicator.value}</p>
            <p className="text-sm font-medium text-slate-700 mt-1 h-10">{indicator.label}</p>
            {(indicator.comparison || !indicator.trendUnavailable) && <div className="mt-2">
                {indicator.comparison ? <div className="text-xs text-slate-600">
                    <div className={`flex items-center font-semibold ${indicator.comparison.change > 0 ? 'text-emerald-500' : indicator.comparison.change < 0 ? 'text-red-500' : 'text-slate-500'}`}>
                        {indicator.comparison.change > 0 ? <ChevronUpIcon /> : indicator.comparison.change < 0 ? <ChevronDownIcon /> : <MinusIcon />}
                        <span className="ml-1">{indicator.comparison.change > 0 ? 'Naik' : indicator.comparison.change < 0 ? 'Turun' : 'Tetap'} {Math.abs(indicator.comparison.change).toLocaleString('id-ID')} poin persentase vs dataset 2024</span>
                    </div>
                    <p className="mt-1">Rata-rata {indicator.comparison.provinceCount} provinsi, tanpa bobot populasi; bukan tren nasional.</p>
                    <details className="mt-1"><summary className="cursor-pointer">Dasar perbandingan</summary><p>Rata-rata data 2024: {indicator.comparison.previous.toLocaleString('id-ID')}%; data 2025: {indicator.comparison.current.toLocaleString('id-ID')}%. Kesetaraan sumber, tahun pengamatan, dan populasi belum diverifikasi.</p></details>
                </div> : <TrendIndicator change={indicator.change} type={indicator.changeType} />}
            </div>}
          </div>
        ))}
        {visibleIndicators.length === 0 && <p className="text-slate-500 text-sm col-span-3">Tidak ada indikator dengan data pembanding untuk domain ini.</p>}
      </div>
    </div>
  );
};

export default KeyHealthIndicators;
