import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
  _id: string;
  title: string;
  description: string;
  status: 'backlog' | 'todo' | 'in_progress' | 'in_review' | 'done' | 'cancelled';
  priority: 'none' | 'low' | 'medium' | 'high' | 'urgent';
  projectId?: string;
  assignedTo?: string; // Personnel ID
  reporterId: string; // Personnel ID
  estimatedHours?: number;
  actualHours?: number;
  dueDate?: Date;
  completedAt?: Date;
  tags: string[];
  attachments: string[];
  
  // Linear Integration
  linearIssueId?: string;
  linearIssueKey?: string; // e.g., "ENG-123"
  linearProjectId?: string;
  linearStateId?: string;
  syncEnabled: boolean;
  lastSyncedAt?: Date;
  syncStatus: 'synced' | 'pending_sync' | 'sync_failed' | 'not_synced';
  lastSyncError?: string;
  
  // Task Dependencies
  dependencies: string[]; // Task IDs this task depends on
  blockedBy: string[]; // Task IDs that block this task
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastModifiedBy: string;
}

const TaskSchema = new Schema<ITask>({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  status: {
    type: String,
    enum: ['backlog', 'todo', 'in_progress', 'in_review', 'done', 'cancelled'],
    default: 'backlog'
  },
  priority: {
    type: String,
    enum: ['none', 'low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  projectId: { type: String },
  assignedTo: { type: String },
  reporterId: { type: String, required: true },
  estimatedHours: { type: Number, min: 0 },
  actualHours: { type: Number, min: 0, default: 0 },
  dueDate: { type: Date },
  completedAt: { type: Date },
  tags: [{ type: String, trim: true }],
  attachments: [{ type: String }],
  
  // Linear Integration
  linearIssueId: { type: String, sparse: true, unique: true },
  linearIssueKey: { type: String, sparse: true, unique: true },
  linearProjectId: { type: String },
  linearStateId: { type: String },
  syncEnabled: { type: Boolean, default: false },
  lastSyncedAt: { type: Date },
  syncStatus: {
    type: String,
    enum: ['synced', 'pending_sync', 'sync_failed', 'not_synced'],
    default: 'not_synced'
  },
  lastSyncError: { type: String },
  
  // Task Dependencies
  dependencies: [{ type: String }],
  blockedBy: [{ type: String }],
  
  // Metadata
  createdBy: { type: String, required: true },
  lastModifiedBy: { type: String, required: true },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
TaskSchema.index({ projectId: 1 });
TaskSchema.index({ assignedTo: 1 });
TaskSchema.index({ status: 1 });
TaskSchema.index({ priority: 1 });
TaskSchema.index({ linearIssueId: 1 });
TaskSchema.index({ syncStatus: 1 });
TaskSchema.index({ dueDate: 1 });
TaskSchema.index({ createdAt: -1 });

// Virtual for assignee
TaskSchema.virtual('assignee', {
  ref: 'Personnel',
  localField: 'assignedTo',
  foreignField: '_id',
  justOne: true
});

// Virtual for reporter
TaskSchema.virtual('reporter', {
  ref: 'Personnel',
  localField: 'reporterId',
  foreignField: '_id',
  justOne: true
});

// Virtual for project
TaskSchema.virtual('project', {
  ref: 'Project',
  localField: 'projectId',
  foreignField: '_id',
  justOne: true
});

// Pre-save middleware to set completedAt
TaskSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'done' && !this.completedAt) {
      this.completedAt = new Date();
    } else if (this.status !== 'done') {
      this.completedAt = undefined;
    }
  }
  next();
});

export default mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema); 