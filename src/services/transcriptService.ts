import { supabase } from '../lib/supabase';

interface ExtractedAction {
  title: string;
  description: string;
  role: string;
  level: string;
  priority: string;
  due_date?: string;
  chain_of_thought?: string;
}

/**
 * Strip VTT/SRT timing codes from transcript files
 */
function stripTimingCodes(content: string): string {
  // Remove VTT headers
  let cleaned = content.replace(/^WEBVTT\s*\n/gm, '');

  // Remove timing lines (00:00:12.340 --> 00:00:15.430)
  cleaned = cleaned.replace(/\d{2}:\d{2}:\d{2}\.\d{3}\s*-->\s*\d{2}:\d{2}:\d{2}\.\d{3}/g, '');

  // Remove VTT cue identifiers (numbers on their own line)
  cleaned = cleaned.replace(/^\d+\s*$/gm, '');

  // Remove speaker labels like <v Speaker Name>
  cleaned = cleaned.replace(/<v\s+[^>]+>/gi, '');

  // Remove any remaining HTML-like tags
  cleaned = cleaned.replace(/<[^>]+>/g, '');

  // Collapse multiple newlines
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  return cleaned.trim();
}

/**
 * Infer a meeting title from filename or content
 */
function inferTitle(filename: string, content: string): string {
  // Remove file extension and clean up
  let title = filename.replace(/\.(txt|vtt|srt|docx?)$/i, '');

  // Replace underscores/dashes with spaces
  title = title.replace(/[_-]+/g, ' ');

  // Capitalize first letter of each word
  title = title.replace(/\b\w/g, l => l.toUpperCase());

  // If title is generic or too short, try to extract from content
  if (title.length < 5 || /^(transcript|meeting|recording)/i.test(title)) {
    const firstLine = content.split('\n')[0];
    if (firstLine && firstLine.length > 5 && firstLine.length < 100) {
      title = firstLine.substring(0, 60) + (firstLine.length > 60 ? '...' : '');
    }
  }

  return title;
}

/**
 * Process a transcript file and extract action items using Gemini
 */
export async function processTranscript(
  file: File,
  source: string,
  userId: string
): Promise<{ meetingId: string; actionCount: number }> {
  try {
    // Read file content
    const content = await file.text();
    const cleanedTranscript = stripTimingCodes(content);
    const title = inferTitle(file.name, cleanedTranscript);

    // Create meeting record first
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .insert({
        user_id: userId,
        title,
        source,
        transcript: cleanedTranscript,
        status: 'Processing',
        folder_path: file.webkitRelativePath || file.name
      })
      .select()
      .single();

    if (meetingError) throw meetingError;

    // Call Gemini API to extract actions
    try {
      const response = await fetch('/api/extract-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: cleanedTranscript })
      });

      if (!response.ok) {
        throw new Error(`Gemini extraction failed: ${response.statusText}`);
      }

      const { actions } = await response.json() as { actions: ExtractedAction[] };

      // Insert action items
      if (actions && actions.length > 0) {
        const actionItems = actions.map(action => ({
          meeting_id: meeting.id,
          user_id: userId,
          title: action.title,
          description: action.description,
          role: action.role,
          level: action.level,
          priority: action.priority,
          due_date: action.due_date || null,
          chain_of_thought: action.chain_of_thought || null,
          status: 'Pending'
        }));

        const { error: actionsError } = await supabase
          .from('action_items')
          .insert(actionItems);

        if (actionsError) throw actionsError;
      }

      // Update meeting status to Processed
      await supabase
        .from('meetings')
        .update({ status: 'Processed' })
        .eq('id', meeting.id);

      return { meetingId: meeting.id, actionCount: actions?.length || 0 };

    } catch (extractionError) {
      // Mark meeting as failed
      await supabase
        .from('meetings')
        .update({ status: 'Failed' })
        .eq('id', meeting.id);

      throw extractionError;
    }

  } catch (error) {
    console.error('Transcript processing error:', error);
    throw error;
  }
}

/**
 * Process multiple transcripts sequentially (to avoid rate limits)
 */
export async function processTranscriptBatch(
  files: File[],
  source: string,
  userId: string,
  onProgress?: (current: number, total: number, filename: string) => void
): Promise<{ processed: number; failed: number }> {
  let processed = 0;
  let failed = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    onProgress?.(i + 1, files.length, file.name);

    try {
      await processTranscript(file, source, userId);
      processed++;

      // Small delay between calls to avoid rate limiting
      if (i < files.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`Failed to process ${file.name}:`, error);
      failed++;
    }
  }

  return { processed, failed };
}
