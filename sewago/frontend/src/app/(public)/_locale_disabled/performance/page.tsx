import PerformanceDashboard from '@/components/PerformanceDashboard';


// Force dynamic rendering to prevent build-time issues
export const dynamic = "force-dynamic";

export default function PerformancePage() {
  return <PerformanceDashboard />;
}
