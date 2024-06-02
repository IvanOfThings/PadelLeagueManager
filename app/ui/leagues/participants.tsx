import { LeagueParticipant } from '@/app/lib/definitions';
import TableTitle from '../table-title';
import ParticipantsTable from './table-players';
import { fetchUsersNotInLeague } from '@/app/lib/data';
import React from 'react';
import { AddParticipantsForm } from './participants-list';
import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

export default async function Participants({
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
  const noParticipants = await fetchUsersNotInLeague(leagueId);
  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-100 p-2 md:pt-0">
          <div className="py-2">
            <TableTitle title={`${title}`}></TableTitle>
          </div>
          <ParticipantsTable participants={participants} official={false} />
          {isAdmin ? (
            <div className="py-3 ">
              <AddParticipantsForm
                leagueId={`${leagueId}`}
                noParticipants={noParticipants}
              />
            </div>
          ) : null}
        </div>

        {isAdmin ? (
          <div className="py-3 ">
            <Link
              href={`/dashboard/leagues/${leagueId}/players/create`}
              className="flex items-center gap-5 self-start rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base"
            >
              Create new user
              <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
