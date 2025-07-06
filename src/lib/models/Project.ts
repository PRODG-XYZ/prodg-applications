import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  _id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  departmentId: string;
  teamLeadId?: string;
  members: string[]; // Personnel IDs
  startDate: Date;
  endDate?: Date;
  budget?: number;
  progress: number; // 0-100
  tags: string[];
  
  // Linear Integration
  linearProjectId?: string;
  linearTeamId?: string;
  linearCycleIds: string[];
  syncEnabled: boolean;
  lastSyncedAt?: Date;
  syncStatus: 'synced' | 'pending_sync' | 'sync_failed' | 'not_synced';
  lastSyncError?: string;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastModifiedBy: string;
}

const ProjectSchema = new Schema<IProject>({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['planning', 'active', 'on_hold', 'completed', 'cancelled'],
    default: 'planning'
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  departmentId: { type: String, required: true },
  teamLeadId: { type: String },
  members: [{ type: String }],
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  budget: { type: Number, min: 0 },
  progress: { type: Number, min: 0, max: 100, default: 0 },
  tags: [{ type: String, trim: true }],
  
  // Linear Integration
  linearProjectId: { type: String, sparse: true, unique: true },
  linearTeamId: { type: String },
  linearCycleIds: [{ type: String }],
  syncEnabled: { type: Boolean, default: false },
  lastSyncedAt: { type: Date },
  syncStatus: { 
    type: String, 
    enum: ['synced', 'pending_sync', 'sync_failed', 'not_synced'],
    default: 'not_synced'
  },
  lastSyncError: { type: String },
  
  // Metadata
  createdBy: { type: String, required: true },
  lastModifiedBy: { type: String, required: true },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
ProjectSchema.index({ departmentId: 1 });
ProjectSchema.index({ status: 1 });
ProjectSchema.index({ linearProjectId: 1 });
ProjectSchema.index({ syncStatus: 1 });
ProjectSchema.index({ createdAt: -1 });

// Virtual for team lead
ProjectSchema.virtual('teamLead', {
  ref: 'Personnel',
  localField: 'teamLeadId',
  foreignField: '_id',
  justOne: true
});

// Virtual for department
ProjectSchema.virtual('department', {
  ref: 'Department',
  localField: 'departmentId',
  foreignField: '_id',
  justOne: true
});

export default mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema); 