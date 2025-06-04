'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';

export default function ApplicantPersonnelRedirect({ params }: { params: { id: string } }) {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const personnelId = params.id;

  useEffect(() => {
    const verifyAndRedirect = async () => {
      try {
        // Verify that this applicant has a personnel profile and this is the right ID
        const response = await fetch('/api/applicant/personnel-status');
        
        if (!response.ok) {
          throw new Error('Failed to verify personnel status');
        }

        const { isPersonnel, personnel } = await response.json();
        
        if (!isPersonnel) {
          setError('You do not have a personnel profile yet.');
          return;
        }
        
        if (personnel._id !== personnelId) {
          setError('Invalid personnel ID.');
          return;
        }
        
        // Redirect to the personnel dashboard
        router.push(`/personnel/dashboard?personnelId=${personnelId}`);
      } catch (error) {
        console.error('Error verifying personnel status:', error);
        setError('Failed to verify personnel status.');
      }
    };

    verifyAndRedirect();
  }, [personnelId, router]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-8 max-w-md mx-auto">
          <div className="flex items-center gap-3 text-red-400 mb-4">
            <AlertCircle className="w-6 h-6" />
            <h2 className="text-xl font-semibold">Access Error</h2>
          </div>
          <p className="text-red-300 mb-4">{error}</p>
          <a
            href="/applicant/dashboard"
            className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors inline-block"
          >
            Return to Applicant Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Redirecting to Personnel Dashboard</h2>
        <p className="text-slate-400">Please wait while we redirect you...</p>
      </div>
    </div>
  );
} 