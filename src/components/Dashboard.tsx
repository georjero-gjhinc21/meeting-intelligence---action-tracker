import React from 'react';
import { 
  BarChart3, 
  Users, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  ArrowRight,
  BrainCircuit
} from 'lucide-react';
import { motion } from 'motion/react';
import { MOCK_ACTIONS, MOCK_MEETINGS } from '../constants';

export default function Dashboard() {
  const stats = [
    { label: 'Meetings Scanned', value: MOCK_MEETINGS.length, icon: BarChart3, color: 'text-blue-600' },
    { label: 'Identified Actions', value: MOCK_ACTIONS.length, icon: BrainCircuit, color: 'text-purple-600' },
    { label: 'Pending Validations', value: 2, icon: Clock, color: 'text-amber-600' },
    { label: 'Resolved Tasks', value: 1, icon: CheckCircle2, color: 'text-emerald-600' },
  ];

  return (
    <div className="p-8 space-y-8" id="dashboard-view">
      <header>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Executive Intelligence Overview</h1>
        <p className="text-slate-500 text-sm mt-1">Real-time tracking of strategic initiatives from meeting transcripts.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={stat.label}
            id={`stat-card-${idx}`}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:border-indigo-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <p className={`text-3xl font-bold mt-2 ${idx === 2 && stat.value > 0 ? 'text-orange-500' : 'text-slate-800'}`}>{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl bg-slate-50 ${stat.color}`}>
                <stat.icon className="w-5 h-5 opacity-80" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div id="recent-actions" className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-bold text-slate-700 uppercase text-xs tracking-wider">High-Priority Actions</h2>
            <button className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-1 hover:underline">
              View All <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-4">
            {MOCK_ACTIONS.filter(a => a.priority === 'High').map((action) => (
              <div 
                key={action.id} 
                className="p-5 rounded-xl bg-slate-50 border border-slate-100 hover:border-indigo-100 hover:bg-white transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      {action.role}
                    </span>
                    <h3 className="font-bold text-slate-800 text-sm leading-snug">{action.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{action.description}</p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase font-mono tracking-tighter">
                    {action.level}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div id="analysis-preview" className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-bold text-slate-700 uppercase text-xs tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              Transcription Pipeline
            </h2>
          </div>
          <div className="space-y-8">
            {MOCK_MEETINGS.map((meeting) => (
              <div key={meeting.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-800">{meeting.title}</span>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">{meeting.platform}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${
                    meeting.status === 'Processed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {meeting.status}
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: meeting.status === 'Processed' ? '100%' : '65%' }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full ${meeting.status === 'Processed' ? 'bg-indigo-500' : 'bg-amber-500'}`}
                  />
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-10 p-5 bg-slate-50 border border-slate-100 rounded-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <BrainCircuit className="w-16 h-16 text-indigo-600" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                <p className="text-[10px] font-bold text-indigo-900 uppercase tracking-widest">Intelligence Pulse</p>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Detection confidence at 98.4% for C-Suite meeting roles. 
                3 new action items detected in "Security Update".
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
