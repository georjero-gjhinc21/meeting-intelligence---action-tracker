import { Meeting, ActionItem, MeetingSource, StakeholderRole, TrackingLevel, ExecutiveOffice, InsightCategory } from '../types';
import { deriveCategoryFromLevel, deriveOfficesFromRole } from '../config/offices';
// @ts-ignore - mammoth may not have types
import mammoth from 'mammoth';

// Supported file extensions - including corporate document formats
const TEXT_EXTENSIONS = [
  '.txt', '.vtt', '.srt', '.md', '.json',  // Original text formats
  '.docx', '.doc',                          // Microsoft Word
  '.pdf',                                   // PDF documents
  '.rtf',                                   // Rich Text Format
  '.pptx', '.ppt'                          // PowerPoint (transcripts from slide notes)
];

export function isTranscriptFile(filename: string): boolean {
  const lower = filename.toLowerCase();
  return TEXT_EXTENSIONS.some(ext => lower.endsWith(ext));
}

/**
 * Parse Microsoft Word (.docx, .doc) files
 */
async function parseWordDocument(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value || '';
  } catch (error) {
    console.error('Error parsing Word document:', error);
    throw new Error('Failed to parse Word document');
  }
}

/**
 * Parse PDF files using pdf-parse
 */
async function parsePDF(file: File): Promise<string> {
  try {
    // Dynamically import pdf-parse
    const pdfParseModule = await import('pdf-parse');
    // @ts-ignore - pdf-parse has complex export structure
    const pdfParse = pdfParseModule.default || pdfParseModule;
    const arrayBuffer = await file.arrayBuffer();
    const data = await pdfParse(Buffer.from(arrayBuffer));
    return data.text || '';
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('Failed to parse PDF document');
  }
}

/**
 * Parse PowerPoint files (.pptx) - extracts text from slides and notes
 */
async function parsePowerPoint(file: File): Promise<string> {
  try {
    // Note: pptx2json doesn't work in browser, so we'll use a simpler approach
    // PowerPoint .pptx files are ZIP archives containing XML files
    const JSZip = (await import('jszip')).default;
    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);

    let text = '';

    // Extract text from slides
    const slideFiles = Object.keys(zip.files).filter(name =>
      name.startsWith('ppt/slides/slide') && name.endsWith('.xml')
    );

    for (const slidePath of slideFiles) {
      const content = await zip.files[slidePath].async('text');
      // Extract text between XML tags
      const textMatches = content.match(/<a:t>([^<]+)<\/a:t>/g);
      if (textMatches) {
        textMatches.forEach(match => {
          const extracted = match.replace(/<\/?a:t>/g, '');
          text += extracted + ' ';
        });
        text += '\n\n';
      }
    }

    return text.trim();
  } catch (error) {
    console.error('Error parsing PowerPoint:', error);
    throw new Error('Failed to parse PowerPoint document');
  }
}

/**
 * Parse RTF files
 */
async function parseRTF(file: File): Promise<string> {
  try {
    const text = await file.text();
    // Basic RTF stripping - remove RTF control codes
    // This is a simple implementation; for complex RTF, consider a dedicated library
    return text
      .replace(/\\[a-z]{1,32}(-?\d{1,10})?[ ]?/g, '') // Remove RTF control words
      .replace(/[{}]/g, '')                            // Remove braces
      .replace(/\\\\/g, '\\')                          // Unescape backslashes
      .replace(/\\'/g, "'")                            // Unescape quotes
      .trim();
  } catch (error) {
    console.error('Error parsing RTF:', error);
    throw new Error('Failed to parse RTF document');
  }
}

/**
 * Read file content based on file type
 */
export async function readFileAsText(file: File): Promise<string> {
  const lower = file.name.toLowerCase();

  // Microsoft Word documents
  if (lower.endsWith('.docx') || lower.endsWith('.doc')) {
    return parseWordDocument(file);
  }

  // PDF documents
  if (lower.endsWith('.pdf')) {
    return parsePDF(file);
  }

  // PowerPoint documents
  if (lower.endsWith('.pptx') || lower.endsWith('.ppt')) {
    return parsePowerPoint(file);
  }

  // RTF documents
  if (lower.endsWith('.rtf')) {
    return parseRTF(file);
  }

  // Plain text files (original behavior)
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
      role: (a.role as StakeholderRole) || StakeholderRole.INFORMED,
      level: (a.level as TrackingLevel) || TrackingLevel.TASK,
      status: 'Pending',
      priority: (a.priority as ActionItem['priority']) || 'Medium',
      sourceMeetingId: id,
      dueDate: a.dueDate,
      chainOfThought: a.chainOfThought,
      offices: a.offices?.length ? (a.offices as ExecutiveOffice[]) : deriveOfficesFromRole(a.role),
      category: a.category || deriveCategoryFromLevel(a.level),
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
