import Application from '../models/Application';
import Analytics from '../models/Analytics';
import { connectToDatabase } from '../mongodb';

export interface AnalyticsFilters {
  startDate?: Date;
  endDate?: Date;
  status?: 'pending' | 'reviewing' | 'approved' | 'rejected';
  countries?: string[];
  skills?: string[];
}

export interface AnalyticsMetrics {
  totalApplications: number;
  pendingReviews: number;
  approvalRate: number;
  averageResponseTime: number;
  periodChange: {
    totalApplications: number;
    pendingReviews: number;
    approvalRate: number;
  };
}

export async function getAnalyticsMetrics(filters: AnalyticsFilters = {}): Promise<AnalyticsMetrics> {
  await connectToDatabase();

  const { startDate, endDate, status, countries, skills } = filters;
  
  // Build match query
  const matchQuery: any = {};
  if (startDate && endDate) {
    matchQuery.createdAt = { $gte: startDate, $lte: endDate };
  }
  if (status) {
    matchQuery.status = status;
  }
  if (countries && countries.length > 0) {
    matchQuery.country = { $in: countries };
  }
  if (skills && skills.length > 0) {
    matchQuery.skills = { $in: skills };
  }

  // Get current period metrics
  const totalApplications = await Application.countDocuments(matchQuery);
  const pendingReviews = await Application.countDocuments({ ...matchQuery, status: 'pending' });
  
  // Calculate approval rate
  const approvedApplications = await Application.countDocuments({ ...matchQuery, status: 'approved' });
  const rejectedApplications = await Application.countDocuments({ ...matchQuery, status: 'rejected' });
  const reviewedTotal = approvedApplications + rejectedApplications;
  const approvalRate = reviewedTotal > 0 ? (approvedApplications / reviewedTotal) * 100 : 0;

  // Calculate average response time
  const reviewedApps = await Application.find({
    ...matchQuery,
    status: { $in: ['approved', 'rejected'] },
    timeToReview: { $exists: true }
  }).select('timeToReview');
  
  const averageResponseTime = reviewedApps.length > 0 
    ? reviewedApps.reduce((sum, app) => sum + (app.timeToReview || 0), 0) / reviewedApps.length
    : 0;

  // Calculate period-over-period changes (previous period)
  let periodChange = { totalApplications: 0, pendingReviews: 0, approvalRate: 0 };
  
  if (startDate && endDate) {
    const periodLength = endDate.getTime() - startDate.getTime();
    const previousStartDate = new Date(startDate.getTime() - periodLength);
    const previousEndDate = new Date(startDate);
    
    const previousMatchQuery = {
      ...matchQuery,
      createdAt: { $gte: previousStartDate, $lte: previousEndDate }
    };
    
    const previousTotalApplications = await Application.countDocuments(previousMatchQuery);
    const previousPendingReviews = await Application.countDocuments({ ...previousMatchQuery, status: 'pending' });
    
    const previousApproved = await Application.countDocuments({ ...previousMatchQuery, status: 'approved' });
    const previousRejected = await Application.countDocuments({ ...previousMatchQuery, status: 'rejected' });
    const previousReviewedTotal = previousApproved + previousRejected;
    const previousApprovalRate = previousReviewedTotal > 0 ? (previousApproved / previousReviewedTotal) * 100 : 0;
    
    periodChange = {
      totalApplications: previousTotalApplications > 0 ? ((totalApplications - previousTotalApplications) / previousTotalApplications) * 100 : 0,
      pendingReviews: previousPendingReviews > 0 ? ((pendingReviews - previousPendingReviews) / previousPendingReviews) * 100 : 0,
      approvalRate: previousApprovalRate > 0 ? approvalRate - previousApprovalRate : 0,
    };
  }

  return {
    totalApplications,
    pendingReviews,
    approvalRate,
    averageResponseTime,
    periodChange,
  };
}

export async function getApplicationTrends(filters: AnalyticsFilters = {}) {
  await connectToDatabase();

  const { startDate, endDate, status, countries, skills } = filters;
  
  const matchQuery: any = {};
  if (startDate && endDate) {
    matchQuery.createdAt = { $gte: startDate, $lte: endDate };
  }
  if (status) {
    matchQuery.status = status;
  }
  if (countries && countries.length > 0) {
    matchQuery.country = { $in: countries };
  }
  if (skills && skills.length > 0) {
    matchQuery.skills = { $in: skills };
  }

  const trends = await Application.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 },
        statuses: { $push: "$status" }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  return trends;
}

export async function getStatusDistribution(filters: AnalyticsFilters = {}) {
  await connectToDatabase();

  const { startDate, endDate, countries, skills } = filters;
  
  const matchQuery: any = {};
  if (startDate && endDate) {
    matchQuery.createdAt = { $gte: startDate, $lte: endDate };
  }
  if (countries && countries.length > 0) {
    matchQuery.country = { $in: countries };
  }
  if (skills && skills.length > 0) {
    matchQuery.skills = { $in: skills };
  }

  const distribution = await Application.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 }
      }
    }
  ]);

  return distribution;
}

export async function getGeographicDistribution(filters: AnalyticsFilters = {}) {
  await connectToDatabase();

  const { startDate, endDate, status, skills } = filters;
  
  const matchQuery: any = {};
  if (startDate && endDate) {
    matchQuery.createdAt = { $gte: startDate, $lte: endDate };
  }
  if (status) {
    matchQuery.status = status;
  }
  if (skills && skills.length > 0) {
    matchQuery.skills = { $in: skills };
  }

  const distribution = await Application.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: "$country",
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  return distribution;
}

export async function getSkillsAnalysis(filters: AnalyticsFilters = {}) {
  await connectToDatabase();

  const { startDate, endDate, status, countries } = filters;
  
  const matchQuery: any = {};
  if (startDate && endDate) {
    matchQuery.createdAt = { $gte: startDate, $lte: endDate };
  }
  if (status) {
    matchQuery.status = status;
  }
  if (countries && countries.length > 0) {
    matchQuery.country = { $in: countries };
  }

  const skillsAnalysis = await Application.aggregate([
    { $match: matchQuery },
    { $unwind: "$skills" },
    {
      $group: {
        _id: "$skills",
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 15 }
  ]);

  return skillsAnalysis;
} 