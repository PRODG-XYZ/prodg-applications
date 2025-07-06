#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Check for environment variables
function setupEnvironment() {
  // Check for .env.local or .env
  const envLocalPath = path.join(process.cwd(), '.env.local');
  const envPath = path.join(process.cwd(), '.env');
  
  let envFile = null;
  
  if (fs.existsSync(envLocalPath)) {
    envFile = envLocalPath;
    console.log('Using environment variables from .env.local');
  } else if (fs.existsSync(envPath)) {
    envFile = envPath;
    console.log('Using environment variables from .env');
  } else {
    console.warn('Warning: No .env.local or .env file found. Email sending may fail.');
  }
}

// Run the setup
setupEnvironment();

// Get the email address from command line arguments
let emailAddress = 'test@example.com'; // default
const args = process.argv.slice(2);

// Check if there's an email argument
if (args.length > 0) {
  // Look for specific flags
  const emailFlagIndex = args.findIndex(arg => arg === '-e' || arg === '--email');
  
  if (emailFlagIndex !== -1 && args.length > emailFlagIndex + 1) {
    // Use the email address after the flag
    emailAddress = args[emailFlagIndex + 1];
  } else if (args[0].includes('@')) {
    // If the first argument looks like an email, use it
    emailAddress = args[0];
  }
}

console.log(`Sending test email to: ${emailAddress}`);

// Run the test email script with the email address
const testEmailPath = path.join(__dirname, 'test-email.ts');
const tsxProcess = spawn('npx', ['tsx', testEmailPath, emailAddress], { 
  stdio: 'inherit',
  shell: true
});

tsxProcess.on('close', (code) => {
  process.exit(code);
}); 