<<<<<<< Updated upstream
import { fetchLeagueById, fetchPlayersByLeague } from '@/app/lib/data';
import CreateMatchesForm from '@/app/ui/matches/create-form';
import { auth } from '@/auth';
=======
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { fetchLeagueById, fetchPlayersByLeague } from '@/app/lib/data';
import CreateMatchesForm from '@/app/ui/matches/create-form';
>>>>>>> Stashed changes
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export default async function Page({ params }: { params: { id: string } }) {
  const session = await auth();
  const league = await fetchLeagueById(params.id);
  if (!session || session.user?.id !== league.adminId) {
    revalidatePath(`/dashboard/leagues/${params.id}`);
    redirect(`/dashboard/leagues/${params.id}`);
  }
  const users = await fetchPlayersByLeague(params.id);

  return (
    <main>
      {/* TODO: Create breadcrumbs component 
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Invoices', href: '/dashboard/leagues' },
          {
            label: 'Create Invoice',
            href: '/dashboard/invoices/create',
            active: true,
          },
        ]}
      />*/}
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        <div className=" md:col-span-4 lg:col-span-6">
          <CreateMatchesForm users={users} leagueId={params.id} />
        </div>
      </div>
    </main>
  );
}
