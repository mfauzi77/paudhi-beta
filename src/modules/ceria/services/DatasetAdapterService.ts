
import { Dataset } from '../types';

export interface StandardCeriaData {
    wilayah: string;
    tahun: string | number;
    indikator: string;
    nilai: number;
}

export interface AdapterResult {
    raw: any;
    normalized: StandardCeriaData[];
    error?: string;
}

class DatasetAdapterService {
    /**
     * Safely access nested objects using a path string (e.g., 'data.items')
     */
    private getValueByPath(obj: any, path: string): any {
        if (!path || path === '.') return obj;
        return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    }

    /**
     * Fetch from API and normalize based on dataset configuration
     */
    async fetchAndNormalize(dataset: Dataset, _integrationEndpoint: string): Promise<AdapterResult> {
        try {
            if (dataset.localUrl?.startsWith('/data/2025/')) {
                const response = await fetch(dataset.localUrl);
                if (!response.ok) throw new Error('Gagal memuat dataset 2025');
                const raw = await response.json();
                const normalized: StandardCeriaData[] = [];
                for (const row of raw.provinces) for (const path of dataset.fieldPaths || []) {
                    const value = this.getValueByPath(row, path);
                    if (typeof value === 'number') normalized.push({ wilayah: row.province, tahun: 2025, indikator: path, nilai: value });
                }
                return { raw, normalized };
            }
            // In a real app, this would be a real fetch
            // const response = await fetch(integrationEndpoint);
            // const rawData = await response.json();
            
            // Simulation of BPS-like response
            const rawData = {
                status: "success",
                data: [
                    { "label": "Aceh", "value": "7.5", "year": "2024" },
                    { "label": "Sumatera Utara", "value": "6.9", "year": "2024" },
                    { "label": "Riau", "value": "8.2", "year": "2024" }
                ]
            };

            const dataPath = dataset.dataPath || 'data';
            const items = this.getValueByPath(rawData, dataPath);

            if (!items || !Array.isArray(items)) {
                return { 
                    raw: rawData, 
                    normalized: [], 
                    error: `Data path '${dataPath}' tidak ditemukan atau bukan array.` 
                };
            }

            const mapping = dataset.mapping || { wilayah: 'wilayah', nilai: 'nilai' };
            const defaults = dataset.defaultValues || {};

            const normalized: StandardCeriaData[] = items.map((item: any) => {
                const normalizedItem: StandardCeriaData = {
                    wilayah: item[mapping.wilayah] || 'Unknown',
                    tahun: item[mapping.tahun || ''] || defaults.tahun || '2024',
                    indikator: item[mapping.indikator || ''] || defaults.indikator || dataset.indicator,
                    nilai: parseFloat(item[mapping.nilai] || '0')
                };

                // Check for missing mapping fields
                if (item[mapping.wilayah] === undefined || item[mapping.nilai] === undefined) {
                    console.warn("Mapping field tidak ditemukan pada response API", item);
                }

                return normalizedItem;
            });

            // If critical fields are missing in all items, throw error message
            if (normalized.length > 0 && items[0][mapping.wilayah] === undefined) {
                return { raw: rawData, normalized, error: "Mapping field tidak ditemukan pada response API" };
            }

            return { raw: rawData, normalized };
        } catch (error: any) {
            return { raw: null, normalized: [], error: error.message || "Gagal menghubungi API" };
        }
    }
}

export const datasetAdapterService = new DatasetAdapterService();
