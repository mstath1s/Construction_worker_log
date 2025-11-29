import { useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  message: string;
  type: ToastType;
}

/**
 * Custom hook for managing toast notifications
 * Provides auto-dismiss functionality
 */
export function useToast(defaultDuration = 3000) {
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = useCallback((message: string, type: ToastType = 'info', duration = defaultDuration) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), duration);
  }, [defaultDuration]);

  const showSuccess = useCallback((message: string, duration?: number) => {
    showToast(message, 'success', duration);
  }, [showToast]);

  const showError = useCallback((message: string, duration?: number) => {
    showToast(message, 'error', duration);
  }, [showToast]);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  return {
    toast,
    showToast,
    showSuccess,
    showError,
    dismissToast,
  };
}
