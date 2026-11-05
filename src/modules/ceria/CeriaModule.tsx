
import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Forecasting from './components/Forecasting';
import DataPerWilayah from './components/DataPerWilayah';
import EWSPerBidang from './components/EWSPerBidang';
import SmartRecommendations from './components/SmartRecommendations';
import IntegrationDashboard from './components/dataintegration/IntegrationDashboard';
import InterventionManagement from './components/InterventionManagement';
import Placeholder from './components/Placeholder';
import { View, AlertLevel, RegionDetailData, InterventionPlan, InterventionStatus } from './types';
import ResourceAllocation from './components/ResourceAllocation';
import InterventionFormModal from './components/interventions/InterventionFormModal';
import LandingPage from './components/LandingPage';
import WelcomeScreen from './components/WelcomeScreen';
import Reports from './components/Reports';
import ParentDashboard from './components/ParentDashboard';
import InputData from './components/InputData';
import CeriaSettings from './components/settings/CeriaSettings';
import ToastNotification from './components/shared/ToastNotification';
import UploadData from './components/UploadData';
import AiAgentSelection from './components/AiAgentSelection';
import ParentingAssistant from './components/ParentingAssistant';
import { useData } from './context/DataContext';
import { CpuChipIcon, ExclamationTriangleIcon } from './components/icons/Icons';

const CeriaDashboardModule = () => {
  const [appMode, setAppMode] = useState<string | null>('dashboard');
  const [activeView, setActiveView] = useState<View>(View.Dashboard);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [interventionPlans, setInterventionPlans] = useState<InterventionPlan[]>([]);
  const [isInterventionModalOpen, setIsInterventionModalOpen] = useState(false);
  const [interventionInitialData, setInterventionInitialData] = useState<Partial<InterventionPlan> | null>(null);
  const [navigationContext, setNavigationContext] = useState<any>(null);
  const [toastAlert, setToastAlert] = useState<any>(null);

  const { appData, isLoading, error, year, setYear } = useData();
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    setNavigationContext(null);
    setToastAlert(null);
    setIsInterventionModalOpen(false);
  }, [year]);

  // Sync activeView with URL path
  useEffect(() => {
    const path = location.pathname.replace('/ceria/', '').replace('/ceria', '');
    if (path === 'setting') {
      setActiveView(View.CeriaSettings);
      setAppMode('dashboard');
    } else if (path === 'integration') {
      setActiveView(View.DataProcessing);
      setAppMode('dashboard');
    } else if (path === 'dashboard' || path === '') {
      setActiveView(View.Dashboard);
      setAppMode('dashboard');
    }
    // Add other routes here if needed in the future
  }, [location.pathname]);

  // Update URL when activeView changes (for sidebar clicks)
  useEffect(() => {
    if (activeView === View.CeriaSettings) {
      if (location.pathname !== '/ceria/setting') navigate('/ceria/setting');
    } else if (activeView === View.DataProcessing) {
      if (location.pathname !== '/ceria/integration') navigate('/ceria/integration');
    } else if (activeView === View.Dashboard) {
      if (location.pathname !== '/ceria/dashboard' && location.pathname !== '/ceria') {
        // Only navigate if we're not already at a dashboard-like path
        // navigate('/ceria/dashboard'); 
      }
    }
    // Optional: add more view -> path mappings
  }, [activeView]);
  
  useEffect(() => {
    if (appData) {
      setInterventionPlans(appData.mockInterventionPlans);
    }
  }, [appData]);

  useEffect(() => {
    if (!appData) return;
    // Simulate receiving a high-priority alert after a delay
    const timer = setTimeout(() => {
        if (appMode === 'dashboard') { // Only show toast in dashboard mode
            const highPriorityAlerts = appData.allActiveAlerts.filter(
                a => a.level === AlertLevel.Critical || a.level === AlertLevel.High
            );
            if (highPriorityAlerts.length > 0) {
                const randomAlert = highPriorityAlerts[Math.floor(Math.random() * highPriorityAlerts.length)];
                setToastAlert(randomAlert);
            }
        }
    }, 7000); // 7-second delay after app loads

    return () => clearTimeout(timer);
  }, [appMode, appData]);

  const handleNavigateToDashboardApp = () => {
    setAppMode('dashboard');
    setActiveView(View.Dashboard);
  };
  
  const handleNavigateToAiApp = () => {
    setAppMode('ai');
    setActiveView(View.AiAgentSelection);
  };

  const handleOpenInterventionModal = (initialData: Partial<InterventionPlan> | null = null, navigateToInterventions = false) => {
    setInterventionInitialData(initialData);
    setIsInterventionModalOpen(true);
    if (navigateToInterventions) {
      setActiveView(View.Intervensi);
    }
  };

  const handleCloseInterventionModal = () => {
    setIsInterventionModalOpen(false);
    setInterventionInitialData(null);
  };
  
  const handleNavigateToDashboard = () => {
    setActiveView(View.Dashboard);
  };

  const regionNameToIdMap = useMemo(() => {
    if (!appData) return new Map();
    const map = new Map<string, { regionId: string; kabKotaId?: string; }>();
    Object.values(appData.regionsDetails).forEach((prov: RegionDetailData) => {
      map.set(prov.name.toLowerCase(), { regionId: prov.id });
      // FIX: Also map kabupaten/kota names for navigation
      if (prov.kabupatenKotaIds) {
        prov.kabupatenKotaIds.forEach(kabKotaId => {
          const kabKota = appData.kabupatenKotaDetails[kabKotaId];
          if (kabKota) {
            map.set(kabKota.name.toLowerCase(), { regionId: prov.id, kabKotaId: kabKota.id });
          }
        });
      }
    });
    return map;
  }, [appData]);

  const handleNavigateToRegion = (regionName: string) => {
    if (!regionName) return;
    
    // Normalize region name for matching (lowercase and trim)
    const normalizedSearch = regionName.toLowerCase().trim();
    const locationInfo = regionNameToIdMap.get(normalizedSearch);
    
    if (locationInfo) {
      setNavigationContext({
        regionId: locationInfo.regionId,
        kabupatenKotaId: locationInfo.kabKotaId,
      });
      setActiveView(View.DataPerWilayah);
    } else {
      console.warn(`Region '${regionName}' not found for navigation.`);
      
      // Try fuzzy matching if exact fails (optional, but good for stability)
      const possibleKey = Array.from(regionNameToIdMap.keys()).find(k => normalizedSearch.includes(k) || k.includes(normalizedSearch));
      if (possibleKey) {
          const info = regionNameToIdMap.get(possibleKey)!;
          setNavigationContext({
              regionId: info.regionId,
              kabupatenKotaId: info.kabKotaId,
          });
          setActiveView(View.DataPerWilayah);
          return;
      }
      
      setActiveView(View.Dashboard);
    }
  };

  const handleSaveIntervention = (planData: Omit<InterventionPlan, 'id'> & { id?: string }) => {
    setInterventionPlans(prevPlans => {
        if (planData.id && prevPlans.some(p => p.id === planData.id)) {
            // Update existing plan
            return prevPlans.map(p => 
                p.id === planData.id 
                ? { ...p, ...planData }
                : p
            );
        } else {
            // Create new plan
            const newPlan: InterventionPlan = {
                ...(planData as Omit<InterventionPlan, 'id'>),
                id: `plan-${Date.now()}`,
            };
            return [newPlan, ...prevPlans];
        }
    });
    handleCloseInterventionModal();
};

 const handleUpdatePlanStatus = (planId: string, newStatus: InterventionStatus) => {
    setInterventionPlans(prevPlans =>
        prevPlans.map(p =>
            p.id === planId ? { ...p, status: newStatus } : p
        )
    );
 };

  const handleCloseToast = () => {
    setToastAlert(null);
  };

  const handleToastNavigate = (regionName: string) => {
      handleNavigateToRegion(regionName);
      handleCloseToast();
  };

  const renderDashboardContent = () => {
    if (year === 2024 && activeView === View.Forecasting) {
      return <div className="rounded-lg bg-white p-6 shadow-sm"><h2 className="text-xl font-bold">Forecasting — 2024</h2><p className="mt-2 text-slate-600">Deret waktu untuk forecasting 2024 belum tersedia dalam data arsip.</p></div>;
    }
    if ([View.ResourceAllocation, View.ParentDashboard].includes(activeView)) {
      return <div className="rounded-lg bg-white p-6 shadow-sm"><h2 className="text-xl font-bold">{activeView} — {year}</h2><p className="mt-2 text-slate-600">Data pendukung untuk menu ini belum tersedia pada tahun {year}.</p></div>;
    }
    switch (activeView) {
      case View.LandingPage:
        return <LandingPage onNavigate={handleNavigateToDashboard} />;
      case View.Dashboard:
        return <Dashboard 
                    handleOpenInterventionModal={handleOpenInterventionModal} 
                />;
      case View.Forecasting:
        return <Forecasting handleOpenInterventionModal={handleOpenInterventionModal} />;
      case View.DataPerWilayah:
        return <DataPerWilayah 
                    handleOpenInterventionModal={handleOpenInterventionModal}
                    navigationContext={navigationContext}
                    onContextHandled={() => setNavigationContext(null)}
                />;
      case View.EWSPerBidang:
        return <EWSPerBidang />;
      case View.Intervensi:
        return <InterventionManagement 
            plans={interventionPlans} 
            onOpenModal={handleOpenInterventionModal} 
            onUpdatePlanStatus={handleUpdatePlanStatus}
        />;
      case View.DataProcessing:
        return <IntegrationDashboard />;
      case View.UploadData:
        return <UploadData />;
      case View.InputData:
        return <InputData />;
      case View.ResourceAllocation:
        return <ResourceAllocation />;
      case View.Reports:
        return <Reports />;
      case View.ParentDashboard:
        return <ParentDashboard />;
      case View.CeriaSettings:
        return <CeriaSettings />;
      default:
        // If an AI view is selected somehow, default to dashboard
        if ([View.AiAgentSelection, View.SmartRecommendations, View.ParentingAssistant].includes(activeView)) {
            setActiveView(View.Dashboard);
            return <Dashboard 
                      handleOpenInterventionModal={handleOpenInterventionModal} 
                    />;
        }
        return <Placeholder title={activeView} />;
    }
  };

  if (isLoading || (!error && appData?.year !== year)) {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-slate-100">
            <div className="flex items-center text-slate-700">
                <CpuChipIcon className="w-10 h-10 mr-4 animate-pulse text-indigo-500" />
                <div>
                    <h1 className="text-2xl font-bold">Memuat Data CERIA...</h1>
                    <p className="text-slate-500">Mengintegrasikan data lintas sektor untuk Anda.</p>
                </div>
            </div>
            <div className="w-64 bg-slate-200 rounded-full h-2.5 mt-4">
                <div className="bg-indigo-600 h-2.5 rounded-full animate-pulse"></div>
            </div>
        </div>
    );
  }

  if (error) {
     return (
        <div className="flex flex-col items-center justify-center h-screen bg-red-50 text-red-800 p-4">
            <ExclamationTriangleIcon className="w-16 h-16 text-red-500" />
            <h1 className="text-2xl font-bold mt-4">Gagal Memuat Data</h1>
            <p className="mt-2 text-center max-w-md">{error}</p>
            <button
                onClick={() => window.location.reload()}
                className="mt-6 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700"
            >
                Coba Muat Ulang
            </button>
            <button className="mt-3 underline" onClick={() => setYear(year === 2025 ? 2024 : 2025)}>Pilih tahun {year === 2025 ? 2024 : 2025}</button>
        </div>
     );
  }
  
  if (!appMode) {
    return <WelcomeScreen onDashboardNavigate={handleNavigateToDashboardApp} onAiAgentNavigate={handleNavigateToAiApp} />;
  }

  if (appMode === 'ai') {
      const handleExitAi = () => setAppMode(null);

      switch (activeView) {
          case View.SmartRecommendations:
              return <SmartRecommendations onBack={() => setActiveView(View.AiAgentSelection)} />;
          case View.ParentingAssistant:
              return <ParentingAssistant onBack={() => setActiveView(View.AiAgentSelection)} />;
          case View.AiAgentSelection:
          default:
              return <AiAgentSelection 
                          onNavigateToCeria={() => setActiveView(View.SmartRecommendations)}
                          onNavigateToParenting={() => setActiveView(View.ParentingAssistant)}
                          onExit={handleExitAi}
                      />;
      }
  }

  // Render Dashboard Mode
  return (
    <div className={`relative flex h-screen bg-slate-100 font-sans transition-opacity duration-500 ease-in-out opacity-100`}>
      <Sidebar 
          activeView={activeView} 
          setActiveView={setActiveView} 
          isOpen={isSidebarOpen} 
          setIsOpen={setIsSidebarOpen} 
      />
      <div className="flex-1 flex flex-col overflow-hidden">
          <Header 
              setIsSidebarOpen={setIsSidebarOpen} 
              setActiveView={setActiveView}
              onNavigateToRegion={handleNavigateToRegion}
          />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-4 sm:p-6 print:bg-white print:p-0">
          <div key={year}>{renderDashboardContent()}</div>
          </main>
      </div>
      <InterventionFormModal
          isOpen={isInterventionModalOpen}
          onClose={handleCloseInterventionModal}
          onSave={handleSaveIntervention}
          initialData={interventionInitialData}
      />
      {toastAlert && (
          <ToastNotification
              alert={toastAlert}
              onClose={handleCloseToast}
              onNavigate={handleToastNavigate}
          />
      )}
    </div>
  );
};

export default CeriaDashboardModule;
