import React from 'react';
import {
  LayoutDashboard,
  Video,
  Network,
  FileText,
  Database,
  LogOut,
  Settings,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'meetings', label: 'Transcripts', icon: Video },
  { id: 'hierarchy', label: 'Hierarchy', icon: Network },
  { id: 'extracts', label: 'Action Tracker', icon: FileText },
  { id: 'integrations', label: 'Salesforce Sync', icon: Database },
];

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const { user, signOut } = useAuth();

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
      {/* Brand */}
      <div className="px-6 pt-8 pb-6 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-200">
          <div className="w-4 h-4 bg-white rounded-sm" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none">AXIOM</h1>
          <p className="text-sm text-slate-400 font-medium tracking-wide">Executive</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="px-4 pt-4 flex-1">
        <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
          Navigation
        </p>
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Pilot status */}
      <div className="mx-4 mb-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
        <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest mb-1">
          Pilot Status
        </p>
        <p className="text-xs font-bold text-slate-700 mb-2">Mari Trial: Week 2 of 6</p>
        <div className="w-full h-1.5 bg-emerald-200/60 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full" style={{ width: '33%' }} />
        </div>
      </div>

      {/* User panel + sign out */}
      <div className="border-t border-slate-100 px-4 py-4 space-y-2">
        {user && (
          <div className="px-3 py-2 flex items-center gap-3">
            {user.picture ? (
              <img
                src={user.picture}
                alt={user.name}
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full border border-slate-200"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-[11px]">
                {user.name
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-800 truncate">{user.name}</p>
              <p className="text-[10px] text-slate-400 font-medium truncate">{user.email}</p>
            </div>
          </div>
        )}

        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
          {user?.provider === 'demo' && (
            <span className="ml-auto text-[9px] font-bold text-amber-600 uppercase tracking-widest bg-amber-50 px-1.5 py-0.5 rounded">
              Demo
            </span>
          )}
        </button>

        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors">
          <Settings className="w-4 h-4" />
          <span>Configuration</span>
        </button>
      </div>
    </aside>
  );
}
