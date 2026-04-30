import React from 'react';
import {
  LayoutDashboard,
  FileText,
  Network,
  Sparkles,
  Settings,
  LogOut,
  Link as LinkIcon,
} from 'lucide-react';
import { useClerk, useUser } from '@clerk/clerk-react';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: Props) {
  const { signOut } = useClerk();
  const { user } = useUser();

  const handleSignOut = () => {
    signOut();
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'meetings', label: 'Transcripts', icon: FileText },
    { id: 'hierarchy', label: 'Hierarchy', icon: Network },
    { id: 'extracts', label: 'Action Tracker', icon: Sparkles },
    { id: 'integrations', label: 'Salesforce Sync', icon: LinkIcon },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-xl font-bold tracking-tight">AXIOM Executive</h1>
        <p className="text-xs text-slate-400 mt-1 font-medium uppercase tracking-widest">
          Meeting Intelligence
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-700 space-y-3">
        {user && (
          <div className="px-4 py-2 bg-slate-800 rounded-xl">
            <p className="text-xs font-bold text-white truncate">
              {user.fullName || user.firstName || 'User'}
            </p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider truncate">
              {user.primaryEmailAddress?.emailAddress || ''}
            </p>
          </div>
        )}

        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-widest text-slate-300 hover:bg-red-600 hover:text-white transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
