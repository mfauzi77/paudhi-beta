// src/App.jsx
import React, { Suspense, lazy } from "react";
import CeriaLoader from "./modules/ceria/components/shared/CeriaLoader";
import { AnimatePresence } from "framer-motion";
import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

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

import PageMetadata from "./components/PageMetadata";
import PageTransition from "./components/PageTransition";
import NotFoundPage from "./pages/NotFoundPage";

function HomePage() {
  return (
    <PageTransition>
      <main id="main-content">
      <HeroSection />
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
