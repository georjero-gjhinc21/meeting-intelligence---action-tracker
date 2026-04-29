import React from 'react';
import {
  FolderOpen,
  Search,
  Filter,
  PlayCircle,
  ShieldCheck,
  Globe,
  Database,
  Upload,
  X
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { DatabaseMeeting } from '../types/database';

export default function MeetingList() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = React.useState(false);
  const [uploadForm, setUploadForm] = React.useState({
    title: '',
    source: 'Google Meet',
    transcript: ''
  });
  const queryClient = useQueryClient();

  // Fetch current user and meetings
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user;
    }
  });

  const { data: meetings = [], isLoading } = useQuery({
    queryKey: ['meetings', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as DatabaseMeeting[];
    },
    enabled: !!user?.id
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData: typeof uploadForm) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('meetings')
        .insert({
          user_id: user.id,
          title: formData.title,
          source: formData.source,
          transcript: formData.transcript,
          status: 'Pending'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      setIsUploadModalOpen(false);
      setUploadForm({ title: '', source: 'Google Meet', transcript: '' });
    }
  });

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    uploadMutation.mutate(uploadForm);
  };

  const filteredMeetings = meetings.filter(m =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.folder_path?.toLowerCase() || '').includes(searchQuery.toLowerCase())
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
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-100 flex items-center gap-2"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload Transcript
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
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 bg-slate-200 rounded-lg" />
                      <div className="space-y-2">
                        <div className="h-3 w-40 bg-slate-200 rounded" />
                        <div className="h-2 w-24 bg-slate-200 rounded" />
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="h-2 w-32 bg-slate-200 rounded" />
                  </td>
                  <td className="px-8 py-5">
                    <div className="h-2 w-20 bg-slate-200 rounded" />
                  </td>
                  <td className="px-8 py-5 text-center">
                    <div className="h-6 w-20 bg-slate-200 rounded-full mx-auto" />
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="h-2 w-16 bg-slate-200 rounded ml-auto" />
                  </td>
                </tr>
              ))
            ) : filteredMeetings.length === 0 ? (
              // Empty state
              <tr>
                <td colSpan={5} className="px-8 py-16 text-center">
                  <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
                    <div className="p-4 bg-slate-100 rounded-2xl">
                      <Upload className="w-8 h-8 text-slate-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 mb-1">No meetings yet</h3>
                      <p className="text-xs text-slate-500">Upload your first transcript to get started</p>
                    </div>
                    <button
                      onClick={() => setIsUploadModalOpen(true)}
                      className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-100"
                    >
                      Upload Transcript
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filteredMeetings.map((meeting) => (
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
                          {meeting.source || 'Manual'} • {meeting.duration || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 font-mono text-[10px] text-slate-500 tracking-tight">
                    {meeting.folder_path || '—'}
                  </td>
                  <td className="px-8 py-5 text-[10px] font-bold text-slate-600 uppercase">
                    {new Date(meeting.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-tight border ${
                      meeting.status === 'Processed'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        : 'bg-amber-50 text-amber-700 border-amber-100'
                    }`}>
                      {meeting.status || 'Pending'}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:underline">
                      Analyze
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setIsUploadModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-800">Upload Transcript</h2>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Meeting Title
                </label>
                <input
                  type="text"
                  required
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-400"
                  placeholder="e.g., Q1 Planning Meeting"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Source
                </label>
                <select
                  value={uploadForm.source}
                  onChange={(e) => setUploadForm({ ...uploadForm, source: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-400"
                >
                  <option value="Google Meet">Google Meet</option>
                  <option value="Microsoft Teams">Microsoft Teams</option>
                  <option value="Zoom">Zoom</option>
                  <option value="Manual">Manual</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Transcript
                </label>
                <textarea
                  required
                  value={uploadForm.transcript}
                  onChange={(e) => setUploadForm({ ...uploadForm, transcript: e.target.value })}
                  rows={8}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-400 resize-none"
                  placeholder="Paste your meeting transcript here..."
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadMutation.isPending}
                  className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadMutation.isPending ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
