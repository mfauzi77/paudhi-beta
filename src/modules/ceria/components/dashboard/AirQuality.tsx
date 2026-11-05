import React from 'react';
import { AirQualityData } from '../../types';
import { SunIcon, ExclamationTriangleIcon, ArrowPathIcon } from '../icons/Icons';

interface AirQualityProps {
    airQualityData: AirQualityData | null;
    isLoading: boolean;
    error: string | null;
}

const AirQuality: React.FC<AirQualityProps> = ({ airQualityData, isLoading, error }) => {
    
    const getLevelStyles = (level: AirQualityData['level']): { text: string; bg: string; } => {
        switch (level) {
            case 'Baik': return { text: 'text-emerald-800', bg: 'bg-emerald-100' };
            case 'Sedang': return { text: 'text-yellow-800', bg: 'bg-yellow-100' };
            case 'Tidak Sehat': return { text: 'text-orange-800', bg: 'bg-orange-100' };
            case 'Sangat Tidak Sehat': return { text: 'text-red-800', bg: 'bg-red-100' };
            case 'Berbahaya': return { text: 'text-purple-800', bg: 'bg-purple-100' };
            default: return { text: 'text-slate-800', bg: 'bg-slate-100' };
        }
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-slate-500">
                    <ArrowPathIcon className="w-8 h-8 animate-spin" />
                    <p className="mt-2 text-sm">Memuat data AQI nasional...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-center text-amber-700">
                    <ExclamationTriangleIcon className="w-8 h-8" />
                    <p className="mt-2 text-sm font-semibold">{error}</p>
                </div>
            );
        }

        if (airQualityData) {
            const styles = getLevelStyles(airQualityData.level);
            return (
                <div className="text-center">
                    <p className="text-5xl font-bold text-slate-800">{airQualityData.aqi}</p>
                    <p className={`mt-1 text-lg font-bold px-3 py-1 rounded-full inline-block ${styles.bg} ${styles.text}`}>
                        {airQualityData.level}
                    </p>
                    <p className="mt-3 text-sm text-slate-600 truncate max-w-xs">{airQualityData.station}</p>
                    <p className="text-xs text-slate-400">Diperbarui: {airQualityData.time}</p>
                </div>
            );
        }

        return null; // Should not happen if not loading and no error
    };


    return (
        <div className="bg-white p-6 rounded-lg shadow-sm flex flex-col">
            <h3 className="text-lg font-bold text-slate-800 flex items-center">
                <SunIcon className="w-6 h-6 mr-2 text-cyan-500" />
                Peringatan Kualitas Udara
            </h3>
            <p className="text-xs text-slate-500 -mt-1 mb-4">Menampilkan stasiun dengan AQI tertinggi di Indonesia saat ini.</p>
            <div className="flex-grow flex items-center justify-center">
                {renderContent()}
            </div>
        </div>
    );
};

export default AirQuality;