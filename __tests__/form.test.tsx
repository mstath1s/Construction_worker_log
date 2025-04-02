import React from 'react';
import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { WorkLogForm } from '../components/WorkLogForm';
import { dbConnect } from '../lib/db';
import { WorkLog } from '../models/WorkLog';
import { Project } from '../models/Project';
import { User } from '../models/User';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import type { IProject, IUser } from '../types/models';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await dbConnect(mongoUri);
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

describe('WorkLogForm', () => {
  const mockProjectId = new mongoose.Types.ObjectId();
  const mockProject: IProject = {
    _id: mockProjectId,
    name: 'Test Project',
    client: 'Test Client',
    location: 'Test Location',
    startDate: new Date(),
    endDate: new Date(),
    status: 'active',
    budget: 100000,
    description: 'Test Description',
  };

  const mockUser: IUser = {
    _id: new mongoose.Types.ObjectId(),
    name: 'Test User',
    email: 'test@example.com',
    role: 'admin',
  };

  it('should render the form correctly', async () => {
    await Project.create(mockProject);
    await User.create(mockUser);

    render(<WorkLogForm onSubmit={vi.fn()} />);

    // Check if form elements are rendered
    expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/project/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/work type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add personnel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add equipment/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add material/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  it('should handle personnel addition', async () => {
    await Project.create(mockProject);
    await User.create(mockUser);

    render(<WorkLogForm onSubmit={vi.fn()} />);

    // Add personnel
    fireEvent.click(screen.getByRole('button', { name: /add personnel/i }));

    await waitFor(() => {
      expect(screen.getByText(/personnel added successfully/i)).toBeInTheDocument();
    });
  });

  it('should handle equipment addition', async () => {
    await Project.create(mockProject);
    await User.create(mockUser);

    render(<WorkLogForm onSubmit={vi.fn()} />);

    // Add equipment
    fireEvent.click(screen.getByRole('button', { name: /add equipment/i }));

    await waitFor(() => {
      expect(screen.getByText(/equipment added successfully/i)).toBeInTheDocument();
    });
  });

  it('should handle material addition', async () => {
    await Project.create(mockProject);
    await User.create(mockUser);

    render(<WorkLogForm onSubmit={vi.fn()} />);

    // Add material
    fireEvent.click(screen.getByRole('button', { name: /add material/i }));

    await waitFor(() => {
      expect(screen.getByText(/material added successfully/i)).toBeInTheDocument();
    });
  });
}); 