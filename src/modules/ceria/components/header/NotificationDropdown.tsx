import React from 'react';
import { ActiveAlertData, AlertLevel, View } from '../../types';

interface NotificationDropdownProps {
    year: number;
    alerts: ActiveAlertData[];
    onNavigate: (view: View) => void;
    onNavigateToRegion: (regionName: string) => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ alerts, year, onNavigate, onNavigateToRegion }) => {

    const getLevelDotColor = (level: AlertLevel): string => {
        switch (level) {
            case AlertLevel.Critical: return 'bg-red-700';
            case AlertLevel.High: return 'bg-red-500';
            default: return 'bg-orange-500';
        }
    };

    const handleAllAlertsNavigation = () => {
        // Navigate to the dashboard where all alerts are visible
        onNavigate(View.Dashboard);
    }
    
    // Show top 5 alerts
    const displayedAlerts = alerts.slice(0, 5);

    return (
        <div className="absolute right-0 mt-3 w-80 sm:w-[400px] bg-white rounded-xl shadow-2xl ring-1 ring-slate-200 z-50 overflow-hidden transform transition-all">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Notifikasi Prioritas {year}</h3>
                {alerts.length > 0 && (
                    <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                        {alerts.length} Penting
                    </span>
                )}
            </div>
            
            <ul className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
                {displayedAlerts.length > 0 ? (
                    displayedAlerts.map(alert => (
                        <li key={alert.id}>
                            <a 
                                href="#" 
                                onClick={(e) => { e.preventDefault(); onNavigateToRegion(alert.region); }} 
                                className="group flex items-start gap-3 p-4 hover:bg-indigo-50/50 transition-all duration-200"
                            >
                                <div className={`flex-shrink-0 w-3 h-3 mt-1 rounded-full ring-4 ring-white shadow-sm ${getLevelDotColor(alert.level)}`}></div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-0.5">
                                        <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-700 transition-colors line-clamp-1">{alert.title}</p>
                                  </div>
                                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                                        <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{alert.region}</span>
                                        <span className="text-slate-300">•</span>
                                        <span className="text-indigo-600 font-semibold uppercase tracking-wider text-[9px]">{alert.domain}</span>
                                    </div>
                                </div>
                            </a>
                        </li>
                    ))
                ) : (
                    <li className="px-6 py-12 text-center">
                        <div className="bg-slate-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </div>
                        <p className="text-sm font-medium text-slate-500">Tidak ada notifikasi mendesak untuk tahun {year}</p>
                    </li>
                )}
            </ul>

            <div className="p-3 bg-slate-50 border-t border-slate-200">
                <button 
                    onClick={(e) => { e.preventDefault(); handleAllAlertsNavigation(); }} 
                    className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:bg-white rounded-lg transition-all border border-transparent hover:border-indigo-100 shadow-sm"
                >
                    Lihat Semua Analisis
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default NotificationDropdown;
