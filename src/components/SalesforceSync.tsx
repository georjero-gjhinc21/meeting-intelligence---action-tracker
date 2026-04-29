import React from 'react';
import { 
  Database, 
  RefreshCw, 
  Search, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle,
  Link2,
  Table
} from 'lucide-react';
import { motion } from 'motion/react';

export default function SalesforceSync() {
  const [isSyncing, setIsSyncing] = React.useState(false);

  const simulateSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 2000);
  };

  const integrations = [
    { name: 'Salesforce CRM', status: 'Connected', icon: Database, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { name: 'Linear', status: 'Connected', icon: Link2, color: 'text-blue-500', bg: 'bg-blue-50' },
    { name: 'Confluence', status: 'Syncing...', icon: Table, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { name: 'Jira', status: 'Pending', icon: AlertCircle, color: 'text-slate-400', bg: 'bg-slate-50' },
  ];

  return (
    <div className="p-8 space-y-8" id="integrations-view">
       <header className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight uppercase">Salesforce Sync</h1>
          <p className="text-slate-500 text-sm mt-1">Linking extracted actions with contacts, opportunities, and tasks.</p>
        </div>
        <button 
          onClick={simulateSync}
          disabled={isSyncing}
          className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all shadow-xl disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          Force Ecosystem Sync
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {integrations.map((app) => (
          <div key={app.name} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm group hover:border-indigo-300 transition-all">
            <div className="flex items-center gap-4 mb-6">
              <div className={`p-3 rounded-xl ${app.bg} transition-transform group-hover:scale-110`}>
                <app.icon className={`w-5 h-5 ${app.color}`} />
              </div>
              <h3 className="font-bold text-slate-800 tracking-tight">{app.name}</h3>
            </div>
            <div className="flex items-center justify-between mt-auto">
              <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded ${
                app.status === 'Connected' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'
              }`}>
                {app.status}
              </span>
              <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors">
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sync Activity Log</h2>
          <div className="flex gap-6 text-[10px] font-bold uppercase tracking-widest">
            <div className="flex items-center gap-1.5 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
              128 SECURE
            </div>
            <div className="flex items-center gap-1.5 text-amber-600">
              <AlertCircle className="w-4 h-4" />
              2 QUEUED
            </div>
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {[
            { action: 'Strategic Alignment FY27', target: 'Salesforce Opportunity', id: 'OPP-940', status: 'Success' },
            { action: 'IAM Audit Policy', target: 'Linear Issue', id: 'SEC-42', status: 'Success' },
            { action: 'CEO Vision Note', target: 'Confluence Page', id: 'DOC-88', status: 'Pending' },
          ].map((log, idx) => (
            <div key={idx} className="px-8 py-5 flex items-center justify-between text-sm hover:bg-slate-50 cursor-pointer transition-colors group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                  <Database className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 tracking-tight">{log.action}</p>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">Pushed to <span className="text-slate-600 font-bold">{log.target}</span> • {log.id}</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${
                log.status === 'Success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
              }`}>
                {log.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
