import React, { useState, useEffect } from 'react';

const PerformanceOverlay: React.FC = () => {
  const [logs, setLogs] = useState<{ id: string; message: string; timestamp: number; type: 'info' | 'warn' | 'error' }[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Initial load time
    const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (navEntry) {
      const loadTime = Math.round(navEntry.loadEventEnd - navEntry.startTime);
      addLog(`App Initialized (Load Time: ${loadTime}ms)`, loadTime > 1000 ? 'warn' : 'info');
    }

    // Mock an inventory fetch time
    setTimeout(() => {
      const mockFetchTime = Math.floor(Math.random() * 300) + 150;
      addLog(`Product Inventory Loaded in ${mockFetchTime}ms`, 'info');
    }, 1000);

  }, []);

  const addLog = (message: string, type: 'info' | 'warn' | 'error' = 'info') => {
    setLogs(prev => [...prev, {
      id: Math.random().toString(36).substring(7),
      message,
      timestamp: Date.now(),
      type
    }]);
  };

  if (!isVisible) {
    return (
      <button 
        onClick={() => setIsVisible(true)}
        className="fixed top-24 right-4 z-50 bg-black/80 text-white text-[10px] font-mono px-2 py-1 rounded shadow-lg backdrop-blur"
      >
        Show Perf Logs
      </button>
    );
  }

  return (
    <div className="fixed top-24 right-4 z-50 w-72 bg-black/90 text-green-400 font-mono text-[10px] p-4 rounded-lg shadow-2xl backdrop-blur-md border border-gray-800 flex flex-col max-h-[300px]">
      <div className="flex items-center justify-between mb-3 border-b border-gray-800 pb-2 shrink-0">
        <span className="font-bold uppercase tracking-wider text-white">Performance Monitor</span>
        <button onClick={() => setIsVisible(false)} className="text-gray-400 hover:text-white">✕</button>
      </div>
      <div className="flex-1 overflow-y-auto space-y-1.5 flex flex-col-reverse">
        {logs.map((log) => (
          <div key={log.id} className={`
            ${log.type === 'warn' ? 'text-yellow-400' : ''}
            ${log.type === 'error' ? 'text-red-400' : ''}
            break-words
          `}>
            <span className="text-gray-500">[{new Date(log.timestamp).toISOString().split('T')[1].slice(0, -1)}]</span> {log.message}
          </div>
        ))}
      </div>
      <button 
        onClick={() => addLog(`User Action Tracked: ${Math.floor(Math.random() * 100)}ms latency`, 'info')}
        className="mt-3 bg-gray-800 text-white px-2 py-1 rounded hover:bg-gray-700 transition-colors shrink-0"
      >
        + Add Mock Event
      </button>
    </div>
  );
};

export default PerformanceOverlay;
