// Reuse the dashboard layout so the gallery gets the authenticated header,
// matching how the studio route is wrapped.
import DashboardLayout from '@/app/(dashboard)/layout';

export default function PreviewsLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
