import React from 'react';

interface MapRegionData {
    id: string;
    name: string;
    value: number;
}

interface IndonesiaMapProps {
    data: MapRegionData[];
    onRegionSelect: (id: string) => void;
    selectedRegionId?: string;
}

const IndonesiaMap: React.FC<IndonesiaMapProps> = ({ data, onRegionSelect, selectedRegionId }) => {
    const getRiskColor = (score: number | undefined): string => {
        if (score === undefined) return '#d1d5db'; // gray-300 for no data
        if (score > 85) return '#b91c1c'; // red-700
        if (score > 70) return '#ef4444'; // red-500
        if (score > 55) return '#f97316'; // orange-500
        if (score > 40) return '#facc15'; // yellow-400
        return '#10b981'; // emerald-500
    };
    
    // Fix: Explicitly type the Map to ensure correct type inference for .get()
    const regionDataMap: Map<string, MapRegionData> = new Map(data.map(item => [item.id, item]));

    // Corrected and simplified SVG paths for Indonesian provinces
    const provinces = [
        { id: 'aceh', name: 'Aceh', path: "M43.8,70.5 L36,53.3 L42,48 L56.3,53.8 L61.8,63.1 L51,79.5 L43.8,70.5z" },
        { id: 'sumatera-utara', name: 'Sumatera Utara', path: "M61.8,63.1 L82,93 L96.8,85.2 L75.6,56.7 L61.8,63.1z" },
        { id: 'sumatera-selatan', name: 'Sumatera Selatan', path: "M149,150.8 L169.5,178.2 L178.6,171.3 L157.4,142 L149,150.8z" },
        { id: 'riau', name: 'Riau', path: "M96.8,85.2 L121.2,118.9 L133,109.9 L109,76.5 L96.8,85.2z" },
        { id: 'banten', name: 'Banten', path: "M189.2,213.5 L192.5,221.3 L199.1,219 L194,210.6 Z" },
        { id: 'dki-jakarta', name: 'DKI Jakarta', path: "M201,217.5 L199.1,219 L202,223 L204,221 Z" },
        { id: 'jawa-barat', name: 'Jawa Barat', path: "M199.1,219 L202,223 L220,228 L216,218 Z" },
        { id: 'jawa-tengah', name: 'Jawa Tengah', path: "M220,228 L240,233 L236,223 Z" },
        { id: 'yogyakarta', name: 'DI Yogyakarta', path: "M228,238.5 L232,240.5 L234,238 L231,237 Z" },
        { id: 'jawa-timur', name: 'Jawa Timur', path: "M240,233 L265,240 L260,230 Z" },
        { id: 'bali', name: 'Bali', path: "M267,238 L275,242 L273,235 Z" },
        { id: 'nusa-tenggara-barat', name: 'Nusa Tenggara Barat', path: "M278,234 L290,240 L288,232 Z" },
        { id: 'nusa-tenggara-timur', name: 'Nusa Tenggara Timur', path: "M320,260 L330,265 L360,255 L350,250 Z" },
        { id: 'kalimantan-barat', name: 'Kalimantan Barat', path: "M220,100 L240,90 L275,120 L240,140 L220,120 Z" },
        { id: 'kalimantan-timur', name: 'Kalimantan Timur', path: "M300,90 L330,80 L350,110 L310,130 Z" },
        { id: 'kalimantan-utara', name: 'Kalimantan Utara', path: "M305,75 L335,65 L345,90 L315,100 Z" },
        { id: 'sulawesi-barat', name: 'Sulawesi Barat', path: "M370,165 L380,180 L375,185 L365,170 Z" },
        { id: 'sulawesi-selatan', name: 'Sulawesi Selatan', path: "M375,185 L390,200 L395,195 L380,180 Z" },
        { id: 'sulawesi-tengah', name: 'Sulawesi Tengah', path: "M380,130 L430,140 L420,160 L370,150 Z" },
        { id: 'gorontalo', name: 'Gorontalo', path: "M435,120 L450,125 L445,135 L430,130 Z" },
        { id: 'maluku', name: 'Maluku', path: "M550,200 L560,210 L570,205 L565,195 Z" },
        { id: 'maluku-utara', name: 'Maluku Utara', path: "M520,120 L530,130 L540,125 L535,115 Z" },
        { id: 'papua', name: 'Papua', path: "M600,150 L700,160 L690,220 L590,210 Z" },
    ];

    return (
        <div className="relative">
            <svg viewBox="0 0 750 300" className="w-full h-auto" role="img" aria-labelledby="map-title">
                <title id="map-title">Peta Risiko Provinsi di Indonesia</title>
                {provinces.map(p => {
                    const region = regionDataMap.get(p.id);
                    const fillColor = getRiskColor(region?.value);
                    const isSelected = p.id === selectedRegionId;

                    return (
                        <g key={p.id} onClick={() => onRegionSelect(p.id)} className="cursor-pointer group">
                            <path
                                d={p.path}
                                id={p.id}
                                name={p.name}
                                className={`transition-all duration-200 ${isSelected ? 'stroke-indigo-700' : 'stroke-white'} stroke-2 group-hover:opacity-80`}
                                fill={fillColor}
                            >
                                <title>{p.name} - Risiko: {region?.value ?? 'N/A'}</title>
                            </path>
                        </g>
                    );
                })}
            </svg>
            <div className="absolute bottom-0 right-0 p-2 bg-white/70 backdrop-blur-sm rounded-lg text-xs flex items-center space-x-2">
                 <div className="flex items-center"><span className="w-2.5 h-2.5 rounded-sm mr-1" style={{backgroundColor: getRiskColor(20)}}></span>Rendah</div>
                <div className="flex items-center"><span className="w-2.5 h-2.5 rounded-sm mr-1" style={{backgroundColor: getRiskColor(50)}}></span>Sedang</div>
                <div className="flex items-center"><span className="w-2.5 h-2.5 rounded-sm mr-1" style={{backgroundColor: getRiskColor(60)}}></span>Tinggi</div>
                <div className="flex items-center"><span className="w-2.5 h-2.5 rounded-sm mr-1" style={{backgroundColor: getRiskColor(80)}}></span>Kritis</div>
                 <div className="flex items-center"><span className="w-2.5 h-2.5 rounded-sm mr-1" style={{backgroundColor: getRiskColor(90)}}></span>Sangat Kritis</div>
                 <div className="flex items-center"><span className="w-2.5 h-2.5 rounded-sm bg-gray-300 mr-1"></span>N/A</div>
            </div>
        </div>
    );
};

export default IndonesiaMap;