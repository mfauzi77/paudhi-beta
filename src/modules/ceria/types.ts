import React from 'react';

export enum View {
    LandingPage = "Landing Page",
    Dashboard = "Dashboard",
    Forecasting = "Forecasting & Prediction",
    DataPerWilayah = "Data per Wilayah",
    EWSPerBidang = "Analisis per Bidang",
    SmartRecommendations = "Rekomendasi CERIA",
    AiAgentSelection = "Pilihan Asisten AI",
    ParentingAssistant = "Asisten Pengasuhan AI",
    DataProcessing = "Manajemen Integrasi",
    InputData = "Input Data",
    Intervensi = "Manajemen Intervensi", // Updated Label
    ResourceAllocation = "Resource Allocation",
    Reports = "Reports & Analytics",
    ParentDashboard = "Dashboard Orang Tua",
    UploadData = "Upload Data",
    CeriaSettings = "Pengaturan CERIA"
}

export interface NavItem {
    id: View;
    label: string;
    icon: React.ReactNode;
}

// --- Types for Data Integration Management ---
export interface ApiIntegration {
    id: string;
    name: string;
    category: 'Statistik Nasional' | 'Kesehatan' | 'Pendidikan' | 'Kependudukan' | 'Lingkungan';
    endpoint: string;
    status: 'Aktif' | 'Belum diuji' | 'Error koneksi';
    lastSync: string;
    datasetCount: number;
    authMethod: 'API Key' | 'Bearer Token' | 'OAuth';
    apiKey?: string;
    syncFrequency: 'Manual' | 'Harian' | 'Mingguan';
}

export interface Dataset {
    localUrl?: string;
    fieldPaths?: string[];
    id: string;
    apiId: string;
    name: string;
    description: string;
    indicator: string;
    coverage: string;
    year: string;
    syncStatus: 'Success' | 'Running' | 'Failed' | 'Pending';
    dataPath?: string;
    mapping?: {
        wilayah: string;
        nilai: string;
        tahun?: string;
        indikator?: string;
    };
    defaultValues?: {
        tahun?: string | number;
        indikator?: string;
    };
}

export interface SyncLog {
    id: string;
    apiId: string;
    timestamp: string;
    message: string;
    status: 'Success' | 'Failed' | 'Running';
}

export enum RiskCategory {
    Complete = "Imunisasi Lengkap (>90%)",
    Medium = "Cakupan Sedang (70-90%)",
    Low = "Cakupan Rendah (50-70%)",
    Critical = "Critical (<50%)"
}

export interface RiskAssessmentData {
    category: RiskCategory;
    count: number;
    color: string;
}

export interface KeyIndicatorData {
    comparison?: { change: number; provinceCount: number; previous: number; current: number };
    trendUnavailable?: boolean;
    value: string;
    label: string;
    change: number;
    changeType: 'increase' | 'decrease' | 'stable';
    domain: Domain | 'Semua';
}

export enum AlertLevel {
    High = "HIGH",
    Medium = "MEDIUM",
    Low = "LOW",
    Critical = "CRITICAL"
}

// UPDATE: Struktur 5 Domain Baru
export type Domain = 'Kesehatan & Gizi' | 'Pendidikan' | 'Pengasuhan' | 'Perlindungan' | 'Kesejahteraan Sosial';
export type DomainFilter = Domain | 'Semua';


export interface ActiveAlertData {
    year?: number;
    id: string;
    level: AlertLevel;
    title: string;
    region: string;
    domain: Domain;
    riskScore: number;
    target?: number;
    trend?: number;
}

export interface ForecastDataPoint {
    timeOffset?: number;
  month: string;
  actual: number | null;
  predicted: number;
  predicted_upper: number;
  predicted_lower: number;
}

export interface RegionalForecastData {
  id: number;
  region: string;
  domain: string;
  currentRisk: number;
  predictedRisk: number;
  change: number;
  currentRiskLevel: 'Kritis' | 'Tinggi' | 'Sedang' | 'Rendah';
  predictedRiskLevel: 'Kritis' | 'Tinggi' | 'Sedang' | 'Rendah';
}

export type SortKey = keyof RegionalForecastData;

export type SortDirection = 'ascending' | 'descending';

// --- Types for Data Per Wilayah ---
export interface DomainMetric {
    riskEligible?: boolean;
    label: string;
    value: string | number;
    unit: string;
    nationalAverage: number;
    higherIsBetter: boolean;
    maxValueForRisk?: number;
}

export interface DomainMetrics {
    riskScore: number;
    metrics: DomainMetric[];
}

export interface RegionDetailData {
    year?: number;
    populationUnavailable?: boolean;
    populationAgeGroup?: string;
    populationDetails?: { proportionAge0To6: number; countAge3To6: number; countAge5To6: number };
    id: string;
    name: string;
    overallRisk: number;
    population: number;
    activeAlertsCount: number;
    domains: {
        'Kesehatan & Gizi': DomainMetrics;
        'Pendidikan': DomainMetrics;
        'Pengasuhan': DomainMetrics;
        'Perlindungan': DomainMetrics;
        'Kesejahteraan Sosial': DomainMetrics;
    };
    historicalRisk: { month: string; score: number }[];
    kabupatenKotaIds?: string[];
}

export interface KabupatenKotaDetailData {
    id: string;
    name: string;
    parentRegionId: string;
    overallRisk: number;
    population: number;
    activeAlertsCount: number;
    domains: {
        'Kesehatan & Gizi': DomainMetrics;
        'Pendidikan': DomainMetrics;
        'Pengasuhan': DomainMetrics;
        'Perlindungan': DomainMetrics;
        'Kesejahteraan Sosial': DomainMetrics;
    };
    historicalRisk: { month: string; score: number }[];
}


export interface RegionalRiskScore {
    name: string;
    score: number;
}

// --- Types for EWS Per Bidang ---
export interface RegionPerformance {
    id: string;
    name: string;
    riskScore: number;
    trend: number; // positive is bad, negative is good
}

export interface DomainIndicatorData {
    indicatorName: string;
    nationalAverage: string;
    bestPerformer: {
        name: string;
        value: string;
    };
    worstPerformer: {
        name:string;
        value: string;
    }
}

export interface DomainData {
    id: Domain;
    name: string;
    averageRisk: number;
    criticalRegionsCount: number;
    regions: RegionPerformance[];
    topAlerts: ActiveAlertData[];
    indicators: DomainIndicatorData[];
}

// --- Types for Data Processing ---
export type DataSourceStatus = 'connected' | 'delayed' | 'error';
export interface DataSource {
    id: string;
    name: string;
    status: DataSourceStatus;
    lastSync: string;
}

export type LogLevel = 'INFO' | 'WARN' | 'ERROR';
export interface LogEntry {
    timestamp: string;
    level: LogLevel;
    message: string;
}

// --- Types for Intervention Management ---
export enum InterventionStatus {
    Planning = "Perencanaan",
    Active = "Aktif",
    Completed = "Selesai",
    OnHold = "Ditunda"
}

export enum InterventionPriority {
    High = "Tinggi",
    Medium = "Sedang",
    Low = "Rendah"
}

export interface ActionItem {
    id: string;
    text: string;
    completed: boolean;
    dueDate?: string; // YYYY-MM-DD
}

export interface InterventionPlan {
    id: string;
    title: string;
    description: string;
    region: string;
    domain: Domain;
    status: InterventionStatus;
    priority: InterventionPriority;
    startDate: string;
    endDate: string;
    budget: number;
    kpi: string; // Key Performance Indicator
    actionItems: ActionItem[];
    relatedAlertId?: string;
}

// --- Types for Smart Recommendations ---
export type RiskLevelSelection = 'high-critical' | 'medium' | 'low' | 'all';

export interface RecommendationParams {
    domain: string;
    region: string;
    riskLevel: RiskLevelSelection;
    customPrompt: string;
}

export interface SmartRecommendationResponse {
    justification: string;
    recommendations: string;
    projectedRiskScore: number | null;
}


// --- Types for Resource Allocation ---
export type ResourceType = 'SDM' | 'Anggaran' | 'Material';

export interface ResourceItem {
    name: string;
    unit: string;
    current: number;
    forecast: number;
    needed: number;
    color: string;
}

export interface ResourceData {
    sdm: ResourceItem[];
    anggaran: ResourceItem[];
    material: ResourceItem[];
}

export interface ScenarioParams {
    budgetChange: number; // percentage
    sdmFocus: 'Kesehatan' | 'Gizi' | 'Semua';
    regionFocus: 'High Risk' | 'All';
}

// --- Types for Reports ---
export type ReportType = 'regional-deep-dive' | 'monthly-performance' | 'domain-comparison';

export interface ReportParams {
    type: ReportType;
    regionId?: string;
    month?: string; // Format: 'YYYY-MM'
    year?: number;
}

export interface MonthlySummaryData {
    keyIndicators: KeyIndicatorData[];
    topImprovingRegions: RegionPerformance[];
    topWorseningRegions: RegionPerformance[];
    nationalRisk: {
        score: number;
        change: number;
    }
}

export interface DomainComparisonData {
    stats: {
        domain: Domain;
        averageRisk: number;
        criticalRegionsCount: number;
        bestPerformer: RegionPerformance;
        worstPerformer: RegionPerformance;
    }[];
}

export interface ReportData {
    params: ReportParams;
    generatedAt: string;
    title: string;
    regionData?: RegionDetailData;
    monthlySummary?: MonthlySummaryData;
    domainComparisonData?: DomainComparisonData;
    aiSummary?: string;
}


// --- Types for Parent Dashboard ---
export interface ChildProfile {
    name: string;
    age: string;
    avatarUrl: string;
    lastWeight: number | null;
    lastHeight: number | null;
}

export interface UpcomingEvent {
    id: string;
    title: string;
    dueDate: string; // YYYY-MM-DD
    type: 'immunization' | 'posyandu';
}

export interface GrowthRecord {
    ageInMonths: number;
    weight: number; // in kg
    height: number; // in cm
}

export interface StimulationChecklistItem {
    id: string;
    text: string;
    completed: boolean;
    ageGroup: string;
    category: 'Motorik Kasar' | 'Motorik Halus' | 'Sosial & Emosional' | 'Bahasa';
}

export interface ParentData {
    childProfile: ChildProfile;
    upcomingEvents: UpcomingEvent[];
    growthHistory: GrowthRecord[];
    stimulationChecklist: StimulationChecklistItem[];
}

// --- Type for Gemini Search Grounding ---
export interface GroundingSource {
    web: {
        uri: string;
        title: string;
    }
}

// --- Types for Data Uploader ---
export interface DataValidationResult {
    status: 'success' | 'issues_found';
    summary: string;
    issues: {
        row: number;
        column: string;
        value: string;
        description: string;
    }[];
}

// --- Types for Disaster and Environmental Data ---
export interface GempaInfo {
    DateTime: string;
    Magnitude: string;
    Wilayah: string;
    Jam: string;
    Kedalaman: string;
    Potensi: string;
}

export interface GempaBMKG {
    Infogempa: {
        gempa: GempaInfo;
    };
}

export interface DisasterData {
    gempa: GempaBMKG | null;
    bnpb: any[];
    petaBencana: any[];
}

export interface AirQualityData {
    aqi: number;
    station: string;
    level: 'Baik' | 'Sedang' | 'Tidak Sehat' | 'Sangat Tidak Sehat' | 'Berbahaya';
    time: string;
}

// --- Type for Loaded Application Data ---
export interface AppData {
    forecastPairs?: import('./services/forecast2025').ForecastPair[];
    forecastLoadError?: string;
    year?: number;
    analysisDatasets?: { entry: any; data: any }[];
    regionsDetails: Record<string, RegionDetailData>;
    kabupatenKotaDetails: Record<string, KabupatenKotaDetailData>;
    allActiveAlerts: ActiveAlertData[];
    nationalHistoricalRisk: { month: string; score: number }[];
    regionalForecastData: RegionalForecastData[];
    domainsData: Record<string, DomainData>;
    keyIndicatorsByDomain: Record<DomainFilter, KeyIndicatorData[]>;
    paudParticipationData2024: any[];
    paudAccreditationData: any[];
    paudTeacherQualificationData: any[];
    riskAssessmentData: RiskAssessmentData[];
    forecastChartData: ForecastDataPoint[];
    dataSources: DataSource[];
    processingLogs: LogEntry[];
    mockInterventionPlans: InterventionPlan[];
    mockResourceData: ResourceData;
    regionalRiskScores: RegionalRiskScore[];
    mockParentData: ParentData;
    getRegionDetails: (regionId: string) => RegionDetailData | null;
    getAvailableRegions: () => { id: string; name: string }[];
    getDomainData: (domainId: string) => DomainData | null;
}
