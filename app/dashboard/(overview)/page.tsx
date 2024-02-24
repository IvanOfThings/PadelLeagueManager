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
      <div className="flex h-20 items-end justify-center rounded-md bg-blue-600 p-2 md:h-20">
        <div className={`flex flex-row items-center leading-none text-white`}>
          <h1 className={`mb-3 text-2xl font-extrabold md:text-5xl`}>
            Dashboard
          </h1>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        <Suspense fallback={<LatestInvoicesSkeleton />}>
          <MyLeagues />
        </Suspense>
      </div>
    </main>
  );
}
