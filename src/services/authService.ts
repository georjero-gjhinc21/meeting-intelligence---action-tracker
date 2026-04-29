/**
 * Google Sign-In via Google Identity Services (GIS).
 *
 * Uses the SAME GOOGLE_CLIENT_ID as the Drive Picker — one OAuth client covers both.
 *
 * Setup recap (skip if already done for Drive):
 *   1. https://console.cloud.google.com → Credentials → OAuth 2.0 Client ID
 *   2. Type: Web application
 *   3. Authorized JavaScript origins: http://localhost:3000 (+ your prod URL)
 *   4. Copy the Client ID into .env.local as GOOGLE_CLIENT_ID
 *
 * No client secret, no redirect URI, no backend needed — id_token is decoded
 * client-side. Fine for a pilot / internal tool. For production, validate the
 * token server-side against Google's tokeninfo endpoint.
 */

declare global {
  interface Window {
    google: any;
  }
}

const GIS_SRC = 'https://accounts.google.com/gsi/client';
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export interface AuthUser {
  sub: string;
  name: string;
  email: string;
  picture: string;
  provider: 'google' | 'demo';
}

export const isAuthConfigured = (): boolean => Boolean(CLIENT_ID);

let gisLoaded = false;

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

async function ensureGis(): Promise<void> {
  if (gisLoaded) return;
  await loadScript(GIS_SRC);
  gisLoaded = true;
}

function decodeJwt(token: string): Record<string, any> {
  const payload = token.split('.')[1];
  if (!payload) throw new Error('Invalid id token');
  const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
  const json = decodeURIComponent(
    atob(padded)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
  return JSON.parse(json);
}

/**
 * Render the official Google Sign-In button into a container element.
 * Calls onSuccess with the decoded user once the user completes the flow.
 */
export async function renderGoogleSignInButton(
  el: HTMLElement,
  onSuccess: (user: AuthUser) => void,
  onError: (err: Error) => void
): Promise<void> {
  if (!CLIENT_ID) {
    onError(new Error('GOOGLE_CLIENT_ID not set'));
    return;
  }
  try {
    await ensureGis();
    window.google.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: (response: any) => {
        try {
          const payload = decodeJwt(response.credential);
          onSuccess({
            sub: payload.sub,
            name: payload.name || payload.email,
            email: payload.email,
            picture: payload.picture || '',
            provider: 'google',
          });
        } catch (e: any) {
          onError(e);
        }
      },
      auto_select: false,
      ux_mode: 'popup',
    });
    window.google.accounts.id.renderButton(el, {
      theme: 'outline',
      size: 'large',
      width: 280,
      text: 'signin_with',
      shape: 'rectangular',
      logo_alignment: 'left',
    });
  } catch (e: any) {
    onError(e);
  }
}

export function signOutGsi(): void {
  try {
    window.google?.accounts?.id?.disableAutoSelect();
  } catch {
    /* noop */
  }
}
