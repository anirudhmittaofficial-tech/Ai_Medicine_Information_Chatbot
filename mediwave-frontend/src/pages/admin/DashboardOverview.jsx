import { useState, useEffect } from 'react';
import { Users, MessageSquare, Database, CheckCircle, Clock, Package, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import axios from 'axios';

function DashboardOverview() {
  const [data, setData] = useState({
    totalProducts: 0,
    totalChats: 0,
    todaysChats: 0,
    totalEnquiries: 0,
    pendingEnquiries: 0,
    resolvedEnquiries: 0,
    aiSuccessRate: '0%',
    avgResponse: '0s'
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/analytics/overview`);
      setData(res.data);
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const stats = [
    { title: 'Total Products', value: data.totalProducts, icon: <Package size={24} className="text-blue-500" />, bg: 'bg-blue-50' },
    { title: 'Total Chats', value: data.totalChats, icon: <MessageSquare size={24} className="text-teal-500" />, bg: 'bg-teal-50' },
    { title: "Today's Chats", value: data.todaysChats, icon: <Users size={24} className="text-purple-500" />, bg: 'bg-purple-50' },
    { title: 'Total Enquiries', value: data.totalEnquiries, icon: <AlertCircle size={24} className="text-orange-500" />, bg: 'bg-orange-50' },
    { title: 'Pending Enquiries', value: data.pendingEnquiries, icon: <Clock size={24} className="text-yellow-500" />, bg: 'bg-yellow-50' },
    { title: 'Resolved Enquiries', value: data.resolvedEnquiries, icon: <CheckCircle size={24} className="text-green-500" />, bg: 'bg-green-50' },
    { title: 'AI Success Rate', value: data.aiSuccessRate, icon: <CheckCircle size={24} className="text-emerald-500" />, bg: 'bg-emerald-50' },
    { title: 'Avg Response', value: data.avgResponse, icon: <Clock size={24} className="text-indigo-500" />, bg: 'bg-indigo-50' },
  ];

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
        <button 
          onClick={() => fetchDashboardData(true)}
          disabled={refreshing}
          className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm transition-all disabled:opacity-50"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-2">{stat.value}</h3>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* System Status Grid */}
      <h2 className="text-lg font-bold text-gray-800 mt-10 mb-4">System Health Status</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
              <Database size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Gemini API Status</p>
              <p className="text-lg font-bold text-gray-800">Online</p>
            </div>
          </div>
          <div className="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"></div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
              <Database size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Database Status</p>
              <p className="text-lg font-bold text-gray-800">Connected</p>
            </div>
          </div>
          <div className="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}

export default DashboardOverview;
