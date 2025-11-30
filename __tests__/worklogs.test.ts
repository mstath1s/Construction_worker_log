import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import mongoose, { Types } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import WorkLog, { IWorkLog } from '../lib/models/WorkLog';
import Project, { IProject } from '../lib/models/Project';
import User, { IUser } from '../lib/models/User';
import { GET, POST } from './test-server';

// Extend global type for mongoose cache
declare global {
  // eslint-disable-next-line no-var
  var mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  } | undefined;
}

describe('WorkLog Tests', () => {
  let mongoServer: MongoMemoryServer;
  let defaultProject: IProject;
  let defaultUser: IUser;

  beforeEach(async () => {
    // Setup in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    // Set MONGODB_URI for dbConnect to use
    process.env.MONGODB_URI = mongoUri;

    await mongoose.connect(mongoUri);

    // Create test user
    defaultUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      role: 'manager'
    });

    // Create test project
    defaultProject = await Project.create({
      name: 'Test Project',
      description: 'Test Project Description',
      location: 'Test Location',
      startDate: new Date(),
      status: 'in-progress',
      manager: defaultUser._id
    });
  });

  afterEach(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();

    // Clear the global mongoose cache to prevent connection reuse
    if (global.mongoose) {
      global.mongoose.conn = null;
      global.mongoose.promise = null;
    }

    // Clean up MONGODB_URI
    delete process.env.MONGODB_URI;
  });

  describe('Saving WorkLogs', () => {
    it('should save a valid work log', async () => {
      const workLogData: Partial<IWorkLog> = {
        date: new Date(),
        project: defaultProject._id as Types.ObjectId,
        author: defaultUser._id as Types.ObjectId,
        weather: 'Sunny',
        temperature: 25,
        workDescription: 'Test work description',
        personnel: [
          { role: 'Worker', count: 5 }
        ],
        equipment: [
          { type: 'Excavator', count: 1, hours: 8 }
        ],
        materials: [
          { name: 'Concrete', quantity: 10, unit: 'cubic meters' }
        ],
        notes: 'Test notes'
      };

      const workLog = new WorkLog(workLogData);
      const savedWorkLog = await workLog.save();

      expect(savedWorkLog._id).toBeDefined();
      expect(savedWorkLog.project.toString()).toBe((defaultProject._id as Types.ObjectId).toString());
      expect(savedWorkLog.workDescription).toBe('Test work description');
    });

    it('should fail to save work log without required fields', async () => {
      const invalidWorkLog = new WorkLog({
        // Missing required fields
        weather: 'Sunny'
      });

      await expect(invalidWorkLog.save()).rejects.toThrow();
    });
  });

  describe('Retrieving WorkLogs', () => {
    beforeEach(async () => {
      // Create some test work logs
      const workLogs: Partial<IWorkLog>[] = [
        {
          date: new Date('2024-03-01'),
          project: defaultProject._id as Types.ObjectId,
          author: defaultUser._id as Types.ObjectId,
          workDescription: 'Work Log 1',
          personnel: [{ role: 'Worker', count: 3 }]
        },
        {
          date: new Date('2024-03-02'),
          project: defaultProject._id as Types.ObjectId,
          author: defaultUser._id as Types.ObjectId,
          workDescription: 'Work Log 2',
          personnel: [{ role: 'Worker', count: 4 }]
        }
      ];

      await WorkLog.insertMany(workLogs);
    });

    it('should retrieve all work logs', async () => {
      const workLogs = await WorkLog.find({})
        .populate('project', 'name')
        .populate('author', 'name');

      expect(workLogs).toHaveLength(2);
      expect(workLogs[0].project.name).toBe('Test Project');
      expect(workLogs[0].author.name).toBe('Test User');
    });

    it('should retrieve work log by ID', async () => {
      const workLog = await WorkLog.findOne({});
      const retrievedWorkLog = await WorkLog.findById(workLog?._id)
        .populate('project')
        .populate('author');

      expect(retrievedWorkLog).toBeDefined();
      expect(retrievedWorkLog?.workDescription).toBe('Work Log 1');
    });

    it('should sort work logs by date', async () => {
      const workLogs = await WorkLog.find({})
        .sort({ date: -1 });

      expect(workLogs[0].date.getTime()).toBeGreaterThan(workLogs[1].date.getTime());
    });
  });

  describe('API Route Tests', () => {
    it('should handle POST request to create work log', async () => {
      const requestData = {
        date: new Date(),
        project: (defaultProject._id as Types.ObjectId).toString(),
        author: (defaultUser._id as Types.ObjectId).toString(),
        workDescription: 'API Test Work Log',
        personnel: [{ role: 'Worker', count: 2 }]
      };

      const request = new Request('http://localhost:3000/api/worklogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data._id).toBeDefined();
      expect(data.workDescription).toBe('API Test Work Log');
    });

    it('should handle GET request to fetch work logs', async () => {
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
    });
  });
}); 