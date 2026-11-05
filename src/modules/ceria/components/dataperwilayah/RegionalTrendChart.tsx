import React from 'react';

interface RegionalTrendChartProps {
    regionName: string;
    regionHistory: { month: string, score: number }[];
    nationalHistory: { month: string, score: number }[];
}

const RegionalTrendChart: React.FC<RegionalTrendChartProps> = ({ regionName, regionHistory, nationalHistory }) => {
    const chartWidth = 500;
    const chartHeight = 250;
    const padding = 40;
    const yMax = 100;

    const getX = (index: number) => padding + (index * (chartWidth - padding * 2)) / (regionHistory.length - 1);
    const getY = (value: number) => chartHeight - padding - ((value / yMax) * (chartHeight - padding * 2));

    const regionPath = regionHistory.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p.score)}`).join(' ');
    const nationalPath = nationalHistory.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p.score)}`).join(' ');
    
    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4">
                <h3 className="text-lg font-bold text-slate-800">Tren Skor Risiko (6 Bulan)</h3>
                 <div className="flex items-center space-x-4 text-xs text-slate-600 mt-2 sm:mt-0">
                    <div className="flex items-center"><span className="w-3 h-0.5 bg-indigo-500 mr-2"></span>{regionName}</div>
                    <div className="flex items-center"><span className="w-3 h-0.5 border-t-2 border-dashed border-slate-400 mr-2"></span>Nasional</div>
                </div>
            </div>
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
                    {regionHistory.map((p, i) => (
                        <text key={p.month} x={getX(i)} y={chartHeight - padding + 15} textAnchor="middle" className="fill-slate-500" fontSize="10">{p.month}</text>
                    ))}

                    {/* National Average Path */}
                    <path d={nationalPath} fill="none" className="stroke-slate-400" strokeWidth="2" strokeDasharray="4 4" />
                    
                    {/* Region Path */}
                    <path d={regionPath} fill="none" className="stroke-indigo-500" strokeWidth="2.5" />
                    {regionHistory.map((p, i) => (
                        <circle key={`dot-${i}`} cx={getX(i)} cy={getY(p.score)} r="3" className="fill-white stroke-indigo-500" strokeWidth="2">
                           <title>{p.month}: {p.score}</title>
                        </circle>
                    ))}
                </svg>
            </div>
        </div>
    );
};

export default RegionalTrendChart;
