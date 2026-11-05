import React from 'react';
import { RegionPerformance } from '../../types';

interface RiskMapProps {
    regions: RegionPerformance[];
}

const RiskMap: React.FC<RiskMapProps> = ({ regions }) => {

    const getRiskColor = (score: number) => {
        if (score > 85) return 'bg-red-700 hover:bg-red-800';
        if (score > 70) return 'bg-red-500 hover:bg-red-600';
        if (score > 55) return 'bg-orange-500 hover:bg-orange-600';
        if (score > 40) return 'bg-yellow-400 hover:bg-yellow-500';
        return 'bg-emerald-500 hover:bg-emerald-600';
    };

    const findRegion = (name: string) => regions.find(r => r.name === name);

    // Simplified layout of Indonesia. In a real app, use SVG/GeoJSON.
    const mapLayout = [
        { name: 'Sumatera Utara', style: { top: '20%', left: '10%', width: '10%', height: '15%' } },
        { name: 'Aceh', style: { top: '10%', left: '5%', width: '8%', height: '10%' } },
        { name: 'Jawa Barat', style: { top: '65%', left: '20%', width: '12%', height: '8%' } },
        { name: 'Banten', style: { top: '68%', left: '15%', width: '5%', height: '5%' } },
        { name: 'Kalimantan Utara', style: { top: '25%', left: '45%', width: '15%', height: '15%' } },
        { name: 'Sulawesi Barat', style: { top: '55%', left: '55%', width: '8%', height: '12%' } },
        { name: 'Gorontalo', style: { top: '45%', left: '62%', width: '8%', height: '8%' } },
        { name: 'Maluku Utara', style: { top: '40%', left: '75%', width: '10%', height: '15%' } },
        { name: 'Papua', style: { top: '50%', left: '80%', width: '18%', height: '25%' } },
        { name: 'Nusa Tenggara Timur', style: { top: '80%', left: '58%', width: '15%', height: '10%' } },
    ];
    
    return (
        <div>
             <h3 className="text-lg font-bold text-slate-800 mb-2">Peta Sebaran Risiko Geografis</h3>
             <p className="text-sm text-slate-500 mb-4">Arahkan kursor ke wilayah untuk melihat skor risiko.</p>
            <div className="relative w-full h-96 bg-slate-100 rounded-lg overflow-hidden border">
                {mapLayout.map(item => {
                    const regionData = findRegion(item.name);
                    const score = regionData ? regionData.riskScore : 0;
                    const color = regionData ? getRiskColor(score) : 'bg-gray-400';

                    return (
                        <div
                            key={item.name}
                            className={`absolute ${color} transition-colors border-2 border-white rounded-md flex items-center justify-center text-white text-xs font-bold shadow-md`}
                            style={item.style}
                            title={`${item.name} - Skor Risiko: ${score}`}
                        >
                            <span className="p-1 truncate">{item.name}</span>
                        </div>
                    );
                })}
            </div>
            <div className="flex justify-end space-x-2 mt-2 text-xs text-slate-600">
                <div className="flex items-center"><span className="w-3 h-3 rounded-sm bg-emerald-500 mr-1"></span>Rendah</div>
                <div className="flex items-center"><span className="w-3 h-3 rounded-sm bg-yellow-400 mr-1"></span>Sedang</div>
                <div className="flex items-center"><span className="w-3 h-3 rounded-sm bg-orange-500 mr-1"></span>Tinggi</div>
                <div className="flex items-center"><span className="w-3 h-3 rounded-sm bg-red-500 mr-1"></span>Kritis</div>
            </div>
        </div>
    );
};

export default RiskMap;