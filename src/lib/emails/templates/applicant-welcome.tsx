import * as React from 'react';
import { ApplicantEmailTemplate } from './applicant-base';

interface ApplicantWelcomeEmailProps {
  applicantName: string;
}

export const ApplicantWelcomeEmail: React.FC<ApplicantWelcomeEmailProps> = ({
  applicantName
}) => {
  const content = (
    <>
      <p>Thank you for submitting your application to PeopleOS!</p>
      
      <p>We're excited to review your application and learn more about your skills and experience. 
      Our team will carefully assess your submission and get back to you as soon as possible.</p>
      
      <p>Here's what happens next:</p>
      <ol style={{ paddingLeft: '20px' }}>
        <li>Our team will review your application</li>
        <li>If selected, you'll be invited for an initial assessment</li>
        <li>Following successful assessment, you'll be scheduled for interviews</li>
        <li>Final decisions will be communicated after the interview process</li>
      </ol>
      
      <p>You can log in to your applicant dashboard to check your application status at any time.</p>
      
      <a href="https://yourdomain.com/applicant/dashboard" style={{ 
        display: 'inline-block', 
        backgroundColor: '#4f46e5', 
        color: 'white', 
        padding: '12px 24px', 
        borderRadius: '6px', 
        textDecoration: 'none', 
        fontWeight: 500, 
        margin: '16px 0', 
        textAlign: 'center' 
      }}>
        Access Your Dashboard
      </a>
      
      <p>If you have any questions or need further information, please don't hesitate to contact our recruitment team.</p>
      
      <p>Best regards,<br />The PeopleOS Team</p>
    </>
  );
  
  return (
    <ApplicantEmailTemplate
      applicantName={applicantName}
      content={content}
    />
  );
}; 