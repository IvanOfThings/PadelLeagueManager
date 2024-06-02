import { Suspense } from 'react';

import { LatestInvoicesSkeleton } from '@/app/ui/skeletons';
import { fetchLeagueAndParticipants } from '@/app/lib/data';
import { auth } from '@/auth';
import Participants from '@/app/ui/leagues/participants';

export default async function Page({ params }: { params: { id: string } }) {
  const session = await auth();
  const { league, sortedParticipants } = await fetchLeagueAndParticipants(
    params.id,
  );
  return (
    <main>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        <div className=" md:col-span-4 lg:col-span-6">
          <Suspense fallback={<LatestInvoicesSkeleton />}>
            <Participants
              participants={sortedParticipants}
              leagueId={params.id}
              isAdmin={league.adminId === session?.user?.id}
              title="Participantes"
            />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
