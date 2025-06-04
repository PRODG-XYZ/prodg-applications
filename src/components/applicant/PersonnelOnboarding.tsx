'use client';

import { useState } from 'react';
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PersonnelOnboardingProps {
  personnel: {
    _id: string;
    name: string;
    email: string;
    role: string;
    department: string;
    status: string;
    employeeId: string;
  };
}

const PersonnelOnboarding = ({ personnel }: PersonnelOnboardingProps) => {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleNavigateToPersonnelDashboard = () => {
    setIsNavigating(true);
    router.push(`/personnel/dashboard?personnelId=${personnel._id}`);
  };

  return (
    <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 backdrop-blur-lg rounded-2xl p-6 border border-green-500/30 mb-8">
      <div className="flex items-start gap-4">
        <div className="bg-green-500/20 rounded-full p-2 mt-1">
          <CheckCircle className="h-8 w-8 text-green-400" />
        </div>
        
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white mb-2">
            Congratulations! You've been accepted.
          </h2>
          
          <p className="text-slate-300 mb-4">
            Your application has been approved and your personnel profile has been created. 
            You're now a part of the team as a <span className="text-green-400 font-medium">{personnel.role}</span> in 
            the <span className="text-green-400 font-medium">{personnel.department}</span> department.
          </p>
          
          <div className="bg-slate-800/40 rounded-lg p-4 mb-4">
            <h3 className="text-white font-medium mb-2">Your Personnel Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div className="flex items-center">
                <span className="text-slate-400 w-24">Employee ID:</span>
                <span className="text-white font-mono">{personnel.employeeId}</span>
              </div>
              <div className="flex items-center">
                <span className="text-slate-400 w-24">Email:</span>
                <span className="text-white">{personnel.email}</span>
              </div>
              <div className="flex items-center">
                <span className="text-slate-400 w-24">Role:</span>
                <span className="text-white">{personnel.role}</span>
              </div>
              <div className="flex items-center">
                <span className="text-slate-400 w-24">Status:</span>
                <span className="text-white capitalize">{personnel.status}</span>
              </div>
            </div>
          </div>
          
          <p className="text-slate-300 mb-4">
            You can now access your personnel dashboard to complete your onboarding process,
            set up your profile, and start collaborating with your team.
          </p>
          
          <button
            onClick={handleNavigateToPersonnelDashboard}
            disabled={isNavigating}
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-3 px-6 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            {isNavigating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Navigating to your dashboard...</span>
              </>
            ) : (
              <>
                <span>Go to Personnel Dashboard</span>
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PersonnelOnboarding; 