import mongoose, { Schema, Document } from 'mongoose';
import './User'; // Import User model to ensure it's registered
import { IUser } from './User';

export interface IProject extends Document {
  name: string;
  description: string;
  location: string;
  startDate: Date;
  endDate?: Date;
  status: 'planned' | 'in-progress' | 'completed' | 'on-hold';
  manager: mongoose.Types.ObjectId | IUser;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    status: { 
      type: String, 
      enum: ['planned', 'in-progress', 'completed', 'on-hold'], 
      default: 'planned' 
    },
    manager: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
  },
  { timestamps: true }
);

export default mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema); 