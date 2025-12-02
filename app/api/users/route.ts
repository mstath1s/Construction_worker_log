import { DatabaseUtils } from "@/lib/api/database";
import { ApiError } from "@/lib/api/errorHandling";
import { ValidationError } from "@/lib/api/validation";
import { userSchema } from "@/lib/schemas/userSchema";

export async function GET() {
  try {
    return await DatabaseUtils.withCollection('users', async (usersCollection) => {
      // If no users exist, create a default one
      const count = await usersCollection.countDocuments();
      if (count === 0) {
        const defaultUser = {
          name: "Default User",
          email: "default@example.com",
          role: "admin",
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await usersCollection.insertOne(defaultUser);
      }

      // Return a basic list of users with required fields for the form
      const users = await usersCollection.find({}).project({
        name: 1,
        email: 1,
      }).toArray();

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

    return await DatabaseUtils.withCollection('users', async (usersCollection) => {
      // Check if email is already in use
      const existingUser = await usersCollection.findOne({ email: validatedData.data.email });
      if (existingUser) {
        throw new ValidationError("Email already in use", 400);
      }

      // Create new user with defaults
      const newUser = {
        ...validatedData.data,
        role: validatedData.data.role || 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Insert into database
      const result = await usersCollection.insertOne(newUser);

      // Return the created user with _id in the correct format
      return ApiError.success({
        _id: result.insertedId.toString(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt
      }, 201);
    });
  } catch (error) {
    return ApiError.handle(error);
  }
} 