import React, { useEffect, useState } from 'react';
import { RefreshCw, WifiOff } from 'lucide-react';

type NetworkInfo = {
  effectiveType?: string;
  addEventListener?: (type: 'change', listener: () => void) => void;
  removeEventListener?: (type: 'change', listener: () => void) => void;
};

export default function ConnectionStatus() {
  const [offline, setOffline] = useState(() => !navigator.onLine);
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: NetworkInfo }).connection;
    const update = () => {
      setOffline(!navigator.onLine);
      setSlow(['slow-2g', '2g'].includes(connection?.effectiveType || ''));
    };
    update();
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    connection?.addEventListener?.('change', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
      connection?.removeEventListener?.('change', update);
    };
  }, []);

  if (!offline && !slow) return null;

  return (
    <div role={offline ? 'alert' : 'status'} aria-live={offline ? 'assertive' : 'polite'} className={`fixed inset-x-0 top-[128px] z-[60] flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold shadow-md ${offline ? 'bg-red-700 text-white' : 'bg-amber-300 text-gray-950'}`}>
      <WifiOff size={15} />
      <span>{offline ? 'Orion.LK cannot connect. Check your internet connection.' : 'Your connection is slow. Orion.LK is still loading live store data.'}</span>
      {offline && <button type="button" onClick={() => window.location.reload()} className="ml-2 inline-flex items-center gap-1 underline underline-offset-2"><RefreshCw size={13} /> Retry</button>}
    </div>
  );
}