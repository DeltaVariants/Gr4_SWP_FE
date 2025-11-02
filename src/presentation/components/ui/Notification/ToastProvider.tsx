"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import Toast from './Toast';

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: string;
  title?: string;
  message: string;
  type: ToastType;
  duration?: number; // ms, 0 = persist until closed
}

interface ToastContextType {
  showToast: (t: Omit<ToastItem, 'id'>) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((t: Omit<ToastItem, 'id'>) => {
    const id = String(Date.now()) + Math.random().toString(36).slice(2, 9);
    const item: ToastItem = { id, ...t };
    setToasts((s) => [item, ...s]);

    if ((t.duration ?? 4000) > 0) {
      const duration = t.duration ?? 4000;
      window.setTimeout(() => {
        setToasts((s) => s.filter((x) => x.id !== id));
      }, duration);
    }
  }, []);

  const contextValue = useMemo(() => ({ showToast }), [showToast]);

  const remove = useCallback((id: string) => setToasts((s) => s.filter((x) => x.id !== id)), []);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div aria-live="polite" className="fixed top-4 right-4 z-50 flex flex-col gap-2 items-end">
        {toasts.map((t) => (
          <Toast
            key={t.id}
            title={t.title}
            message={t.message}
            type={t.type}
            onClose={() => remove(t.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
};

export default ToastProvider;
