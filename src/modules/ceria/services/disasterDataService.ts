import { DisasterData, GempaBMKG } from '../types';

/**
 * Fetches the latest real-time disaster data from various sources.
 * This implementation fetches the latest earthquake data from BMKG's public API.
 */
export const getLatestDisasterData = async (): Promise<DisasterData | null> => {
    try {
        // Fetch latest earthquake data from BMKG's public API
        // This is a CORS-enabled public endpoint.
        const response = await fetch('https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json');
        
        if (!response.ok) {
            console.error('Failed to fetch BMKG data:', response.statusText);
            return null;
        }
        
        const gempaData: GempaBMKG = await response.json();
        
        // Structure the response to fit the app's DisasterData type
        const disasterData: DisasterData = {
            gempa: gempaData,
            bnpb: [], // Placeholder for potential future integration
            petaBencana: [], // Placeholder for potential future integration
        };

        return disasterData;

    } catch (error) {
        console.error('Error fetching disaster data:', error);
        // Return null if there's any network or parsing error to prevent app crashes.
        return null;
    }
};
