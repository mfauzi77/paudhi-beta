import React, { useState, useEffect, useMemo } from 'react';
import { getRegionalAnalysisInsight } from '../services/geminiService';
import { RegionDetailData, ActiveAlertData, InterventionPlan, InterventionPriority, InterventionStatus, Domain } from '../types';

import RegionSummary from './dataperwilayah/RegionSummary';
import DomainBreakdown from './dataperwilayah/DomainBreakdown';
import ActiveAlerts from './dashboard/ActiveAlerts';
import RecommendationModal from './dashboard/RecommendationModal';
import RegionalAnalysisInsight from './dataperwilayah/RegionalAnalysisInsight';
import RegionalProfileRadarChart from './dataperwilayah/RegionalProfileRadarChart';
import RegionalForecastTrendChart, { ForecastTrendPoint } from './dataperwilayah/RegionalForecastTrendChart';
import { useData } from '../context/DataContext';

interface DataPerWilayahProps {
    handleOpenInterventionModal: (initialData?: Partial<InterventionPlan>, navigate?: boolean) => void;
    navigationContext: { regionId: string; kabupatenKotaId?: string } | null;
    onContextHandled: () => void;
}

const DataPerWilayah: React.FC<DataPerWilayahProps> = ({ handleOpenInterventionModal, navigationContext, onContextHandled }) => {
    const abortControllerRef = React.useRef<AbortController | null>(null);
    const { appData, year } = useData();
    if (!appData) return null; // Should be handled by loading screen
    const { getAvailableRegions, getRegionDetails, nationalHistoricalRisk, allActiveAlerts, domainsData } = appData;

    const [regions, setRegions] = useState<{id: string, name: string}[]>([]);
    const [selectedRegionId, setSelectedRegionId] = useState<string>('');
    const [regionData, setRegionData] = useState<RegionDetailData | null>(null);
    const [regionalAlerts, setRegionalAlerts] = useState<ActiveAlertData[]>([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAlert, setSelectedAlert] = useState<ActiveAlertData | null>(null);

    const [insight, setInsight] = useState<string | null>(null);
    const [isInsightLoading, setIsInsightLoading] = useState(false);
    const [insightError, setInsightError] = useState<string | null>(null);
    const [lastAnalyzedDate, setLastAnalyzedDate] = useState<string | null>(null);

    const formatIndonesianDate = (date: Date) => {
        const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        const d = date.getDate();
        const m = months[date.getMonth()];
        const y = date.getFullYear();
        const h = date.getHours().toString().padStart(2, '0');
        const min = date.getMinutes().toString().padStart(2, '0');
        return `${d} - ${m} - ${y} - ${h}:${min}`;
    };


    // Effect for handling external navigation context
    useEffect(() => {
        if (navigationContext) {
            setSelectedRegionId(navigationContext.regionId);
            window.scrollTo(0, 0);
            onContextHandled();
        }
    }, [navigationContext, onContextHandled]);

    // Effect for initializing component and loading regions list
    useEffect(() => {
        const availableRegions = getAvailableRegions();
        setRegions(availableRegions);
        if (availableRegions.length > 0 && !selectedRegionId) {
            const defaultRegion = availableRegions.find(r => r.id === 'jawa-barat') || availableRegions[0];
            setSelectedRegionId(defaultRegion.id);
        }
    }, [getAvailableRegions, selectedRegionId]);

    const fetchInsight = async (data: RegionDetailData, _force = false) => {
        // Cancel any ongoing request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        const controller = new AbortController();
        abortControllerRef.current = controller;

        if (!data) return;

        setIsInsightLoading(true);
        setInsightError(null);
        setInsight(null); // Clear previous insight to show loading state
        setLastAnalyzedDate(null);

        try {
            const result = await getRegionalAnalysisInsight(data, controller.signal);
            if (controller.signal.aborted) return;
            setInsight(result);
            setLastAnalyzedDate(formatIndonesianDate(new Date()));
        } catch (err: any) {
            if (controller.signal.aborted || err.name === 'AbortError') return;
            setInsightError(err.message || 'Gagal memuat analisis AI.');
        } finally {
            if (abortControllerRef.current === controller) {
                setIsInsightLoading(false);
                abortControllerRef.current = null;
            }
        }
    };


    // Effect for fetching data when selected PROVINCE changes
    useEffect(() => {
        if (selectedRegionId) {
            const data = getRegionDetails(selectedRegionId);
            setRegionData(data);
            
            if (data) {
                const alerts = allActiveAlerts.filter(a => a.region === data.name);
                setRegionalAlerts(alerts);
                fetchInsight(data);
            } else {
                setRegionalAlerts([]);
            }
        }
        return () => abortControllerRef.current?.abort();
    }, [selectedRegionId, getRegionDetails, allActiveAlerts]);

    
    const { regionalProfile, nationalProfile } = useMemo(() => {
        const regional: { axis: Domain; value: number }[] = [];
        const national: { axis: Domain; value: number }[] = [];

        if (regionData) {
            (Object.keys(regionData.domains) as Domain[]).forEach(domainKey => {
                regional.push({ axis: domainKey, value: regionData.domains[domainKey].riskScore });
                national.push({ axis: domainKey, value: domainsData[domainKey]?.averageRisk || 0 });
            });
        }
        return { regionalProfile: regional, nationalProfile: national };
    }, [regionData, domainsData]);
    
    const forecastTrendData = useMemo((): ForecastTrendPoint[] => {
        if (!regionData || !regionData.historicalRisk || regionData.historicalRisk.length === 0) return [];
        
        const regionHistory = regionData.historicalRisk;
        const nationalHistory = nationalHistoricalRisk || [];
        
        const regionalTrend = regionHistory.length > 1 
            ? regionHistory[regionHistory.length - 1].score - regionHistory[regionHistory.length - 2].score 
            : 0;
            
        const nationalTrend = nationalHistory.length > 1 
            ? nationalHistory[nationalHistory.length - 1].score - nationalHistory[nationalHistory.length - 2].score 
            : 0;
            
        const historicalData: ForecastTrendPoint[] = regionHistory.map((rh, index) => ({
            month: rh.month,
            regionalActual: rh.score, regionalPredicted: rh.score,
            nationalActual: nationalHistory[index]?.score || null, nationalPredicted: nationalHistory[index]?.score || 0,
        }));
        
        const lastRegionalPoint = regionHistory[regionHistory.length - 1];
        const lastNationalPoint = nationalHistory.length > 0 ? nationalHistory[nationalHistory.length - 1] : { score: 0 };
        
        const predictionMonths = ['Jul', 'Agu', 'Sep'];
        const predictedData: ForecastTrendPoint[] = predictionMonths.map((month, i) => {
            const nextRegionalScore = Math.max(0, Math.min(100, (lastRegionalPoint?.score || 0) + (regionalTrend * (i + 1))));
            const nextNationalScore = Math.max(0, Math.min(100, (lastNationalPoint?.score || 0) + (nationalTrend * (i + 1))));
            return {
                month: month, regionalActual: null, regionalPredicted: parseFloat(nextRegionalScore.toFixed(1)),
                nationalActual: null, nationalPredicted: parseFloat(nextNationalScore.toFixed(1)),
            };
        });
        return [...historicalData, ...predictedData];
    }, [regionData, nationalHistoricalRisk]);
    
    const handleAnalyzeClick = (alert: ActiveAlertData) => {
        setSelectedAlert(alert);
        setIsModalOpen(true);
    };

    const handleCreatePlanFromAlert = (alert: ActiveAlertData) => {
        const initialData: Partial<InterventionPlan> = {
            title: `Rencana Intervensi untuk ${alert.title} di ${alert.region}`,
            description: `Menindaklanjuti alert "${alert.title}" dengan skor risiko ${alert.riskScore}.`,
            region: alert.region,
            domain: alert.domain,
            priority: alert.level === 'CRITICAL' || alert.level === 'HIGH' ? InterventionPriority.High : InterventionPriority.Medium,
            relatedAlertId: alert.id,
            status: InterventionStatus.Planning
        };
        handleOpenInterventionModal(initialData, true);
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center">
                 <div>
                    <h2 className="text-xl font-bold text-slate-800">Analisis Mendalam per Wilayah</h2>
                    <p className="text-sm text-slate-500 mt-1">Pilih wilayah dari daftar untuk melihat detail profil risikonya.</p>
                </div>
                <div className="mt-4 sm:mt-0">
                    <label htmlFor="region-select" className="sr-only">Pilih Wilayah</label>
                    <select
                        id="region-select"
                        value={selectedRegionId}
                        onChange={(e) => {
                            setSelectedRegionId(e.target.value);
                            setInsight(null); // Clear previous insight
                        }}
                        className="bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:w-64 p-2.5"
                    >
                        {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>

                </div>
            </div>

            {regionData ? (
                <div className="space-y-6">
                    <RegionSummary data={regionData} alertsCount={regionalAlerts.length} />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                           <RegionalProfileRadarChart 
                                regionName={regionData.name}
                                regionalProfile={regionalProfile}
                                nationalProfile={nationalProfile}
                           />
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <RegionalForecastTrendChart 
                                regionName={regionData.name} 
                                data={forecastTrendData}
                            />
                        </div>
                    </div>
                    <DomainBreakdown domains={regionData.domains} />
                    <RegionalAnalysisInsight
                        isLoading={isInsightLoading} insight={insight} error={insightError}
                        onRegenerate={() => fetchInsight(regionData!, true)}
                        lastAnalyzed={lastAnalyzedDate}
                    />
                    <ActiveAlerts 
                        year={year}
                        data={regionalAlerts} onAnalyze={handleAnalyzeClick} 
                        onCreatePlan={() => handleOpenInterventionModal(undefined, true)} 
                    />
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-lg shadow-sm">
                    <p className="text-slate-500">Memuat data wilayah...</p>
                </div>
            )}
            
            {selectedAlert && (
                 <RecommendationModal 
                    isOpen={isModalOpen} 
                    onClose={() => setIsModalOpen(false)}
                    alert={selectedAlert}
                    onCreatePlan={handleCreatePlanFromAlert}
                 />
            )}
        </div>
    );
};

export default DataPerWilayah;
