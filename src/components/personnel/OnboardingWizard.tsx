'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  Circle, 
  Upload, 
  Calendar, 
  Users, 
  BookOpen, 
  Shield,
  FileText,
  Clock,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

interface OnboardingTask {
  id: string;
  title: string;
  description: string;
  type: 'task' | 'document' | 'meeting';
  required: boolean;
  completed: boolean;
  icon: any;
}

interface OnboardingWizardProps {
  personnel: any;
  onComplete?: () => void;
  onUpdateProgress?: (progress: number) => void;
}

const OnboardingWizard = ({ personnel, onComplete, onUpdateProgress }: OnboardingWizardProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [tasks, setTasks] = useState<OnboardingTask[]>([
    {
      id: 'setup-workspace',
      title: 'Set up your workspace',
      description: 'Configure your development environment and tools',
      type: 'task',
      required: true,
      completed: personnel?.onboarding?.tasksCompleted?.includes('setup-workspace') || false,
      icon: BookOpen
    },
    {
      id: 'security-training',
      title: 'Complete security training',
      description: 'Watch security videos and complete the quiz',
      type: 'task',
      required: true,
      completed: personnel?.onboarding?.tasksCompleted?.includes('security-training') || false,
      icon: Shield
    },
    {
      id: 'meet-team',
      title: 'Meet your team',
      description: 'Introduction meetings with team members',
      type: 'meeting',
      required: true,
      completed: personnel?.onboarding?.tasksCompleted?.includes('meet-team') || false,
      icon: Users
    },
    {
      id: 'id-verification',
      title: 'Upload ID verification',
      description: 'Upload government-issued ID for verification',
      type: 'document',
      required: true,
      completed: personnel?.onboarding?.documentsUploaded?.includes('id-verification') || false,
      icon: FileText
    },
    {
      id: 'tax-forms',
      title: 'Submit tax forms',
      description: 'Complete and submit required tax documentation',
      type: 'document',
      required: true,
      completed: personnel?.onboarding?.documentsUploaded?.includes('tax-forms') || false,
      icon: FileText
    },
    {
      id: 'company-handbook',
      title: 'Review company handbook',
      description: 'Read through company policies and procedures',
      type: 'task',
      required: false,
      completed: personnel?.onboarding?.tasksCompleted?.includes('company-handbook') || false,
      icon: BookOpen
    }
  ]);

  const steps = [
    { title: 'Welcome', description: 'Getting started' },
    { title: 'Tasks', description: 'Complete required tasks' },
    { title: 'Documents', description: 'Upload required documents' },
    { title: 'Meetings', description: 'Schedule team meetings' },
    { title: 'Complete', description: 'Onboarding finished' }
  ];

  const completedTasks = tasks.filter(task => task.completed);
  const progress = Math.round((completedTasks.length / tasks.length) * 100);

  useEffect(() => {
    onUpdateProgress?.(progress);
  }, [progress, onUpdateProgress]);

  const handleTaskToggle = async (taskId: string) => {
    const updatedTasks = tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);

    // In a real app, you'd update the backend here
    try {
      await fetch('/api/personnel/onboarding', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId,
          completed: !tasks.find(t => t.id === taskId)?.completed
        })
      });
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleFileUpload = async (taskId: string, file: File) => {
    // In a real app, you'd upload to S3 here
    console.log('Uploading file:', file.name, 'for task:', taskId);
    
    // Simulate upload and mark as completed
    handleTaskToggle(taskId);
  };

  const WelcomeStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center space-y-6"
    >
      <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto">
        <Users className="w-12 h-12 text-white" />
      </div>
      <div>
        <h2 className="text-3xl font-bold text-white mb-4">
          Welcome to the team, {personnel?.name}! 🎉
        </h2>
        <p className="text-slate-300 text-lg max-w-2xl mx-auto">
          We're excited to have you join us as a {personnel?.role} in the {personnel?.department} department. 
          This onboarding process will help you get started and ensure you have everything you need to succeed.
        </p>
      </div>
      
      <div className="bg-slate-800/50 rounded-xl p-6 max-w-md mx-auto">
        <h3 className="text-lg font-semibold text-white mb-3">Your Progress</h3>
        <div className="flex items-center space-x-3">
          <div className="flex-1 bg-slate-700 rounded-full h-3">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-white font-medium">{progress}%</span>
        </div>
        <p className="text-slate-400 text-sm mt-2">
          {completedTasks.length} of {tasks.length} tasks completed
        </p>
      </div>
    </motion.div>
  );

  const TasksStep = () => {
    const taskTypeItems = tasks.filter(task => task.type === 'task');
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Complete Your Tasks</h2>
          <p className="text-slate-300">Check off these important tasks to get started</p>
        </div>
        
        <div className="space-y-4">
          {taskTypeItems.map((task) => (
            <motion.div
              key={task.id}
              whileHover={{ scale: 1.02 }}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                task.completed 
                  ? 'bg-green-600/20 border-green-600/50' 
                  : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600/50'
              }`}
              onClick={() => handleTaskToggle(task.id)}
            >
              <div className="flex items-center space-x-4">
                <div className={`flex-shrink-0 ${task.completed ? 'text-green-400' : 'text-slate-400'}`}>
                  {task.completed ? <CheckCircle className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <task.icon className="w-5 h-5 text-blue-400" />
                    <h3 className={`font-medium ${task.completed ? 'text-green-300' : 'text-white'}`}>
                      {task.title}
                    </h3>
                    {task.required && (
                      <span className="text-xs bg-red-600/20 text-red-400 px-2 py-1 rounded">Required</span>
                    )}
                  </div>
                  <p className="text-slate-400 text-sm mt-1">{task.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  };

  const DocumentsStep = () => {
    const documentTasks = tasks.filter(task => task.type === 'document');
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Upload Documents</h2>
          <p className="text-slate-300">Please upload the required documents</p>
        </div>
        
        <div className="space-y-4">
          {documentTasks.map((task) => (
            <div
              key={task.id}
              className={`p-4 rounded-xl border ${
                task.completed 
                  ? 'bg-green-600/20 border-green-600/50' 
                  : 'bg-slate-800/50 border-slate-700/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`flex-shrink-0 ${task.completed ? 'text-green-400' : 'text-slate-400'}`}>
                    {task.completed ? <CheckCircle className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className={`font-medium ${task.completed ? 'text-green-300' : 'text-white'}`}>
                      {task.title}
                    </h3>
                    <p className="text-slate-400 text-sm">{task.description}</p>
                  </div>
                </div>
                
                {!task.completed && (
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(task.id, file);
                      }}
                    />
                    <div className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors">
                      <Upload className="w-4 h-4" />
                      <span className="text-sm font-medium">Upload</span>
                    </div>
                  </label>
                )}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  };

  const MeetingsStep = () => {
    const meetingTasks = tasks.filter(task => task.type === 'meeting');
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Schedule Meetings</h2>
          <p className="text-slate-300">Connect with your team and manager</p>
        </div>
        
        <div className="space-y-4">
          {meetingTasks.map((task) => (
            <div
              key={task.id}
              className={`p-4 rounded-xl border ${
                task.completed 
                  ? 'bg-green-600/20 border-green-600/50' 
                  : 'bg-slate-800/50 border-slate-700/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`flex-shrink-0 ${task.completed ? 'text-green-400' : 'text-slate-400'}`}>
                    {task.completed ? <CheckCircle className="w-6 h-6" /> : <Calendar className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className={`font-medium ${task.completed ? 'text-green-300' : 'text-white'}`}>
                      {task.title}
                    </h3>
                    <p className="text-slate-400 text-sm">{task.description}</p>
                  </div>
                </div>
                
                {!task.completed && (
                  <button
                    onClick={() => handleTaskToggle(task.id)}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
                  >
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm font-medium">Schedule</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  };

  const CompleteStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center space-y-6"
    >
      <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-12 h-12 text-white" />
      </div>
      <div>
        <h2 className="text-3xl font-bold text-white mb-4">
          Congratulations! 🎊
        </h2>
        <p className="text-slate-300 text-lg max-w-2xl mx-auto">
          You've completed your onboarding process! You're now ready to start contributing to the team. 
          Welcome aboard!
        </p>
      </div>
      
      <button
        onClick={onComplete}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-lg transition-colors"
      >
        Go to Dashboard
      </button>
    </motion.div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 0: return <WelcomeStep />;
      case 1: return <TasksStep />;
      case 2: return <DocumentsStep />;
      case 3: return <MeetingsStep />;
      case 4: return <CompleteStep />;
      default: return <WelcomeStep />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div className={`flex items-center space-x-2 ${
                  index <= currentStep ? 'text-blue-400' : 'text-slate-500'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index <= currentStep 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-700 text-slate-400'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="hidden sm:block">
                    <p className="font-medium">{step.title}</p>
                    <p className="text-xs opacity-75">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 sm:w-16 h-px mx-2 ${
                    index < currentStep ? 'bg-blue-600' : 'bg-slate-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-slate-800/30 backdrop-blur-lg rounded-2xl p-8 border border-slate-700/50 mb-8">
          {renderStep()}
        </div>

        {/* Navigation */}
        {currentStep < 4 && (
          <div className="flex justify-between">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="flex items-center space-x-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:opacity-50 text-white rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
            
            <button
              onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingWizard; 