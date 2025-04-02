import mongoose from 'mongoose';
import type { IProject } from '../types/models';

const projectSchema = new mongoose.Schema<IProject>({
  name: { type: String, required: true },
  client: { type: String, required: true },
  location: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, required: true },
  budget: { type: Number, required: true },
  description: { type: String, required: true }
}, {
  timestamps: true
});

export const Project = mongoose.models.Project || mongoose.model<IProject>('Project', projectSchema); 