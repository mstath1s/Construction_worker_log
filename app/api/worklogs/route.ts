// GET all work logs
import { DEFAULT_PAGE_SIZE } from '@/lib/constants/constants';
import { ApiError } from '@/lib/api/errorHandling';
import { RepositoryFactory } from '@/lib/repositories';

export async function GET(request: Request) {
  try {
    return await RepositoryFactory.withWorkLogRepository(async (workLogRepo) => {
      // Get project filter from query parameters
      const { searchParams } = new URL(request.url);
      const projectId = searchParams.get('project');

      let workLogs;

      if (projectId) {
        // Get work logs for a specific project
        workLogs = await workLogRepo.findByProject(projectId, {
          limit: DEFAULT_PAGE_SIZE,
          projection: {
            _id: 1,
            date: 1,
            project: 1,
            status: 1,
            author: 1,
            workDescription: 1,
            createdAt: 1,
            updatedAt: 1
          }
        });
      } else {
        // Get recent work logs
        workLogs = await workLogRepo.findRecent(DEFAULT_PAGE_SIZE);
      }

      return ApiError.success(workLogs);
    });
  } catch (error) {
    return ApiError.handle(error);
  }
}

export async function POST(request: Request) {
  try {
    const startTime = Date.now();
    const data = await request.json();

    return await RepositoryFactory.withWorkLogRepository(async (workLogRepo) => {
      // Create the work log using repository
      const workLog = await workLogRepo.create(data);

      console.log(`Work log created in ${Date.now() - startTime}ms`);

      return ApiError.success(workLog, 201);
    });
  } catch (error) {
    return ApiError.handle(error);
  }
} 