import React, { useState, useMemo } from 'react';
import { ActiveAlertData, AlertLevel } from '../../types';
import { BeakerIcon } from '../icons/Icons';

interface ActiveAlertsProps {
  year: number;
  data: ActiveAlertData[];
  onAnalyze: (alert: ActiveAlertData) => void;
  onCreatePlan: () => void;
}

type AlertFilter = 'Semua' | AlertLevel.Critical | AlertLevel.High;

const ActiveAlerts: React.FC<ActiveAlertsProps> = ({ data, year, onAnalyze, onCreatePlan }) => {
    const [activeFilter, setActiveFilter] = useState<AlertFilter>('Semua');

  const getLevelStyles = (level: AlertLevel): string => {
    switch (level) {
      case AlertLevel.Critical:
          return 'border-red-700 bg-red-100 text-red-900';
      case AlertLevel.High:
        return 'border-red-500 bg-red-50 text-red-700';
      case AlertLevel.Medium:
        return 'border-orange-500 bg-orange-50 text-orange-700';
      default:
        return 'border-gray-300 bg-gray-50 text-gray-700';
    }
  };

  const filteredData = useMemo(() => {
    if (activeFilter === 'Semua') {
        return data;
    }
    return data.filter(alert => alert.level === activeFilter);
  }, [data, activeFilter])


  const FilterTab: React.FC<{filter: AlertFilter, label: string}> = ({ filter, label }) => {
    const isActive = activeFilter === filter;
    const count = filter === 'Semua' ? data.length : data.filter(a => a.level === filter).length;
    return (
      <button 
        onClick={() => setActiveFilter(filter)}
        className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${isActive ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
      >
        {label} <span className={`ml-1.5 px-2 py-0.5 rounded-full text-xs ${isActive ? 'bg-white text-indigo-600' : 'bg-slate-300 text-slate-600'}`}>{count}</span>
      </button>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4">
        <h3 className="text-lg font-bold text-slate-800">Alert Aktif {year}</h3>
        <div className="flex items-center space-x-2 mt-3 sm:mt-0">
          <FilterTab filter="Semua" label="Semua" />
          <FilterTab filter={AlertLevel.Critical} label="Kritis" />
          <FilterTab filter={AlertLevel.High} label="Tinggi" />
        </div>
      </div>
      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
        {filteredData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredData.map((alert) => (
              <div key={alert.id} className={`border-l-4 p-4 rounded-r-lg ${getLevelStyles(alert.level)}`}>
                <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-bold uppercase">{alert.level}</span>
                      <p className="font-bold text-slate-800 mt-1">{alert.title}</p>
                      <p className="text-sm text-slate-600">{alert.region} - {alert.domain}</p>
                    </div>
                     <button 
                        onClick={() => onAnalyze(alert)}
                        className="px-3 py-1 text-xs font-semibold text-indigo-700 bg-indigo-100 rounded-full hover:bg-indigo-200 transition-all whitespace-nowrap"
                    >
                        Analisis AI
                    </button>
                </div>
                <div className="text-xs text-slate-600 mt-2">
                  <span className="font-semibold">Risk Score: {alert.riskScore}</span>
                  {alert.trend && <span> | Trend: <span className="font-semibold">{alert.trend > 0 ? `+${alert.trend}`: alert.trend}%</span></span>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-slate-500">Tidak ada alert dengan level '{activeFilter}' untuk tahun {year}.</p>
          </div>
        )}
      </div>
       <div className="flex items-center justify-end space-x-3 pt-4 mt-4 border-t border-slate-200">
            <button
                onClick={onCreatePlan}
                className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all flex items-center">
                <BeakerIcon className="w-5 h-5 mr-2"/>
                Buat Rencana Intervensi
            </button>
        </div>
    </div>
  );
};

export default ActiveAlerts;
