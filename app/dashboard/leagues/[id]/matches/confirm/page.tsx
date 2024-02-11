import { fetchUnconfirmedMatches } from '@/app/lib/dao/matches';
import ConfirmMatchesForm from '@/app/ui/matches/confirm-matches';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export default async function Page({ params }: { params: { id: string } }) {
  const matches = await fetchUnconfirmedMatches(params.id);
  if (matches.length === 0) {
    revalidatePath(`/dashboard/leagues/${params.id}`);
    redirect(`/dashboard/leagues/${params.id}`);
  }
  return (
    <main>
      <ConfirmMatchesForm matches={matches} leagueId={params.id} />
    </main>
  );
}
