import { Resend } from 'resend';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local if it exists, then try .env
dotenv.config({ path: '.env.local' });
// If RESEND_API_KEY is not set, try loading from .env
if (!process.env.RESEND_API_KEY) {
  dotenv.config({ path: '.env' });
}

async function main() {
  // Check if API key exists
  if (!process.env.RESEND_API_KEY) {
    console.error('Error: RESEND_API_KEY environment variable is not set');
    process.exit(1);
  }

  // Initialize Resend
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    // Get email from command line or use default
    const testEmail = process.argv[2] || 'test@example.com';
    const name = testEmail.split('@')[0] || 'Tester';
    
    console.log(`Sending test email to: ${testEmail}`);

    // Use the verified email address
    const emailAddress = process.env.VERIFIED_EMAIL || 'onboarding@resend.dev';
    // Format from field with display name
    const fromEmail = `PeopleOS <${emailAddress}>`;
    
    // Current date and time
    const now = new Date();
    const timestamp = now.toISOString();
    const environment = process.env.NODE_ENV || 'development';

    // Create HTML email
    const html = `
      <html>
        <head>
          <title>Test Email</title>
        </head>
        <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
            <h1 style="color: #333333;">Test Email from PeopleOS</h1>
            <p>Hello ${name},</p>
            <p>This is a test email to verify that the Resend email integration is working correctly.</p>
            <p>If you're seeing this, it means the setup is successful!</p>
            <div style="margin-top: 30px; padding: 10px; background-color: #f0f0f0; border-radius: 5px;">
              <p><strong>Test Details:</strong></p>
              <ul>
                <li>Time: ${timestamp}</li>
                <li>Environment: ${environment}</li>
                <li>Sender: ${emailAddress}</li>
              </ul>
            </div>
            <p style="margin-top: 30px; font-size: 12px; color: #666666;">
              This is an automated message, please do not reply.
            </p>
          </div>
        </body>
      </html>
    `;

    // Send the email
    const data = await resend.emails.send({
      from: fromEmail,
      to: testEmail,
      subject: '[Test] PeopleOS Email Integration Test',
      html: html,
      tags: [{ name: 'category', value: 'test' }]
    });

    console.log('Email sent successfully!');
    console.log('Response:', data);
  } catch (error) {
    console.error('Error sending test email:', error);
    process.exit(1);
  }
}

main().catch(console.error); 