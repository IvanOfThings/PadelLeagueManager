import { fetchLeagueById, fetchPlayersByLeague } from '@/app/lib/data';
import CreateMatchesForm from '@/app/ui/matches/create-form';
import CreateUser from '@/app/ui/players/create-form';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export default async function Page({ params }: { params: { id: string } }) {
  const session = await auth();
  const league = await fetchLeagueById(params.id);
  if (!session || session.user?.id !== league.adminId) {
    revalidatePath(`/dashboard/leagues/${params.id}`);
    redirect(`/dashboard/leagues/${params.id}`);
  }

  return (
    <main>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        <div className=" md:col-span-4 lg:col-span-6">
          <CreateUser leagueId={params.id} />
        </div>
      </div>
    </main>
  );
}
