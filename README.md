# DevCorp Applications - Futuristic Developer Application Platform

A cutting-edge developer applications platform built with Next.js, MongoDB, and modern UI components. Features a beautiful, futuristic interface for developers to submit applications and for admins to review them.

## Features

### For Applicants
- **Sleek Application Form**: Modern, animated form with real-time validation
- **Developer-Focused Fields**: GitHub, LinkedIn, skills selection, portfolio links
- **Interactive UI**: Skill selection with visual feedback, smooth animations
- **Responsive Design**: Works perfectly on all devices

### For Admins (Dashboard)
- **Application Management**: View, filter, and search applications
- **Status Updates**: Mark applications as pending, reviewing, approved, or rejected
- **Detailed View**: Complete applicant information with quick actions
- **Real-time Updates**: Live status changes and application management

### Technical Features
- **MongoDB Integration**: Secure data storage with Mongoose ODM
- **Form Validation**: Comprehensive validation using Zod and React Hook Form
- **Modern UI**: Futuristic design with Tailwind CSS and Framer Motion
- **Type Safety**: Full TypeScript implementation
- **API Routes**: RESTful API endpoints for all operations

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Framer Motion animations
- **Database**: MongoDB with Mongoose
- **Forms**: React Hook Form with Zod validation
- **UI Components**: Custom components with shadcn/ui patterns
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB database (local or cloud)

### Installation

1. **Clone and install dependencies**:
```bash
git clone <your-repo-url>
cd prodg-applications
npm install
```

2. **Set up environment variables**:
Create a `.env.local` file in the root directory:
```env
# MongoDB Connection URL
MONGODB_URI=mongodb://localhost:27017/devapp-applications

# For MongoDB Atlas (cloud):
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/devapp-applications?retryWrites=true&w=majority
```

3. **Start the development server**:
```bash
npm run dev
```

4. **Open your browser**:
Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   └── applications/  # Application CRUD endpoints
│   ├── apply/             # Application form page
│   ├── dashboard/         # Admin dashboard page
│   └── page.tsx           # Homepage
├── components/            # React components
│   ├── ui/                # Reusable UI components
│   ├── ApplicationForm.tsx # Main application form
│   └── Dashboard.tsx      # Admin dashboard
└── lib/                   # Utilities and configurations
    ├── models/            # Mongoose models
    ├── mongodb.ts         # Database connection
    ├── validation.ts      # Zod schemas
    └── utils.ts           # Helper functions
```

## API Endpoints

### Applications
- `GET /api/applications` - Get all applications (with filtering)
- `POST /api/applications` - Create new application
- `GET /api/applications/[id]` - Get single application
- `PATCH /api/applications/[id]` - Update application status
- `DELETE /api/applications/[id]` - Delete application

### Query Parameters
- `status`: Filter by status (pending, reviewing, approved, rejected)
- `page`: Pagination page number
- `limit`: Number of results per page

## Usage

### For Developers (Applying)
1. Visit the homepage
2. Click "Apply Now" or navigate to `/apply`
3. Fill out the comprehensive application form
4. Submit and receive confirmation

### For Admins (Dashboard)
1. Navigate to `/dashboard`
2. View all applications with filtering options
3. Click on an application to view details
4. Update status using the action buttons
5. Search and filter applications as needed

## Form Fields

The application form includes:
- **Personal Info**: Name, email
- **Professional Links**: GitHub, LinkedIn profiles
- **Background**: Professional background description
- **Experience**: Development experience details
- **Skills**: Interactive skill selection (16 popular technologies)
- **Portfolio**: Optional portfolio and resume URLs
- **Motivation**: Why they want to join
- **Availability**: When they can start
- **Salary**: Expected salary (optional)

## Database Schema

Applications are stored with the following structure:
```typescript
{
  name: string
  email: string
  github: string
  linkedin: string
  backgroundDescription: string
  experience: string
  skills: string[]
  portfolioUrl?: string
  resumeUrl?: string
  motivation: string
  availability: string
  expectedSalary?: number
  createdAt: Date
  status: 'pending' | 'reviewing' | 'approved' | 'rejected'
}
```

## Customization

### Adding New Skills
Edit the `popularSkills` array in `src/components/ApplicationForm.tsx`:
```typescript
const popularSkills = [
  'JavaScript', 'TypeScript', 'React', 'Node.js',
  // Add your technologies here
];
```

### Styling
The app uses a futuristic theme with:
- Dark gradient backgrounds
- Cyan/blue color scheme
- Glassmorphism effects
- Smooth animations

Customize colors in the Tailwind classes throughout the components.

### Form Validation
Update validation rules in `src/lib/validation.ts` using Zod schemas.

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your `MONGODB_URI` environment variable
4. Deploy

### Other Platforms
Ensure you:
1. Set the `MONGODB_URI` environment variable
2. Install dependencies with `npm install`
3. Build with `npm run build`
4. Start with `npm start`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

---

Built with ❤️ for the developer community
