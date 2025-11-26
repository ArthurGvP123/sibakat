import { useEffect, useState } from 'react';

type Err = { type: 'error' | 'rejection'; message: string; stack?: string };

export default function GlobalErrorOverlay() {
  const [errs, setErrs] = useState<Err[]>([]);

  useEffect(() => {
    function onError(e: ErrorEvent) {
      setErrs(prev => [...prev, {
        type: 'error',
        message: e.message || String(e.error ?? 'Error'),
        stack: e.error?.stack
      }]);
    }
    function onRej(e: PromiseRejectionEvent) {
      const reason = e.reason;
      const msg = reason instanceof Error ? reason.message
        : typeof reason === 'string' ? reason
        : JSON.stringify(reason);
      setErrs(prev => [...prev, {
        type: 'rejection',
        message: msg,
        stack: reason?.stack
      }]);
    }

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRej);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRej);
    };
  }, []);

  if (errs.length === 0) return null;

  return (
    <div
      style={{ position: 'fixed', zIndex: 9999, bottom: 12, right: 12, maxWidth: 'min(90vw, 720px)' }}
      className="rounded-2xl border border-red-200 bg-red-50 text-red-800 shadow-lg p-3 text-xs font-mono"
    >
      <div className="font-semibold mb-2">Runtime error detected</div>
      <ul className="space-y-2 max-h-[50vh] overflow-auto hide-scrollbar">
        {errs.map((e, idx) => (
          <li key={idx}>
            <div className="font-semibold">{e.type.toUpperCase()}</div>
            <div className="break-all">{e.message}</div>
            {e.stack && <pre className="whitespace-pre-wrap mt-1 opacity-80">{e.stack}</pre>}
          </li>
        ))}
      </ul>
    </div>
  );
}
