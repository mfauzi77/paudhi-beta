
import React from 'react';
import { Domain } from '../../types';

interface ProfilePoint {
    axis: Domain;
    value: number;
}

interface RegionalProfileRadarChartProps {
    regionName: string;
    regionalProfile: ProfilePoint[];
    nationalProfile: ProfilePoint[];
}

const RegionalProfileRadarChart: React.FC<RegionalProfileRadarChartProps> = ({ regionName, regionalProfile, nationalProfile }) => {
    const width = 500;
    const height = 400;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 50;
    const levels = 4; // e.g., for 25, 50, 75, 100
    const maxValue = 100;
    const totalAxes = regionalProfile.length;
    
    if (totalAxes === 0) {
        return <p>Data tidak cukup untuk menampilkan grafik.</p>;
    }

    const allAxis = Array.from({ length: totalAxes }, (_, i) => {
        const angle = (Math.PI * 2 * i) / totalAxes - Math.PI / 2;
        return {
            name: regionalProfile[i].axis,
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle),
        };
    });

    const getCoordinatesForValue = (value: number, angleIndex: number): [number, number] => {
        const angle = (Math.PI * 2 * angleIndex) / totalAxes - Math.PI / 2;
        const r = (radius * value) / maxValue;
        return [centerX + r * Math.cos(angle), centerY + r * Math.sin(angle)];
    };
    
    const regionalPath = regionalProfile
        .map((point, i) => getCoordinatesForValue(point.value, i).join(','))
        .join(' ');
        
    const nationalPath = nationalProfile
        .map((point, i) => getCoordinatesForValue(point.value, i).join(','))
        .join(' ');


    return (
        <div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Profil Risiko Wilayah vs. Nasional</h3>
            <p className="text-sm text-slate-500 mb-4">Membandingkan skor risiko per bidang untuk <span className="font-bold">{regionName}</span> dengan rata-rata nasional.</p>
            <div className="w-full">
                <svg viewBox={`0 0 ${width} ${height}`} role="figure" aria-labelledby="chart-title-radar">
                    <title id="chart-title-radar">Grafik Radar Profil Risiko {regionName}</title>
                    <g className="radar-grid">
                        {[...Array(levels).keys()].map(i => (
                             <polygon
                                key={`level-${i}`}
                                points={allAxis.map(axis => 
                                    getCoordinatesForValue(maxValue * ((i + 1) / levels), allAxis.indexOf(axis)).join(',')
                                ).join(' ')}
                                className="stroke-slate-200 fill-none"
                                strokeWidth="1"
                            />
                        ))}
                         {[...Array(levels).keys()].map(i => (
                            <text
                                key={`level-label-${i}`}
                                x={centerX}
                                y={centerY - radius * ((i + 1) / levels) - 4}
                                className="text-[10px] fill-slate-500"
                                textAnchor="middle"
                            >
                                {maxValue * ((i+1)/levels)}
                            </text>
                         ))}
                    </g>
                    <g className="radar-axes">
                        {allAxis.map((axis, i) => (
                             <g key={`axis-${i}`}>
                                <line
                                    x1={centerX}
                                    y1={centerY}
                                    x2={axis.x}
                                    y2={axis.y}
                                    className="stroke-slate-300"
                                    strokeWidth="1"
                                />
                                <text
                                    x={axis.x + (axis.x - centerX) * 0.1}
                                    y={axis.y + (axis.y - centerY) * 0.1}
                                    className="text-[11px] font-semibold fill-slate-600"
                                    textAnchor={axis.x > centerX ? "start" : axis.x < centerX ? "end" : "middle"}
                                >
                                    {axis.name}
                                </text>
                            </g>
                        ))}
                    </g>
                    <g className="radar-data">
                        <polygon
                            points={nationalPath}
                            className="fill-slate-500/10 stroke-slate-400"
                            strokeWidth="2"
                            strokeDasharray="4 4"
                        />
                         <polygon
                            points={regionalPath}
                            className="fill-indigo-500/20 stroke-indigo-600"
                            strokeWidth="2.5"
                        />
                         {regionalProfile.map((point, i) => {
                             const [x, y] = getCoordinatesForValue(point.value, i);
                             return (
                                <circle key={`region-dot-${i}`} cx={x} cy={y} r="4" className="fill-indigo-600">
                                    <title>{`Wilayah: ${point.axis} - ${point.value}`}</title>
                                </circle>
                             )
                         })}
                          {nationalProfile.map((point, i) => {
                             const [x, y] = getCoordinatesForValue(point.value, i);
                             return (
                                <circle key={`national-dot-${i}`} cx={x} cy={y} r="3" className="fill-slate-400">
                                     <title>{`Nasional: ${point.axis} - ${point.value}`}</title>
                                </circle>
                             )
                         })}
                    </g>
                </svg>
                 <div className="flex items-center justify-center space-x-6 text-sm text-slate-600 mt-2">
                    <div className="flex items-center"><span className="w-3 h-3 rounded-sm bg-indigo-500/80 mr-2"></span>{regionName}</div>
                    <div className="flex items-center"><span className="w-3 h-3 rounded-sm bg-slate-400/80 mr-2"></span>Rata-rata Nasional</div>
                </div>
            </div>
        </div>
    );
};

export default RegionalProfileRadarChart;
