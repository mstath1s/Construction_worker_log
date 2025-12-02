import type { ObjectId } from 'mongodb';

/**
 * Options for find operations
 */
export interface FindOptions {
  limit?: number;
  skip?: number;
  sort?: Record<string, 1 | -1>;
  projection?: Record<string, 0 | 1>;
}

/**
 * Generic Repository Interface
 * Defines the contract for all repository implementations
 */
export interface IRepository<T> {
  /**
   * Find all documents matching the filter
   */
  findAll(filter?: Partial<T>, options?: FindOptions): Promise<T[]>;

  /**
   * Find a single document by ID
   */
  findById(id: string | ObjectId): Promise<T | null>;

  /**
   * Find a single document matching the filter
   */
  findOne(filter: Partial<T>): Promise<T | null>;

  /**
   * Create a new document
   */
  create(data: Omit<T, '_id' | 'createdAt' | 'updatedAt'>): Promise<T>;

  /**
   * Update a document by ID
   */
  update(id: string | ObjectId, data: Partial<Omit<T, '_id' | 'createdAt'>>): Promise<T | null>;

  /**
   * Delete a document by ID
   */
  delete(id: string | ObjectId): Promise<boolean>;

  /**
   * Count documents matching the filter
   */
  count(filter?: Partial<T>): Promise<number>;

  /**
   * Check if a document exists
   */
  exists(filter: Partial<T>): Promise<boolean>;
}
