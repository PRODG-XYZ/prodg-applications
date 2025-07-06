import * as React from 'react';
import { ApplicantEmailTemplate } from './applicant-base';

interface MagicLinkEmailProps {
  applicantName: string;
  magicLink: string;
}

export const MagicLinkEmail: React.FC<MagicLinkEmailProps> = ({
  applicantName,
  magicLink
}) => {
  const content = (
    <>
      <p>You requested a secure login link to access your PeopleOS account.</p>
      
      <p>Click the button below to securely sign in to your account. This link will expire in 15 minutes and can only be used once.</p>
      
      <a href={magicLink} style={{ 
        display: 'inline-block', 
        backgroundColor: '#4f46e5', 
        color: 'white', 
        padding: '12px 24px', 
        borderRadius: '6px', 
        textDecoration: 'none', 
        fontWeight: 500, 
        margin: '24px 0', 
        textAlign: 'center' 
      }}>
        Sign In to Your Account
      </a>
      
      <p style={{ fontSize: '14px', color: '#6b7280' }}>
        If you didn't request this link, you can safely ignore this email.
      </p>
      
      <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '32px' }}>
        If the button above doesn't work, copy and paste the following URL into your browser:
      </p>
      
      <p style={{ 
        fontSize: '14px', 
        wordBreak: 'break-all', 
        padding: '12px', 
        backgroundColor: '#f3f4f6', 
        borderRadius: '4px' 
      }}>
        {magicLink}
      </p>
      
      <p style={{ marginTop: '24px' }}>Best regards,<br />The PeopleOS Team</p>
    </>
  );
  
  return (
    <ApplicantEmailTemplate
      applicantName={applicantName}
      content={content}
    />
  );
}; 