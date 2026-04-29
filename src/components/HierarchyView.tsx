import React from 'react';
import { 
  ArrowRight, 
  ChevronDown, 
  ChevronRight, 
  ListChecks, 
  Target, 
  Zap, 
  Rocket, 
  ClipboardList, 
  Layers,
  Search,
  Filter
} from 'lucide-react';
import { motion } from 'motion/react';
import { TrackingLevel } from '../types';

export default function HierarchyView() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const levels = [
    { level: TrackingLevel.BOARD_ACTION, icon: Target, color: 'bg-slate-900' },
    { level: TrackingLevel.TRANSFORMATION, icon: Zap, color: 'bg-indigo-600' },
    { level: TrackingLevel.VISION, icon: Rocket, color: 'bg-slate-600' },
    { level: TrackingLevel.PROGRAM, icon: Layers, color: 'bg-slate-800' },
    { level: TrackingLevel.PROJECT, icon: ListChecks, color: 'bg-emerald-600' },
    { level: TrackingLevel.TASK, icon: ClipboardList, color: 'bg-slate-400' },
  ];

  return (
    <div className="p-8 space-y-8" id="hierarchy-view">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Strategic Alignment Cascade</h1>
          <p className="text-slate-500 text-sm mt-1">Tracing vision from the Boardroom to individual tasks.</p>
        </div>
        <div className="flex gap-4">
           <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             <input 
               type="text" 
               placeholder="Filter cascade..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-indigo-400 transition-all shadow-sm"
             />
           </div>
        </div>
      </header>

      <div className="relative pt-4">
        <div className="absolute left-[39px] top-4 bottom-0 w-0.5 bg-slate-200 -z-10" />
        
        <div className="space-y-16">
          {levels.map((item, idx) => (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={item.level}
              className="flex gap-10 items-start group"
            >
              <div className={`w-20 h-20 rounded-2xl ${item.color} flex items-center justify-center shadow-indigo-100 shadow-xl border-8 border-white shrink-0 group-hover:scale-105 transition-all duration-300`}>
                <item.icon className="w-8 h-8 text-white" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">{item.level}</h3>
                  <div className="h-px flex-1 bg-slate-200" />
                  <span className="text-[10px] font-bold text-slate-300 uppercase font-mono tracking-widest">LAYER {idx + 1}</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {([1, 2, 3].slice(0, 3 - (idx % 2)).map((i) => {
                    const title = idx === 0 ? 'Budget Authorization FY27' : 
                                idx === 1 ? 'Data Strategy Transformation' : 
                                idx === 2 ? 'AI-First Customer Interaction' : 
                                'Sample Initiative Name';
                    
                    if (searchQuery && !title.toLowerCase().includes(searchQuery.toLowerCase())) return null;

                    return (
                      <div key={i} className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-50/50 transition-all cursor-pointer group/card border-b-4 border-b-slate-100">
                        <div className="flex justify-between items-start mb-4">
                          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono">
                            INIT-{idx}-{i}
                          </span>
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover/card:text-indigo-600 transition-all" />
                        </div>
                        <p className="font-bold text-slate-800 text-sm leading-snug">
                          {title}
                        </p>
                        <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                          <span className="bg-slate-50 px-2 py-1 rounded">3 LINKS</span>
                          <div className="flex -space-x-2">
                            <div className="w-6 h-6 rounded-full bg-indigo-100 border-2 border-white" />
                            <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] text-slate-500">+1</div>
                          </div>
                        </div>
                      </div>
                    );
                  }))}
                  <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:text-indigo-400 hover:border-indigo-200 transition-all cursor-pointer">
                    <Zap className="w-4 h-4 mb-2 opacity-50" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Add Insight</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
