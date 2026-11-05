import React from 'react';
import { ActiveAlertData, AlertLevel } from '../../types';

interface DomainTopAlertsProps {
    alerts: ActiveAlertData[];
    domainName: string;
}

const DomainTopAlerts: React.FC<DomainTopAlertsProps> = ({ alerts, domainName }) => {
    
    const getLevelStyles = (level: AlertLevel) => {
        switch (level) {
            case AlertLevel.Critical: return 'bg-red-100 text-red-800 border-red-500';
            case AlertLevel.High: return 'bg-orange-100 text-orange-800 border-orange-500';
            case AlertLevel.Medium: return 'bg-yellow-100 text-yellow-800 border-yellow-500';
            default: return 'bg-gray-100 text-gray-800 border-gray-500';
        }
    };
    
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Alert Teratas Bidang {domainName}</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {alerts.map(alert => (
                    <div key={alert.id} className={`p-4 rounded-lg border-l-4 ${getLevelStyles(alert.level)}`}>
                        <div className="flex items-center justify-between">
                            <span className={`text-xs font-bold uppercase`}>{alert.level}</span>
                            <span className="text-sm font-bold text-slate-700">{alert.riskScore}</span>
                        </div>
                        <p className="font-bold text-slate-800 mt-2">{alert.title}</p>
                        <p className="text-sm text-slate-600">{alert.region}</p>
                    </div>
                ))}
                {alerts.length === 0 && (
                    <p className="text-sm text-slate-500 col-span-full text-center py-4">Tidak ada alert teratas untuk bidang ini.</p>
                )}
             </div>
        </div>
    );
};

export default DomainTopAlerts;
