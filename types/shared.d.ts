/**
 * Shared type definitions used across the application
 * Centralizes common interfaces to maintain consistency
 */

/**
 * Project type - used in dropdowns and references
 */
export interface Project {
  _id: string;
  name: string;
  description?: string;
  location?: string;
  status?: 'planning' | 'in-progress' | 'completed' | 'on-hold';
  startDate?: Date;
  endDate?: Date;
  manager?: string;
}

/**
 * Work log type - main entity
 */
export interface WorkLog {
  _id: string;
  date: Date;
  description: string;
  project?: string;
  author?: string;
  weather?: string;
  temperature?: number;
  workDescription: string;
  personnel?: Array<{
    role: string;
    count: number;
  }>;
  equipment?: Array<{
    type: string;
    count: number;
    hours?: number;
  }>;
  materials?: Array<{
    name: string;
    quantity: number;
    unit: string;
  }>;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * User type
 */
export interface User {
  _id: string;
  name: string;
  email: string;
  role?: 'admin' | 'manager' | 'worker';
}

/**
 * Personnel entry
 */
export interface Personnel {
  role: string;
  count: number;
}

/**
 * Equipment entry
 */
export interface Equipment {
  type: string;
  count: number;
  hours?: number;
}

/**
 * Material entry
 */
export interface Material {
  name: string;
  quantity: number;
  unit: string;
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: PaginationMeta;
}
