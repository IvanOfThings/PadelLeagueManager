import { Suspense } from 'react';

import { LatestInvoicesSkeleton } from '@/app/ui/skeletons';
import MyLeagues from '@/app/ui/dashboard/list-leagues';
import SideNav from '@/app/ui/dashboard/sidenav';

export default async function Page() {
  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      <div className="w-full flex-none md:w-64">
        <SideNav />
      </div>
      <div className="flex-grow p-6 md:overflow-y-auto md:p-12">
        <main>
          <div className="flex h-20 items-end justify-center rounded-md bg-blue-600 p-2 md:h-20">
            <div
              className={`flex flex-row items-center leading-none text-white`}
            >
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
      </div>
    </div>
  );
}
