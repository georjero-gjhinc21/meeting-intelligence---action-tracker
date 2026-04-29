import React from 'react';
import { 
  Search, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  History,
  BrainCircuit,
  Filter,
  ExternalLink,
  Sparkles,
  Loader2
} from 'lucide-react';
import { motion } from 'motion/react';
import { MOCK_ACTIONS } from '../constants';
import { StakeholderRole, ActionItem } from '../types';
import ActionDetailModal from './ActionDetailModal';
import { extractActionItems } from '../services/geminiService';

export default function ActionExtraction() {
  const [selectedRole, setSelectedRole] = React.useState<StakeholderRole | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedAction, setSelectedAction] = React.useState<ActionItem | null>(null);
  const [isExtracting, setIsExtracting] = React.useState(false);
  const [actions, setActions] = React.useState<ActionItem[]>(MOCK_ACTIONS);

  const handleSmartExtract = async () => {
    setIsExtracting(true);
    try {
      const mockTranscript = `
        CTO: We need to set up a POC for AWS S3 folder monitoring. George, can you help with the compliance check?
        CEO: Yes, let's make sure we hit the Sunday deadline for the VC deck.
        CFO: I'll need the budget breakdown by Friday.
      `;
      const extracted = await extractActionItems(mockTranscript);
      
      const newActions: ActionItem[] = extracted.map((a, idx) => ({
        id: `EXT-${Date.now()}-${idx}`,
        title: a.title || 'Untitled Action',
        description: a.description || '',
        role: (a.role as StakeholderRole) || StakeholderRole.COO,
        level: (a.level as any) || 'Task',
        status: 'Pending',
        priority: (a.priority as any) || 'Medium',
        sourceMeetingId: 'm3',
        dueDate: a.dueDate,
        chainOfThought: a.chainOfThought
      }));

      setActions(prev => [...newActions, ...prev]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExtracting(false);
    }
  };

  const filteredActions = (selectedRole === 'ALL' 
    ? actions 
    : actions.filter(a => a.role === selectedRole)
  ).filter(a => 
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'CEO': return 'bg-indigo-600';
      case 'CFO': return 'bg-emerald-600';
      case 'CIO': return 'bg-purple-600';
      case 'CISO': return 'bg-amber-600';
      case 'Board': return 'bg-slate-900';
      default: return 'bg-slate-600';
    }
  };

  const getRoleBg = (role: string) => {
    switch (role) {
      case 'CEO': return 'bg-indigo-50 border-indigo-100 text-indigo-700';
      case 'CFO': return 'bg-emerald-50 border-emerald-100 text-emerald-700';
      case 'CIO': return 'bg-purple-50 border-purple-100 text-purple-700';
      case 'CISO': return 'bg-amber-50 border-amber-100 text-amber-700';
      case 'Board': return 'bg-slate-100 border-slate-200 text-slate-800';
      default: return 'bg-slate-50 border-slate-100 text-slate-600';
    }
  };

  return (
    <div className="p-8 space-y-8" id="extracts-view">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight uppercase">Action Tracker</h1>
          <p className="text-slate-500 text-sm mt-1">Cross-referenced intelligence with voice and role validation.</p>
        </div>
        <button 
          onClick={handleSmartExtract}
          disabled={isExtracting}
          className="text-xs bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
        >
          {isExtracting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5" />
          )}
          {isExtracting ? 'Analyzing...' : 'Smart Extract'}
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search within extracted intelligence..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-indigo-400 transition-all shadow-sm"
          />
        </div>
        <div className="flex gap-2 p-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setSelectedRole('ALL')}
            className={`px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
              selectedRole === 'ALL' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            All Roles
          </button>
          {Object.values(StakeholderRole).map((role) => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap ${
                selectedRole === role ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${selectedRole === role ? 'bg-white' : getRoleColor(role)}`} />
              {role}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {filteredActions.map((action, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            key={action.id}
            onClick={() => setSelectedAction(action)}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col group hover:border-indigo-300 transition-all cursor-pointer"
          >
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase font-mono">#{action.id}</span>
                    <span className="text-[10px] font-bold text-indigo-400 tracking-widest uppercase font-mono px-2 py-0.5 bg-indigo-50 rounded border border-indigo-100">{action.level}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors">
                    {action.title}
                  </h3>
                </div>
                <div className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-widest ${getRoleBg(action.role)}`}>
                   {action.role}
                </div>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                {action.description}
              </p>

              {action.chainOfThought && (
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl relative overflow-hidden">
                  <div className="flex items-center gap-2 mb-3 relative z-10">
                    <BrainCircuit className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Axiom Intelligence Context</span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono italic leading-relaxed relative z-10 border-l-2 border-slate-200 pl-3">
                    "{action.chainOfThought}"
                  </p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-8 pt-4">
                <div className="space-y-1.5">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Status</p>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${action.status === 'Completed' ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-tight">{action.status}</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Priority</p>
                  <span className={`text-xs font-bold uppercase ${action.priority === 'High' ? 'text-rose-600' : 'text-amber-600'}`}>
                    {action.priority}
                  </span>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Due Date</p>
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-tight">{action.dueDate || 'PENDING'}</span>
                </div>
              </div>
            </div>
            
            <div className="px-8 py-5 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center group-hover:bg-indigo-50/30 transition-colors">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <MessageSquare className="w-3.5 h-3.5" />
                View Transcript Segment
              </div>
              <button className="text-indigo-600 text-[10px] font-bold uppercase tracking-widest hover:underline flex items-center gap-1.5">
                Link Insight to Salesforce <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <ActionDetailModal 
        action={selectedAction} 
        onClose={() => setSelectedAction(null)} 
      />
    </div>
  );
}
