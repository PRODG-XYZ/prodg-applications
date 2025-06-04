interface IDepartment {
  _id: string;
  name: string;
  description: string;
  head: string; // Personnel ID
  budget: number;
  personnelCount: number;
  projects: string[]; // Project IDs
  goals: {
    title: string;
    description: string;
    deadline: Date;
    status: 'not_started' | 'in_progress' | 'completed';
    assignedTo: string[];
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export type { IDepartment };

// Placeholder for Mongoose schema if using MongoDB
// import mongoose, { Schema, Document } from 'mongoose';

// export interface IDepartmentDocument extends IDepartment, Document {}

// const DepartmentSchema: Schema = new Schema({
//   name: { type: String, required: true },
//   description: { type: String, required: true },
//   head: { type: Schema.Types.ObjectId, ref: 'Personnel', required: true }, // Assuming 'Personnel' model exists
//   budget: { type: Number, required: true },
//   personnelCount: { type: Number, default: 0 },
//   projects: [{ type: Schema.Types.ObjectId, ref: 'Project' }], // Assuming 'Project' model exists
//   goals: [{
//     title: { type: String, required: true },
//     description: { type: String },
//     deadline: { type: Date },
//     status: { type: String, enum: ['not_started', 'in_progress', 'completed'], default: 'not_started' },
//     assignedTo: [{ type: Schema.Types.ObjectId, ref: 'Personnel' }]
//   }],
//   createdAt: { type: Date, default: Date.now },
//   updatedAt: { type: Date, default: Date.now },
// });

// DepartmentSchema.pre('save', function(next) {
//   this.updatedAt = new Date();
//   next();
// });

// export default mongoose.models.Department || mongoose.model<IDepartmentDocument>('Department', DepartmentSchema); 

// Mongoose schema definition (MongoDB with Mongoose ODM)
/*
import mongoose, { Schema, Document } from 'mongoose';
// Assuming IPersonnel or a similar type/model exists for referencing personnel
// import { IPersonnel } from './Personnel'; // or './Admin' if IAdmin is used for personnel

export interface IDepartmentDocument extends IDepartment, Document {}

const GoalSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  deadline: { type: Date },
  status: { 
    type: String, 
    enum: ['not_started', 'in_progress', 'completed'], 
    default: 'not_started' 
  },
  assignedTo: [{ type: Schema.Types.ObjectId, ref: 'Personnel' }] // Refers to Personnel/Admin model
}, { _id: false });

const DepartmentSchema: Schema = new Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String },
  head: { type: Schema.Types.ObjectId, ref: 'Personnel', required: true }, // Refers to Personnel/Admin model
  budget: { type: Number, required: true, default: 0 },
  personnelCount: { type: Number, default: 0 }, // This might be a derived field in practice
  projects: [{ type: Schema.Types.ObjectId, ref: 'Project' }], // Assuming a 'Project' model exists
  goals: [GoalSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

DepartmentSchema.pre<IDepartmentDocument>('save', function(next) {
  // Update personnelCount before saving if it's managed this way
  // if (this.isModified('personnel')) { // Assuming a direct personnel array
  //   this.personnelCount = this.personnel.length;
  // }
  this.updatedAt = new Date();
  next();
});

// Virtual for personnelCount if it's derived from a separate Personnel collection
// DepartmentSchema.virtual('actualPersonnelCount', {
//   ref: 'Personnel', // The model to use
//   localField: '_id', // Find personnel where `localField`
//   foreignField: 'department', // is equal to `foreignField`
//   count: true // And only get the count
// });

export default mongoose.models.Department || mongoose.model<IDepartmentDocument>('Department', DepartmentSchema);
*/ 