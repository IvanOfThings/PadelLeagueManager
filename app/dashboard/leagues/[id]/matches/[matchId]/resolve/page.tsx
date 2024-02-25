<<<<<<< Updated upstream
import { fetchMatch } from '@/app/lib/dao/matches';
import { fetchLeagueById } from '@/app/lib/data';
import ResolveMatch from '@/app/ui/matches/resolve-match';
import { auth } from '@/auth';
=======
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { fetchMatch } from '@/app/lib/dao/matches';
import { fetchLeagueById } from '@/app/lib/data';
import ResolveMatch from '@/app/ui/matches/resolve-match';
>>>>>>> Stashed changes
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export default async function Page({
  params,
}: {
  params: { id: string; matchId: string };
}) {
  const session = await auth();
  const league = await fetchLeagueById(params.id);
  if (!session || session.user?.id !== league.adminId) {
    revalidatePath(`/dashboard/leagues/${params.id}`);
    redirect(`/dashboard/leagues/${params.id}`);
  }
  const match = await fetchMatch(params.id, params.matchId);
  if (!match) {
    console.log('match not found');
    revalidatePath(`/dashboard/leagues/${params.id}`);
    redirect(`/dashboard/leagues/${params.id}`);
  }
  return (
    <main>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        <div className=" md:col-span-4 lg:col-span-6">
          <ResolveMatch match={match} leagueId={params.id} />
        </div>
      </div>
    </main>
  );
}
