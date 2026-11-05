import React, { useState, useMemo } from 'react';
import { StimulationChecklistItem } from '../../types';

interface StimulationChecklistProps {
    initialItems: StimulationChecklistItem[];
}

const StimulationChecklist: React.FC<StimulationChecklistProps> = ({ initialItems }) => {
    const [items, setItems] = useState(initialItems);

    const handleToggle = (id: string) => {
        setItems(prevItems =>
            prevItems.map(item =>
                item.id === id ? { ...item, completed: !item.completed } : item
            )
        );
    };

    const groupedItems = useMemo(() => {
        return items.reduce((acc, item) => {
            const category = item.category || 'Lainnya';
            (acc[category] = acc[category] || []).push(item);
            return acc;
        }, {} as Record<StimulationChecklistItem['category'], StimulationChecklistItem[]>);
    }, [items]);

    const progress = items.length > 0 ? (items.filter(item => item.completed).length / items.length) * 100 : 0;

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm h-full flex flex-col">
            <h3 className="text-lg font-bold text-slate-800">Checklist Stimulasi Sesuai Usia</h3>
            <p className="text-sm text-slate-500 mb-2">Untuk kelompok usia {initialItems[0]?.ageGroup}</p>
            
            <div className="w-full bg-slate-200 rounded-full h-2.5 my-4">
                <div className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>

            <div className="space-y-4 flex-grow overflow-y-auto pr-2 -mr-2">
                {Object.entries(groupedItems).map(([category, catItems]) => (
                    <div key={category}>
                        <h4 className="font-semibold text-slate-600 text-sm mb-2">{category}</h4>
                        <ul className="space-y-2">
                            {/* Fix: Cast catItems to StimulationChecklistItem[] to resolve typing issue with Object.entries */}
                            {(catItems as StimulationChecklistItem[]).map(item => (
                                <li key={item.id}>
                                    <label className="flex items-center p-3 bg-slate-50 rounded-md hover:bg-slate-100 cursor-pointer transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={item.completed}
                                            onChange={() => handleToggle(item.id)}
                                            className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 shrink-0"
                                        />
                                        <span className={`ml-3 text-sm text-slate-700 ${item.completed ? 'line-through text-slate-400' : ''}`}>
                                            {item.text}
                                        </span>
                                    </label>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StimulationChecklist;