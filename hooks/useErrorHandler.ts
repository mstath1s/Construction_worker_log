import { useCallback } from 'react';
import { useToast } from './useToast';
import { TOAST_DURATION } from '@/lib/constants';

/**
 * Standardized error handling hook
 * Provides consistent error handling and user feedback across the application
 */
export function useErrorHandler() {
  const { showError, showSuccess } = useToast();

  /**
   * Handle errors with consistent logging and user feedback
   */
  const handleError = useCallback((
    error: unknown,
    context: string,
    userMessage?: string
  ) => {
    // Log to console for debugging
    console.error(`[${context}] Error:`, error);

    // Extract error message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Show user-friendly message
    const displayMessage = userMessage || `Failed: ${errorMessage}`;
    showError(displayMessage, TOAST_DURATION.MEDIUM);

    // Return error details for further handling if needed
    return {
      message: errorMessage,
      context,
      originalError: error,
    };
  }, [showError]);

  /**
   * Wrap async operations with standardized error handling
   */
  const withErrorHandler = useCallback(<T,>(
    operation: () => Promise<T>,
    context: string,
    options?: {
      successMessage?: string;
      errorMessage?: string;
      onError?: (error: unknown) => void;
      onSuccess?: (result: T) => void;
    }
  ) => {
    return async (): Promise<T | null> => {
      try {
        const result = await operation();

        if (options?.successMessage) {
          showSuccess(options.successMessage, TOAST_DURATION.SHORT);
        }

        if (options?.onSuccess) {
          options.onSuccess(result);
        }

        return result;
      } catch (error) {
        handleError(error, context, options?.errorMessage);

        if (options?.onError) {
          options.onError(error);
        }

        return null;
      }
    };
  }, [handleError, showSuccess]);

  return {
    handleError,
    withErrorHandler,
  };
}
