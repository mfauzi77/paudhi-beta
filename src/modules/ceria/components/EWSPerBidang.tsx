import React, { useState, useEffect } from 'react';
import { DomainData } from '../types';
import DomainTabs from './ewsperbidang/DomainTabs';
import DomainSummary from './ewsperbidang/DomainSummary';
import RegionRankingList from './ewsperbidang/RegionRankingList';
import DomainTopAlerts from './ewsperbidang/DomainTopAlerts';
import DomainIndicatorTable from './ewsperbidang/DomainIndicatorTable';
import RiskMomentumQuadrant from './ewsperbidang/RiskMomentumQuadrant';
import { useData } from '../context/DataContext';

const EWSPerBidang: React.FC = () => {
    const { appData } = useData();
    if (!appData) return null;
    const { getDomainData, domainsData } = appData;

    const domainIds = Object.keys(domainsData);
    const [selectedDomainId, setSelectedDomainId] = useState<string>(domainIds[0]);
    const [domainData, setDomainData] = useState<DomainData | null>(null);

    useEffect(() => {
        const data = getDomainData(selectedDomainId);
        setDomainData(data);
    }, [selectedDomainId, getDomainData]);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-slate-800">Analisis per Bidang</h2>
                <p className="text-sm text-slate-500 mt-1">Analisis perbandingan risiko antar wilayah untuk setiap bidang layanan.</p>
            </div>
            
            <DomainTabs 
                domains={domainIds}
                selectedDomain={selectedDomainId}
                setSelectedDomain={setSelectedDomainId}
            />

            {domainData && domainData.indicators.length > 0 ? (
                <div className="space-y-6">
                    <DomainSummary data={domainData} />
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm">
                           <RiskMomentumQuadrant regions={domainData.regions} />
                        </div>
                        <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-sm">
                            <RegionRankingList regions={domainData.regions} />
                        </div>
                    </div>

                    <DomainIndicatorTable indicators={domainData.indicators} />
                    <DomainTopAlerts alerts={domainData.topAlerts} domainName={domainData.name} />
                </div>
            ) : (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                    <p>Data bidang ini belum tersedia untuk tahun yang dipilih.</p>
                </div>
            )}
        </div>
    );
};

export default EWSPerBidang;
