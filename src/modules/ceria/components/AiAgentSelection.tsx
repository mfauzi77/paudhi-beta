import React from 'react';
import { SparklesIcon, HeartIcon, ArrowRightIcon } from './icons/Icons';

interface AiAgentSelectionProps {
    onNavigateToCeria: () => void;
    onNavigateToParenting: () => void;
    onExit: () => void;
}

const SelectionCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    description: string;
    onClick: () => void;
    buttonText: string;
    className?: string;
}> = ({ icon, title, description, onClick, buttonText, className }) => (
    <div className={`flex flex-col items-center justify-center p-8 lg:p-12 text-center relative overflow-hidden transition-all duration-300 group ${className}`}>
        <div className="relative z-10 flex flex-col items-center">
            <div className="p-4 rounded-full inline-block bg-white/10 group-hover:bg-white/20 transition-all">
                {icon}
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mt-6">{title}</h2>
            <p className="mt-2 max-w-sm text-slate-300">{description}</p>
            <div className="mt-8">
                <button
                    onClick={onClick}
                    className="flex items-center justify-center w-full sm:w-auto bg-white text-slate-800 font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-slate-200 transform hover:scale-105 transition-all duration-300 ease-in-out"
                >
                    {buttonText}
                    <ArrowRightIcon className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
            </div>
        </div>
    </div>
);


const AiAgentSelection: React.FC<AiAgentSelectionProps> = ({ onNavigateToCeria, onNavigateToParenting, onExit }) => {
    return (
        <div className="h-full flex flex-col lg:flex-row bg-slate-100 relative">
            <button
                onClick={onExit}
                className="absolute top-6 left-6 z-20 bg-black/20 text-white p-3 rounded-full hover:bg-black/40 transition-colors"
                title="Kembali ke Halaman Utama"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
            </button>

            <div className="w-full lg:w-1/2 bg-gradient-to-br from-indigo-600 to-purple-700 text-white relative">
                 <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
                 <SelectionCard
                    icon={<SparklesIcon className="w-10 h-10 text-white" />}
                    title="Rekomendasi Ceria"
                    description="Asisten AI untuk membantu pembuat kebijakan, kader, dan peneliti dalam menganalisis data dan menyusun rencana intervensi PAUDHI."
                    onClick={onNavigateToCeria}
                    buttonText="Mulai Diskusi Kebijakan"
                />
            </div>
            <div className="w-full lg:w-1/2 bg-gradient-to-br from-sky-600 to-cyan-700 text-white relative">
                <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
                <SelectionCard
                    icon={<HeartIcon className="w-10 h-10 text-white" />}
                    title="Asisten Pengasuhan AI"
                    description="Asisten AI khusus untuk orang tua, pengasuh, dan pendidik, yang fokus pada topik tumbuh kembang dan pola asuh anak."
                    onClick={onNavigateToParenting}
                    buttonText="Mulai Diskusi Pengasuhan"
                />
            </div>
        </div>
    );
};

export default AiAgentSelection;