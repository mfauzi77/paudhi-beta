import { sanitizeHtml } from '../../../../utils/sanitizeHtml';
import React, { useState, useEffect, useRef } from 'react';
import { getSmartRecommendations } from '../../services/geminiService';
import { ActiveAlertData, SmartRecommendationResponse } from '../../types';
import { LightBulbIcon } from '../icons/Icons';
import { getAnalysisMetadata } from '../../services/analysisMemory';

interface RecommendationModalProps {
  isOpen: boolean;
  onClose: () => void;
  alert: ActiveAlertData;
  onCreatePlan: (alert: ActiveAlertData) => void;
}

const ImpactChart: React.FC<{ currentScore: number; projectedScore: number }> = ({ currentScore, projectedScore }) => {
    const chartHeight = 200;
    const chartWidth = 300;
    const barWidth = 50;
    const padding = { top: 20, right: 20, bottom: 30, left: 40 };
    const yMax = 100;

    const getY = (value: number) => padding.top + ((yMax - value) / yMax) * (chartHeight - padding.top - padding.bottom);

    const getRiskColor = (score: number) => {
        if (score > 70) return 'fill-red-500';
        if (score > 55) return 'fill-orange-500';
        return 'fill-yellow-400';
    };

    return (
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto max-w-xs mx-auto" aria-label={`Grafik skor risiko, saat ini ${currentScore}, proyeksi ${projectedScore}`}>
            {/* Y-Axis */}
            {[0, 25, 50, 75, 100].map(val => (
                <g key={`y-axis-${val}`} role="presentation">
                    <line x1={padding.left - 5} y1={getY(val)} x2={chartWidth - padding.right} y2={getY(val)} className="stroke-slate-200" strokeWidth="1" />
                    <text x={padding.left - 10} y={getY(val) + 4} textAnchor="end" className="text-xs fill-slate-500">{val}</text>
                </g>
            ))}

            {/* Bars */}
            <g role="presentation">
                <rect x={(chartWidth / 4) - (barWidth / 2)} y={getY(currentScore)} width={barWidth} height={chartHeight - padding.bottom - getY(currentScore)} className={getRiskColor(currentScore)} rx="4" />
                <text x={chartWidth / 4} y={getY(currentScore) - 8} textAnchor="middle" className="text-sm font-bold fill-slate-700">{currentScore}</text>
                <text x={chartWidth / 4} y={chartHeight - padding.bottom + 15} textAnchor="middle" className="text-xs font-medium fill-slate-600">Skor Saat Ini</text>
            </g>

            <g role="presentation">
                <rect x={(chartWidth * 3 / 4) - (barWidth / 2)} y={getY(projectedScore)} width={barWidth} height={chartHeight - padding.bottom - getY(projectedScore)} className="fill-emerald-500" rx="4" />
                <text x={chartWidth * 3 / 4} y={getY(projectedScore) - 8} textAnchor="middle" className="text-sm font-bold fill-slate-700">{projectedScore}</text>
                <text x={chartWidth * 3 / 4} y={chartHeight - padding.bottom + 15} textAnchor="middle" className="text-xs font-medium fill-slate-600">Proyeksi Skor</text>
            </g>
        </svg>
    );
};

const RecommendationModal: React.FC<RecommendationModalProps> = ({ isOpen, onClose, alert, onCreatePlan }) => {
  const [recommendationData, setRecommendationData] = useState<SmartRecommendationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const requestRef = useRef<AbortController | null>(null);
  const analysisMetadata = getAnalysisMetadata(recommendationData?.justification);


  const fetchRecommendations = async (feedback?: string) => {
      requestRef.current?.abort();
      const controller = new AbortController();
      requestRef.current = controller;
      setIsLoading(true);
      setError(null);
      setRecommendationData(null);
      
      try {
          const result = await getSmartRecommendations(alert, controller.signal, feedback);
          if (controller.signal.aborted) return;
          setRecommendationData(result);
      } catch (err) {
          if (controller.signal.aborted) return;
          setError(err instanceof Error ? err.message : 'Gagal memuat rekomendasi. Silakan coba lagi.');
          console.error(err);
      } finally {
          if (!controller.signal.aborted) setIsLoading(false);
      }
  };



  useEffect(() => {
    if (isOpen) {
      setShowFeedback(false);
      setFeedbackText('');
      fetchRecommendations();
    }
    return () => requestRef.current?.abort();
  }, [isOpen, alert]);


  if (!isOpen) {
    return null;
  }

  const handleCreatePlan = () => {
    onCreatePlan(alert);
    onClose();
  }

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Feedback submitted:", feedbackText); // In real app, send this to backend/AI
    setShowFeedback(false);
    fetchRecommendations(feedbackText);
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 transition-opacity p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-5xl mx-auto p-6 md:p-8 transform transition-all flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="flex-shrink-0 flex items-start justify-between pb-4 border-b border-slate-200">
            <div className="flex items-center">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                    <LightBulbIcon className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="ml-4">
                    <h3 className="text-lg leading-6 font-bold text-gray-900" id="modal-title">
                        Rekomendasi Intervensi CERIA
                    </h3>
                     <p className="text-sm text-gray-500">{alert.title} - {alert.region}</p>
                     {analysisMetadata?.savedAt && <p className="text-xs text-gray-500">{analysisMetadata.cached ? 'Analisis AI tersimpan' : 'Analisis AI'} · {new Date(analysisMetadata.savedAt).toLocaleString('id-ID')}</p>}
                </div>
            </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
        </div>

        {/* SCROLLABLE CONTENT AREA */}
        <div className="my-6 flex-grow overflow-y-auto pr-4 -mr-4">
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                <p className="mt-4 text-gray-600">Menyiapkan hasil rekomendasi AI...</p>
            </div>
          )}
          {error && <div role="alert" className="text-center"><p className="text-red-500">{error}</p><button onClick={() => fetchRecommendations()} className="mt-3 text-indigo-700 font-semibold">Coba lagi</button></div>}
          {recommendationData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
                {/* Left Column: Chart & Justification */}
                <div className="space-y-6 flex flex-col">
                    {recommendationData.projectedRiskScore !== null && <div>
                        <h4 className="text-base font-bold text-slate-800">Proyeksi Dampak Intervensi</h4>
                        <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                            <ImpactChart currentScore={alert.riskScore} projectedScore={recommendationData.projectedRiskScore} />
                            <div className="text-center mt-2">
                                <p className="text-sm text-slate-600">Estimasi Penurunan Skor Risiko:</p>
                                <p className="text-2xl font-bold text-emerald-600">
                                    -{(alert.riskScore - recommendationData.projectedRiskScore).toFixed(1)} Poin
                                </p>
                            </div>
                        </div>
                    </div>}
                    <div>
                        <h4 className="text-base font-bold text-slate-800">Justifikasi Strategis</h4>
                        <div className="mt-2 prose prose-sm max-w-none text-gray-700">
                            <p>{recommendationData.justification}</p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Recommendations */}
                <div className="space-y-4 flex flex-col min-h-0">
                    <h4 className="text-base font-bold text-slate-800 flex-shrink-0">Rekomendasi Aksi</h4>
                     <div className="prose prose-sm max-w-none text-gray-700 bg-slate-50 p-4 rounded-md flex-grow overflow-y-auto">
                        <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(recommendationData.recommendations.replace(/\n/g, '<br />')) }} />
                    </div>
                </div>
            </div>
          )}
          
            {!isLoading && !error && recommendationData && <div className="mt-4">
                {!showFeedback ? (
                    <button onClick={() => setShowFeedback(true)} className="text-xs text-slate-500 hover:text-indigo-600 hover:underline">
                        Saran tidak sesuai? Berikan masukan untuk analisis ulang.
                    </button>
                ) : (
                    <form onSubmit={handleFeedbackSubmit} className="mt-2 p-3 bg-slate-100 rounded-md">
                        <label htmlFor="feedback" className="block text-sm font-medium text-slate-700">Apa yang membuat analisis ini kurang tepat?</label>
                        <textarea 
                            id="feedback"
                            value={feedbackText}
                            onChange={(e) => setFeedbackText(e.target.value)}
                            rows={2}
                            className="mt-1 block w-full shadow-sm sm:text-sm border-slate-300 rounded-md"
                            placeholder="Contoh: Intervensi ini tidak cocok untuk daerah pesisir..."
                        />
                        <div className="flex justify-end gap-2 mt-2">
                            <button type="button" onClick={() => setShowFeedback(false)} className="px-3 py-1 text-xs font-semibold text-gray-700 bg-white rounded-lg border border-gray-300 hover:bg-gray-50">Batal</button>
                            <button 
                                type="submit" 
                                disabled={isLoading}
                                className="px-3 py-1 text-xs font-semibold text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 disabled:opacity-50"
                            >
                                Kirim & Analisis Ulang
                            </button>

                        </div>
                    </form>
                )}
            </div>}
        </div>
        
        {/* MODAL FOOTER / ACTIONS */}
        <div className="flex-shrink-0 pt-6 border-t border-slate-200 flex flex-col sm:flex-row-reverse gap-3 sm:gap-0 sm:justify-start">
            <button
                type="button"
                onClick={handleCreatePlan}
                className="w-full sm:w-auto sm:ml-3 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                Buat Rencana Intervensi
            </button>
            <button
                type="button"
                className="w-full sm:w-auto px-4 py-2 text-sm font-semibold text-gray-700 bg-white rounded-lg border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={onClose}
            >
                Tutup
            </button>
        </div>
      </div>
    </div>
  );
};

export default RecommendationModal;
