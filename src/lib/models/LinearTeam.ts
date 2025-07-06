import mongoose, { Schema, Document } from 'mongoose';

export interface ILinearTeam extends Document {
  _id: string;
  name: string;
  linearId: string;
  workspaceId: string; // Reference to ILinearWorkspace
  description?: string;
  key: string;
  members: {
    personnelId: string;
    linearUserId: string;
    role: 'admin' | 'member' | 'guest';
  }[];
  projects: string[]; // References to IProjectLinearMapping
  lastSyncedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const LinearTeamSchema = new Schema<ILinearTeam>({
  name: { type: String, required: true },
  linearId: { type: String, required: true, unique: true },
  workspaceId: { type: String, required: true, ref: 'LinearWorkspace' },
  description: { type: String },
  key: { type: String, required: true },
  members: [{
    personnelId: { type: String, required: true, ref: 'Personnel' },
    linearUserId: { type: String, required: true },
    role: { 
      type: String, 
      enum: ['admin', 'member', 'guest'], 
      default: 'member' 
    }
  }],
  projects: [{ type: String, ref: 'ProjectLinearMapping' }],
  lastSyncedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Pre-save hook to update the updatedAt timestamp
LinearTeamSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create index for faster lookups
LinearTeamSchema.index({ workspaceId: 1, linearId: 1 });
LinearTeamSchema.index({ 'members.personnelId': 1 });

export default mongoose.models.LinearTeam || 
  mongoose.model<ILinearTeam>('LinearTeam', LinearTeamSchema); 