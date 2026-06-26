import { useState, useEffect } from 'react';
import { Save, Key, Sliders, FileText, ShieldAlert, Loader2 } from 'lucide-react';
import axios from 'axios';

function Settings() {
  const [settings, setSettings] = useState({
    similarityThreshold: 0.75,
    maxChunks: 4,
    maxTokens: 1024,
    disclaimer: "This information is for reference only. Please consult a qualified healthcare professional before use."
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/settings`);
        setSettings(res.data);
      } catch (err) {
        console.error("Failed to fetch settings", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/settings`, settings);
      alert("Settings saved successfully!");
    } catch (err) {
      console.error("Failed to save settings", err);
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">System Configuration</h1>
        <p className="text-gray-500">Manage API keys, LLM parameters, and global chatbot settings.</p>
      </div>
      
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-8">
        
        {/* API Key Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Key size={20} className="text-blue-600" />
            <h3 className="text-lg font-bold text-gray-800">LLM Provider</h3>
          </div>
          <div className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Gemini API Key</label>
              <div className="relative">
                <input 
                  type="password" 
                  value="AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" 
                  readOnly
                  title="Configured via .env"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-4 pr-10 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono text-sm cursor-not-allowed" 
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">API Keys are securely stored in the `.env` file on the server. Read-only.</p>
            </div>
          </div>
        </div>

        <div className="h-px bg-gray-100 w-full"></div>

        {/* RAG Parameters */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Sliders size={20} className="text-teal-600" />
            <h3 className="text-lg font-bold text-gray-800">RAG Parameters</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Similarity Threshold</label>
              <div className="flex items-center gap-4">
                <input 
                  type="range" 
                  name="similarityThreshold"
                  min="0" max="1" step="0.01" 
                  value={settings.similarityThreshold}
                  onChange={handleChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600" 
                />
                <span className="text-sm font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded w-12 text-center">
                  {settings.similarityThreshold}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2">Minimum cosine similarity score to retrieve a chunk.</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Max Retrieved Chunks</label>
              <input 
                type="number" 
                name="maxChunks"
                min="1" max="10"
                value={settings.maxChunks}
                onChange={handleChange}
                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all" 
              />
              <p className="text-xs text-gray-500 mt-2">Maximum number of context chunks sent to the LLM.</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Maximum Tokens</label>
              <input 
                type="number" 
                name="maxTokens"
                min="256" max="8192"
                value={settings.maxTokens}
                onChange={handleChange}
                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all" 
              />
              <p className="text-xs text-gray-500 mt-2">Maximum token output generation limit.</p>
            </div>
          </div>
        </div>

        <div className="h-px bg-gray-100 w-full"></div>

        {/* Global Prompts */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <ShieldAlert size={20} className="text-orange-500" />
            <h3 className="text-lg font-bold text-gray-800">Compliance & Warnings</h3>
          </div>
          <div className="max-w-2xl">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Medical Disclaimer Text</label>
            <textarea 
              rows="3"
              name="disclaimer"
              value={settings.disclaimer}
              onChange={handleChange}
              className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-sm leading-relaxed" 
            ></textarea>
            <p className="text-xs text-gray-500 mt-2">This disclaimer is automatically appended to all Chatbot responses.</p>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl font-medium transition-colors shadow-sm disabled:opacity-50"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {saving ? "Saving..." : "Save Configuration"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings;
