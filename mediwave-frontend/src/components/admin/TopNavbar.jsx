import { Search, Bell, Moon, User } from 'lucide-react';

function TopNavbar() {
  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center gap-4">
        {/* Company Logo / Project Name */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">AI</span>
          </div>
          <h1 className="text-xl font-bold text-gray-800 hidden md:block">
            AI Medicine Information Chatbot
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Global Search Bar */}
        <div className="relative hidden md:block w-64">
          <input 
            type="text" 
            placeholder="Global Search..." 
            className="w-full bg-gray-50 border border-gray-300 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
        </div>

        <div className="flex items-center gap-4 border-l pl-4 border-gray-200">
          <button className="text-gray-500 hover:text-blue-600 transition-colors">
            <Moon size={20} />
          </button>
          
          <button className="relative text-gray-500 hover:text-blue-600 transition-colors">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

          <div className="flex items-center gap-2 cursor-pointer">
            <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center text-teal-700">
              <User size={18} />
            </div>
            <div className="hidden md:block text-sm">
              <p className="font-semibold text-gray-700 leading-tight">Admin User</p>
              <p className="text-gray-500 text-xs">AI Operations</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TopNavbar;
