
import React from 'react';
import { ForecastDataPoint } from '../../types';

interface PredictionChartProps {
  data: ForecastDataPoint[];
  domain: string;
  horizon: string;
  provisional?: boolean;
}

const PredictionChart: React.FC<PredictionChartProps> = ({ data, domain, horizon, provisional = false }) => {
    // A real app would use a library like D3, Chart.js, or Recharts.
    const chartWidth = 500;
    const chartHeight = 250;
    const padding = 40;
    const yMax = 100;

    const getX = (index: number) => {
        const last = data[data.length - 1]?.timeOffset;
        const offset = Number.isInteger(index) ? data[index]?.timeOffset : undefined;
        const ratio = last && offset !== undefined ? offset / last : index / Math.max(1, data.length - 1);
        return padding + ratio * (chartWidth - padding * 2);
    };
    const getY = (value: number) => chartHeight - padding - ((value / yMax) * (chartHeight - padding * 2));

    const actualDataPoints = data.filter(d => d.actual !== null);
    const actualPath = actualDataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p.actual!)}`).join(' ');
    
    const predictedPath = data.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p.predicted)}`).join(' ');
    
    // Path for confidence band area
    const confidenceAreaPath = 
        data.map((p, i) => `L ${getX(i)} ${getY(p.predicted_upper)}`).join(' ').substring(2) + ' ' +
        data.map((p, i) => `L ${getX(data.length - 1 - i)} ${getY(p.predicted_lower)}`).join(' ').substring(2);

    const firstPredictedIndex = data.findIndex(d => d.actual === null);

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4">
                <h3 className="text-lg font-bold text-slate-800 mb-2 sm:mb-0">Prediksi Risiko - {domain} ({horizon})</h3>
                 <div className="flex items-center space-x-4 text-xs text-slate-600">
                    <div className="flex items-center"><span className="w-3 h-0.5 bg-blue-500 mr-2" aria-hidden="true"></span>{provisional ? 'Skor dari data tahunan' : 'Aktual'}</div>
                    <div className="flex items-center"><span className="w-3 h-0.5 border-t-2 border-dashed border-indigo-500 mr-2" aria-hidden="true"></span>Prediksi</div>
                    {!provisional && <div className="flex items-center"><div className="w-3 h-3 bg-indigo-100 mr-2" aria-hidden="true"></div>Rentang Keyakinan</div>}
                </div>
            </div>
            <div className="w-full overflow-x-auto">
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="min-w-[500px] h-auto" preserveAspectRatio="xMidYMid meet" aria-labelledby="chart-title">
                    <title id="chart-title">Grafik Prediksi Risiko untuk {domain} selama {horizon}</title>
                    {/* Y-Axis lines and labels */}
                    {[0, 25, 50, 75, 100].map(val => (
                        <g key={val} role="presentation">
                            <line x1={padding} y1={getY(val)} x2={chartWidth - padding} y2={getY(val)} className="stroke-slate-200" strokeWidth="1" />
                            <text x={padding - 8} y={getY(val) + 4} textAnchor="end" className="fill-slate-500" fontSize="10">{val}</text>
                        </g>
                    ))}

                    {/* X-Axis labels */}
                    {data.map((p, i) => (
                        <text key={p.month} x={getX(i)} y={chartHeight - padding + 15} textAnchor="middle" className="fill-slate-500" fontSize="10">{p.month}</text>
                    ))}

                    {/* Confidence Area Path */}
                    {!provisional && firstPredictedIndex >= 0 && (
                      <path 
                        d={`M ${getX(firstPredictedIndex)} ${getY(data[firstPredictedIndex].predicted_upper)} ${confidenceAreaPath.slice(confidenceAreaPath.indexOf('L', 1))}`}
                        className="fill-indigo-100"
                        stroke="none"
                        aria-label="Rentang keyakinan prediksi"
                      />
                    )}
                    
                    {/* Actual Data Path */}
                    <path d={actualPath} fill="none" className="stroke-blue-500" strokeWidth="2" aria-label="Data risiko aktual" />
                    {actualDataPoints.map((p, i) => (
                        <circle key={`actual-dot-${i}`} cx={getX(i)} cy={getY(p.actual!)} r="3" className="fill-white stroke-blue-500" strokeWidth="2">
                          <title>Bulan: {p.month}, Aktual: {p.actual}</title>
                        </circle>
                    ))}
                    
                    {/* Predicted Data Path */}
                    <path d={predictedPath} fill="none" className="stroke-indigo-500" strokeWidth="2" strokeDasharray="4 4" aria-label="Data risiko prediksi" />
                    {data.map((p, i) => (
                         i >= firstPredictedIndex && 
                         <circle key={`pred-dot-${i}`} cx={getX(i)} cy={getY(p.predicted)} r="3" className="fill-white stroke-indigo-500" strokeWidth="2">
                           <title>{p.month}, Proyeksi: {p.predicted}{!provisional ? ` (Rentang: ${p.predicted_lower}-${p.predicted_upper})` : ''}</title>
                         </circle>
                    ))}

                    {/* Vertical line separating actual from prediction */}
                    {firstPredictedIndex > 0 && (
                        <line 
                            x1={(getX(firstPredictedIndex - 1) + getX(firstPredictedIndex)) / 2}
                            y1={padding} 
                            x2={(getX(firstPredictedIndex - 1) + getX(firstPredictedIndex)) / 2}
                            y2={chartHeight - padding} 
                            className="stroke-slate-300"
                            strokeWidth="1" 
                            strokeDasharray="2 2"
                            aria-label="Batas data aktual dan prediksi"
                        />
                    )}
                </svg>
            </div>
        </div>
    );
};

export default PredictionChart;
