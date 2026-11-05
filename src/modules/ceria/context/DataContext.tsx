import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { load2024 } from '../services/year2024';
import { AppData } from '../types';
import { load2025 } from '../services/yearData';

interface DataContextType {
    year: number;
    setYear: (year: number) => void;
    appData: AppData | null;
    isLoading: boolean;
    error: string | null;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Open the dataset whose analyses have been prepared in the database.
    const [year, setYear] = useState(2025);
    const [appData, setAppData] = useState<AppData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        setIsLoading(true);
        setError(null);
        setAppData(null);
        const fetchData = async () => {
            try {
                const data = year === 2025 ? await load2025(controller.signal) : await load2024(controller.signal);
                if (!controller.signal.aborted) setAppData({ ...data, year });
            } catch (err) {
                console.error("Failed to load application data:", err);
                if (!controller.signal.aborted) setError("Gagal memuat data aplikasi. Periksa koneksi internet Anda dan coba muat ulang halaman.");
            } finally {
                if (!controller.signal.aborted) setIsLoading(false);
            }
        };

        fetchData();
        return () => controller.abort();
    }, [year]);

    return (
        <DataContext.Provider value={{ appData: appData?.year === year ? appData : null, isLoading: isLoading || (!error && appData?.year !== year), error, year, setYear }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = (): DataContextType => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
