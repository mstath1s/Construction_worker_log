// GET a single work log by ID
import { DatabaseUtils } from '@/lib/api/database';
import { ApiError } from '@/lib/api/errorHandling';
import { RepositoryFactory } from '@/lib/repositories';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    return await DatabaseUtils.withConnection(async (db) => {
      const workLogRepo = RepositoryFactory.getWorkLogRepository();
      const projectsCollection = db.collection('projects');
      const usersCollection = db.collection('users');

      // Find work log by ID with populated details
      const workLog = await workLogRepo.findByIdWithDetails(
        id,
        projectsCollection,
        usersCollection
      );

      if (!workLog) {
        return ApiError.notFound('Work log');
      }

      return ApiError.success(workLog);
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

    return await RepositoryFactory.withWorkLogRepository(async (workLogRepo) => {
      // Update the work log using repository
      const workLog = await workLogRepo.update(id, data);

      if (!workLog) {
        return ApiError.notFound('Work log');
      }

      return ApiError.success(workLog);
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

    return await RepositoryFactory.withWorkLogRepository(async (workLogRepo) => {
      // Delete the work log using repository
      const deleted = await workLogRepo.delete(id);

      if (!deleted) {
        return ApiError.notFound('Work log');
      }

      return ApiError.success({ success: true });
    });
  } catch (error) {
    return ApiError.handle(error);
  }
} 