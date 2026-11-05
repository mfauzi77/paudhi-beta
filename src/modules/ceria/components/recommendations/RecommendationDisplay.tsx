import { sanitizeHtml } from '../../../../utils/sanitizeHtml';
import React from 'react';
import { RecommendationParams } from '../../types';
import { LightBulbIcon, ArrowDownTrayIcon, ShareIcon, BookmarkIcon } from '../icons/Icons';

interface RecommendationDisplayProps {
    isLoading: boolean;
    error: string | null;
    recommendation: string | null;
    params: RecommendationParams | null;
    onCreatePlan: () => void;
}

const RecommendationDisplay: React.FC<RecommendationDisplayProps> = ({ isLoading, error, recommendation, params, onCreatePlan }) => {
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                <h3 className="text-lg font-semibold text-slate-800">AI is thinking...</h3>
                <p className="text-sm text-slate-500">Crafting strategic recommendations based on your request.</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-4 bg-red-50 rounded-lg">
                <h3 className="text-lg font-semibold text-red-700">Error Generating Recommendation</h3>
                <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
        );
    }

    if (!recommendation || !params) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-500">
                <LightBulbIcon className="w-16 h-16 mb-4 text-slate-300" />
                <h3 className="text-xl font-semibold text-slate-700">Partner Strategi AI SPRINT Anda</h3>
                <p className="mt-1 max-w-md">Select your criteria on the left and click "Generate" to receive tailored intervention strategies.</p>
            </div>
        );
    }

    const formattedRecommendation = recommendation.replace(/\n/g, '<br />');

    return (
        <div className="h-full flex flex-col">
            <div className="flex-grow overflow-y-auto">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
                    <h4 className="text-sm font-semibold text-slate-800 mb-2">Recommendation Context</h4>
                    <div className="text-xs text-slate-600 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                        <p><strong>Domain:</strong> {params.domain}</p>
                        <p><strong>Region:</strong> {params.region}</p>
                        <p><strong>Risk Level:</strong> {params.riskLevel.replace('-', ' & ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                    </div>
                    {params.customPrompt && <p className="text-xs text-slate-600 mt-2"><strong>Query:</strong> "{params.customPrompt}"</p>}
                </div>

                <div className="prose prose-sm max-w-none text-slate-700"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(formattedRecommendation) }}
                />
            </div>
            <div className="flex-shrink-0 pt-6 mt-6 border-t border-slate-200">
                <div className="flex flex-col sm:flex-row items-center justify-end gap-3">
                     <button className="w-full sm:w-auto flex items-center justify-center px-4 py-2 text-sm font-semibold text-slate-700 bg-white rounded-lg border border-slate-300 hover:bg-slate-50">
                        <BookmarkIcon className="w-4 h-4 mr-2" /> Save
                    </button>
                     <button className="w-full sm:w-auto flex items-center justify-center px-4 py-2 text-sm font-semibold text-slate-700 bg-white rounded-lg border border-slate-300 hover:bg-slate-50">
                        <ShareIcon className="w-4 h-4 mr-2" /> Share
                    </button>
                     <button
                        onClick={onCreatePlan}
                        className="w-full sm:w-auto flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700">
                        <ArrowDownTrayIcon className="w-4 h-4 mr-2" /> Create Plan
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RecommendationDisplay;