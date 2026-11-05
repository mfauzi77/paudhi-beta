import React from 'react';
import { PlayIcon, CpuChipIcon, ArrowPathIcon, ShieldCheckIcon } from '../icons/Icons';

const ManualJobs: React.FC = () => {

    const handleJobClick = (jobName: string) => {
        // In a real app, this would trigger an API call.
        // We'll just log to the console for this demo.
        alert(`Job started: "${jobName}"`);
        console.log(`Job started: "${jobName}"`);
    };

    const JobButton: React.FC<{ jobName: string, icon: React.ReactNode, description: string }> = ({ jobName, icon, description }) => (
        <button 
            onClick={() => handleJobClick(jobName)}
            className="w-full text-left p-3 flex items-center bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 group"
        >
            <div className="bg-indigo-100 p-2 rounded-full mr-4">
                {icon}
            </div>
            <div>
                <p className="font-semibold text-sm text-slate-800">{jobName}</p>
                <p className="text-xs text-slate-500">{description}</p>
            </div>
             <PlayIcon className="ml-auto w-5 h-5 text-slate-400 group-hover:text-indigo-600"/>
        </button>
    );

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                <CpuChipIcon className="w-6 h-6 mr-2 text-indigo-500" />
                Manual Data Jobs
            </h3>
            <div className="space-y-3">
                <JobButton 
                    jobName="Run Full Data Pipeline" 
                    icon={<PlayIcon className="w-5 h-5 text-indigo-600" />} 
                    description="Sync all sources, aggregate, and recalculate."
                />
                 <JobButton 
                    jobName="Recalculate Risk Scores" 
                    icon={<ArrowPathIcon className="w-5 h-5 text-indigo-600" />} 
                    description="Update all risk scores based on latest data."
                />
                 <JobButton 
                    jobName="Validate Data Integrity" 
                    icon={<ShieldCheckIcon className="w-5 h-5 text-indigo-600" />} 
                    description="Check for anomalies and inconsistencies."
                />
            </div>
        </div>
    );
};

export default ManualJobs;
