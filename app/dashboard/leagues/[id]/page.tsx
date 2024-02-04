import { lusitana } from '@/app/ui/fonts';
import { Suspense } from 'react';

import {
  CardsSkeleton,
  LatestInvoicesSkeleton,
  RevenueChartSkeleton,
} from '@/app/ui/skeletons';
import { auth } from '@/auth';
import ParticipantsTable from '@/app/ui/leagues/table-participants';
import { fetchLeagueAndParticipants, fetchMatches } from '@/app/lib/data';
import MatchesTable from '@/app/ui/leagues/table-matches';

export default async function Page({ params }: { params: { id: string } }) {
  const { league, sortedParticipants } = await fetchLeagueAndParticipants(
    params.id,
  );
  const matches = await fetchMatches(params.id);
  return (
    <main>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        {`Liga -  ${league.name}`}{' '}
      </h1>
      {/*
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Suspense fallback={<CardsSkeleton />}>
          <CardWrapper />
        </Suspense>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        <Suspense fallback={<RevenueChartSkeleton />}>
          <RevenueChart />
        </Suspense>
  */}
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        <Suspense fallback={<LatestInvoicesSkeleton />}>
          <ParticipantsTable participants={sortedParticipants} />
        </Suspense>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        <Suspense fallback={<LatestInvoicesSkeleton />}>
          <MatchesTable matches={matches} />
        </Suspense>
      </div>
    </main>
  );
}
