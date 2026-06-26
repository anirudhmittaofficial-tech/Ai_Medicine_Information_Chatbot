import { useState, useEffect, useRef } from 'react';
import { ArrowUp, Menu, Image as ImageIcon, PenLine, Search as SearchIcon, ChevronDown, HelpCircle } from 'lucide-react';

export default function ChatArea({ onMenuClick, onSearchClick, onQueryClick, activeConversationId, setActiveConversationId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chat/conversations/${activeConversationId}/messages`);
        if (!response.ok) throw new Error('Failed to fetch messages');
        const data = await response.json();
        
        const formattedMessages = [];
        data.forEach(msg => {
          if (msg.question) formattedMessages.push({ role: 'user', content: msg.question });
          if (msg.answer) formattedMessages.push({ role: 'ai', content: msg.answer });
        });
        setMessages(formattedMessages);
        setTimeout(scrollToBottom, 100);
      } catch (error) {
        console.error('Error fetching conversation messages:', error);
      }
    };

    fetchMessages();
  }, [activeConversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          question: userMsg,
          conversation_id: activeConversationId 
        })
      });
      const data = await response.json();
      
      if (!activeConversationId && data.conversation_id) {
        setActiveConversationId(data.conversation_id);
      }
      
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: data.answer || 'Sorry, I could not process your request at this time.'
      }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { role: 'ai', content: 'An error occurred while connecting to the server.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen relative z-10 bg-[#212121]">
      
      {/* Top Header */}
      <header className="absolute top-0 left-0 right-0 h-14 flex items-center justify-between px-4 z-20">
        <div className="flex items-center gap-2">
          <button 
            onClick={onMenuClick}
            className="md:hidden p-2 -ml-2 text-[#ececec] hover:bg-[#2f2f2f] rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <button className="flex items-center gap-1.5 text-[#ececec] font-semibold text-[15px] hover:bg-[#2f2f2f] px-2 py-1.5 rounded-lg transition-colors">
            Mediwave AI
            <ChevronDown className="w-4 h-4 text-[#b4b4b4]" />
          </button>
        </div>

        {/* Action Buttons Top Right */}
        <div className="flex items-center gap-1">
          <button onClick={onSearchClick} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[#ececec] text-sm hover:bg-[#2f2f2f] transition-colors">
            <SearchIcon className="w-4 h-4 text-[#ececec]/70" />
            <span className="hidden sm:inline">Search products</span>
          </button>
          <button onClick={onQueryClick} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[#ececec] text-sm hover:bg-[#2f2f2f] transition-colors">
            <PenLine className="w-4 h-4 text-[#ececec]/70" />
            <span className="hidden sm:inline">Enquiry</span>
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[#ececec] text-sm hover:bg-[#2f2f2f] transition-colors">
            <HelpCircle className="w-4 h-4 text-[#ececec]/70" />
            <span className="hidden sm:inline">FAQs</span>
          </button>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-0 scroll-smooth pt-14">
        
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center">
            <h2 className="text-3xl font-semibold text-[#ececec] mb-8">What's your query, Dr. Smith?</h2>
          </div>
        ) : (
          <div className="w-full max-w-3xl mx-auto pb-32">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`py-6 px-4 md:px-0 flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'ai' && (
                  <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[#212121] font-bold text-xs leading-none">M</span>
                  </div>
                )}
                
                <div 
                  className={`text-[15px] leading-relaxed max-w-[85%] ${
                    msg.role === 'user' 
                      ? 'bg-[#2f2f2f] text-[#ececec] px-5 py-2.5 rounded-3xl' 
                      : 'text-[#ececec] py-1 whitespace-pre-wrap'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#212121] via-[#212121] to-transparent pt-6">
        <div className="max-w-3xl mx-auto px-4 md:px-0 pb-6">
          <form 
            onSubmit={handleSend}
            className="relative flex items-end gap-2 bg-[#2f2f2f] rounded-3xl border border-[#ececec]/10 focus-within:border-[#ececec]/30 px-3 py-3 transition-colors"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything"
              rows="1"
              className="flex-1 bg-transparent px-2 text-[#ececec] placeholder:text-[#b4b4b4] focus:outline-none resize-none max-h-32 overflow-y-auto pt-1 leading-normal"
              disabled={isLoading}
            />
            
            <button 
              type="submit"
              disabled={!input.trim() || isLoading}
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                input.trim() && !isLoading
                  ? 'bg-white text-[#212121] hover:bg-[#ececec]' 
                  : 'bg-[#676767] text-[#212121]'
              }`}
            >
              <ArrowUp className="w-5 h-5 stroke-[2.5]" />
            </button>
          </form>

          <div className="text-center mt-3">
            <span className="text-[11px] text-[#b4b4b4]">
              Mediwave AI can make mistakes. Consider verifying important information.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
