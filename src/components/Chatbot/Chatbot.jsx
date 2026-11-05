import React, { useEffect, useRef, useState } from 'react';
import { callGeminiAPI, faqData, searchFAQ } from './geminiAPI-PAUD';

// Chatbot Component dengan integrasi AI yang lebih clean
const Chatbot = () => {
  // State untuk mengelola visibilitas chatbot
  const [isOpen, setIsOpen] = useState(false);
  // State untuk menyimpan daftar pesan dalam obrolan
  const [messages, setMessages] = useState([]);
  // State untuk mengelola input teks pengguna saat ini
  const [currentInput, setCurrentInput] = useState('');
  // State untuk melacak langkah obrolan saat ini
  const [chatStep, setChatStep] = useState('greeting');
  // State untuk menyimpan informasi pengguna untuk formulir kontak
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    whatsapp: '',
    question: ''
  });
  // State untuk mengontrol tampilan formulir kontak
  const [showContactForm, setShowContactForm] = useState(false);
  // State untuk status typing indicator
  const [isTyping, setIsTyping] = useState(false);
  // Ref untuk menggulir pesan obrolan ke bawah secara otomatis
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const openHandler = () => setIsOpen(true);
    window.addEventListener('open-chatbot', openHandler);
    return () => window.removeEventListener('open-chatbot', openHandler);
  }, []);

  // Fungsi untuk menggulir tampilan pesan ke paling bawah
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Efek untuk menggulir ke bawah setiap kali ada pesan baru
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Efek untuk menampilkan pesan pembuka saat chatbot dibuka
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setTimeout(() => {
        addBotMessage("Halo! Selamat datang di SISMONEV PAUDHI. Saya asisten virtual yang siap membantu Anda!");
        setTimeout(() => {
          addBotMessage("Saya didukung oleh AI dan memiliki pengetahuan lengkap tentang PAUDHI untuk menjawab pertanyaan Anda seputar pengasuhan anak dan layanan SISMONEV PAUDHI.");
          setTimeout(() => {
            addBotMessage("Silakan pilih jenis bantuan yang Anda butuhkan:", true);
          }, 1500);
        }, 1000);
      }, 500);
    }
  }, [isOpen, messages.length]);

  // Fungsi untuk menambahkan pesan dari bot ke daftar pesan
  const addBotMessage = (message, showOptions = false) => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      type: 'bot',
      message,
      showOptions,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    }]);
  };

  // Fungsi untuk menambahkan pesan dari pengguna ke daftar pesan
  const addUserMessage = (message) => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      type: 'user',
      message,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    }]);
  };

  // Handler saat opsi menu diklik
  const handleOptionClick = (option) => {
    addUserMessage(option.label);

    if (option.type === 'faq-list') {
      setChatStep('faq-list');
      setTimeout(() => {
        addBotMessage("Berikut adalah daftar FAQ PAUDHI. Klik salah satu untuk melihat jawabannya:", true);
      }, 500);
    } else if (option.type === 'faq-item') {
      const faq = faqData.find(f => f.id === option.faqId);
      if (faq) {
        setTimeout(() => {
          addBotMessage(`**${faq.question}**\n\n${faq.answer}`);
          setTimeout(() => {
            addBotMessage("Apakah informasi ini membantu? Ada pertanyaan lain yang ingin ditanyakan?", true);
            setChatStep('greeting'); // Return to main menu
          }, 1500);
        }, 500);
      }
    } else if (option.type === 'more-faq') {
      // Show remaining FAQs
      setTimeout(() => {
        const remainingFAQs = faqData.slice(5);
        remainingFAQs.forEach((faq, index) => {
          setTimeout(() => {
            addBotMessage(`**${faq.question}**\n\n${faq.answer}`);
          }, index * 1000);
        });
        setTimeout(() => {
          addBotMessage("Itu semua FAQ yang tersedia. Ada pertanyaan lain?", true);
          setChatStep('greeting');
        }, remainingFAQs.length * 1000 + 500);
      }, 500);
    } else if (option.type === 'ai-chat') {
      setChatStep('ai-chat');
      setTimeout(() => {
        if (chatStep === 'ai-chat') {
          // User is already in AI chat and wants to ask again
          addBotMessage("💬 Silakan ketik pertanyaan baru Anda di kolom input di bawah!");
        } else {
          // User is entering AI chat mode for the first time
          addBotMessage("💬 Mode AI Chat aktif! Silakan ketik pertanyaan Anda seputar pengasuhan anak atau layanan PAUDHI. Saya akan membantu menjawab berdasarkan pengetahuan lengkap tentang PAUDHI.");
        }
      }, 500);
    } else if (option.type === 'example-question') {
      // Handle example questions
      handleAIChat(option.question);
    } else if (option.type === 'whatsapp') {
      setChatStep('whatsapp');
      setTimeout(() => {
        addBotMessage("Hubungi Staf Kami via WhatsApp:");
        setTimeout(() => {
          addBotMessage("Klik tombol di bawah untuk langsung chat dengan staf kami di WhatsApp:", true);
        }, 800);
      }, 500);
    } else if (option.type === 'whatsapp-direct') {
      const waNumber = '6281112345678';
      const waMessage = encodeURIComponent('Halo, saya ingin bertanya tentang SISMONEV PAUDHI...');
      window.open(`https://wa.me/${waNumber}?text=${waMessage}`, '_blank');

      addBotMessage("✅ WhatsApp telah dibuka di tab baru. Jika tidak terbuka otomatis, hubungi kami di: 0811-1234-5678");
      setTimeout(() => {
        addBotMessage("Ada yang bisa saya bantu lagi?", true);
        setChatStep('greeting');
      }, 2000);
    } else if (option.type === 'contact-form') {
      setShowContactForm(true);
      addBotMessage("Silakan isi form di bawah dengan lengkap, tim kami akan menghubungi Anda dalam 1x24 jam:", true);
    } else if (option.type === 'back-menu') {
      setChatStep('greeting');
      setShowContactForm(false); // Reset form jika user kembali ke menu utama
      setTimeout(() => {
        addBotMessage("Silakan pilih jenis bantuan yang Anda butuhkan:", true);
      }, 500);
    } else if (option.type === 'feedback-yes') {
      setTimeout(() => {
        addBotMessage("Terima kasih! Senang bisa membantu Anda. 😊");
        setTimeout(() => {
          addBotMessage("Ada pertanyaan lain yang ingin ditanyakan?", true);
          setChatStep('greeting'); // Return to greeting untuk opsi menu utama
        }, 1000);
      }, 500);
    } else if (option.type === 'feedback-no') {
      setTimeout(() => {
        addBotMessage("Mohon maaf jawaban saya kurang membantu. 🙏");
        setTimeout(() => {
          addBotMessage("Silakan coba ajukan pertanyaan yang lebih spesifik", true);
          setChatStep('greeting'); // Return to greeting untuk opsi menu utama
        }, 1000);
      }, 500);
    }
  };

  // Handler for AI Chat menggunakan callGeminiAPI yang sudah terintegrasi
  const handleAIChat = async (userMessage) => {
    if (!userMessage || userMessage.trim() === '') {
      return;
    }

    addUserMessage(userMessage);
    setIsTyping(true);
    
    try {
      // Menggunakan callGeminiAPI yang sudah terintegrasi dengan fallback FAQ
      const aiResponse = await callGeminiAPI(userMessage);
      addBotMessage(aiResponse);
      
      // Tambahkan feedback dan menu utama setelah AI menjawab
      setTimeout(() => {
        addBotMessage("Apakah jawaban ini membantu?", true);
      }, 1500);
      
    } catch (error) {
      console.error("Error in handleAIChat:", error);
      
      // Fallback tambahan jika callGeminiAPI gagal
      const relevantFAQs = searchFAQ(userMessage);
      if (relevantFAQs.length > 0) {
        const bestMatch = relevantFAQs[0];
        addBotMessage(`📋 Berdasarkan FAQ PAUDHI:\n\n**${bestMatch.question}**\n\n${bestMatch.answer}\n\n💡 *AI sedang tidak tersedia, jawaban dari database FAQ.*`);
      } else {
        addBotMessage("❌ Maaf, ada masalah saat memproses pertanyaan Anda. Silakan coba lagi nanti.");
      }
      
      setTimeout(() => {
        addBotMessage("💡 Alternatif: Coba lihat FAQ", true);
      }, 1000);
    } finally {
      setIsTyping(false);
    }

    setCurrentInput('');
  };

  // Handler untuk pengiriman formulir kontak
  const handleContactFormSubmit = () => {
    if (!userInfo.name || !userInfo.email || !userInfo.whatsapp || !userInfo.question) {
      addBotMessage('Mohon lengkapi semua field yang diperlukan.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userInfo.email)) {
      addBotMessage('Format email tidak valid');
      return;
    }

    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(userInfo.whatsapp)) {
      addBotMessage('Format nomor WhatsApp tidak valid');
      return;
    }

    addUserMessage(`Form Kontak: Nama: ${userInfo.name}, Email: ${userInfo.email}, WhatsApp: ${userInfo.whatsapp}, Pertanyaan: ${userInfo.question}`);

    setShowContactForm(false);
    setChatStep('completed');

    setTimeout(() => {
      addBotMessage("Terima kasih! Form kontak Anda telah berhasil dikirim.");
      setTimeout(() => {
        addBotMessage(`Ringkasan: Nama: ${userInfo.name}, Email: ${userInfo.email}, WhatsApp: ${userInfo.whatsapp}, Pertanyaan: ${userInfo.question}. Tim support kami akan menghubungi Anda dalam 1x24 jam. Ada yang bisa saya bantu lagi?`, true);
      }, 1500);
    }, 500);

    setUserInfo({ name: '', email: '', whatsapp: '', question: '' });
  };

  // Fungsi untuk mendapatkan opsi menu berdasarkan langkah obrolan saat ini
  const getMenuOptions = () => {
    if (chatStep === 'greeting') {
      return [
        { label: "💬 Tanya Apa Saja (AI Chat)", type: "ai-chat" },
        { label: "📋 Lihat FAQ PAUDHI", type: "faq-list" },
        // { label: "📱 Tanya via WhatsApp Staf", type: "whatsapp" },
        // { label: "📝 Isi Form Kontak", type: "contact-form" }
      ];
    }

    if (chatStep === 'faq-list') {
      const faqOptions = faqData.slice(0, 5).map(faq => ({
        label: `❓ ${faq.question}`,
        type: "faq-item",
        faqId: faq.id
      }));
      
      return [
        ...faqOptions,
        { label: "📝 Lihat FAQ Lainnya", type: "more-faq" },
        { label: "💬 Tanya AI Chat", type: "ai-chat" },
        { label: "🔙 Kembali ke Menu Utama", type: "back-menu" }
      ];
    }

    if (chatStep === 'ai-chat') {
      return [
        { label: "👍 Ya", type: "feedback-yes" },
        { label: "👎 Tidak", type: "feedback-no" },
        { label: "🔙 Menu Utama", type: "back-menu" }
      ];
    }

    if (chatStep === 'whatsapp') {
      return [
        { label: "📱 Buka WhatsApp Sekarang", type: "whatsapp-direct" },
        { label: "📝 Isi Form Kontak Saja", type: "contact-form" },
        { label: "🔙 Kembali ke Menu Utama", type: "back-menu" }
      ];
    }

    if (chatStep === 'completed') {
      return [
        { label: "💬 Ajukan Pertanyaan Baru", type: "ai-chat" },
        { label: "📋 Lihat FAQ", type: "faq-list" },
        { label: "📱 Chat WhatsApp", type: "whatsapp" }
      ];
    }

    // Untuk contact form, tampilkan menu utama
    if (showContactForm) {
      return [
        { label: "🔙 Menu Utama", type: "back-menu" }
      ];
    }

    return [];
  };

  // Typing Indicator Component
  const TypingIndicator = () => (
    <div className="flex justify-start">
      <div className="max-w-[85%]">
        <div className="bg-white text-gray-800 rounded-xl sm:rounded-2xl rounded-bl-sm border border-gray-200 p-2 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3 text-gray-600">
            <span className="text-xs sm:text-base">Asisten sedang mengetik</span>
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Tombol pembuka/penutup Chatbot - Mobile 30% lebih kecil */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-4 right-4 sm:bottom-7 sm:right-7 w-12 h-12 sm:w-20 sm:h-20 rounded-full shadow-lg transition-all duration-300 z-50 flex items-center justify-center group ${
          isOpen
            ? 'bg-red-500 hover:bg-red-600 transform rotate-45'
            : 'bg-gradient-to-r from-blue-600 to-emerald-600 hover:shadow-xl hover:-translate-y-1'
        }`}
      >
        {isOpen ? (
          <div className="text-white text-lg sm:text-2xl transform -rotate-45">✕</div>
        ) : (
          <>
            <div className="text-white text-lg sm:text-2xl group-hover:scale-110 transition-transform">💬</div>
            <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-3 h-3 sm:w-5 sm:h-5 bg-red-500 rounded-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 bg-white rounded-full animate-pulse"></div>
            </div>
          </>
        )}
      </button>

      {/* Kontainer Chatbot - Mobile 30% lebih kecil */}
      <div className={`fixed bottom-16 right-2 sm:bottom-28 sm:right-7 w-[calc(100vw-1rem)] max-w-[20rem] sm:w-[28.8rem] sm:max-w-[calc(100vw-2.4rem)] h-[70vh] max-h-[420px] sm:h-[600px] sm:max-h-[calc(100vh-9.6rem)] bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-gray-200 transition-all duration-300 z-40 flex flex-col ${
        isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'
      }`}>

        {/* Header Chatbot - Mobile compact */}
        <div className="bg-gradient-to-r from-blue-600 to-emerald-600 p-3 sm:p-5 rounded-t-xl sm:rounded-t-2xl text-white">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center">
              <div className="text-sm sm:text-xl">🤖</div>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-sm sm:text-lg">Asisten PAUDHI</h3>
              <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-base text-blue-100">
                <div className="w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 bg-green-400 rounded-full animate-pulse"></div>
                AI + FAQ Online
              </div>
            </div>
          </div>
        </div>

        {/* Area Pesan Chatbot - Mobile compact */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-5 space-y-2 sm:space-y-5 bg-gray-50">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                <div className={`p-2 sm:p-4 rounded-xl sm:rounded-2xl ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-white text-gray-800 rounded-bl-sm border border-gray-200'
                }`}>
                  <div className="whitespace-pre-line text-xs sm:text-base">{message.message}</div>
                  <div className={`text-xs sm:text-sm mt-1 sm:mt-1.5 ${message.type === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                    {message.timestamp}
                  </div>
                </div>

                {/* Opsi menu jika ditampilkan oleh bot - Mobile compact */}
                {message.type === 'bot' && message.showOptions && (
                  <div className="mt-2 sm:mt-4 space-y-1.5 sm:space-y-2.5">
                    {getMenuOptions().map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleOptionClick(option)}
                        className="block w-full text-left p-2 sm:p-3 text-xs sm:text-base bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {/* Typing Indicator */}
          {isTyping && <TypingIndicator />}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Formulir Kontak - Mobile compact */}
        {showContactForm && (
          <div className="p-2 sm:p-5 border-t border-gray-200 bg-white">
            <div className="space-y-2 sm:space-y-4">
              <input
                type="text"
                placeholder="Nama Lengkap *"
                value={userInfo.name}
                onChange={(e) => setUserInfo(prev => ({...prev, name: e.target.value}))}
                className="w-full p-2 sm:p-3 text-sm sm:text-base border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              />
              <input
                type="email"
                placeholder="Email *"
                value={userInfo.email}
                onChange={(e) => setUserInfo(prev => ({...prev, email: e.target.value}))}
                className="w-full p-2 sm:p-3 text-sm sm:text-base border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              />
              <input
                type="tel"
                placeholder="Nomor WhatsApp *"
                value={userInfo.whatsapp}
                onChange={(e) => setUserInfo(prev => ({...prev, whatsapp: e.target.value}))}
                className="w-full p-2 sm:p-3 text-sm sm:text-base border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              />
              <textarea
                placeholder="Pertanyaan / Keluhan *"
                value={userInfo.question}
                onChange={(e) => setUserInfo(prev => ({...prev, question: e.target.value}))}
                className="w-full p-2 sm:p-3 text-sm sm:text-base border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none h-16 sm:h-24 resize-none"
              />
              <div className="flex gap-1.5 sm:gap-2.5">
                <button
                  onClick={() => setShowContactForm(false)}
                  className="flex-1 p-2 sm:p-3 text-sm sm:text-base bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleContactFormSubmit}
                  className="flex-1 p-2 sm:p-3 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Kirim
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Input teks untuk AI Chat - Mobile compact */}
        {chatStep === 'ai-chat' && !showContactForm && (
          <div className="p-2 sm:p-5 border-t border-gray-200 bg-white rounded-b-xl sm:rounded-b-2xl">
            <div className="flex gap-1.5 sm:gap-2.5">
              <input
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && currentInput.trim()) {
                    handleAIChat(currentInput);
                  }
                }}
                placeholder="Ketik pertanyaan Anda..."
                className="flex-1 p-2 sm:p-4 text-sm sm:text-base border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none"
                autoFocus
                disabled={isTyping}
              />
              <button
                onClick={() => handleAIChat(currentInput)}
                disabled={!currentInput.trim() || isTyping}
                className="px-3 py-2 sm:px-5 sm:py-4 bg-blue-600 text-white text-sm sm:text-lg rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ➤
              </button>
            </div>
          </div>
        )}

        {/* Opsi cepat di bagian bawah chatbot - Mobile compact */}
        {(chatStep === 'greeting' || chatStep === 'faq-list' || chatStep === 'completed') && !showContactForm && (
          <div className="p-2 sm:p-4 border-t border-gray-200 bg-white rounded-b-xl sm:rounded-b-2xl">
            <div className="flex gap-1.5 sm:gap-2.5 text-xs sm:text-sm">
              {/* <button
                onClick={() => {
                  const waNumber = '6281112345678';
                  const waMessage = encodeURIComponent('Halo, saya ingin bertanya tentang SISMONEV PAUDHI...');
                  window.open(`https://wa.me/${waNumber}?text=${waMessage}`, '_blank');
                }}
                className="flex-1 p-1.5 sm:p-2.5 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                📱 WhatsApp
              </button> */}
              {/* <button
                onClick={() => {
                  addUserMessage("🕐 Jam operasional");
                  setTimeout(() => {
                    addBotMessage("Jam Operasional: Senin-Jumat 08:00-17:00 WIB, Sabtu 08:00-12:00 WIB, Minggu Tutup. Hotline Darurat: 129 (24/7). Chatbot tersedia 24/7!");
                  }, 500);
                }}
                className="flex-1 p-1.5 sm:p-2.5 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                🕐 Jam Kerja
              </button> */}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Chatbot;