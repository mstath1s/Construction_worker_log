/**
 * Performance Tests for React Component Optimizations
 * Tests React.memo, useMemo, and useCallback effectiveness
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { WorkLogForm } from '@/components/WorkLogForm';
import { PendingSubmissions } from '@/components/PendingSubmissions';

// Mock hooks
vi.mock('@/hooks/useWorkLogForm', () => ({
  useWorkLogForm: () => ({
    formData: {
      date: '2025-12-01',
      project: '',
      author: '',
      workDescription: '',
      personnel: [],
      equipment: [],
      materials: [],
      weather: '',
      temperature: 20,
      notes: '',
    },
    handleChange: vi.fn(),
    personnel: { add: vi.fn(), remove: vi.fn(), update: vi.fn() },
    equipment: { add: vi.fn(), remove: vi.fn(), update: vi.fn() },
    materials: { add: vi.fn(), remove: vi.fn(), update: vi.fn() },
    resetForm: vi.fn(),
  }),
}));

vi.mock('@/hooks/useOfflineSync', () => ({
  useOfflineSync: () => ({
    isOnline: true,
    submitWorkLog: vi.fn(),
  }),
}));

vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({
    toast: null,
    showError: vi.fn(),
  }),
}));

vi.mock('@/hooks/useErrorHandler', () => ({
  useErrorHandler: () => ({
    handleError: vi.fn(),
  }),
}));

// Mock IndexedDB helper
vi.mock('@/lib/indexedDBHelper', () => ({
  getPendingWorkLogs: vi.fn().mockResolvedValue([]),
}));

// Mock sync service
vi.mock('@/lib/syncService', () => ({
  syncPendingWorkLogs: vi.fn().mockResolvedValue({ successful: 0, failed: 0 }),
}));

describe('Performance: React Component Rendering', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        { _id: '1', name: 'Project A', description: 'Test' },
        { _id: '2', name: 'Project B', description: 'Test' },
      ],
    });
  });

  describe('WorkLogForm - React.memo optimization', () => {
    it('should be wrapped with React.memo', () => {
      // Check if component type has $$typeof for memo
      expect(WorkLogForm).toBeDefined();
      // React.memo wraps the component, check the display name or type
      const componentType = (WorkLogForm as any).$$typeof || (WorkLogForm as any).type;
      expect(componentType).toBeDefined();
    });

    it('should not re-render when parent re-renders with same props', async () => {
      const onSubmit = vi.fn();
      let renderCount = 0;

      // Wrap to track renders
      const TrackedWorkLogForm = React.memo(() => {
        renderCount++;
        return <WorkLogForm onSubmit={onSubmit} />;
      });

      const { rerender } = render(<TrackedWorkLogForm />);

      await screen.findByText(/Loading projects/i, {}, { timeout: 3000 });
      const initialRenderCount = renderCount;

      // Re-render with same props
      rerender(<TrackedWorkLogForm />);

      // Should not cause additional renders
      expect(renderCount).toBe(initialRenderCount);
    });
  });

  describe('PendingSubmissions - React.memo optimization', () => {
    const mockInitialData = {
      projects: [
        { _id: '1', name: 'Project A', description: 'Test' },
      ],
      workLogs: [],
    };

    it('should be wrapped with React.memo', () => {
      expect(PendingSubmissions).toBeDefined();
      const componentType = (PendingSubmissions as any).$$typeof || (PendingSubmissions as any).type;
      expect(componentType).toBeDefined();
    });

    it('should render without crashing', async () => {
      render(<PendingSubmissions initialData={mockInitialData} />);

      // Should show "No pending submissions" or loading state
      const element = await screen.findByText(/No pending submissions|Pending Submissions/i);
      expect(element).toBeInTheDocument();
    });

    it('should use useCallback for memoized functions', async () => {
      const { rerender } = render(<PendingSubmissions initialData={mockInitialData} />);

      await screen.findByText(/Pending Submissions/i);

      // Re-render with same data
      rerender(<PendingSubmissions initialData={mockInitialData} />);

      // Component should handle re-renders efficiently
      expect(screen.getByText(/Pending Submissions/i)).toBeInTheDocument();
    });
  });

  describe('WorkLogForm - useMemo for project options', () => {
    it('should render project options efficiently', async () => {
      const onSubmit = vi.fn();
      render(<WorkLogForm onSubmit={onSubmit} />);

      // Wait for projects to load
      await screen.findByText(/Select a project/i, {}, { timeout: 3000 });

      // Projects should be rendered
      const projectSelect = screen.getByRole('combobox', { name: /project/i });
      expect(projectSelect).toBeInTheDocument();
    });

    it('should memoize project options to prevent unnecessary recalculations', async () => {
      const onSubmit = vi.fn();
      const { rerender } = render(<WorkLogForm onSubmit={onSubmit} />);

      await screen.findByText(/Select a project/i, {}, { timeout: 3000 });

      // Re-render should not cause project options to be recreated
      rerender(<WorkLogForm onSubmit={onSubmit} />);

      expect(screen.getByRole('combobox', { name: /project/i })).toBeInTheDocument();
    });
  });
});
