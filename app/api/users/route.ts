import { ApiError } from "@/lib/api/errorHandling";
import { userSchema } from "@/lib/schemas/userSchema";
import { RepositoryFactory } from "@/lib/repositories";

export async function GET() {
  try {
    return await RepositoryFactory.withUserRepository(async (userRepo) => {
      // Ensure default user exists
      await userRepo.ensureDefaultUser();

      // Return user summary (lightweight for dropdowns)
      const users = await userRepo.findSummary();

      return ApiError.success(users);
    });
  } catch (error) {
    return ApiError.handle(error);
  }
}

export async function POST(request: Request) {
  try {
    const userData = await request.json();

    // Validate user data with Zod schema
    const validatedData = userSchema.safeParse(userData);
    if (!validatedData.success) {
      return ApiError.badRequest(
        validatedData.error.issues.map(issue => issue.message).join(', ')
      );
    }

    return await RepositoryFactory.withUserRepository(async (userRepo) => {
      // Create new user with defaults (repository will validate email uniqueness)
      const newUser = {
        ...validatedData.data,
        role: validatedData.data.role || 'user',
      };

      // Insert using repository (will throw error if email is already in use)
      const user = await userRepo.create(newUser as any);

      return ApiError.success(user, 201);
    });
  } catch (error) {
    return ApiError.handle(error);
  }
} 