import { useState, useEffect } from 'react';
import { X, MessageSquare, Loader2, User, ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';

function PublicEnquiriesModal({ isOpen, onClose }) {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchEnquiries();
    }
  }, [isOpen]);

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/enquiry/public`);
      setEnquiries(res.data);
    } catch (error) {
      console.error("Failed to fetch public enquiries", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-[#212121] rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden border border-gray-700 shadow-2xl">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#171717]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
              <MessageSquare size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-100">Public FAQ & Enquiries</h2>
              <p className="text-sm text-gray-400 mt-1">Recently resolved questions from our community.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 p-2 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-48 space-y-4">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <p className="text-gray-400">Loading public enquiries...</p>
            </div>
          ) : enquiries.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <MessageSquare className="w-12 h-12 text-gray-600 mb-4" />
              <p className="text-gray-400">No public enquiries to show right now.</p>
            </div>
          ) : (
            enquiries.map((eq) => (
              <div 
                key={eq.id} 
                className="bg-[#2a2a2a] border border-gray-700 rounded-xl overflow-hidden transition-colors hover:border-gray-600"
              >
                <div 
                  className="p-4 cursor-pointer flex justify-between items-start gap-4"
                  onClick={() => setExpandedId(expandedId === eq.id ? null : eq.id)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded-md font-medium flex items-center gap-1 border border-gray-700">
                        <User size={12} /> {eq.user_type}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-md font-medium border ${eq.status === 'Resolved' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
                        {eq.status || 'Pending'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(eq.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-gray-200 font-medium leading-snug">{eq.question}</h3>
                  </div>
                  <div className="text-gray-500 shrink-0 mt-1">
                    {expandedId === eq.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>

                {expandedId === eq.id && (
                  <div className="p-4 pt-0">
                    <div className="mt-2 p-4 bg-[#1e1e1e] rounded-lg border border-gray-800 text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                      <span className="block text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">Mediwave Support</span>
                      {eq.answer ? eq.answer : <span className="text-gray-500 italic">An admin is currently reviewing this enquiry...</span>}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default PublicEnquiriesModal;
