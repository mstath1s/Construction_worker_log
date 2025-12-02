import { dbConnect } from '@/lib/dbConnect'
import mongoose from 'mongoose'
import { DB_CONNECTION_TIMEOUT_MS } from '@/lib/constants'

/**
 * Database utility functions for API routes
 * Centralizes database connection and collection access
 */
export class DatabaseUtils {
  /**
   * Connect to database with timeout
   * @throws Error if connection times out
   */
  static async connect(): Promise<void> {
    await Promise.race([
      dbConnect(),
      new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error('Database connection timeout')),
          DB_CONNECTION_TIMEOUT_MS
        )
      )
    ])
  }

  /**
   * Get a MongoDB collection by name
   * Assumes database connection already established
   */
  static getCollection(name: string) {
    const db = mongoose.connection
    return db.collection(name)
  }

  /**
   * Execute a callback with an active database connection
   * Automatically handles connection and provides the db instance
   */
  static async withConnection<T>(
    callback: (db: typeof mongoose.connection) => Promise<T>
  ): Promise<T> {
    await this.connect()
    return callback(mongoose.connection)
  }

  /**
   * Execute a callback with a specific collection
   * Automatically handles connection and provides the collection
   */
  static async withCollection<T>(
    collectionName: string,
    callback: (collection: ReturnType<typeof mongoose.connection.collection>) => Promise<T>
  ): Promise<T> {
    await this.connect()
    const collection = this.getCollection(collectionName)
    return callback(collection)
  }
}
