import { use } from 'react';
import { getUser } from '@/lib/db/queries';

// Import the dashboard layout to reuse the header
import DashboardLayout from '@/app/(dashboard)/layout';

export default function StudioLayout({
  children
}: {
  children: React.ReactNode;
}) {
  // The studio is now protected by middleware, so we know the user is authenticated
  // We can reuse the dashboard layout which includes the authenticated header
  return <DashboardLayout>{children}</DashboardLayout>;
}