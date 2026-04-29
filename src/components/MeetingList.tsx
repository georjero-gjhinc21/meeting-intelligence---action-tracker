import React from 'react';
import {
  FolderOpen,
  Search,
  Filter,
  PlayCircle,
  ShieldCheck,
  Globe,
  Upload,
  HardDrive,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Trash2,
  X,
  FileText,
  ChevronDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useMeetings } from '../context/MeetingsContext';
import { processFiles, isTranscriptFile } from '../services/transcriptService';
import {
  pickDriveFiles,
  driveFileToFile,
  isGoogleDriveConfigured,
} from '../services/googleDriveService';
import { MeetingSource } from '../types';

interface IngestionState {
  active: boolean;
  source: MeetingSource | null;
  total: number;
  done: number;
  message: string;
}

const INITIAL_INGESTION: IngestionState = {
  active: false,
  source: null,
  total: 0,
  done: 0,
  message: '',
};

type SourceFilter = MeetingSource | 'ALL';

const SOURCE_FILTERS: { value: SourceFilter; label: string }[] = [
  { value: 'ALL', label: 'All Sources' },
  { value: 'Local', label: 'Local' },
  { value: 'Google Drive', label: 'Google Drive' },
  { value: 'Microsoft Teams', label: 'Microsoft Teams' },
  { value: 'Manual', label: 'Manual' },
];

export default function MeetingList() {
  const { meetings, addMeeting, updateMeeting, addActions, removeMeeting } = useMeetings();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [sourceFilter, setSourceFilter] = React.useState<SourceFilter>('ALL');
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [ingestion, setIngestion] = React.useState<IngestionState>(INITIAL_INGESTION);
  const [toast, setToast] = React.useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const filterRef = React.useRef<HTMLDivElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const folderInputRef = React.useRef<HTMLInputElement>(null);
  const teamsInputRef = React.useRef<HTMLInputElement>(null);

  // Close filter dropdown on outside click
  React.useEffect(() => {
    if (!filterOpen) return;
    const onClick = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [filterOpen]);

  const filteredMeetings = meetings.filter((m) => {
    if (sourceFilter !== 'ALL' && m.source !== sourceFilter) return false;
    const q = searchQuery.toLowerCase();
    if (!q) return true;
    return (
      m.title.toLowerCase().includes(q) ||
      m.folderPath.toLowerCase().includes(q) ||
      (m.platform || '').toLowerCase().includes(q)
    );
  });

  const showToast = (kind: 'ok' | 'err', text: string) => {
    setToast({ kind, text });
    setTimeout(() => setToast(null), 4500);
  };

  const runIngestion = React.useCallback(
    async (files: File[], source: MeetingSource, folderPath?: string) => {
      const transcripts = files.filter((f) => isTranscriptFile(f.name));
      if (transcripts.length === 0) {
        showToast('err', `No transcript files found. Supported: .txt, .vtt, .srt, .md, .json`);
        return;
      }

      setIngestion({
        active: true,
        source,
        total: transcripts.length,
        done: 0,
        message: `Ingesting ${transcripts.length} file${transcripts.length > 1 ? 's' : ''} from ${source}...`,
      });

      let done = 0;
      const result = await processFiles(transcripts, {
        source,
        folderPath,
        onMeetingCreated: addMeeting,
        onMeetingUpdated: (id, patch) => {
          updateMeeting(id, patch);
          if (patch.status === 'Processed' || patch.status === 'Failed') {
            done += 1;
            setIngestion((prev) => ({ ...prev, done }));
          }
        },
        onActionsExtracted: addActions,
      });

      setIngestion(INITIAL_INGESTION);
      const skippedNote =
        result.skipped > 0
          ? ` (${result.skipped} non-transcript file${result.skipped > 1 ? 's' : ''} skipped)`
          : '';
      showToast(
        'ok',
        `Processed ${result.processed} transcript${result.processed > 1 ? 's' : ''} from ${source}${skippedNote}`
      );
    },
    [addMeeting, updateMeeting, addActions]
  );

  // ---------- LOCAL ----------
  const handleLocalFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (files.length === 0) return;
    runIngestion(files, 'Local');
  };

  const handleLocalFolder = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (files.length === 0) return;
    const folderPath = (files[0] as any).webkitRelativePath?.split('/')[0] || 'Local Folder';
    runIngestion(files, 'Local', folderPath);
  };

  // ---------- GOOGLE DRIVE ----------
  const handleGoogleDrive = async () => {
    try {
      if (!isGoogleDriveConfigured()) {
        showToast(
          'err',
          'Google Drive needs setup — see googleDriveService.ts. Falling back to local file picker.'
        );
        fileInputRef.current?.click();
        return;
      }
      const picked = await pickDriveFiles();
      if (picked.length === 0) return;

      setIngestion({
        active: true,
        source: 'Google Drive',
        total: picked.length,
        done: 0,
        message: `Downloading ${picked.length} file${picked.length > 1 ? 's' : ''} from Drive...`,
      });

      const files: File[] = [];
      for (const df of picked) {
        try {
          files.push(await driveFileToFile(df));
        } catch (err) {
          console.error('Drive download failed', df, err);
        }
      }
      await runIngestion(files, 'Google Drive', '/Google Drive');
    } catch (err: any) {
      console.error(err);
      setIngestion(INITIAL_INGESTION);
      showToast('err', err?.message || 'Google Drive ingestion failed');
    }
  };

  // ---------- MICROSOFT TEAMS ----------
  const handleTeams = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (files.length === 0) return;
    runIngestion(files, 'Microsoft Teams', '/Teams Downloads');
  };

  // ---------- DRAG & DROP ----------
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const items = Array.from(e.dataTransfer.items);
    const files: File[] = [];

    const walk = async (entry: any): Promise<void> => {
      if (entry.isFile) {
        await new Promise<void>((resolve) => {
          entry.file((file: File) => {
            (file as any).webkitRelativePath = entry.fullPath?.replace(/^\//, '') || file.name;
            files.push(file);
            resolve();
          });
        });
      } else if (entry.isDirectory) {
        const reader = entry.createReader();
        const entries: any[] = await new Promise((resolve) => reader.readEntries(resolve));
        for (const child of entries) await walk(child);
      }
    };

    for (const item of items) {
      const entry = (item as any).webkitGetAsEntry?.();
      if (entry) {
        await walk(entry);
      } else {
        const f = (item as any).getAsFile();
        if (f) files.push(f);
      }
    }

    if (files.length === 0) return;
    runIngestion(files, 'Local', 'Drag & Drop');
  };

  const sources = [
    {
      name: 'Google Drive',
      path: isGoogleDriveConfigured() ? 'Pick from Drive' : 'Setup required',
      icon: Globe,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      border: 'group-hover:border-indigo-300',
      onClick: handleGoogleDrive,
    },
    {
      name: 'Microsoft Teams',
      path: 'Upload .vtt / .docx',
      icon: ShieldCheck,
      color: 'text-blue-500',
      bg: 'bg-blue-50',
      border: 'group-hover:border-blue-300',
      onClick: () => teamsInputRef.current?.click(),
    },
    {
      name: 'Local Files',
      path: 'Browse this device',
      icon: HardDrive,
      color: 'text-cyan-600',
      bg: 'bg-cyan-50',
      border: 'group-hover:border-cyan-300',
      onClick: () => fileInputRef.current?.click(),
    },
    {
      name: 'Local Folder',
      path: 'Recursive scan',
      icon: FolderOpen,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'group-hover:border-emerald-300',
      onClick: () => folderInputRef.current?.click(),
    },
  ];

  const activeFilterLabel =
    SOURCE_FILTERS.find((f) => f.value === sourceFilter)?.label || 'All Sources';

  return (
    <div className="p-8 space-y-8" id="meetings-view">
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".txt,.vtt,.srt,.md,.json"
        onChange={handleLocalFiles}
        className="hidden"
      />
      <input
        ref={folderInputRef}
        type="file"
        multiple
        // @ts-ignore - non-standard but widely supported
        webkitdirectory=""
        directory=""
        onChange={handleLocalFolder}
        className="hidden"
      />
      <input
        ref={teamsInputRef}
        type="file"
        multiple
        accept=".txt,.vtt,.srt,.docx"
        onChange={handleTeams}
        className="hidden"
      />

      <header className="flex justify-between items-end gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Recording Monitoring</h1>
          <p className="text-slate-500 text-sm mt-1">
            Connect a source to scan transcripts and extract executive intelligence.
          </p>
        </div>
        <div className="flex gap-3 items-center flex-wrap">
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

          {/* Filter Sources dropdown */}
          <div ref={filterRef} className="relative">
            <button
              onClick={() => setFilterOpen((o) => !o)}
              className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-colors shadow-sm border ${
                sourceFilter !== 'ALL'
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              {activeFilterLabel}
              <ChevronDown className={`w-3 h-3 transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {filterOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 top-full mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-30"
                >
                  {SOURCE_FILTERS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setSourceFilter(opt.value);
                        setFilterOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-[11px] font-bold uppercase tracking-widest flex items-center justify-between hover:bg-slate-50 transition-colors ${
                        sourceFilter === opt.value ? 'text-indigo-700' : 'text-slate-600'
                      }`}
                    >
                      {opt.label}
                      {sourceFilter === opt.value && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={ingestion.active}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-100 disabled:opacity-50 flex items-center gap-2"
          >
            <Upload className="w-3.5 h-3.5" />
            Quick Ingest
          </button>
        </div>
      </header>

      {/* Source cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {sources.map((source) => (
          <button
            key={source.name}
            onClick={source.onClick}
            disabled={ingestion.active}
            className={`p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 group ${source.border} transition-all cursor-pointer text-left disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <div className={`p-3 rounded-xl ${source.bg} group-hover:scale-110 transition-transform`}>
              <source.icon className={`w-5 h-5 ${source.color}`} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {source.name}
              </p>
              <p className="text-xs font-bold text-slate-800 mt-1 truncate">{source.path}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Drag & drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative rounded-2xl border-2 border-dashed p-10 text-center transition-all ${
          isDragging
            ? 'border-indigo-400 bg-indigo-50/50'
            : 'border-slate-200 bg-white hover:border-slate-300'
        }`}
      >
        <div className="flex flex-col items-center gap-3 pointer-events-none">
          <div className="p-3 bg-slate-50 rounded-2xl">
            <FileText className="w-5 h-5 text-slate-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-700">Drop transcript files or folders here</p>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              Supports .txt, .vtt, .srt, .md — Teams/Meet exports work directly
            </p>
          </div>
        </div>
      </div>

      {/* Ingestion progress banner */}
      <AnimatePresence>
        {ingestion.active && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-slate-900 text-white rounded-2xl p-5 flex items-center gap-5 shadow-xl shadow-slate-200"
          >
            <Loader2 className="w-5 h-5 animate-spin text-indigo-300 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold uppercase tracking-widest text-indigo-300">
                {ingestion.source} Pipeline Running
              </p>
              <p className="text-sm font-bold mt-1 truncate">{ingestion.message}</p>
              <div className="w-full bg-slate-700 h-1.5 rounded-full mt-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: ingestion.total > 0 ? `${(ingestion.done / ingestion.total) * 100}%` : '0%',
                  }}
                  className="h-full bg-indigo-400"
                />
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Progress</p>
              <p className="text-lg font-bold font-mono">
                {ingestion.done} / {ingestion.total}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-6 right-6 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 z-50 ${
              toast.kind === 'ok'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border border-rose-200 text-rose-900'
            }`}
          >
            {toast.kind === 'ok' ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <p className="text-xs font-bold">{toast.text}</p>
            <button onClick={() => setToast(null)} className="text-current opacity-50 hover:opacity-100">
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Meetings table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Recent Captures · {filteredMeetings.length}
            {sourceFilter !== 'ALL' && (
              <span className="ml-2 text-indigo-600">· filtered: {activeFilterLabel}</span>
            )}
          </h2>
          <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest">
            <div className="flex items-center gap-1.5 text-emerald-600">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {meetings.filter((m) => m.status === 'Processed').length} Processed
            </div>
            <div className="flex items-center gap-1.5 text-amber-600">
              <Loader2 className="w-3.5 h-3.5" />
              {meetings.filter((m) => m.status === 'Processing').length} Processing
            </div>
            <div className="flex items-center gap-1.5 text-rose-600">
              <AlertCircle className="w-3.5 h-3.5" />
              {meetings.filter((m) => m.status === 'Failed').length} Failed
            </div>
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
            {filteredMeetings.length === 0 && (
              <tr>
                <td colSpan={5} className="px-8 py-12 text-center text-sm text-slate-400">
                  {meetings.length === 0
                    ? 'No meetings yet — connect a source above to get started.'
                    : 'No meetings match the current filter.'}
                </td>
              </tr>
            )}
            {filteredMeetings.map((meeting) => (
              <tr key={meeting.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-2 rounded-lg transition-colors ${
                        meeting.status === 'Processing'
                          ? 'bg-amber-100 text-amber-600'
                          : meeting.status === 'Failed'
                          ? 'bg-rose-100 text-rose-600'
                          : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600'
                      }`}
                    >
                      {meeting.status === 'Processing' ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : meeting.status === 'Failed' ? (
                        <AlertCircle className="w-4 h-4" />
                      ) : (
                        <PlayCircle className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 leading-tight truncate">
                        {meeting.title}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter mt-0.5">
                        {meeting.platform} · {meeting.duration}
                        {meeting.errorMessage && (
                          <span className="text-rose-500 normal-case tracking-normal ml-2">
                            — {meeting.errorMessage}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5 font-mono text-[10px] text-slate-500 tracking-tight max-w-[200px] truncate">
                  {meeting.folderPath}
                </td>
                <td className="px-8 py-5 text-[10px] font-bold text-slate-600 uppercase">
                  {meeting.date}
                </td>
                <td className="px-8 py-5 text-center">
                  <span
                    className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-tight border ${
                      meeting.status === 'Processed'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        : meeting.status === 'Processing'
                        ? 'bg-amber-50 text-amber-700 border-amber-100'
                        : meeting.status === 'Failed'
                        ? 'bg-rose-50 text-rose-700 border-rose-100'
                        : 'bg-slate-50 text-slate-700 border-slate-100'
                    }`}
                  >
                    {meeting.status}
                  </span>
                </td>
                <td className="px-8 py-5 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={() => removeMeeting(meeting.id)}
                      className="text-slate-300 hover:text-rose-500 transition-colors"
                      title="Remove meeting and its actions"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
