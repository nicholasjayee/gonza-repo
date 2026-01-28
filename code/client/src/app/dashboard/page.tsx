import { getSales, getProducts } from '@/dashboard/api/actions';
import AnalyticsDashboard from '@/dashboard/ui/components/AnalyticsDashboard';
import { Suspense } from 'react';
import { Skeleton } from '@/shared/components/ui/skeleton';

export default async function DashboardPage() {
  // Fetch data on the server
  // In a real app, we would get the branchId from the session
  const branchId = undefined; 
  
  const [sales, products] = await Promise.all([
    getSales(undefined, undefined, branchId),
    getProducts(branchId)
  ]);

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="flex flex-col gap-4 mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your business performance
        </p>
      </div>
      
      <Suspense fallback={<DashboardSkeleton />}>
        <AnalyticsDashboard 
          sales={sales} 
          products={products}
          currency="UGX" // Default currency
          branchId={branchId}
        />
      </Suspense>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 w-full">
      <div className="flex gap-4 mb-4">
        <Skeleton className="h-10 w-[240px]" />
      </div>
      
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
      
      <Skeleton className="h-[400px] w-full rounded-xl" />
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-3">
          <Skeleton className="h-[350px] w-full rounded-xl" />
        </div>
      </div>
      
      <Skeleton className="h-[400px] w-full rounded-xl" />
    </div>
  );
}
