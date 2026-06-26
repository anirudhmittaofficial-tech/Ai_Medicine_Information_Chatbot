import { useState } from 'react';
import { X, CheckCircle2 } from 'lucide-react';

export default function QueryCaptureModal({ isOpen, onClose }) {
  const [status, setStatus] = useState('idle'); // idle, submitted
  const [formData, setFormData] = useState({ name: '', userType: 'Doctor', question: '' });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/enquiry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_name: formData.name, 
          user_type: formData.userType, 
          question: formData.question 
        })
      });
      if (response.ok) {
        setStatus('submitted');
      } else {
        console.error('Submission failed');
        // You could add an error state here, for now keeping it simple
      }
    } catch (error) {
      console.error('Error submitting query:', error);
    }
  };

  const resetAndClose = () => {
    setStatus('idle');
    setFormData({ name: '', userType: 'Doctor', question: '' });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity"
        onClick={status === 'idle' ? onClose : resetAndClose}
      />

      {/* Modal Content */}
      <div className="glass-panel w-full max-w-lg relative z-10 p-6 md:p-8 animate-in zoom-in-95 duration-300">
        <button 
          onClick={status === 'idle' ? onClose : resetAndClose} 
          className="absolute top-4 right-4 text-secondary hover:text-white transition-colors bg-white/5 rounded-full p-2"
        >
          <X className="w-4 h-4" />
        </button>

        {status === 'idle' ? (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white mb-1">Submit a Query</h2>
              <p className="text-sm text-secondary">Our medical team will review and respond shortly.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Name */}
              <div>
                <label className="block text-xs font-medium text-secondary mb-1.5 ml-1">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-primary placeholder:text-secondary/50 focus:outline-none focus:border-[#22D3C7]/50 focus:bg-white/10 transition-all"
                  placeholder="Dr. Jane Doe"
                />
              </div>

              {/* User Type Toggle */}
              <div>
                <label className="block text-xs font-medium text-secondary mb-1.5 ml-1">I am a...</label>
                <div className="flex bg-white/5 border border-white/10 rounded-xl p-1">
                  {['Doctor', 'Pharmacy', 'Patient'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({...formData, userType: type})}
                      className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
                        formData.userType === type 
                          ? 'bg-gradient-to-r from-[#22D3C7]/80 to-[#0EA5E9]/80 text-white shadow-md' 
                          : 'text-secondary hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question */}
              <div>
                <label className="block text-xs font-medium text-secondary mb-1.5 ml-1">Your Question</label>
                <textarea 
                  required
                  value={formData.question}
                  onChange={(e) => setFormData({...formData, question: e.target.value})}
                  className="w-full h-32 bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-primary placeholder:text-secondary/50 focus:outline-none focus:border-[#22D3C7]/50 focus:bg-white/10 transition-all resize-none"
                  placeholder="Please describe your query in detail..."
                />
              </div>

              {/* Submit */}
              <button 
                type="submit"
                className="w-full py-3 rounded-xl bg-[#22D3C7] hover:bg-[#0EA5E9] text-white font-medium shadow-[0_0_20px_rgba(34,211,199,0.3)] transition-all transform hover:-translate-y-0.5 mt-2"
              >
                Submit Query
              </button>

            </form>
          </>
        ) : (
          <div className="py-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 border border-[#22D3C7]/30 flex items-center justify-center mb-6 relative">
              <div className="absolute inset-0 rounded-full bg-[#22D3C7]/20 animate-ping" />
              <CheckCircle2 className="w-8 h-8 text-[#22D3C7] relative z-10" />
            </div>
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-200 text-xs font-medium mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              New Ticket
            </div>
            
            <h2 className="text-xl font-semibold text-white mb-2">Query Received</h2>
            <p className="text-sm text-secondary max-w-[280px]">
              Your query has been securely captured. Our medical review team will get back to you shortly.
            </p>
            
            <button 
              onClick={resetAndClose}
              className="mt-8 px-6 py-2 rounded-lg glass-button text-sm text-primary"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
