import React from 'react';
import {
  Database,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Link2,
  Table,
  LogIn,
  Power,
  Loader2,
  CheckCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { salesforceService } from '../services/salesforceService';
import { useMeetings } from '../context/MeetingsContext';

export default function SalesforceSync() {
  const { actions } = useMeetings();
  const [isConnected, setIsConnected] = React.useState(false);
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [isConfigured, setIsConfigured] = React.useState(false);
  const [userInfo, setUserInfo] = React.useState<any>(null);
  const [syncStats, setSyncStats] = React.useState({ total: 0, recent: 0, failed: 0 });
  const [recentTasks, setRecentTasks] = React.useState<any[]>([]);
  const [toast, setToast] = React.useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Check Salesforce connection status on mount
  React.useEffect(() => {
    checkConnection();
    // Handle OAuth callback
    if (window.location.hash.includes('access_token')) {
      const success = salesforceService.handleOAuthCallback();
      if (success) {
        setToast({ type: 'success', message: 'Connected to Salesforce successfully!' });
        checkConnection();
      }
    }
  }, []);

  const checkConnection = async () => {
    setIsConfigured(salesforceService.isConfigured());
    const connected = salesforceService.isAuthenticated();
    setIsConnected(connected);

    if (connected) {
      try {
        const result = await salesforceService.testConnection();
        if (result.success) {
          setUserInfo(result.userInfo);
          loadSyncData();
        } else {
          setIsConnected(false);
        }
      } catch (error) {
        setIsConnected(false);
      }
    }
  };

  const loadSyncData = async () => {
    try {
      const [stats, tasks] = await Promise.all([
        salesforceService.getSyncStats(),
        salesforceService.getRecentTasks(5),
      ]);
      setSyncStats(stats);
      setRecentTasks(tasks);
    } catch (error) {
      console.error('Failed to load sync data:', error);
    }
  };

  const handleConnect = () => {
    try {
      salesforceService.initiateOAuth();
    } catch (error: any) {
      setToast({ type: 'error', message: error.message });
    }
  };

  const handleDisconnect = () => {
    salesforceService.clearAuth();
    setIsConnected(false);
    setUserInfo(null);
    setSyncStats({ total: 0, recent: 0, failed: 0 });
    setRecentTasks([]);
    setToast({ type: 'success', message: 'Disconnected from Salesforce' });
  };

  const handleSyncAll = async () => {
    if (!isConnected) {
      setToast({ type: 'error', message: 'Not connected to Salesforce' });
      return;
    }

    setIsSyncing(true);
    let successCount = 0;
    let failCount = 0;

    try {
      // Sync pending actions (those without salesforce_id)
      const pendingActions = actions.filter(a => a.status !== 'Completed').slice(0, 5);

      for (const action of pendingActions) {
        const result = await salesforceService.pushActionToSalesforce(action);
        if (result.success) {
          successCount++;
        } else {
          failCount++;
        }
      }

      await loadSyncData();
      setToast({
        type: successCount > 0 ? 'success' : 'error',
        message: `Synced ${successCount} action${successCount !== 1 ? 's' : ''}${failCount > 0 ? `, ${failCount} failed` : ''}`,
      });
    } catch (error: any) {
      setToast({ type: 'error', message: error.message || 'Sync failed' });
    } finally {
      setIsSyncing(false);
    }
  };

  const integrations = [
    {
      name: 'Salesforce CRM',
      status: isConnected ? 'Connected' : (isConfigured ? 'Not Connected' : 'Not Configured'),
      icon: Database,
      color: isConnected ? 'text-indigo-600' : 'text-slate-400',
      bg: isConnected ? 'bg-indigo-50' : 'bg-slate-50',
      isLive: true,
    },
    { name: 'Linear', status: 'Coming Soon', icon: Link2, color: 'text-slate-400', bg: 'bg-slate-50', isLive: false },
    { name: 'Confluence', status: 'Coming Soon', icon: Table, color: 'text-slate-400', bg: 'bg-slate-50', isLive: false },
    { name: 'Jira', status: 'Coming Soon', icon: AlertCircle, color: 'text-slate-400', bg: 'bg-slate-50', isLive: false },
  ];

  return (
    <div className="p-8 space-y-8" id="integrations-view">
      {/* Toast notifications */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-lg border ${
              toast.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            <div className="flex items-center gap-3">
              {toast.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <p className="text-sm font-bold">{toast.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight uppercase">Salesforce Sync</h1>
          <p className="text-slate-500 text-sm mt-1">
            {isConnected
              ? `Connected as ${userInfo?.name || 'User'} • Push action items to Salesforce CRM`
              : 'Connect to Salesforce to sync action items automatically'}
          </p>
        </div>
        <div className="flex gap-3">
          {isConnected ? (
            <>
              <button
                onClick={handleDisconnect}
                className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all"
              >
                <Power className="w-3.5 h-3.5" />
                Disconnect
              </button>
              <button
                onClick={handleSyncAll}
                disabled={isSyncing}
                className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all shadow-xl disabled:opacity-50"
              >
                {isSyncing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
                {isSyncing ? 'Syncing...' : 'Sync Actions'}
              </button>
            </>
          ) : (
            <button
              onClick={handleConnect}
              disabled={!isConfigured}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-xl disabled:opacity-50"
            >
              <LogIn className="w-3.5 h-3.5" />
              {isConfigured ? 'Connect to Salesforce' : 'Not Configured'}
            </button>
          )}
        </div>
      </header>

      {/* Configuration warning */}
      {!isConfigured && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-200 rounded-2xl p-6"
        >
          <div className="flex items-start gap-4">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-amber-900 mb-2">Salesforce Not Configured</h3>
              <p className="text-sm text-amber-800 leading-relaxed mb-4">
                To enable Salesforce integration, add the following to your <code className="bg-amber-100 px-2 py-0.5 rounded font-mono text-xs">.env.local</code> file:
              </p>
              <pre className="bg-amber-100 p-4 rounded-xl text-xs font-mono text-amber-900 overflow-x-auto">
{`VITE_SALESFORCE_CLIENT_ID=your_connected_app_client_id
VITE_SALESFORCE_REDIRECT_URI=${window.location.origin}/salesforce/callback
VITE_SALESFORCE_LOGIN_URL=https://login.salesforce.com`}
              </pre>
              <p className="text-xs text-amber-700 mt-3">
                Create a Connected App in Salesforce Setup to get your Client ID.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Integration cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {integrations.map((app) => (
          <div
            key={app.name}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm group hover:border-indigo-300 transition-all"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className={`p-3 rounded-xl ${app.bg} transition-transform group-hover:scale-110`}>
                <app.icon className={`w-5 h-5 ${app.color}`} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-800 tracking-tight">{app.name}</h3>
                {app.isLive && (
                  <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-1.5 py-0.5 rounded">
                    LIVE
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between mt-auto">
              <span
                className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded ${
                  app.status === 'Connected'
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-slate-50 text-slate-400'
                }`}
              >
                {app.status}
              </span>
              {app.isLive && isConnected && (
                <CheckCheck className="w-4 h-4 text-emerald-600" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Sync Activity Log */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sync Activity Log</h2>
          {isConnected && (
            <div className="flex gap-6 text-[10px] font-bold uppercase tracking-widest">
              <div className="flex items-center gap-1.5 text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
                {syncStats.recent} RECENT
              </div>
              <div className="flex items-center gap-1.5 text-slate-600">
                <Database className="w-4 h-4" />
                {syncStats.total} TOTAL
              </div>
            </div>
          )}
        </div>
        <div className="divide-y divide-slate-100">
          {isConnected && recentTasks.length > 0 ? (
            recentTasks.map((task) => (
              <div
                key={task.Id}
                className="px-8 py-5 flex items-center justify-between text-sm hover:bg-slate-50 cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                    <Database className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 tracking-tight">{task.Subject}</p>
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">
                      Salesforce Task • {task.Id}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${
                    task.Status === 'Completed'
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                      : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                  }`}
                >
                  {task.Status}
                </span>
              </div>
            ))
          ) : (
            <div className="px-8 py-12 text-center">
              <Database className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-sm text-slate-400 font-medium">
                {isConnected ? 'No recent sync activity' : 'Connect to Salesforce to see sync activity'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
