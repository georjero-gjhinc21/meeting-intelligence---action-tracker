/**
 * Google Drive Picker integration for selecting transcript files
 * Requires VITE_GOOGLE_API_KEY and VITE_GOOGLE_CLIENT_ID in .env.local
 */

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

let pickerApiLoaded = false;
let oauthToken: string | null = null;

/**
 * Load the Google API client and Picker API
 */
export async function loadGooglePicker(): Promise<boolean> {
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (!apiKey || !clientId) {
    console.warn('Google Drive API credentials not configured');
    return false;
  }

  return new Promise((resolve) => {
    // Load the Google API script
    if (!window.gapi) {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        window.gapi.load('client:picker', async () => {
          await window.gapi.client.load('https://www.googleapis.com/discovery/v1/apis/drive/v3/rest');
          pickerApiLoaded = true;
          resolve(true);
        });
      };
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    } else if (!pickerApiLoaded) {
      window.gapi.load('client:picker', async () => {
        await window.gapi.client.load('https://www.googleapis.com/discovery/v1/apis/drive/v3/rest');
        pickerApiLoaded = true;
        resolve(true);
      });
    } else {
      resolve(true);
    }
  });
}

/**
 * Authenticate with Google OAuth
 */
export async function authenticateGoogleDrive(): Promise<boolean> {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  return new Promise((resolve) => {
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'https://www.googleapis.com/auth/drive.readonly',
      callback: (response: any) => {
        if (response.access_token) {
          oauthToken = response.access_token;
          resolve(true);
        } else {
          resolve(false);
        }
      },
    });

    tokenClient.requestAccessToken();
  });
}

/**
 * Open Google Drive Picker to select transcript files
 */
export async function openGoogleDrivePicker(
  onFilesSelected: (files: any[]) => void
): Promise<void> {
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;

  if (!pickerApiLoaded || !oauthToken) {
    const loaded = await loadGooglePicker();
    if (!loaded) {
      throw new Error('Google Picker API not available');
    }

    const authenticated = await authenticateGoogleDrive();
    if (!authenticated) {
      throw new Error('Google authentication failed');
    }
  }

  const picker = new window.google.picker.PickerBuilder()
    .addView(
      new window.google.picker.DocsView()
        .setIncludeFolders(true)
        .setMimeTypes('text/plain,text/vtt,application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    )
    .setOAuthToken(oauthToken!)
    .setDeveloperKey(apiKey)
    .setCallback((data: any) => {
      if (data.action === window.google.picker.Action.PICKED) {
        const files = data.docs;
        onFilesSelected(files);
      }
    })
    .build();

  picker.setVisible(true);
}

/**
 * Download file content from Google Drive
 */
export async function downloadGoogleDriveFile(fileId: string): Promise<string> {
  if (!oauthToken) {
    throw new Error('Not authenticated with Google Drive');
  }

  const response = await window.gapi.client.drive.files.get({
    fileId,
    alt: 'media'
  });

  return response.body;
}
