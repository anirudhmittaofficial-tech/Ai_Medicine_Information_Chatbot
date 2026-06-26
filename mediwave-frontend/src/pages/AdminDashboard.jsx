import { Routes, Route, Navigate } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import TopNavbar from '../components/admin/TopNavbar';
import DashboardOverview from './admin/DashboardOverview';
import ChatHistory from './admin/ChatHistory';
import EnquiryManagement from './admin/EnquiryManagement';
import ProductsList from './admin/ProductsList';
import IntegrationStatus from './admin/IntegrationStatus';
import ApiMonitoring from './admin/ApiMonitoring';
import Settings from './admin/Settings';
import AdminLogin from './admin/AdminLogin';
import { useState } from 'react';

function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return <AdminLogin onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F8FAFC] text-gray-800 font-sans">
      <AdminSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopNavbar />
        <div className="flex-1 overflow-y-auto p-8 relative">
          <div className="max-w-7xl mx-auto pb-12">
            <Routes>
              <Route path="/" element={<Navigate to="overview" />} />
              <Route path="overview" element={<DashboardOverview />} />
              <Route path="chat-history" element={<ChatHistory />} />
              <Route path="enquiries" element={<EnquiryManagement />} />
              <Route path="products" element={<ProductsList />} />
              <Route path="integrations" element={<IntegrationStatus />} />
              <Route path="api" element={<ApiMonitoring />} />
              <Route path="settings" element={<Settings />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
