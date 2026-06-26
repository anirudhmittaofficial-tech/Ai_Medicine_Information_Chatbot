import { useState, useEffect } from 'react';
import { Eye, Trash2, Loader2, RefreshCw, X, FileText, Database, Sparkles, MessageSquare, ChevronDown } from 'lucide-react';
import axios from 'axios';

function ChatHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);

  const fetchHistory = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/chat/history`);
      setHistory(res.data);
    } catch (error) {
      console.error("Failed to fetch chat history", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this chat log?")) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/chat/history/${id}`);
        setHistory(history.filter(h => h.id !== id));
      } catch (error) {
        console.error("Failed to delete chat log", error);
        alert("Failed to delete chat log. Is the backend restarted?");
      }
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Chat History & Observability</h1>
          <p className="text-gray-500">View conversations and inspect the RAG pipeline mechanics.</p>
        </div>
        <button 
          onClick={() => fetchHistory(true)}
          disabled={refreshing}
          className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm transition-all disabled:opacity-50"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>
      
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center h-[400px]">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-4">Question</th>
                  <th className="px-6 py-4">AI Answer Snippet</th>
                  <th className="px-6 py-4">Context</th>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {history.map((row) => (
                  <tr key={row.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-800 max-w-[250px] truncate" title={row.question}>
                      {row.question}
                    </td>
                    <td className="px-6 py-4 text-gray-600 max-w-[300px] truncate" title={row.answer}>
                      {row.answer}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600 truncate max-w-[150px]" title={row.conversation_title}>
                        {row.conversation_title}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{formatTime(row.time)}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => setSelectedChat(row)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors" 
                        title="View RAG Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button onClick={() => handleDelete(row.id)} className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors" title="Delete Log">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {history.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      No chat history found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RAG Observability Modal */}
      {selectedChat && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                  <Database size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">RAG Pipeline Observability</h2>
                  <p className="text-xs text-gray-500 font-mono">ID: {selectedChat.id} | {formatTime(selectedChat.time)}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedChat(null)}
                className="text-gray-400 hover:text-gray-600 bg-white hover:bg-gray-100 rounded-full p-2 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto bg-gray-50 flex-1 space-y-6">
              
              {/* 1. User Question */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative">
                <div className="absolute -top-3 left-4 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-blue-200">
                  <MessageSquare size={12} /> 1. User Question
                </div>
                <p className="text-gray-800 text-lg font-medium mt-2">"{selectedChat.question}"</p>
              </div>

              <div className="flex justify-center text-gray-300">
                <ChevronDown size={24} />
              </div>

              {/* 2. Retrieved Context */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative">
                <div className="absolute -top-3 left-4 bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-teal-200">
                  <Database size={12} /> 2. Vector Search Retrieval
                </div>
                
                {selectedChat.metadata?.topMatches?.length > 0 ? (
                  <div className="mt-4 space-y-4">
                    {selectedChat.metadata.topMatches.map((match, idx) => (
                      <div key={idx} className="border border-gray-100 rounded-lg p-4 bg-gray-50">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-bold text-gray-800 text-lg">{match.product_name}</h4>
                          <span className="bg-teal-50 text-teal-700 px-2.5 py-1 rounded-md text-xs font-bold border border-teal-100">
                            Similarity: {match.score}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500 font-semibold block mb-1">Composition</span>
                            <span className="text-gray-700">{match.fields.composition}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 font-semibold block mb-1">Dosage</span>
                            <span className="text-gray-700">{match.fields.dosage}</span>
                          </div>
                        </div>
                        <div className="mt-3 text-sm">
                          <span className="text-gray-500 font-semibold block mb-1">Indication</span>
                          <span className="text-gray-700 line-clamp-2">{match.fields.indication}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic mt-4">No matching vectors retrieved above threshold.</p>
                )}
              </div>

              <div className="flex justify-center text-gray-300">
                <ChevronDown size={24} />
              </div>

              {/* 3. Prompt Sent */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative">
                <div className="absolute -top-3 left-4 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-purple-200">
                  <FileText size={12} /> 3. LLM Prompt Sent
                </div>
                <div className="mt-4 bg-gray-900 rounded-lg p-4 max-h-[200px] overflow-y-auto">
                  <pre className="text-gray-300 text-xs font-mono whitespace-pre-wrap">
                    {selectedChat.metadata?.promptSent || "No prompt sent (fallback triggered)."}
                  </pre>
                </div>
              </div>

              <div className="flex justify-center text-gray-300">
                <ChevronDown size={24} />
              </div>

              {/* 4. Final Answer */}
              <div className="bg-white p-5 rounded-xl border border-green-200 shadow-sm relative ring-1 ring-green-100">
                <div className="absolute -top-3 left-4 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-green-200">
                  <Sparkles size={12} /> 4. Final Gemini Response
                </div>
                <p className="text-gray-800 text-sm mt-4 leading-relaxed whitespace-pre-wrap">
                  {selectedChat.answer}
                </p>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatHistory;
