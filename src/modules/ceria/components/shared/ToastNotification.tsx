
import React, { useEffect } from 'react';
import { ActiveAlertData, AlertLevel } from '../../types';
import { ExclamationTriangleIcon } from '../icons/Icons';

interface ToastNotificationProps {
    alert: ActiveAlertData;
    onClose: () => void;
    onNavigate: (regionName: string) => void;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({ alert, onClose, onNavigate }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 10000); // Auto-dismiss after 10 seconds

        return () => clearTimeout(timer);
    }, [onClose]);

    const getLevelStyles = (level: AlertLevel) => {
        switch (level) {
            case AlertLevel.Critical:
                return {
                    bg: 'bg-red-50',
                    border: 'border-red-500',
                    iconBg: 'bg-red-100',
                    iconColor: 'text-red-600',
                };
            case AlertLevel.High:
                return {
                    bg: 'bg-orange-50',
                    border: 'border-orange-500',
                    iconBg: 'bg-orange-100',
                    iconColor: 'text-orange-600',
                };
            default:
                return {
                    bg: 'bg-slate-50',
                    border: 'border-slate-500',
                    iconBg: 'bg-slate-100',
                    iconColor: 'text-slate-600',
                };
        }
    };

    const styles = getLevelStyles(alert.level);

    return (
        <div className="fixed top-6 right-6 w-full max-w-sm z-50">
            <div
                className={`w-full ${styles.bg} rounded-lg shadow-2xl ring-1 ring-black ring-opacity-5 border-l-4 ${styles.border} animate-toast-in`}
                role="alert"
                aria-live="assertive"
                aria-atomic="true"
            >
                <div className="p-4">
                    <div className="flex items-start">
                        <div className={`flex-shrink-0 p-2 rounded-full ${styles.iconBg}`}>
                            <ExclamationTriangleIcon className={`h-6 w-6 ${styles.iconColor}`} aria-hidden="true" />
                        </div>
                        <div className="ml-3 w-0 flex-1 pt-0.5">
                            <p className="text-sm font-bold text-slate-900">{alert.title}</p>
                            <p className="mt-1 text-sm text-slate-600">
                                Wilayah: <span className="font-semibold">{alert.region}</span> | Domain: {alert.domain}
                            </p>
                            <div className="mt-3 flex space-x-4">
                                <button
                                    onClick={() => onNavigate(alert.region)}
                                    className="text-sm font-semibold text-indigo-600 hover:text-indigo-500"
                                >
                                    Lihat Detail
                                </button>
                                <button
                                    onClick={onClose}
                                    className="text-sm font-medium text-slate-700 hover:text-slate-500"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                        <div className="ml-4 flex-shrink-0 flex">
                            <button
                                onClick={onClose}
                                className="inline-flex text-slate-400 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                <span className="sr-only">Close</span>
                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ToastNotification;
