import React,{ useState } from 'react';
import { sanitizeHtml } from '../../../utils/sanitizeHtml';
import { RESOURCE_TYPES } from '../constants';
import { useData } from '../context/DataContext';
import { generateAllocationSuggestion,generateScenarioAnalysis } from '../services/geminiService';
import { GroundingSource,ResourceData,ResourceItem,ScenarioParams } from '../types';
import { ArrowPathIcon,BriefcaseIcon,LightBulbIcon,LinkIcon,WrenchScrewdriverIcon } from './icons/Icons';

const AllocationSummary: React.FC<{ data: ResourceData }> = ({ data }) => {
    const renderResourceList = (items: ResourceItem[]) => (
        <ul className="space-y-3 mt-3">
            {items.map(item => (
                <li key={item.name} className="text-sm">
                    <div className="flex justify-between font-semibold text-slate-700">
                        <span>{item.name}</span>
                        <span>{item.needed.toLocaleString('id-ID')} <span className="text-xs text-slate-500 font-normal">{item.unit}</span></span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1">
                        <div className={`h-1.5 rounded-full ${item.color.replace('text', 'bg')}`} style={{ width: `${(item.current / item.forecast) * 100}%` }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 mt-0.5">
                        <span>Current: {item.current.toLocaleString('id-ID')}</span>
                        <span>Forecast: {item.forecast.toLocaleString('id-ID')}</span>
                    </div>
                </li>
            ))}
        </ul>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {RESOURCE_TYPES.map(type => (
                <div key={type.id} className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center">
                        {type.icon}
                        <h3 className="ml-3 text-lg font-bold text-slate-800">{type.name}</h3>
                    </div>
                    {renderResourceList(data[type.id.toLowerCase() as keyof ResourceData])}
                </div>
            ))}
        </div>
    );
};

const SourceList: React.FC<{ sources: GroundingSource[] }> = ({ sources }) => {
    if (!sources || sources.length === 0) return null;

    return (
        <div className="mt-6 pt-4 border-t border-slate-200">
            <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center">
                <LinkIcon className="w-4 h-4 mr-2" />
                Sumber Informasi (berdasarkan Google Search)
            </h4>
            <ul className="space-y-2">
                {sources.map((source, index) => (
                    source.web && <li key={index} className="bg-slate-50 p-2 rounded-md">
                        <a
                            href={source.web.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline flex items-start group"
                        >
                            <span className="font-semibold mr-2 text-indigo-500">{index + 1}.</span>
                            <span className="group-hover:text-indigo-800 transition-colors">{source.web.title}</span>
                        </a>
                        <p className="text-xs text-slate-500 ml-6 truncate">{source.web.uri}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};


const AllocationOptimizer: React.FC<{ resourceData: ResourceData, riskRegions: string[] }> = ({ resourceData, riskRegions }) => {
    const [budget, setBudget] = useState(25); // in Miliar IDR
    const [isLoading, setIsLoading] = useState(false);
    const [suggestion, setSuggestion] = useState<{ content: string, sources: GroundingSource[] } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [cooldown, setCooldown] = useState(false);
    const abortControllerRef = React.useRef<AbortController | null>(null);


    const handleGenerate = async () => {
        // SOP 1: Audit Component Lifecycle
        if (isLoading || cooldown) return;

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        setIsLoading(true);
        setError(null);
        try {
            const result = await generateAllocationSuggestion(budget, resourceData, riskRegions);
            setSuggestion(result);
            
            // SOP: 2s cooldown
            setCooldown(true);
            setTimeout(() => setCooldown(false), 2000);
        } catch (err: any) {
            if (err.name === 'AbortError') return;
            setError('Gagal menghasilkan rekomendasi alokasi.');
        } finally {
            setIsLoading(false);
            abortControllerRef.current = null;
        }
    };


    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 flex items-center mb-4">
                <LightBulbIcon className="w-6 h-6 mr-2 text-yellow-500" />
                AI-Powered Allocation Optimizer
            </h3>
            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-slate-50 rounded-lg border">
                <div className="w-full sm:w-auto">
                    <label htmlFor="budget" className="block text-sm font-medium text-slate-700">Total Budget (Miliar IDR)</label>
                    <input
                        type="number"
                        id="budget"
                        value={budget}
                        onChange={(e) => setBudget(Number(e.target.value))}
                        className="mt-1 block w-full sm:w-40 pl-3 pr-1 py-2 text-base border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white text-slate-900"
                        min="1"
                    />
                </div>
                <button
                    onClick={handleGenerate}
                    disabled={isLoading || cooldown}
                    className="w-full sm:w-auto mt-2 sm:mt-5 flex items-center justify-center px-6 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 disabled:bg-indigo-400"
                >
                </button>
            </div>

            {isLoading && (
                <div className="flex flex-col items-center justify-center h-48">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
                    <p className="mt-4 text-gray-600 text-sm">Menghitung alokasi optimal...</p>
                </div>
            )}
            {error && <p className="text-red-500 text-center mt-4">{error}</p>}
            {suggestion && (
                <div className="mt-4 pt-4 border-t">
                    <div
                        className="prose prose-sm max-w-none text-gray-700"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(suggestion.content.replace(/\n/g, '<br />')) }}
                    />
                    <SourceList sources={suggestion.sources} />
                </div>
            )}
        </div>
    );
};

const ScenarioPlanner: React.FC = () => {
    const [params, setParams] = useState<ScenarioParams>({ budgetChange: 15, sdmFocus: 'Gizi', regionFocus: 'High Risk' });
    const [isLoading, setIsLoading] = useState(false);
    const [analysis, setAnalysis] = useState<{ content: string, sources: GroundingSource[] } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [cooldown, setCooldown] = useState(false);
    const abortControllerRef = React.useRef<AbortController | null>(null);

    const handleGenerate = async () => {

        // SOP 1: Audit Component Lifecycle
        if (isLoading || cooldown) return;

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        setIsLoading(true);
        setError(null);
        try {
            const result = await generateScenarioAnalysis(params);
            setAnalysis(result);
            
            // SOP: 2s cooldown
            setCooldown(true);
            setTimeout(() => setCooldown(false), 2000);
        } catch (err: any) {
            if (err.name === 'AbortError') return;
            setError('Gagal menghasilkan analisis skenario.');
        } finally {
            setIsLoading(false);
            abortControllerRef.current = null;
        }
    };

    
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 flex items-center mb-4">
                <WrenchScrewdriverIcon className="w-6 h-6 mr-2 text-sky-500" />
                "What-If" Scenario Analysis
            </h3>
            <div className="space-y-4 p-4 bg-slate-50 rounded-lg border">
                <div>
                    <label htmlFor="budgetChange" className="block text-sm font-medium text-slate-700">Perubahan Anggaran: <span className="font-bold text-indigo-600">{params.budgetChange > 0 && '+'}{params.budgetChange}%</span></label>
                    <input id="budgetChange" type="range" min="-50" max="50" step="5" value={params.budgetChange} onChange={(e) => setParams(p => ({ ...p, budgetChange: Number(e.target.value) }))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer mt-1" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Fokus Prioritas SDM</label>
                        <select value={params.sdmFocus} onChange={(e) => setParams(p => ({ ...p, sdmFocus: e.target.value as ScenarioParams['sdmFocus'] }))} className="w-full text-sm border-slate-300 rounded-md bg-white text-slate-900">
                            <option>Kesehatan</option>
                            <option>Gizi</option>
                            <option>Semua</option>
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Fokus Wilayah</label>
                        <select value={params.regionFocus} onChange={(e) => setParams(p => ({ ...p, regionFocus: e.target.value as ScenarioParams['regionFocus'] }))} className="w-full text-sm border-slate-300 rounded-md bg-white text-slate-900">
                            <option>High Risk</option>
                            <option>All</option>
                        </select>
                    </div>
                </div>
                 <button
                    onClick={handleGenerate}
                    disabled={isLoading || cooldown}
                    className="w-full mt-2 flex items-center justify-center px-6 py-2 text-sm font-semibold text-white bg-sky-600 rounded-lg shadow-sm hover:bg-sky-700 disabled:bg-sky-400"
                >
                    {isLoading ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : cooldown ? 'Wait...' : 'Analyze Scenario'}
                </button>

            </div>
            {isLoading && (
                <div className="flex flex-col items-center justify-center h-48">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-500"></div>
                    <p className="mt-4 text-gray-600 text-sm">Menganalisis dampak skenario...</p>
                </div>
            )}
            {error && <p className="text-red-500 text-center mt-4">{error}</p>}
            {analysis && (
                <div className="mt-4 pt-4 border-t">
                    <div
                        className="prose prose-sm max-w-none text-gray-700"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(analysis.content.replace(/\n/g, '<br />')) }}
                    />
                    <SourceList sources={analysis.sources} />
                </div>
            )}
        </div>
    );
};


const ResourceAllocation: React.FC = () => {
    const { appData } = useData();
    if (!appData) return null;
    const { mockResourceData, regionalRiskScores } = appData;

    const highestRiskRegions = regionalRiskScores
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map(r => r.name);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-slate-800 flex items-center">
                    <BriefcaseIcon className="w-6 h-6 mr-3" />
                    Resource Allocation Optimization
                </h2>
                <p className="text-sm text-slate-500 mt-1">Gunakan AI untuk merencanakan dan mengoptimalkan alokasi sumber daya secara efisien.</p>
            </div>

            <h3 className="text-base font-bold text-slate-600 uppercase tracking-wider border-b pb-2">Demand Forecasting Summary</h3>
            <AllocationSummary data={mockResourceData} />
            
            <h3 className="text-base font-bold text-slate-600 uppercase tracking-wider border-b pb-2 pt-4">Decision Support Tools</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AllocationOptimizer resourceData={mockResourceData} riskRegions={highestRiskRegions} />
                <ScenarioPlanner />
            </div>
        </div>
    );
};

export default ResourceAllocation;
