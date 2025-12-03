// GET a single work log by ID
import { DatabaseUtils } from '@/lib/api/database';
import { ApiError } from '@/lib/api/errorHandling';
import { RepositoryFactory } from '@/lib/repositories';
import { getAuthUser, canModify } from '@/utils/auth';

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
    const user = await getAuthUser();

    if (!user) {
      return ApiError.unauthorized();
    }

    const data = await request.json();

    return await RepositoryFactory.withWorkLogRepository(async (workLogRepo) => {
      // First, get the existing work log to check ownership
      const existingWorkLog = await workLogRepo.findById(id);

      if (!existingWorkLog) {
        return ApiError.notFound('Work log');
      }

      // Check if user can modify (admin/manager or author)
      if (!canModify(user, existingWorkLog.author?.toString() || '')) {
        return ApiError.forbidden('You do not have permission to update this work log');
      }

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
    const user = await getAuthUser();

    if (!user) {
      return ApiError.unauthorized();
    }

    return await RepositoryFactory.withWorkLogRepository(async (workLogRepo) => {
      // First, get the existing work log to check ownership
      const existingWorkLog = await workLogRepo.findById(id);

      if (!existingWorkLog) {
        return ApiError.notFound('Work log');
      }

      // Check if user can modify (admin/manager or author)
      if (!canModify(user, existingWorkLog.author?.toString() || '')) {
        return ApiError.forbidden('You do not have permission to delete this work log');
      }

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