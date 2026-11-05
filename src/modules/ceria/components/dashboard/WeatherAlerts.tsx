import React from 'react';
import { DisasterData } from '../../types';
import { ExclamationTriangleIcon } from '../icons/Icons';

// A simplified displayable alert structure for the UI
type DisplayableAlertLevel = 'Awas' | 'Siaga' | 'Waspada';

interface DisplayableAlert {
    id: string;
    source: 'BMKG' | 'BNPB' | 'PetaBencana';
    level: DisplayableAlertLevel;
    region: string;
    time: string;
    alert: string;
}

const WeatherAlerts: React.FC<{ disasterData: DisasterData | null }> = ({ disasterData }) => {
    const alerts: DisplayableAlert[] = [];

    // Process BMKG earthquake data if it exists
    if (disasterData?.gempa?.Infogempa?.gempa) {
        const gempa = disasterData.gempa.Infogempa.gempa;
        const magnitude = parseFloat(gempa.Magnitude);
        let level: DisplayableAlert['level'] = 'Waspada';
        if (magnitude >= 5.0) level = 'Siaga';
        if (magnitude >= 7.0) level = 'Awas';

        alerts.push({
            id: gempa.DateTime,
            source: 'BMKG',
            level: level,
            region: gempa.Wilayah,
            time: gempa.Jam,
            alert: `Gempa M ${gempa.Magnitude}, Kedalaman ${gempa.Kedalaman}. ${gempa.Potensi}`
        });
    }

    // Future-proofing for other data sources
    // ... bnpb, petaBencana processing logic would go here

    const getLevelStyles = (level: DisplayableAlertLevel) => {
        switch (level) {
            case 'Awas': return 'bg-red-100 text-red-800 border-red-500';
            case 'Siaga': return 'bg-orange-100 text-orange-800 border-orange-500';
            default: return 'bg-yellow-100 text-yellow-800 border-yellow-500';
        }
    };

    // Do not render the component if there are no alerts to show.
    if (alerts.length === 0) {
        return null;
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                <ExclamationTriangleIcon className="w-6 h-6 mr-2 text-amber-500" />
                Peringatan Dini Bencana
            </h3>
            <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                {alerts.map(alert => (
                    <div key={alert.id} className={`p-4 rounded-lg border-l-4 ${getLevelStyles(alert.level)}`}>
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="font-bold text-slate-800">{alert.region}</p>
                                <p className="text-xs text-slate-600">{alert.source} • {alert.time}</p>
                            </div>
                            <span className="text-xs font-bold uppercase">{alert.level}</span>
                        </div>
                        <p className="mt-2 text-sm text-slate-700">{alert.alert}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WeatherAlerts;
