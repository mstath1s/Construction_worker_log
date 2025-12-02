import { ObjectId } from 'mongodb'

/**
 * Custom validation error for API routes
 */
export class ValidationError extends Error {
  constructor(message: string, public statusCode: number = 400) {
    super(message)
    this.name = 'ValidationError'
  }
}

/**
 * Utility class for common API validation operations
 * Centralizes ObjectId validation and normalization
 */
export class ValidationUtils {
  /**
   * Validates that a string is a valid MongoDB ObjectId
   * @throws ValidationError if invalid
   */
  static validateObjectId(id: string): ObjectId {
    if (!ObjectId.isValid(id)) {
      throw new ValidationError('Invalid ID format')
    }
    return new ObjectId(id)
  }

  /**
   * Normalizes a value to ObjectId (handles both string and ObjectId inputs)
   * @throws ValidationError if invalid
   */
  static normalizeObjectId(value: string | ObjectId): ObjectId {
    if (typeof value === 'string' && ObjectId.isValid(value)) {
      return new ObjectId(value)
    }
    if (value instanceof ObjectId) {
      return value
    }
    throw new ValidationError('Invalid ObjectId')
  }

  /**
   * Validates and normalizes an optional ObjectId
   * Returns null if the value is null/undefined
   */
  static normalizeOptionalObjectId(value?: string | ObjectId | null): ObjectId | null {
    if (!value) {
      return null
    }
    return this.normalizeObjectId(value)
  }

  /**
   * Converts ObjectId to string safely
   */
  static objectIdToString(value: ObjectId | string | undefined): string | undefined {
    if (!value) {
      return undefined
    }
    if (value instanceof ObjectId) {
      return value.toString()
    }
    return value
  }
}
