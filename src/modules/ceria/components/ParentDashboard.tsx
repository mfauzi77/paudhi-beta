import React, { useState } from 'react';
import ChildProfileCard from './parent/ChildProfileCard';
import UpcomingSchedule from './parent/UpcomingSchedule';
import GrowthChart from './parent/GrowthChart';
import StimulationChecklist from './parent/StimulationChecklist';
import PersonalizedInsight from './parent/PersonalizedInsight';
import { useData } from '../context/DataContext';

const ParentDashboard: React.FC = () => {
    const { appData } = useData();
    if (!appData) return null;
    const { mockParentData } = appData;

    const [data] = useState(mockParentData);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Dashboard Orang Tua</h2>
                <p className="text-sm text-slate-500 mt-1">Selamat datang! Pantau tumbuh kembang {data.childProfile.name} di sini.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <ChildProfileCard profile={data.childProfile} />
                    <UpcomingSchedule events={data.upcomingEvents} />
                </div>
                <div className="lg:col-span-2 space-y-6">
                    <GrowthChart history={data.growthHistory} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                     <StimulationChecklist initialItems={data.stimulationChecklist} />
                </div>
                 <div className="lg:col-span-1">
                     <PersonalizedInsight 
                        childProfile={data.childProfile} 
                        latestGrowth={data.growthHistory[data.growthHistory.length - 1] || null} 
                    />
                </div>
            </div>

        </div>
    );
};

export default ParentDashboard;
