import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Personnel Dashboard - ProDG Applications',
  description: 'Personnel management and dashboard for team members',
};

export default function PersonnelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="personnel-layout">
      {children}
    </div>
  );
} 