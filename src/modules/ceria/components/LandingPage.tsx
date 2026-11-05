import React from 'react';
import {
ArrowRightIcon,
BeakerIcon,
BoltIcon,
BriefcaseIcon,
CircleStackIcon,
CpuChipIcon,
DocumentArrowDownIcon,
ExclamationTriangleIcon,
HandThumbUpIcon,
HeartIcon,
LightBulbIcon,
LinkIcon,
MagnifyingGlassIcon,
MapPinIcon,
SparklesIcon,
TrendingUpIcon,
TrophyIcon,
UsersIcon,
VideoCameraIcon
} from './icons/Icons';

interface LandingPageProps {
  onNavigate: () => void;
}

// Fix: Made children prop optional to resolve a confusing typescript error.
const SectionCard = ({ icon, title, children }: { icon: React.ReactNode, title: string, children?: React.ReactNode }) => (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        <div className="flex items-center mb-4">
            <div className="bg-indigo-100 text-indigo-600 p-3 rounded-full">
                {icon}
            </div>
            <h2 className="ml-4 text-xl md:text-2xl font-bold text-slate-800">{title}</h2>
        </div>
        <div className="prose prose-slate max-w-none prose-p:text-slate-600 prose-li:text-slate-600 prose-strong:text-slate-700">
            {children}
        </div>
    </div>
);

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <div className="bg-slate-100 p-6 rounded-lg text-center">
        <div className="inline-block bg-white text-indigo-500 p-4 rounded-full">
            {icon}
        </div>
        <h3 className="mt-4 text-lg font-bold text-slate-800">{title}</h3>
        <p className="mt-1 text-sm text-slate-600">{description}</p>
    </div>
);

const UserCard = ({ icon, title }: { icon: React.ReactNode, title: string }) => (
     <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 text-center transform hover:scale-105 transition-transform duration-300">
        <div className="inline-block bg-indigo-100 text-indigo-600 p-4 rounded-full">
            {icon}
        </div>
        <h3 className="mt-4 font-bold text-slate-700">{title}</h3>
    </div>
);

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
    return (
        <div className="bg-slate-50">
            <header className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white text-center py-20 md:py-28 px-6 shadow-2xl overflow-hidden relative">
                <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
                <div className="relative z-10">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight drop-shadow-md">🌱 CERIA (Cerdas, Efektif, Responsif, Inovatif, Akurat)</h1>
                    <p className="mt-4 max-w-3xl mx-auto text-lg text-indigo-200">
                        Dengan Kecerdasan Buatan untuk Anak Usia Dini yang Lebih Sehat, Cerdas, dan Terlindungi
                    </p>
                    <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button onClick={onNavigate} className="flex items-center justify-center w-full sm:w-auto bg-white text-indigo-600 font-bold py-3 px-6 rounded-full shadow-lg hover:bg-indigo-50 transform hover:scale-105 transition-all duration-300">
                            <MagnifyingGlassIcon className="w-5 h-5 mr-2" />
                            Jelajahi Dashboard CERIA
                        </button>
                        <a href="#" className="flex items-center justify-center w-full sm:w-auto bg-black bg-opacity-20 text-white font-bold py-3 px-6 rounded-full hover:bg-opacity-30 transition-colors duration-300">
                           <VideoCameraIcon className="w-5 h-5 mr-2" />
                           Tonton Video Penjelasan
                        </a>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-16 space-y-16">
                <section>
                    <h2 className="text-3xl font-bold text-center text-slate-800 mb-2">💡 Kenapa Kita Butuh CERIA?</h2>
                    <p className="text-center text-slate-500 mb-10 max-w-2xl mx-auto">Menjawab tantangan utama dalam layanan anak usia dini di Indonesia.</p>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <FeatureCard icon={<ExclamationTriangleIcon className="w-8 h-8"/>} title="Data Terfragmentasi" description="Layanan PAUD tersebar di banyak instansi, menyulitkan integrasi program dan pengambilan keputusan holistik."/>
                        <FeatureCard icon={<TrendingUpIcon className="w-8 h-8"/>} title="Intervensi Reaktif" description="Analisis risiko yang lambat dan berbasis laporan tahunan seringkali membuat intervensi terlambat dan tidak tepat sasaran."/>
                        <FeatureCard icon={<UsersIcon className="w-8 h-8"/>} title="Risiko Tak Terpantau" description="Banyak anak dengan risiko ganda (stunting, putus PAUD, dll.) tidak mendapatkan intervensi yang cepat dan terkoordinasi."/>
                        <FeatureCard icon={<SparklesIcon className="w-8 h-8"/>} title="Analisis Kompleks & Lambat" description="Metode tradisional sulit menemukan pola tersembunyi dari jutaan data lintas sektor. AI mampu menganalisis secara cepat, menghasilkan insight yang tidak mungkin ditemukan manual."/>
                    </div>
                </section>
                
                <SectionCard icon={<CpuChipIcon className="w-8 h-8" />} title="🤖 Apa Itu CERIA?">
                    <p>
                        CERIA adalah sistem berbasis AI yang mengintegrasikan data lintas sektor untuk <strong>menganalisis risiko anak usia dini secara cerdas</strong>, <strong>merespons dengan cepat</strong> melalui notifikasi, dan <strong>memberikan rekomendasi intervensi inovatif</strong> yang efektif dan akurat berbasis bukti.
                    </p>
                </SectionCard>

                <SectionCard icon={<CircleStackIcon className="w-8 h-8" />} title="⚙️ Bagaimana CERIA Bekerja?">
                    <div className="grid md:grid-cols-3 gap-6 text-center">
                        <div>
                            <div className="inline-block bg-sky-100 text-sky-700 p-3 rounded-full font-bold">1</div>
                            <h4 className="font-bold mt-2">Input Data</h4>
                            <p className="text-sm">Data dari sektor kesehatan, pendidikan, sosial, kependudukan, hingga lingkungan diintegrasikan.</p>
                        </div>
                         <div>
                            <div className="inline-block bg-indigo-100 text-indigo-700 p-3 rounded-full font-bold">2</div>
                            <h4 className="font-bold mt-2">Pemrosesan AI</h4>
                            <p className="text-sm">Model Machine Learning menganalisis data untuk menghasilkan skor risiko dan prediksi tren.</p>
                        </div>
                         <div>
                            <div className="inline-block bg-emerald-100 text-emerald-700 p-3 rounded-full font-bold">3</div>
                            <h4 className="font-bold mt-2">Output Cerdas</h4>
                            <p className="text-sm">Menghasilkan notifikasi, rekomendasi intervensi, dan visualisasi data di dashboard kebijakan.</p>
                        </div>
                    </div>
                </SectionCard>

                <SectionCard icon={<CpuChipIcon className="w-8 h-8" />} title="Di Balik Layar: Otak Cerdas CERIA">
                    <p>
                        Sistem ini tidak hanya memberikan peringatan, tapi juga memberikan analisis dan rekomendasi intervensi yang tepat berbasis bukti. Untuk melakukan ini, kami menggunakan pendekatan <strong>ensemble learning</strong>, di mana tiga model utama bekerja bersama untuk menghasilkan prediksi yang akurat dan adaptif.
                    </p>
                    <ul className="mt-4 space-y-2">
                        <li><strong>Random Forest:</strong> Model ini bertugas untuk menyisir data dan menemukan variabel-variabel paling penting yang mempengaruhi risiko anak, seperti akses sanitasi atau tingkat partisipasi PAUD.</li>
                        <li><strong>Gradient Boosting:</strong> Bekerja untuk memperkuat akurasi prediksi dengan terus-menerus belajar dari kesalahan prediksi sebelumnya, memastikan skor risiko yang dihasilkan semakin presisi.</li>
                        <li><strong>Neural Network:</strong> Digunakan untuk mengenali pola-pola non-linear yang kompleks dan tersembunyi di dalam data yang mungkin tidak terlihat oleh model lain.</li>
                    </ul>
                    <p className="mt-4">
                        Gabungan ketiga model ini membuat sistem CERIA bisa memprediksi dengan tingkat akurasi tinggi dan tetap adaptif pada pola baru. Hasilnya kemudian disintesis oleh <strong>Generative AI (Google Gemini)</strong> untuk memberikan justifikasi naratif dan rekomendasi yang kontekstual. Karena anak-anak tak bisa menunggu.
                    </p>
                </SectionCard>


                <SectionCard icon={<CircleStackIcon className="w-8 h-8" />} title="📊 Sumber Data & Proses Kami">
                    <p>
                        CERIA mengintegrasikan data dari berbagai sumber resmi untuk menciptakan pandangan holistik. Proses kami memastikan data diolah secara aman dan akurat untuk menghasilkan insight yang dapat diandalkan.
                    </p>
                    <div className="mt-6 grid md:grid-cols-2 gap-x-8 gap-y-6">
                        <div>
                            <h4 className="font-bold text-slate-700">Sumber Data Utama:</h4>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li><strong>Kemenkes:</strong> Data Imunisasi, Stunting, Gizi.</li>
                                <li><strong>Kemendikbud:</strong> Data Partisipasi & Akses PAUD.</li>
                                <li><strong>BPS & Dukcapil:</strong> Data Demografi & Kependudukan.</li>
                                <li><strong>Kemensos:</strong> Data Keluarga Penerima Manfaat.</li>
                                <li><strong>KemenPUPR:</strong> Data Sanitasi & Air Bersih.</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-700">Alur Kerja Sistem:</h4>
                            <div className="mt-2 space-y-2">
                                <div className="flex items-center">
                                    <span className="flex items-center justify-center w-6 h-6 bg-sky-200 text-sky-800 text-xs font-bold mr-3 rounded-full">1</span>
                                    <span>Pengumpulan Data (Data Ingestion)</span>
                                </div>
                                <div className="h-5 w-px bg-slate-300 ml-2.5"></div>
                                <div className="flex items-center">
                                    <span className="flex items-center justify-center w-6 h-6 bg-indigo-200 text-indigo-800 text-xs font-bold mr-3 rounded-full">2</span>
                                    <span>Pemrosesan & Analisis AI</span>
                                </div>
                                 <div className="h-5 w-px bg-slate-300 ml-2.5"></div>
                                <div className="flex items-center">
                                    <span className="flex items-center justify-center w-6 h-6 bg-emerald-200 text-emerald-800 text-xs font-bold mr-3 rounded-full">3</span>
                                    <span>Rekomendasi & Visualisasi</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </SectionCard>

                 <section>
                    <h2 className="text-3xl font-bold text-center text-slate-800 mb-10">🌟 Manfaat CERIA</h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard icon={<BoltIcon className="w-8 h-8" />} title="Cepat" description="Notifikasi real-time untuk anak berisiko."/>
                        <FeatureCard icon={<MapPinIcon className="w-8 h-8" />} title="Tepat Sasaran" description="Skoring risiko membantu pemetaan prioritas."/>
                        <FeatureCard icon={<LinkIcon className="w-8 h-8" />} title="Terintegrasi" description="Satu sistem untuk semua sektor layanan."/>
                        <FeatureCard icon={<LightBulbIcon className="w-8 h-8" />} title="Berbasis Bukti" description="Intervensi disarankan oleh AI, bukan intuisi."/>
                        <FeatureCard icon={<BriefcaseIcon className="w-8 h-8" />} title="Dukung Kebijakan" description="Data akurat untuk perencanaan pemerintah."/>
                        <FeatureCard icon={<HandThumbUpIcon className="w-8 h-8" />} title="Ramah Lapangan" description="Memudahkan kerja kader & pendamping."/>
                    </div>
                </section>

                <SectionCard icon={<UsersIcon className="w-8 h-8" />} title="👥 Untuk Siapa CERIA Dibuat?">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-4">
                        <UserCard icon={<BriefcaseIcon className="w-10 h-10"/>} title="Pemerintah Pusat & Daerah"/>
                        <UserCard icon={<UsersIcon className="w-10 h-10"/>} title="Kader & Tenaga Lapangan"/>
                        <UserCard icon={<HeartIcon className="w-10 h-10"/>} title="Orang Tua & Masyarakat"/>
                        <UserCard icon={<BeakerIcon className="w-10 h-10"/>} title="Akademisi & Peneliti"/>
                    </div>
                </SectionCard>

                <section className="text-center bg-white p-10 rounded-2xl shadow-lg border border-slate-200">
                     <div className="inline-block bg-indigo-100 text-indigo-600 p-4 rounded-full mb-4">
                        <TrophyIcon className="w-10 h-10" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-800">🚀 CERIA: Lompatan Transformasi PAUDHI Indonesia</h2>
                     <p className="mt-4 max-w-3xl mx-auto text-slate-600">
                        CERIA bukan sekadar sistem digital. Ini adalah solusi strategis untuk mempercepat perlindungan dan pengembangan anak Indonesia melalui data yang terintegrasi dan teknologi kecerdasan buatan.
                    </p>
                    <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button onClick={onNavigate} className="flex items-center justify-center w-full sm:w-auto bg-indigo-600 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-indigo-700 transform hover:scale-105 transition-all duration-300">
                           <ArrowRightIcon className="w-5 h-5 mr-2" />
                           Masuk ke Dashboard
                        </button>
                        <a href="#" className="flex items-center justify-center w-full sm:w-auto bg-slate-200 text-slate-700 font-bold py-3 px-6 rounded-full hover:bg-slate-300 transition-colors duration-300">
                           <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
                           Unduh Ringkasan (PDF)
                        </a>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default LandingPage;