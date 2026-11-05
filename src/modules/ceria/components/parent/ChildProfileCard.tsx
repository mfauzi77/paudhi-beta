import React from 'react';
import { ChildProfile } from '../../types';

interface ChildProfileCardProps {
    profile: ChildProfile;
}

const ChildProfileCard: React.FC<ChildProfileCardProps> = ({ profile }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <img 
                src={profile.avatarUrl} 
                alt={profile.name} 
                className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-indigo-200"
            />
            <h3 className="text-xl font-bold text-slate-800">{profile.name}</h3>
            <p className="text-sm text-slate-500">{profile.age}</p>

            <div className="mt-4 pt-4 border-t border-slate-200 flex justify-around text-sm">
                <div className="text-center">
                    <p className="font-semibold text-slate-500">Berat</p>
                    <p className="font-bold text-indigo-600">{profile.lastWeight || 'N/A'} kg</p>
                </div>
                <div className="text-center">
                    <p className="font-semibold text-slate-500">Tinggi</p>
                    <p className="font-bold text-indigo-600">{profile.lastHeight || 'N/A'} cm</p>
                </div>
            </div>
        </div>
    );
};

export default ChildProfileCard;
