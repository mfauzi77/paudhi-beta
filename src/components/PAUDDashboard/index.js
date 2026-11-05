// index.js - Clean Export File untuk PAUDDashboard
// File export utama yang aman dan tanpa konflik

// ===== MAIN DASHBOARD EXPORT =====
export { default } from "./PAUDDashboard";
export { default as PAUDDashboard } from "./PAUDDashboard";

// ===== DASHBOARD VARIANTS =====
export {
  PAUDCompactDashboard,
  PAUDKLDashboard,
  PAUDEmbeddedDashboard,
  PAUDDashboardContent,
  PAUDTabContent,
} from "./PAUDDashboard";

// ===== HOOKS =====
export { usePAUDDashboardState, usePAUDAnalytics } from "./PAUDDashboard";

// ===== DATA & CONTEXT =====
export {
  PAUDDashboardProvider,
  usePAUDDashboard,
  dashboardData,
  formatPAUDNumber,
  getPAUDStatusColor,
  calculatePAUDProgress,
  getProgressColorClass,
  getStatusConfig,
  PAUD_CONSTANTS,
} from "./PAUDData";

// ===== UI COMPONENTS =====
export {
  PAUDButton,
  PAUDStatusBadge,
  PAUDProgressBar,
  PAUDProgressCircle,
  PAUDLoadingSpinner,
  PAUDBreadcrumb,
  PAUDCard,
  PAUDSummaryCard,
  PAUDEmptyState,
  PAUDTooltip,
} from "./PAUDComponents";

// ===== SECTION COMPONENTS =====
export {
  PAUDRekapitulasiSection,
  PAUDRekapitulasiTable,
  PAUDKLHeader,
  PAUDSummaryGrid,
  PAUDProgramTable,
  PAUDTableFilters,
  PAUDTabNavigation,
} from "./PAUDSectiona";
