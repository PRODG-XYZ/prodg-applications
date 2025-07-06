# Email Implementation Guide

This document provides detailed information about the email implementation in the PeopleOS platform using Resend.

## Architecture

The email implementation follows a modular design with the following components:

1. **Base Configuration**: Central configuration for Resend client and email addresses
2. **Email Templates**: Reusable React components for email content
3. **Email Services**: Service classes for sending different types of emails
4. **API Integration**: API routes that use the email services

## Directory Structure

```
src/
├── lib/
│   ├── email.ts                         # Base Resend configuration
│   └── emails/
│       ├── applicant-email-service.ts   # Service for applicant emails
│       ├── personnel-email-service.ts   # Service for personnel emails
│       └── templates/
│           ├── applicant-base.tsx       # Base template for applicant emails
│           ├── personnel-base.tsx       # Base template for personnel emails
│           ├── applicant-welcome.tsx    # Welcome email for applicants
│           ├── status-update.tsx        # Status update email
│           └── magic-link.tsx           # Authentication email
├── app/
│   └── api/
│       ├── applications/
│       │   └── [id]/
│       │       └── status/
│       │           └── route.ts         # API for status updates with email
│       └── personnel/
│           └── onboarding/
│               └── route.ts             # API for onboarding with email
scripts/
└── test-email.ts                        # Script to test email functionality
```

## Email Templates

### Base Templates

We use two base templates:

1. **Applicant Base Template**: Used for all applicant-related emails
   - Welcome emails
   - Status updates
   - Authentication emails

2. **Personnel Base Template**: Used for all personnel-related emails
   - Onboarding emails
   - Project assignments
   - Team notifications

### Specific Templates

Each specific email type has its own template that extends the base template:

- **Welcome Email**: Sent when an application is submitted
- **Status Update Email**: Sent when an application status changes
- **Magic Link Email**: Sent for authentication purposes

## Email Services

### ApplicantEmailService

Provides methods for sending emails to applicants:

- `sendWelcomeEmail(applicant)`: Sends a welcome email to a new applicant
- `sendStatusUpdateEmail(applicant, status, message)`: Notifies about status changes
- `sendMagicLinkEmail(applicant, magicLink)`: Sends authentication links
- `sendCustomEmail(applicant, subject, content, options)`: Sends custom emails

### PersonnelEmailService

Provides methods for sending emails to personnel:

- `sendOnboardingWelcomeEmail(personnel)`: Welcomes new team members
- `sendProjectAssignmentEmail(personnel, projectName, details)`: Notifies about project assignments
- `sendCustomEmail(personnel, subject, content, options)`: Sends custom emails

## API Integration

The email services are integrated with the following API endpoints:

1. **Application Status Updates**: `/api/applications/[id]/status`
   - Sends status update emails when an application status changes

2. **Personnel Onboarding**: `/api/personnel/onboarding`
   - Sends welcome emails to new personnel during onboarding

## Configuration

### Environment Variables

The email functionality uses the following environment variables:

```
RESEND_API_KEY=your_resend_api_key
VERIFIED_EMAIL=no-reply@prodg.studio
```

### Email Address

All emails are sent from a single verified email address:

- `no-reply@prodg.studio`: Used for all communication types

Although we use a single email address, we still maintain a logical separation in our code structure through the `EMAIL_ADDRESSES` object in `src/lib/email.ts`. This allows for easy expansion if multiple email addresses become available in the future.

## Subject Line Prefixing

Since we're using a single email address for different types of communications, we use clear subject line prefixing to help recipients identify the purpose of each email:

- `[Application]`: For application-related emails
- `[Status Update]`: For status change notifications
- `[Authentication]`: For login links
- `[Onboarding]`: For onboarding information
- `[Project]`: For project-related communications

## Deliverability Best Practices

The implementation follows these best practices:

1. **Clear Subject Lines**: Subject lines clearly indicate the purpose
2. **Personalization**: All emails include the recipient's name
3. **Unsubscribe Links**: Included where appropriate
4. **Email Tagging**: All emails are tagged for analytics
5. **Reply-To Header**: Set appropriately for each email type

## Testing

To test the email functionality:

```bash
# Run the test script
npm run test:email

# Test with a specific email address
npm run test:email your-email@example.com
```

## Adding New Email Templates

To add a new email template:

1. Create a new template file in `src/lib/emails/templates/`
2. Import the appropriate base template
3. Design your email content as React components
4. Add a method to the appropriate email service
5. Integrate with the relevant API endpoint

## Troubleshooting

Common issues and solutions:

1. **Emails not sending**: Check if `RESEND_API_KEY` is set correctly
2. **Authentication errors**: Ensure your verified email is configured correctly
3. **Template rendering errors**: Check React component syntax
4. **Bounce issues**: Verify recipient email addresses
5. **Spam folder delivery**: Follow deliverability best practices

## Additional Resources

- [Resend Documentation](https://resend.com/docs)
- [React Email](https://react.email/)
- [Email Setup Guide](./RESEND_EMAIL_SETUP.md) 