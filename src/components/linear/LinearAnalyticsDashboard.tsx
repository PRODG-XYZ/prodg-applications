'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RefreshCw, TrendingUp, TrendingDown, AlertCircle, CheckCircle, Clock, Users } from 'lucide-react';

interface AnalyticsData {
  overview: {
    totalProjects: number;
    connectedProjects: number;
    totalTasks: number;
    syncedTasks: number;
    syncSuccessRate: number;
    connectionRate: number;
  };
  projectMetrics: {
    statusDistribution: { [key: string]: number };
    priorityDistribution: { [key: string]: number };
    syncStatusDistribution: { [key: string]: number };
    averageProgress: number;
    projectsWithLinear: number;
  };
  taskMetrics: {
    statusDistribution: { [key: string]: number };
    priorityDistribution: { [key: string]: number };
    assignmentDistribution: { assigned: number; unassigned: number };
    completionRate: number;
    totalAssigned: number;
    totalCompleted: number;
  };
  syncMetrics: {
    syncFrequency: { successful: number; failed: number; pending: number; notSynced: number; total: number };
    recentErrors: { projectId: string; error: string; timestamp: string }[];
    syncHealth: number;
  };
  timeSeriesData: {
    projectCreation: { date: string; count: number }[];
    taskCompletion: { date: string; count: number }[];
    syncActivity: { date: string; syncs: number }[];
  };
  timeRange: string;
  generatedAt: string;
}

const LinearAnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');

  const fetchAnalytics = async (range: string = timeRange) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/analytics/linear?timeRange=${range}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      
      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleTimeRangeChange = (newRange: string) => {
    setTimeRange(newRange);
    fetchAnalytics(newRange);
  };

  const handleRefresh = () => {
    fetchAnalytics();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-500" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-700 mb-2">Error Loading Analytics</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return null;
  }

  const getStatusColor = (status: string): string => {
    const colors: { [key: string]: string } = {
      'active': 'bg-green-500',
      'planning': 'bg-blue-500',
      'on_hold': 'bg-yellow-500',
      'completed': 'bg-emerald-500',
      'cancelled': 'bg-red-500',
      'todo': 'bg-gray-500',
      'in_progress': 'bg-blue-500',
      'in_review': 'bg-orange-500',
      'done': 'bg-green-500',
      'backlog': 'bg-gray-400',
      'synced': 'bg-green-500',
      'sync_failed': 'bg-red-500',
      'pending_sync': 'bg-yellow-500',
      'not_synced': 'bg-gray-400',
    };
    return colors[status] || 'bg-gray-400';
  };

  const getPriorityColor = (priority: string): string => {
    const colors: { [key: string]: string } = {
      'urgent': 'bg-red-500',
      'high': 'bg-orange-500',
      'medium': 'bg-yellow-500',
      'low': 'bg-green-500',
      'none': 'bg-gray-400',
    };
    return colors[priority] || 'bg-gray-400';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Linear Analytics</h1>
          <p className="text-gray-600 mt-1">
            Insights and metrics for Linear integration
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Projects</p>
                <p className="text-3xl font-bold text-gray-900">
                  {analytics.overview.totalProjects}
                </p>
                <p className="text-sm text-gray-500">
                  {analytics.overview.connectedProjects} connected to Linear
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm">
                <span>Connection Rate</span>
                <span className="font-medium">{analytics.overview.connectionRate}%</span>
              </div>
              <Progress value={analytics.overview.connectionRate} className="mt-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                <p className="text-3xl font-bold text-gray-900">
                  {analytics.overview.totalTasks}
                </p>
                <p className="text-sm text-gray-500">
                  {analytics.overview.syncedTasks} synced
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm">
                <span>Sync Success Rate</span>
                <span className="font-medium">{analytics.overview.syncSuccessRate}%</span>
              </div>
              <Progress value={analytics.overview.syncSuccessRate} className="mt-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sync Health</p>
                <p className="text-3xl font-bold text-gray-900">
                  {analytics.syncMetrics.syncHealth}%
                </p>
                <p className="text-sm text-gray-500">
                  {analytics.syncMetrics.syncFrequency.successful} successful syncs
                </p>
              </div>
              <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                analytics.syncMetrics.syncHealth > 90 ? 'bg-green-100' : 
                analytics.syncMetrics.syncHealth > 70 ? 'bg-yellow-100' : 'bg-red-100'
              }`}>
                <TrendingUp className={`h-6 w-6 ${
                  analytics.syncMetrics.syncHealth > 90 ? 'text-green-600' : 
                  analytics.syncMetrics.syncHealth > 70 ? 'text-yellow-600' : 'text-red-600'
                }`} />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm">
                <span>Failed Syncs</span>
                <span className="font-medium text-red-600">
                  {analytics.syncMetrics.syncFrequency.failed}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Task Completion</p>
                <p className="text-3xl font-bold text-gray-900">
                  {analytics.taskMetrics.completionRate}%
                </p>
                <p className="text-sm text-gray-500">
                  {analytics.taskMetrics.totalCompleted} completed tasks
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm">
                <span>Assigned Tasks</span>
                <span className="font-medium">{analytics.taskMetrics.totalAssigned}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="sync">Sync Status</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Status Distribution</CardTitle>
                <CardDescription>Breakdown of project statuses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(analytics.projectMetrics.statusDistribution).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`} />
                        <span className="text-sm capitalize">{status.replace('_', ' ')}</span>
                      </div>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Task Priority Distribution</CardTitle>
                <CardDescription>Tasks by priority level</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(analytics.taskMetrics.priorityDistribution).map(([priority, count]) => (
                    <div key={priority} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${getPriorityColor(priority)}`} />
                        <span className="text-sm capitalize">{priority}</span>
                      </div>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Progress</CardTitle>
                <CardDescription>Average project completion</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {analytics.projectMetrics.averageProgress}%
                  </div>
                  <Progress value={analytics.projectMetrics.averageProgress} className="mb-4" />
                  <p className="text-sm text-gray-600">
                    {analytics.projectMetrics.projectsWithLinear} projects connected to Linear
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Project Sync Status</CardTitle>
                <CardDescription>Synchronization status breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(analytics.projectMetrics.syncStatusDistribution).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`} />
                        <span className="text-sm capitalize">{status.replace('_', ' ')}</span>
                      </div>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Task Status Distribution</CardTitle>
                <CardDescription>Current task workflow stages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(analytics.taskMetrics.statusDistribution).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`} />
                        <span className="text-sm capitalize">{status.replace('_', ' ')}</span>
                      </div>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Task Assignment</CardTitle>
                <CardDescription>Assigned vs unassigned tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Assigned</span>
                    <Badge className="bg-green-100 text-green-800">
                      {analytics.taskMetrics.assignmentDistribution.assigned}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Unassigned</span>
                    <Badge className="bg-orange-100 text-orange-800">
                      {analytics.taskMetrics.assignmentDistribution.unassigned}
                    </Badge>
                  </div>
                  <div className="pt-2">
                    <div className="text-sm text-gray-600 mb-2">Assignment Rate</div>
                    <Progress 
                      value={
                        (analytics.taskMetrics.assignmentDistribution.assigned / 
                        (analytics.taskMetrics.assignmentDistribution.assigned + 
                         analytics.taskMetrics.assignmentDistribution.unassigned)) * 100
                      } 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sync" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sync Performance</CardTitle>
                <CardDescription>Synchronization success metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Successful</span>
                    <Badge className="bg-green-100 text-green-800">
                      {analytics.syncMetrics.syncFrequency.successful}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Failed</span>
                    <Badge className="bg-red-100 text-red-800">
                      {analytics.syncMetrics.syncFrequency.failed}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Pending</span>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      {analytics.syncMetrics.syncFrequency.pending}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Not Synced</span>
                    <Badge className="bg-gray-100 text-gray-800">
                      {analytics.syncMetrics.syncFrequency.notSynced}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Sync Errors</CardTitle>
                <CardDescription>Latest synchronization failures</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics.syncMetrics.recentErrors.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.syncMetrics.recentErrors.slice(0, 5).map((error, index) => (
                      <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="text-sm font-medium text-red-800 mb-1">
                          Project: {error.projectId.slice(-8)}
                        </div>
                        <div className="text-xs text-red-600">
                          {error.error}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(error.timestamp).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">No recent sync errors</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500">
        Last updated: {new Date(analytics.generatedAt).toLocaleString()}
      </div>
    </div>
  );
};

export default LinearAnalyticsDashboard; 