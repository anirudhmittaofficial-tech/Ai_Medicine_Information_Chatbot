function ApiMonitoring() {
  const logs = [
    { time: "10:15:22", api: "Inventory API /stock", status: "200 OK", duration: "122 ms" },
    { time: "10:15:23", api: "Sales API /top", status: "200 OK", duration: "85 ms" },
    { time: "10:16:05", api: "Pharmacy API /orders", status: "404 Not Found", duration: "320 ms", error: true },
    { time: "10:17:10", api: "Gemini LLM", status: "200 OK", duration: "1850 ms" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white mb-8">API & System Monitoring</h1>
      
      <div className="bg-[#1e1e1e] rounded-xl border border-[#333] overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#2a2a2a] text-gray-400 text-sm">
            <tr>
              <th className="px-6 py-4 font-medium">Time</th>
              <th className="px-6 py-4 font-medium">API Endpoint</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Duration</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#333] text-gray-300 font-mono text-sm">
            {logs.map((log, i) => (
              <tr key={i} className="hover:bg-[#252525] transition-colors">
                <td className="px-6 py-4 text-gray-500">{log.time}</td>
                <td className="px-6 py-4">{log.api}</td>
                <td className={`px-6 py-4 ${log.error ? 'text-red-400' : 'text-green-400'}`}>
                  {log.status}
                </td>
                <td className="px-6 py-4 text-right text-gray-400">{log.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ApiMonitoring;
