import React from 'react';
import { UpcomingEvent } from '../../types';
import { BellAlertIcon, UsersIcon } from '../icons/Icons';

const UpcomingSchedule: React.FC<{ events: UpcomingEvent[] }> = ({ events }) => {

    const getDaysLeft = (dueDate: string) => {
        const today = new Date();
        // Parse 'YYYY-MM-DD'
        const parts = dueDate.split('-').map(p => parseInt(p, 10));
        const due = new Date(parts[0], parts[1] - 1, parts[2]); // month is 0-indexed
        
        today.setHours(0, 0, 0, 0);
        due.setHours(0, 0, 0, 0);
        
        return Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    };

    const EventIcon: React.FC<{ type: UpcomingEvent['type'] }> = ({ type }) => {
        if (type === 'immunization') {
            return <BellAlertIcon className="w-5 h-5 text-red-500" />;
        }
        return <UsersIcon className="w-5 h-5 text-blue-500" />;
    };

    const sortedEvents = [...events].sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Jadwal Penting</h3>
            <ul className="space-y-4">
                {sortedEvents.map(event => {
                    const daysLeft = getDaysLeft(event.dueDate);
                    let daysText = '';
                    if(daysLeft < 0) daysText = 'Terlewat';
                    else if(daysLeft === 0) daysText = 'Hari ini';
                    else if(daysLeft === 1) daysText = 'Besok';
                    else daysText = `${daysLeft} hari lagi`;

                    return (
                        <li key={event.id} className="flex items-center">
                            <div className={`p-2 rounded-full mr-4 ${event.type === 'immunization' ? 'bg-red-100' : 'bg-blue-100'}`}>
                                <EventIcon type={event.type} />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-800">{event.title}</p>
                                <p className="text-xs text-slate-500">{daysText}</p>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default UpcomingSchedule;
