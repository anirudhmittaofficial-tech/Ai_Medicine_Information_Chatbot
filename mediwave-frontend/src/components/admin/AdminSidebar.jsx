import { NavLink } from 'react-router-dom';
import { 
  Home, MessageSquare, Mail, Package, 
  BookOpen, Link as LinkIcon, Activity, 
  BarChart2, Settings, UserCircle, LogOut
} from 'lucide-react';

function AdminSidebar() {
  const links = [
    { name: 'Dashboard', path: '/admin/overview', icon: <Home size={20} /> },
    { name: 'Chat History', path: '/admin/chat-history', icon: <MessageSquare size={20} /> },
    { name: 'Enquiries', path: '/admin/enquiries', icon: <Mail size={20} /> },
    { name: 'Products', path: '/admin/products', icon: <Package size={20} /> },
    { name: 'Integration Status', path: '/admin/integrations', icon: <LinkIcon size={20} /> },
    { name: 'API Monitoring', path: '/admin/api', icon: <Activity size={20} /> },
    { name: 'Settings', path: '/admin/settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="w-64 h-full bg-white border-r border-gray-200 flex flex-col shadow-sm z-10">
      <nav className="flex-1 py-6 overflow-y-auto">
        <div className="px-4 mb-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Main Menu</p>
        </div>
        <ul className="space-y-1 px-3">
          {links.map((link) => (
            <li key={link.path}>
              <NavLink
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${
                    isActive 
                      ? 'bg-blue-50 text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  }`
                }
              >
                <span className="mr-3">{link.icon}</span>
                {link.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200 space-y-2">
        <NavLink 
          to="/admin/profile" 
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all"
        >
          <UserCircle size={20} className="mr-3" />
          User Profile
        </NavLink>
        <NavLink 
          to="/" 
          className="flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-all"
        >
          <LogOut size={20} className="mr-3" />
          Logout
        </NavLink>
      </div>
    </div>
  );
}

export default AdminSidebar;
