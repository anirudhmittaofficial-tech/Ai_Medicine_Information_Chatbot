import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import ChatArea from '../components/ChatArea';
import ProductSearch from '../components/ProductSearch';
import QueryCaptureModal from '../components/QueryCaptureModal';
import LoginScreen from '../components/LoginScreen';
import PublicEnquiriesModal from '../components/PublicEnquiriesModal';

function ChatbotUI() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isQueryModalOpen, setIsQueryModalOpen] = useState(false);
  const [isPublicEnquiriesOpen, setIsPublicEnquiriesOpen] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState(null);

  return (
    <>
      <div className="flex h-screen w-full overflow-hidden relative z-0 bg-[#212121]">
        <Sidebar 
          isOpen={isSidebarOpen} 
          setIsOpen={setIsSidebarOpen} 
          activeConversationId={activeConversationId}
          setActiveConversationId={setActiveConversationId}
          onOpenPublicEnquiries={() => setIsPublicEnquiriesOpen(true)}
        />
        
        <ChatArea 
          onMenuClick={() => setIsSidebarOpen(true)}
          onSearchClick={() => setIsSearchOpen(true)}
          onQueryClick={() => setIsQueryModalOpen(true)}
          activeConversationId={activeConversationId}
          setActiveConversationId={setActiveConversationId}
        />

        <ProductSearch 
          isOpen={isSearchOpen} 
          onClose={() => setIsSearchOpen(false)} 
        />
        
        <QueryCaptureModal 
          isOpen={isQueryModalOpen} 
          onClose={() => setIsQueryModalOpen(false)} 
        />

        <PublicEnquiriesModal 
          isOpen={isPublicEnquiriesOpen} 
          onClose={() => setIsPublicEnquiriesOpen(false)} 
        />
      </div>
    </>
  );
}

export default ChatbotUI;
