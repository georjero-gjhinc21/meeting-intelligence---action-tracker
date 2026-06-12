import React from 'react';
import { ACTIVE_OFFICES, OFFICE_LABELS } from '../config/offices';
import { ExecutiveOffice } from '../types';
import OfficeDashboard from './OfficeDashboard';

export default function ExecutiveHome() {
  const [selectedOffice, setSelectedOffice] = React.useState<ExecutiveOffice>(ACTIVE_OFFICES[0]);

  return (
    <div className="p-8 h-full overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Executive Dashboard</h1>
        <p className="text-slate-600">Role-based view of what came out of your meetings</p>
      </div>

      <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
        {ACTIVE_OFFICES.map((office) => (
          <button
            key={office}
            onClick={() => setSelectedOffice(office)}
            className={`px-4 py-2 text-sm transition-colors whitespace-nowrap ${
              selectedOffice === office
                ? 'text-indigo-700 border-b-2 border-indigo-600 font-semibold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {OFFICE_LABELS[office]}
          </button>
        ))}
      </div>

      <OfficeDashboard office={selectedOffice} />
    </div>
  );
}