
import React, { useState, useEffect } from 'react';
// FIX: Remove direct import and use DataContext instead.
import { useData } from '../../context/DataContext';
import { RecommendationParams, RiskLevelSelection } from '../../types';
import { LightBulbIcon } from '../icons/Icons';

interface RecommendationGeneratorProps {
    onGenerate: (params: RecommendationParams) => void;
    isLoading: boolean;
}

const RecommendationGenerator: React.FC<RecommendationGeneratorProps> = ({ onGenerate, isLoading }) => {
    // FIX: Get data from the useData context hook.
    const { appData } = useData();
    const domainsData = appData?.domainsData || {};
    const availableRegions = appData?.getAvailableRegions() || [];

    const [domain, setDomain] = useState('');
    const [region, setRegion] = useState('');
    const [riskLevel, setRiskLevel] = useState<RiskLevelSelection>('high-critical');
    const [customPrompt, setCustomPrompt] = useState('');
    
    // FIX: Use useEffect to set initial state once data is loaded.
    useEffect(() => {
        if (availableRegions.length > 0 && !region) {
            setRegion(availableRegions[0].name);
        }
        if (Object.keys(domainsData).length > 0 && !domain) {
            setDomain(Object.keys(domainsData)[0]);
        }
    }, [availableRegions, domainsData, region, domain]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onGenerate({ domain, region, riskLevel, customPrompt });
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <div className="flex-grow">
                <h2 className="text-xl font-bold text-slate-800">Hasilkan Rekomendasi SPRINT</h2>
                <p className="text-sm text-slate-500 mt-1">Gunakan SPRINT AI untuk membuat rencana intervensi strategis.</p>

                <div className="mt-6 space-y-4">
                    <div>
                        <label htmlFor="domain" className="block text-sm font-medium text-slate-700">Domain</label>
                        <select
                            id="domain"
                            value={domain}
                            onChange={(e) => setDomain(e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white text-slate-900"
                        >
                            {Object.keys(domainsData).map(d => <option key={d}>{d}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="region" className="block text-sm font-medium text-slate-700">Region</label>
                        <select
                            id="region"
                            value={region}
                            onChange={(e) => setRegion(e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white text-slate-900"
                        >
                            <option>All Regions</option>
                             {availableRegions.map(r => <option key={r.id}>{r.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Risk Level Priority</label>
                        <fieldset className="mt-2">
                            <div className="flex flex-wrap gap-3">
                                {(['high-critical', 'medium', 'low', 'all'] as RiskLevelSelection[]).map(level => (
                                    <div key={level}>
                                        <input
                                            type="radio"
                                            id={level}
                                            name="riskLevel"
                                            value={level}
                                            checked={riskLevel === level}
                                            onChange={(e) => setRiskLevel(e.target.value as RiskLevelSelection)}
                                            className="sr-only peer"
                                        />
                                        <label htmlFor={level} className="px-3 py-1.5 text-sm font-semibold text-slate-600 border border-slate-300 rounded-full cursor-pointer transition-colors peer-checked:bg-indigo-600 peer-checked:text-white peer-checked:border-indigo-600 hover:bg-slate-100">
                                            {level.replace('-', ' & ').replace(/\b\w/g, l => l.toUpperCase())}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </fieldset>
                    </div>
                    <div>
                        <label htmlFor="customPrompt" className="block text-sm font-medium text-slate-700">Specific Question (Optional)</label>
                        <textarea
                            id="customPrompt"
                            rows={4}
                            value={customPrompt}
                            onChange={(e) => setCustomPrompt(e.target.value)}
                            className="mt-1 block w-full shadow-sm sm:text-sm border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white text-slate-900"
                            placeholder="e.g., How to improve stunting prevention in mountainous areas?"
                        />
                    </div>
                </div>
            </div>

            <div className="mt-8">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                            <span>Generating...</span>
                        </>
                    ) : (
                       <>
                         <LightBulbIcon className="w-5 h-5 mr-2" />
                         <span>Generate Recommendations</span>
                       </>
                    )}
                </button>
            </div>
        </form>
    );
};

export default RecommendationGenerator;
