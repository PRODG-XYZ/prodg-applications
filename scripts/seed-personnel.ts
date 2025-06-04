import { connectToDatabase } from '../src/lib/mongodb';
import Personnel from '../src/lib/models/Personnel';
import Project from '../src/lib/models/Project';
import Task from '../src/lib/models/Task';
import TimeEntry from '../src/lib/models/TimeEntry';

async function seedPersonnelData() {
  try {
    await connectToDatabase();
    console.log('Connected to database');

    // Clear existing data
    await Personnel.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});
    await TimeEntry.deleteMany({});
    console.log('Cleared existing data');

    // Create sample personnel
    const personnel = await Personnel.create([
      {
        applicationId: 'app_001',
        employeeId: 'EMP001',
        email: 'john.doe@company.com',
        name: 'John Doe',
        role: 'lead',
        department: 'Engineering',
        startDate: new Date('2024-01-15'),
        status: 'active',
        profile: {
          bio: 'Senior software engineer with 8 years of experience',
          skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'MongoDB'],
          certifications: ['AWS Certified Developer', 'Scrum Master'],
          socialLinks: {
            github: 'https://github.com/johndoe',
            linkedin: 'https://linkedin.com/in/johndoe'
          }
        },
        preferences: {
          timezone: 'America/New_York',
          workingHours: { start: '09:00', end: '17:00' },
          notifications: { email: true, push: true, slack: false }
        },
        onboarding: {
          tasksCompleted: ['setup-workspace', 'meet-team', 'security-training'],
          documentsUploaded: ['id-verification', 'tax-forms'],
          meetingsScheduled: ['hr-orientation', 'team-intro'],
          completionPercentage: 85
        }
      },
      {
        applicationId: 'app_002',
        employeeId: 'EMP002',
        email: 'jane.smith@company.com',
        name: 'Jane Smith',
        role: 'senior',
        department: 'Engineering',
        startDate: new Date('2024-02-01'),
        status: 'active',
        profile: {
          bio: 'Frontend specialist with expertise in modern web technologies',
          skills: ['React', 'Vue.js', 'CSS', 'UI/UX Design', 'Figma'],
          certifications: ['Google UX Design Certificate'],
          socialLinks: {
            github: 'https://github.com/janesmith',
            portfolio: 'https://janesmith.dev'
          }
        },
        preferences: {
          timezone: 'America/Los_Angeles',
          workingHours: { start: '10:00', end: '18:00' },
          notifications: { email: true, push: false, slack: true }
        },
        onboarding: {
          tasksCompleted: ['setup-workspace', 'meet-team'],
          documentsUploaded: ['id-verification'],
          meetingsScheduled: ['hr-orientation'],
          completionPercentage: 60
        }
      },
      {
        applicationId: 'app_003',
        employeeId: 'EMP003',
        email: 'mike.johnson@company.com',
        name: 'Mike Johnson',
        role: 'employee',
        department: 'Engineering',
        startDate: new Date('2024-03-01'),
        status: 'onboarding',
        profile: {
          bio: 'Junior developer eager to learn and contribute',
          skills: ['JavaScript', 'Python', 'Git', 'SQL'],
          certifications: [],
          socialLinks: {
            github: 'https://github.com/mikejohnson'
          }
        },
        preferences: {
          timezone: 'America/Chicago',
          workingHours: { start: '08:00', end: '16:00' },
          notifications: { email: true, push: true, slack: false }
        },
        onboarding: {
          tasksCompleted: ['setup-workspace'],
          documentsUploaded: [],
          meetingsScheduled: ['hr-orientation', 'team-intro', 'mentor-meeting'],
          completionPercentage: 25
        }
      }
    ]);

    console.log('Created personnel records');

    // Create sample projects
    const projects = await Project.create([
      {
        name: 'E-commerce Platform Redesign',
        description: 'Complete redesign of the company e-commerce platform with modern UI/UX',
        status: 'active',
        priority: 'high',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-06-30'),
        estimatedHours: 2000,
        actualHours: 800,
        budget: 150000,
        team: {
          lead: personnel[0]._id,
          members: [personnel[1]._id, personnel[2]._id],
          stakeholders: []
        },
        tags: ['frontend', 'ui/ux', 'react', 'e-commerce'],
        client: 'Internal'
      },
      {
        name: 'Mobile App Development',
        description: 'Native mobile application for iOS and Android platforms',
        status: 'planning',
        priority: 'medium',
        startDate: new Date('2024-04-01'),
        endDate: new Date('2024-12-31'),
        estimatedHours: 3000,
        actualHours: 0,
        budget: 200000,
        team: {
          lead: personnel[1]._id,
          members: [personnel[0]._id],
          stakeholders: []
        },
        tags: ['mobile', 'react-native', 'ios', 'android'],
        client: 'External Client A'
      },
      {
        name: 'API Optimization',
        description: 'Performance optimization and scaling of existing REST APIs',
        status: 'active',
        priority: 'critical',
        startDate: new Date('2024-02-15'),
        endDate: new Date('2024-05-15'),
        estimatedHours: 800,
        actualHours: 400,
        team: {
          lead: personnel[0]._id,
          members: [personnel[2]._id],
          stakeholders: []
        },
        tags: ['backend', 'api', 'performance', 'node.js'],
        client: 'Internal'
      }
    ]);

    console.log('Created project records');

    // Create sample tasks
    const tasks = await Task.create([
      {
        projectId: projects[0]._id,
        title: 'Design new homepage layout',
        description: 'Create wireframes and mockups for the new homepage design',
        status: 'completed',
        priority: 'high',
        assignee: personnel[1]._id,
        reporter: personnel[0]._id,
        estimatedHours: 16,
        actualHours: 18,
        dueDate: new Date('2024-02-15'),
        tags: ['design', 'ui/ux', 'homepage'],
        comments: [
          {
            author: personnel[0]._id,
            message: 'Great work on the initial designs!',
            timestamp: new Date('2024-02-10')
          },
          {
            author: personnel[1]._id,
            message: 'Thanks! I\'ve incorporated the feedback.',
            timestamp: new Date('2024-02-12')
          }
        ]
      },
      {
        projectId: projects[0]._id,
        title: 'Implement product catalog component',
        description: 'Build reusable React component for product catalog display',
        status: 'in_progress',
        priority: 'medium',
        assignee: personnel[2]._id,
        reporter: personnel[0]._id,
        estimatedHours: 24,
        actualHours: 12,
        dueDate: new Date('2024-04-01'),
        tags: ['react', 'component', 'frontend'],
        comments: []
      },
      {
        projectId: projects[2]._id,
        title: 'Database query optimization',
        description: 'Optimize slow database queries identified in performance audit',
        status: 'review',
        priority: 'urgent',
        assignee: personnel[0]._id,
        reporter: personnel[0]._id,
        estimatedHours: 32,
        actualHours: 28,
        dueDate: new Date('2024-03-30'),
        tags: ['database', 'performance', 'optimization'],
        comments: [
          {
            author: personnel[2]._id,
            message: 'The query performance has improved significantly!',
            timestamp: new Date('2024-03-25')
          }
        ]
      },
      {
        projectId: projects[1]._id,
        title: 'Research mobile frameworks',
        description: 'Compare React Native vs Flutter for mobile development',
        status: 'todo',
        priority: 'low',
        assignee: personnel[1]._id,
        reporter: personnel[1]._id,
        estimatedHours: 8,
        actualHours: 0,
        dueDate: new Date('2024-04-15'),
        tags: ['research', 'mobile', 'framework'],
        comments: []
      }
    ]);

    console.log('Created task records');

    // Create sample time entries
    const timeEntries = await TimeEntry.create([
      {
        personnelId: personnel[0]._id,
        projectId: projects[0]._id,
        taskId: tasks[2]._id,
        description: 'Working on database optimization',
        startTime: new Date('2024-03-20T09:00:00Z'),
        endTime: new Date('2024-03-20T12:00:00Z'),
        duration: 180, // 3 hours in minutes
        type: 'work',
        isApproved: true,
        approvedBy: personnel[0]._id
      },
      {
        personnelId: personnel[1]._id,
        projectId: projects[0]._id,
        taskId: tasks[0]._id,
        description: 'Homepage design work',
        startTime: new Date('2024-03-19T10:00:00Z'),
        endTime: new Date('2024-03-19T16:00:00Z'),
        duration: 360, // 6 hours in minutes
        type: 'work',
        isApproved: true
      },
      {
        personnelId: personnel[2]._id,
        projectId: projects[0]._id,
        taskId: tasks[1]._id,
        description: 'Product catalog component development',
        startTime: new Date('2024-03-21T09:30:00Z'),
        endTime: new Date('2024-03-21T13:30:00Z'),
        duration: 240, // 4 hours in minutes
        type: 'work',
        isApproved: false
      },
      {
        personnelId: personnel[0]._id,
        projectId: projects[2]._id,
        description: 'Team standup meeting',
        startTime: new Date('2024-03-22T09:00:00Z'),
        endTime: new Date('2024-03-22T09:30:00Z'),
        duration: 30, // 30 minutes
        type: 'meeting',
        isApproved: true
      }
    ]);

    console.log('Created time entry records');

    // Update projects with task references
    await Project.findByIdAndUpdate(projects[0]._id, {
      $push: { tasks: { $each: [tasks[0]._id, tasks[1]._id] } },
      actualHours: 30
    });

    await Project.findByIdAndUpdate(projects[2]._id, {
      $push: { tasks: tasks[2]._id },
      actualHours: 28
    });

    await Project.findByIdAndUpdate(projects[1]._id, {
      $push: { tasks: tasks[3]._id }
    });

    console.log('Updated project task references');

    console.log('\n✅ Personnel data seeding completed successfully!');
    console.log('\nSample login credentials:');
    console.log('- john.doe@company.com (Lead)');
    console.log('- jane.smith@company.com (Senior)');
    console.log('- mike.johnson@company.com (Employee)');
    console.log('\nPassword: any password (authentication is simplified for demo)');

  } catch (error) {
    console.error('Error seeding personnel data:', error);
  } finally {
    process.exit(0);
  }
}

seedPersonnelData(); 