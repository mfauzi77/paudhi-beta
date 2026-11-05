import React,{ useEffect,useState } from 'react';
import { ArrowRightIcon,SparklesIcon } from './icons/Icons';

interface WelcomeScreenProps {
    onDashboardNavigate: () => void;
    onAiAgentNavigate: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onDashboardNavigate, onAiAgentNavigate }) => {
    const [phase, setPhase] = useState('entering'); // 'entering', 'entered', 'exiting'

    useEffect(() => {
        const enterTimeout = requestAnimationFrame(() => setPhase('entered'));
        return () => cancelAnimationFrame(enterTimeout);
    }, []);
    
    const handleDashboardClick = () => {
        setPhase('exiting');
        setTimeout(onDashboardNavigate, 500); 
    };

    const handleAiAgentClick = () => {
        setPhase('exiting');
        setTimeout(onAiAgentNavigate, 500);
    };

    const isVisible = phase === 'entered' || phase === 'exiting';
    const isExiting = phase === 'exiting';
    
    return (
        <div 
            className={`fixed inset-0 bg-slate-100 flex flex-col lg:flex-row z-50 transition-opacity duration-500 ease-in-out ${isExiting ? 'opacity-0' : 'opacity-100'}`}
            role="dialog"
        >
            {/* Left Panel - AI Agent */}
            <div className={`w-full lg:w-1/2 bg-gradient-to-br from-slate-800 to-slate-900 text-white flex flex-col items-center justify-center p-8 lg:p-12 text-center relative overflow-hidden transition-transform duration-700 ease-out ${isVisible && !isExiting ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
                <div className={`relative transition-all duration-700 ease-out delay-300 ${isVisible && !isExiting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <div className="mx-auto bg-indigo-500/20 text-indigo-300 p-4 rounded-full inline-block">
                        <SparklesIcon className="w-10 h-10" />
                    </div>
                </div>
                <h2 className={`text-2xl md:text-3xl font-bold mt-6 transition-all duration-700 ease-out delay-500 ${isVisible && !isExiting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>Asisten AI CERIA</h2>
                <p className={`mt-2 max-w-sm text-slate-300 transition-all duration-700 ease-out delay-700 ${isVisible && !isExiting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    Ajukan pertanyaan, minta analisis data, atau diskusikan strategi intervensi secara langsung dengan asisten cerdas kami.
                </p>
                <div className={`mt-8 transition-all duration-700 ease-out delay-[900ms] ${isVisible && !isExiting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <button 
                        onClick={handleAiAgentClick}
                        className="group flex items-center justify-center w-full sm:w-auto bg-indigo-500 font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-indigo-400 transform hover:scale-105 transition-all duration-300 ease-in-out"
                    >
                        Diskusikan dengan AI
                        <ArrowRightIcon className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                    </button>
                    <p className="text-xs text-slate-400 mt-2">Masuk ke halaman pilihan asisten AI</p>
                </div>
            </div>

            {/* Right Panel - Dashboard */}
            <div className={`w-full lg:w-1/2 bg-white flex flex-col items-center justify-center p-8 lg:p-12 text-center relative overflow-hidden transition-transform duration-700 ease-out ${isVisible && !isExiting ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className={`transition-all duration-700 ease-out delay-300 ${isVisible && !isExiting ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                    <img src="/images/logo.png" alt="Logo Kemenko PMK" className="h-24 md:h-28 w-auto mb-4 object-contain"/>
                </div>
                <h1 className={`text-2xl md:text-3xl font-bold text-slate-800 transition-all duration-700 ease-out delay-500 ${isVisible && !isExiting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>Dashboard Analitik CERIA</h1>
                <p className={`mt-2 max-w-sm text-slate-500 transition-all duration-700 ease-out delay-700 ${isVisible && !isExiting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    Visualisasikan data, pantau risiko, dan kelola intervensi di seluruh Indonesia untuk pengambilan keputusan berbasis data.
                </p>
                <div className={`mt-8 transition-all duration-700 ease-out delay-[900ms] ${isVisible && !isExiting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <button 
                        onClick={handleDashboardClick}
                        className="group flex items-center justify-center w-full sm:w-auto bg-amber-400 text-slate-800 font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-amber-500 transform hover:scale-105 transition-all duration-300 ease-in-out"
                    >
                        Masuk ke Dashboard
                        <ArrowRightIcon className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                    </button>
                    <p className="text-xs text-slate-500 mt-2">Masuk ke dashboard utama</p>
                </div>
            </div>
        </div>
    );
};

export default WelcomeScreen;