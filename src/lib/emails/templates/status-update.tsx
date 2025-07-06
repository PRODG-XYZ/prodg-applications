import * as React from 'react';
import { ApplicantEmailTemplate } from './applicant-base';

interface StatusUpdateEmailProps {
  applicantName: string;
  newStatus: string;
  message?: string;
}

export const StatusUpdateEmail: React.FC<StatusUpdateEmailProps> = ({
  applicantName,
  newStatus,
  message
}) => {
  // Define status-specific content
  let statusContent;
  
  switch (newStatus.toLowerCase()) {
    case 'reviewing':
      statusContent = (
        <>
          <p>Your application has moved to the <strong>Reviewing</strong> stage!</p>
          <p>Our team is currently evaluating your application materials and will proceed to the next steps soon.</p>
        </>
      );
      break;
    case 'approved':
      statusContent = (
        <>
          <p>Congratulations! Your application has been <strong>Approved</strong>!</p>
          <p>We're delighted to inform you that your application has been successful. Our team will be in touch shortly with next steps.</p>
        </>
      );
      break;
    case 'rejected':
      statusContent = (
        <>
          <p>Thank you for your interest in joining PeopleOS.</p>
          <p>After careful consideration, we regret to inform you that we won't be moving forward with your application at this time.</p>
          <p>We appreciate the time and effort you invested in your application, and we encourage you to apply for future opportunities that align with your skills.</p>
        </>
      );
      break;
    case 'interview_scheduled':
      statusContent = (
        <>
          <p>Great news! We'd like to invite you to an <strong>Interview</strong>.</p>
          <p>Your application has impressed our team, and we're excited to learn more about you and your experiences.</p>
          <p>Please log in to your applicant dashboard to schedule your interview at a time that works for you.</p>
        </>
      );
      break;
    default:
      statusContent = (
        <>
          <p>Your application status has been updated to <strong>{newStatus}</strong>.</p>
          <p>Please log in to your applicant dashboard to view more details.</p>
        </>
      );
  }
  
  const content = (
    <>
      <p>We're writing to inform you that the status of your application has been updated.</p>
      
      {statusContent}
      
      {message && (
        <div style={{ marginTop: '16px', padding: '16px', borderLeft: '4px solid #4f46e5', backgroundColor: '#f3f4f6' }}>
          <p style={{ margin: 0 }}>{message}</p>
        </div>
      )}
      
      <p style={{ marginTop: '20px' }}>You can check your application status and details at any time through your applicant dashboard.</p>
      
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
      
      <p>If you have any questions, please don't hesitate to reach out to our recruitment team.</p>
      
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