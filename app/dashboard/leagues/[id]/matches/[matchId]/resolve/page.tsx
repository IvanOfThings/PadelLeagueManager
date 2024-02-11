import { fetchMatch } from '@/app/lib/dao/matches';
import ResolveMatch from '@/app/ui/matches/resolve-match';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export default async function Page({
  params,
}: {
  params: { id: string; matchId: string };
}) {
  const match = await fetchMatch(params.id, params.matchId);
  if (!match) {
    console.log('match not found');
    revalidatePath(`/dashboard/leagues/${params.id}`);
    redirect(`/dashboard/leagues/${params.id}`);
  }
  return (
    <main>
      <ResolveMatch match={match} leagueId={params.id} />
    </main>
  );
}
