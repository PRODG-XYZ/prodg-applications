import { Resend } from 'resend';

// Initialize Resend client
export const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Verified email address
const VERIFIED_EMAIL = process.env.VERIFIED_EMAIL || 'no-reply@prodg.studio';

// Email addresses (all using the same verified domain)
export const EMAIL_ADDRESSES = {
  NOTIFICATIONS: VERIFIED_EMAIL,
  APPLICATIONS: VERIFIED_EMAIL,
  ONBOARDING: VERIFIED_EMAIL,
  NO_REPLY: VERIFIED_EMAIL,
  SUPPORT: VERIFIED_EMAIL
};

// Validate Resend configuration
export function isEmailConfigured(): boolean {
  if (!resend) {
    console.warn('Resend API key is not configured. Email functionality will be disabled.');
    return false;
  }
  return true;
} 