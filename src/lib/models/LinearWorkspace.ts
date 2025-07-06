import mongoose, { Schema, Document } from 'mongoose';

export interface ILinearWorkspace extends Document {
  _id: string;
  name?: string;
  linearId?: string;
  teams: string[]; // References to ILinearTeam
  integrationStatus: 'active' | 'paused' | 'disconnected';
  accessToken: string;
  refreshToken: string;
  tokenType?: string;
  expiresIn?: number;
  scope?: string;
  tokenExpiresAt?: Date;
  isConnected: boolean;
  lastConnectedAt?: Date;
  lastSyncedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const LinearWorkspaceSchema = new Schema<ILinearWorkspace>({
  name: { type: String },
  linearId: { type: String, unique: true, sparse: true },
  teams: [{ type: String, ref: 'LinearTeam' }],
  integrationStatus: { 
    type: String, 
    enum: ['active', 'paused', 'disconnected'], 
    default: 'active' 
  },
  accessToken: { type: String, required: true },
  refreshToken: { type: String, required: true },
  tokenType: { type: String },
  expiresIn: { type: Number },
  scope: { type: String },
  tokenExpiresAt: { type: Date },
  isConnected: { type: Boolean, default: true },
  lastConnectedAt: { type: Date },
  lastSyncedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Pre-save hook to update the updatedAt timestamp
LinearWorkspaceSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.LinearWorkspace || 
  mongoose.model<ILinearWorkspace>('LinearWorkspace', LinearWorkspaceSchema); 