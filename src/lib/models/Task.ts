import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
  _id: string;
  projectId: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'review' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee: string; // Personnel ID
  reporter: string; // Personnel ID
  estimatedHours: number;
  actualHours: number;
  dueDate?: Date;
  tags: string[];
  attachments: string[];
  comments: {
    author: string;
    message: string;
    timestamp: Date;
  }[];
  dependencies: string[]; // Array of Task IDs
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>({
  projectId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['todo', 'in_progress', 'review', 'completed', 'blocked'],
    default: 'todo'
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  assignee: { type: String, required: true },
  reporter: { type: String, required: true },
  estimatedHours: { type: Number, default: 0 },
  actualHours: { type: Number, default: 0 },
  dueDate: { type: Date },
  tags: [{ type: String }],
  attachments: [{ type: String }],
  comments: [{
    author: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }],
  dependencies: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for performance
TaskSchema.index({ assignee: 1, status: 1 });
TaskSchema.index({ projectId: 1, status: 1 });
TaskSchema.index({ status: 1, priority: 1 });

export default mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema); 