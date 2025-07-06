import { renderAsync } from '@react-email/render';
import * as React from 'react';
import { resend, isEmailConfigured, EMAIL_ADDRESSES } from '../email';
import { ApplicantEmailTemplate } from './templates/applicant-base';

// Specific email templates
import { ApplicantWelcomeEmail } from './templates/applicant-welcome';
import { StatusUpdateEmail } from './templates/status-update';
import { MagicLinkEmail } from './templates/magic-link';

export interface ApplicantData {
  id: string;
  name: string;
  email: string;
  status?: string;
}

export class ApplicantEmailService {
  /**
   * Send a welcome email to a new applicant
   */
  static async sendWelcomeEmail(applicant: ApplicantData): Promise<boolean> {
    if (!isEmailConfigured()) return false;

    try {
      const emailHtml = await renderAsync(
        React.createElement(ApplicantWelcomeEmail, { applicantName: applicant.name })
      );

      const data = await resend!.emails.send({
        from: EMAIL_ADDRESSES.APPLICATIONS,
        to: applicant.email,
        subject: '[Application] Welcome to PeopleOS - Application Received',
        html: emailHtml,
        tags: [{ name: 'category', value: 'welcome' }]
      });

      console.log('Welcome email sent:', data);
      return true;
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      return false;
    }
  }

  /**
   * Send a status update email to an applicant
   */
  static async sendStatusUpdateEmail(
    applicant: ApplicantData, 
    newStatus: string,
    message?: string
  ): Promise<boolean> {
    if (!isEmailConfigured()) return false;

    try {
      const emailHtml = await renderAsync(
        React.createElement(StatusUpdateEmail, { 
          applicantName: applicant.name,
          newStatus,
          message
        })
      );

      const data = await resend!.emails.send({
        from: EMAIL_ADDRESSES.NOTIFICATIONS,
        to: applicant.email,
        subject: `[Status Update] Application Status: ${newStatus}`,
        html: emailHtml,
        tags: [{ name: 'category', value: 'status_update' }]
      });

      console.log('Status update email sent:', data);
      return true;
    } catch (error) {
      console.error('Failed to send status update email:', error);
      return false;
    }
  }

  /**
   * Send a magic link for authentication
   */
  static async sendMagicLinkEmail(
    applicant: ApplicantData,
    magicLink: string
  ): Promise<boolean> {
    if (!isEmailConfigured()) return false;

    try {
      const emailHtml = await renderAsync(
        React.createElement(MagicLinkEmail, { 
          applicantName: applicant.name,
          magicLink
        })
      );

      const data = await resend!.emails.send({
        from: EMAIL_ADDRESSES.NO_REPLY,
        to: applicant.email,
        subject: '[Authentication] Your Magic Link to Access PeopleOS',
        html: emailHtml,
        tags: [{ name: 'category', value: 'authentication' }]
      });

      console.log('Magic link email sent:', data);
      return true;
    } catch (error) {
      console.error('Failed to send magic link email:', error);
      return false;
    }
  }

  /**
   * Send a custom email with generic content
   */
  static async sendCustomEmail(
    applicant: ApplicantData,
    subject: string,
    content: React.ReactNode,
    options?: {
      unsubscribeUrl?: string;
      from?: string;
      replyTo?: string;
      category?: string;
    }
  ): Promise<boolean> {
    if (!isEmailConfigured()) return false;
    
    try {
      const emailHtml = await renderAsync(
        React.createElement(ApplicantEmailTemplate, {
          applicantName: applicant.name,
          content,
          unsubscribeUrl: options?.unsubscribeUrl
        })
      );

      // Add prefix if not already present
      const prefixedSubject = subject.startsWith('[') ? subject : `[Application] ${subject}`;

      const data = await resend!.emails.send({
        from: options?.from || EMAIL_ADDRESSES.NOTIFICATIONS,
        to: applicant.email,
        subject: prefixedSubject,
        html: emailHtml,
        replyTo: options?.replyTo,
        tags: [{ name: 'category', value: options?.category || 'custom' }]
      });

      console.log('Custom email sent:', data);
      return true;
    } catch (error) {
      console.error('Failed to send custom email:', error);
      return false;
    }
  }
} 