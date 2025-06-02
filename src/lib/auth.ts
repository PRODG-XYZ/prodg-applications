import { cookies } from 'next/headers';

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('dashboard-auth');
  return authCookie?.value === 'authenticated';
}

export async function login(username: string, accessCode: string): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, accessCode }),
    });

    return response.ok;
  } catch (error) {
    console.error('Login error:', error);
    return false;
  }
}

export async function logout(): Promise<void> {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
    });
  } catch (error) {
    console.error('Logout error:', error);
  }
} 