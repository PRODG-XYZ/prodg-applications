import { connectToDatabase } from '../src/lib/mongodb';
import Application from '../src/lib/models/Application';

const sampleApplications = [
  {
    name: "John Smith",
    email: "john.smith@example.com",
    phone: "+1-555-0123",
    country: "United States",
    github: "https://github.com/johnsmith",
    linkedin: "https://linkedin.com/in/johnsmith",
    backgroundDescription: "Full-stack developer with 5 years of experience in web development. Passionate about creating scalable applications and working with modern technologies.",
    experience: "5 years of professional development experience, worked at startups and established companies, leading teams of 3-5 developers.",
    skills: ["JavaScript", "TypeScript", "React", "Node.js", "MongoDB", "AWS", "Docker"],
    portfolioUrl: "https://johnsmith.dev",
    resumeUrl: "https://example.com/resume/johnsmith.pdf",
    motivation: "I'm excited to contribute to innovative projects and work with a team that values clean code and continuous learning.",
    availability: "Available immediately",
    status: "pending" as const
  },
  {
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    phone: "+1-555-0124",
    country: "Canada",
    github: "https://github.com/sarahjohnson",
    linkedin: "https://linkedin.com/in/sarahjohnson",
    backgroundDescription: "Frontend specialist with expertise in React and modern CSS frameworks. Strong background in UI/UX design principles.",
    experience: "3 years frontend development, 2 years UI/UX design. Built responsive applications for e-commerce and fintech companies.",
    skills: ["React", "Vue.js", "CSS", "SASS", "Figma", "JavaScript", "TypeScript"],
    portfolioUrl: "https://sarahjohnson.portfolio.com",
    motivation: "Looking to join a team where I can combine my design and development skills to create amazing user experiences.",
    availability: "Available in 2 weeks",
    status: "reviewing" as const
  },
  {
    name: "Miguel Rodriguez",
    email: "miguel.rodriguez@example.com",
    phone: "+52-555-0125",
    country: "Mexico",
    github: "https://github.com/miguelrodriguez",
    linkedin: "https://linkedin.com/in/miguelrodriguez",
    backgroundDescription: "Backend engineer with strong expertise in microservices architecture and cloud infrastructure.",
    experience: "7 years backend development, specializing in scalable systems and API design. Experience with high-traffic applications.",
    skills: ["Python", "Django", "FastAPI", "PostgreSQL", "Redis", "Kubernetes", "GCP"],
    portfolioUrl: "https://miguel-dev.com",
    resumeUrl: "https://example.com/resume/miguel.pdf",
    motivation: "Passionate about building robust backend systems that can scale. Excited to work on challenging technical problems.",
    availability: "Available immediately",
    status: "approved" as const
  },
  {
    name: "Priya Patel",
    email: "priya.patel@example.com",
    phone: "+91-9876543210",
    country: "India",
    github: "https://github.com/priyapatel",
    linkedin: "https://linkedin.com/in/priyapatel",
    backgroundDescription: "DevOps engineer with experience in CI/CD pipelines and infrastructure automation.",
    experience: "4 years DevOps experience, managed deployments for applications serving millions of users.",
    skills: ["AWS", "Terraform", "Jenkins", "Docker", "Kubernetes", "Python", "Bash"],
    motivation: "I love automating processes and helping development teams deploy faster and more reliably.",
    availability: "Available in 1 week",
    status: "rejected" as const
  },
  {
    name: "Alex Chen",
    email: "alex.chen@example.com",
    phone: "+86-138-0013-8000",
    country: "China",
    github: "https://github.com/alexchen",
    linkedin: "https://linkedin.com/in/alexchen",
    backgroundDescription: "Mobile app developer with experience in both iOS and Android development using React Native and Flutter.",
    experience: "6 years mobile development, published 15+ apps on app stores with combined 1M+ downloads.",
    skills: ["React Native", "Flutter", "Swift", "Kotlin", "Firebase", "GraphQL"],
    portfolioUrl: "https://alexchen-apps.com",
    resumeUrl: "https://example.com/resume/alexchen.pdf",
    motivation: "Excited to work on mobile applications that make a real impact on users' daily lives.",
    availability: "Available immediately",
    status: "pending" as const
  },
  {
    name: "Emma Wilson",
    email: "emma.wilson@example.com",
    phone: "+44-20-7946-0958",
    country: "United Kingdom",
    github: "https://github.com/emmawilson",
    linkedin: "https://linkedin.com/in/emmawilson",
    backgroundDescription: "Data scientist and machine learning engineer with expertise in predictive modeling and data visualization.",
    experience: "5 years in data science, built ML models for recommendation systems, fraud detection, and customer analytics.",
    skills: ["Python", "R", "TensorFlow", "PyTorch", "SQL", "Tableau", "AWS SageMaker"],
    portfolioUrl: "https://emmawilson-data.com",
    motivation: "Passionate about using data to solve real-world problems and make data-driven decisions.",
    availability: "Available in 3 weeks",
    status: "reviewing" as const
  },
  {
    name: "David Kim",
    email: "david.kim@example.com",
    phone: "+82-10-1234-5678",
    country: "South Korea",
    github: "https://github.com/davidkim",
    linkedin: "https://linkedin.com/in/davidkim",
    backgroundDescription: "Cybersecurity specialist with focus on application security and penetration testing.",
    experience: "4 years cybersecurity experience, conducted security audits for fintech and healthcare companies.",
    skills: ["Penetration Testing", "OWASP", "Burp Suite", "Python", "Linux", "Network Security"],
    resumeUrl: "https://example.com/resume/davidkim.pdf",
    motivation: "Committed to helping organizations build secure applications and protect user data.",
    availability: "Available immediately",
    status: "approved" as const
  },
  {
    name: "Ana Silva",
    email: "ana.silva@example.com",
    phone: "+55-11-98765-4321",
    country: "Brazil",
    github: "https://github.com/anasilva",
    linkedin: "https://linkedin.com/in/anasilva",
    backgroundDescription: "QA engineer with expertise in test automation and quality assurance processes.",
    experience: "3 years QA experience, implemented automated testing frameworks that reduced manual testing time by 70%.",
    skills: ["Selenium", "Cypress", "Jest", "TestNG", "API Testing", "Performance Testing"],
    portfolioUrl: "https://ana-qa.com",
    motivation: "Dedicated to ensuring software quality and helping teams deliver bug-free applications.",
    availability: "Available in 1 week",
    status: "pending" as const
  }
];

async function seedApplications() {
  try {
    console.log('🌱 Starting to seed applications...');
    
    // Connect to database
    await connectToDatabase();
    
    // Clear existing applications (optional - comment out if you want to keep existing data)
    console.log('🗑️  Clearing existing applications...');
    await Application.deleteMany({});
    
    // Insert sample applications
    console.log('📝 Inserting sample applications...');
    const insertedApplications = await Application.insertMany(sampleApplications);
    
    console.log(`✅ Successfully seeded ${insertedApplications.length} applications!`);
    
    // Display summary
    const statusCounts = await Application.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    console.log('\n📊 Applications by status:');
    statusCounts.forEach(({ _id, count }) => {
      console.log(`   ${_id}: ${count}`);
    });
    
    console.log('\n🎉 Database seeding completed!');
    
    // Close connection
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding applications:', error);
    process.exit(1);
  }
}

// Run the seeding function if this script is executed directly
if (require.main === module) {
  seedApplications();
}

export default seedApplications; 