import { UploadCloud, RefreshCw, FileText, Trash2 } from 'lucide-react';

function KnowledgeBase() {
  const docs = [
    { id: 1, name: "Product Catalogue.pdf", chunks: 420, status: "Completed", date: "25 Jun, 2026" },
    { id: 2, name: "Medical Guidelines 2026.pdf", chunks: 85, status: "Completed", date: "20 Jun, 2026" },
    { id: 3, name: "New Inventory Q3.csv", chunks: 12, status: "Processing", date: "26 Jun, 2026", progress: 45 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Knowledge Base Management</h1>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm transition-all">
            <UploadCloud size={18} />
            Upload PDF
          </button>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm transition-all">
            <RefreshCw size={18} />
            Rebuild Embeddings
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-4">Document Name</th>
                <th className="px-6 py-4">Chunks</th>
                <th className="px-6 py-4">Embedding Status</th>
                <th className="px-6 py-4">Upload Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {docs.map((doc) => (
                <tr key={doc.id} className="hover:bg-blue-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-800 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                      <FileText size={20} />
                    </div>
                    {doc.name}
                  </td>
                  <td className="px-6 py-4 text-gray-600 font-mono">{doc.chunks}</td>
                  <td className="px-6 py-4">
                    {doc.status === 'Processing' ? (
                      <div className="flex items-center gap-3 w-48">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full animate-pulse" style={{ width: `${doc.progress}%` }}></div>
                        </div>
                        <span className="text-xs font-semibold text-blue-600">{doc.progress}%</span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border bg-green-100 text-green-800 border-green-200">
                        Completed
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-500">{doc.date}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors" title="Delete Document">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default KnowledgeBase;
