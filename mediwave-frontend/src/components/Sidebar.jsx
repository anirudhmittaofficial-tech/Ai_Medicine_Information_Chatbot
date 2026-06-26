import { useState, useEffect } from 'react';
import { SquarePen, Search, MessageSquare, Menu, LayoutGrid, LayoutDashboard, Clock } from 'lucide-react';

export default function Sidebar({ isOpen, setIsOpen, activeConversationId, setActiveConversationId, onOpenPublicEnquiries }) {
  const [history, setHistory] = useState([]);

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chat/conversations`);
      const data = await response.json();
      
      const now = new Date();
      const grouped = data.map(item => {
        const itemDate = new Date(item.updated_at);
        const diffTime = Math.abs(now - itemDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        let group = 'Older';
        if (diffDays <= 1 && now.getDate() === itemDate.getDate()) group = 'Today';
        else if (diffDays <= 2) group = 'Yesterday';
        else if (diffDays <= 7) group = 'Previous 7 Days';

        return {
          id: item.id,
          date: group,
          title: item.title
        };
      });
      setHistory(grouped);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [isOpen, activeConversationId]);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Panel */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-[260px] h-full flex flex-col bg-[#000000] transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        
        <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden pt-3 px-3">
          
          {/* Top Actions */}
          <div className="flex items-center justify-between mb-2">
            <button 
              onClick={() => setActiveConversationId(null)}
              className="flex items-center gap-2 p-2 hover:bg-[#212121] rounded-lg text-sm text-[#ececec] font-medium transition-colors group flex-1"
            >
              <div className="w-6 h-6 flex items-center justify-center shrink-0">
                <SquarePen className="w-[18px] h-[18px] text-[#ececec]" />
              </div>
              New chat
            </button>
            <button 
              onClick={() => setIsOpen(false)}
              className="md:hidden p-2 text-[#ececec] hover:bg-[#212121] rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          <button className="flex items-center gap-2 p-2 hover:bg-[#212121] rounded-lg text-sm text-[#ececec] font-medium transition-colors group mb-1">
            <div className="w-6 h-6 flex items-center justify-center shrink-0">
              <Search className="w-[18px] h-[18px]" />
            </div>
            Search chats
          </button>

          <button 
            onClick={onOpenPublicEnquiries}
            className="flex items-center gap-2 p-2 hover:bg-[#212121] rounded-lg text-sm text-[#ececec] font-medium transition-colors group mb-1 w-full text-left"
          >
            <div className="w-6 h-6 flex items-center justify-center shrink-0">
              <MessageSquare className="w-[18px] h-[18px] text-blue-400" />
            </div>
            Public FAQs
          </button>

          {/* History Section */}
          <div className="mt-6 flex-1">
            {['Today', 'Yesterday', 'Previous 7 Days'].map(group => {
              const groupItems = history.filter(h => h.date === group);
              if (groupItems.length === 0) return null;
              return (
                <div key={group} className="mb-6">
                  <h3 className="text-xs font-semibold text-[#b4b4b4] mb-2 px-2">{group === 'Previous 7 Days' ? 'Previous 7 Days' : group}</h3>
                  <div className="space-y-0.5">
                    {groupItems.map(item => (
                      <div 
                        key={item.id} 
                        onClick={() => setActiveConversationId(item.id)}
                        className={`group flex items-center justify-between py-2 px-2 rounded-lg cursor-pointer text-sm ${activeConversationId === item.id ? 'bg-[#212121] text-[#ececec]' : 'text-[#ececec] hover:bg-[#212121]'}`}
                      >
                        <span className="truncate pr-2">{item.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Admin Login Area */}
        <div className="p-3">
          <div 
            onClick={() => window.location.href = '/admin/login'}
            className="flex items-center gap-3 cursor-pointer hover:bg-[#212121] p-2 rounded-lg transition-colors group"
          >
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0 border border-red-500/20 group-hover:bg-red-500/20 transition-colors">
              <LayoutDashboard size={14} className="text-red-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">Admin Portal</p>
              <p className="text-[10px] text-gray-500">Staff & Ops Login</p>
            </div>
          </div>
        </div>

      </aside>
    </>
  );
}
