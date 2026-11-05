// PAUDComponents.jsx - UI Components
import React from 'react';
import { 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  XCircle,
  ChevronRight,
  Home 
} from 'lucide-react';
import { getStatusConfig, getProgressColorClass, PAUD_CONSTANTS } from './PAUDData';

// ==================== BUTTON COMPONENT ====================
export const PAUDButton = ({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  className = '', 
  disabled = false,
  loading = false,
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center gap-2 font-medium rounded-lg transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 hover:-translate-y-0.5 focus:ring-blue-500',
    outline: 'bg-transparent border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  };
  
  const sizes = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  };

  return (
    <button 
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
      )}
      {children}
    </button>
  );
};

// ==================== STATUS BADGE COMPONENT ====================
export const PAUDStatusBadge = ({ 
  status, 
  className = '', 
  size = 'md',
  showIcon = true,
  showLabel = true 
}) => {
  const statusConfig = {
    'on-track': { 
      bg: 'bg-green-100', 
      text: 'text-green-800', 
      icon: CheckCircle,
      label: 'On Track'
    },
    'at-risk': { 
      bg: 'bg-yellow-100', 
      text: 'text-yellow-800', 
      icon: AlertTriangle,
      label: 'At Risk'
    },
    'behind': { 
      bg: 'bg-red-100', 
      text: 'text-red-800', 
      icon: Clock,
      label: 'Behind'
    },
    'completed': {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      icon: CheckCircle,
      label: 'Completed'
    },
    'cancelled': {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      icon: XCircle,
      label: 'Cancelled'
    }
  };

  const sizes = {
    xs: 'px-1.5 py-0.5 text-xs',
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-xs',
    lg: 'px-4 py-2 text-sm'
  };

  const iconSizes = {
    xs: 'w-2.5 h-2.5',
    sm: 'w-3 h-3',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  const config = statusConfig[status];
  if (!config) return null;

  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium uppercase tracking-wider ${config.bg} ${config.text} ${sizes[size]} ${className}`}>
      {showIcon && <Icon className={iconSizes[size]} />}
      {showLabel && config.label}
    </span>
  );
};

// ==================== PROGRESS BAR COMPONENT ====================
export const PAUDProgressBar = ({ 
  progress, 
  status = 'on-track', 
  className = '', 
  size = 'md',
  showPercentage = false,
  animated = true,
  label = ''
}) => {
  const statusColors = PAUD_CONSTANTS.STATUS_COLORS;

  const sizes = {
    xs: { bar: 'h-1', width: 'w-16' },
    sm: { bar: 'h-1.5', width: 'w-20' },
    md: { bar: 'h-2', width: 'w-24' },
    lg: { bar: 'h-3', width: 'w-32' },
    xl: { bar: 'h-4', width: 'w-40' }
  };

  const animationClass = animated ? 'transition-all duration-1000 ease-out' : '';
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {label && (
        <span className="text-xs text-gray-600 font-medium min-w-max">
          {label}:
        </span>
      )}
      <div className={`${sizes[size].width} ${sizes[size].bar} bg-gray-200 rounded-full overflow-hidden`}>
        <div 
          className={`h-full rounded-full ${animationClass} ${statusColors[status] || statusColors['on-track']}`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
      {showPercentage && (
        <span className="text-xs text-gray-600 font-medium min-w-[3rem]">
          {clampedProgress}%
        </span>
      )}
    </div>
  );
};

// ==================== PROGRESS CIRCLE COMPONENT ====================
export const PAUDProgressCircle = ({ 
  progress, 
  size = 'md', 
  className = '',
  showPercentage = true,
  customColor = null 
}) => {
  const sizes = {
    xs: 'w-8 h-8 text-xs',
    sm: 'w-12 h-12 text-xs',
    md: 'w-15 h-15 text-sm',
    lg: 'w-20 h-20 text-base',
    xl: 'w-24 h-24 text-lg'
  };

  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  const colorClass = customColor || getProgressColorClass(clampedProgress);

  return (
    <div className={`${sizes[size]} ${colorClass} rounded-full flex items-center justify-center text-white font-bold ${className}`}>
      {showPercentage ? `${clampedProgress}%` : clampedProgress}
    </div>
  );
};

// ==================== LOADING SPINNER COMPONENT ====================
export const PAUDLoadingSpinner = ({ 
  size = 'md', 
  className = '', 
  color = 'blue' 
}) => {
  const sizes = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colors = {
    blue: 'border-blue-600',
    green: 'border-green-600',
    red: 'border-red-600',
    yellow: 'border-yellow-600',
    gray: 'border-gray-600'
  };

  return (
    <div className={`animate-spin rounded-full border-2 border-t-transparent ${sizes[size]} ${colors[color]} ${className}`}></div>
  );
};

// ==================== BREADCRUMB COMPONENT ====================
export const PAUDBreadcrumb = ({ 
  items = [], 
  className = '',
  separator = ChevronRight,
  maxItems = null 
}) => {
  const defaultItems = [
    { label: 'Beranda', href: '#', icon: Home },
    { label: 'K/L PAUDHI', href: '#' },
    { label: 'Rekapitulasi Program', href: null, active: true }
  ];

  let breadcrumbItems = items.length > 0 ? items : defaultItems;

  // Limit items if maxItems is specified
  if (maxItems && breadcrumbItems.length > maxItems) {
    const firstItem = breadcrumbItems[0];
    const lastItems = breadcrumbItems.slice(-maxItems + 2);
    breadcrumbItems = [
      firstItem,
      { label: '...', ellipsis: true },
      ...lastItems
    ];
  }

  const Separator = separator;

  return (
    <div className={`bg-gray-50 py-4 border-b border-gray-200 ${className}`}>
      <div className="max-w-7xl mx-auto px-6">
        <nav className="flex items-center space-x-2 text-sm" aria-label="Breadcrumb">
          {breadcrumbItems.map((item, index) => {
            const isLast = index === breadcrumbItems.length - 1;
            const Icon = item.icon;
            
            return (
              <React.Fragment key={index}>
                <div className="flex items-center">
                  {item.ellipsis ? (
                    <span className="text-gray-400 px-2">...</span>
                  ) : item.href ? (
                    <a 
                      href={item.href}
                      className={`flex items-center gap-1 hover:text-blue-600 transition-colors ${
                        item.active ? 'text-blue-600 font-semibold' : 'text-gray-600'
                      }`}
                    >
                      {Icon && <Icon className="w-4 h-4" />}
                      {item.label}
                    </a>
                  ) : (
                    <span className={`flex items-center gap-1 ${
                      item.active ? 'text-gray-900 font-semibold' : 'text-gray-600'
                    }`}>
                      {Icon && <Icon className="w-4 h-4" />}
                      {item.label}
                    </span>
                  )}
                </div>
                
                {!isLast && !item.ellipsis && (
                  <Separator className="w-4 h-4 text-gray-400 flex-shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

// ==================== CARD COMPONENT ====================
export const PAUDCard = ({ 
  children, 
  className = '',
  padding = 'lg',
  shadow = 'md',
  rounded = 'lg',
  hover = false,
  loading = false 
}) => {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-12'
  };

  const shadows = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  };

  const roundeds = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl'
  };

  const hoverClasses = hover 
    ? 'transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer' 
    : '';

  if (loading) {
    return (
      <div className={`bg-white ${paddings[padding]} ${shadows[shadow]} ${roundeds[rounded]} ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white ${paddings[padding]} ${shadows[shadow]} ${roundeds[rounded]} ${hoverClasses} ${className}`}>
      {children}
    </div>
  );
};

// ==================== SUMMARY CARD COMPONENT ====================
export const PAUDSummaryCard = ({ 
  icon: Icon, 
  number, 
  label, 
  description, 
  type = 'total',
  className = '',
  loading = false,
  trend = null // { value: 5, direction: 'up' }
}) => {
  const cardStyles = PAUD_CONSTANTS.CARD_STYLES;

  if (loading) {
    return (
      <div className="bg-gray-200 animate-pulse rounded-xl p-8 text-center">
        <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4"></div>
        <div className="h-8 bg-gray-300 rounded w-16 mx-auto mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-24 mx-auto mb-1"></div>
        <div className="h-3 bg-gray-300 rounded w-32 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className={`${cardStyles[type]} text-white rounded-xl p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl relative overflow-hidden group ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="relative z-10">
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
          <Icon className="w-7 h-7" />
        </div>
        
        <div className="text-4xl font-bold mb-2 drop-shadow-lg flex items-center justify-center gap-2">
          {number}
          {trend && (
            <span className={`text-sm ${trend.direction === 'up' ? 'text-green-200' : 'text-red-200'}`}>
              {trend.direction === 'up' ? '↗' : '↘'} {trend.value}%
            </span>
          )}
        </div>
        <div className="font-semibold text-lg mb-1">{label}</div>
        <div className="text-sm opacity-90">{description}</div>
      </div>
    </div>
  );
};

// ==================== EMPTY STATE COMPONENT ====================
export const PAUDEmptyState = ({ 
  icon: Icon = null,
  title = "Tidak ada data",
  description = "Data akan muncul di sini ketika tersedia",
  action = null,
  className = ''
}) => {
  return (
    <div className={`text-center py-12 px-4 ${className}`}>
      {Icon && (
        <div className="mb-4">
          <Icon className="w-12 h-12 mx-auto text-gray-400" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  );
};

// ==================== TOOLTIP COMPONENT ====================
export const PAUDTooltip = ({ 
  children, 
  content, 
  position = 'top',
  className = '' 
}) => {
  const positions = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  };

  return (
    <div className={`relative inline-block group ${className}`}>
      {children}
      <div className={`absolute ${positions[position]} z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap`}>
        {content}
        <div className="absolute w-2 h-2 bg-gray-900 transform rotate-45" 
             style={{
               [position === 'top' ? 'top' : position === 'bottom' ? 'bottom' : 'left']: 
               position === 'top' ? '100%' : position === 'bottom' ? '-4px' : '50%',
               [position === 'left' || position === 'right' ? 'top' : 'left']: '50%',
               transform: 'translate(-50%, -50%) rotate(45deg)'
             }}>
        </div>
      </div>
    </div>
  );
};

// ==================== EXPORT ALL ====================
export default {
  PAUDButton,
  PAUDStatusBadge,
  PAUDProgressBar,
  PAUDProgressCircle,
  PAUDLoadingSpinner,
  PAUDBreadcrumb,
  PAUDCard,
  PAUDSummaryCard,
  PAUDEmptyState,
  PAUDTooltip
};