import { ArrowPathIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { fetchLeaguesByUser } from '@/app/lib/data';
import Link from 'next/link';
export default async function MyLeagues() {
  const myLeagues = await fetchLeaguesByUser();
  return (
    <div className="flex w-full flex-col md:col-span-4">
      <h2 className={` mb-4 text-xl md:text-2xl`}>Mis Ligas</h2>
      <div className="flex grow flex-col justify-between rounded-xl bg-gray-50 p-4">
        {/* NOTE: comment in this code when you get to this point in the course */}

        <div className="bg-white px-6">
          <div className="flex flex-row items-center justify-between border-b py-4">
            <div className="flex items-center">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold md:text-base">Liga</p>
              </div>
            </div>
            <p className="truncate text-sm font-bold md:text-base">
              Participantes
            </p>
          </div>
        </div>
        <div className="bg-white px-6">
          {myLeagues.map((league, i) => {
            return (
              <div
                key={league.id}
                className={clsx(
                  'flex flex-row items-center justify-between py-4',
                  {
                    'border-t': i !== 0,
                  },
                )}
              >
                <div className="flex items-center">
                  {/*
                  // TODO: Add images to leagues and default icons
                  <Image
                    src={invoice.image_url}
                    alt={`${invoice.name}'s profile picture`}
                    className="mr-4 rounded-full"
                    width={32}
                    height={32}
                  />
                */}
                  <div className="min-w-0">
                    <Link
                      href={`/dashboard/leagues/${league.id}`}
                      className="truncate text-sm font-medium hover:text-blue-400 md:text-base"
                    >
                      {league.name}
                    </Link>
                    {/*
                    <p className="hidden text-sm text-gray-500 sm:block">
                      {invoice.email}
                    </p>
              */}
                  </div>
                </div>
                <p className={`truncate text-sm font-medium md:text-base`}>
                  {league.participants}
                </p>
              </div>
            );
          })}
        </div>
        <div className="flex items-center pb-2 pt-6">
          <ArrowPathIcon className="h-5 w-5 text-gray-500" />
          <h3 className="ml-2 text-sm text-gray-500 ">Updated just now</h3>
        </div>
      </div>
    </div>
  );
}
