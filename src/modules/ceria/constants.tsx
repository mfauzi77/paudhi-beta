import React from 'react';
import { AcademicCapIcon,BellAlertIcon,BriefcaseIcon,ChartBarIcon,CubeIcon,DashboardIcon,DocumentChartBarIcon,GlobeAltIcon,HeartIcon,HomeIcon,MapIcon,ScaleIcon,ShieldCheckIcon,SunIcon,UsersIcon,WrenchScrewdriverIcon } from './components/icons/Icons';
import { NavItem,ResourceType,View } from './types';

export const NAVIGATION_ITEMS: NavItem[] = [
    { id: View.LandingPage, label: 'Beranda', icon: <HomeIcon /> },
    { id: View.Dashboard, label: 'Dashboard', icon: <DashboardIcon /> },
    { id: View.Forecasting, label: 'Forecasting & Prediction', icon: <ChartBarIcon /> },
    { id: View.DataPerWilayah, label: 'Data per Wilayah', icon: <MapIcon /> },
    { id: View.EWSPerBidang, label: 'Analisis per Bidang', icon: <BellAlertIcon /> },
    // { id: View.AiAgentSelection, label: 'Asisten AI CERIA', icon: <SparklesIcon /> },
    // { id: View.Intervensi, label: 'Manajemen Intervensi', icon: <BeakerIcon /> },
    // { id: View.UploadData, label: 'Upload Data', icon: <DocumentArrowDownIcon /> },
    // { id: View.DataProcessing, label: 'Manajemen Integrasi', icon: <WrenchScrewdriverIcon /> },
];

export const SUB_NAVIGATION_ITEMS: NavItem[] = [
    { id: View.ResourceAllocation, label: 'Resource Allocation', icon: <BriefcaseIcon /> },
    { id: View.Reports, label: 'Reports & Analytics', icon: <DocumentChartBarIcon /> },
    { id: View.CeriaSettings, label: 'Pengaturan CERIA', icon: <WrenchScrewdriverIcon /> },
];

export const PERSONAL_NAVIGATION_ITEMS: NavItem[] = [
    // { id: View.ParentDashboard, label: 'Dashboard Orang Tua', icon: <UserCircleIcon /> },
];

export const DOMAIN_FILTER_ITEMS = [
    { id: 'Semua', name: 'Semua Domain', icon: <GlobeAltIcon className="w-5 h-5" /> },
    { id: 'Kesehatan & Gizi', name: 'Kesehatan & Gizi', icon: <HeartIcon className="w-5 h-5 text-red-500" /> },
    { id: 'Pengasuhan', name: 'Pengasuhan', icon: <UsersIcon className="w-5 h-5 text-emerald-500" /> },
    { id: 'Pendidikan', name: 'Pendidikan', icon: <AcademicCapIcon className="w-5 h-5 text-purple-500" /> },
    { id: 'Perlindungan', name: 'Perlindungan', icon: <ShieldCheckIcon className="w-5 h-5 text-blue-500" /> },
    { id: 'Kesejahteraan Sosial', name: 'Kesejahteraan Sosial', icon: <SunIcon className="w-5 h-5 text-orange-500" /> }
];

export const DOMAIN_ITEMS = DOMAIN_FILTER_ITEMS.filter(item => item.id !== 'Semua');

export const RESOURCE_TYPES: { id: ResourceType; name: string; icon: React.ReactNode }[] = [
    { id: 'SDM', name: 'Sumber Daya Manusia', icon: <UsersIcon className="w-6 h-6 text-blue-500" /> },
    { id: 'Anggaran', name: 'Anggaran', icon: <ScaleIcon className="w-6 h-6 text-emerald-500" /> },
    { id: 'Material', name: 'Material & Logistik', icon: <CubeIcon className="w-6 h-6 text-amber-500" /> },
];