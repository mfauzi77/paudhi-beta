import React from 'react';
import { ShieldCheckIcon } from '../icons/Icons';

const CircularProgress: React.FC<{ percentage: number; color: string }> = ({ percentage, color }) => {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative w-32 h-32">
            <svg className="w-full h-full" viewBox="0 0 120 120">
                <circle
                    className="text-slate-200"
                    strokeWidth="10"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="60"
                    cy="60"
                />
                <circle
                    className={color}
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="60"
                    cy="60"
                    transform="rotate(-90 60 60)"
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-slate-700">{percentage}%</span>
            </div>
        </div>
    );
};


const DataQuality: React.FC = () => {
    // Mock data for the quality metrics
    const qualityStats = {
        completeness: 98.5,
        timeliness: 95,
        validation: 99.8,
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                <ShieldCheckIcon className="w-6 h-6 mr-2 text-indigo-500" />
                Data Quality Overview
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="flex flex-col items-center p-4 bg-slate-50 rounded-lg">
                    <CircularProgress percentage={qualityStats.completeness} color="text-emerald-500" />
                    <p className="mt-3 font-semibold text-slate-700">Overall Completeness</p>
                    <p className="text-xs text-slate-500">Percentage of records with no missing values.</p>
                </div>
                 <div className="flex flex-col items-center p-4 bg-slate-50 rounded-lg">
                    <CircularProgress percentage={qualityStats.timeliness} color="text-sky-500" />
                    <p className="mt-3 font-semibold text-slate-700">Data Timeliness</p>
                    <p className="text-xs text-slate-500">Percentage of data updated within the last 7 days.</p>
                </div>
                 <div className="flex flex-col items-center p-4 bg-slate-50 rounded-lg">
                    <CircularProgress percentage={qualityStats.validation} color="text-indigo-500" />
                    <p className="mt-3 font-semibold text-slate-700">Validation Success</p>
                    <p className="text-xs text-slate-500">Percentage of records passing quality rules.</p>
                </div>
            </div>
        </div>
    );
};

export default DataQuality;
