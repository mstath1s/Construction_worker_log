# Repository Pattern Implementation

This directory contains the repository pattern implementation for the Construction Logger application. The repository pattern provides a clean abstraction layer between the data access logic and business logic, making the codebase more maintainable, testable, and scalable.

## Architecture

### Base Components

- **IRepository** (`base/IRepository.ts`): Generic repository interface defining the contract for all repositories
- **BaseRepository** (`base/BaseRepository.ts`): Abstract base class providing common CRUD operations

### Repository Implementations

- **WorkLogRepository** (`WorkLogRepository.ts`): Handles all work log operations
- **ProjectRepository** (`ProjectRepository.ts`): Handles all project operations
- **UserRepository** (`UserRepository.ts`): Handles all user operations

### Factory Pattern

- **RepositoryFactory** (`RepositoryFactory.ts`): Centralized factory for creating and accessing repositories

## Usage Examples

### Basic CRUD Operations

```typescript
import { RepositoryFactory } from '@/lib/repositories';

// Get all work logs
export async function GET() {
  return await RepositoryFactory.withWorkLogRepository(async (workLogRepo) => {
    const workLogs = await workLogRepo.findAll();
    return ApiError.success(workLogs);
  });
}

// Create a new work log
export async function POST(request: Request) {
  const data = await request.json();

  return await RepositoryFactory.withWorkLogRepository(async (workLogRepo) => {
    const workLog = await workLogRepo.create(data);
    return ApiError.success(workLog, 201);
  });
}

// Update a work log
export async function PUT(id: string, request: Request) {
  const data = await request.json();

  return await RepositoryFactory.withWorkLogRepository(async (workLogRepo) => {
    const workLog = await workLogRepo.update(id, data);
    if (!workLog) {
      return ApiError.notFound('Work log');
    }
    return ApiError.success(workLog);
  });
}

// Delete a work log
export async function DELETE(id: string) {
  return await RepositoryFactory.withWorkLogRepository(async (workLogRepo) => {
    const deleted = await workLogRepo.delete(id);
    if (!deleted) {
      return ApiError.notFound('Work log');
    }
    return ApiError.success({ success: true });
  });
}
```

### Domain-Specific Operations

Each repository provides domain-specific methods beyond basic CRUD:

#### WorkLogRepository

```typescript
// Find work logs by project
const workLogs = await workLogRepo.findByProject(projectId, { limit: 10 });

// Find work logs by author
const workLogs = await workLogRepo.findByAuthor(authorId);

// Find work logs by date range
const workLogs = await workLogRepo.findByDateRange(startDate, endDate);

// Search work logs by description
const workLogs = await workLogRepo.searchByDescription('foundation');

// Get recent work logs
const workLogs = await workLogRepo.findRecent(20);

// Get work log with populated details (project name, author name)
const workLog = await workLogRepo.findByIdWithDetails(id, projectsCollection, usersCollection);
```

#### ProjectRepository

```typescript
// Find projects by status
const projects = await projectRepo.findByStatus('active');

// Find active projects
const projects = await projectRepo.findActive();

// Search projects by name
const projects = await projectRepo.searchByName('construction');

// Get project summary (lightweight)
const projects = await projectRepo.findSummary();

// Ensure default project exists
await projectRepo.ensureDefaultProject();

// Find projects by budget range
const projects = await projectRepo.findByBudgetRange(10000, 100000);
```

#### UserRepository

```typescript
// Find user by email
const user = await userRepo.findByEmail('user@example.com');

// Check if email is taken
const isTaken = await userRepo.isEmailTaken('user@example.com');

// Find users by role
const admins = await userRepo.findByRole('admin');

// Search users
const users = await userRepo.search('john');

// Get user summary (lightweight)
const users = await userRepo.findSummary();

// Ensure default user exists
await userRepo.ensureDefaultUser();
```

### Using Multiple Repositories

```typescript
import { RepositoryFactory } from '@/lib/repositories';

// Access multiple repositories in a single operation
return await RepositoryFactory.withRepositories(async ({ workLogs, projects, users }) => {
  const workLog = await workLogs.findById(id);
  const project = await projects.findById(workLog.project);
  const author = await users.findById(workLog.author);

  return {
    workLog,
    project,
    author
  };
});
```

## Benefits

1. **Separation of Concerns**: Business logic is separated from data access logic
2. **Testability**: Repositories can be easily mocked for unit testing
3. **Maintainability**: Data access logic is centralized in one place
4. **Reusability**: Common operations are implemented once in the base repository
5. **Type Safety**: Full TypeScript support with proper typing
6. **Consistency**: All data operations follow the same pattern
7. **Extensibility**: Easy to add new repositories or extend existing ones

## Best Practices

1. **Always use the RepositoryFactory**: Don't instantiate repositories directly
2. **Use domain-specific methods**: Leverage the specialized methods provided by each repository
3. **Handle errors properly**: Repositories throw errors that should be caught and handled in API routes
4. **Use the `with*Repository` methods**: These ensure proper database connection handling
5. **Keep repositories focused**: Each repository should handle only one entity type
6. **Add new methods to repositories**: Don't bypass repositories with direct database queries

## Migration Notes

All API routes have been refactored to use the repository pattern:

- `/api/worklogs` - Uses WorkLogRepository
- `/api/worklogs/[id]` - Uses WorkLogRepository
- `/api/projects` - Uses ProjectRepository
- `/api/users` - Uses UserRepository

The migration maintains backward compatibility while providing cleaner, more maintainable code.
