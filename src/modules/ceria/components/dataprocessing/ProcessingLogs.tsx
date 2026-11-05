
import React from 'react';
// FIX: Remove direct import from mockData and use the DataContext instead.
import { useData } from '../../context/DataContext';
import { LogLevel } from '../../types';
import { CommandLineIcon } from '../icons/Icons';

const ProcessingLogs: React.FC = () => {
    // FIX: Get data from the useData context hook.
    const { appData } = useData();
    const processingLogs = appData?.processingLogs || [];

    const getLevelColor = (level: LogLevel): string => {
        switch (level) {
            case 'INFO': return 'text-sky-600';
            case 'WARN': return 'text-amber-600';
            case 'ERROR': return 'text-red-600';
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm h-full flex flex-col">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                <CommandLineIcon className="w-6 h-6 mr-2 text-indigo-500" />
                Recent Processing Logs
            </h3>
            <div className="font-mono text-xs bg-slate-100 p-4 rounded-md flex-grow overflow-y-auto h-72 md:h-96">
                {processingLogs.map((log, index) => (
                    <div key={index} className="flex">
                        <span className="text-slate-500 mr-3">{log.timestamp}</span>
                        <span className={`font-bold w-12 ${getLevelColor(log.level)}`}>[{log.level}]</span>
                        <p className="flex-1 whitespace-pre-wrap text-slate-700">{log.message}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProcessingLogs;
