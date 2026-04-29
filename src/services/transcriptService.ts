import { Meeting, ActionItem, MeetingSource, StakeholderRole, TrackingLevel } from '../types';

const TEXT_EXTENSIONS = ['.txt', '.vtt', '.srt', '.md', '.json'];

export function isTranscriptFile(filename: string): boolean {
  const lower = filename.toLowerCase();
  return TEXT_EXTENSIONS.some(ext => lower.endsWith(ext));
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error || new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

/**
 * Strip VTT/SRT timing/sequence lines, keep speaker text.
 * Teams and Meet both export VTT, Zoom exports SRT.
 */
export function normalizeTranscript(raw: string, filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.endsWith('.vtt') || lower.endsWith('.srt')) {
    return raw
      .split(/\r?\n/)
      .filter(line => {
        const t = line.trim();
        if (!t) return false;
        if (t === 'WEBVTT') return false;
        if (/^\d+$/.test(t)) return false; // sequence numbers
        if (/-->/.test(t)) return false; // timestamp lines
        if (/^NOTE\b/.test(t)) return false;
        return true;
      })
      .join('\n');
  }
  return raw;
}

export function inferTitle(filename: string, content: string): string {
  // Prefer markdown H1 or "Meeting Title:" inside content
  const m = content.match(/^#\s+(.+)$/m) || content.match(/Meeting(?:\s+Title)?:\s*(.+)/i);
  if (m && m[1].trim().length > 2) return m[1].trim();

  // Fall back to filename, prettified
  const base = filename.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim();
  if (!base) return 'Untitled Meeting';
  return base.replace(/\b\w/g, c => c.toUpperCase());
}

export function inferPlatform(filename: string, source: MeetingSource): Meeting['platform'] {
  const lower = filename.toLowerCase();
  if (source === 'Microsoft Teams' || lower.includes('teams')) return 'Microsoft Teams';
  if (source === 'Google Drive' || lower.includes('meet')) return 'Google Meet';
  if (lower.includes('zoom')) return 'Zoom';
  if (lower.includes('chime')) return 'AWS Chime';
  return 'Local File';
}

export function estimateDuration(content: string): string {
  // Rough heuristic: ~150 words per minute spoken
  const words = content.trim().split(/\s+/).length;
  if (words < 50) return '—';
  const mins = Math.max(1, Math.round(words / 150));
  if (mins >= 60) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  }
  return `${mins}m`;
}

export interface ProcessOptions {
  source: MeetingSource;
  folderPath?: string;
  onMeetingCreated: (meeting: Meeting) => void;
  onMeetingUpdated: (id: string, patch: Partial<Meeting>) => void;
  onActionsExtracted: (actions: ActionItem[]) => void;
}

export async function processTranscriptFile(file: File, opts: ProcessOptions): Promise<void> {
  const id = `m-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const folderPath = opts.folderPath || (file as any).webkitRelativePath || file.name;

  // Show "Processing" row in UI immediately
  const placeholder: Meeting = {
    id,
    title: inferTitle(file.name, ''),
    date: new Date(file.lastModified || Date.now()).toISOString().slice(0, 10),
    duration: '—',
    platform: inferPlatform(file.name, opts.source),
    status: 'Processing',
    folderPath,
    source: opts.source,
  };
  opts.onMeetingCreated(placeholder);

  try {
    const raw = await readFileAsText(file);
    const transcript = normalizeTranscript(raw, file.name);

    if (!transcript.trim()) {
      opts.onMeetingUpdated(id, { status: 'Failed', errorMessage: 'Empty file' });
      return;
    }

    const title = inferTitle(file.name, transcript);
    const duration = estimateDuration(transcript);
    opts.onMeetingUpdated(id, { title, transcript, duration });

    // Call API endpoint instead of direct Gemini import
    const response = await fetch('/api/extract-actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript })
    });

    if (!response.ok) {
      throw new Error(`Gemini extraction failed: ${response.statusText}`);
    }

    const { actions: extracted } = await response.json();

    const newActions: ActionItem[] = extracted.map((a, idx) => ({
      id: `act-${id}-${idx}`,
      title: a.title || 'Untitled Action',
      description: a.description || '',
      role: (a.role as StakeholderRole) || StakeholderRole.COO,
      level: (a.level as TrackingLevel) || TrackingLevel.TASK,
      status: 'Pending',
      priority: (a.priority as ActionItem['priority']) || 'Medium',
      sourceMeetingId: id,
      dueDate: a.dueDate,
      chainOfThought: a.chainOfThought,
    }));

    opts.onActionsExtracted(newActions);
    opts.onMeetingUpdated(id, { status: 'Processed' });
  } catch (err: any) {
    console.error('Failed to process', file.name, err);
    opts.onMeetingUpdated(id, {
      status: 'Failed',
      errorMessage: err?.message || 'Extraction failed'
    });
  }
}

/**
 * Process files sequentially so we don't hammer Gemini with concurrent requests.
 */
export async function processFiles(files: File[], opts: ProcessOptions): Promise<{ processed: number; skipped: number }> {
  const transcripts = files.filter(f => isTranscriptFile(f.name));
  const skipped = files.length - transcripts.length;
  for (const f of transcripts) {
    await processTranscriptFile(f, opts);
  }
  return { processed: transcripts.length, skipped };
}
