import { Types } from 'mongoose';

export interface IWorkLog {
  _id?: Types.ObjectId;
  date: string | Date;
  project: Types.ObjectId;
  workType: string;
  description: string;
  personnel: Array<{
    name: string;
    role: string;
    hours: number;
  }>;
  equipment: Array<{
    name: string;
    hours: number;
  }>;
  materials: Array<{
    name: string;
    quantity: number;
    unit: string;
  }>;
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