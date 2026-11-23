// Founder Growth Dashboard. Visible only to a signed-in founder (User.isFounder);
// everyone else, signed in or not, gets the normal 404 page. The data comes from
// /api/admin/growth, which checks the same rule again.
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { GrowthDashboard } from '@/components/custom/growth/growth-dashboard';
import { getFounderOrNull } from '@/lib/growth/founder';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Growth',
  robots: { index: false, follow: false },
};

export default async function AdminGrowthPage() {
  if (!(await getFounderOrNull())) notFound();
  return <GrowthDashboard />;
}
