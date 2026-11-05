import React,{ useEffect,useRef,useState } from 'react';
import { useData } from '../context/DataContext';
import { AlertLevel,View } from '../types';
import NotificationDropdown from './header/NotificationDropdown';
import { BellAlertIcon } from './icons/Icons';


interface HeaderProps {
  setIsSidebarOpen: (isOpen: boolean) => void;
  setActiveView: (view: View) => void;
  onNavigateToRegion: (regionName: string) => void;
}

const Header: React.FC<HeaderProps> = ({ setIsSidebarOpen, setActiveView, onNavigateToRegion }) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  const notificationsRef = useRef<HTMLDivElement>(null);

  const { appData, year, setYear } = useData();
  const allActiveAlerts = appData?.allActiveAlerts || [];

  const highPriorityAlerts = allActiveAlerts.filter(
    alert => alert.year === year && (alert.level === AlertLevel.Critical || alert.level === AlertLevel.High)
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationNavigate = (view: View) => {
    setActiveView(view);
    setIsNotificationsOpen(false);
  };

  const handleNotificationRegionNavigate = (regionName: string) => {
    onNavigateToRegion(regionName);
    setIsNotificationsOpen(false);
  };

  return (
    <header className="bg-white shadow-sm p-4 flex justify-between items-center z-10 border-b border-slate-200">
      <div className="flex items-center">
         <button onClick={() => setIsSidebarOpen(true)} className="text-slate-500 mr-4 lg:hidden" aria-label="Open sidebar">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-800">CERIA (Cerdas, Efektif, Responsif, Inovatif, Akurat)</h1>
          <p className="text-xs text-slate-500">Sistem Pendukung Keputusan Cerdas untuk Pemerataan Layanan PAUDHI</p>
          {/* <div className="flex items-center text-xs text-slate-500 font-medium mt-1.5">
            <CalendarIcon className="w-4 h-4 mr-1.5 text-slate-400" />
            <span>Data diproses per 30 Juni 2024</span>
          </div> */}
        </div>
      </div>
      <div className="flex items-center space-x-2 md:space-x-4">
        <label className="text-sm font-medium text-slate-600">Tahun
          <select aria-label="Tahun data analisis" className="ml-2 rounded-lg border border-slate-200 bg-white p-2 text-indigo-700" value={year} onChange={e => setYear(Number(e.target.value))}>
            <option value={2024}>2024</option><option value={2025}>2025</option>
          </select>
        </label>
        <div className="relative" ref={notificationsRef}>
            <button 
                className="relative p-1" 
                aria-label="Notifications"
                onClick={() => setIsNotificationsOpen(prev => !prev)}
                aria-expanded={isNotificationsOpen}
            >
                {highPriorityAlerts.length > 0 && (
                  <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white"></span>
                )}
                <BellAlertIcon className="h-6 w-6 text-slate-500 hover:text-slate-700" />
            </button>
            {isNotificationsOpen && (
              <NotificationDropdown
                year={year}
                alerts={highPriorityAlerts}
                onNavigate={handleNotificationNavigate}
                onNavigateToRegion={handleNotificationRegionNavigate}
              />
            )}
        </div>
      </div>
    </header>
  );
};

export default Header;
