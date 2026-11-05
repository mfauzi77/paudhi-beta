
import React from 'react';
import { ApiIntegration,SyncLog } from '../../types';
import { useData } from '../../context/DataContext';
import {
ArrowPathIcon,
CheckCircleIcon,
ListBulletIcon
} from '../icons/Icons';

interface PipelineMonitoringProps {
    apis: ApiIntegration[];
}

const mockLogs: SyncLog[] = [
    { id: '1', apiId: '1', timestamp: '11 Mar 2026 09:00:15', status: 'Success', message: 'BPS Dataset: Prevalensi Stunting successfully normalized and stored.' },
    { id: '2', apiId: '1', timestamp: '11 Mar 2026 08:58:40', status: 'Success', message: 'Fetching BPS data points for year 2024 (ID: 124).' },
    { id: '3', apiId: '2', timestamp: '11 Mar 2026 08:45:10', status: 'Running', message: 'Connecting to Kemenkes SatuSehat FHIR API...' },
    { id: '4', apiId: '3', timestamp: '10 Mar 2026 23:30:00', status: 'Failed', message: 'ERR_TIMEOUT: Gateway timeout when reaching DAPODIK API.' },
    { id: '5', apiId: '1', timestamp: '10 Mar 2026 02:00:00', status: 'Success', message: 'Daily automated sync for BPS completed.' },
    { id: '6', apiId: '2', timestamp: '09 Mar 2026 15:45:22', status: 'Failed', message: 'ERR_AUTH: Invalid API Key provided for Kemenkes endpoint.' },
];

const PipelineMonitoring: React.FC<PipelineMonitoringProps> = ({ apis }) => {
    const { year } = useData();
    return (
        <div className="flex flex-col bg-slate-900 rounded-[2rem] overflow-hidden border border-slate-800 shadow-2xl">
            <div className="px-8 py-6 bg-slate-800/50 border-b border-slate-800 flex justify-between items-center">
                <div className="flex items-center">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center mr-3">
                        <ListBulletIcon className="w-4 h-4 text-indigo-400" />
                    </div>
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Global Pipeline Logs</h3>
                </div>
                <div className="flex space-x-2">
                    <span className="flex items-center px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                        <CheckCircleIcon className="w-3 h-3 mr-1" />
                        Online
                    </span>
                    <span className="flex items-center px-2 py-1 rounded-md bg-indigo-500/10 text-indigo-400 text-[10px] font-bold uppercase tracking-tighter">
                        Worker #42
                    </span>
                </div>
            </div>
            
            <div className="p-4 space-y-1 font-mono text-[11px] max-h-[400px] overflow-y-auto custom-scrollbar">
                {(year === 2025 ? [] : mockLogs).map((log) => (
                    <div key={log.id} className="group flex items-start space-x-4 py-1.5 px-4 hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-white/5">
                        <span className="text-slate-500 whitespace-nowrap pt-0.5">{log.timestamp}</span>
                        <span className={`font-black tracking-tighter w-16 text-center py-0.5 rounded px-1 shrink-0 ${
                            log.status === 'Success' ? 'bg-emerald-500/10 text-emerald-400' :
                            log.status === 'Failed' ? 'bg-rose-500/10 text-rose-400' :
                            'bg-indigo-500/10 text-indigo-400 animate-pulse'
                        }`}>
                            [{log.status.toUpperCase()}]
                        </span>
                        <span className="text-slate-300 leading-relaxed">
                            {apis.find(a => a.id === log.apiId)?.name || 'System'}: {log.message}
                        </span>
                    </div>
                ))}
            </div>

            <div className="px-8 py-4 bg-slate-800/30 border-t border-slate-800 flex justify-center">
                <button className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors flex items-center">
                    <ArrowPathIcon className="w-3 h-3 mr-2" />
                    Load More Logs
                </button>
            </div>
        </div>
    );
};

export default PipelineMonitoring;
