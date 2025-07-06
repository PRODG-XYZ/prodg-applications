'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  FileText, 
  Settings, 
  BarChart3, 
  Clock, 
  Calendar,
  Building2,
  Layers,
  PlusCircle,
  Home,
  LucideIcon,
  GitBranch
} from 'lucide-react';

// Module interfaces
interface Module {
  id: string;
  name: string;
  icon: LucideIcon;
  component: React.ReactNode;
  description: string;
}

// Lazy load the module components to improve initial load performance
import dynamic from 'next/dynamic';

const ApplicationManagement = dynamic(() => 
  import('./modules/ApplicationManagement').then(mod => mod.default), 
  { loading: () => <ModuleLoadingPlaceholder /> }
);

const PersonnelManagement = dynamic(() => 
  import('./modules/PersonnelManagement').then(mod => mod.default), 
  { loading: () => <ModuleLoadingPlaceholder /> }
);

const AnalyticsDashboard = dynamic(() => 
  import('./modules/AnalyticsDashboard').then(mod => mod.default), 
  { loading: () => <ModuleLoadingPlaceholder /> }
);

const SettingsPanel = dynamic(() => 
  import('./modules/SettingsPanel').then(mod => mod.default), 
  { loading: () => <ModuleLoadingPlaceholder /> }
);

const Overview = dynamic(() => 
  import('./modules/Overview').then(mod => mod.default), 
  { loading: () => <ModuleLoadingPlaceholder /> }
);

const DepartmentManagement = dynamic(() => 
  import('./modules/DepartmentManagement').then(mod => mod.default), 
  { loading: () => <ModuleLoadingPlaceholder /> }
);

const LinearIntegrationPanel = dynamic(() => 
  import('./modules/LinearIntegrationPanel').then(mod => mod.default), 
  { loading: () => <ModuleLoadingPlaceholder /> }
);

const ProjectManagement = dynamic(() => 
  import('./modules/ProjectManagement').then(mod => mod.default), 
  { loading: () => <ModuleLoadingPlaceholder /> }
);

// Define the modules
const modules: Module[] = [
  {
    id: 'overview',
    name: 'Overview',
    icon: Home,
    component: <Overview />,
    description: 'Get a high-level view of all operations'
  },
  {
    id: 'applications',
    name: 'Applications',
    icon: FileText,
    component: <ApplicationManagement />,
    description: 'Manage candidate applications'
  },
  {
    id: 'personnel',
    name: 'Personnel',
    icon: Users,
    component: <PersonnelManagement />,
    description: 'Manage team members and roles'
  },
  {
    id: 'departments',
    name: 'Departments',
    icon: Building2,
    component: <DepartmentManagement />,
    description: 'Manage organization structure and departments'
  },
  {
    id: 'projects',
    name: 'Projects',
    icon: Layers,
    component: <ProjectManagement projects={[]} departments={[]} onCreateProject={async () => {}} onUpdateProject={async () => {}} onDeleteProject={async () => {}} />,
    description: 'Manage projects and track progress'
  },
  {
    id: 'linear',
    name: 'Linear Integration',
    icon: GitBranch,
    component: <LinearIntegrationPanel />,
    description: 'Configure Linear API integration'
  },
  {
    id: 'analytics',
    name: 'Analytics',
    icon: BarChart3,
    component: <AnalyticsDashboard />,
    description: 'View reports and insights'
  },
  {
    id: 'settings',
    name: 'Settings',
    icon: Settings,
    component: <SettingsPanel />,
    description: 'Configure system preferences'
  }
];

function ModuleLoadingPlaceholder() {
  return (
    <div className="w-full h-full min-h-[500px] flex items-center justify-center bg-slate-800/50 rounded-xl border border-slate-700/50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-slate-600 border-t-slate-300 rounded-full animate-spin" />
        <p className="text-slate-400">Loading module...</p>
      </div>
    </div>
  );
}

export default function ManagementDashboard() {
  const [activeModule, setActiveModule] = useState<string>('overview');
  const [showAddModuleMenu, setShowAddModuleMenu] = useState(false);
  const [notifications, setNotifications] = useState<{[key: string]: number}>({
    applications: 3,
    personnel: 1,
    analytics: 0,
    settings: 0,
    overview: 0,
    projects: 0,
    linear: 0
  });

  // Get the active module component
  const activeModuleData = modules.find(m => m.id === activeModule);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white pt-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:w-64 bg-slate-800/30 backdrop-blur-md rounded-xl border border-slate-700/50 p-4 h-fit lg:sticky lg:top-24"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Management</h2>
            </div>
            
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="space-y-1">
                {modules.map((module) => (
                  <Button
                    key={module.id}
                    variant="ghost"
                    className={`w-full justify-start text-left relative ${
                      activeModule === module.id 
                        ? 'bg-slate-700/50 text-white' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-700/30'
                    }`}
                    onClick={() => setActiveModule(module.id)}
                  >
                    <module.icon className="mr-3 h-5 w-5" />
                    <span>{module.name}</span>
                    {notifications[module.id] > 0 && (
                      <Badge variant="destructive" className="ml-auto px-1.5 min-w-5 h-5 flex items-center justify-center">
                        {notifications[module.id]}
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
              
              <Separator className="my-4 bg-slate-700/50" />
              
              <Button 
                variant="ghost" 
                className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-700/30"
                onClick={() => setShowAddModuleMenu(!showAddModuleMenu)}
              >
                <PlusCircle className="mr-3 h-5 w-5" />
                <span>Add Module</span>
              </Button>
              
              {showAddModuleMenu && (
                <div className="mt-2 ml-8 space-y-1">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-700/30"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>Calendar</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-700/30"
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    <span>Time Tracking</span>
                  </Button>
                </div>
              )}
            </ScrollArea>
          </motion.div>
          
          {/* Main Content */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex-1"
          >
            {/* Module Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  {activeModuleData && (
                    <>
                      <activeModuleData.icon className="h-8 w-8" />
                      {activeModuleData.name}
                    </>
                  )}
                </h1>
              </div>
              {activeModuleData && (
                <p className="text-slate-400 mt-1">{activeModuleData.description}</p>
              )}
            </div>
            
            {/* Module Content */}
            <div className="bg-slate-800/30 backdrop-blur-md rounded-xl border border-slate-700/50 p-6">
              {activeModuleData?.component}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 