/**
 * Google Drive integration using the Picker API + GIS OAuth.
 *
 * Setup required:
 *   1. Create a Google Cloud project at https://console.cloud.google.com
 *   2. Enable: Google Picker API, Google Drive API
 *   3. Create an OAuth 2.0 Client ID (type: Web application)
 *      - Authorized JavaScript origins: http://localhost:3000 (and your prod URL)
 *   4. Create an API Key (restrict by HTTP referrer for safety)
 *   5. Add to .env.local:
 *        GOOGLE_API_KEY="your-api-key"
 *        GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
 *   6. Restart `npm run dev`
 */

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

const GAPI_SRC = 'https://apis.google.com/js/api.js';
const GIS_SRC = 'https://accounts.google.com/gsi/client';
const SCOPES = 'https://www.googleapis.com/auth/drive.readonly';

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export const isGoogleDriveConfigured = (): boolean => Boolean(API_KEY && CLIENT_ID);

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
}

let pickerLoaded = false;
let tokenClient: any = null;
let accessToken: string | null = null;

async function initPicker() {
  if (pickerLoaded) return;
  await loadScript(GAPI_SRC);
  await new Promise<void>((resolve) => window.gapi.load('picker', resolve));
  pickerLoaded = true;
}

async function initGis() {
  await loadScript(GIS_SRC);
  if (!tokenClient) {
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: () => {}, // overridden per-call
    });
  }
}

async function getAccessToken(): Promise<string> {
  await initGis();
  if (accessToken) return accessToken;
  return new Promise((resolve, reject) => {
    tokenClient.callback = (response: any) => {
      if (response.error) return reject(new Error(response.error_description || response.error));
      accessToken = response.access_token;
      resolve(accessToken!);
    };
    tokenClient.requestAccessToken({ prompt: 'consent' });
  });
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
}

export async function pickDriveFiles(): Promise<DriveFile[]> {
  if (!isGoogleDriveConfigured()) {
    throw new Error(
      'Google Drive not configured. Add GOOGLE_API_KEY and GOOGLE_CLIENT_ID to .env.local — see googleDriveService.ts header for full setup.'
    );
  }
  await initPicker();
  const token = await getAccessToken();

  return new Promise((resolve) => {
    const view = new window.google.picker.DocsView()
      .setIncludeFolders(true)
      .setSelectFolderEnabled(false)
      .setMimeTypes(
        'text/plain,text/vtt,text/markdown,application/vnd.google-apps.document'
      );

    const picker = new window.google.picker.PickerBuilder()
      .enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED)
      .setOAuthToken(token)
      .setDeveloperKey(API_KEY!)
      .addView(view)
      .setCallback((data: any) => {
        if (data.action === window.google.picker.Action.PICKED) {
          const files: DriveFile[] = data.docs.map((d: any) => ({
            id: d.id,
            name: d.name,
            mimeType: d.mimeType,
          }));
          resolve(files);
        } else if (data.action === window.google.picker.Action.CANCEL) {
          resolve([]);
        }
      })
      .build();

    picker.setVisible(true);
  });
}

async function downloadDriveFileAsText(file: DriveFile): Promise<string> {
  if (!accessToken) throw new Error('Not authenticated with Google Drive');

  const url =
    file.mimeType === 'application/vnd.google-apps.document'
      ? `https://www.googleapis.com/drive/v3/files/${file.id}/export?mimeType=text/plain`
      : `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`;

  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!res.ok) throw new Error(`Drive download failed for ${file.name}: ${res.status}`);
  return await res.text();
}

/**
 * Convert a picked Drive file into a synthetic File object that the rest of the
 * pipeline (transcriptService) can consume.
 */
export async function driveFileToFile(df: DriveFile): Promise<File> {
  const text = await downloadDriveFileAsText(df);
  const hasExt = /\.[^.]+$/.test(df.name);
  const filename = hasExt ? df.name : `${df.name}.txt`;
  return new File([text], filename, { type: 'text/plain' });
}
