import React from 'react';
import { DOMAIN_ITEMS } from '../../constants';

interface DomainTabsProps {
    domains: string[];
    selectedDomain: string;
    setSelectedDomain: (domainId: string) => void;
}

const DomainTabs: React.FC<DomainTabsProps> = ({ domains, selectedDomain, setSelectedDomain }) => {
    return (
        <div>
            <div className="sm:hidden">
                <label htmlFor="tabs" className="sr-only">Select a domain</label>
                <select
                    id="tabs"
                    name="tabs"
                    className="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    onChange={(e) => setSelectedDomain(e.target.value)}
                    value={selectedDomain}
                >
                    {domains.map(domain => (
                        <option key={domain}>{domain}</option>
                    ))}
                </select>
            </div>
            <div className="hidden sm:block">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        {domains.map(domain => {
                             const domainInfo = DOMAIN_ITEMS.find(d => d.name === domain);
                             const isActive = domain === selectedDomain;
                             return (
                                <button
                                    key={domain}
                                    onClick={() => setSelectedDomain(domain)}
                                    className={`whitespace-nowrap flex py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                        isActive
                                        ? 'border-indigo-500 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    {domainInfo?.icon}
                                    <span className="ml-2">{domain}</span>
                                </button>
                             )
                        })}
                    </nav>
                </div>
            </div>
        </div>
    );
};

export default DomainTabs;
