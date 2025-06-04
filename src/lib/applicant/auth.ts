import crypto from 'crypto';
import { cookies } from 'next/headers';
import ApplicantSession from '../models/ApplicantSession';
import Application from '../models/Application';
import { connectToDatabase } from '../mongodb';

/**
 * Authentication utilities for applicant dashboard
 * Handles magic link generation, email sending, and session management
 */

/**
 * Generate a cryptographically secure token for magic links
 * @returns {string} Secure random token
 */
export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Create and send magic link to applicant
 * @param email - Applicant's email address
 * @param applicationId - Optional application ID to link to
 * @returns Promise<boolean> - Success status
 */
export async function sendMagicLink(email: string, applicationId?: string): Promise<boolean> {
  try {
    await connectToDatabase();
    
    // Find application by email if no applicationId provided
    let application;
    if (applicationId) {
      application = await Application.findById(applicationId);
    } else {
      application = await Application.findOne({ email: email.toLowerCase() });
    }
    
    if (!application) {
      throw new Error('Application not found');
    }
    
    // Generate secure token
    const token = generateSecureToken();
    
    // Create session record
    await ApplicantSession.create({
      email: email.toLowerCase(),
      applicationId: application._id.toString(),
      token,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes for magic link
    });
    
    // Send email with magic link
    const magicLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/applicant/auth/verify?token=${token}`;
    
    // For now, we'll console.log the magic link since email service isn't configured
    // In production, replace this with actual email sending using nodemailer
    console.log('Magic link generated:', magicLink);
    console.log('Send this link to:', email);
    
    // TODO: Configure email service in environment and uncomment below
    /*
    const transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@prodg.com',
      to: email,
      subject: 'Access Your Application Dashboard',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <h2 style="color: #06b6d4;">Access Your Application Dashboard</h2>
          <p>Click the link below to access your application dashboard:</p>
          <a href="${magicLink}" style="background: #06b6d4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
            Access Dashboard
          </a>
          <p style="margin-top: 20px;">This link will expire in 15 minutes for security.</p>
          <p>Application ID: ${application._id}</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });
    */
    
    return true;
  } catch (error) {
    console.error('Failed to send magic link:', error);
    return false;
  }
}

/**
 * Verify magic link token and create long-term session
 * @param token - Magic link token
 * @returns Promise<{success: boolean, sessionToken?: string, applicationId?: string}>
 */
export async function verifyMagicLink(token: string): Promise<{
  success: boolean;
  sessionToken?: string;
  applicationId?: string;
  error?: string;
}> {
  try {
    await connectToDatabase();
    
    // Find and validate session
    const session = await ApplicantSession.findOne({ token });
    
    if (!session) {
      return { success: false, error: 'Invalid token' };
    }
    
    if (session.expiresAt < new Date()) {
      // Clean up expired session
      await ApplicantSession.deleteOne({ _id: session._id });
      return { success: false, error: 'Token expired' };
    }
    
    // Generate new long-term session token
    const sessionToken = generateSecureToken();
    
    // Update session with new token and extended expiration
    await ApplicantSession.findByIdAndUpdate(session._id, {
      token: sessionToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      lastAccessedAt: new Date(),
    });
    
    // Update application last login
    await Application.findByIdAndUpdate(session.applicationId, {
      lastLoginAt: new Date(),
    });
    
    return {
      success: true,
      sessionToken,
      applicationId: session.applicationId,
    };
  } catch (error) {
    console.error('Failed to verify magic link:', error);
    return { success: false, error: 'Verification failed' };
  }
}

/**
 * Validate applicant session from cookie
 * @param sessionToken - Session token from cookie
 * @returns Promise<{valid: boolean, session?: IApplicantSession}>
 */
export async function validateApplicantSession(sessionToken: string) {
  try {
    await connectToDatabase();
    
    const session = await ApplicantSession.findOne({ 
      token: sessionToken,
      expiresAt: { $gt: new Date() }
    });
    
    if (!session) {
      return { valid: false };
    }
    
    // Update last accessed time
    session.lastAccessedAt = new Date();
    await session.save();
    
    return { valid: true, session };
  } catch (error) {
    console.error('Session validation failed:', error);
    return { valid: false };
  }
}

/**
 * Get current applicant session from request cookies
 * @returns Promise<IApplicantSession | null>
 */
export async function getCurrentApplicantSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('applicant-session')?.value;
  
  if (!sessionToken) {
    return null;
  }
  
  const validation = await validateApplicantSession(sessionToken);
  return validation.valid ? validation.session : null;
}

/**
 * Middleware to protect applicant routes
 * @param applicationId - Optional application ID to validate access
 * @returns Promise<{authorized: boolean, session?: IApplicantSession, error?: string}>
 */
export async function requireApplicantAuth(applicationId?: string) {
  const session = await getCurrentApplicantSession();
  
  if (!session) {
    return { authorized: false, error: 'Authentication required' };
  }
  
  if (applicationId && session.applicationId !== applicationId) {
    return { authorized: false, error: 'Unauthorized access' };
  }
  
  return { authorized: true, session };
}

/**
 * Clear applicant session (logout)
 * @param sessionToken - Session token to invalidate
 */
export async function clearApplicantSession(sessionToken: string): Promise<boolean> {
  try {
    await connectToDatabase();
    await ApplicantSession.deleteOne({ token: sessionToken });
    return true;
  } catch (error) {
    console.error('Failed to clear session:', error);
    return false;
  }
} 