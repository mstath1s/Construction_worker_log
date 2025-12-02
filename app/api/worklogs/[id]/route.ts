// GET a single work log by ID
import { DatabaseUtils } from '@/lib/api/database';
import { ValidationUtils } from '@/lib/api/validation';
import { ApiError } from '@/lib/api/errorHandling';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const objectId = ValidationUtils.validateObjectId(id);

    return await DatabaseUtils.withConnection(async (db) => {
      const workLogsCollection = db.collection('worklogs');
      const projectsCollection = db.collection('projects');
      const usersCollection = db.collection('users');

      // Find work log by ID
      const workLog = await workLogsCollection.findOne({ _id: objectId });

      if (!workLog) {
        return ApiError.notFound('Work log');
      }

      // Create response object
      const responseWorkLog: any = {
        ...workLog,
        _id: workLog._id.toString()
      };

      // Look up project name if project ID is available
      if (workLog.project) {
        try {
          const projectId = ValidationUtils.normalizeOptionalObjectId(workLog.project);
          if (projectId) {
            const project = await projectsCollection.findOne({ _id: projectId });
            if (project) {
              responseWorkLog.projectName = project.name;
            }
          }
        } catch (error) {
          console.error('Error fetching project details:', error);
        }
      }

      // Look up author name if author ID is available
      if (workLog.author) {
        try {
          const authorId = ValidationUtils.normalizeOptionalObjectId(workLog.author);
          if (authorId) {
            const user = await usersCollection.findOne({ _id: authorId });
            if (user) {
              responseWorkLog.authorName = user.name;
            }
          }
        } catch (error) {
          console.error('Error fetching author details:', error);
        }
      }

      // Convert ObjectIds to strings
      responseWorkLog.project = ValidationUtils.objectIdToString(workLog.project);
      responseWorkLog.author = ValidationUtils.objectIdToString(workLog.author);

      return ApiError.success(responseWorkLog);
    });
  } catch (error) {
    return ApiError.handle(error);
  }
}

// Update a work log by ID
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();
    const objectId = ValidationUtils.validateObjectId(id);

    return await DatabaseUtils.withCollection('worklogs', async (workLogsCollection) => {
      // Convert project and author to ObjectId if they are strings
      const processedData: any = { ...data };

      if (processedData.project) {
        processedData.project = ValidationUtils.normalizeObjectId(processedData.project);
      }

      if (processedData.author) {
        processedData.author = ValidationUtils.normalizeObjectId(processedData.author);
      }

      // Add updatedAt timestamp
      const updatedData = {
        ...processedData,
        updatedAt: new Date()
      };

      // Update the work log
      const result = await workLogsCollection.findOneAndUpdate(
        { _id: objectId },
        { $set: updatedData },
        { returnDocument: 'after' }
      );

      if (!result) {
        return ApiError.notFound('Work log');
      }

      // Create response object
      const responseWorkLog: any = {
        ...result,
        _id: result._id.toString()
      };

      return ApiError.success(responseWorkLog);
    });
  } catch (error) {
    return ApiError.handle(error);
  }
}

// Delete a work log by ID
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const objectId = ValidationUtils.validateObjectId(id);

    return await DatabaseUtils.withCollection('worklogs', async (workLogsCollection) => {
      // Delete the work log
      const result = await workLogsCollection.deleteOne({ _id: objectId });

      if (result.deletedCount === 0) {
        return ApiError.notFound('Work log');
      }

      return ApiError.success({ success: true });
    });
  } catch (error) {
    return ApiError.handle(error);
  }
} 