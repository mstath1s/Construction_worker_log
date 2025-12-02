import type { Collection, ObjectId } from 'mongodb';
import type { IRepository, FindOptions } from './IRepository';
import { ValidationUtils } from '@/lib/api/validation';

/**
 * Abstract Base Repository
 * Provides common implementation for all repositories
 */
export abstract class BaseRepository<T extends { _id?: string | ObjectId }> implements IRepository<T> {
  constructor(protected collection: any) {}

  /**
   * Find all documents matching the filter
   */
  async findAll(filter: Partial<T> = {}, options: FindOptions = {}): Promise<T[]> {
    const { limit, skip, sort, projection } = options;

    const normalizedFilter = this.normalizeFilter(filter);

    let query = this.collection.find(normalizedFilter);

    if (projection) {
      query = query.project(projection);
    }

    if (sort) {
      query = query.sort(sort);
    }

    if (skip) {
      query = query.skip(skip);
    }

    if (limit) {
      query = query.limit(limit);
    }

    const documents = await query.toArray();
    return documents.map((doc: any) => this.mapToEntity(doc));
  }

  /**
   * Find a single document by ID
   */
  async findById(id: string | ObjectId): Promise<T | null> {
    const objectId = ValidationUtils.normalizeObjectId(id);
    const document = await this.collection.findOne({ _id: objectId } as any);

    return document ? this.mapToEntity(document) : null;
  }

  /**
   * Find a single document matching the filter
   */
  async findOne(filter: Partial<T>): Promise<T | null> {
    const normalizedFilter = this.normalizeFilter(filter);
    const document = await this.collection.findOne(normalizedFilter);

    return document ? this.mapToEntity(document) : null;
  }

  /**
   * Create a new document
   */
  async create(data: Omit<T, '_id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    const now = new Date();
    const documentToInsert = {
      ...data,
      createdAt: now,
      updatedAt: now,
    };

    const result = await this.collection.insertOne(documentToInsert as any);

    const createdDocument = await this.collection.findOne({ _id: result.insertedId } as any);

    if (!createdDocument) {
      throw new Error('Failed to retrieve created document');
    }

    return this.mapToEntity(createdDocument);
  }

  /**
   * Update a document by ID
   */
  async update(id: string | ObjectId, data: Partial<Omit<T, '_id' | 'createdAt'>>): Promise<T | null> {
    const objectId = ValidationUtils.normalizeObjectId(id);

    const updateData = {
      ...data,
      updatedAt: new Date(),
    };

    const result = await this.collection.findOneAndUpdate(
      { _id: objectId } as any,
      { $set: updateData },
      { returnDocument: 'after' }
    );

    return result ? this.mapToEntity(result) : null;
  }

  /**
   * Delete a document by ID
   */
  async delete(id: string | ObjectId): Promise<boolean> {
    const objectId = ValidationUtils.normalizeObjectId(id);
    const result = await this.collection.deleteOne({ _id: objectId } as any);

    return result.deletedCount > 0;
  }

  /**
   * Count documents matching the filter
   */
  async count(filter: Partial<T> = {}): Promise<number> {
    const normalizedFilter = this.normalizeFilter(filter);
    return this.collection.countDocuments(normalizedFilter);
  }

  /**
   * Check if a document exists
   */
  async exists(filter: Partial<T>): Promise<boolean> {
    const count = await this.count(filter);
    return count > 0;
  }

  /**
   * Map database document to entity
   * Can be overridden by child classes for custom mapping
   */
  protected mapToEntity(document: any): T {
    return {
      ...document,
      _id: document._id.toString(),
    } as T;
  }

  /**
   * Normalize filter to handle ObjectId fields
   * Can be overridden by child classes for custom normalization
   */
  protected normalizeFilter(filter: Partial<T>): any {
    return filter;
  }
}
