import { useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { v4 as uuidv4 } from 'uuid';
import { addPendingWorkLog, PendingWorkLogData } from '@/lib/indexedDBHelper';
import { useOnlineStatus } from './useOnlineStatus';
import { useToast } from './useToast';
import { TOAST_DURATION } from '@/lib/constants/constants';
import type { WorkLogFormData } from './useWorkLogForm';

/**
 * Options for submitting work log data
 */
interface SubmitOptions {
  onlineSubmit: (data: any) => Promise<void>;
  formData: WorkLogFormData;
}

/**
 * Custom hook to handle offline/online submission logic
 * Abstracts the complexity of determining whether to save locally or submit to server
 */
export function useOfflineSync() {
  const { data: session } = useSession();
  const isOnline = useOnlineStatus();
  const { showSuccess, showError } = useToast();

  /**
   * Submit work log - automatically handles online/offline scenarios
   */
  const submitWorkLog = useCallback(async ({
    onlineSubmit,
    formData,
  }: SubmitOptions) => {
    if (!session?.user?.id) {
      const errorMsg = 'User not authenticated. Please sign in to submit work logs.';
      showError(errorMsg);
      throw new Error(errorMsg);
    }

    const authorId = session.user.id;

    if (isOnline) {
      // Online submission
      try {
        const apiData = {
          ...formData,
          date: new Date(formData.date),
          author: authorId
        };

        await onlineSubmit(apiData);
        showSuccess('Work log submitted successfully', TOAST_DURATION.SHORT);
      } catch (error) {
        console.error('Online submission error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        showError(`Failed to submit: ${errorMessage}`);
        throw error;
      }
    } else {
      // Offline submission - save to IndexedDB
      const tempId = uuidv4();

      const pendingData: PendingWorkLogData = {
        tempId,
        author: authorId,
        date: new Date(formData.date).toISOString(),
        project: formData.project,
        weather: formData.weather,
        temperature: formData.temperature,
        workDescription: formData.workDescription,
        personnel: formData.personnel,
        equipment: formData.equipment,
        materials: formData.materials,
        notes: formData.notes,
      };

      try {
        await addPendingWorkLog(pendingData);
        showSuccess('Work log saved locally. Will sync when online.', TOAST_DURATION.MEDIUM);
      } catch (error) {
        console.error('Error saving pending work log:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        showError(`Failed to save locally: ${errorMessage}`);
        throw error;
      }
    }
  }, [session, isOnline, showSuccess, showError]);

  return {
    isOnline,
    submitWorkLog,
  };
}
