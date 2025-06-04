# Database Seeding Scripts

This directory contains scripts for seeding the database with test data.

## Applications Seeding Script

The `seed-applications.ts` script populates the database with sample application data for testing purposes.

### Features

- **Clears existing data**: Removes all existing applications before seeding (can be disabled)
- **Diverse sample data**: Creates 8 sample applications with different:
  - Geographic locations (US, Canada, Mexico, India, China, UK, South Korea, Brazil)
  - Skill sets (Frontend, Backend, DevOps, Mobile, Data Science, Security, QA)
  - Application statuses (pending, reviewing, approved, rejected)
- **Data validation**: All sample data follows the application schema requirements
- **Progress reporting**: Shows seeding progress and final statistics

### Usage

1. **Make sure your environment is set up**:
   ```bash
   # Ensure MONGODB_URI is set in your .env.local file
   cp env.example .env.local
   # Edit .env.local and add your MongoDB connection string
   ```

2. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

3. **Run the seeding script**:
   ```bash
   npm run seed
   ```

   Or run directly with tsx:
   ```bash
   npx tsx scripts/seed-applications.ts
   ```

### Sample Data Overview

The script creates 8 applications with the following distribution:
- **Pending**: 3 applications
- **Reviewing**: 2 applications  
- **Approved**: 2 applications
- **Rejected**: 1 application

Each application includes:
- Complete profile information (name, email, phone, country)
- Social links (GitHub, LinkedIn)
- Professional background and experience
- Technical skills array
- Portfolio/resume URLs (where applicable)
- Motivation and availability

### Customization

To modify the seed data:

1. Edit the `sampleApplications` array in `seed-applications.ts`
2. Follow the application schema defined in `src/lib/models/Application.ts`
3. Ensure all required fields are included
4. Validate URLs and email formats

### Safety Features

- **Confirmation required**: The script will clear existing data - make sure this is intended
- **Error handling**: Comprehensive error messages for troubleshooting
- **Status reporting**: Shows exactly what was created and the final state

### Troubleshooting

**Connection Issues**:
- Verify `MONGODB_URI` in your `.env.local` file
- Ensure MongoDB is running and accessible
- Check network connectivity

**Validation Errors**:
- Review the application schema in `src/lib/models/Application.ts`
- Ensure all required fields are present in sample data
- Check that URLs and email formats are valid

**Permission Errors**:
- Ensure the MongoDB user has write permissions
- Check database and collection permissions 