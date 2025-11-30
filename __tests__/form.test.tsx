import React from 'react';
import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { WorkLogForm } from '../components/WorkLogForm';
import dbConnect from '../lib/dbConnect';
import { WorkLog, Project, User } from '../lib/models';
import type { IProject, IUser } from '../lib/models';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { SessionProvider } from 'next-auth/react';


let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  // Temporarily set the MONGODB_URI for the test
  process.env.MONGODB_URI = mongoUri;
  await dbConnect();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await WorkLog.deleteMany({});
  await Project.deleteMany({});
  await User.deleteMany({});
});

// Mock session
const mockSession = {
  user: {
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

// Helper to render with SessionProvider
const renderWithSession = (component: React.ReactElement) => {
  return render(
    <SessionProvider session={mockSession}>
      {component}
    </SessionProvider>
  );
};

describe('WorkLogForm', () => {
  const mockManagerId = new mongoose.Types.ObjectId();
  const mockProjectId = new mongoose.Types.ObjectId();
  const mockProject = {
    _id: mockProjectId,
    name: 'Test Project',
    description: 'Test Description',
    location: 'Test Location',
    startDate: new Date(),
    endDate: new Date(),
    status: 'in-progress' as const,
    manager: mockManagerId,
  };

  const mockUser = {
    _id: new mongoose.Types.ObjectId(),
    name: 'Test User',
    email: 'test@example.com',
    role: 'admin' as const,
  };

  it('should render the form correctly', async () => {
    await Project.create(mockProject);
    await User.create(mockUser);

    renderWithSession(<WorkLogForm onSubmit={vi.fn()} />);

    // Check if form elements are rendered
    expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/project/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/work description/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add personnel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add equipment/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add material/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit work log/i })).toBeInTheDocument();
  });

  it('should handle personnel addition', async () => {
    await Project.create(mockProject);
    await User.create(mockUser);

    renderWithSession(<WorkLogForm onSubmit={vi.fn()} />);

    // Add personnel
    const addButton = screen.getByRole('button', { name: /add personnel/i });
    fireEvent.click(addButton);

    // Check if personnel fields appear
    await waitFor(() => {
      expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
    });
  });

  it('should handle equipment addition', async () => {
    await Project.create(mockProject);
    await User.create(mockUser);

    renderWithSession(<WorkLogForm onSubmit={vi.fn()} />);

    // Add equipment
    const addButton = screen.getByRole('button', { name: /add equipment/i });
    fireEvent.click(addButton);

    // Check if equipment fields appear
    await waitFor(() => {
      expect(screen.getByLabelText(/type/i)).toBeInTheDocument();
    });
  });

  it('should handle material addition', async () => {
    await Project.create(mockProject);
    await User.create(mockUser);

    renderWithSession(<WorkLogForm onSubmit={vi.fn()} />);

    // Add material
    const addButton = screen.getByRole('button', { name: /add material/i });
    fireEvent.click(addButton);

    // Check if material fields appear
    await waitFor(() => {
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    });
  });
}); 