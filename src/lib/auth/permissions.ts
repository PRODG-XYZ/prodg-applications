import type { AdminPermissions } from '../models/Admin';

export type AdminRole = 'super_admin' | 'hr_admin' | 'manager' | 'team_lead';

export const adminRolePermissions: Record<AdminRole, AdminPermissions> = {
  super_admin: {
    canManagePersonnel: true,
    canCreateProjects: true,
    canViewAllProjects: true,
    canManageRoles: true,
    canViewAnalytics: true,
    canExportData: true,
    canManageOnboarding: true,
    canApproveTimeoff: true,
    canConductReviews: true
  },
  hr_admin: {
    canManagePersonnel: true,
    canCreateProjects: false,
    canViewAllProjects: true,
    canManageRoles: false,
    canViewAnalytics: true,
    canExportData: true,
    canManageOnboarding: true,
    canApproveTimeoff: true,
    canConductReviews: true
  },
  manager: {
    canManagePersonnel: false, // PRD Note: Only their department
    canCreateProjects: true,
    canViewAllProjects: false, // PRD Note: Only their projects
    canManageRoles: false,
    canViewAnalytics: true, // PRD Note: Limited scope
    canExportData: false,
    canManageOnboarding: false,
    canApproveTimeoff: true, // PRD Note: Their team only
    canConductReviews: true // PRD Note: Their team only
  },
  team_lead: {
    canManagePersonnel: false,
    canCreateProjects: false,
    canViewAllProjects: false,
    canManageRoles: false,
    canViewAnalytics: false,
    canExportData: false,
    canManageOnboarding: false,
    canApproveTimeoff: false,
    canConductReviews: false
  }
};

/**
 * Gets the permissions for a given admin role.
 * @param role The role of the admin.
 * @returns The permissions object for the role, or undefined if the role doesn't exist.
 */
export const getPermissionsForRole = (role: AdminRole): AdminPermissions | undefined => {
  return adminRolePermissions[role];
};

/**
 * Checks if an admin with a given role has a specific permission.
 * This is a basic check; actual implementation might involve checking against the admin's specific permissions object.
 * @param role The role of the admin.
 * @param permissionKey The key of the permission to check.
 * @returns True if the role has the permission, false otherwise.
 */
export const hasPermission = (role: AdminRole, permissionKey: keyof AdminPermissions): boolean => {
  const permissions = adminRolePermissions[role];
  if (permissions) {
    return permissions[permissionKey];
  }
  return false;
}; 