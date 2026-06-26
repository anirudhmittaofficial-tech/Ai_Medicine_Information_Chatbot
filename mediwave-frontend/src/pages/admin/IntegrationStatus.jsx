import { useState, useEffect } from 'react';
import { Link as LinkIcon, AlertTriangle, CheckCircle, Clock, RefreshCw, Loader2 } from 'lucide-react';
import axios from 'axios';

function IntegrationStatus() {
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchIntegrations = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/integrations/status`);
      setIntegrations(res.data);
    } catch (error) {
      console.error("Failed to fetch integrations", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Connected': return <CheckCircle size={20} className="text-green-500" />;
      case 'Waiting': return <Clock size={20} className="text-yellow-500" />;
      case 'Offline': return <AlertTriangle size={20} className="text-red-500" />;
      default: return null;
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Connected': return 'bg-green-100 text-green-800 border-green-200';
      case 'Waiting': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Offline': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Integration Readiness Status</h1>
          <p className="text-gray-500">Monitoring connection status with other Mediwave project modules. The Chatbot will automatically switch from Mock API to Live endpoints when available.</p>
        </div>
        <button 
          onClick={() => fetchIntegrations(true)}
          disabled={refreshing}
          className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm transition-all disabled:opacity-50"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center h-[400px]">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {integrations.map((int, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
              {/* Status indicator bar */}
              <div className={`absolute top-0 left-0 w-full h-1 ${
                int.status === 'Connected' ? 'bg-green-500' : int.status === 'Offline' ? 'bg-red-500' : 'bg-yellow-500'
              }`}></div>

              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    int.status === 'Connected' ? 'bg-green-50' : int.status === 'Offline' ? 'bg-red-50' : 'bg-yellow-50'
                  }`}>
                    {getStatusIcon(int.status)}
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 capitalize">{int.system}</h3>
                </div>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(int.status)}`}>
                  {int.status}
                </span>
              </div>

              <div className="space-y-3 mt-6">
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wider">Current / Mock URL</p>
                  <div className="bg-gray-50 px-3 py-2 rounded-lg text-sm font-mono text-gray-600 truncate border border-gray-100" title={int.mockUrl}>
                    {int.mockUrl}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wider">Future Live Endpoint</p>
                  <div className="bg-gray-50 px-3 py-2 rounded-lg text-sm font-mono text-gray-600 truncate border border-gray-100 flex items-center gap-2" title={int.futureUrl}>
                    <LinkIcon size={14} className="text-gray-400 shrink-0" />
                    {int.futureUrl}
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-50 mt-4">
                  <span className="text-sm text-gray-500">Latency Response</span>
                  <span className={`text-sm font-bold ${int.status === 'Connected' ? 'text-green-600' : 'text-gray-400'}`}>
                    {int.latency}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default IntegrationStatus;
