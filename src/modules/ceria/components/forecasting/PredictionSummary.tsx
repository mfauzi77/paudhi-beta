import React from 'react';
import { RegionalForecastData } from '../../types';
import { BellAlertIcon,ChartBarIcon,TrendingUpIcon } from '../icons/Icons';

interface PredictionSummaryProps {
    data: RegionalForecastData[];
}

const PredictionSummary: React.FC<PredictionSummaryProps> = ({ data }) => {
    const overallPredictedRisk = data.length > 0 ? data.reduce((acc, item) => acc + item.predictedRisk, 0) / data.length : 0;
    const regionsIncreasing = data.filter(item => item.change > 0).length;
    const crossingThreshold = data.filter(item => 
        (item.currentRiskLevel === 'Sedang' || item.currentRiskLevel === 'Rendah') && 
        (item.predictedRiskLevel === 'Tinggi' || item.predictedRiskLevel === 'Kritis')
    ).length;


    const StatCard: React.FC<{ icon: React.ReactNode, title: string, value: string, description: string }> = ({ icon, title, value, description }) => (
        <div className="bg-slate-50 p-4 rounded-lg flex items-center">
            <div className="flex-shrink-0 mr-4">
                {icon}
            </div>
            <div>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{title}</p>
                <p className="text-xl font-bold text-slate-800">{value}</p>
                <p className="text-xs text-slate-500">{description}</p>
            </div>
        </div>
    );

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm h-full">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Summary Prediksi</h3>
            <div className="space-y-3">
                <StatCard 
                    icon={<ChartBarIcon className="w-8 h-8 text-indigo-500" />}
                    title="Overall Predicted Risk"
                    value={overallPredictedRisk.toFixed(1)}
                    description="Rata-rata skor risiko yang diprediksi."
                />
                 <StatCard 
                    icon={<TrendingUpIcon className="w-8 h-8 text-red-500" />}
                    title="Wilayah Berisiko Naik"
                    value={`${regionsIncreasing} Wilayah`}
                    description="Jumlah wilayah dengan tren risiko meningkat."
                />
                <StatCard 
                    icon={<BellAlertIcon className="w-8 h-8 text-amber-500" />}
                    title="Melintasi Ambang Batas"
                    value={`${crossingThreshold} Wilayah`}
                    description="Prediksi masuk level risiko Tinggi/Kritis."
                />
            </div>
        </div>
    );
}

export default PredictionSummary;