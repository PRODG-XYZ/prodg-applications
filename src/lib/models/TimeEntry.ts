import mongoose, { Schema, Document } from 'mongoose';

export interface ITimeEntry extends Document {
  _id: string;
  personnelId: string;
  projectId: string;
  taskId?: string;
  description: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in minutes
  type: 'work' | 'meeting' | 'break' | 'training';
  isApproved: boolean;
  approvedBy?: string;
  createdAt: Date;
}

const TimeEntrySchema = new Schema<ITimeEntry>({
  personnelId: { type: String, required: true },
  projectId: { type: String, required: true },
  taskId: { type: String },
  description: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  duration: { type: Number, default: 0 }, // in minutes
  type: { 
    type: String, 
    enum: ['work', 'meeting', 'break', 'training'],
    default: 'work'
  },
  isApproved: { type: Boolean, default: false },
  approvedBy: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Indexes for performance
TimeEntrySchema.index({ personnelId: 1, createdAt: -1 });
TimeEntrySchema.index({ projectId: 1, personnelId: 1 });
TimeEntrySchema.index({ taskId: 1 });

export default mongoose.models.TimeEntry || mongoose.model<ITimeEntry>('TimeEntry', TimeEntrySchema); 