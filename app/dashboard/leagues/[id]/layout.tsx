import { fetchMatches } from '@/app/lib/dao/matches';
import { fetchLeagueAndParticipants } from '@/app/lib/data';
import SideNav from '@/app/ui/leagues/sidenav';
import { auth } from '@/auth';

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const session = await auth();
  const { league, sortedParticipants } = await fetchLeagueAndParticipants(
    params.id,
  );
  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      <div className="w-full flex-none md:w-64">
        <SideNav leagueId={`${params.id}`} />
      </div>
      <div className="flex-grow p-6 md:overflow-y-auto md:p-12">
        <div className="flex h-20 items-end justify-center rounded-md bg-blue-600 p-2 md:h-20">
          <div className={`flex flex-row items-center leading-none text-white`}>
            <h1 className={`mb-3 text-2xl font-extrabold md:text-5xl`}>
              {`${league.name}`}{' '}
            </h1>
          </div>
        </div>
        <div className="flex-grow p-6 md:overflow-y-auto md:p-12">
          {children}
        </div>
      </div>
    </div>
  );
}
