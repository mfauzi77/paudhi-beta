
import React, { useState, useMemo } from 'react';
// FIX: Remove direct import from mockData and use the DataContext instead.
import { useData } from '../context/DataContext';
import { DocumentPlusIcon, ArrowPathIcon } from './icons/Icons';
// FIX: Import types for type annotations.
import { RegionDetailData, KabupatenKotaDetailData } from '../types';

const initialFormData = {
    level: 'provinsi',
    provinceId: 'jawa-barat',
    kabKotaId: '',
    period: new Date().toISOString().slice(0, 7),
    population: '',
    imunisasi: '',
    ispa: '',
    stunting: '',
    giziBuruk: '',
    aksesPaud: '',
    aktaLahir: '',
    aksesAirBersih: '',
    sanitasiLayak: '',
};

const InputData: React.FC = () => {
    // FIX: Get data from the useData context hook.
    const { appData } = useData();
    const regionsDetails = appData?.regionsDetails || {};
    const kabupatenKotaDetails = appData?.kabupatenKotaDetails || {};
    
    const [formData, setFormData] = useState(initialFormData);

    // FIX: Add explicit types for sort callback parameters to resolve 'unknown' type error.
    const provinces = useMemo(() => Object.values(regionsDetails).sort((a: RegionDetailData, b: RegionDetailData) => a.name.localeCompare(b.name)), [regionsDetails]);
    const cities = useMemo(() => {
        if (formData.level !== 'kabupaten' || !formData.provinceId) return [];
        const selectedProvince = regionsDetails[formData.provinceId];
        return selectedProvince?.kabupatenKotaIds
            ?.map(id => kabupatenKotaDetails[id])
            // FIX: Use a type guard to ensure correct typing after filtering.
            .filter((c): c is KabupatenKotaDetailData => !!c)
            .sort((a,b) => a.name.localeCompare(b.name)) || [];
    }, [formData.level, formData.provinceId, regionsDetails, kabupatenKotaDetails]);

    const handleLevelChange = (level: string) => {
        setFormData(prev => ({ ...prev, level, kabKotaId: '' }));
    };

    const handleProvinceChange = (provinceId: string) => {
        setFormData(prev => ({ ...prev, provinceId, kabKotaId: '' }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real application, you would send this data to a backend server.
        console.log("Form Data Submitted:", formData);
        alert('Data berhasil dikirim! (Cek log konsol untuk detail)');
    };
    
    const handleReset = () => {
        setFormData(initialFormData);
    }

    const FormField: React.FC<{ label: string; name: string; unit: string; value: string; }> = ({ label, name, unit, value }) => (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-slate-700">{label}</label>
            <div className="mt-1 relative rounded-md shadow-sm">
                <input
                    type="number"
                    name={name}
                    id={name}
                    value={value}
                    onChange={handleInputChange}
                    className="block w-full pl-3 pr-12 sm:text-sm border-slate-300 rounded-md bg-white text-slate-900"
                    placeholder="0.0"
                    step="0.1"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-slate-500 sm:text-sm">{unit}</span>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-slate-800">Input Data Wilayah</h2>
                <p className="text-sm text-slate-500 mt-1">Masukkan data terbaru untuk provinsi atau kabupaten/kota.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-slate-200 pb-6 mb-6">
                    {/* Location Selection */}
                    <fieldset>
                        <legend className="text-base font-semibold text-slate-800 mb-2">1. Pilih Lokasi & Periode</legend>
                         <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700">Tingkat Wilayah</label>
                                <div className="flex items-center space-x-4 mt-1">
                                    <label className="flex items-center">
                                        <input type="radio" name="level" value="provinsi" checked={formData.level === 'provinsi'} onChange={(e) => handleLevelChange(e.target.value)} className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" />
                                        <span className="ml-2 text-sm text-slate-800">Provinsi</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input type="radio" name="level" value="kabupaten" checked={formData.level === 'kabupaten'} onChange={(e) => handleLevelChange(e.target.value)} className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" />
                                        <span className="ml-2 text-sm text-slate-800">Kabupaten/Kota</span>
                                    </label>
                                </div>
                            </div>
                             <div>
                                <label htmlFor="provinceId" className="block text-sm font-medium text-slate-700">Provinsi</label>
                                <select id="provinceId" name="provinceId" value={formData.provinceId} onChange={(e) => handleProvinceChange(e.target.value)} className="mt-1 block w-full py-2 px-3 border border-slate-300 bg-white text-slate-900 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                                    {provinces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                             </div>
                             {formData.level === 'kabupaten' && (
                                <div>
                                    <label htmlFor="kabKotaId" className="block text-sm font-medium text-slate-700">Kabupaten/Kota</label>
                                    <select id="kabKotaId" name="kabKotaId" value={formData.kabKotaId} onChange={handleInputChange} className="mt-1 block w-full py-2 px-3 border border-slate-300 bg-white text-slate-900 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required>
                                        <option value="">-- Pilih Kabupaten/Kota --</option>
                                        {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                 </div>
                             )}
                             <div>
                                <label htmlFor="period" className="block text-sm font-medium text-slate-700">Periode Data</label>
                                <input type="month" id="period" name="period" value={formData.period} onChange={handleInputChange} className="mt-1 block w-full py-2 px-3 border border-slate-300 bg-white text-slate-900 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                             </div>
                         </div>
                    </fieldset>
                </div>
                
                {/* Data Fields */}
                <h2 className="text-base font-semibold text-slate-800 mb-4">2. Masukkan Data Indikator</h2>
                <div className="space-y-6">
                    <fieldset className="p-4 border rounded-md">
                        <legend className="px-2 font-semibold text-slate-600">Data Umum</legend>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                             <FormField label="Populasi Anak (Estimasi)" name="population" unit="jiwa" value={formData.population} />
                        </div>
                    </fieldset>
                    
                    <fieldset className="p-4 border rounded-md">
                        <legend className="px-2 font-semibold text-slate-600">Kesehatan</legend>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            <FormField label="Cakupan Imunisasi Dasar" name="imunisasi" unit="%" value={formData.imunisasi} />
                            <FormField label="Prevalensi ISPA" name="ispa" unit="%" value={formData.ispa} />
                        </div>
                    </fieldset>

                     <fieldset className="p-4 border rounded-md">
                        <legend className="px-2 font-semibold text-slate-600">Gizi</legend>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            <FormField label="Prevalensi Stunting" name="stunting" unit="%" value={formData.stunting} />
                            <FormField label="Gizi Buruk (Wasting)" name="giziBuruk" unit="%" value={formData.giziBuruk} />
                        </div>
                    </fieldset>

                     <fieldset className="p-4 border rounded-md">
                        <legend className="px-2 font-semibold text-slate-600">Lainnya</legend>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                             <FormField label="Akses PAUD" name="aksesPaud" unit="%" value={formData.aksesPaud} />
                             <FormField label="Kepemilikan Akta Lahir" name="aktaLahir" unit="%" value={formData.aktaLahir} />
                             <FormField label="Akses Air Bersih Layak" name="aksesAirBersih" unit="%" value={formData.aksesAirBersih} />
                             <FormField label="Akses Sanitasi Layak" name="sanitasiLayak" unit="%" value={formData.sanitasiLayak} />
                        </div>
                    </fieldset>
                </div>

                {/* Actions */}
                <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col-reverse sm:flex-row justify-end gap-3">
                    <button type="button" onClick={handleReset} className="w-full sm:w-auto flex items-center justify-center px-4 py-2 text-sm font-semibold text-slate-700 bg-white rounded-lg border border-slate-300 hover:bg-slate-50">
                        <ArrowPathIcon className="w-4 h-4 mr-2" />
                        Reset Form
                    </button>
                    <button type="submit" className="w-full sm:w-auto flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700">
                        <DocumentPlusIcon className="w-5 h-5 mr-2" />
                        Simpan Data
                    </button>
                </div>
            </form>
        </div>
    );
};

export default InputData;
