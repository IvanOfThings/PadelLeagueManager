import { fetchPlayersByLeague } from '@/app/lib/data';
import CreateMatchesForm from '@/app/ui/matches/create-form';

export default async function Page({ params }: { params: { id: string } }) {
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
      <CreateMatchesForm users={users} leagueId={params.id} />
    </main>
  );
}
