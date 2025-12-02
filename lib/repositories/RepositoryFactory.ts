import { DatabaseUtils } from '@/lib/api/database';
import { WorkLogRepository } from './WorkLogRepository';
import { ProjectRepository } from './ProjectRepository';
import { UserRepository } from './UserRepository';

/**
 * Repository Factory
 * Provides a centralized way to access all repositories
 * Implements the Factory Pattern for repository instantiation
 */
export class RepositoryFactory {
  /**
   * Get WorkLog repository instance
   */
  static getWorkLogRepository(): WorkLogRepository {
    const collection = DatabaseUtils.getCollection('worklogs');
    return new WorkLogRepository(collection);
  }

  /**
   * Get Project repository instance
   */
  static getProjectRepository(): ProjectRepository {
    const collection = DatabaseUtils.getCollection('projects');
    return new ProjectRepository(collection);
  }

  /**
   * Get User repository instance
   */
  static getUserRepository(): UserRepository {
    const collection = DatabaseUtils.getCollection('users');
    return new UserRepository(collection);
  }

  /**
   * Execute a callback with all repositories
   * Automatically handles database connection
   */
  static async withRepositories<T>(
    callback: (repos: {
      workLogs: WorkLogRepository;
      projects: ProjectRepository;
      users: UserRepository;
    }) => Promise<T>
  ): Promise<T> {
    await DatabaseUtils.connect();

    const repos = {
      workLogs: this.getWorkLogRepository(),
      projects: this.getProjectRepository(),
      users: this.getUserRepository(),
    };

    return callback(repos);
  }

  /**
   * Execute a callback with a specific repository
   * Automatically handles database connection
   */
  static async withWorkLogRepository<T>(
    callback: (repo: WorkLogRepository) => Promise<T>
  ): Promise<T> {
    await DatabaseUtils.connect();
    const repo = this.getWorkLogRepository();
    return callback(repo);
  }

  static async withProjectRepository<T>(
    callback: (repo: ProjectRepository) => Promise<T>
  ): Promise<T> {
    await DatabaseUtils.connect();
    const repo = this.getProjectRepository();
    return callback(repo);
  }

  static async withUserRepository<T>(
    callback: (repo: UserRepository) => Promise<T>
  ): Promise<T> {
    await DatabaseUtils.connect();
    const repo = this.getUserRepository();
    return callback(repo);
  }
}
