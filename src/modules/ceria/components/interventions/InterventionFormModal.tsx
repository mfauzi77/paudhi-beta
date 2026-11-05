import React, { useState, useEffect, useMemo } from 'react';
import { InterventionPlan, InterventionStatus, InterventionPriority, Domain, ActionItem } from '../../types';
import { DOMAIN_ITEMS } from '../../constants';
import { BeakerIcon, ChevronDownIcon, ChevronUpIcon, SwitchVerticalIcon, DocumentPlusIcon } from '../icons/Icons';
import { useData } from '../../context/DataContext';

type SortKey = 'default' | 'completed' | 'dueDate';
type SortDirection = 'asc' | 'desc';

interface InterventionFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (plan: Omit<InterventionPlan, 'id'> & { id?: string; actionItems: ActionItem[] }) => void;
    initialData?: Partial<InterventionPlan> | null;
}

const InterventionFormModal: React.FC<InterventionFormModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
    const { appData } = useData();
    const getAvailableRegions = appData?.getAvailableRegions || (() => []);
    
    const [formData, setFormData] = useState<Omit<InterventionPlan, 'id' | 'actionItems'>>({
        title: '',
        description: '',
        region: '',
        domain: 'Kesehatan & Gizi',
        status: InterventionStatus.Planning,
        priority: InterventionPriority.Medium,
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        budget: 0,
        kpi: '',
        relatedAlertId: undefined,
    });

    const [actionItems, setActionItems] = useState<ActionItem[]>([]);
    const [newActionItemText, setNewActionItemText] = useState('');
    const [newActionItemDueDate, setNewActionItemDueDate] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({ key: 'default', direction: 'asc' });
    
    const availableRegions = useMemo(() => getAvailableRegions(), [getAvailableRegions]);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    title: initialData.title || '',
                    description: initialData.description || '',
                    region: initialData.region || availableRegions[0]?.name || '',
                    domain: initialData.domain || 'Kesehatan & Gizi',
                    status: initialData.status || InterventionStatus.Planning,
                    priority: initialData.priority || InterventionPriority.Medium,
                    startDate: initialData.startDate || new Date().toISOString().split('T')[0],
                    endDate: initialData.endDate || '',
                    budget: initialData.budget || 0,
                    kpi: initialData.kpi || '',
                    relatedAlertId: initialData.relatedAlertId,
                });
                setActionItems(initialData.actionItems || []);
            } else {
                 setFormData({
                    title: '',
                    description: '',
                    region: availableRegions[0]?.name || '',
                    domain: 'Kesehatan & Gizi',
                    status: InterventionStatus.Planning,
                    priority: InterventionPriority.Medium,
                    startDate: new Date().toISOString().split('T')[0],
                    endDate: '',
                    budget: 0,
                    kpi: '',
                    relatedAlertId: undefined,
                });
                setActionItems([]);
            }
            setSortConfig({ key: 'default', direction: 'asc' }); // Reset sort on open
        }
    }, [isOpen, initialData, availableRegions]);

    const sortedActionItems = useMemo(() => {
        let sortableItems = [...actionItems];
        if (sortConfig.key !== 'default') {
            sortableItems.sort((a, b) => {
                if (sortConfig.key === 'completed') {
                    return (a.completed ? 1 : 0) - (b.completed ? 1 : 0);
                }
                if (sortConfig.key === 'dueDate') {
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                }
                return 0;
            });
            if (sortConfig.direction === 'desc') {
                sortableItems.reverse();
            }
        }
        return sortableItems;
    }, [actionItems, sortConfig]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'domain' 
                ? value as Domain 
                : (name === 'budget' ? parseFloat(value) || 0 : value),
        }));
    };

    const handleActionItemChange = (id: string, field: 'completed' | 'text' | 'dueDate', value: any) => {
        setActionItems(items => items.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const handleAddActionItem = () => {
        if (!newActionItemText.trim()) return;
        const newItem: ActionItem = {
            id: `action-${Date.now()}`,
            text: newActionItemText.trim(),
            completed: false,
            dueDate: newActionItemDueDate || undefined,
        };
        setActionItems(items => [...items, newItem]);
        setNewActionItemText('');
        setNewActionItemDueDate('');
    };

    const requestSort = (key: SortKey) => {
        let direction: SortDirection = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key: SortKey) => {
        if (!sortConfig || sortConfig.key !== key) {
            return <SwitchVerticalIcon className="w-4 h-4 text-slate-400" />;
        }
        if (sortConfig.direction === 'asc') {
            return <ChevronUpIcon className="w-4 h-4 text-indigo-500" />;
        }
        return <ChevronDownIcon className="w-4 h-4 text-indigo-500" />;
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...formData, actionItems, id: initialData?.id });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl transform transition-all flex flex-col" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[90vh]">
                    <div className="p-6 flex-shrink-0">
                        <div className="flex items-center">
                             <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                                <BeakerIcon className="h-6 w-6 text-indigo-600" />
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-bold text-gray-900">
                                    {initialData?.id ? 'Edit Rencana Intervensi' : 'Buat Rencana Intervensi Baru'}
                                </h3>
                                <p className="text-sm text-gray-500">Isi detail rencana program intervensi Anda.</p>
                            </div>
                        </div>
                    </div>
                    <div className="px-6 pb-4 space-y-4 overflow-y-auto flex-grow">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-slate-700">Judul Rencana</label>
                            <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} required className="mt-1 block w-full shadow-sm sm:text-sm border-slate-300 rounded-md bg-white text-slate-900" />
                        </div>
                         <div>
                            <label htmlFor="description" className="block text-sm font-medium text-slate-700">Deskripsi</label>
                            <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={2} className="mt-1 block w-full shadow-sm sm:text-sm border-slate-300 rounded-md bg-white text-slate-900" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="region" className="block text-sm font-medium text-slate-700">Wilayah</label>
                                <select name="region" id="region" value={formData.region} onChange={handleChange} required className="mt-1 block w-full py-2 px-3 border border-slate-300 bg-white text-slate-900 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                                    {availableRegions.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="domain" className="block text-sm font-medium text-slate-700">Domain</label>
                                <select name="domain" id="domain" value={formData.domain} onChange={handleChange} required className="mt-1 block w-full py-2 px-3 border border-slate-300 bg-white text-slate-900 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                                    {DOMAIN_ITEMS.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="priority" className="block text-sm font-medium text-slate-700">Prioritas</label>
                                <select name="priority" id="priority" value={formData.priority} onChange={handleChange} required className="mt-1 block w-full py-2 px-3 border border-slate-300 bg-white text-slate-900 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                                    {Object.values(InterventionPriority).map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="status" className="block text-sm font-medium text-slate-700">Status</label>
                                <select name="status" id="status" value={formData.status} onChange={handleChange} required className="mt-1 block w-full py-2 px-3 border border-slate-300 bg-white text-slate-900 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                                    {Object.values(InterventionStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="startDate" className="block text-sm font-medium text-slate-700">Tanggal Mulai</label>
                                <input type="date" name="startDate" id="startDate" value={formData.startDate} onChange={handleChange} required className="mt-1 block w-full shadow-sm sm:text-sm border-slate-300 rounded-md bg-white text-slate-900" />
                            </div>
                            <div>
                                <label htmlFor="endDate" className="block text-sm font-medium text-slate-700">Tanggal Selesai</label>
                                <input type="date" name="endDate" id="endDate" value={formData.endDate} onChange={handleChange} className="mt-1 block w-full shadow-sm sm:text-sm border-slate-300 rounded-md bg-white text-slate-900" />
                            </div>
                        </div>
                         <div>
                            <label htmlFor="budget" className="block text-sm font-medium text-slate-700">Anggaran (IDR)</label>
                            <input type="number" name="budget" id="budget" value={formData.budget} onChange={handleChange} required className="mt-1 block w-full shadow-sm sm:text-sm border-slate-300 rounded-md bg-white text-slate-900" placeholder="500000000" />
                        </div>
                         <div>
                            <label htmlFor="kpi" className="block text-sm font-medium text-slate-700">Key Performance Indicator (KPI)</label>
                            <input type="text" name="kpi" id="kpi" value={formData.kpi} onChange={handleChange} required className="mt-1 block w-full shadow-sm sm:text-sm border-slate-300 rounded-md bg-white text-slate-900" placeholder="e.g., Menurunkan stunting sebesar 5%"/>
                        </div>
                        {/* ACTION ITEMS SECTION */}
                        <div className="pt-4 border-t border-slate-200">
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-2">
                                <label className="text-base font-semibold text-slate-800">Daftar Aksi</label>
                                <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                                    <button type="button" onClick={() => requestSort('completed')} className="flex items-center text-xs font-semibold text-slate-600 hover:text-indigo-600 p-1 rounded-md">
                                        Status {getSortIcon('completed')}
                                    </button>
                                    <button type="button" onClick={() => requestSort('dueDate')} className="flex items-center text-xs font-semibold text-slate-600 hover:text-indigo-600 p-1 rounded-md">
                                        Tenggat {getSortIcon('dueDate')}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                {sortedActionItems.map(item => (
                                    <div key={item.id} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2 bg-slate-50 rounded-md">
                                        <div className="flex items-center flex-grow">
                                            <input type="checkbox" checked={item.completed} onChange={(e) => handleActionItemChange(item.id, 'completed', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 bg-white" />
                                            <input type="text" value={item.text} onChange={(e) => handleActionItemChange(item.id, 'text', e.target.value)} className={`flex-grow text-sm border-transparent bg-white focus:bg-white focus:border-indigo-300 rounded-md ml-2 ${item.completed ? 'line-through text-slate-400' : 'text-slate-800'}`} />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input type="date" value={item.dueDate || ''} onChange={(e) => handleActionItemChange(item.id, 'dueDate', e.target.value)} className="text-sm w-full sm:w-32 border-slate-200 bg-white rounded-md" />
                                            <button type="button" onClick={() => setActionItems(items => items.filter(i => i.id !== item.id))} className="text-slate-400 hover:text-red-500 p-1">&times;</button>
                                        </div>
                                    </div>
                                ))}
                                {sortedActionItems.length === 0 && <p className="text-center text-sm text-slate-400 py-4">Belum ada daftar aksi.</p>}
                            </div>
                            <div className="mt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                <input type="text" value={newActionItemText} onChange={(e) => setNewActionItemText(e.target.value)} placeholder="Tugas baru..." className="flex-grow text-sm border-slate-300 rounded-md bg-white text-slate-900" />
                                <input type="date" value={newActionItemDueDate} onChange={(e) => setNewActionItemDueDate(e.target.value)} className="w-full sm:w-32 text-sm border-slate-300 rounded-md bg-white text-slate-900" />
                                <button type="button" onClick={handleAddActionItem} className="p-2 bg-indigo-100 text-indigo-600 hover:bg-indigo-200 rounded-md flex-shrink-0">
                                    <DocumentPlusIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-50 px-6 py-4 flex flex-col-reverse sm:flex-row justify-end gap-3 flex-shrink-0">
                        <button type="button" onClick={onClose} className="w-full sm:w-auto px-4 py-2 text-sm font-semibold text-gray-700 bg-white rounded-lg border border-gray-300 hover:bg-gray-50">
                            Batal
                        </button>
                        <button type="submit" className="w-full sm:w-auto px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700">
                            Simpan Rencana
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InterventionFormModal;
