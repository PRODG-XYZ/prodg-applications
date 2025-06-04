# S3 File Upload Setup Guide

## Overview
This application now supports uploading resumes directly to AWS S3 instead of requiring users to provide external URLs.

## Required Environment Variables

Add these variables to your `.env.local` file:

```env
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-s3-bucket-name
```

## AWS S3 Setup Steps

### 1. Create an S3 Bucket
1. Log into AWS Console
2. Navigate to S3
3. Create a new bucket (e.g., `your-app-resumes`)
4. Choose your preferred region
5. Keep default settings for now

### 2. Configure Bucket Permissions
For basic setup, you can use these bucket permissions:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::your-bucket-name/*"
        }
    ]
}
```

**Note**: For production, consider using CloudFront distribution and more restrictive permissions.

### 3. Create IAM User
1. Navigate to IAM in AWS Console
2. Create a new user for programmatic access
3. Attach this policy to the user:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject"
            ],
            "Resource": [
                "arn:aws:s3:::your-bucket-name/*"
            ]
        }
    ]
}
```

4. Save the Access Key ID and Secret Access Key

### 4. Update Environment Variables
Add the credentials to your `.env.local`:

```env
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-bucket-name
```

## Features Implemented

### File Upload Component (`FileUpload.tsx`)
- Drag and drop functionality
- File type validation (PDF, DOC, DOCX)
- File size validation (max 5MB)
- Upload progress indicator
- Error handling

### Upload API Endpoint (`/api/upload-resume`)
- Handles file validation
- Uploads to S3 with organized naming
- Returns S3 URL for storage

### Updated Application Form
- Replaced manual URL input with file upload
- Automatic URL setting after successful upload
- Visual feedback for uploaded files

## File Organization
Files are stored in S3 with this structure:
```
resumes/
  ├── 1703123456789-john-doe-resume.pdf
  ├── 1703123789456-jane-smith-cv.docx
  └── ...
```

## Security Considerations

1. **File Type Validation**: Only PDF and DOC files are allowed
2. **File Size Limits**: Maximum 5MB per file
3. **Server-side Encryption**: Files are encrypted at rest (AES256)
4. **Unique Naming**: Files are renamed with timestamps to avoid conflicts

## Testing

To test the upload functionality:

1. Start your development server: `npm run dev`
2. Navigate to `/apply`
3. Try uploading a PDF or DOC file
4. Verify the file appears in your S3 bucket
5. Check that the application stores the S3 URL

## Troubleshooting

### Common Issues:

1. **"Invalid/Missing environment variable"**
   - Check your `.env.local` file contains all required variables
   - Restart your development server after adding variables

2. **"Access Denied" errors**
   - Verify IAM user has correct permissions
   - Check bucket policy allows uploads

3. **"File too large" errors**
   - Files must be under 5MB
   - Consider implementing file compression for larger files

4. **Upload fails silently**
   - Check browser console for errors
   - Verify network connectivity
   - Check AWS credentials are valid 