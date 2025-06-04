// Utility functions for personnel management

import { connectToDatabase } from '../mongodb';
import Personnel, { IPersonnel } from '../models/Personnel';
import { AdminPermissions } from '../models/Admin'; // Keep for permission structure

export interface PersonnelFilters {
  department?: string;
  role?: string;
  status?: string;
  search?: string;
}

/**
 * Fetches a list of personnel based on filters.
 */
export const getPersonnelList = async (filters?: PersonnelFilters): Promise<IPersonnel[]> => {
  console.log('Fetching personnel with filters:', filters);
  
  await connectToDatabase();
  
  let query: any = {};
  
  if (filters) {
    if (filters.department) {
      query.department = filters.department;
    }
    if (filters.role) {
      query.role = filters.role;
    }
    if (filters.status) {
      query.status = filters.status;
    }
    if (filters.search) {
      const searchTerm = filters.search;
      query.$or = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } },
        { employeeId: { $regex: searchTerm, $options: 'i' } }
      ];
    }
  }
  
  try {
    const personnel = await Personnel.find(query).lean().exec();
    return personnel as unknown as IPersonnel[];
  } catch (error) {
    console.error('Error fetching personnel:', error);
    throw error;
  }
};

/**
 * Fetches a single personnel entry by ID.
 */
export const getPersonnelById = async (id: string): Promise<IPersonnel | null> => {
  console.log(`Fetching personnel by ID: ${id}`);
  
  await connectToDatabase();
  
  try {
    const personnel = await Personnel.findById(id).lean().exec();
    return personnel as unknown as IPersonnel | null;
  } catch (error) {
    console.error('Error fetching personnel by ID:', error);
    throw error;
  }
};

/**
 * Adds new personnel.
 */
export const createNewPersonnel = async (personnelData: Omit<IPersonnel, '_id' | 'createdAt' | 'lastActiveAt'>) => {
  console.log('Adding new personnel:', personnelData);
  
  await connectToDatabase();
  
  try {
    const newPersonnel = new Personnel({
      ...personnelData,
      createdAt: new Date(),
      lastActiveAt: new Date()
    });
    
    const savedPersonnel = await newPersonnel.save();
    return savedPersonnel.toObject() as unknown as IPersonnel;
  } catch (error) {
    console.error('Error creating personnel:', error);
    throw error;
  }
};

/**
 * Updates existing personnel.
 */
export const updateExistingPersonnel = async (id: string, updates: Partial<IPersonnel>): Promise<IPersonnel | null> => {
  console.log(`Updating personnel ${id}:`, updates);
  
  await connectToDatabase();
  
  try {
    const updatedPersonnel = await Personnel.findByIdAndUpdate(
      id,
      { ...updates, lastActiveAt: new Date() },
      { new: true, runValidators: true }
    ).lean().exec();
    
    return updatedPersonnel as unknown as IPersonnel | null;
  } catch (error) {
    console.error('Error updating personnel:', error);
    throw error;
  }
};

/**
 * Deactivates personnel (soft delete by setting status to 'terminated').
 */
export const deleteExistingPersonnel = async (id: string): Promise<boolean> => {
  console.log(`Deactivating personnel ${id}`);
  
  await connectToDatabase();
  
  try {
    const result = await Personnel.findByIdAndUpdate(
      id,
      { status: 'terminated', lastActiveAt: new Date() },
      { new: true }
    );
    
    return !!result;
  } catch (error) {
    console.error('Error deactivating personnel:', error);
    throw error;
  }
};

/**
 * Get personnel analytics data
 */
export const getPersonnelAnalytics = async () => {
  await connectToDatabase();
  
  try {
    const [
      totalPersonnel,
      activePersonnel,
      departmentBreakdown,
      roleDistribution,
      avgTenureData
    ] = await Promise.all([
      Personnel.countDocuments(),
      Personnel.countDocuments({ status: 'active' }),
      Personnel.aggregate([
        { $group: { _id: '$department', count: { $sum: 1 } } },
        { $project: { department: '$_id', count: 1, _id: 0 } }
      ]),
      Personnel.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } },
        { $project: { role: '$_id', count: 1, _id: 0 } }
      ]),
      Personnel.aggregate([
        {
          $project: {
            tenure: {
              $divide: [
                { $subtract: [new Date(), '$startDate'] },
                1000 * 60 * 60 * 24 // Convert to days
              ]
            }
          }
        },
        {
          $group: {
            _id: null,
            avgTenure: { $avg: '$tenure' }
          }
        }
      ])
    ]);
    
    return {
      totalPersonnel,
      activePersonnel,
      departmentBreakdown,
      roleDistribution,
      averageTenure: avgTenureData[0]?.avgTenure || 0
    };
  } catch (error) {
    console.error('Error fetching personnel analytics:', error);
    throw error;
  }
};

/**
 * Updates personnel by ID.
 */
export const updatePersonnelById = async (id: string, updates: Partial<IPersonnel>): Promise<IPersonnel | null> => {
  console.log('Updating personnel:', id, updates);
  
  await connectToDatabase();
  
  try {
    const updatedPersonnel = await Personnel.findByIdAndUpdate(
      id, 
      { 
        ...updates, 
        lastActiveAt: new Date() 
      }, 
      { new: true, runValidators: true }
    ).lean().exec();
    
    return updatedPersonnel as unknown as IPersonnel;
  } catch (error) {
    console.error('Error updating personnel:', error);
    throw error;
  }
};

/**
 * Deletes personnel by ID.
 */
export const deletePersonnelById = async (id: string, hardDelete: boolean = false): Promise<boolean> => {
  console.log('Deleting personnel:', id, 'Hard delete:', hardDelete);
  
  await connectToDatabase();
  
  try {
    if (hardDelete) {
      const result = await Personnel.findByIdAndDelete(id).exec();
      return !!result;
    } else {
      // Soft delete - update status to terminated
      const result = await Personnel.findByIdAndUpdate(
        id,
        { 
          status: 'terminated',
          lastActiveAt: new Date()
        },
        { new: true }
      ).exec();
      return !!result;
    }
  } catch (error) {
    console.error('Error deleting personnel:', error);
    throw error;
  }
};

/**
 * Performs bulk actions on multiple personnel records.
 */
export const performBulkPersonnelAction = async (
  action: string,
  personnelIds: string[],
  value?: string
): Promise<{ success: number; failed: number; errors: string[] }> => {
  console.log('Performing bulk action:', action, 'on personnel:', personnelIds, 'with value:', value);
  
  await connectToDatabase();
  
  const results = {
    success: 0,
    failed: 0,
    errors: [] as string[]
  };

  try {
    for (const personnelId of personnelIds) {
      try {
        let updateData: any = {};
        
        switch (action) {
          case 'change_department':
            if (!value) throw new Error('Department value is required');
            updateData.department = value;
            break;
            
          case 'change_role':
            if (!value) throw new Error('Role value is required');
            const validRoles = ['employee', 'senior', 'lead', 'manager', 'director'];
            if (!validRoles.includes(value)) {
              throw new Error(`Invalid role: ${value}`);
            }
            updateData.role = value;
            break;
            
          case 'change_status':
            if (!value) throw new Error('Status value is required');
            const validStatuses = ['onboarding', 'active', 'on_leave', 'terminated'];
            if (!validStatuses.includes(value)) {
              throw new Error(`Invalid status: ${value}`);
            }
            updateData.status = value;
            break;
            
          default:
            throw new Error(`Unsupported bulk action: ${action}`);
        }

        // Update the personnel record
        const updatedPersonnel = await Personnel.findByIdAndUpdate(
          personnelId,
          { 
            ...updateData,
            lastActiveAt: new Date()
          },
          { new: true, runValidators: true }
        );

        if (!updatedPersonnel) {
          throw new Error(`Personnel with ID ${personnelId} not found`);
        }

        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(`${personnelId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return results;
  } catch (error) {
    console.error('Error performing bulk action:', error);
    throw error;
  }
};

/**
 * Creates a new personnel record.
 */
export const createPersonnelRecord = async (data: Partial<IPersonnel>): Promise<IPersonnel> => {
  console.log('Creating new personnel:', data);
  
  await connectToDatabase();
  
  try {
    // Validate required fields
    if (!data.name || !data.email || !data.employeeId) {
      throw new Error('Name, email, and employee ID are required');
    }

    // Check if employee ID or email already exists
    const existingPersonnel = await Personnel.findOne({
      $or: [
        { employeeId: data.employeeId },
        { email: data.email }
      ]
    });

    if (existingPersonnel) {
      if (existingPersonnel.employeeId === data.employeeId) {
        throw new Error('Employee ID already exists');
      }
      if (existingPersonnel.email === data.email) {
        throw new Error('Email already exists');
      }
    }

    // Generate applicationId if not provided
    const applicationId = data.applicationId || `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Set default values
    const personnelData = {
      ...data,
      applicationId,
      status: data.status || 'onboarding',
      role: data.role || 'employee',
      department: data.department || 'General',
      startDate: data.startDate || new Date(),
      directReports: [],
      createdAt: new Date(),
      lastActiveAt: new Date(),
      onboarding: {
        tasksCompleted: [],
        documentsUploaded: [],
        meetingsScheduled: [],
        completionPercentage: 0,
        ...data.onboarding
      },
      preferences: {
        timezone: 'America/New_York',
        notifications: {
          email: true,
          push: false,
          slack: false
        },
        ...data.preferences
      }
    };

    const newPersonnel = new Personnel(personnelData);
    const savedPersonnel = await newPersonnel.save();
    
    return savedPersonnel.toObject() as IPersonnel;
  } catch (error) {
    console.error('Error creating personnel:', error);
    throw error;
  }
};

export type { IPersonnel, AdminPermissions }; // Re-export for convenience 