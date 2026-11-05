import React, { useState, useEffect, useMemo } from 'react';
import { DOMAIN_FILTER_ITEMS } from '../constants';
import { getExecutiveBriefing } from '../services/geminiService';
import NationalRiskOverview from './dashboard/RiskAssessment';
import KeyHealthIndicators from './dashboard/KeyHealthIndicators';
import ActiveAlerts from './dashboard/ActiveAlerts';
import ExecutiveBriefing from './dashboard/ExecutiveBriefing';
import RecommendationModal from './dashboard/RecommendationModal';
import { ActiveAlertData, DomainFilter, KeyIndicatorData, InterventionPlan, InterventionPriority, InterventionStatus, Domain } from '../types';
import { useData } from '../context/DataContext';

interface DashboardProps {
    handleOpenInterventionModal: (initialData?: Partial<InterventionPlan>, navigate?: boolean) => void;
}

interface DomainSelectorProps {
    activeDomain: DomainFilter;
    onSelect: (domain: DomainFilter) => void;
}

const DomainSelector: React.FC<DomainSelectorProps> = ({ activeDomain, onSelect }) => (
    <div className="bg-white p-2 rounded-lg shadow-sm flex items-center justify-start space-x-1 overflow-x-auto">
        {DOMAIN_FILTER_ITEMS.map(item => {
            const isActive = activeDomain === item.id;
            return (
                <button
                    key={item.id}
                    onClick={() => onSelect(item.id as DomainFilter)}
                    className={`flex items-center px-3 py-2 sm:px-4 text-sm font-medium rounded-md transition-colors duration-200 whitespace-nowrap ${
                        isActive
                            ? 'bg-indigo-600 text-white shadow'
                            : 'text-gray-600 hover:bg-slate-200'
                    }`}
                >
                    <span className="mr-2">{item.icon}</span>
                    {item.name}
                </button>
            )
        })}
    </div>
);

const Dashboard: React.FC<DashboardProps> = ({ 
    handleOpenInterventionModal
}) => {
    const abortControllerRef = React.useRef<AbortController | null>(null);
    const [activeDomain, setActiveDomain] = useState<DomainFilter>('Semua');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAlert, setSelectedAlert] = useState<ActiveAlertData | null>(null);

    const [briefing, setBriefing] = useState<string | null>(null);
    const [isBriefingLoading, setIsBriefingLoading] = useState(false);
    const [briefingError, setBriefingError] = useState<string | null>(null);
    const [lastAnalyzedDate, setLastAnalyzedDate] = useState<string | null>(null);
    const [, setActionPlan] = useState<any | null>(null); // State requested by user for reset logic

    const formatIndonesianDate = (date: Date) => {
        const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        const d = date.getDate();
        const m = months[date.getMonth()];
        const y = date.getFullYear();
        const h = date.getHours().toString().padStart(2, '0');
        const min = date.getMinutes().toString().padStart(2, '0');
        return `${d} - ${m} - ${y} - ${h}:${min}`;
    };
    


    const { appData, year } = useData();
    if (!appData) return null; // Should be handled by loading screen in App.tsx
    const { allActiveAlerts, keyIndicatorsByDomain, regionsDetails } = appData;

    const filteredIndicators = useMemo((): KeyIndicatorData[] => {
        return keyIndicatorsByDomain[activeDomain];
    }, [activeDomain, keyIndicatorsByDomain]);

    const filteredAlerts = useMemo((): ActiveAlertData[] => {
        if (activeDomain === 'Semua') {
            return allActiveAlerts;
        }
        return allActiveAlerts.filter(alert => alert.domain === activeDomain);
    }, [activeDomain, allActiveAlerts]);

    const dynamicRegionalRiskScores = useMemo(() => {
        const allRegionsData = Object.values(regionsDetails);
        if (activeDomain === 'Semua') {
            return allRegionsData.map(r => ({ name: r.name, score: r.overallRisk }));
        }
        return allRegionsData.filter(r => r.domains[activeDomain as Domain]?.metrics.length > 0).map(r => ({
            name: r.name,
            score: r.domains[activeDomain as Domain]?.riskScore || 0
        }));
    }, [activeDomain, regionsDetails]);


    const fetchBriefing = async (_force = false) => {
        // Cancel any ongoing request before starting a new one
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // Create a new AbortController for the current request
        const controller = new AbortController();
        abortControllerRef.current = controller;
        if (filteredIndicators.length === 0) {
            setBriefing(`Data ${activeDomain} tahun ${year} belum tersedia.`);
            setBriefingError(null);
            setIsBriefingLoading(false);
            return;
        }

        setIsBriefingLoading(true);
        setBriefingError(null);
        setBriefing(null); // Clear previous briefing to show loading
        setLastAnalyzedDate(null);
        
        try {
            const result = await getExecutiveBriefing(
                activeDomain, 
                filteredIndicators, 
                filteredAlerts,
                controller.signal,
                { year, datasets: appData.analysisDatasets?.filter(item => activeDomain === 'Semua' || item.entry.proposedDomain === activeDomain || item.entry.id === 'populasi_aud').map(item => item.data) || [] }
            );
            if (controller.signal.aborted) return;
            setBriefing(result);
            setLastAnalyzedDate(formatIndonesianDate(new Date()));
        } catch (err: any) {
            if (controller.signal.aborted || err.name === 'AbortError') {
                console.log('AI Analysis request was cancelled');
                return;
            }
            setBriefingError(err.message || 'Gagal memuat ringkasan AI.');
            console.error(err);
        } finally {
            if (abortControllerRef.current === controller) {
                setIsBriefingLoading(false);
                abortControllerRef.current = null;
            }
        }
    };


    useEffect(() => {
        // Cancel immediately when the selected domain changes.
        fetchBriefing();
        // Reset action plan when domain changes to avoid confusion
        setActionPlan(null);
        return () => abortControllerRef.current?.abort();
    }, [activeDomain, year]);



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
    }


    return (
        <div className="space-y-6">
            <DomainSelector activeDomain={activeDomain} onSelect={(domain) => setActiveDomain(domain)} />
            {year === 2025 && <p className="text-xs text-slate-500">Data 2025 sesuai tabel yang dikumpulkan; sumber belum seluruhnya diverifikasi. Skor risiko merupakan perhitungan indikator tersedia, bukan prediksi. Tren belum tersedia.</p>}
            
            <ExecutiveBriefing 
                isLoading={isBriefingLoading}
                briefing={briefing}
                error={briefingError}
                onRegenerate={() => fetchBriefing(true)}
                lastAnalyzed={lastAnalyzedDate}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <KeyHealthIndicators data={filteredIndicators} domain={activeDomain} />
                </div>
                 <div className="lg:col-span-1">
                    <NationalRiskOverview data={dynamicRegionalRiskScores} />
                </div>
            </div>
            
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-3">
                    <ActiveAlerts year={year} data={filteredAlerts} onAnalyze={handleAnalyzeClick} onCreatePlan={() => handleOpenInterventionModal({}, true)} />
                </div>
            </div>
            
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

export default Dashboard;
