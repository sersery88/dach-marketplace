import { lazy, Suspense } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Skeleton } from '@/components/ui';

const ClientDashboard = lazy(() => import('@/pages/ClientDashboard').then(m => ({ default: m.ClientDashboard })));
const ExpertDashboard = lazy(() => import('@/pages/ExpertDashboard').then(m => ({ default: m.ExpertDashboard })));

/**
 * Routes to the appropriate dashboard based on user role
 */
export function DashboardRouter() {
  const { user } = useAuthStore();
  
  const isExpert = user?.role === 'expert';

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      {isExpert ? <ExpertDashboard /> : <ClientDashboard />}
    </Suspense>
  );
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header skeleton */}
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        
        {/* Stats grid skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 border border-neutral-200">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Content skeleton */}
        <div className="grid lg:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 border border-neutral-200 space-y-4">
              <Skeleton className="h-6 w-40" />
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

