# Resend Email Setup Guide

This guide will walk you through setting up Resend for sending transactional and notification emails in the PeopleOS platform.

## Overview

PeopleOS uses Resend to handle email communications for both applicants and personnel. The implementation follows best practices for email deliverability and user experience.

## Prerequisites

1. A Resend account (Sign up at [resend.com](https://resend.com))
2. Access to your domain's DNS settings
3. API keys with appropriate permissions

## Setup Steps

### 1. Create a Resend Account

If you haven't already, sign up for a Resend account at [resend.com](https://resend.com).

### 2. Set Up Your Verified Email

PeopleOS is configured to use a single verified email address (`no-reply@prodg.studio`) for all email communications.

If you need to verify a different email address:

1. Go to the Resend dashboard
2. Navigate to "Domains" section
3. Click "Add Domain"
4. Enter your domain name
5. Follow the DNS verification instructions provided by Resend
6. Wait for verification to complete (may take up to 24-48 hours for DNS propagation)

### 3. DNS Configuration

For your domain, you'll need to add the following DNS records:

1. **SPF Record**: Authorizes Resend to send emails on your behalf
2. **DKIM Record**: Adds a digital signature to your emails for authentication
3. **DMARC Record**: Specifies how to handle emails that fail authentication

Resend will provide the exact records to add in your DNS configuration. Add these records at your domain registrar or DNS provider.

### 4. Generate API Keys

1. In the Resend dashboard, go to "API Keys"
2. Click "Create API Key"
3. Name your key (e.g., "PeopleOS Production")
4. Select the appropriate permissions (usually "Full Access" for primary integration)
5. Copy the generated API key and store it securely

### 5. Configure Environment Variables

Add the following environment variables to your PeopleOS environment:

```
RESEND_API_KEY=your_resend_api_key
VERIFIED_EMAIL=no-reply@prodg.studio
```

For local development, add these to your `.env.local` file. For production, add them to your hosting environment.

### 6. Test Email Delivery

After configuration, test the email delivery:

1. Use the test function in the Resend dashboard, or
2. Run the test script in the PeopleOS application:

```bash
# From the project root
npm run test:email
```

This will send test emails to verify your configuration is working correctly.

## Email Types and Implementation

### Applicant Emails

1. **Welcome Email**: Sent when an application is submitted
2. **Status Update Emails**: Sent when application status changes
3. **Magic Link Authentication**: Secure login links for applicant dashboard
4. **Communication Notifications**: Alerts for new messages

### Personnel Emails

1. **Onboarding Welcome**: Sent when an applicant is converted to personnel
2. **Project Assignments**: Notifications about new project assignments
3. **Task Updates**: Alerts about task assignments and updates
4. **Team Communications**: Notifications about team messages

## Subject Line Prefixing

Since we're using a single email address for all communications, we use clear subject line prefixing to distinguish different types of emails:

- `[Application]`: For application-related emails
- `[Status Update]`: For status change notifications
- `[Authentication]`: For login links
- `[Onboarding]`: For onboarding information
- `[Project]`: For project-related communications

## Deliverability Best Practices

To ensure high deliverability:

1. **Start Slow**: Begin with low volumes and gradually increase
2. **Use Consistent Sending Patterns**: Maintain regular sending schedules
3. **Monitor Bounce Rates**: Keep bounce rates below 5%
4. **Include Unsubscribe Options**: For marketing and promotional emails
5. **Personalize Content**: Use recipient names and relevant information
6. **Avoid Spam Triggers**: Don't use excessive capitalization, spam words, or misleading subject lines
7. **Test Before Sending**: Verify email rendering across different email clients

## Troubleshooting

If emails aren't being delivered:

1. **Check Resend Dashboard**: Look for sending errors or bounces
2. **Verify DNS Configuration**: Ensure all DNS records are properly set up
3. **Check Suppression List**: See if recipients are on the suppression list
4. **Review Email Content**: Ensure content doesn't trigger spam filters
5. **Contact Resend Support**: If issues persist, reach out to Resend support

## Additional Resources

- [Resend Documentation](https://resend.com/docs)
- [Email Deliverability Guide](https://resend.com/docs/knowledge-base/how-do-i-avoid-gmails-spam-folder)
- [DMARC Explained](https://resend.com/blog/dmarc-explained) 