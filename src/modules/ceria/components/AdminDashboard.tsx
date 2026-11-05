import React from 'react';
import { View } from '../types';
const DATA_INTEGRATION_NAV = [
  { id: View.UploadData, label: 'Upload Data' },
  { id: View.InputData, label: 'Input Data' },
  { id: View.DataProcessing, label: 'Manajemen Integrasi' },
];



const AdminDashboard: React.FC<{ setActiveView: (v: View) => void }> = ({ setActiveView }) => {

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {DATA_INTEGRATION_NAV.map(item => (
          <button key={item.label} onClick={() => setActiveView(item.id)} className="p-4 rounded bg-white dark:bg-slate-800 shadow text-left hover:ring-2 ring-indigo-400">
            <div className="font-semibold mb-1">{item.label}</div>
            <div className="text-xs text-slate-500">Kelola impor, input manual, dan data terkini.</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;


