import * as React from 'react';

interface ApplicantEmailProps {
  applicantName: string;
  content: React.ReactNode;
  footer?: React.ReactNode;
  unsubscribeUrl?: string;
}

export const ApplicantEmailTemplate: React.FC<ApplicantEmailProps> = ({
  applicantName,
  content,
  footer,
  unsubscribeUrl
}) => {
  return (
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <title>PeopleOS</title>
        <style>
          {`
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            
            body {
              font-family: 'Inter', system-ui, sans-serif;
              color: #374151;
              background-color: #f3f4f6;
              margin: 0;
              padding: 0;
              -webkit-text-size-adjust: none;
            }
            
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            
            .header {
              text-align: center;
              padding: 20px 0;
            }
            
            .logo {
              max-width: 120px;
              margin-bottom: 20px;
            }
            
            .card {
              background-color: #ffffff;
              border-radius: 8px;
              box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
              padding: 30px;
              margin: 20px 0;
            }
            
            .greeting {
              font-size: 20px;
              font-weight: 600;
              margin-bottom: 16px;
            }
            
            .content {
              font-size: 16px;
              line-height: 1.6;
              margin-bottom: 20px;
            }
            
            .button {
              display: inline-block;
              background-color: #4f46e5;
              color: white;
              text-decoration: none;
              padding: 12px 24px;
              border-radius: 6px;
              font-weight: 500;
              margin: 16px 0;
              text-align: center;
            }
            
            .footer {
              text-align: center;
              font-size: 14px;
              color: #6b7280;
              padding: 20px 0;
            }
            
            .unsubscribe {
              color: #9ca3af;
              font-size: 12px;
              text-align: center;
              margin-top: 12px;
            }
            
            .unsubscribe a {
              color: #9ca3af;
              text-decoration: underline;
            }
          `}
        </style>
      </head>
      <body>
        <div className="container">
          <div className="header">
            <img src="https://yourdomain.com/logo.png" alt="PeopleOS Logo" className="logo" />
          </div>
          
          <div className="card">
            <div className="greeting">
              Hello {applicantName},
            </div>
            
            <div className="content">
              {content}
            </div>
          </div>
          
          <div className="footer">
            {footer || (
              <>
                <p>PeopleOS - Your Recruitment Platform</p>
                <p>© {new Date().getFullYear()} PeopleOS. All rights reserved.</p>
              </>
            )}
            
            {unsubscribeUrl && (
              <div className="unsubscribe">
                <a href={unsubscribeUrl}>Unsubscribe</a> from these emails.
              </div>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}; 