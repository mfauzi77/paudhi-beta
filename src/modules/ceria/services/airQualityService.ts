import { AirQualityData } from '../types';

// API Key should be provided via environment variables (.env).
const API_KEY = import.meta.env.VITE_WAQI_API_KEY || "6ba268430c0c101939242bbaccdf9900902db5d8"; // TODO: Remove fallback after .env is configured

// Regional grids for focused API calls.
const REGIONAL_GRIDS = [
  { name: "Aceh – Sumut – Riau", api_latlng: "2,95,5,100" },
  { name: "Sumatera Selatan – Lampung", api_latlng: "-6,101,0,106" },
  { name: "Jabodetabek – Jawa Barat", api_latlng: "-6.9,106.5,-5.5,108.5" },
  { name: "Jateng – DIY", api_latlng: "-7.7,108,-6.5,111.5" },
  { name: "Jatim – Bali", api_latlng: "-8.5,112,-7,115" },
  { name: "Kalimantan", api_latlng: "-3,108,3,118" },
  { name: "Sulawesi", api_latlng: "-5,119,1,125" },
  { name: "Nusa Tenggara", api_latlng: "-10,115,-8,123" },
  { name: "Maluku – Papua Barat", api_latlng: "-4,126,-1,132" },
  { name: "Papua", api_latlng: "-6,132,-3,141" },
];

const getAqiLevel = (aqi: number): AirQualityData['level'] => {
    if (aqi <= 50) return 'Baik';
    if (aqi <= 100) return 'Sedang';
    if (aqi <= 150) return 'Tidak Sehat';
    if (aqi <= 200) return 'Sangat Tidak Sehat';
    return 'Berbahaya';
};

/**
 * Fetches air quality data for all of Indonesia and returns a summary
 * focusing on the station with the highest AQI.
 */
export const getNationalAirQualitySummary = async (): Promise<AirQualityData | null> => {
    try {
        const fetchPromises = REGIONAL_GRIDS.map(grid => 
            fetch(`https://api.waqi.info/map/bounds/?latlng=${grid.api_latlng}&token=${API_KEY}`)
                .then(res => res.json())
        );

        const results = await Promise.all(fetchPromises);

        let allStations: any[] = [];
        results.forEach(result => {
            if (result.status === 'ok' && Array.isArray(result.data)) {
                allStations = allStations.concat(result.data);
            }
        });

        if (allStations.length === 0) {
            console.warn("No air quality stations found across all Indonesian grids.");
            return null;
        }

        let highestAqiStation = null;
        let maxAqi = -1;

        for (const stationData of allStations) {
            const aqiValue = parseInt(stationData.aqi, 10);
            if (isNaN(aqiValue)) continue; // Skip invalid AQI readings

            if (aqiValue > maxAqi) {
                maxAqi = aqiValue;
                highestAqiStation = stationData;
            }
        }
        
        if (!highestAqiStation) {
             console.warn(`No valid station found across all grids after filtering.`);
             return null;
        }

        const stationName = highestAqiStation.station?.name || 'Stasiun tidak diketahui';
        const time = highestAqiStation.station?.time || new Date().toLocaleTimeString();

        return {
            aqi: maxAqi,
            station: stationName,
            level: getAqiLevel(maxAqi),
            time,
        };

    } catch (error) {
        console.error('Error fetching national air quality summary:', error);
        return null;
    }
};