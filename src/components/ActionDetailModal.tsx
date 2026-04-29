import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, BrainCircuit, ExternalLink, MessageSquare, CheckCircle2, Clock } from 'lucide-react';
import { ActionItem } from '../types';

interface ActionDetailModalProps {
  action: ActionItem | null;
  onClose: () => void;
}

export default function ActionDetailModal({ action, onClose }: ActionDetailModalProps) {
  if (!action) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200"
        >
          <div className="h-2 w-full bg-indigo-600" />
          
          <div className="p-8">
            <header className="flex justify-between items-start mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded border border-indigo-100">
                    {action.level}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                    ID: {action.id}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight leading-tight">
                  {action.title}
                </h2>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                id="close-modal-btn"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-8">
              <section className="space-y-6">
                <div>
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Description</h3>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">
                    {action.description}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Owner</p>
                    <p className="text-xs font-bold text-slate-800">{action.role}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Priority</p>
                    <p className={`text-xs font-bold ${action.priority === 'High' ? 'text-rose-600' : 'text-amber-600'}`}>
                      {action.priority}
                    </p>
                  </div>
                </div>
              </section>

              <section className="space-y-6">
                <div className="p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100 relative overflow-hidden">
                  <BrainCircuit className="absolute -top-2 -right-2 w-16 h-16 text-indigo-600/5 rotate-12" />
                  <div className="flex items-center gap-2 mb-4">
                    <BrainCircuit className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-[10px] font-bold text-indigo-900 uppercase tracking-widest">Axiom Intelligence</h3>
                  </div>
                  <div className="border-l-2 border-indigo-200 pl-4 py-1">
                    <p className="text-xs text-indigo-800 font-mono italic leading-relaxed">
                      "{action.chainOfThought || 'No AI reasoning available for this manual entry.'}"
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between px-2">
                   <div>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Due Date</p>
                     <p className="text-xs font-bold text-slate-800">{action.dueDate || 'PENDING'}</p>
                   </div>
                   <div className="text-right">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                     <div className="flex items-center gap-2 justify-end">
                       {action.status === 'Completed' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Clock className="w-3.5 h-3.5 text-amber-500" />}
                       <span className="text-xs font-bold text-slate-800 uppercase">{action.status}</span>
                     </div>
                   </div>
                </div>
              </section>
            </div>

            <footer className="pt-8 border-t border-slate-100 flex gap-4">
              <button className="flex-1 bg-slate-900 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-slate-100">
                <ExternalLink className="w-4 h-4" />
                Push to Salesforce
              </button>
              <button className="flex-1 bg-white border border-slate-200 text-slate-600 py-3 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-50 transition-all">
                <MessageSquare className="w-4 h-4" />
                View Segment
              </button>
            </footer>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
