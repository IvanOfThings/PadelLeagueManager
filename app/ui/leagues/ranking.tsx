import { LeagueParticipant } from '@/app/lib/definitions';
import TableTitle from '../table-title';
import { ArrowPathIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import ParticipantsTable from './table-players';
import clsx from 'clsx';
import { Button } from '../button';
import { updateScore } from '@/app/lib/actions/participants/actions';

export default async function Ranking({
  participants,
  leagueId,
  isAdmin,
  title,
}: {
  participants: LeagueParticipant[];
  leagueId: string;
  isAdmin: boolean;
  title: string;
}) {
  const updateScoreAction = updateScore.bind(null, leagueId);
  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-100 p-2 md:pt-0">
          <div className="py-2">
            <TableTitle title={`${title}`}></TableTitle>
          </div>
          <ParticipantsTable participants={participants} official={true} />
          {isAdmin ? (
            <div className="py-3 ">
              <Link
                href={`/dashboard/leagues/${leagueId}/matches/create`}
                className="flex items-center gap-5 self-start rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base"
              >
                Generar Confrontación
                <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
              </Link>
            </div>
          ) : null}

          {isAdmin ? (
            <div className="inline-block flex items-center pb-2 pt-6">
              <form action={updateScoreAction}>
                <Button
                  type="submit"
                  className={clsx(
                    'flex h-[48px] grow items-center justify-center gap-2 rounded-md border bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3',
                  )}
                >
                  <ArrowPathIcon className="h-5 w-5 text-gray-500" />
                  <h3 className="ml-2 text-sm text-gray-500 ">
                    Updated just now
                  </h3>
                </Button>
              </form>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
