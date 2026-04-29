import React from 'react';
import { LayoutDashboard, Video, ListTree, Settings, FileText, Database, Share2, LogOut } from 'lucide-react';
import { motion } from 'motion/react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userEmail: string;
  onSignOut: () => Promise<void>;
}

export default function Sidebar({ activeTab, setActiveTab, userEmail, onSignOut }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'meetings', label: 'Transcripts', icon: Video },
    { id: 'hierarchy', label: 'Hierarchy', icon: ListTree },
    { id: 'extracts', label: 'Action Tracker', icon: FileText },
    { id: 'integrations', label: 'Salesforce Sync', icon: Database },
  ];

  return (
    <div className="w-64 h-full bg-white border-r border-slate-200 flex flex-col" id="main-sidebar">
      <div className="p-8 pb-4 flex items-center gap-3">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-white rounded-sm"></div>
        </div>
        <span className="text-xl font-bold tracking-tight text-slate-800">
          AXIOM <span className="text-slate-400 font-light">Intelligence</span>
        </span>
      </div>

      <div className="px-6 py-4">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Navigation</h3>
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              id={`nav-link-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm font-medium ${
                activeTab === item.id 
                  ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
              }`}
            >
              <item.icon className={`w-4 h-4 ${activeTab === item.id ? 'text-indigo-600' : 'text-slate-400'}`} />
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="px-6 py-4 border-t border-slate-100 mt-auto">
        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
          <p className="text-[10px] font-bold text-emerald-700 uppercase mb-1">Pilot Status</p>
          <p className="text-xs text-emerald-900 leading-snug font-medium">Mari Trial: Week 2 of 6</p>
          <div className="w-full bg-emerald-200 h-1 rounded-full mt-3 overflow-hidden">
            <div className="bg-emerald-600 h-full w-1/3"></div>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
            {userEmail ? (
              <>
                <div className="w-3.5 h-3.5 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold">
                  {userEmail?.[0]?.toUpperCase() ?? 'U'}
                </div>
                <div>
                  <p className="text-[10px] text-slate-800">{userEmail}</p>
                  <p className="text-[8px] text-slate-400 uppercase tracking-wider">Signed in</p>
                </div>
              </>
            ) : (
              <span>Signed out</span>
            )}
          </div>
          <button 
            onClick={onSignOut}
            className="w-full mt-3 flex items-center gap-3 px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </div>
        
        <button 
          id="nav-settings"
          className="w-full mt-6 flex items-center gap-3 px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors"
        >
          <Settings className="w-3.5 h-3.5" />
          Configuration
        </button>
      </div>
    </div>
  );
}
