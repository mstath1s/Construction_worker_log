import { Types } from 'mongoose';

/**
 * WorkLog interface - matches database schema
 * This is the single source of truth for WorkLog structure
 */
export interface IWorkLog {
  _id?: Types.ObjectId;
  date: Date;
  project: Types.ObjectId;
  author: Types.ObjectId;
  weather?: string;
  temperature?: number;
  workDescription: string;
  personnel: Array<{
    role: string;
    count: number;
  }>;
  equipment: Array<{
    type: string;
    count: number;
    hours?: number;
  }>;
  materials: Array<{
    name: string;
    quantity: number;
    unit: string;
  }>;
  issues?: string;
  notes?: string;
  images?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IProject {
  _id?: Types.ObjectId;
  name: string;
  client: string;
  location: string;
  startDate: Date;
  endDate: Date;
  status: string;
  budget: number;
  description: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUser {
  _id?: Types.ObjectId;
  name: string;
  email: string;
  role: string;
  createdAt?: Date;
  updatedAt?: Date;
} 