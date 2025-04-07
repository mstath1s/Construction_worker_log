import React, { useState, useEffect } from 'react';
import mongoose from 'mongoose';
import type { WorkLogFormProps } from '../types/components';
import type { IProject } from '../types/models';
import { addPendingWorkLog, PendingWorkLogData } from '@/lib/indexedDBHelper';
import { useSession } from 'next-auth/react';
import { v4 as uuidv4 } from 'uuid';

type FormData = {
  date: string;
  project: string;
  workType: string;
  description: string;
  personnel: Array<{
    name: string;
    role: string;
    hours: number;
  }>;
  equipment: Array<{
    name: string;
    hours: number;
  }>;
  materials: Array<{
    name: string;
    quantity: number;
    unit: string;
  }>;
};

export const WorkLogForm: React.FC<WorkLogFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<FormData>({
    date: new Date().toISOString().split('T')[0],
    project: '',
    workType: '',
    description: '',
    personnel: [],
    equipment: [],
    materials: []
  });

  const [projects, setProjects] = useState<IProject[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  const { data: session } = useSession();

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

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
      if (navigator.onLine) {
        setSuccessMessage('Network connection restored.');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setErrorMessage('Network connection lost. Submissions will be saved locally.');
      }
    };

    updateOnlineStatus();

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!session || !session.user?.id) {
      setErrorMessage("User not authenticated.");
      return;
    }
    const authorId = session.user.id;

    if (navigator.onLine) {
      console.log("Submitting online...");
      try {
        if (onSubmit) {
          await onSubmit({
            ...formData,
            date: new Date(formData.date),
            project: new mongoose.Types.ObjectId(formData.project),
            author: authorId
          });
          setSuccessMessage('Work log submitted successfully');
          setTimeout(() => setSuccessMessage(null), 3000);
        } else {
          console.warn("WorkLogForm: onSubmit prop is not provided.");
          setErrorMessage("Form submission handler is missing.");
        }
      } catch (error) {
        console.error("Online submission error:", error);
        setErrorMessage(`Failed to submit online: ${error.message || 'Unknown error'}`);
      }
    } else {
      console.log("Submitting offline...");
      const tempId = uuidv4();

      const pendingData: PendingWorkLogData = {
        tempId: tempId,
        author: authorId,
        date: new Date(formData.date).toISOString(),
        project: formData.project,
        workType: formData.workType,
        description: formData.description,
        personnel: formData.personnel,
        equipment: formData.equipment,
        materials: formData.materials,
      };

      try {
        await addPendingWorkLog(pendingData);
        setSuccessMessage('Offline: Work log saved locally. It will be synced when online.');
        setTimeout(() => setSuccessMessage(null), 5000);
      } catch (error) {
        console.error("Error saving pending work log:", error);
        setErrorMessage(`Failed to save locally: ${error.message || 'Unknown error'}`);
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
      personnel: [...prev.personnel, { name: 'John Doe', role: 'Worker', hours: 8 }]
    }));
    setSuccessMessage('Personnel added successfully');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const addEquipment = () => {
    setFormData(prev => ({
      ...prev,
      equipment: [...prev.equipment, { name: 'Excavator', hours: 4 }]
    }));
    setSuccessMessage('Equipment added successfully');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const addMaterial = () => {
    setFormData(prev => ({
      ...prev,
      materials: [...prev.materials, { name: 'Concrete', quantity: 10, unit: 'cubic meters' }]
    }));
    setSuccessMessage('Material added successfully');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!isOnline && (
        <div className="rounded-md bg-yellow-50 p-4 mb-4">
          <p className="text-sm font-medium text-yellow-800">
            You are currently offline. Submissions will be saved locally and synced later.
          </p>
        </div>
      )}
      {successMessage && (
        <div className="rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{successMessage}</p>
            </div>
          </div>
        </div>
      )}
      {errorMessage && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v4a1 1 0 102 0V5zm-1 6a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd"/>
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}

      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700">
          Date
        </label>
        <input
          type="date"
          id="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>

      <div>
        <label htmlFor="project" className="block text-sm font-medium text-gray-700">
          Project
        </label>
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
      </div>

      <div>
        <label htmlFor="workType" className="block text-sm font-medium text-gray-700">
          Work Type
        </label>
        <input
          type="text"
          id="workType"
          name="workType"
          value={formData.workType}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>

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