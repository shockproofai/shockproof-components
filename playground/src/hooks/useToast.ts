import { useState, useCallback } from 'react';

export interface ToastData {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

let toastId = 0;

export function useToast() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback((message: string) => showToast(message, 'success'), [showToast]);
  const error = useCallback((message: string) => showToast(message, 'error'), [showToast]);
  const info = useCallback((message: string) => showToast(message, 'info'), [showToast]);

  return {
    toasts,
    removeToast,
    showToast,
    success,
    error,
    info,
  };
}
