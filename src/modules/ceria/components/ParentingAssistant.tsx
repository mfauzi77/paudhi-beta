import { sanitizeHtml } from '../../../utils/sanitizeHtml';
import React, { useState, useEffect, useRef } from 'react';
import { callAIChat } from '../services/geminiService';
import { HeartIcon } from './icons/Icons';

interface ChatMessage {
    role: 'user' | 'model';
    content: string;
}

interface ParentingAssistantProps {
    onBack: () => void;
}

export default function ParentingAssistant({ onBack }: ParentingAssistantProps) {
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [cooldown, setCooldown] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);


    // Initialize Chat
    useEffect(() => {
        setChatHistory([{
            role: 'model',
            content: "Halo! Saya adalah Asisten Pengasuhan AI. Saya di sini untuk membantu Ayah/Bunda/Pendidik dengan pertanyaan seputar tumbuh kembang dan pola asuh anak. Ada yang bisa saya bantu?"
        }]);
    }, []);
    
    const handleSendMessage = async (messageText: string) => {
        if (isLoading || !messageText.trim() || cooldown) return;

        // Abort previous request if still in flight
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        setIsLoading(true);
        setError(null);
        setUserInput('');

        const userMessage: ChatMessage = { role: 'user', content: messageText };
        const updatedHistory = [...chatHistory, userMessage];
        setChatHistory([...updatedHistory, { role: 'model', content: '' }]);

        try {
            // ... (systemInstruction remains same)
            const systemInstruction = `Kamu adalah asisten AI yang ramah, empatik, dan profesional.
Berperan sebagai konselor keluarga yang membantu orang tua, pendidik, dan pengasuh memahami serta menerapkan pengasuhan anak yang positif.

Fokus utama kamu adalah memberikan panduan, dukungan emosional, dan wawasan praktis seputar:
1. Parenting dan pola asuh positif
2. Tumbuh kembang anak usia dini
3. Komunikasi dalam keluarga
4. Pengembangan anak usia dini (PAUD)
5. Dukungan emosional dan kesejahteraan anak

Gunakan bahasa yang hangat, mudah dipahami, dan tidak menggurui.
Berikan saran yang konkret dan berbasis ilmu.
Jika memungkinkan, sertakan contoh nyata dalam konteks kehidupan keluarga.

Hindari topik di luar pengasuhan anak, seperti politik, agama, atau isu sosial yang tidak relevan.
Jika ada pertanyaan di luar topik tersebut, tolak dengan sopan dan arahkan kembali ke tema pengasuhan anak.

Tulis jawabannya dalam paragraf yang rapi dan mudah dibaca. Jangan gunakan format Markdown seperti heading (#, ##), bold (**), atau miring (*, /).
Gunakan tanda strip (-) atau angka untuk daftar jika diperlukan.`;

            const modelResponse = await callAIChat({
                history: chatHistory.map((m: ChatMessage) => ({
                    role: m.role,
                    parts: [{ text: m.content }]
                })),
                message: messageText,
                systemInstruction,
                signal: abortControllerRef.current.signal
            });

            setChatHistory([...updatedHistory, { role: 'model', content: modelResponse }]);
            
            // SOP: 2s cooldown
            setCooldown(true);
            setTimeout(() => setCooldown(false), 2000);
        } catch (e: any) {
            if (e.name === 'AbortError') return;
            console.error(e);
            const errorMessage = "Maaf, terjadi kesalahan saat berkomunikasi dengan AI. Silakan coba lagi.";
            setError(errorMessage);
            setChatHistory([...updatedHistory, { role: 'model', content: errorMessage }]);
        } finally {
            setIsLoading(false);
            abortControllerRef.current = null;
        }
    };

    
    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSendMessage(userInput);
    };

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory, isLoading]);
    
    const starterPrompts = [
        "Bagaimana cara mengatasi anak tantrum?",
        "Stimulasi apa yang cocok untuk anak usia 2 tahun?",
        "Tips komunikasi positif dengan anak.",
    ];
    
    const TypingIndicator = () => (
        <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse"></div>
        </div>
    );
    
    return (
        <div className="flex flex-col h-full bg-white rounded-lg shadow-sm">
            <div className="flex-shrink-0 p-4 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center">
                    <HeartIcon className="w-6 h-6 mr-3 text-pink-500"/>
                    <h2 className="text-xl font-bold text-slate-800">Asisten Pengasuhan AI</h2>
                </div>
                <button onClick={onBack} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">
                    &larr; Kembali ke Pilihan
                </button>
            </div>
            
            <div ref={chatContainerRef} className="flex-grow p-6 overflow-y-auto space-y-6">
                {chatHistory.map((msg: ChatMessage, index: number) => (
                    <div key={index} className={`flex items-end gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'model' && (
                            <div className="flex-shrink-0 w-8 h-8 bg-sky-500 text-white flex items-center justify-center rounded-full">
                                <HeartIcon className="w-5 h-5" />
                            </div>
                        )}
                        <div className={`w-full max-w-xl p-4 ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-2xl rounded-br-none' : 'bg-slate-200 text-slate-800 rounded-2xl rounded-bl-none'}`}>
                             {msg.content ? (
                                <div className={`prose prose-sm max-w-none prose-p:my-2 prose-li:my-1 ${msg.role === 'user' ? 'prose-inverted-user' : ''}`} dangerouslySetInnerHTML={{ __html: sanitizeHtml(msg.content.replace(/\n/g, '<br />')) }} />
                             ) : (
                                <TypingIndicator />
                             )}
                        </div>
                    </div>
                ))}
                 {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            </div>

            {chatHistory.length <= 1 && (
                <div className="p-6 pt-0">
                    <p className="text-sm font-semibold text-slate-500 mb-2">atau coba salah satu dari ini:</p>
                    <div className="flex flex-wrap gap-2">
                        {starterPrompts.map(prompt => (
                             <button 
                                key={prompt} 
                                onClick={() => handleSendMessage(prompt)} 
                                disabled={isLoading || cooldown}
                                className="px-3 py-1.5 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
                            >
                                {prompt}
                             </button>
                        ))}

                    </div>
                </div>
            )}

            <div className="flex-shrink-0 p-4 border-t border-slate-200 bg-slate-50">
                <form onSubmit={handleFormSubmit} className="relative">
                    <textarea
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleFormSubmit(e);
                            }
                        }}
                        disabled={isLoading}
                        rows={1}
                        placeholder="Tanyakan seputar pengasuhan anak..."
                        className="w-full p-3 pr-12 text-sm text-slate-800 border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 resize-none bg-white"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !userInput.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors"
                        aria-label="Kirim pesan"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                           <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                    </button>
                </form>
                <p className="text-xs text-slate-400 text-center mt-2">Asisten AI dapat membuat kesalahan. Selalu konsultasi dengan profesional untuk isu kesehatan.</p>
            </div>
        </div>
    );
};