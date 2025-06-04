interface AdminPermissions {
  canManagePersonnel: boolean;
  canCreateProjects: boolean;
  canViewAllProjects: boolean;
  canManageRoles: boolean;
  canViewAnalytics: boolean;
  canExportData: boolean;
  canManageOnboarding: boolean;
  canApproveTimeoff: boolean;
  canConductReviews: boolean;
}

interface IAdmin {
  _id: string;
  username: string;
  email: string;
  role: 'super_admin' | 'hr_admin' | 'manager' | 'team_lead';
  permissions: AdminPermissions;
  department?: string;
  profile: {
    firstName: string;
    lastName: string;
    avatar?: string;
    phone?: string;
  };
  managedDepartments: string[];
  managedPersonnel: string[];
  lastLoginAt: Date;
  createdAt: Date;
  updatedAt?: Date;
}

export type { IAdmin, AdminPermissions };

// Mongoose schema definition (MongoDB with Mongoose ODM)
/*
import mongoose, { Schema, Document } from 'mongoose';

export interface IAdminDocument extends IAdmin, Document {}

const AdminPermissionsSchema: Schema = new Schema({
  canManagePersonnel: { type: Boolean, default: false },
  canCreateProjects: { type: Boolean, default: false },
  canViewAllProjects: { type: Boolean, default: false },
  canManageRoles: { type: Boolean, default: false },
  canViewAnalytics: { type: Boolean, default: false },
  canExportData: { type: Boolean, default: false },
  canManageOnboarding: { type: Boolean, default: false },
  canApproveTimeoff: { type: Boolean, default: false },
  canConductReviews: { type: Boolean, default: false },
}, { _id: false });

const AdminProfileSchema: Schema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  avatar: { type: String },
  phone: { type: String },
}, { _id: false });

const AdminSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  // password: { type: String, required: true }, // Password handling should be secure (hashing)
  role: { 
    type: String, 
    enum: ['super_admin', 'hr_admin', 'manager', 'team_lead'], 
    required: true 
  },
  permissions: { type: AdminPermissionsSchema, required: true },
  department: { type: String }, // Could be Schema.Types.ObjectId if linking to a Department collection
  profile: { type: AdminProfileSchema, required: true },
  managedDepartments: [{ type: String }], // Could be [Schema.Types.ObjectId]
  managedPersonnel: [{ type: String }],   // Could be [Schema.Types.ObjectId]
  lastLoginAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

AdminSchema.pre<IAdminDocument>('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Consider adding methods or statics to the schema if needed, e.g., for password comparison.

export default mongoose.models.Admin || mongoose.model<IAdminDocument>('Admin', AdminSchema);
*/ 