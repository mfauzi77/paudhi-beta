import React from 'react';
import { GrowthRecord } from '../../types';

const GrowthChart: React.FC<{ history: GrowthRecord[] }> = ({ history }) => {
    const chartWidth = 500;
    const chartHeight = 250;
    const padding = 40;
    const yMax = Math.ceil(Math.max(20, ...history.map(h => h.weight)) / 2) * 2; // Dynamic Y-axis, rounded to nearest 2
    const xMax = Math.max(36, ...history.map(h => h.ageInMonths));
    const xMin = Math.min(...history.map(h => h.ageInMonths));

    // Ensure there's a range to prevent division by zero
    const xRange = (xMax - xMin) > 0 ? (xMax - xMin) : 1;

    const getX = (age: number) => padding + ((age - xMin) / xRange) * (chartWidth - padding * 2);
    const getY = (weight: number) => chartHeight - padding - ((weight / yMax) * (chartHeight - padding * 2));

    const path = history.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(p.ageInMonths)} ${getY(p.weight)}`).join(' ');

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Grafik Pertumbuhan (Berat Badan)</h3>
            <div className="w-full overflow-x-auto">
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="xMidYMid meet" aria-labelledby="chart-title-parent">
                    <title id="chart-title-parent">Grafik Pertumbuhan Berat Badan Anak</title>
                    {/* Y-Axis labels */}
                    {Array.from({ length: 5 }, (_, i) => Math.round(yMax / 4 * i)).map(val => (
                        <g key={`y-${val}`}>
                            <line x1={padding} y1={getY(val)} x2={chartWidth - padding} y2={getY(val)} className="stroke-slate-200" strokeWidth="1" />
                            <text x={padding - 8} y={getY(val) + 4} textAnchor="end" className="fill-slate-500" fontSize="10">{val} kg</text>
                        </g>
                    ))}
                    {/* X-Axis labels */}
                    {history.map(p => (
                        <text key={`x-${p.ageInMonths}`} x={getX(p.ageInMonths)} y={chartHeight - padding + 15} textAnchor="middle" className="fill-slate-500" fontSize="10">{p.ageInMonths} bln</text>
                    ))}
                    {/* Data Path */}
                    <path d={path} fill="none" className="stroke-indigo-500" strokeWidth="2.5" />
                    {history.map((p, i) => (
                        <circle key={`dot-${i}`} cx={getX(p.ageInMonths)} cy={getY(p.weight)} r="3.5" className="fill-white stroke-indigo-500" strokeWidth="2">
                           <title>Usia: {p.ageInMonths} bulan, Berat: {p.weight} kg</title>
                        </circle>
                    ))}
                </svg>
            </div>
        </div>
    );
};

export default GrowthChart;
