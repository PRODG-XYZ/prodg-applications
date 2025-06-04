import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  _id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  startDate: Date;
  endDate?: Date;
  estimatedHours: number;
  actualHours: number;
  budget?: number;
  team: {
    lead: string; // Personnel ID
    members: string[]; // Array of Personnel IDs
    stakeholders: string[];
  };
  tasks: string[]; // Array of Task IDs
  documents: string[]; // S3 URLs
  tags: string[];
  client?: string;
  repository?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['planning', 'active', 'on_hold', 'completed', 'cancelled'],
    default: 'planning'
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  estimatedHours: { type: Number, default: 0 },
  actualHours: { type: Number, default: 0 },
  budget: { type: Number },
  team: {
    lead: { type: String, required: true },
    members: [{ type: String }],
    stakeholders: [{ type: String }]
  },
  tasks: [{ type: String }],
  documents: [{ type: String }],
  tags: [{ type: String }],
  client: { type: String },
  repository: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for performance
ProjectSchema.index({ 'team.members': 1, status: 1 });
ProjectSchema.index({ 'team.lead': 1 });
ProjectSchema.index({ status: 1, priority: 1 });

export default mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema); 