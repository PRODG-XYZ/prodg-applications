# Email Testing Guide

This guide explains how to test the Resend email integration in the PeopleOS platform.

## Prerequisites

Before testing emails, make sure you have:

1. Set up your environment variables in either `.env.local` or `.env` file with your Resend API key:
   ```
   RESEND_API_KEY=your_actual_api_key  # Must start with re_
   VERIFIED_EMAIL=no-reply@prodg.studio  # Must be from a verified domain
   ```

2. Installed all dependencies:
   ```bash
   npm install
   # or
   pnpm install
   # or
   yarn install
   ```

3. Verified your domain in the Resend dashboard:
   - Go to https://resend.com/domains
   - Add and verify your domain by following Resend's instructions
   - Once verified, you can use any email address at that domain

## Testing Methods

There are multiple ways to test the email functionality:

### 1. Using the `email` command (Easiest)

This is the recommended way to test emails as it properly handles arguments:

```bash
# Send to the default test email (test@example.com)
npm run email

# Send to a specific email address
npm run email your-email@example.com

# Using the --email flag
npm run email -- --email your-email@example.com
```

With pnpm:
```bash
pnpm email
pnpm email your-email@example.com
pnpm email -- --email your-email@example.com
```

### 2. Using test-email.ts directly

If you prefer to run the TypeScript file directly:

```bash
npx tsx scripts/test-email.ts your-email@example.com
```

### 3. Using the shell script

If you prefer to use the shell script:

```bash
# Make sure the script is executable
chmod +x scripts/test-resend.sh

# Run the script
./scripts/test-resend.sh --email your-email@example.com
```

Or via npm:
```bash
npm run test:resend -- -e your-email@example.com
```

## Troubleshooting

### Email not receiving

1. Check if your Resend API key is correct
2. Verify that no-reply@prodg.studio is properly set up in Resend
3. Check the console output for errors
4. Look in your spam folder

### Domain Verification Issues

If you see errors like "domain not verified":
- Make sure your domain is properly verified in the Resend dashboard
- Use the exact domain that you verified (e.g., if you verified "prodg.studio", use "no-reply@prodg.studio")
- The sender email format in the code should include a display name: `PeopleOS <no-reply@prodg.studio>`

### Environment Variable Issues

The scripts check for environment variables in the following order:
1. `.env.local` file (primary)
2. `.env` file (fallback)

If neither file exists or the RESEND_API_KEY is missing, you'll see an error.

### Testing without a verified domain

If you don't have a verified domain yet, you can use Resend's test domain temporarily:
```
VERIFIED_EMAIL=onboarding@resend.dev
```
Note: With the test domain, you can only send to your own email address (the one used to sign up for Resend).

### Permission issues with scripts

If you encounter permission issues:

```bash
chmod +x scripts/test-resend.sh
chmod +x scripts/email-test.js
```

### API errors

Common API errors:

- **"Domain not found"**: Make sure you have verified your domain in Resend
- **"API key is invalid"**: Double-check your API key format (should start with re_)
- **"Too many requests"**: You might be hitting rate limits, try again later

## Common Commands for Different Scenarios

### Testing with your own email

```bash
pnpm email your-email@example.com
```

### Testing production emails

```bash
NODE_ENV=production pnpm email your-email@example.com
```

### Running multiple tests

To send multiple test emails:

```bash
for i in {1..3}; do pnpm email your-email@example.com; sleep 2; done
```

## Email Template Testing

To test specific email templates:

1. Create a custom test script
2. Import the template you want to test
3. Run the script with the same methods above

For example, to test the welcome email template:

```typescript
// scripts/test-welcome-email.ts
import { Resend } from 'resend';
import { renderAsync } from '@react-email/render';
import * as React from 'react';
import { ApplicantWelcomeEmail } from '../src/lib/emails/templates/applicant-welcome';
import * as dotenv from 'dotenv';

// Load from .env.local first, then try .env
dotenv.config({ path: '.env.local' });
if (!process.env.RESEND_API_KEY) {
  dotenv.config({ path: '.env' });
}

async function main() {
  // ... similar to test-email.ts
  // but using the ApplicantWelcomeEmail template
}

main().catch(console.error);
```

Then run it:

```bash
npx tsx scripts/test-welcome-email.ts your-email@example.com
``` 