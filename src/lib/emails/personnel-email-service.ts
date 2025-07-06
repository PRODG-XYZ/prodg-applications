import { renderAsync } from '@react-email/render';
import * as React from 'react';
import { resend, isEmailConfigured, EMAIL_ADDRESSES } from '../email';
import { PersonnelEmailTemplate } from './templates/personnel-base';

// Specific email templates for personnel will be imported here
// Import when implemented, for example: 
// import { OnboardingWelcomeEmail } from './templates/onboarding-welcome';
// import { ProjectAssignmentEmail } from './templates/project-assignment';

export interface PersonnelData {
  id: string;
  name: string;
  email: string;
  role?: string;
  department?: string;
}

export class PersonnelEmailService {
  /**
   * Send an onboarding welcome email to a new team member
   */
  static async sendOnboardingWelcomeEmail(personnel: PersonnelData): Promise<boolean> {
    if (!isEmailConfigured()) return false;

    try {
      // For now, use the base template since specific template isn't created yet
      const content = (
        <div>
          <p>Welcome to the team! We&apos;re excited to have you join us at PeopleOS.</p>
          <p>Your onboarding process has been set up, and you can now access your personnel dashboard.</p>
          <p>Please log in to complete your onboarding tasks and get started with your new role.</p>
          <a href="https://yourdomain.com/personnel/dashboard" style={{ 
            display: 'inline-block', 
            backgroundColor: '#0ea5e9', 
            color: 'white', 
            padding: '12px 24px', 
            borderRadius: '6px', 
            textDecoration: 'none', 
            fontWeight: 500, 
            margin: '16px 0', 
            textAlign: 'center' 
          }}>
            Access Dashboard
          </a>
        </div>
      );

      const emailHtml = await renderAsync(
        React.createElement(PersonnelEmailTemplate, {
          personnelName: personnel.name,
          content
        })
      );

      const data = await resend!.emails.send({
        from: EMAIL_ADDRESSES.ONBOARDING,
        to: personnel.email,
        subject: '[Onboarding] Welcome to PeopleOS - Your Onboarding Process',
        html: emailHtml,
        tags: [{ name: 'category', value: 'onboarding' }]
      });

      console.log('Onboarding welcome email sent:', data);
      return true;
    } catch (error) {
      console.error('Failed to send onboarding welcome email:', error);
      return false;
    }
  }

  /**
   * Send a project assignment notification
   */
  static async sendProjectAssignmentEmail(
    personnel: PersonnelData,
    projectName: string,
    projectDetails: {
      id: string;
      description: string;
      startDate: Date;
      role?: string;
    }
  ): Promise<boolean> {
    if (!isEmailConfigured()) return false;

    try {
      // For now, use the base template
      const startDateStr = projectDetails.startDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const content = (
        <div>
          <p>You have been assigned to a new project: <strong>{projectName}</strong></p>
          <p><strong>Description:</strong> {projectDetails.description}</p>
          <p><strong>Starting:</strong> {startDateStr}</p>
          {projectDetails.role && <p><strong>Your role:</strong> {projectDetails.role}</p>}
          <p>Please log in to your personnel dashboard to view the complete project details and tasks.</p>
          <a href={`https://yourdomain.com/personnel/projects/${projectDetails.id}`} style={{ 
            display: 'inline-block', 
            backgroundColor: '#0ea5e9', 
            color: 'white', 
            padding: '12px 24px', 
            borderRadius: '6px', 
            textDecoration: 'none', 
            fontWeight: 500, 
            margin: '16px 0', 
            textAlign: 'center' 
          }}>
            View Project Details
          </a>
        </div>
      );

      const emailHtml = await renderAsync(
        React.createElement(PersonnelEmailTemplate, {
          personnelName: personnel.name,
          content
        })
      );

      const data = await resend!.emails.send({
        from: EMAIL_ADDRESSES.NOTIFICATIONS,
        to: personnel.email,
        subject: `[Project] New Project Assignment: ${projectName}`,
        html: emailHtml,
        tags: [{ name: 'category', value: 'project_assignment' }]
      });

      console.log('Project assignment email sent:', data);
      return true;
    } catch (error) {
      console.error('Failed to send project assignment email:', error);
      return false;
    }
  }

  /**
   * Send a custom email with generic content
   */
  static async sendCustomEmail(
    personnel: PersonnelData,
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
        React.createElement(PersonnelEmailTemplate, {
          personnelName: personnel.name,
          content,
          unsubscribeUrl: options?.unsubscribeUrl
        })
      );

      // Add prefix if not already present
      const prefixedSubject = subject.startsWith('[') ? subject : `[Personnel] ${subject}`;

      const data = await resend!.emails.send({
        from: options?.from || EMAIL_ADDRESSES.NOTIFICATIONS,
        to: personnel.email,
        subject: prefixedSubject,
        html: emailHtml,
        replyTo: options?.replyTo,
        tags: [{ name: 'category', value: options?.category || 'custom' }]
      });

      console.log('Custom email sent to personnel:', data);
      return true;
    } catch (error) {
      console.error('Failed to send custom email to personnel:', error);
      return false;
    }
  }
} 