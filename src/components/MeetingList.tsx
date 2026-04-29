import React from 'react';
import { 
  FolderOpen, 
  Search, 
  Filter, 
  MoreVertical, 
  PlayCircle, 
  FileText, 
  ShieldCheck,
  Globe,
  Database
} from 'lucide-react';
import { MOCK_MEETINGS } from '../constants';

export default function MeetingList() {
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredMeetings = MOCK_MEETINGS.filter(m => 
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.folderPath.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 space-y-8" id="meetings-view">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Recording Monitoring</h1>
          <p className="text-slate-500 text-sm mt-1">Scan designated folders for transcripts and recordings.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search meetings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-600 focus:outline-none focus:border-indigo-400 shadow-sm"
            />
          </div>
          <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm">
            <Filter className="w-3.5 h-3.5" />
            Filter Sources
          </button>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-100">
            Scan All Folders
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { name: 'Google Drive', path: '/Recordings/Meet', icon: Globe, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { name: 'Microsoft Teams', path: 'SharePoint Alpha', icon: ShieldCheck, color: 'text-blue-500', bg: 'bg-blue-50' },
          { name: 'AWS S3', path: 's3://transcripts', icon: Database, color: 'text-cyan-500', bg: 'bg-cyan-50' },
        ].map(source => (
          <div key={source.name} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 group hover:border-indigo-200 transition-all cursor-pointer">
            <div className={`p-3 rounded-xl ${source.bg}`}>
              <source.icon className={`w-5 h-5 ${source.color}`} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{source.name}</p>
              <p className="text-xs font-bold text-slate-800 mt-1 truncate max-w-[120px]">{source.path}</p>
            </div>
          </div>
        ))}
         <div className="p-5 bg-slate-50 rounded-2xl border border-dashed border-slate-300 flex items-center justify-center gap-2 text-slate-400 hover:text-slate-600 hover:border-slate-400 cursor-pointer transition-all">
            <FolderOpen className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Add Source</span>
         </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
           <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recent Captures</h2>
           <div className="w-40 h-1.5 bg-slate-100 rounded-full overflow-hidden">
             <div className="w-2/3 h-full bg-indigo-500" />
           </div>
        </div>
        <table className="w-full text-left">
          <thead className="bg-white border-b border-slate-200 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            <tr>
              <th className="px-8 py-3 w-1/3">Meeting</th>
              <th className="px-8 py-3">Path</th>
              <th className="px-8 py-3">Date</th>
              <th className="px-8 py-3 text-center">Status</th>
              <th className="px-8 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredMeetings.map((meeting) => (
              <tr key={meeting.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors text-slate-400">
                      <PlayCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 leading-tight">
                        {meeting.title}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter mt-0.5">
                        {meeting.platform} • {meeting.duration}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5 font-mono text-[10px] text-slate-500 tracking-tight">
                  {meeting.folderPath}
                </td>
                <td className="px-8 py-5 text-[10px] font-bold text-slate-600 uppercase">
                  {meeting.date}
                </td>
                <td className="px-8 py-5 text-center">
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-tight border ${
                    meeting.status === 'Processed' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                      : 'bg-amber-50 text-amber-700 border-amber-100'
                  }`}>
                    {meeting.status}
                  </span>
                </td>
                <td className="px-8 py-5 text-right">
                  <button className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:underline">
                    Analyze
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
