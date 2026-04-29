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
  X,
  FileText,
  Loader2
} from 'lucide-react';
import { useMeetings } from '../contexts/MeetingsContext';
import { processTranscriptBatch } from '../services/transcriptService';
import { openGoogleDrivePicker, downloadGoogleDriveFile } from '../services/googleDriveService';
import { supabase } from '../lib/supabase';

interface ProcessingStatus {
  isProcessing: boolean;
  current: number;
  total: number;
  currentFile: string;
}

export default function MeetingList() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isDragging, setIsDragging] = React.useState(false);
  const [processingStatus, setProcessingStatus] = React.useState<ProcessingStatus>({
    isProcessing: false,
    current: 0,
    total: 0,
    currentFile: ''
  });
  const [toast, setToast] = React.useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const { meetings, isLoading, refreshMeetings } = useMeetings();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const folderInputRef = React.useRef<HTMLInputElement>(null);

  const { data: user } = React.useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user;
    }
  });

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const handleFiles = async (files: FileList | File[], source: string) => {
    if (!user?.id) {
      showToast('Please sign in to upload transcripts', 'error');
      return;
    }

    const fileArray = Array.from(files).filter(f =>
      f.name.endsWith('.txt') ||
      f.name.endsWith('.vtt') ||
      f.name.endsWith('.srt') ||
      f.name.endsWith('.docx')
    );

    if (fileArray.length === 0) {
      showToast('No valid transcript files found (.txt, .vtt, .srt, .docx)', 'error');
      return;
    }

    setProcessingStatus({ isProcessing: true, current: 0, total: fileArray.length, currentFile: '' });

    try {
      const result = await processTranscriptBatch(
        fileArray,
        source,
        user.id,
        (current, total, filename) => {
          setProcessingStatus({ isProcessing: true, current, total, currentFile: filename });
        }
      );

      refreshMeetings();
      setProcessingStatus({ isProcessing: false, current: 0, total: 0, currentFile: '' });

      if (result.failed === 0) {
        showToast(`Successfully processed ${result.processed} transcript(s)`, 'success');
      } else {
        showToast(`Processed ${result.processed}, failed ${result.failed} transcript(s)`, 'error');
      }
    } catch (error) {
      console.error('Batch processing error:', error);
      setProcessingStatus({ isProcessing: false, current: 0, total: 0, currentFile: '' });
      showToast('Failed to process transcripts', 'error');
    }
  };

  const handleLocalFiles = () => {
    fileInputRef.current?.click();
  };

  const handleLocalFolder = () => {
    folderInputRef.current?.click();
  };

  const handleGoogleDrive = async () => {
    if (!import.meta.env.VITE_GOOGLE_API_KEY || !import.meta.env.VITE_GOOGLE_CLIENT_ID) {
      showToast('Google Drive integration not configured. Add VITE_GOOGLE_API_KEY and VITE_GOOGLE_CLIENT_ID to .env.local', 'error');
      handleLocalFiles(); // Fallback to local picker
      return;
    }

    try {
      await openGoogleDrivePicker(async (files) => {
        const downloadedFiles: File[] = [];

        for (const file of files) {
          const content = await downloadGoogleDriveFile(file.id);
          const blob = new Blob([content], { type: 'text/plain' });
          const downloadedFile = new File([blob], file.name, { type: 'text/plain' });
          downloadedFiles.push(downloadedFile);
        }

        handleFiles(downloadedFiles, 'Google Drive');
      });
    } catch (error) {
      console.error('Google Drive picker error:', error);
      showToast('Google Drive picker failed. Please try local upload.', 'error');
      handleLocalFiles();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files, 'Local Upload');
    }
  };

  const filteredMeetings = meetings.filter(m =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.folder_path?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 space-y-8" id="meetings-view">
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".txt,.vtt,.srt,.docx"
        onChange={(e) => e.target.files && handleFiles(e.target.files, 'Local Upload')}
        className="hidden"
      />
      <input
        ref={folderInputRef}
        type="file"
        multiple
        // @ts-ignore - webkitdirectory is not in TypeScript types
        webkitdirectory="true"
        onChange={(e) => e.target.files && handleFiles(e.target.files, 'Local Folder')}
        className="hidden"
      />

      {/* Toast notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-lg ${
          toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Processing banner */}
      {processingStatus.isProcessing && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
          <div className="flex-1">
            <p className="text-sm font-bold text-indigo-900">
              Processing transcripts: {processingStatus.current} of {processingStatus.total}
            </p>
            <p className="text-xs text-indigo-600 mt-0.5">{processingStatus.currentFile}</p>
          </div>
          <div className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
            {Math.round((processingStatus.current / processingStatus.total) * 100)}%
          </div>
        </div>
      )}

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
        </div>
      </header>

      {/* Source cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <button
          onClick={handleGoogleDrive}
          disabled={processingStatus.isProcessing}
          className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 group hover:border-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="p-3 rounded-xl bg-indigo-50">
            <Globe className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Google Drive</p>
            <p className="text-xs font-bold text-slate-800 mt-1">Pick from Drive</p>
          </div>
        </button>

        <button
          onClick={handleLocalFiles}
          disabled={processingStatus.isProcessing}
          className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 group hover:border-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="p-3 rounded-xl bg-blue-50">
            <ShieldCheck className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Microsoft Teams</p>
            <p className="text-xs font-bold text-slate-800 mt-1">Upload .vtt file</p>
          </div>
        </button>

        <button
          onClick={handleLocalFolder}
          disabled={processingStatus.isProcessing}
          className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 group hover:border-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="p-3 rounded-xl bg-cyan-50">
            <Database className="w-5 h-5 text-cyan-500" />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Local Folder</p>
            <p className="text-xs font-bold text-slate-800 mt-1">Scan folder</p>
          </div>
        </button>

        <button
          onClick={handleLocalFiles}
          disabled={processingStatus.isProcessing}
          className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 group hover:border-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="p-3 rounded-xl bg-emerald-50">
            <Upload className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Local Files</p>
            <p className="text-xs font-bold text-slate-800 mt-1">Upload files</p>
          </div>
        </button>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
          isDragging
            ? 'border-indigo-400 bg-indigo-50'
            : 'border-slate-300 bg-slate-50/50'
        }`}
      >
        <FileText className={`w-12 h-12 mx-auto mb-3 ${isDragging ? 'text-indigo-600' : 'text-slate-400'}`} />
        <p className="text-sm font-bold text-slate-800 mb-1">
          {isDragging ? 'Drop files here' : 'Drag & drop transcript files'}
        </p>
        <p className="text-xs text-slate-500">
          Supports .txt, .vtt, .srt, and .docx formats
        </p>
      </div>

      {/* Meetings table */}
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
              <tr>
                <td colSpan={5} className="px-8 py-16 text-center">
                  <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
                    <div className="p-4 bg-slate-100 rounded-2xl">
                      <Upload className="w-8 h-8 text-slate-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 mb-1">No meetings yet</h3>
                      <p className="text-xs text-slate-500">Upload transcripts using the source cards above or drag & drop files</p>
                    </div>
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
                        : meeting.status === 'Processing'
                        ? 'bg-amber-50 text-amber-700 border-amber-100'
                        : meeting.status === 'Failed'
                        ? 'bg-red-50 text-red-700 border-red-100'
                        : 'bg-slate-50 text-slate-700 border-slate-100'
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
    </div>
  );
}
