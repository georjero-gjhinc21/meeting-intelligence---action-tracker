/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import MeetingList from './components/MeetingList';
import HierarchyView from './components/HierarchyView';
import ActionExtraction from './components/ActionExtraction';
import SalesforceSync from './components/SalesforceSync';
import SignInScreen from './components/SignInScreen';
import { MeetingsProvider } from './context/MeetingsContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BrainCircuit } from 'lucide-react';

function AuthenticatedApp() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = React.useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'meetings': return <MeetingList />;
      case 'hierarchy': return <HierarchyView />;
      case 'extracts': return <ActionExtraction />;
      case 'integrations': return <SalesforceSync />;
      default: return <Dashboard />;
    }
  };

  const initials = user
    ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : '';

  return (
    <MeetingsProvider>
      <div className="flex h-screen bg-slate-50 overflow-hidden font-sans" id="app-container">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active System</span>
              <div className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase border border-indigo-100">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                Axiom-LLM-v4 Active
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-4 text-[10px] font-bold text-emerald-600 tracking-tight">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                LEGAL COMPLIANCE: TRANSCRIPTS ONLY
              </div>
              <div className="h-8 w-[1px] bg-slate-100" />
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-slate-800 tracking-tight">
                    {user?.name || 'Guest'}
                  </p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                    {user?.provider === 'demo' ? 'Demo Session' : 'Project Owner'}
                  </p>
                </div>
                {user?.picture ? (
                  <img
                    src={user.picture}
                    referrerPolicy="no-referrer"
                    alt={user.name}
                    className="w-9 h-9 rounded-full border border-slate-200"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-sm">
                    {initials || 'U'}
                  </div>
                )}
              </div>
            </div>
          </header>

          <section className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="h-full"
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </section>

          <footer className="h-10 bg-white border-t border-slate-200 flex items-center justify-between px-8 text-[10px] text-slate-400 font-mono tracking-tighter shrink-0">
            <div>METRIC_CONFIDENCE: 0.9841 // ROLE_VALIDATION: ENABLE_CHOSEN</div>
            <div className="flex items-center gap-4">
              <span>TRANSCRIPTION_LATENCY: 420ms</span>
              <div className="flex items-center gap-1">
                <BrainCircuit className="w-3 h-3 text-blue-500" />
                GEMINI_INTEL_ENGINE
              </div>
            </div>
          </footer>
        </main>
      </div>
    </MeetingsProvider>
  );
}

function Gate() {
  const { user } = useAuth();
  if (!user) return <SignInScreen />;
  return <AuthenticatedApp />;
}

export default function App() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}
