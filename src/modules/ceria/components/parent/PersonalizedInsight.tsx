import React, { useState, useEffect } from 'react';
import { getParentingInsight } from '../../services/geminiService';
import { ChildProfile, GrowthRecord } from '../../types';
import { LightBulbIcon } from '../icons/Icons';

interface PersonalizedInsightProps {
    childProfile: ChildProfile;
    latestGrowth: GrowthRecord | null;
}

const PersonalizedInsight: React.FC<PersonalizedInsightProps> = ({ childProfile, latestGrowth }) => {
    const [insight, setInsight] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchInsight = async () => {
            setIsLoading(true);
            try {
                const result = await getParentingInsight(childProfile, latestGrowth);
                setInsight(result);
            } catch (err) {
                console.error(err);
                setInsight("Tidak dapat memuat saran saat ini. Coba lagi nanti.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchInsight();
    }, [childProfile, latestGrowth]);

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm h-full flex flex-col">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                <LightBulbIcon className="w-6 h-6 mr-2 text-yellow-500" />
                Saran Personal
            </h3>
            <div className="flex-grow flex items-center justify-center p-4 bg-amber-50 text-amber-900 rounded-lg min-h-[10rem]">
                {isLoading ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                ) : (
                    <p className="text-sm text-center font-medium leading-relaxed">{insight}</p>
                )}
            </div>
        </div>
    );
};

export default PersonalizedInsight;
