// GET all work logs
import { DEFAULT_PAGE_SIZE } from '@/lib/constants';
import { DatabaseUtils } from '@/lib/api/database';
import { ValidationUtils } from '@/lib/api/validation';
import { ApiError } from '@/lib/api/errorHandling';

export async function GET(request: Request) {
  try {
    return await DatabaseUtils.withCollection('worklogs', async (workLogsCollection) => {
      // Get project filter from query parameters
      const { searchParams } = new URL(request.url);
      const projectId = searchParams.get('project');

      // Build query filter
      const filter: any = {};

      if (projectId) {
        const cleanId = projectId.trim()
          .replace(/^ObjectId\(['"]?/, "")
          .replace(/['"]?\)$/, "");

        const objectId = ValidationUtils.validateObjectId(cleanId);
        filter.$or = [
          { project: cleanId }, // string format
          { project: objectId }, // ObjectId format
        ];
      }

      // Get work logs, sort by date descending
      const workLogs = await workLogsCollection
        .find(filter, {
          projection: {
            _id: 1,
            date: 1,
            project: 1,
            author: 1,
            workDescription: 1,
            createdAt: 1,
            updatedAt: 1
          }
        })
        .sort({ createdAt: -1 })
        .limit(DEFAULT_PAGE_SIZE)
        .toArray();

      const formattedWorkLogs = workLogs.map((log) => ({
        ...log,
        _id: ValidationUtils.objectIdToString(log._id),
        project: ValidationUtils.objectIdToString(log.project),
        author: ValidationUtils.objectIdToString(log.author),
        date: log.date instanceof Date ? log.date.toISOString() : log.date,
        createdAt: log.createdAt instanceof Date ? log.createdAt.toISOString() : log.createdAt,
        updatedAt: log.updatedAt instanceof Date ? log.updatedAt.toISOString() : log.updatedAt,
      }));

      return ApiError.success(formattedWorkLogs);
    });
  } catch (error) {
    return ApiError.handle(error);
  }
}

export async function POST(request: Request) {
  try {
    const startTime = Date.now();
    const data = await request.json();

    return await DatabaseUtils.withCollection('worklogs', async (workLogsCollection) => {
      // Validate and normalize ObjectId
      const projectObjectId = ValidationUtils.validateObjectId(data.project);

      // Add timestamps
      const workLogData = {
        ...data,
        project: projectObjectId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Insert the document directly
      const result = await workLogsCollection.insertOne(workLogData);

      console.log(`Work log created in ${Date.now() - startTime}ms`);

      // Return the created work log with ID
      return ApiError.success({
        _id: result.insertedId.toString(),
        ...workLogData,
        project: workLogData.project.toString()
      }, 201);
    });
  } catch (error) {
    return ApiError.handle(error);
  }
} 