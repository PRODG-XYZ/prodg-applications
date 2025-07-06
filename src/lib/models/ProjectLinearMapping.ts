import mongoose, { Schema, Document } from 'mongoose';

export interface IProjectLinearMapping extends Document {
  _id: string;
  projectId: string; // PeopleOS project ID
  linearProjectId: string;
  linearTeamId: string;
  cycleIds: string[]; // Linear cycle IDs
  syncConfig: {
    syncMilestones: boolean;
    syncComments: boolean;
    syncAttachments: boolean;
    syncStatus: boolean;
  };
  lastSyncedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectLinearMappingSchema = new Schema<IProjectLinearMapping>({
  projectId: { type: String, required: true, ref: 'Project', unique: true },
  linearProjectId: { type: String, required: true, unique: true },
  linearTeamId: { type: String, required: true, ref: 'LinearTeam' },
  cycleIds: [{ type: String }],
  syncConfig: {
    syncMilestones: { type: Boolean, default: true },
    syncComments: { type: Boolean, default: true },
    syncAttachments: { type: Boolean, default: true },
    syncStatus: { type: Boolean, default: true },
  },
  lastSyncedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Pre-save hook to update the updatedAt timestamp
ProjectLinearMappingSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create index for faster lookups
ProjectLinearMappingSchema.index({ projectId: 1 });
ProjectLinearMappingSchema.index({ linearProjectId: 1 });
ProjectLinearMappingSchema.index({ linearTeamId: 1 });

export default mongoose.models.ProjectLinearMapping || 
  mongoose.model<IProjectLinearMapping>('ProjectLinearMapping', ProjectLinearMappingSchema); 