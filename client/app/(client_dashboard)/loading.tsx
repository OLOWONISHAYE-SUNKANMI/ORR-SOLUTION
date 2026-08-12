import { DashboardSkeleton } from "@/components/ui/SkeletonPresets";

// Route-level loading UI for the client dashboard. Next.js shows this via a
// Suspense boundary while a dashboard route is navigating/mounting. Individual
// pages additionally render their own skeletons during client-side data fetches.
export default function Loading() {
  return <DashboardSkeleton />;
}
