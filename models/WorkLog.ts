import mongoose from 'mongoose';
import type { IWorkLog } from '../types/models';

const workLogSchema = new mongoose.Schema<IWorkLog>({
  date: { type: Date, required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  workType: { type: String, required: true },
  description: { type: String, required: true },
  personnel: [{
    name: { type: String, required: true },
    role: { type: String, required: true },
    hours: { type: Number, required: true }
  }],
  equipment: [{
    name: { type: String, required: true },
    hours: { type: Number, required: true }
  }],
  materials: [{
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true }
  }]
}, {
  timestamps: true
});

export const WorkLog = mongoose.models.WorkLog || mongoose.model<IWorkLog>('WorkLog', workLogSchema); 