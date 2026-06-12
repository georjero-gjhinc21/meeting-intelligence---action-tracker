import { ActionItem } from '../types';

// Salesforce OAuth configuration
const SALESFORCE_CONFIG = {
  clientId: import.meta.env.VITE_SALESFORCE_CLIENT_ID || '',
  redirectUri: import.meta.env.VITE_SALESFORCE_REDIRECT_URI || `${window.location.origin}/salesforce/callback`,
  loginUrl: import.meta.env.VITE_SALESFORCE_LOGIN_URL || 'https://login.salesforce.com',
};

interface SalesforceAuth {
  accessToken: string;
  instanceUrl: string;
  refreshToken?: string;
  expiresAt: number;
}

interface SalesforceTask {
  Subject: string;
  Description: string;
  Status: string;
  Priority: string;
  ActivityDate?: string;
  OwnerId?: string;
}

interface SyncResult {
  success: boolean;
  recordId?: string;
  error?: string;
}

class SalesforceService {
  private auth: SalesforceAuth | null = null;
  private readonly STORAGE_KEY = 'salesforce_auth';

  constructor() {
    this.loadAuth();
  }

  /**
   * Check if Salesforce is configured (has client ID)
   */
  isConfigured(): boolean {
    return Boolean(SALESFORCE_CONFIG.clientId);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    if (!this.auth) return false;
    // Check if token is expired (with 5 min buffer)
    return this.auth.expiresAt > Date.now() + 5 * 60 * 1000;
  }

  /**
   * Get current authentication state
   */
  getAuth(): SalesforceAuth | null {
    return this.auth;
  }

  /**
   * Load authentication from localStorage
   */
  private loadAuth(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.auth = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load Salesforce auth:', error);
    }
  }

  /**
   * Save authentication to localStorage
   */
  private saveAuth(): void {
    if (this.auth) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.auth));
    }
  }

  /**
   * Clear authentication
   */
  clearAuth(): void {
    this.auth = null;
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Initiate OAuth flow (redirects to Salesforce)
   */
  initiateOAuth(): void {
    if (!this.isConfigured()) {
      throw new Error('Salesforce is not configured. Add VITE_SALESFORCE_CLIENT_ID to .env.local');
    }

    const params = new URLSearchParams({
      response_type: 'token',
      client_id: SALESFORCE_CONFIG.clientId,
      redirect_uri: SALESFORCE_CONFIG.redirectUri,
      scope: 'api refresh_token',
      state: crypto.randomUUID(), // CSRF protection
    });

    const authUrl = `${SALESFORCE_CONFIG.loginUrl}/services/oauth2/authorize?${params}`;
    window.location.href = authUrl;
  }

  /**
   * Handle OAuth callback (extract token from URL hash)
   */
  handleOAuthCallback(): boolean {
    const hash = window.location.hash.substring(1);
    if (!hash) return false;

    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
    const instanceUrl = params.get('instance_url');
    const refreshToken = params.get('refresh_token');
    const expiresIn = params.get('expires_in');

    if (accessToken && instanceUrl) {
      this.auth = {
        accessToken,
        instanceUrl,
        refreshToken: refreshToken || undefined,
        expiresAt: Date.now() + (expiresIn ? parseInt(expiresIn) * 1000 : 7200000), // Default 2 hours
      };
      this.saveAuth();

      // Clean up URL hash
      window.history.replaceState(null, '', window.location.pathname);
      return true;
    }

    return false;
  }

  /**
   * Make authenticated API request to Salesforce
   */
  private async apiRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated with Salesforce');
    }

    const url = `${this.auth!.instanceUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.auth!.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (response.status === 401) {
      // Token expired
      this.clearAuth();
      throw new Error('Salesforce session expired. Please re-authenticate.');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || 'Salesforce API request failed');
    }

    return response.json();
  }

  /**
   * Push an action item to Salesforce as a Task
   */
  async pushActionToSalesforce(action: ActionItem): Promise<SyncResult> {
    try {
      if (!this.isAuthenticated()) {
        return { success: false, error: 'Not authenticated' };
      }

      const task: SalesforceTask = {
        Subject: action.title,
        Description: `${action.description}\n\nExtracted from meeting intelligence.\nRole: ${action.role}\nLevel: ${action.level}\nPriority: ${action.priority}${action.chainOfThought ? `\n\nAI Context: ${action.chainOfThought}` : ''}`,
        Status: action.status === 'Completed' ? 'Completed' : 'Not Started',
        Priority: action.priority,
        ActivityDate: action.dueDate || undefined,
      };

      const result = await this.apiRequest('/services/data/v58.0/sobjects/Task', {
        method: 'POST',
        body: JSON.stringify(task),
      });

      return {
        success: true,
        recordId: result.id,
      };
    } catch (error: any) {
      console.error('Failed to push to Salesforce:', error);
      return {
        success: false,
        error: error.message || 'Unknown error',
      };
    }
  }

  /**
   * Get recent tasks from Salesforce
   */
  async getRecentTasks(limit: number = 10): Promise<any[]> {
    try {
      const query = `SELECT Id, Subject, Status, Priority, ActivityDate, CreatedDate FROM Task ORDER BY CreatedDate DESC LIMIT ${limit}`;
      const result = await this.apiRequest(
        `/services/data/v58.0/query?q=${encodeURIComponent(query)}`
      );
      return result.records || [];
    } catch (error) {
      console.error('Failed to fetch Salesforce tasks:', error);
      return [];
    }
  }

  /**
   * Test Salesforce connection
   */
  async testConnection(): Promise<{ success: boolean; message: string; userInfo?: any }> {
    try {
      if (!this.isAuthenticated()) {
        return { success: false, message: 'Not authenticated' };
      }

      const userInfo = await this.apiRequest('/services/oauth2/userinfo');
      return {
        success: true,
        message: 'Connected successfully',
        userInfo,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Connection failed',
      };
    }
  }

  /**
   * Get sync statistics
   */
  async getSyncStats(): Promise<{ total: number; recent: number; failed: number }> {
    try {
      const tasks = await this.getRecentTasks(100);
      const recent = tasks.filter(t => {
        const created = new Date(t.CreatedDate);
        return Date.now() - created.getTime() < 7 * 24 * 60 * 60 * 1000; // Last 7 days
      });

      return {
        total: tasks.length,
        recent: recent.length,
        failed: 0, // Would need to track this separately
      };
    } catch (error) {
      return { total: 0, recent: 0, failed: 0 };
    }
  }
}

// Singleton instance
export const salesforceService = new SalesforceService();

// Named exports for testing
export { SalesforceService };
