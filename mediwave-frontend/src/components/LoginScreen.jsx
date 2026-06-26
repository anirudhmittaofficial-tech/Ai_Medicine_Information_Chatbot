import { useState } from 'react';
import { UserCircle, Stethoscope, Pill, BriefcaseMedical } from 'lucide-react';

export default function LoginScreen({ onLogin }) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');

  const roles = [
    { id: 'Doctor', icon: <Stethoscope size={24} />, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
    { id: 'Pharmacist', icon: <Pill size={24} />, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' },
    { id: 'MR', icon: <BriefcaseMedical size={24} />, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
    { id: 'Patient', icon: <UserCircle size={24} />, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim() && role) {
      onLogin({ name: name.trim(), role });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#212121] text-white px-4 relative z-50">
      <div className="w-full max-w-md bg-[#2f2f2f] rounded-2xl p-8 border border-[#444] shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white font-bold text-2xl">AI</span>
          </div>
          <h2 className="text-2xl font-bold text-[#ececec]">Welcome to Mediwave AI</h2>
          <p className="text-[#b4b4b4] text-sm mt-2">Please identify yourself to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#ececec] mb-2">Your Name</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dr. Smith or John Doe"
              className="w-full bg-[#212121] border border-[#444] rounded-xl px-4 py-3 text-[#ececec] placeholder-[#b4b4b4] focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#ececec] mb-3">Select Your Role</label>
            <div className="grid grid-cols-2 gap-3">
              {roles.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                    role === r.id 
                      ? `${r.bg} ${r.border} ring-1 ring-inset ring-${r.color.split('-')[1]}-500` 
                      : 'bg-[#212121] border-[#444] hover:bg-[#333] hover:border-[#555]'
                  }`}
                >
                  <div className={`mb-2 ${role === r.id ? r.color : 'text-[#b4b4b4]'}`}>
                    {r.icon}
                  </div>
                  <span className={`text-sm font-medium ${role === r.id ? 'text-[#ececec]' : 'text-[#b4b4b4]'}`}>
                    {r.id}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <button 
            type="submit"
            disabled={!name.trim() || !role}
            className={`w-full py-3 rounded-xl font-medium transition-all ${
              name.trim() && role 
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20' 
                : 'bg-[#444] text-[#888] cursor-not-allowed'
            }`}
          >
            Start Chatting
          </button>
        </form>
      </div>
    </div>
  );
}
