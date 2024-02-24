import { Suspense } from 'react';

import {
  CardsSkeleton,
  LatestInvoicesSkeleton,
  RevenueChartSkeleton,
} from '@/app/ui/skeletons';
import CardWrapper from '@/app/ui/dashboard/cards';
import MyLeagues from '@/app/ui/dashboard/list-leagues';

export default async function Page() {
  return (
    <main>
      <h1 className={`mb-4 ml-10 text-2xl font-extrabold md:text-5xl`}>
        Dashboard
      </h1>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        <Suspense fallback={<LatestInvoicesSkeleton />}>
          <MyLeagues />
        </Suspense>
      </div>
    </main>
  );
}
