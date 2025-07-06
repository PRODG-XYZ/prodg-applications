import * as React from 'react';

interface PersonnelEmailProps {
  personnelName: string;
  content: React.ReactNode;
  footer?: React.ReactNode;
  unsubscribeUrl?: string;
}

export const PersonnelEmailTemplate: React.FC<PersonnelEmailProps> = ({
  personnelName,
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
              color: #1e293b;
              background-color: #f1f5f9;
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
              border-radius: 12px;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
              padding: 30px;
              margin: 20px 0;
            }
            
            .greeting {
              font-size: 20px;
              font-weight: 600;
              margin-bottom: 16px;
              color: #0f172a;
            }
            
            .content {
              font-size: 16px;
              line-height: 1.6;
              margin-bottom: 20px;
            }
            
            .button {
              display: inline-block;
              background-color: #0ea5e9;
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
              color: #64748b;
              padding: 20px 0;
            }
            
            .unsubscribe {
              color: #94a3b8;
              font-size: 12px;
              text-align: center;
              margin-top: 12px;
            }
            
            .unsubscribe a {
              color: #94a3b8;
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
              Hello {personnelName},
            </div>
            
            <div className="content">
              {content}
            </div>
          </div>
          
          <div className="footer">
            {footer || (
              <>
                <p>PeopleOS - Team Portal</p>
                <p>© {new Date().getFullYear()} PeopleOS. All rights reserved.</p>
              </>
            )}
            
            {unsubscribeUrl && (
              <div className="unsubscribe">
                <a href={unsubscribeUrl}>Unsubscribe</a> from these notifications.
              </div>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}; 