import { DatabaseUtils } from "@/lib/api/database";
import { ApiError } from "@/lib/api/errorHandling";
import { projectSchema } from "@/lib/schemas/projectSchema";

export async function GET() {
  try {
    return await DatabaseUtils.withCollection('projects', async (projectsCollection) => {
      // If no projects exist, create a default one
      const count = await projectsCollection.countDocuments();
      if (count === 0) {
        const defaultProject = {
          name: "Default Project",
          description: "Default project for work logs",
          location: "Default Location",
          client: "Default Client",
          startDate: new Date(),
          endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
          status: 'active',
          budget: 100000,
        };

        await projectsCollection.insertOne(defaultProject);
      }

      // Return all projects with projection to reduce payload
      const projects = await projectsCollection.find({}, {
        projection: { _id: 1, name: 1, description: 1, location: 1, status: 1 }
      }).toArray();

      return ApiError.success(projects);
    });
  } catch (error) {
    return ApiError.handle(error);
  }
}

export async function POST(request: Request) {
  try {
    const projectData = await request.json();

    // Validate project data
    const validatedData = projectSchema.safeParse(projectData);
    if (!validatedData.success) {
      return ApiError.badRequest(
        validatedData.error.issues.map(issue => issue.message).join(', ')
      );
    }

    return await DatabaseUtils.withCollection('projects', async (projectsCollection) => {
      // Create new project with required defaults
      const newProject = {
        ...validatedData.data,
        startDate: validatedData.data.startDate || new Date(),
        endDate: validatedData.data.endDate || new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        status: validatedData.data.status || 'planned',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Insert into database
      const result = await projectsCollection.insertOne(newProject);

      // Return the created project with _id in the correct format
      return ApiError.success({
        _id: result.insertedId.toString(),
        ...newProject
      }, 201);
    });
  } catch (error) {
    return ApiError.handle(error);
  }
}
