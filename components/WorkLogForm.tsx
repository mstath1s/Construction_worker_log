import React, { useState, useEffect } from 'react';
import mongoose from 'mongoose';
import type { WorkLogFormProps } from '../types/components';
import type { IProject } from '../types/models';
import { addPendingWorkLog, PendingWorkLogData } from '@/lib/indexedDBHelper';
import { useSession } from 'next-auth/react';
import { v4 as uuidv4 } from 'uuid';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useToast } from '@/hooks/useToast';
import { Alert } from '@/components/ui/alert';
import { FormField } from '@/components/forms/FormField';
import { DEFAULT_PERSONNEL, DEFAULT_EQUIPMENT, DEFAULT_MATERIALS, TOAST_DURATION } from '@/lib/constants';

/**
 * Form data matching the unified WorkLog schema
 */
type FormData = {
  date: string;
  project: string;
  weather?: string;
  temperature?: number;
  workDescription: string;
  personnel: Array<{
    role: string;
    count: number;
  }>;
  equipment: Array<{
    type: string;
    count: number;
    hours?: number;
  }>;
  materials: Array<{
    name: string;
    quantity: number;
    unit: string;
  }>;
  notes?: string;
};

export const WorkLogForm: React.FC<WorkLogFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<FormData>({
    date: new Date().toISOString().split('T')[0],
    project: '',
    workDescription: '',
    personnel: [],
    equipment: [],
    materials: []
  });

  const [projects, setProjects] = useState<IProject[]>([]);

  // Custom hooks for cleaner state management
  const { data: session } = useSession();
  const isOnline = useOnlineStatus();
  const { toast, showSuccess, showError } = useToast();

  useEffect(() => {
    const mockProjectId = new mongoose.Types.ObjectId();
    setProjects([
      {
        _id: mockProjectId,
        name: 'Test Project',
        client: 'Test Client',
        location: 'Test Location',
        startDate: new Date(),
        endDate: new Date(),
        status: 'active',
        budget: 100000,
        description: 'Test Description',
      }
    ]);
  }, []);

  // Notify user of connection status changes
  useEffect(() => {
    if (isOnline) {
      showSuccess('Network connection restored.', TOAST_DURATION.SHORT);
    } else {
      showError('Connection lost. Submissions will be saved locally.', TOAST_DURATION.MEDIUM);
    }
  }, [isOnline, showSuccess, showError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session || !session.user?.id) {
      showError("User not authenticated.");
      return;
    }
    const authorId = session.user.id;

    if (isOnline) {
      try {
        if (onSubmit) {
          await onSubmit({
            ...formData,
            date: new Date(formData.date),
            project: new mongoose.Types.ObjectId(formData.project),
            author: authorId
          });
          showSuccess('Work log submitted successfully', TOAST_DURATION.SHORT);
        } else {
          console.warn("WorkLogForm: onSubmit prop is not provided.");
          showError("Form submission handler is missing.");
        }
      } catch (error) {
        console.error("Online submission error:", error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        showError(`Failed to submit: ${errorMessage}`);
      }
    } else {
      const tempId = uuidv4();

      const pendingData: PendingWorkLogData = {
        tempId: tempId,
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
        console.error("Error saving pending work log:", error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        showError(`Failed to save locally: ${errorMessage}`);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addPersonnel = () => {
    setFormData(prev => ({
      ...prev,
      personnel: [...prev.personnel, DEFAULT_PERSONNEL]
    }));
  };

  const addEquipment = () => {
    setFormData(prev => ({
      ...prev,
      equipment: [...prev.equipment, DEFAULT_EQUIPMENT]
    }));
  };

  const addMaterial = () => {
    setFormData(prev => ({
      ...prev,
      materials: [...prev.materials, DEFAULT_MATERIALS]
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!isOnline && (
        <Alert variant="warning">
          You are currently offline. Submissions will be saved locally and synced later.
        </Alert>
      )}
      {toast && (
        <Alert variant={toast.type}>
          {toast.message}
        </Alert>
      )}

      <FormField label="Date" htmlFor="date" required>
        <input
          type="date"
          id="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </FormField>

      <FormField label="Project" htmlFor="project" required>
        <select
          id="project"
          name="project"
          value={formData.project}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        >
          <option value="">Select a project</option>
          {projects.map(project => (
            <option key={project._id?.toString()} value={project._id?.toString()}>
              {project.name}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label="Weather" htmlFor="weather">
        <input
          type="text"
          id="weather"
          name="weather"
          value={formData.weather || ''}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </FormField>

      <FormField label="Temperature (°C)" htmlFor="temperature">
        <input
          type="number"
          id="temperature"
          name="temperature"
          value={formData.temperature || ''}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </FormField>

      <FormField label="Work Description" htmlFor="workDescription" required>
        <textarea
          id="workDescription"
          name="workDescription"
          value={formData.workDescription}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </FormField>

      <FormField label="Notes" htmlFor="notes">
        <textarea
          id="notes"
          name="notes"
          value={formData.notes || ''}
          onChange={handleChange}
          rows={2}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </FormField>

      <div className="flex space-x-2">
        <button
          type="button"
          onClick={addPersonnel}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add Personnel
        </button>

        <button
          type="button"
          onClick={addEquipment}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add Equipment
        </button>

        <button
          type="button"
          onClick={addMaterial}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add Material
        </button>
      </div>

      <button
        type="submit"
        className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Submit
      </button>
    </form>
  );
}; 