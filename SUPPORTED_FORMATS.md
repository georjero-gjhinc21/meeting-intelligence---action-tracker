# Supported File Formats - Quick Reference

## 📋 All Supported Formats

### Video Meeting Transcripts
- ✅ **`.vtt`** - WebVTT format (Google Meet, Microsoft Teams)
- ✅ **`.srt`** - SubRip format (Zoom, most video platforms)

### Text Documents
- ✅ **`.txt`** - Plain text files
- ✅ **`.md`** - Markdown files
- ✅ **`.json`** - JSON structured data

### Microsoft Office Documents
- ✅ **`.docx`** - Microsoft Word 2007+ (meeting notes, minutes)
- ✅ **`.doc`** - Microsoft Word 97-2003 (legacy format)
- ✅ **`.pptx`** - PowerPoint 2007+ (presentation notes)
- ✅ **`.ppt`** - PowerPoint 97-2003 (legacy format)

### Universal Formats
- ✅ **`.pdf`** - PDF documents (board minutes, reports)
- ✅ **`.rtf`** - Rich Text Format (cross-platform documents)

---

## 💼 Common Corporate Use Cases

### Board Meetings
**Format**: PDF, Word  
**Example**: `Board_Meeting_Minutes_May_2026.pdf`
- Upload PDF minutes directly
- System extracts action items
- Tracks strategic board decisions

### Executive Strategy Sessions
**Format**: PowerPoint, Word  
**Example**: `Q3_Strategy_Presentation.pptx`
- Import presentation files
- Extracts slide content and notes
- Identifies high-level initiatives

### Video Conference Calls
**Format**: VTT, SRT  
**Example**: `Weekly_Standup_Transcript.vtt`
- Direct export from Zoom/Teams/Meet
- No conversion needed
- Automatic speaker detection

### Meeting Notes & Summaries
**Format**: Word, Markdown, RTF  
**Example**: `Project_Kickoff_Notes.docx`
- Written meeting summaries
- Email attachments
- Shared documents from OneDrive/SharePoint

---

## 🎯 How to Use

### Single File Upload
1. Click "Import Local Files"
2. Select any supported file format
3. System auto-detects format and parses
4. Action items extracted automatically

### Bulk Folder Upload
1. Click "Import Folder"
2. Select folder containing mixed file types
3. System processes all supported files
4. Skips unsupported formats with notice

### Drag & Drop
1. Drag files or folders to the drop zone
2. Works with all supported formats
3. Real-time progress indicator
4. Toast notification on completion

---

## ⚠️ Format-Specific Notes

### PDF Files
- ✅ **Works with**: Text-based PDFs (Word exports, Google Docs exports)
- ❌ **Doesn't work with**: Pure scanned images (unless OCR'd)
- 💡 **Tip**: If PDF is from a scanner, ensure OCR was applied

### PowerPoint Files
- ✅ **Extracts**: Slide text, speaker notes
- ❌ **Doesn't extract**: Images, charts, tables
- 💡 **Tip**: Add important details to slide notes for best results

### Word Documents
- ✅ **Extracts**: All text content, preserves paragraphs
- ❌ **Doesn't extract**: Images, embedded objects
- 💡 **Tip**: .docx format preferred over legacy .doc

### RTF Files
- ✅ **Extracts**: Plain text content
- ❌ **May have**: Minor formatting artifacts
- 💡 **Tip**: Convert complex RTF to .docx for cleaner results

---

## 🔍 File Validation

When you upload files, the system:
1. ✅ Checks file extension against supported list
2. ✅ Routes to appropriate parser
3. ✅ Extracts text content
4. ✅ Normalizes format (removes timestamps, etc.)
5. ✅ Sends to AI for action item extraction
6. ✅ Displays results in dashboard

**Unsupported files are skipped** with a notification showing how many were processed vs. skipped.

---

## 📊 Examples by Platform

| Platform | Export Format | Supported? |
|----------|--------------|------------|
| **Zoom** | .vtt, .srt, .txt | ✅ Yes |
| **Microsoft Teams** | .vtt, .docx | ✅ Yes |
| **Google Meet** | .vtt, .txt | ✅ Yes |
| **Slack Huddles** | .txt | ✅ Yes |
| **Board Meeting Software** | .pdf, .docx | ✅ Yes |
| **SharePoint** | .docx, .pptx, .pdf | ✅ Yes |
| **Email Attachments** | All formats | ✅ Yes |

---

## 🚀 Best Practices

### For Maximum Accuracy
1. **Use native formats** - .docx preferred over .pdf conversions
2. **Include context** - File names help with meeting identification
3. **Combine sources** - Upload both transcript + meeting notes for better extraction
4. **Check quality** - Ensure PDFs have searchable text layer

### For Batch Processing
1. **Organize by date/project** - Folder names become metadata
2. **Mixed formats OK** - System handles .docx, .pdf, .vtt in same batch
3. **Monitor progress** - Progress bar shows real-time status
4. **Review results** - Check "Meetings" tab for processed items

---

## 💡 Tips & Tricks

### Corporate Integration
- **OneDrive/SharePoint**: Download folders containing meeting docs, upload directly
- **Email Exports**: Save attachments to folder, bulk upload
- **Teams/Meet**: Export transcripts, combine with PowerPoint slides

### Folder Structure
```
/Meeting_Docs
  ├── 2026-05-Board-Meeting/
  │   ├── Minutes.pdf
  │   ├── CEO_Report.docx
  │   └── Strategy_Deck.pptx
  ├── Weekly_Standups/
  │   ├── Week_01_Transcript.vtt
  │   └── Week_02_Notes.md
  └── Executive_Reviews/
      └── Q2_Review.docx
```
Upload `/Meeting_Docs` folder → System processes all files

---

## 🛠️ Troubleshooting

### "No supported files found"
- ✅ **Check**: File has supported extension
- ✅ **Verify**: Not a renamed file (e.g., .exe renamed to .txt)
- ✅ **Try**: Convert to .docx or .pdf if possible

### "Failed to parse PDF document"
- ✅ **Check**: PDF is text-based (not scanned image)
- ✅ **Try**: Open PDF, select text with cursor (if not selectable, it's an image)
- ✅ **Fix**: Run OCR software, or export to Word first

### "Empty file"
- ✅ **Check**: File actually contains content
- ✅ **Verify**: File size > 0 bytes
- ✅ **Try**: Open file manually to confirm content

---

## 📞 Support

**Questions?** Check:
- Main README.md for setup instructions
- DOCUMENT_SUPPORT_UPDATE.md for technical details
- FIXES_SUMMARY.md for recent changes

**File format requests?** The system is designed to be extensible. Additional formats can be added as needed.
