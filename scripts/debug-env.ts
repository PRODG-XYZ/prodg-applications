import * as dotenv from 'dotenv';

// Load environment variables from .env.local first, then try .env
dotenv.config({ path: '.env.local' });
if (!process.env.RESEND_API_KEY) {
  dotenv.config({ path: '.env' });
}

// Print environment variables (redacted for security)
console.log('Environment variables loaded:');
console.log(`RESEND_API_KEY: ${process.env.RESEND_API_KEY ? '******' + process.env.RESEND_API_KEY.substring(process.env.RESEND_API_KEY.length - 4) : 'not set'}`);
console.log(`RESEND_API_KEY length: ${process.env.RESEND_API_KEY?.length || 0}`);
console.log(`VERIFIED_EMAIL: ${process.env.VERIFIED_EMAIL || 'not set'}`);

// Check format of API key
if (process.env.RESEND_API_KEY) {
  if (process.env.RESEND_API_KEY === 'your_actual_api_key') {
    console.error('Error: You need to replace "your_actual_api_key" with your actual Resend API key');
  } else if (!process.env.RESEND_API_KEY.startsWith('re_')) {
    console.error('Warning: Resend API keys typically start with "re_". Your key may not be in the correct format.');
  }
} 