import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User';
import { IProject } from './Project';

export interface IWorkLog extends Document {
  date: Date;
  project: mongoose.Types.ObjectId | IProject;
  author: mongoose.Types.ObjectId | IUser;
  weather: string;
  temperature: number;
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
  issues: string;
  notes: string;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}


const WorkLogSchema: Schema = new Schema(
  {
    date: { type: Date, required: true },
    project: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Project', 
      required: true 
    },
    author: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    weather: { type: String },
    temperature: { type: Number },
    workDescription: { type: String, required: true },
    personnel: [{ 
      role: { type: String, required: true },
      count: { type: Number, required: true }
    }],
    equipment: [{ 
      type: { type: String, required: true },
      count: { type: Number, required: true },
      hours: { type: Number }
    }],
    materials: [{ 
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      unit: { type: String, required: true }
    }],
    issues: { type: String },
    notes: { type: String },
    images: [{ type: String }]
  },
  { timestamps: true }
);

export default mongoose.models.WorkLog || mongoose.model<IWorkLog>('WorkLog', WorkLogSchema); 