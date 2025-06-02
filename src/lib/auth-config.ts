export const authConfig = {
  username: process.env.DASHBOARD_USERNAME || 'admin',
  accessCode: process.env.DASHBOARD_ACCESS_CODE || 'default-access-code',
};

export function validateCredentials(username: string, accessCode: string): boolean {
  return username === authConfig.username && accessCode === authConfig.accessCode;
} 