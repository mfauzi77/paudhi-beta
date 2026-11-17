// src/App.jsx
import React, { Suspense, lazy, useState } from "react";
import CeriaLoader from "./modules/ceria/components/shared/CeriaLoader";
import { AnimatePresence } from "framer-motion";
import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  Link,
} from "react-router-dom";
import { ArrowRight, Building2, ChevronDown, HeartPulse, Users } from "lucide-react";

// Komponen utama (tetap di-import langsung untuk performance)
import Navigation from "./components/Navigation";
import HeroSection from "./components/HeroSection";
import ServicesSection from "./components/ServicesSection";
import StatsSection from "./components/StatsSection";
import Footer from "./components/Footer";
import NewsSection from "./components/NewsSection";
import KLSection from "./components/KLSection";

// Lazy loading untuk komponen yang tidak critical
const Chatbot = lazy(() => import("./components/Chatbot/Chatbot"));
const EducationSection = lazy(() =>
  import("./components/EducationSection/EducationSection")
);
const FaqPage = lazy(() => import("./components/FAQApp"));
const AboutPage = lazy(() => import("./components/About/AboutPage"));
const MaknaLogo = lazy(() => import("./components/MaknaLogo"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const LoginForm = lazy(() => import("./pages/LoginForm"));
const PublicRanPaudDashboard = lazy(() =>
  import("./pages/ranpaud/PublicRanPaudDashboard")
);
const CeriaPage = lazy(() => import("./pages/CeriaPage"));
const PAUDHIServicePage = lazy(() => import("./pages/paudhi/PAUDHIServicePage"));


// ✅ Import AuthProvider, ProtectedRoute, and ErrorBoundary
import { AuthProvider } from "./pages/contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import { ToastContainer } from "./components/Toast";
import { ToastProvider, useToast } from "./components/ToastContext";
import LoadingSpinner from "./components/LoadingSpinner";
import ServiceWorkerUpdate from "./components/ServiceWorkerUpdate";
const EssentialServicesPage = lazy(() => import("./pages/EssentialServicesPage"));
const NewsDetailPage = lazy(() => import("./pages/NewsDetailPage"));
const PetaDaycarePage = lazy(() => import("./pages/PetaDaycarePage"));
const UserCategoryDashboard = lazy(() => import("./pages/UserCategoryDashboard"));

const userCategories = [
  {
    path: "/dashboard/masyarakat",
    title: "Masyarakat Umum / Orang Tua",
    description: "Akses informasi dan layanan untuk mendukung tumbuh kembang, kesehatan, pendidikan, pengasuhan, dan perlindungan anak usia dini.",
    Icon: Users,
  },
  {
    path: "/dashboard/tenaga",
    title: "Tenaga Pendidik / Kesehatan",
    description: "Akses pedoman, referensi, materi, dan dukungan dalam penyelenggaraan layanan Pengembangan Anak Usia Dini Holistik Integratif.",
    Icon: HeartPulse,
  },
  {
    path: "/dashboard/instansi",
    title: "Instansi Pemerintah",
    description: "Akses data, informasi, koordinasi, serta fasilitas monitoring dan evaluasi penyelenggaraan PAUDHI.",
    Icon: Building2,
  },
];

import PageMetadata from "./components/PageMetadata";
import PageTransition from "./components/PageTransition";
import NotFoundPage from "./pages/NotFoundPage";

function HomePage() {
  const [showUserCategories, setShowUserCategories] = useState(false);

  return (
    <PageTransition>
      <main id="main-content">
      <HeroSection />
      <section aria-labelledby="audience-title" className="bg-white px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-700">Pusat Layanan Terpadu Satu Pintu PAUDHI</p>
            <h2 id="audience-title" className="text-xl font-bold text-gray-900 sm:text-2xl">Anda mengakses layanan sebagai siapa?</h2>
            <button
              type="button"
              aria-expanded={showUserCategories}
              aria-controls="user-category-options"
              onClick={() => setShowUserCategories((visible) => !visible)}
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
            >
              {showUserCategories ? "Tutup pilihan" : "Pilih kategori pengguna"}
              <ChevronDown size={17} className={`transition-transform ${showUserCategories ? "rotate-180" : ""}`} />
            </button>
          </div>
          {showUserCategories && <div id="user-category-options" className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            {userCategories.map(({ path, title, description, Icon }) => (
              <Link key={path} to={path} className="group flex h-full flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2">
                <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700"><Icon size={21} /></span>
                <h3 className="text-base font-semibold text-gray-900">{title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-600">{description}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-700">Pilih kategori <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" /></span>
              </Link>
            ))}
          </div>}
        </div>
      </section>
      <ServicesSection />
      <StatsSection />
      <NewsSection />
      <Suspense
        fallback={
          <LoadingSpinner
            size="lg"
            text="Memuat konten pendidikan..."
            className="py-8"
          />
        }
      >
        <EducationSection />
      </Suspense>
      <KLSection />
      </main>
      <Footer />
    </PageTransition>
  );
}

// 🔁 Komponen pembungkus routing dan chatbot logic
function AppWrapper() {
  const location = useLocation();
  const { toasts, removeToast } = useToast();

  return (
    <>
      <PageMetadata />
      {!location.pathname.startsWith("/admin") && !location.pathname.startsWith("/ceria") && <Navigation />}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard/:category" element={
            <Suspense fallback={<LoadingSpinner size="lg" text="Memuat dashboard..." />}>
              <UserCategoryDashboard />
            </Suspense>
          } />
          <Route path="/education" element={
            <Suspense fallback={<LoadingSpinner size="lg" text="Memuat pembelajaran..." />}>
              <main className="pt-20"><EducationSection /></main>
              <Footer />
            </Suspense>
          } />
          <Route
            path="/peta-daycare"
            element={
              <Suspense fallback={<LoadingSpinner size="lg" text="Memuat peta daycare..." />}>
                <PetaDaycarePage />
              </Suspense>
            }
          />
          <Route
            path="/faq"
            element={
              <Suspense
                fallback={
                  <LoadingSpinner
                    size="lg"
                    text="Memuat FAQ..."
                    className="py-8"
                  />
                }
              >
                <FaqPage />
              </Suspense>
            }
          />
          <Route
            path="/about"
            element={
              <Suspense
                fallback={
                  <LoadingSpinner
                    size="lg"
                    text="Memuat halaman tentang..."
                    className="py-8"
                  />
                }
              >
                <AboutPage />
              </Suspense>
            }
          />
          <Route
             path="/maknalogo"
             element={
              <Suspense
                fallback={
                  <LoadingSpinner
                    size="lg"
                    text="Memuat makna logo..."
                    className="py-8"
                  />
                }
              >
                <MaknaLogo />
              </Suspense>
            }
          />
          {/* Arahkan ke halaman publik untuk kedua route berikut */}
          <Route
            path="/dashboard" element={<Navigate to="/ran-paud-dashboard" replace />} />
          <Route
            path="/ran-paud-dashboard"
            element={
              <Suspense
                fallback={
                  <LoadingSpinner
                    size="lg"
                    text="Memuat dashboard RAN PAUD..."
                    className="py-8"
                  />
                }
              >
                <PublicRanPaudDashboard />
              </Suspense>
            }
          />

          <Route
            path="/admin/*"
            element={
              <ProtectedRoute requiredRoles={["super_admin", "admin"]}>
                <Suspense
                  fallback={
                    <LoadingSpinner
                      size="lg"
                      text="Memuat admin dashboard..."
                      className="py-8"
                    />
                  }
                >
                  <AdminDashboard />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/login"
            element={
              <Suspense
                fallback={
                  <LoadingSpinner
                    size="lg"
                    text="Memuat halaman login..."
                    className="py-8"
                  />
                }
              >
                <LoginForm />
              </Suspense>
            }
          />
          <Route
            path="/essential-services"
            element={
              <Suspense
                fallback={
                  <LoadingSpinner
                    size="lg"
                    text="Memuat layanan esensial..."
                    className="py-8"
                  />
                }
              >
                <EssentialServicesPage />
              </Suspense>
            }
          />
          <Route
            path="/news/:id"
            element={
              <Suspense
                fallback={
                  <LoadingSpinner
                    size="lg"
                    text="Memuat berita..."
                    className="py-8"
                  />
                }
              >
                <NewsDetailPage />
              </Suspense>
            }
          />

          <Route
            path="/layanan-paud-hi"
            element={
              <Suspense
                fallback={
                  <LoadingSpinner
                    size="lg"
                    text="Memuat layanan PAUDHI..."
                    className="py-8"
                  />
                }
              >
                <PAUDHIServicePage />
              </Suspense>
            }
          />

          <Route
            path="/ceria/*"
            element={
              <Suspense
                fallback={<CeriaLoader />}
              >
                <CeriaPage />
              </Suspense>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AnimatePresence>

      {/* ⛔ Sembunyikan chatbot di halaman admin dan ceria */}
      {!location.pathname.startsWith("/admin") && !location.pathname.startsWith("/ceria") && (
        <Suspense fallback={null}>
          <Chatbot />
        </Suspense>
      )}

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Service Worker Update Notifications */}
      <ServiceWorkerUpdate />
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        {/* ✅ Bungkus semua dengan AuthProvider dan ToastProvider */}
        <ToastProvider>
          <AuthProvider>
            <AppWrapper />
          </AuthProvider>
        </ToastProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
