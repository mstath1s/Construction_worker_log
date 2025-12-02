import { DatabaseUtils } from '@/lib/api/database';
import { ApiError } from '@/lib/api/errorHandling';

export async function GET() {
  try {
    return await DatabaseUtils.withCollection('projects', async (projectsCollection) => {
      // Try to find the default project
      let defaultProject = await projectsCollection.findOne({ name: "Default Project" });

      // If no default project exists, create one
      if (!defaultProject) {
        const newProject = {
          name: "Default Project",
          description: "Default project for work logs",
          location: "Default Location",
          startDate: new Date(),
          status: 'in-progress',
          manager: "65f8a7b2c4e8f3a1d2b3c4d5", // Default manager ID
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const result = await projectsCollection.insertOne(newProject);
        defaultProject = {
          ...newProject,
          _id: result.insertedId
        };
      }

      return ApiError.success(defaultProject);
    });
  } catch (error) {
    return ApiError.handle(error);
  }
} 