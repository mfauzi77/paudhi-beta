

import React from 'react';

export interface ForecastTrendPoint {
    month: string;
    regionalActual: number | null;
    regionalPredicted: number;
    nationalActual: number | null;
    nationalPredicted: number;
}

interface RegionalForecastTrendChartProps {
    regionName: string;
    parentRegionName?: string;
    data: ForecastTrendPoint[];
}

const RegionalForecastTrendChart: React.FC<RegionalForecastTrendChartProps> = ({ regionName, parentRegionName = "Nasional", data }) => {
    const chartWidth = 500;
    const chartHeight = 300;
    const padding = 50;
    const yMax = 100;

    if (!data || data.length === 0) {
        return <p>Data tidak tersedia untuk grafik tren.</p>;
    }

    const getX = (index: number) => {
        const total = data.length;
        if (total <= 1) return padding;
        return padding + (index * (chartWidth - padding * 2)) / (total - 1);
    };
    
    const getY = (value: number) => chartHeight - padding - ((value / yMax) * (chartHeight - padding * 2));

    const regionalActualPath = data
        .map((p, i) => p.regionalActual !== null ? { x: getX(i), y: getY(p.regionalActual), i } : null)
        .filter((p): p is { x: number, y: number, i: number } => p !== null)
        .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
        .join(' ');

    const nationalActualPath = data
        .map((p, i) => p.nationalActual !== null ? { x: getX(i), y: getY(p.nationalActual), i } : null)
        .filter((p): p is { x: number, y: number, i: number } => p !== null)
        .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
        .join(' ');

    const regionalPredictedPath = data.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p.regionalPredicted)}`).join(' ');
    const nationalPredictedPath = data.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p.nationalPredicted)}`).join(' ');

    const firstPredictedIndex = data.findIndex(d => d.regionalActual === null);

    return (
        <div>
            <h3 className="text-lg font-bold text-slate-800">Tren & Prediksi Risiko (vs. {parentRegionName})</h3>
            <p className="text-sm text-slate-500 mb-4">Perbandingan histori dan prediksi risiko wilayah terpilih dengan {parentRegionName.toLowerCase()}.</p>
            <div className="w-full overflow-x-auto">
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
                    {/* Y-Axis lines and labels */}
                    {[0, 25, 50, 75, 100].map(val => (
                        <g key={val}>
                            <line x1={padding} y1={getY(val)} x2={chartWidth - padding} y2={getY(val)} className="stroke-slate-200" strokeWidth="1" />
                            <text x={padding - 8} y={getY(val) + 4} textAnchor="end" className="fill-slate-500" fontSize="10">{val}</text>
                        </g>
                    ))}

                    {/* X-Axis labels */}
                    {data.map((p, i) => (
                        <text key={p.month} x={getX(i)} y={chartHeight - padding + 20} textAnchor="middle" className="fill-slate-500" fontSize="10">{p.month}</text>
                    ))}

                    {/* National Predicted Path */}
                    <path d={nationalPredictedPath} fill="none" className="stroke-slate-400" strokeWidth="2" strokeDasharray="3 3" />
                    {/* Regional Predicted Path */}
                    <path d={regionalPredictedPath} fill="none" className="stroke-indigo-400" strokeWidth="2" strokeDasharray="3 3" />
                    
                    {/* National Actual Path */}
                    <path d={nationalActualPath} fill="none"className="stroke-slate-500" strokeWidth="2.5" />
                    {/* Regional Actual Path */}
                    <path d={regionalActualPath} fill="none" className="stroke-indigo-600" strokeWidth="2.5" />
                    
                    {data.map((p, i) => {
                        if (p.regionalActual !== null) {
                            return (
                                <circle key={`regional-dot-${i}`} cx={getX(i)} cy={getY(p.regionalActual)} r="3" className="fill-white stroke-indigo-600" strokeWidth="2">
                                    <title>{regionName} - {p.month}: {p.regionalActual}</title>
                                </circle>
                            );
                        }
                        return null;
                    })}
                    
                    {data.map((p, i) => {
                        if (p.nationalActual !== null) {
                            return (
                                <circle key={`national-dot-${i}`} cx={getX(i)} cy={getY(p.nationalActual)} r="3" className="fill-white stroke-slate-500" strokeWidth="2">
                                    <title>{parentRegionName} - {p.month}: {p.nationalActual}</title>
                                </circle>
                            );
                        }
                        return null;
                    })}
                    
                    {/* Vertical line separating actual from prediction */}
                    {firstPredictedIndex > 0 && (
                        <line 
                            x1={getX(firstPredictedIndex - 0.5)} 
                            y1={padding} 
                            x2={getX(firstPredictedIndex - 0.5)} 
                            y2={chartHeight - padding} 
                            className="stroke-slate-300"
                            strokeWidth="1" 
                            strokeDasharray="2 2"
                        />
                    )}
                </svg>
            </div>
             <div className="flex items-center justify-center flex-wrap gap-x-4 gap-y-2 mt-4 text-xs text-slate-600">
                <div className="flex items-center"><span className="w-3 h-0.5 bg-indigo-600 mr-2"></span>{regionName} (Aktual)</div>
                <div className="flex items-center"><span className="w-3 h-0.5 border-t-2 border-dashed border-indigo-400 mr-2"></span>{regionName} (Prediksi)</div>
                <div className="flex items-center"><span className="w-3 h-0.5 bg-slate-500 mr-2"></span>{parentRegionName} (Aktual)</div>
                <div className="flex items-center"><span className="w-3 h-0.5 border-t-2 border-dashed border-slate-400 mr-2"></span>{parentRegionName} (Prediksi)</div>
            </div>
        </div>
    );
};

export default RegionalForecastTrendChart;