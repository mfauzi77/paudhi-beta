import { sanitizeHtml } from '../../../../utils/sanitizeHtml';
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowPathIcon, HandThumbUpIcon, HandThumbDownIcon } from '../icons/Icons';
import FeedbackModal from './FeedbackModal';
import { getAnalysisMetadata } from '../../services/analysisMemory';

interface InsightContainerProps {
    title: string;
    icon: React.ReactNode;
    isLoading: boolean;
    content: string | null;
    error: string | null;
    onRegenerate: (feedback?: string) => void;
    loadingText?: string;
    lastAnalyzed?: string | null;
}

const InsightContainer: React.FC<InsightContainerProps> = ({
    title,
    icon,
    isLoading,
    content,
    error,
    onRegenerate,
    loadingText = "Menyiapkan hasil analisis AI...",
    lastAnalyzed,
}) => {

    const [feedback, setFeedback] = useState<'good' | 'bad' | null>(null);
    const analysisMetadata = getAnalysisMetadata(content);
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

    const parsedContent = useMemo(() => {
        if (!content) return { insight: '', justification: '' };
        const parts = content.split('### Dasar Analisis');
        return {
            insight: parts[0] || '',
            justification: parts[1] || '',
        };
    }, [content]);

    const [cooldown, setCooldown] = useState(false);

    const handleRegenerate = () => {
        if (isLoading || cooldown) return;
        
        onRegenerate();
        
        // SOP: 2s debounce/cooldown on Refresh buttons
        setCooldown(true);
        setTimeout(() => setCooldown(false), 2000);
    };

    const handleFeedbackSubmit = (feedbackText: string) => {
        // In a real app, this feedbackText would be passed to the onRegenerate function
        console.log("Regenerating with feedback:", feedbackText);
        onRegenerate(feedbackText);
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="w-full space-y-4 py-2">
                    <div className="flex items-center space-x-3 mb-6">
                        <motion.div 
                            animate={{ 
                                scale: [1, 1.2, 1],
                                opacity: [0.5, 1, 0.5] 
                            }}
                            transition={{ 
                                duration: 2, 
                                repeat: Infinity,
                                ease: "easeInOut" 
                            }}
                            className="p-2 bg-indigo-100 rounded-full"
                        >
                            {icon}
                        </motion.div>
                        <motion.span 
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="font-medium text-indigo-700 italic"
                        >
                            {loadingText}
                        </motion.span>
                    </div>
                    
                    {/* Shimmering Skeleton Loader */}
                    <div className="space-y-3">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="relative h-4 bg-slate-200 rounded overflow-hidden w-full">
                                <motion.div
                                    initial={{ x: '-100%' }}
                                    animate={{ x: '100%' }}
                                    transition={{
                                        repeat: Infinity,
                                        duration: 1.5,
                                        ease: "linear",
                                    }}
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent w-1/2"
                                />
                                <div className={`h-full bg-slate-200 rounded ${i === 4 ? 'w-2/3' : 'w-full'}`} />
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        if (error) {
            return <p className="text-red-500 text-center">{error}</p>;
        }

        if (parsedContent.insight) {
            return (
                 <div className="w-full">
                    <div 
                        className="prose prose-sm max-w-none text-gray-700"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(parsedContent.insight.replace(/\n/g, '<br />')) }} 
                    />
                    {parsedContent.justification && (
                        <div className="mt-4 pt-4 border-t border-dashed border-slate-300">
                             <h4 className="font-bold text-sm text-slate-600 mb-2">Dasar Analisis</h4>
                             <div 
                                 className="prose prose-sm max-w-none text-slate-600"
                                 dangerouslySetInnerHTML={{ __html: sanitizeHtml(parsedContent.justification.replace(/\n/g, '<br />')) }} 
                            />
                        </div>
                    )}
                    <div className="mt-4 pt-2 text-[10px] italic text-slate-400 border-t border-slate-100">
                       AI dapat melakukan kesalahan, pastikan dilakukan pengecekan ulang sebelum ditindaklanjuti.
                    </div>
                </div>
            );
        }

        return null;
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-3">
                <h3 className="text-lg font-bold text-slate-800 flex items-center">
                    {icon}
                    {title}
                </h3>
                <div className="flex flex-col items-end gap-1">
                    <button 
                        onClick={handleRegenerate}
                        disabled={isLoading || cooldown}
                        className="flex-shrink-0 flex items-center px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-100 rounded-lg hover:bg-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Mulai analisis"
                    >
                        <ArrowPathIcon className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        {cooldown ? 'Mohon Tunggu...' : 'Perbarui Analisis'}
                    </button>
                    {(analysisMetadata?.savedAt || lastAnalyzed) && !isLoading && !error && (
                        <div className="text-[10px] text-slate-500 italic">
                            {analysisMetadata?.cached ? 'Analisis AI tersimpan' : 'Analisis AI'} · {analysisMetadata?.savedAt ? new Date(analysisMetadata.savedAt).toLocaleString('id-ID') : lastAnalyzed}
                        </div>
                    )}
                </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-md min-h-[10rem] flex">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={isLoading ? 'loading' : 'content'}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="w-full"
                    >
                        {renderContent()}
                    </motion.div>
                </AnimatePresence>
            </div>
            {!isLoading && !error && content && (
                 <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-end gap-4">
                    <span className="text-sm text-slate-600">Apakah ini membantu?</span>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setFeedback('good')} 
                            className={`p-2 rounded-full transition-colors ${feedback === 'good' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                            aria-label="Insight was helpful"
                        >
                            <HandThumbUpIcon className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={() => { setFeedback('bad'); setIsFeedbackModalOpen(true); }}
                            className={`p-2 rounded-full transition-colors ${feedback === 'bad' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                             aria-label="Insight was not helpful"
                        >
                            <HandThumbDownIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
            <FeedbackModal
                isOpen={isFeedbackModalOpen}
                onClose={() => setIsFeedbackModalOpen(false)}
                onSubmit={handleFeedbackSubmit}
            />
        </div>
    );
};

export default InsightContainer;
