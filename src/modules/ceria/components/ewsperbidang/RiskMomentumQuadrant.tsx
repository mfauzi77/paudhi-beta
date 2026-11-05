import React from 'react';
import { RegionPerformance } from '../../types';

interface RiskMomentumQuadrantProps {
    regions: RegionPerformance[];
    onRegionSelect?: (regionId: string) => void;
    selectedRegionId?: string;
}

const RiskMomentumQuadrant: React.FC<RiskMomentumQuadrantProps> = ({ regions, onRegionSelect, selectedRegionId }) => {
    const width = 600;
    const height = 450;
    const padding = 60;

    const riskScores = regions.map(r => r.riskScore);
    const trends = regions.map(r => r.trend);
    const xMax = Math.max(100, ...riskScores);
    const xMin = 0;
    const yMax = Math.max(5, ...trends.map(t => Math.abs(t)));
    const yMin = -yMax;

    const xCenter = regions.length > 0 ? riskScores.reduce((a, b) => a + b, 0) / regions.length : 50;
    const yCenter = 0;

    const getX = (score: number) => padding + ((score - xMin) / (xMax - xMin)) * (width - padding * 2);
    const getY = (trend: number) => (height - padding) - ((trend - yMin) / (yMax - yMin)) * (height - padding * 2);

    const xCenterLine = getX(xCenter);
    const yCenterLine = getY(yCenter);

    const getQuadrant = (score: number, trend: number): number => {
        if (score >= xCenter && trend >= yCenter) return 1; // Top-Right
        if (score < xCenter && trend >= yCenter) return 2;  // Top-Left
        if (score < xCenter && trend < yCenter) return 3;   // Bottom-Left
        if (score >= xCenter && trend < yCenter) return 4;  // Bottom-Right
        return 0;
    };
    
    const quadrantInfo = [
        { name: '', style: { fill: '', text: '' }, description: '' },
        { name: 'Prioritas Utama', style: { fill: 'rgba(239, 68, 68, 0.05)', text: 'text-red-700' }, description: 'Risiko Tinggi, Tren Memburuk' },
        { name: 'Perlu Perhatian', style: { fill: 'rgba(245, 158, 11, 0.05)', text: 'text-amber-700' }, description: 'Risiko Rendah, Tren Memburuk' },
        { name: 'Praktik Terbaik', style: { fill: 'rgba(16, 185, 129, 0.05)', text: 'text-emerald-700' }, description: 'Risiko Rendah, Tren Membaik' },
        { name: 'Dalam Pengawasan', style: { fill: 'rgba(59, 130, 246, 0.05)', text: 'text-blue-700' }, description: 'Risiko Tinggi, Tren Membaik' },
    ];

    return (
        <div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Kuadran Momentum Risiko</h3>
            <p className="text-sm text-slate-500 mb-4">Memetakan wilayah berdasarkan skor risiko saat ini dan tren perubahannya.</p>
            <div className="w-full overflow-x-auto">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" role="figure" aria-labelledby="chart-title-quadrant">
                    <title id="chart-title-quadrant">Diagram Kuadran Momentum Risiko</title>
                    
                    <rect x={xCenterLine} y={padding} width={width - padding - xCenterLine} height={yCenterLine - padding} fill={quadrantInfo[1].style.fill} />
                    <rect x={padding} y={padding} width={xCenterLine - padding} height={yCenterLine - padding} fill={quadrantInfo[2].style.fill} />
                    <rect x={padding} y={yCenterLine} width={xCenterLine - padding} height={height - padding - yCenterLine} fill={quadrantInfo[3].style.fill} />
                    <rect x={xCenterLine} y={yCenterLine} width={width - padding - xCenterLine} height={height - padding - yCenterLine} fill={quadrantInfo[4].style.fill} />

                    <text x={width - padding - 10} y={padding + 20} textAnchor="end" className={`text-sm font-bold fill-current ${quadrantInfo[1].style.text}`}>{quadrantInfo[1].name}</text>
                    <text x={width - padding - 10} y={padding + 38} textAnchor="end" className={`text-xs fill-current ${quadrantInfo[1].style.text}`}>{quadrantInfo[1].description}</text>

                    <text x={padding + 10} y={padding + 20} className={`text-sm font-bold fill-current ${quadrantInfo[2].style.text}`}>{quadrantInfo[2].name}</text>
                    <text x={padding + 10} y={padding + 38} className={`text-xs fill-current ${quadrantInfo[2].style.text}`}>{quadrantInfo[2].description}</text>
                    
                    <text x={padding + 10} y={height - padding - 38} className={`text-sm font-bold fill-current ${quadrantInfo[3].style.text}`}>{quadrantInfo[3].name}</text>
                    <text x={padding + 10} y={height - padding - 20} className={`text-xs fill-current ${quadrantInfo[3].style.text}`}>{quadrantInfo[3].description}</text>

                    <text x={width - padding - 10} y={height - padding - 38} textAnchor="end" className={`text-sm font-bold fill-current ${quadrantInfo[4].style.text}`}>{quadrantInfo[4].name}</text>
                    <text x={width - padding - 10} y={height - padding - 20} textAnchor="end" className={`text-xs fill-current ${quadrantInfo[4].style.text}`}>{quadrantInfo[4].description}</text>

                    <line x1={xCenterLine} y1={padding} x2={xCenterLine} y2={height - padding} className="stroke-slate-300" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1={padding} y1={yCenterLine} x2={width - padding} y2={yCenterLine} className="stroke-slate-300" strokeWidth="1" strokeDasharray="3 3" />

                    <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} className="stroke-slate-400" strokeWidth="1.5" />
                    <text x={width / 2} y={height - 15} textAnchor="middle" className="text-sm font-semibold fill-current text-slate-600">Skor Risiko →</text>
                    
                    <line x1={padding} y1={padding} x2={padding} y2={height - padding} className="stroke-slate-400" strokeWidth="1.5" />
                    <text x={padding - 25} y={height / 2} transform={`rotate(-90, ${padding-25}, ${height/2})`} textAnchor="middle" className="text-sm font-semibold fill-current text-slate-600">Tren Memburuk →</text>
                    
                    {regions.map(region => {
                        const q = getQuadrant(region.riskScore, region.trend);
                        const pointColor = q === 1 ? 'fill-red-500' : q === 2 ? 'fill-amber-500' : q === 3 ? 'fill-emerald-500' : 'fill-blue-500';
                        const isSelected = onRegionSelect && selectedRegionId === region.id;

                        return (
                            <g 
                                key={region.id} 
                                className={`group ${onRegionSelect ? 'cursor-pointer' : ''}`}
                                transform={`translate(${getX(region.riskScore)}, ${getY(region.trend)})`}
                                onClick={() => onRegionSelect && onRegionSelect(region.id)}
                            >
                                {isSelected && <circle r="11" className={pointColor} fill="none" stroke="currentColor" strokeWidth="2" strokeOpacity="0.4" />}
                                <circle r={isSelected ? 8 : 6} className={`${pointColor} opacity-75 group-hover:opacity-100 transition-all`}>
                                    <title>{`${region.name} | Risiko: ${region.riskScore}, Tren: ${region.trend > 0 ? '+' : ''}${region.trend}`}</title>
                                </circle>
                                <text
                                    x="10"
                                    y="4"
                                    className={`text-xs fill-current text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity font-medium pointer-events-none ${isSelected ? '!opacity-100' : ''}`}
                                >
                                    {region.name}
                                </text>
                            </g>
                        )
                    })}
                </svg>
            </div>
        </div>
    );
};

export default RiskMomentumQuadrant;