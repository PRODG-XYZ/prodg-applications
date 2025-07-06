import mongoose, { Schema, Document } from 'mongoose';

export interface ITaskLinearMapping extends Document {
  _id: string;
  taskId: string; // PeopleOS task ID
  linearIssueId: string;
  linearIssueKey: string; // e.g., "ENG-123"
  syncStatus: 'synced' | 'pending_sync' | 'sync_failed';
  lastSyncedAt: Date;
  lastSyncError?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TaskLinearMappingSchema = new Schema<ITaskLinearMapping>({
  taskId: { type: String, required: true, ref: 'Task', unique: true },
  linearIssueId: { type: String, required: true, unique: true },
  linearIssueKey: { type: String, required: true },
  syncStatus: { 
    type: String, 
    enum: ['synced', 'pending_sync', 'sync_failed'], 
    default: 'synced' 
  },
  lastSyncedAt: { type: Date, default: Date.now },
  lastSyncError: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Pre-save hook to update the updatedAt timestamp
TaskLinearMappingSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create index for faster lookups
TaskLinearMappingSchema.index({ taskId: 1 });
TaskLinearMappingSchema.index({ linearIssueId: 1 });
TaskLinearMappingSchema.index({ linearIssueKey: 1 });
TaskLinearMappingSchema.index({ syncStatus: 1 });

export default mongoose.models.TaskLinearMapping || 
  mongoose.model<ITaskLinearMapping>('TaskLinearMapping', TaskLinearMappingSchema); 