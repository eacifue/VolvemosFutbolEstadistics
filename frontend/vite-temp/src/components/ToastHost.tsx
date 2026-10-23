import React, { useCallback, useRef, useState } from 'react';
import { ToastContext, type ToastInput } from '../lib/toast';
import { Toast } from './vaf/overlays';

export const ToastHost: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<(ToastInput & { id: number })[]>([]);
  const seq = useRef(0);

  const dismiss = useCallback((id: number) => setItems((list) => list.filter((t) => t.id !== id)), []);

  const push = useCallback((t: ToastInput) => {
    const id = ++seq.current;
    setItems((list) => [...list.slice(-2), { ...t, id }]);
    setTimeout(() => dismiss(id), t.tone === 'error' ? 7000 : 4500);
  }, [dismiss]);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="vf-toasts" aria-live="polite">
        {items.map((t) => <Toast key={t.id} tone={t.tone} message={t.message} detail={t.detail} onClose={() => dismiss(t.id)} />)}
      </div>
    </ToastContext.Provider>
  );
};
