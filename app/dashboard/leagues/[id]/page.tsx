import { Suspense } from 'react';

import { LatestInvoicesSkeleton } from '@/app/ui/skeletons';
import { auth } from '@/auth';
import ParticipantsTable from '@/app/ui/leagues/table-participants';
import { fetchLeagueAndParticipants } from '@/app/lib/data';
import MatchesTable from '@/app/ui/leagues/table-matches';
import { fetchMatches } from '@/app/lib/dao/matches';

export default async function Page({ params }: { params: { id: string } }) {
  const session = await auth();
  const { league, sortedParticipants } = await fetchLeagueAndParticipants(
    params.id,
  );
  const matches = await fetchMatches(params.id);
  return (
    <main>
      <h1 className={`mb-4 ml-10 text-2xl font-extrabold md:text-5xl`}>
        {`${league.name}`}{' '}
      </h1>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        <div className=" md:col-span-4 lg:col-span-6">
          <Suspense fallback={<LatestInvoicesSkeleton />}>
            <ParticipantsTable
              participants={sortedParticipants}
              leagueId={params.id}
              isAdmin={league.adminId === session?.user?.id}
            />
          </Suspense>
        </div>
        <div className=" md:col-span-4 lg:col-span-6">
          <Suspense fallback={<LatestInvoicesSkeleton />}>
            <MatchesTable
              matches={matches}
              leagueId={params.id}
              isAdmin={league.adminId === session?.user?.id}
            />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
