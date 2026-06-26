import { useState, useEffect } from 'react';
import { Search, Filter, CheckCircle, Trash2, Eye, Loader2, X, Send } from 'lucide-react';
import axios from 'axios';

function EnquiryManagement() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/enquiry`);
      setEnquiries(res.data);
    } catch (error) {
      console.error("Failed to fetch enquiries", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const handleResolve = async (id, answer = undefined) => {
    try {
      if (answer !== undefined) setReplying(true);
      const payload = { status: 'Resolved' };
      if (answer !== undefined) payload.answer = answer;

      const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/enquiry/${id}`, payload);
      
      setEnquiries(enquiries.map(e => e.id === id ? res.data : e));
      if (selectedEnquiry && selectedEnquiry.id === id) {
        setSelectedEnquiry(res.data);
      }
      
      if (answer !== undefined) {
        alert("Reply submitted successfully!");
      }
    } catch (error) {
      console.error("Failed to resolve enquiry", error);
      alert("Failed to update enquiry. Is your backend server restarted?");
    } finally {
      setReplying(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this enquiry?")) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/enquiry/${id}`);
        setEnquiries(enquiries.filter(e => e.id !== id));
        if (selectedEnquiry?.id === id) setSelectedEnquiry(null);
      } catch (error) {
        console.error("Failed to delete enquiry", error);
        alert("Failed to delete enquiry. Is your backend server restarted?");
      }
    }
  };

  const getStatusBadge = (status) => {
    switch(status?.toLowerCase()) {
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
      case 'new': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'assigned': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const filteredEnquiries = enquiries.filter(e => 
    e.user_name?.toLowerCase().includes(search.toLowerCase()) || 
    e.question?.toLowerCase().includes(search.toLowerCase())
  );

  const openModal = (eq) => {
    setSelectedEnquiry(eq);
    setReplyText(eq.answer || '');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Enquiry Management</h1>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <input 
              type="text" 
              placeholder="Search Enquiries..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
            />
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          </div>
        </div>
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
                  <th className="px-6 py-4">User Name</th>
                  <th className="px-6 py-4">User Type</th>
                  <th className="px-6 py-4">Question</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Created Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredEnquiries.map((eq) => (
                  <tr key={eq.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-800">{eq.user_name}</td>
                    <td className="px-6 py-4 text-gray-600">{eq.user_type}</td>
                    <td className="px-6 py-4 text-gray-600 max-w-[250px] truncate" title={eq.question}>{eq.question}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(eq.status)}`}>
                        {eq.status || 'New'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{formatDate(eq.created_at)}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => openModal(eq)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-200 transition-colors" 
                        title="View Full Details & Reply"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(eq.id)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors" 
                        title="Delete Enquiry"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredEnquiries.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      No enquiries found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Enquiry Details & Reply Modal */}
      {selectedEnquiry && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h2 className="text-lg font-bold text-gray-800">Enquiry Details</h2>
                <p className="text-xs text-gray-500">Ticket #{selectedEnquiry.id}</p>
              </div>
              <button 
                onClick={() => setSelectedEnquiry(null)}
                className="text-gray-400 hover:text-gray-600 bg-white hover:bg-gray-100 rounded-full p-2 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              
              {/* User Info */}
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm">
                <div>
                  <span className="block text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">From</span>
                  <span className="font-bold text-gray-800">{selectedEnquiry.user_name}</span>
                  <span className="text-gray-500 block">{selectedEnquiry.email || 'No email provided'}</span>
                </div>
                <div>
                  <span className="block text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">User Type</span>
                  <span className="text-gray-800">{selectedEnquiry.user_type}</span>
                  <span className="block text-gray-500 text-xs mt-1">{formatDate(selectedEnquiry.created_at)}</span>
                </div>
              </div>

              {/* Question */}
              <div>
                <span className="block text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">Question / Message</span>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
                  {selectedEnquiry.question}
                </div>
              </div>

              {/* Reply Box */}
              <div>
                <span className="block text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">Admin Reply</span>
                {selectedEnquiry.status === 'Resolved' && selectedEnquiry.answer ? (
                  <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
                    {selectedEnquiry.answer}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your reply here to resolve this enquiry..."
                      rows="4"
                      className="w-full bg-white border border-gray-200 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                    ></textarea>
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleResolve(selectedEnquiry.id, replyText)}
                        disabled={replying || !replyText.trim()}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50"
                      >
                        {replying ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                        {replying ? 'Sending...' : 'Send Reply & Resolve'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EnquiryManagement;
